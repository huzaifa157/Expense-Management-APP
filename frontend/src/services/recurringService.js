import { apiRequest } from "./api";

export const getRecurring = async () => {
  return apiRequest("/recurring", { method: "GET" });
};

export const createRecurring = async (recurring) => {
  return apiRequest("/recurring", {
    method: "POST",
    body: JSON.stringify(recurring),
  });
};

export const toggleRecurring = async (id) => {
  return apiRequest(`/recurring/${id}/toggle`, { method: "PATCH" });
};

export const deleteRecurring = async (id) => {
  return apiRequest(`/recurring/${id}`, { method: "DELETE" });
};
