import { useState } from 'react';
import { Menu, X, Users, Gift, CheckCircle, LogOut } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <--- Importando o contexto

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth(); // <--- Pegando o usuário e a função de sair

  // Pega a primeira letra de cada nome (ex: Caio Martins = CM)
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U';

  const navigation = [
    { name: 'Recompensas', href: '/recompensas', icon: Gift },
    { name: 'Estudantes', href: '/estudantes', icon: Users },
    { name: 'Validação', href: '/validacao', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR DESKTOP (Fixa/Sticky na lateral com Perfil sempre visível no rodapé) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 shrink-0 z-30">
        <div className="p-6 shrink-0">
          <h1 className="text-2xl font-bold text-pontus">Pontus<span className="text-gray-800">Go</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.includes(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive ? 'bg-pontus-light/20 text-pontus-dark font-bold shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* PERFIL DINÂMICO DESKTOP (Fixo no rodapé da Sidebar) */}
        <div className="p-4 border-t border-gray-200 mt-auto shrink-0 bg-white">
          <div className="flex items-center gap-3 p-2 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-pontus text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'Admin' ? 'Administrador' : 'Estudante'}
              </p>
            </div>
            <button 
              onClick={logout} 
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="Sair do sistema"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR MOBILE (Fixada no topo) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
          <h1 className="text-xl font-bold text-pontus">Pontus<span className="text-gray-800">Go</span></h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* MENU MOBILE DINÂMICO (DROPDOWN) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-4 shadow-lg sticky top-[65px] z-40">
                 <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-pontus text-white flex items-center justify-center font-bold text-xs">
                   {initials}
                 </div>
                 <span className="font-medium text-gray-800">{user?.name}</span>
              </div>
              <button onClick={logout} className="text-red-500 flex items-center gap-2 font-medium">
                Sair <LogOut size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}