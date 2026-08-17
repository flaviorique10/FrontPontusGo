import { useEffect } from 'react';
import { LogOut, Star, Gift, Ticket } from 'lucide-react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

export default function StudentLayout() {
  const { user, totalPoints, setTotalPoints, logout } = useAuth();

  useEffect(() => {
    if (user?.id && totalPoints === null) {
      userService.getStudentProfile(user.id)
        .then(profile => setTotalPoints(profile.totalPoints))
        .catch(err => console.error("Erro ao carregar saldo de pontos:", err));
    }
  }, [user, totalPoints, setTotalPoints]);

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/aluno" className="text-2xl font-black text-pontus tracking-tight">
              Pontus<span className="text-gray-800">Go</span>
            </Link>

            {/* Abas de Navegação do Estudante Desktop */}
            <nav className="hidden sm:flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
              <NavLink
                to="/aluno"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-pontus shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <Gift size={15} /> Catálogo de Prêmios
              </NavLink>
              <NavLink
                to="/aluno/resgates"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-pontus shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <Ticket size={15} /> Meus Vales & Resgates
              </NavLink>
            </nav>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Saldo de Pontos Global Sincronizado */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-yellow-800 px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm border border-yellow-200 shadow-sm">
              <Star size={16} fill="#eab308" className="text-yellow-500 shrink-0" />
              <span>{totalPoints !== null ? `${totalPoints.toLocaleString('pt-BR')} pts` : '...'}</span>
            </div>
            
            {/* Perfil Dinâmico */}
            <div className="flex items-center gap-2 sm:border-l sm:border-gray-200 sm:pl-4">
              <div className="w-9 h-9 rounded-full bg-pontus text-white flex items-center justify-center font-bold text-xs shadow-sm" title={user?.name}>
                {initials}
              </div>
              <span className="hidden md:inline text-xs font-bold text-gray-700 max-w-[120px] truncate">{user?.name.split(' ')[0]}</span>
            </div>
            
            <button 
              onClick={logout} 
              className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Navegação Mobile */}
        <div className="sm:hidden border-t border-gray-100 px-4 py-2 flex items-center justify-around bg-gray-50/50">
          <NavLink
            to="/aluno"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive ? 'bg-white text-pontus shadow-sm' : 'text-gray-500'
              }`
            }
          >
            <Gift size={15} /> Catálogo
          </NavLink>
          <NavLink
            to="/aluno/resgates"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive ? 'bg-white text-pontus shadow-sm' : 'text-gray-500'
              }`
            }
          >
            <Ticket size={15} /> Meus Vales
          </NavLink>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}