import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostPresignedUrls, createPost } from '../api/snsApi';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import '../styles/PostCreate.css';

const PostCreate = () => {
    const navigate = useNavigate();
    const [caption, setCaption] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // 이미지 압축 함수 (GIF 예외 처리 포함)
    const compressImage = async (file) => {
        try {
            // GIF는 압축하지 않음 (용량이 큰 경우만 압축)
            if (file.type === 'image/gif' && file.size <= 10 * 1024 * 1024) {
                return file;
            }

            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const compressed = await imageCompression(file, options);
            return new File([compressed], file.name, { type: compressed.type });
        } catch (error) {
            console.error('이미지 압축 실패:', error);
            return file;
        }
    };

    // 파일 선택 핸들러
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        // 이미지 파일만 허용
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        // 최대 3개까지만 허용
        if (imageFiles.length > 3) {
            alert('이미지는 최대 3개까지 업로드할 수 있습니다.');
            return;
        }

        // 이미지 압축
        const compressedFiles = await Promise.all(
            imageFiles.map(file => compressImage(file))
        );

        setSelectedFiles(compressedFiles);

        // 미리보기 URL 생성
        const previews = compressedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(previews);
    };

    // 이미지 제거
    const removeImage = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviews);

        // 메모리 해제
        URL.revokeObjectURL(previewUrls[index]);
    };

    // 게시글 작성 핸들러
    const handleSubmit = async () => {
        // 유효성 검사
        if (selectedFiles.length === 0) {
            alert('최소 1개의 이미지를 선택해주세요.');
            return;
        }

        if (selectedFiles.length > 3) {
            alert('이미지는 최대 3개까지 업로드할 수 있습니다.');
            return;
        }

        setIsUploading(true);

        try {
            // 1. Presigned URL 발급
            const presignedData = await getPostPresignedUrls(
                selectedFiles.length,
                selectedFiles[0].type
            );

            // 2. S3에 이미지 업로드
            const uploadPromises = selectedFiles.map(async (file, index) => {
                const { presignedUrl, s3Key } = presignedData[index];

                // S3에 PUT 요청
                await axios.put(presignedUrl, file, {
                    headers: {
                        'Content-Type': file.type,
                    },
                });

                // S3 URL 생성 (presignedUrl에서 쿼리 파라미터 제거)
                const s3Url = presignedUrl.split('?')[0];
                return s3Url;
            });

            const imageUrls = await Promise.all(uploadPromises);

            // 3. 게시글 생성 API 호출
            await createPost({
                caption: caption,
                imageUrls: imageUrls,
            });

            alert('게시글이 작성되었습니다!');
            navigate('/sns'); // SNS 페이지로 이동
        } catch (error) {
            console.error('게시글 작성 실패:', error);
            alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsUploading(false);
        }
    };

    // 취소 핸들러
    const handleCancel = () => {
        // 메모리 해제
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        navigate(-1);
    };

    return (
        <div className="post-create-container">
            {/* 헤더 */}
            <div className="post-create-header">
                <button className="post-create-back-btn" onClick={handleCancel} disabled={isUploading}>
                    ←
                </button>
                <h1 className="post-create-header-title">게시글 등록</h1>
            </div>

            <div className="post-create-form">
                {/* 이미지 업로드 */}
                <div className="post-create-images">
                    <h4>이미지 등록</h4>
                    {previewUrls.length === 0 ? (
                        <label className="post-create-upload-label">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                disabled={isUploading}
                            />
                            <div className="post-create-upload-placeholder">
                                <svg
                                    width="60"
                                    height="60"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p>사진을 선택하세요</p>
                                <span className="post-create-upload-hint">최대 3장까지</span>
                            </div>
                        </label>
                    ) : (
                        <div className="post-create-image-list">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="post-create-image-item">
                                    <img src={url} alt={`preview ${index + 1}`} className="post-create-image-preview" />
                                    <button
                                        className="post-create-remove-btn"
                                        onClick={() => removeImage(index)}
                                        disabled={isUploading}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {previewUrls.length < 3 && (
                                <label className="post-create-add-more">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        disabled={isUploading}
                                    />
                                    <div className="post-create-add-placeholder">
                                        <span>+</span>
                                    </div>
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* 캡션 입력 */}
                <textarea
                    className="post-create-textarea-field"
                    placeholder="문구를 입력하세요..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    disabled={isUploading}
                    maxLength={2000}
                />
                <div className="post-create-counter">{caption.length} / 2000</div>

                {/* 등록 버튼 */}
                <div className="post-create-button-group">
                    <button
                        className="post-create-submit-btn"
                        onClick={handleSubmit}
                        disabled={isUploading || selectedFiles.length === 0}
                    >
                        {isUploading ? '업로드 중...' : '등록'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCreate;
