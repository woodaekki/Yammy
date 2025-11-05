import { useState } from 'react';
import { chatRoomApi } from '../api/chatApi';

/**
 * 채팅방 생성 폼 컴포넌트
 */
export default function RoomCreateForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    roomKey: '',
    name: '',
    homeTeam: '',
    awayTeam: '',
    doubleHeader: false,
    startAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.name.trim()) {
      setError('채팅방 이름을 입력해주세요.');
      return;
    }
    if (!formData.homeTeam.trim() || !formData.awayTeam.trim()) {
      setError('홈팀과 원정팀을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 백엔드에 전송
      const result = await chatRoomApi.createRoom(formData);
      console.log('✅ 채팅방 생성 성공:', result);
      
      if (onSuccess) {
        onSuccess(result);
      }

      // 폼 초기화
      setFormData({
        roomKey: '',
        name: '',
        homeTeam: '',
        awayTeam: '',
        doubleHeader: false,
        startAt: ''
      });
    } catch (err) {
      console.error('❌ 채팅방 생성 실패:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 채팅방 만들기</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 채팅방 키 (선택) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            채팅방 키 (선택사항)
          </label>
          <input
            type="text"
            name="roomKey"
            value={formData.roomKey}
            onChange={handleChange}
            placeholder="비워두면 자동 생성"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">예: kia-vs-lg-20251103</p>
        </div>

        {/* 채팅방 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            채팅방 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="KIA vs LG"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 홈팀 & 원정팀 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              홈팀 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="homeTeam"
              value={formData.homeTeam}
              onChange={handleChange}
              placeholder="KIA"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              원정팀 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="awayTeam"
              value={formData.awayTeam}
              onChange={handleChange}
              placeholder="LG"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 경기 시작 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            경기 시작 시간
          </label>
          <input
            type="datetime-local"
            name="startAt"
            value={formData.startAt}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 더블헤더 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="doubleHeader"
            checked={formData.doubleHeader}
            onChange={handleChange}
            id="doubleHeader"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="doubleHeader" className="ml-2 text-sm text-gray-700">
            더블헤더 경기
          </label>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? '생성 중...' : '생성하기'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
}