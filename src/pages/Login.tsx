import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth, type User } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/Auth/login', { email, password });
      
      const userData: User = response.data.user || response.data.User;

      if (!userData) {
        throw new Error("Dados do usuário não encontrados na resposta da API.");
      }

      // O token JWT HttpOnly foi gravado automaticamente no cookie pelo navegador
      // Salvamos apenas as credenciais visuais no AuthContext
      login(userData);
      
      if (userData.role === 'Admin') {
        navigate('/recompensas');
      } else {
        navigate('/aluno');
      }

    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(err.response?.data?.message || 'E-mail ou senha inválidos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-pontus">Pontus<span className="text-gray-800">Go</span></h1>
          <p className="text-gray-500 mt-2">Faça login para acessar sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@pontusgo.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pontus/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pontus/50"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-pontus hover:bg-pontus-dark text-white font-bold py-3 rounded-lg transition-colors mt-2 disabled:opacity-70"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  );
}