// ============================================
// 1. useUsedItemChatMessages.js (Hook)
// ============================================
import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../chatgames/config/firebase';

/**
 * 중고거래 채팅방 메시지 실시간 구독 Hook
 */
export function useUsedItemChatMessages(roomKey, messageLimit = 200) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // roomKey가 없으면 초기화하고 종료
    if (!roomKey) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    // 상태 초기화
    setLoading(true);
    setError(null);
    setMessages([]); // 이전 메시지 초기화

    // 이전 구독이 있으면 해제
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    try {
      // Firestore 쿼리 생성
      const q = query(
        collection(db, `useditem-chats/${roomKey}/messages`),
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
            createdAt: doc.data().createdAt?.toDate()
          }));

          setMessages(msgs);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore subscription error:', err.message);
          setError(err.message);
          setLoading(false);
          setMessages([]);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error('Query setup error:', err.message);
      setError(err.message);
      setLoading(false);
      setMessages([]);
    }

    // 클린업 함수
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [roomKey, messageLimit]);

  return { messages, loading, error };
}