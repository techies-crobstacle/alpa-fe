// app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileImage?: string;
  isVerified?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUserDirect: (user: User) => void;
  logout: () => void;
  login: (userData: User, token?: string) => void;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("alpa_token");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch user profile using token
  const fetchUser = async () => {
    const currentToken = localStorage.getItem("alpa_token");
    
    if (!currentToken) {
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        "http://127.0.0.1:5000/api/profile",
        {
          headers: { 
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (!res.ok) {
        // If unauthorized, clear everything and redirect to home
        if (res.status === 401) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("alpa_token");
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }
        return;
      }

      const data = await res.json();
      const userData = data.user || data;
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user whenever token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  // Directly set user (for login)
  const setUserDirect = (userData: User, authToken?: string) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
      localStorage.setItem("alpa_token", authToken);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    // Notify CartContext (and any other listeners) that a login just happened.
    // StorageEvent does NOT fire within the same tab, so we use a custom event.
    const newToken = authToken ?? localStorage.getItem("alpa_token");
    if (newToken) {
      window.dispatchEvent(new CustomEvent("alpa-login", { detail: { token: newToken } }));
    }
  };

  // Login function
  const login = (userData: User, authToken?: string) => {
    setUserDirect(userData, authToken);
  };

  // Cross-domain logout — loads a hidden iframe on the other platform so it
  // can clear its own localStorage, then posts "alpa-logout-done" back when done.
  const triggerCrossDomainLogout = (iframeUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") { resolve(); return; }

      const iframe = document.createElement("iframe");
      iframe.src = iframeUrl;
      iframe.style.cssText = "display:none;width:0;height:0;border:none;position:absolute;";
      document.body.appendChild(iframe);

      // Safety timeout — never block logout for more than 2 seconds
      const timer = setTimeout(() => {
        window.removeEventListener("message", handler);
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        resolve();
      }, 2000);

      function handler(e: MessageEvent) {
        if (e.data === "alpa-logout-done") {
          clearTimeout(timer);
          window.removeEventListener("message", handler);
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          resolve();
        }
      }
      window.addEventListener("message", handler);
    });
  };

  // Proper logout
  const logout = async () => {
    const currentToken = token || localStorage.getItem("alpa_token");
    
    try {
      // Call logout API if token exists
      if (currentToken) {
        await fetch("http://127.0.0.1:5000/api/auth/logout", {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          },
        }).catch(error => {
          console.error("Logout API error:", error);
        });
      }
    } finally {
      // Clear Dashboard session via hidden iframe first
      await triggerCrossDomainLogout("https://alpa-dashboard.vercel.app/logout-callback");

      // Clear client-side state
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("alpa_token");

      // Notify CartContext to clear guest state immediately (same-tab)
      window.dispatchEvent(new CustomEvent("alpa-logout"));

      // Redirect to home page
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
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
        login,
        token
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