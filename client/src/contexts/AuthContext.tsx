import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login as loginApi, register as apiRegister } from "@/api/auth";
import { useToast } from "@/hooks/useToast";
import * as jwtDecode from "jwt-decode";
import api from "@/api/api";

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; name?: string }) => Promise<any>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(() => {
    return !!localStorage.getItem("accessToken");
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  // Function to check token expiration and refresh if needed
  const refreshTokens = async () => {
    const accessToken = localStorage.getItem("accessToken");
    console.log('AuthContext refreshTokens called, token available:', !!accessToken);
    if (!accessToken) return;

    try {
      // Decode token to check expiration
      const decoded: any = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;

      console.log('Token expiration details:', {
        exp: decoded.exp,
        currentTime,
        timeRemaining: decoded.exp - currentTime
      });

      // If token expires in less than 2 minutes, refresh it
      if (decoded.exp - currentTime < 120) {
        const refreshToken = localStorage.getItem("refreshToken");
        console.log('Token needs refresh, refresh token available:', !!refreshToken);
        
        if (!refreshToken) {
          logout();
          return;
        }

        const response = await api.post("/api/auth/refresh", { refreshToken });

        console.log('Token refresh completed:', {
          success: response.data.success,
          hasNewAccessToken: !!response.data.data?.accessToken
        });

        if (response.data.success) {
          localStorage.setItem("accessToken", response.data.data.accessToken);
          localStorage.setItem("refreshToken", response.data.data.refreshToken);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
    }
  };

  // Set up token refresh timer
  useEffect(() => {
    if (isAuthenticated) {
      // Check token every minute
      const tokenCheckInterval = setInterval(() => {
        refreshTokens();
      }, 60000);

      // Initial check
      refreshTokens();

      return () => {
        clearInterval(tokenCheckInterval);
      };
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Add debug logs
      console.log('AuthContext.login called with:', { email, password: password ? '[REDACTED]' : 'missing' });

      if (!email || !password) {
        toast({
          title: "Missing credentials",
          description: "Email and password are required",
          variant: "destructive",
        });
        setLoading(false);
        return false;
      }

      try {
        // Make sure we're passing an object with email and password properties
        const response = await loginApi({
          email,
          password
        });

        // Only set user and show success message if the API call succeeds
        if (response && response.success) {
          setUser(response.data.user);
          setAuthenticated(true);

          // Show success toast
          toast({
            title: "Login successful",
            description: "You have been logged in successfully",
          });
          return true;
        } else {
          // Handle case where API returns success: false
          toast({
            title: "Login failed",
            description: response.error || "An error occurred during login",
            variant: "destructive",
          });
          return false;
        }
      } catch (apiError: any) {
        // Handle API call errors
        console.error('API Login error:', apiError);
        toast({
          title: "Login failed",
          description: apiError.message || "An error occurred during login",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      // Handle any other errors
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; name?: string }) => {
    setLoading(true);
    try {
      console.log("AuthContext register called with data:", JSON.stringify(data));

      // Make sure we're passing the complete data object, not just email
      const response = await apiRegister(data);

      setUser(response.data.user);
      setAuthenticated(true);
      toast({
        title: "Registration successful!",
        description: "You're now logged in.",
        status: "success",
      });
      return response;
    } catch (error) {
      console.log("Register error:", error);
      toast({
        title: "Registration failed.",
        description: error.message,
        status: "error",
      });
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      setAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout, refreshTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}