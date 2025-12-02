import React, { createContext, useContext, useEffect, useState } from "react";

import { api, clearToken, getToken, saveToken } from "@/constants/api";

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  signIn: (payload: { Username: string; Password: string }) => Promise<void>;
  signUp: (payload: { Username: string; Email: string; Password: string; DisplayName?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) setToken(stored);
      setLoading(false);
    })();
  }, []);

  const signIn: AuthContextValue["signIn"] = async ({ Username, Password }) => {
    const res = await api.login({ Username, Password });
    await saveToken(res.token);
    setToken(res.token);
  };

  const signUp: AuthContextValue["signUp"] = async (payload) => {
    const res = await api.signup(payload);
    await saveToken(res.token);
    setToken(res.token);
  };

  const signOut = async () => {
    await clearToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
