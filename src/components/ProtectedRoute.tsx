import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Se não estiver logado, chuta para a tela de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota exige um perfil específico e o usuário não tem, redireciona pro lugar certo
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'Admin') {
      return <Navigate to="/recompensas" replace />;
    }
    return <Navigate to="/aluno" replace />;
  }

  // Se estiver tudo certo, renderiza a tela que ele pediu
  return <Outlet />;
}