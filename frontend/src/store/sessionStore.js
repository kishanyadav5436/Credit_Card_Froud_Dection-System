import { create } from "zustand";

import { fetchCurrentUser, logout as clearAuth } from "../api/auth";

const useSessionStore = create((set) => ({
  currentUser: null,
  isAuthenticated: false,
  role: null,
  loading: true,
  setUser: (user) => set({
    currentUser: user,
    isAuthenticated: Boolean(user),
    role: user?.role ?? null,
  }),
  hydrate: async () => {
    set({ loading: true });
    try {
      const user = await fetchCurrentUser();
      set({
        currentUser: user,
        isAuthenticated: Boolean(user),
        role: user?.role ?? null,
        loading: false,
      });
      return user;
    } catch {
      set({
        currentUser: null,
        isAuthenticated: false,
        role: null,
        loading: false,
      });
      return null;
    }
  },
  logout: () => {
    clearAuth();
    set({
      currentUser: null,
      isAuthenticated: false,
      role: null,
      loading: false,
    });
  },
}));

export default useSessionStore;
