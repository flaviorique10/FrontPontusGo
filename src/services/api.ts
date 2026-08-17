import axios from 'axios';

const api = axios.create({
  // Puxando a URL dinamicamente do arquivo .env
  baseURL: import.meta.env.VITE_API_URL, 
});

// Interceptor: Toda vez que o frontend for pedir algo para a API, 
// ele vai olhar se existe um Token salvo e anexar no cabeçalho.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pontusgo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: Se a API retornar 401 (Não autorizado), limpa a sessão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pontusgo_token');
      // Redireciona se não estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;