import axios from 'axios';

const api = axios.create({
  // Puxando a URL dinamicamente do .env ou usando caminho relativo com Proxy no Vite
  baseURL: import.meta.env.VITE_API_URL || '', 
  withCredentials: true, // <-- Permite ao navegador gerenciar e trafegar Cookies HttpOnly automaticamente
});

// Interceptor de Resposta: Se a API retornar 401 (Não autorizado), limpa a sessão do usuário
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pontusgo_user');
      
      // Redireciona se não estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;