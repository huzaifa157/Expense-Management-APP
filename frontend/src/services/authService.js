import { apiRequest } from "./api";

export const loginUser = async (email, password) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (name, email, password) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
};

export const savePushToken = async (pushToken) => {
  return apiRequest("/auth/push-token", {
    method: "PUT",
    body: JSON.stringify({ pushToken }),
  });
};
