import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, getPostPresignedUrls } from '../api/snsApi';
import axios from 'axios';
import '../styles/PostEdit.css';

const PostEdit = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [caption, setCaption] = useState('');
    const [existingImages, setExistingImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // 게시글 불러오기
    useEffect(() => {
        const loadPost = async () => {
            try {
                const post = await getPost(postId);
                setCaption(post.caption || '');
                setExistingImages(post.imageUrls || []);
            } catch (error) {
                console.error('게시글 조회 실패:', error);
                alert('게시글을 불러올 수 없습니다.');
                navigate('/sns');
            } finally {
                setIsLoading(false);
            }
        };

        loadPost();
    }, [postId, navigate]);

    // 새 이미지 선택
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length > 3) {
            alert('이미지는 최대 3개까지 업로드할 수 있습니다.');
            return;
        }

        setSelectedFiles(imageFiles);
        const previews = imageFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(previews);
    };

    // 새 이미지 제거
    const removeNewImage = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviews);
        URL.revokeObjectURL(previewUrls[index]);
    };

    // 수정 완료
    const handleSubmit = async () => {
        setIsUploading(true);

        try {
            let imageUrls = existingImages;

            // 새 이미지가 있으면 업로드
            if (selectedFiles.length > 0) {
                const presignedData = await getPostPresignedUrls(
                    selectedFiles.length,
                    selectedFiles[0].type
                );

                const uploadPromises = selectedFiles.map(async (file, index) => {
                    const { presignedUrl } = presignedData[index];
                    await axios.put(presignedUrl, file, {
                        headers: { 'Content-Type': file.type },
                    });
                    return presignedUrl.split('?')[0];
                });

                imageUrls = await Promise.all(uploadPromises);
            }

            // 게시글 수정 API 호출 (caption + imageUrls)
            await axios.patch(
                `/api/posts/${postId}`,
                { caption, imageUrls },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );

            alert('게시글이 수정되었습니다!');
            navigate('/sns');
        } catch (error) {
            console.error('게시글 수정 실패:', error);
            alert('게시글 수정에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsUploading(false);
        }
    };

    // 취소
    const handleCancel = () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        navigate('/sns');
    };

    if (isLoading) {
        return (
            <div className="post-edit-loading">
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="post-edit-container">
            {/* 헤더 */}
            <div className="post-edit-header">
                <button className="post-edit-back-btn" onClick={handleCancel} disabled={isUploading}>
                    ←
                </button>
                <h1 className="post-edit-header-title">게시글 수정</h1>
            </div>

            <div className="post-edit-form">
                {/* 기존 이미지 */}
                <div className="post-edit-images">
                    <h4>기존 이미지</h4>
                    {existingImages.length > 0 ? (
                        <div className="post-edit-image-list">
                            {existingImages.map((url, index) => (
                                <div key={index} className="post-edit-image-item">
                                    <img
                                        src={url}
                                        alt={`기존 이미지 ${index + 1}`}
                                        className="post-edit-image-preview"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="post-edit-text">기존 이미지가 없습니다.</p>
                    )}
                </div>

                {/* 새 이미지 업로드 */}
                <div className="post-edit-images" style={{ marginTop: '1rem' }}>
                    <h4>새 이미지 등록 (선택)</h4>
                    {previewUrls.length === 0 ? (
                        <label className="post-edit-upload-label">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                disabled={isUploading}
                            />
                            <div className="post-edit-upload-placeholder">
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
                                <p>새 사진 선택 (최대 3장)</p>
                            </div>
                        </label>
                    ) : (
                        <div className="post-edit-image-list">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="post-edit-image-item">
                                    <img src={url} alt={`preview ${index + 1}`} className="post-edit-image-preview" />
                                    <button
                                        className="post-edit-remove-btn"
                                        onClick={() => removeNewImage(index)}
                                        disabled={isUploading}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {previewUrls.length < 3 && (
                                <label className="post-edit-add-more">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        disabled={isUploading}
                                    />
                                    <div className="post-edit-add-placeholder">
                                        <span>+</span>
                                    </div>
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* 캡션 입력 */}
                <textarea
                    className="post-edit-textarea-field"
                    placeholder="문구를 입력하세요..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    disabled={isUploading}
                />
                <div className="post-edit-counter">{caption.length} / 2000</div>

                {/* 버튼 그룹 */}
                <div className="post-edit-button-group">
                    <button
                        className="post-edit-submit-btn"
                        onClick={handleSubmit}
                        disabled={isUploading}
                    >
                        {isUploading ? '수정 중...' : '수정 완료'}
                    </button>
                    <button
                        className="post-edit-cancel-btn"
                        onClick={handleCancel}
                        disabled={isUploading}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostEdit;
