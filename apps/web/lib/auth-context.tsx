"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const DEMO_USERS: Record<string, { password: string; role: string }> = {
  "admin@admin.com": { password: "admin123", role: "admin" },
  "user@user.com": { password: "user123", role: "user" },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    if (stored && email && role) {
      setUser({ email, role, token: stored });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const entry = DEMO_USERS[email];
    if (!entry || entry.password !== password) {
      throw new Error("Invalid credentials");
    }

    const token = email;
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("role", entry.role);
    setUser({ email, role: entry.role, token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
