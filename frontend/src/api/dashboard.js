import apiClient from "./client";

/**
 * Fetch real-time dashboard statistics from the backend.
 * Returns transaction counts, alert counts, investigation counts,
 * fraud rate, recent transactions, and recent alerts.
 */
export async function getDashboardStats() {
  return apiClient.get("/api/v1/dashboard/stats");
}