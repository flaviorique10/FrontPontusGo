import { useState, useEffect } from 'react';
import { Ticket, CheckCircle2, Clock, XCircle, Copy, Check, Gift, ArrowLeft, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { redemptionService } from '../services/redemptionService';
import type { Redemption } from '../types';

export default function MeusResgates() {
  const [resgates, setResgates] = useState<Redemption[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'pending' | 'collected'>('todos');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [valeSelecionado, setValeSelecionado] = useState<Redemption | null>(null);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  useEffect(() => {
    carregarMeusResgates();
  }, []);

  const carregarMeusResgates = async () => {
    try {
      setCarregando(true);
      const dados = await redemptionService.getMyRedemptions();
      setResgates(dados);
    } catch (error) {
      console.error("Erro ao carregar meus resgates:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleCopiarCodigo = (codigo: string, id: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiadoId(id);
    setTimeout(() => {
      setCopiadoId(null);
    }, 2500);
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'pending' || s === '1' || s === 'pendente') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <Clock size={13} className="text-amber-500" /> Pendente de Retirada
        </span>
      );
    }
    if (s === 'collected' || s === '2' || s === 'entregue') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <CheckCircle2 size={13} className="text-emerald-500" /> Prêmio Entregue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
        <XCircle size={13} className="text-rose-500" /> Cancelado
      </span>
    );
  };

  const pendentesCount = resgates.filter(r => r.status?.toLowerCase() === 'pending' || r.status === '1').length;
  const entreguesCount = resgates.filter(r => r.status?.toLowerCase() === 'collected' || r.status === '2').length;
  const pontosInvestidosTotal = resgates.reduce((acc, r) => acc + (r.pointsSpent || 0), 0);

  const resgatesFiltrados = resgates.filter(r => {
    if (filtro === 'pending') return r.status?.toLowerCase() === 'pending' || r.status === '1';
    if (filtro === 'collected') return r.status?.toLowerCase() === 'collected' || r.status === '2';
    return true;
  });

  const totalPaginas = Math.ceil(resgatesFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const resgatesPaginados = resgatesFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-pontus-light/20 via-pontus-light/10 to-transparent p-6 md:p-8 rounded-3xl border border-pontus-light/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link to="/aluno" className="inline-flex items-center gap-1.5 text-xs font-bold text-pontus hover:text-pontus-dark mb-2">
            <ArrowLeft size={14} /> Voltar para o Catálogo de Prêmios
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Meus Vales & Resgates</h1>
          <p className="text-gray-600 text-sm mt-1">
            Consulte os códigos dos seus prêmios resgatados para apresentar na recepção e retirar seu item.
          </p>
        </div>

        <Link 
          to="/aluno" 
          className="bg-pontus hover:bg-pontus-dark text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Gift size={18} /> Resgatar Mais Prêmios
        </Link>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total de Vales</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{resgates.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/30 shadow-sm">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Vales a Retirar</p>
          <p className="text-2xl font-black text-amber-800 mt-1">{pendentesCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Prêmios Entregues</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{entreguesCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pontos Trocados</p>
          <p className="text-2xl font-black text-pontus mt-1">{pontosInvestidosTotal.toLocaleString('pt-BR')} <span className="text-xs text-gray-400 font-semibold">pts</span></p>
        </div>
      </div>

      {/* Lista de Vales */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900">Histórico de Cupons e Vouchers</h2>

          {/* Filtros */}
          <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl text-xs font-bold">
            <button 
              onClick={() => { setFiltro('todos'); setPaginaAtual(1); }} 
              className={`px-3 py-1.5 rounded-lg transition-all ${filtro === 'todos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Todos ({resgates.length})
            </button>
            <button 
              onClick={() => { setFiltro('pending'); setPaginaAtual(1); }} 
              className={`px-3 py-1.5 rounded-lg transition-all ${filtro === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Pendentes ({pendentesCount})
            </button>
            <button 
              onClick={() => { setFiltro('collected'); setPaginaAtual(1); }} 
              className={`px-3 py-1.5 rounded-lg transition-all ${filtro === 'collected' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Entregues ({entreguesCount})
            </button>
          </div>
        </div>

        {carregando ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando seus vales...</div>
        ) : resgatesFiltrados.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <Ticket size={32} />
            </div>
            <p className="text-gray-700 font-bold text-base mb-1">Nenhum vale encontrado</p>
            <p className="text-gray-400 text-xs mb-4">Você ainda não tem resgates nesta categoria.</p>
            <Link 
              to="/aluno" 
              className="inline-flex items-center gap-2 text-xs bg-pontus text-white font-bold px-4 py-2.5 rounded-xl hover:bg-pontus-dark transition-colors"
            >
              <Gift size={16} /> Explorar Catálogo de Prêmios
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resgatesPaginados.map((resgate) => {
                const isPendente = resgate.status?.toLowerCase() === 'pending' || resgate.status === '1';

                return (
                  <div 
                    key={resgate.id} 
                    className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                      isPendente 
                        ? 'bg-gradient-to-br from-amber-50/40 via-white to-white border-amber-200/80 shadow-sm hover:shadow-md' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div>
                          <span className="text-xs font-extrabold text-pontus uppercase tracking-wider block mb-0.5">
                            {resgate.pointsSpent} PONTOS
                          </span>
                          <h3 className="font-bold text-gray-900 text-base">{resgate.productName}</h3>
                        </div>
                        {getStatusBadge(resgate.status)}
                      </div>

                      {/* Caixa de Código do Vale */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 my-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CÓDIGO DE RETIRADA</p>
                          <p className="font-mono font-black text-lg text-gray-900 tracking-wider select-all">{resgate.voucherCode}</p>
                        </div>
                        <button 
                          onClick={() => handleCopiarCodigo(resgate.voucherCode, resgate.id)}
                          className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                            copiadoId === resgate.id 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                          title="Copiar código"
                        >
                          {copiadoId === resgate.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiadoId === resgate.id ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-500 space-y-1">
                        <p>🗓️ Resgatado em: <strong>{new Date(resgate.createdAt).toLocaleDateString('pt-BR')}</strong></p>
                        {resgate.expiresAt && (
                          <p>⏳ Válido até: <strong>{new Date(resgate.expiresAt).toLocaleDateString('pt-BR')}</strong></p>
                        )}
                        {resgate.collectedAt && (
                          <p className="text-emerald-700 font-medium">✅ Retirado em: <strong>{new Date(resgate.collectedAt).toLocaleDateString('pt-BR')}</strong></p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        {isPendente ? 'Apresente este vale na recepção' : 'Resgate finalizado'}
                      </span>
                      <button 
                        onClick={() => setValeSelecionado(resgate)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-pontus hover:text-pontus-dark hover:underline"
                      >
                        <ExternalLink size={13} /> Abrir Vale em Tela Cheia
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <p>
                  Exibindo <strong>{indiceInicial + 1}</strong> a <strong>{Math.min(indiceInicial + itensPorPagina, resgatesFiltrados.length)}</strong> de <strong>{resgatesFiltrados.length}</strong> vales
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

      {/* Modal do Vale em Tela Cheia para Mostrar na Recepção */}
      {valeSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center relative shadow-2xl border border-gray-100">
            <button 
              onClick={() => setValeSelecionado(null)} 
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={24} />
            </button>
            <div className="w-16 h-16 bg-pontus-light/20 text-pontus rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={32} />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-pontus mb-1">VALE SUPERAPONTUS</p>
            <h2 className="text-2xl font-black text-gray-900 mb-1">{valeSelecionado.productName}</h2>
            <p className="text-gray-500 text-xs mb-6">Apresente este código ao atendente para confirmar a entrega</p>

            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-dashed border-gray-200 mb-6">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">CÓDIGO DE RETIRADA</p>
              <p className="text-3xl font-black text-pontus tracking-widest font-mono select-all">
                {valeSelecionado.voucherCode}
              </p>
              <div className="mt-3">
                {getStatusBadge(valeSelecionado.status)}
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => handleCopiarCodigo(valeSelecionado.voucherCode, 'modal')} 
                className="w-full bg-pontus text-white font-bold py-3 rounded-xl hover:bg-pontus-dark transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {copiadoId === 'modal' ? <Check size={16} /> : <Copy size={16} />}
                {copiadoId === 'modal' ? 'Código Copiado!' : 'Copiar Código'}
              </button>
              <button 
                onClick={() => setValeSelecionado(null)} 
                className="w-full bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
