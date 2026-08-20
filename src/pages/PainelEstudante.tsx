import { useState, useEffect } from 'react';
import { Gift, Ticket, X, CheckCircle2, Clock, AlertTriangle, Sparkles, Trophy, ArrowRight, Search, ChevronLeft, ChevronRight, PackageCheck, PackageX } from 'lucide-react';
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
  const [busca, setBusca] = useState('');
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;
  
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
    if (produto.stockQuantity <= 0) {
      alert("Desculpe, este produto está esgotado no estoque.");
      return;
    }

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

  // Filtragem e Paginação dos Produtos
  const produtosFiltrados = produtos.filter(p => 
    p.name.toLowerCase().includes(busca.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(busca.toLowerCase()))
  );

  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900">Catálogo de Prêmios</h2>
            <p className="text-xs text-gray-500">Troque seus pontos conquistados por recompensas oficiais</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Busca Rápida */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar prêmio..." 
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus/50 w-full text-xs bg-gray-50/50"
              />
            </div>

            <Link to="/aluno/resgates" className="text-xs font-bold text-pontus hover:text-pontus-dark flex items-center justify-center gap-1.5 px-3 py-2 bg-pontus-light/10 rounded-xl hover:bg-pontus-light/20 transition-colors shrink-0">
              <Ticket size={14} /> Meus Vales
            </Link>
          </div>
        </div>

        {carregando ? (
          <div className="py-16 text-center text-gray-400 text-sm">Carregando prêmios...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <Gift size={32} />
            </div>
            <p className="text-gray-700 font-bold text-base mb-1">Nenhum prêmio encontrado</p>
            <p className="text-gray-400 text-xs">Tente buscar por outro termo ou aguarde novos cadastros.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {produtosPaginados.map((produto) => {
                const saldoAtual = perfil?.totalPoints ?? 0;
                const temPontosSuficientes = saldoAtual >= produto.pointsCost;
                const emEstoque = produto.stockQuantity > 0;
                const pontosFaltantes = produto.pointsCost - saldoAtual;
                const isResgatando = resgatandoId === produto.id;

                return (
                  <div 
                    key={produto.id} 
                    className={`rounded-2xl border transition-all flex flex-col overflow-hidden ${
                      !emEstoque 
                        ? 'bg-gray-50/70 border-gray-200 opacity-80' 
                        : 'bg-white border-gray-100 shadow-xs hover:shadow-md hover:border-gray-200'
                    }`}
                  >
                    {/* Imagem / Área de Destaque */}
                    <div className="bg-gradient-to-b from-gray-50 to-gray-100/60 p-6 flex justify-center items-center h-44 border-b border-gray-100 relative">
                      <Gift size={44} className={emEstoque ? "text-pontus/40" : "text-gray-300"} />
                      
                      {/* Badge de Estoque */}
                      <div className="absolute top-2.5 right-2.5">
                        {!emEstoque ? (
                          <span className="inline-flex items-center gap-1 bg-gray-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            <PackageX size={12} /> Esgotado
                          </span>
                        ) : produto.stockQuantity <= 5 ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs animate-pulse">
                            Restam {produto.stockQuantity} un.
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-white/95 text-gray-700 border border-gray-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xs">
                            <PackageCheck size={12} className="text-emerald-500" /> {produto.stockQuantity} un.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-snug">{produto.name}</h3>
                        {produto.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{produto.description}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-baseline justify-between mb-3">
                          <span className="text-2xl font-black text-pontus">
                            {produto.pointsCost} <span className="text-xs text-gray-400 font-bold">pts</span>
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {emEstoque ? `Estoque: ${produto.stockQuantity}` : 'Sem estoque'}
                          </span>
                        </div>

                        {/* Botão com estados claros */}
                        {!emEstoque ? (
                          <button 
                            disabled
                            className="w-full bg-gray-200 text-gray-400 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed"
                          >
                            Produto Esgotado
                          </button>
                        ) : !temPontosSuficientes ? (
                          <button 
                            disabled
                            className="w-full bg-gray-100 text-gray-500 font-semibold py-2.5 rounded-xl text-xs cursor-not-allowed border border-gray-200"
                            title={`Você precisa de mais ${pontosFaltantes} pontos`}
                          >
                            Faltam {pontosFaltantes.toLocaleString('pt-BR')} pts
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleResgatar(produto)}
                            disabled={isResgatando}
                            className="w-full bg-pontus hover:bg-pontus-dark disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm hover:shadow text-xs"
                          >
                            {isResgatando ? 'Resgatando...' : 'Resgatar Prêmio'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginação do Catálogo */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
                <p>
                  Exibindo <strong>{indiceInicial + 1}</strong> a <strong>{Math.min(indiceInicial + itensPorPagina, produtosFiltrados.length)}</strong> de <strong>{produtosFiltrados.length}</strong> prêmios
                </p>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                    disabled={paginaAtual === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
                    title="Página anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <button
                      key={pagina}
                      onClick={() => setPaginaAtual(pagina)}
                      className={`w-8 h-8 rounded-lg font-bold transition-all ${
                        paginaAtual === pagina
                          ? 'bg-pontus text-white shadow-sm'
                          : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}

                  <button 
                    onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
                    title="Próxima página"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
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