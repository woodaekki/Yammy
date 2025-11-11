import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,

      // localStorage에서 실시간으로 토큰을 가져옴
      get token() {
        return localStorage.getItem('accessToken');
      },

      // 로그인 처리
      logIn: (userData) => {
        // localStorage에 모든 사용자 정보 저장
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        localStorage.setItem('memberId', userData.memberId);
        localStorage.setItem('loginId', userData.id);
        localStorage.setItem('nickname', userData.nickname);
        localStorage.setItem('authority', userData.authority);

        if (userData.name) localStorage.setItem('name', userData.name);
        if (userData.email) localStorage.setItem('email', userData.email);
        if (userData.team) localStorage.setItem('team', userData.team);
        if (userData.profileImage) localStorage.setItem('profileImage', userData.profileImage);

        set({
          isLoggedIn: true,
          user: {
            memberId: userData.memberId,
            loginId: userData.id,
            nickname: userData.nickname,
            name: userData.name,
            email: userData.email,
            team: userData.team,
            authority: userData.authority,
            profileImage: userData.profileImage,
          },
        });
      },

      // 프로필 정보 실시간 동기화용 (MyPage → NavigationBarTop)
      setUser: (newUserData) => {
        // localStorage 업데이트
        Object.entries(newUserData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            localStorage.setItem(key, value);
          }
        });

        // Zustand 전역 상태 업데이트
        set((state) => ({
          user: { ...state.user, ...newUserData },
        }));
      },

      // 로그아웃 처리
      logOut: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('memberId');
        localStorage.removeItem('loginId');
        localStorage.removeItem('nickname');
        localStorage.removeItem('authority');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('team');
        localStorage.removeItem('profileImage');

        set({
          isLoggedIn: false,
          user: null,
        });
      },

      // 초기화: localStorage에서 토큰 확인하여 로그인 상태 복원
      initialize: () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          set({
            isLoggedIn: true,
            user: {
              memberId: localStorage.getItem('memberId'),
              loginId: localStorage.getItem('loginId'),
              nickname: localStorage.getItem('nickname'),
              name: localStorage.getItem('name'),
              email: localStorage.getItem('email'),
              team: localStorage.getItem('team'),
              authority: localStorage.getItem('authority'),
              profileImage: localStorage.getItem('profileImage'),
            },
          });
        } else {
          set({
            isLoggedIn: false,
            user: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export { useAuthStore };
export default useAuthStore;
