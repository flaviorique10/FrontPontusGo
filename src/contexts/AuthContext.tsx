import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  role: string;
  totalPoints?: number;
}

interface AuthContextData {
  user: User | null;
  totalPoints: number | null;
  setTotalPoints: (points: number | null) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function getSavedUser(): User | null {
  const token = localStorage.getItem('pontusgo_token');
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);

    // Verifica se o token expirou (exp está em segundos)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('pontusgo_token');
      return null;
    }

    // Configura o cabeçalho de autenticação da API imediatamente
    api.defaults.headers.Authorization = `Bearer ${token}`;

    const userName =
      decoded.unique_name ||
      decoded.name ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      decoded.sub ||
      'Usuário';

    const userRole =
      decoded.role ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      'Student';

    return {
      id: decoded.nameid || decoded.sub || '',
      name: userName,
      role: userRole,
    };
  } catch {
    localStorage.removeItem('pontusgo_token');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSavedUser());
  const [totalPoints, setTotalPoints] = useState<number | null>(null);

  const login = (token: string) => {
    localStorage.setItem('pontusgo_token', token);
    const loggedUser = getSavedUser();
    setUser(loggedUser);
    setTotalPoints(null);
  };

  const logout = () => {
    localStorage.removeItem('pontusgo_token');
    delete api.defaults.headers.Authorization;
    setUser(null);
    setTotalPoints(null);
  };

  useEffect(() => {
    const syncStorage = (event: StorageEvent) => {
      // Se o token foi modificado ou removido em outra aba
      if (event.key === 'pontusgo_token') {
        if (event.newValue === null) {
          // Token foi removido em outra aba -> desloga nesta aba também
          delete api.defaults.headers.Authorization;
          setUser(null);
          setTotalPoints(null);
        } else {
          // Token foi adicionado/atualizado em outra aba -> sincroniza login
          const loggedUser = getSavedUser();
          setUser(loggedUser);
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