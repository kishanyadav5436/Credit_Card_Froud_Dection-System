import apiClient from "./client";

const AUTH_TOKEN_KEY = "access_token";
const USER_KEY = "fraudguard-user";

export function saveAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const user = await apiClient.get("/api/v1/auth/me");
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export async function login(email, password) {
  const response = await apiClient.post("/api/v1/auth/login", { email, password });

  if (response.access_token) {
    saveAuthToken(response.access_token);
  }

  const user = response.user || null;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  return user;
}

export async function register({ name, email, password }) {
  return apiClient.post("/api/v1/auth/register", { name, email, password });
}

export async function forgotPassword(email) {
  return apiClient.post("/api/v1/auth/forgot-password", { email });
}

export async function resetPassword(token, newPassword) {
  return apiClient.post("/api/v1/auth/reset-password", { token, new_password: newPassword });
}

export function getCurrentUser() {
  const savedUser = localStorage.getItem(USER_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
