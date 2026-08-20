import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  totalPoints?: number;
}

interface AuthContextData {
  user: User | null;
  totalPoints: number | null;
  setTotalPoints: (points: number | null) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function getSavedUser(): User | null {
  const savedUserJson = localStorage.getItem('pontusgo_user');
  if (!savedUserJson) return null;

  try {
    const parsedUser: User = JSON.parse(savedUserJson);
    if (!parsedUser || !parsedUser.id || !parsedUser.role) {
      localStorage.removeItem('pontusgo_user');
      return null;
    }
    return parsedUser;
  } catch {
    localStorage.removeItem('pontusgo_user');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSavedUser());
  const [totalPoints, setTotalPoints] = useState<number | null>(() => user?.totalPoints ?? null);

  const login = (userData: User) => {
    // Salva apenas os dados visuais do usuário para renderização e rotas protegidas
    localStorage.setItem('pontusgo_user', JSON.stringify(userData));
    // Remove qualquer resquício de token antigo no storage
    localStorage.removeItem('pontusgo_token');
    setUser(userData);
    if (userData.totalPoints !== undefined) {
      setTotalPoints(userData.totalPoints);
    } else {
      setTotalPoints(null);
    }
  };

  const logout = async () => {
    try {
      // Notifica o backend para deletar o cookie HttpOnly
      await api.post('/api/Auth/logout');
    } catch (e) {
      console.warn("Aviso ao realizar logout no servidor:", e);
    } finally {
      localStorage.removeItem('pontusgo_user');
      localStorage.removeItem('pontusgo_token');
      setUser(null);
      setTotalPoints(null);
    }
  };

  useEffect(() => {
    const syncStorage = (event: StorageEvent) => {
      if (event.key === 'pontusgo_user') {
        if (event.newValue === null) {
          setUser(null);
          setTotalPoints(null);
        } else {
          try {
            const loggedUser: User = JSON.parse(event.newValue);
            setUser(loggedUser);
          } catch {
            setUser(null);
          }
        }
      }
    };

    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, totalPoints, setTotalPoints, setUser, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar o uso nos componentes
export function useAuth() {
  return useContext(AuthContext);
}