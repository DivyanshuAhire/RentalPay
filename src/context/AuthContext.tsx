"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  role: "USER" | "OWNER" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount: validate session against the server (cookie-based).
  // Falls back to localStorage only if the API call itself fails (network error).
  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const userData: User = {
            id: data._id || data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            dob: data.dob,
            address: data.address,
            role: data.role,
          };
          setUser(userData);
          localStorage.setItem("p2p_user", JSON.stringify(userData));
        } else {
          // Session invalid / no cookie — clear stale localStorage
          setUser(null);
          localStorage.removeItem("p2p_user");
        }
      } catch {
        // Network error — fall back to localStorage so app still works offline
        const storedUser = localStorage.getItem("p2p_user");
        if (storedUser) {
          try { setUser(JSON.parse(storedUser)); } catch {}
        }
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const userData: User = {
          id: data._id || data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          dob: data.dob,
          address: data.address,
          role: data.role,
        };
        setUser(userData);
        localStorage.setItem("p2p_user", JSON.stringify(userData));
      }
    } catch {}
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("p2p_user", JSON.stringify(userData));
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("p2p_user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
