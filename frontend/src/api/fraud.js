import apiClient from "./client";

export async function checkFraud(transaction) {
  return apiClient.post(
    "/api/v1/fraud/check",
    transaction
  );
}