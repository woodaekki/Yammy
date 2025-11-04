import { useState } from "react";
import { getPresignedUrls, completeUpload } from "../api/photoApi";

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false); // 업로드 중인지 표시
  const [uploadedUrls, setUploadedUrls] = useState([]); // 업로드된 이미지 주소 저장

  function uploadPhotos(files) {
    setUploading(true);

    // 결과 저장
    const uploadedIds = [];
    const uploadedFileUrls = [];

    // Presigned URL 요청
    return getPresignedUrls(files)
      .then((presignedList) => {
        // 순차적으로 업로드 
        let chain = Promise.resolve();

        presignedList.forEach((presigned, i) => {
          chain = chain
            .then(() => {
              const file = files[i];
              return fetch(presigned.presignedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
              });
            })
            .then(() => {
              // 업로드 완료 후 DB 저장 요청
              const file = files[i];
              const info = {
                s3Key: presigned.s3Key,
                fileUrl: presigned.presignedUrl.split("?")[0],
                contentType: file.type,
              };
              return completeUpload(info);
            })
            .then((res) => {
              uploadedIds.push(res.photoId);
              uploadedFileUrls.push(res.fileUrl);
            });
        });

        return chain.then(() => {
          const result = {
            photoIds: uploadedIds,
            fileUrls: uploadedFileUrls,
          };
          setUploadedUrls(uploadedFileUrls);
          return result;
        });
      })
      .catch((error) => {
        console.error("사진 업로드 실패:", error);
        alert("사진 업로드 중 오류가 발생했습니다.");
        throw error;
      })
      .finally(() => {
        setUploading(false);
      });
  }

  return { uploading, uploadedUrls, uploadPhotos };
};
