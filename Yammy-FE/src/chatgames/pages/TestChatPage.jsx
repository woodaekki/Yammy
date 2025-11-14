import { useState } from 'react';
import { useChatMessages } from '../hooks/useChatMessages';
import { chatMessageApi } from '../api/chatApi';

export default function TestChatPage() {
  const TEST_ROOM_KEY = 'test-room-123'; // 하드코딩된 테스트 roomKey
  const [uploading, setUploading] = useState(false);
  
  // 실시간 메시지 구독
  const { messages, loading, error } = useChatMessages(TEST_ROOM_KEY);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await chatMessageApi.uploadImage(TEST_ROOM_KEY, file);
      alert('이미지 업로드 성공!');
    } catch (err) {
      console.error('Image upload error:', err.message);
      alert('이미지 업로드 실패: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (error) return <div className="p-4 text-red-500">에러: {error}</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">채팅 테스트 페이지</h1>
      <p className="text-gray-600 mb-4">Room: {TEST_ROOM_KEY}</p>

      {/* 이미지 업로드 */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">이미지 업로드</h2>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="mb-2"
        />
        {uploading && <p className="text-blue-500">업로드 중...</p>}
      </div>

      {/* 메시지 목록 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">메시지 ({messages.length}개)</h2>
        {messages.map((msg) => (
          <div key={msg.id} className="p-4 border rounded">
            <img 
              src={msg.imageUrl} 
              alt="chat" 
              className="max-w-sm rounded mb-2"
            />
            <p className="text-sm text-gray-600">
              사용자: {msg.uid}
            </p>
            <p className="text-xs text-gray-400">
              {msg.createdAt?.toLocaleString()}
            </p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-gray-400">아직 메시지가 없습니다.</p>
        )}
      </div>
    </div>
  );
}