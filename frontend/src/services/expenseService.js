import { apiRequest } from "./api";

export const getExpenses = async (params = {}) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return apiRequest(`/expenses${query ? `?${query}` : ""}`, { method: "GET" });
};

export const getExpenseById = async (id) => {
  return apiRequest(`/expenses/${id}`, { method: "GET" });
};

export const createExpense = async (expense) => {
  return apiRequest("/expenses", {
    method: "POST",
    body: JSON.stringify(expense),
  });
};

export const updateExpense = async (id, expense) => {
  return apiRequest(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(expense),
  });
};

export const deleteExpense = async (id) => {
  return apiRequest(`/expenses/${id}`, { method: "DELETE" });
};
