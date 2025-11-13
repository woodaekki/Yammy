import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 채팅방 메시지 실시간 구독 Hook
 * @param {string} roomKey - 채팅방 키
 * @param {number} messageLimit - 최대 메시지 수 (기본: 200)
 * @returns {{ messages: Array, loading: boolean, error: string|null }}
 */
export function useChatMessages(roomKey, messageLimit = 200) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // roomKey가 없으면 로딩 종료
    if (!roomKey) {
      setLoading(false);
      return;
    }

    // Firestore 쿼리 생성
    const q = query(
      collection(db, `chatRooms/${roomKey}/messages`),
      orderBy('createdAt', 'asc'),
      limit(messageLimit)
    );

    // 실시간 구독 시작
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Firestore Timestamp를 Date로 변환
          createdAt: doc.data().createdAt?.toDate()
        }));

        setMessages(msgs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useChatMessages] Firestore subscription error:', {
          roomKey,
          error: err.message,
          code: err.code,
          stack: err.stack
        });
        setError(err.message);
        setLoading(false);
      }
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
  }, [roomKey, messageLimit]);

  return { messages, loading, error };
}