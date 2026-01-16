"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUserDirect: (user: User) => void;
  logout: () => void;
  login: (userData: User) => void; // Added login function
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize user from localStorage on mount (optional persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // OPTIONAL: only use if /me actually works
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://alpa-be-1.onrender.com/api/auth/me",
        { credentials: "include" }
      );

      if (!res.ok) {
        setUser(null);
        localStorage.removeItem("user");
        return;
      }

      const data = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch {
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Directly set user (for login)
  const setUserDirect = (user: User) => {
    setUser(user);
    setLoading(false);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // ✅ Login function (alias for setUserDirect)
  const login = (userData: User) => {
    setUserDirect(userData);
  };

  // ✅ Proper logout that clears cookies and localStorage
  const logout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch("https://alpa-be-1.onrender.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear client-side state
      setUser(null);
      localStorage.removeItem("user");
      // Force page reload to clear any cached state
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        fetchUser, 
        setUserDirect, 
        logout,
        login 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};