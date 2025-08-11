import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import * as api from '@/services/api';
import type { LoginRequest, User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // Here you would typically have an endpoint like /api/auth/me
        // to verify the token and get user data.
        // Since we don't have one in the collection, we'll simulate it.
        // If there was a /me endpoint, it would look like:
        // try {
        //   const userData = await api.getMe();
        //   setUser(userData);
        // } catch (error) {
        //   console.error("Failed to fetch user with token", error);
        //   setToken(null);
        //   localStorage.removeItem('jwt_token');
        // }
        // For now, we'll just assume the token is valid if it exists.
        // A real app needs a /me endpoint for security.
        // We'll decode the token to get user info if possible (not ideal).
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // This is a mock user object based on what a JWT payload might contain
            setUser({ id: payload.sub, email: payload.email });
        } catch (e) {
            console.error("Invalid token:", e);
            setToken(null);
            localStorage.removeItem('jwt_token');
        }

      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [token]);

  const login = async (credentials: LoginRequest) => {
    const response = await api.login(credentials);
    localStorage.setItem('jwt_token', response.token);
    setToken(response.token);
    // As mentioned, ideally we fetch user data from a /me endpoint.
    // For now, we'll decode the token.
    try {
        const payload = JSON.parse(atob(response.token.split('.')[1]));
        setUser({ id: payload.sub, email: payload.email });
    } catch (e) {
        console.error("Invalid token:", e);
        // handle error appropriately
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt_token');
  };

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    logout,
  }), [user, token, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
