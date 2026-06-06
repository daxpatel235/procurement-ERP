"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";
import { saveSession, clearSession, getStoredUser } from "@/lib/utils";
import { TOKEN_KEY } from "@/lib/constants";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until first hydration

  // Hydrate from storage on mount, then verify the token with the server.
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
        : null;

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => {
        // Token invalid/expired — drop it.
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials, remember = false) => {
    const res = await authApi.login(credentials);
    saveSession(res.token, res.user, remember);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    saveSession(res.token, res.user, false);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
