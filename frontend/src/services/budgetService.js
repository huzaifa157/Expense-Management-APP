import { apiRequest } from "./api";

export const getBudgets = async () => {
  return apiRequest("/budgets", { method: "GET" });
};

export const saveBudget = async (category, monthlyLimit) => {
  return apiRequest("/budgets", {
    method: "POST",
    body: JSON.stringify({ category, monthlyLimit }),
  });
};

export const deleteBudget = async (id) => {
  return apiRequest(`/budgets/${id}`, { method: "DELETE" });
};
