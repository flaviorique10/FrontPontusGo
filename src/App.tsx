import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import StudentLayout from './layouts/StudentLayout';
import Estudantes from './pages/Estudantes';
import Recompensas from './pages/Recompensas';
import Validacao from './pages/Validacao';
import Login from './pages/Login';
import PainelEstudante from './pages/PainelEstudante';
import MeusResgates from './pages/MeusResgates';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rotas exclusivas para Administradores */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/recompensas" replace />} />
            <Route path="recompensas" element={<Recompensas />} />
            <Route path="estudantes" element={<Estudantes />} />
            <Route path="validacao" element={<Validacao />} />
          </Route>
        </Route>

        {/* Rotas exclusivas para Estudantes */}
        <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
          <Route path="/aluno" element={<StudentLayout />}>
            <Route index element={<PainelEstudante />} />
            <Route path="resgates" element={<MeusResgates />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}