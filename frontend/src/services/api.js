import { getToken } from "../utils/storage";

const HOST = process.env.EXPO_PUBLIC_API_HOST || "http://192.168.0.35:5000";
const BASE_URL = `${HOST}/api`;

export const apiRequest = async (endpoint, options = {}) => {
  const token = await getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
};

export default BASE_URL;
