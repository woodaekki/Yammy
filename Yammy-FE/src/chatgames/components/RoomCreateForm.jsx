import { useState } from 'react';
import { chatRoomApi } from '../api/chatApi';
import "../styles/RoomCreateForm.css";

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

      const result = await chatRoomApi.createRoom(formData);
      console.log('✅ 채팅방 생성 성공:', result);
      
      if (onSuccess) onSuccess(result);

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
    <div className="room-create-form">
      <h2 className="room-create-title">새 채팅방 만들기</h2>

      <form onSubmit={handleSubmit} className="room-create-form-inner">
        {/* 채팅방 키 (선택) */}
        <div className="form-group">
          <label className="form-label">채팅방 키 (선택사항)</label>
          <input
            type="text"
            name="roomKey"
            value={formData.roomKey}
            onChange={handleChange}
            placeholder="비워두면 자동 생성"
            className="form-input"
          />
          <p className="form-hint">예: kia-vs-lg-20251103</p>
        </div>

        {/* 채팅방 이름 */}
        <div className="form-group">
          <label className="form-label required">
            채팅방 이름
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="KIA vs LG"
            required
            className="form-input"
          />
        </div>

        {/* 홈팀 & 원정팀 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">홈팀</label>
            <input
              type="text"
              name="homeTeam"
              value={formData.homeTeam}
              onChange={handleChange}
              placeholder="KIA"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label required">원정팀</label>
            <input
              type="text"
              name="awayTeam"
              value={formData.awayTeam}
              onChange={handleChange}
              placeholder="LG"
              required
              className="form-input"
            />
          </div>
        </div>

        {/* 경기 시작 시간 */}
        <div className="form-group">
          <label className="form-label">경기 시작 시간</label>
          <input
            type="datetime-local"
            name="startAt"
            value={formData.startAt}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* 더블헤더 */}
        <div className="form-checkbox">
          <input
            type="checkbox"
            name="doubleHeader"
            checked={formData.doubleHeader}
            onChange={handleChange}
            id="doubleHeader"
            className="checkbox-input"
          />
          <label htmlFor="doubleHeader" className="checkbox-label">
            더블헤더 경기
          </label>
        </div>

        {/* 에러 메시지 */}
        {error && <div className="form-error">{error}</div>}

        {/* 버튼 */}
        <div className="form-buttons">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '생성 중...' : '생성하기'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-secondary"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
