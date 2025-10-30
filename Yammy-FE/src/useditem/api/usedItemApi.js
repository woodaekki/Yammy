import axios from "axios";
const BASE_URL = "http://localhost:8080/api";

// 토큰 가져오기 
const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 인터셉터: 토큰 자동 추가
axiosWithAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 로그인 페이지 이동
axiosWithAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 전체 조회
export const getAllUsedItems = async () => {
  const res = await axiosWithAuth.get(`/trades`);
  return res.data;
};

// 단건 조회
export const getUsedItemById = async (id) => {
  const res = await axiosWithAuth.get(`/trades/${id}`);
  return res.data;
};

// 작성
export const createUsedItem = async (itemData) => {
  const res = await axiosWithAuth.post(`/trades`, itemData);
  return res.data;
};

// 수정
export const updateUsedItem = async (id, itemData) => {
  const res = await axiosWithAuth.put(`/trades/${id}`, itemData);
  return res.data;
};

// 삭제
export const deleteUsedItem = async (id) => {
  await axiosWithAuth.delete(`/trades/${id}`);
};
