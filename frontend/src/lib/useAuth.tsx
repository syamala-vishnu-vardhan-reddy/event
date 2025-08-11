import React, { useState, useEffect, useCallback, useContext, createContext, ReactNode } from "react";

type User = { id: string; name: string; email: string; role: string } | null;

type AuthContextType = {
  user: User;
  setUser: (u: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    try {
      const adminUser = localStorage.getItem("admin_user");
      const adminToken = localStorage.getItem("admin_token");
      const regularUser = localStorage.getItem("user");
      const regularToken = localStorage.getItem("token");
      if (adminUser && adminToken) {
        return JSON.parse(adminUser);
      }
      if (regularUser && regularToken) {
        return JSON.parse(regularUser);
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        localStorage.setItem("admin_user", JSON.stringify(user));
        const currentToken =
          localStorage.getItem("admin_token") ||
          localStorage.getItem("token") ||
          "";
        localStorage.setItem("admin_token", currentToken);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } else {
        localStorage.setItem("user", JSON.stringify(user));
        const currentToken =
          localStorage.getItem("token") ||
          localStorage.getItem("admin_token") ||
          "";
        localStorage.setItem("token", currentToken);
        localStorage.removeItem("admin_user");
        localStorage.removeItem("admin_token");
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin_token");
    }
  }, [user]);

  const set = useCallback((u: User) => {
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser: set, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
