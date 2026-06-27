import api from "./api";

export const getSalesReport = async (days = 30) => {
  const response = await api.get(`/reports/sales?days=${days}`);
  return response.data;
};
