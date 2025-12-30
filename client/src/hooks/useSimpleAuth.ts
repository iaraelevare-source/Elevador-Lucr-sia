import { useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const TOKEN_KEY = "auth_token";

export function useSimpleAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAuthState({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    try {
      const response = await fetch("/api/simple-auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setAuthState({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem(TOKEN_KEY);
      setAuthState({ user: null, isAuthenticated: false, loading: false });
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await fetch("/api/simple-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          loading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  }

  async function register(email: string, password: string, name?: string) {
    try {
      const response = await fetch("/api/simple-auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          loading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Network error" };
    }
  }

  async function logout() {
    try {
      await fetch("/api/simple-auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setAuthState({ user: null, isAuthenticated: false, loading: false });
    }
  }

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    login,
    register,
    logout,
  };
}
