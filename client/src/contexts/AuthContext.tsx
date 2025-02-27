import { createContext, useContext, useState, ReactNode } from "react";
import { login as loginApi, register as apiRegister } from "@/api/auth";
import { useToast } from "@/hooks/useToast";

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
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(() => {
    return !!localStorage.getItem("accessToken");
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

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

      // Make sure we're passing an object with email and password properties
      const response = await loginApi({
        email,
        password
      });

      setUser(response.data.user);
      setAuthenticated(true);

      // Show success toast
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });

      return true;
    } catch (error: any) {
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
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout }}>
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