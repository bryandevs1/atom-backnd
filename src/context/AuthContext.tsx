// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string | null;
}

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  expiresIn: number | null;
  login: (
    token: string,
    refreshToken: string,
    user: User,
    expiresIn: number
  ) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");
    const storedExpiresIn = localStorage.getItem("expiresIn");

    if (storedToken && storedRefreshToken) {
      if (isTokenExpired(storedToken)) {
        if (!isTokenExpired(storedRefreshToken)) {
          refreshAuthToken(storedRefreshToken).then((newToken) => {
            if (newToken) {
              setToken(newToken);
              localStorage.setItem("token", newToken);
            } else {
              logout();
            }
          });
        } else {
          logout();
        }
      } else {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedExpiresIn) setExpiresIn(Number(storedExpiresIn));
      }
    }

    setLoading(false);
  }, []);

  const login = (
    newToken: string,
    newRefreshToken: string,
    userData: User,
    expiry: number
  ) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
    setExpiresIn(expiry);

    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("expiresIn", expiry.toString());
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setExpiresIn(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("expiresIn");
    navigate("/signin");
  };

  const isAuthenticated = !!token && !isTokenExpired(token);

  const value: AuthContextType = {
    token,
    refreshToken,
    user,
    expiresIn,
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper functions
const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const refreshAuthToken = async (
  refreshToken: string
): Promise<string | null> => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};
