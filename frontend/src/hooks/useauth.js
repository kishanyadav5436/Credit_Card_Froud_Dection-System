import { useState } from "react";
import {
  getCurrentUser,
  login,
  logout,
} from "../api/auth";

function useAuth() {
  const [user, setUser] = useState(getCurrentUser());

  const handleLogin = async (email, password) => {
    const loggedInUser = await login(email, password);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    login: handleLogin,
    logout: handleLogout,
  };
}

export default useAuth;