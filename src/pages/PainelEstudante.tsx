import { useState, useEffect } from 'react';
import { Gift, Ticket, X, CheckCircle2, Clock, AlertTriangle, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { redemptionService } from '../services/redemptionService';
import { userService } from '../services/userService';
import type { Product, RedemptionResult, StudentProfile } from '../types';

export default function PainelEstudante() {
  const { user, setTotalPoints } = useAuth();
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [perfil, setPerfil] = useState<StudentProfile | null>(null);
  const [carregando, setCarregando] = useState(true);
  
  const [modalResgate, setModalResgate] = useState<RedemptionResult | null>(null);
  const [resgatandoId, setResgatandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;
    try {
      setCarregando(true);
      const [produtosData, perfilData] = await Promise.all([
        productService.getAllActive(),
        userService.getStudentProfile(user.id)
      ]);
      setProdutos(produtosData);
      setPerfil(perfilData);
      // Sincroniza o saldo de pontos com o estado global (cabeçalho)
      setTotalPoints(perfilData.totalPoints);
    } catch (error) {
      console.error("Erro ao carregar painel:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleResgatar = async (produto: Product) => {
    if (window.confirm(`Deseja resgatar "${produto.name}" por ${produto.pointsCost} pontos?`)) {
      try {
        setResgatandoId(produto.id);
        const resultado = await redemptionService.redeem(produto.id);
        setModalResgate(resultado);
        // Atualiza o saldo global imediatamente
        setTotalPoints(resultado.remainingPoints);
        await carregarDados(); // Atualiza os pontos e produtos
      } catch (error: any) {
        alert(error.response?.data?.message || "Erro ao resgatar produto. Pontos insuficientes?");
      } finally {
        setResgatandoId(null);
      }
    }
  };

  const getStatusMensalidadeBadge = (status?: string) => {
    const normalizado = status?.toString().toLowerCase();

    if (normalizado === 'uptodate' || normalizado === '1' || normalizado === 'emdia' || normalizado === 'em dia') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={14} className="text-emerald-500" /> Mensalidade em dia
        </span>
      );
    }

    if (normalizado === 'pending' || normalizado === '2' || normalizado === 'pendente') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={14} className="text-amber-500" /> Mensalidade pendente
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle size={14} className="text-rose-500" /> Mensalidade em atraso
      </span>
    );
  };

  const ptsHoje = perfil?.pointsEarnedToday ?? 0;
  const maxPts = perfil?.maxDailyPoints ?? 30;
  const percentualHoje = Math.min(100, Math.round((ptsHoje / maxPts) * 100));
  const valesPendentes = perfil?.pendingRedemptions ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-pontus-light/20 via-pontus-light/10 to-white p-6 md:p-8 rounded-3xl border border-pontus-light/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pontus text-white">
              <Sparkles size={12} /> Aluno Supera
            </span>
            {perfil && getStatusMensalidadeBadge(perfil.tuitionStatus)}
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Olá, {user?.name.split(' ')[0]}! Pronto para resgatar?</h1>
          <p className="text-gray-600 text-sm max-w-xl">
            Ganhe até <strong>30 pontos por dia</strong> com <strong>Assiduidade (10 pts)</strong>, <strong>Participação (10 pts)</strong> e <strong>Fazer Tarefa (10 pts)</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Card Pontos Hoje */}
          <div className="bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 w-full sm:w-auto min-w-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
              <Trophy size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pontos Hoje</p>
              <p className="text-xl font-black text-gray-900">{ptsHoje} <span className="text-xs text-gray-400 font-semibold">/ {maxPts} pts</span></p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${ptsHoje >= maxPts ? 'bg-emerald-500' : 'bg-pontus'}`} 
                  style={{ width: `${percentualHoje}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card Saldo Total */}
          <div className="bg-white px-6 py-4 rounded-2xl border border-pontus-light/40 shadow-sm flex items-center gap-4 w-full sm:w-auto min-w-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-pontus-light/20 text-pontus flex items-center justify-center font-bold">
              <Gift size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Saldo Total</p>
              <p className="text-3xl font-black text-gray-900">{perfil ? perfil.totalPoints.toLocaleString('pt-BR') : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notificação de Vales Pendentes */}
      {valesPendentes > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Ticket size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Você tem {valesPendentes} {valesPendentes === 1 ? 'vale pendente' : 'vales pendentes'} para retirar!</p>
              <p className="text-xs text-gray-600">Acesse a aba "Meus Vales" para consultar os códigos de retirada.</p>
            </div>
          </div>
          <Link 
            to="/aluno/resgates" 
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors shrink-0 shadow-sm"
          >
            Ver Meus Vales <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Regras Rápidas de Bonificação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-sm">
            +10
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Assiduidade</p>
            <p className="text-xs text-gray-500">Presença e pontualidade na aula</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm">
            +10
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Participação</p>
            <p className="text-xs text-gray-500">Engajamento e dedicação em aula</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 font-black flex items-center justify-center text-sm">
            +10
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Fazer Tarefa</p>
            <p className="text-xs text-gray-500">Lições de casa e atividades feitas</p>
          </div>
        </div>
      </div>

      {/* Catálogo de Prêmios */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Catálogo de Prêmios</h2>
          <Link to="/aluno/resgates" className="text-xs font-bold text-pontus hover:underline flex items-center gap-1">
            <Ticket size={14} /> Consultar Vales Já Resgatados
          </Link>
        </div>

        {carregando ? (
          <p className="text-sm text-gray-400">Carregando prêmios...</p>
        ) : produtos.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum prêmio disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <div key={produto.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="bg-gray-50 p-6 flex justify-center items-center h-48 border-b border-gray-100 relative">
                  <Gift size={48} className="text-gray-300" />
                  {produto.stockQuantity <= 5 && (
                    <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md">
                      Restam {produto.stockQuantity}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-lg">{produto.name}</h3>
                  {produto.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{produto.description}</p>}
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-2xl font-black text-pontus">{produto.pointsCost} <span className="text-sm text-gray-500 font-medium">pts</span></span>
                  </div>
                  <button 
                    onClick={() => handleResgatar(produto)}
                    disabled={resgatandoId === produto.id || (perfil?.totalPoints ?? 0) < produto.pointsCost}
                    className="w-full mt-4 bg-pontus hover:bg-pontus-dark disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl transition-colors"
                  >
                    {resgatandoId === produto.id ? 'Aguarde...' : 'Resgatar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Sucesso do Vale */}
      {modalResgate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center relative shadow-2xl border border-gray-100">
            <button onClick={() => setModalResgate(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"><X size={24} /></button>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Resgate Concluído!</h2>
            <p className="text-gray-600 text-sm mb-6">Apresente o código abaixo na recepção para retirar seu prêmio. Fica salvo na aba <strong>Meus Vales</strong>!</p>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">CÓDIGO DO VALE</p>
              <p className="text-3xl font-black text-pontus tracking-widest font-mono">{modalResgate.voucherCode}</p>
            </div>
            <div className="space-y-2">
              <Link 
                to="/aluno/resgates" 
                onClick={() => setModalResgate(null)}
                className="w-full bg-pontus text-white font-bold py-3 rounded-xl hover:bg-pontus-dark transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Ver Meus Vales Salvos
              </Link>
              <button onClick={() => setModalResgate(null)} className="w-full bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                Continuar no Catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}