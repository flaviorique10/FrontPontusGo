import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { redemptionService } from '../services/redemptionService';
import type { Redemption } from '../types';

export default function Validacao() {
  const [resgates, setResgates] = useState<Redemption[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [codigoVoucher, setCodigoVoucher] = useState('');
  const [validando, setValidando] = useState(false);
  
  // Filtros e Busca
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'ALL' | 'Pending' | 'Collected'>('ALL');
  const [mensagemFeedback, setMensagemFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  useEffect(() => {
    carregarResgates();
  }, []);

  const carregarResgates = async () => {
    try {
      setCarregando(true);
      const dados = await redemptionService.getAllForAdmin();
      setResgates(dados);
    } catch (error) {
      console.error("Erro ao carregar resgates:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleValidar = async (e?: React.FormEvent, codigoCustom?: string) => {
    if (e) e.preventDefault();
    const codigoParaValidar = (codigoCustom || codigoVoucher).trim();
    if (!codigoParaValidar) return;

    try {
      setValidando(true);
      setMensagemFeedback(null);
      const resultado = await redemptionService.validateVoucher(codigoParaValidar);
      setMensagemFeedback({ tipo: 'sucesso', texto: `Sucesso! ${resultado.message || 'Voucher validado e produto entregue com sucesso.'}` });
      setCodigoVoucher('');
      await carregarResgates();
    } catch (error: any) {
      const textoErro = error.response?.data?.message || "Voucher inválido ou já utilizado.";
      setMensagemFeedback({ tipo: 'erro', texto: textoErro });
    } finally {
      setValidando(false);
    }
  };

  // Filtragem local por nome do aluno, código e nome da recompensa
  const resgatesFiltrados = resgates.filter(resgate => {
    const termo = busca.toLowerCase();
    const matchBusca = 
      resgate.studentName.toLowerCase().includes(termo) || 
      resgate.voucherCode.toLowerCase().includes(termo) ||
      resgate.productName.toLowerCase().includes(termo);
    
    const isPendente = resgate.status?.toLowerCase() === 'pending' || resgate.status === '1';
    const isEntregue = resgate.status?.toLowerCase() === 'collected' || resgate.status === '2';

    let matchStatus = true;
    if (filtroStatus === 'Pending') matchStatus = isPendente;
    if (filtroStatus === 'Collected') matchStatus = isEntregue;

    return matchBusca && matchStatus;
  });

  // Cálculo da Paginação
  const totalPaginas = Math.ceil(resgatesFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const resgatesPaginados = resgatesFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  const pendentesTotal = resgates.filter(r => r.status?.toLowerCase() === 'pending' || r.status === '1').length;
  const entreguesTotal = resgates.filter(r => r.status?.toLowerCase() === 'collected' || r.status === '2').length;

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'pending' || s === '1' || s === 'pendente') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <Clock size={13} className="text-amber-500" /> Pendente
        </span>
      );
    }
    if (s === 'collected' || s === '2' || s === 'entregue') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <CheckCircle2 size={13} className="text-emerald-500" /> Entregue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
        <XCircle size={13} className="text-rose-500" /> Cancelado
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Input de Validação Rápida */}
      <div className="bg-gradient-to-r from-pontus-light/20 via-pontus-light/10 to-transparent p-6 md:p-8 rounded-3xl border border-pontus-light/30 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pontus text-white uppercase tracking-wider mb-2">
            <Sparkles size={13} /> Balcão de Atendimento
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Validação & Entrega de Prêmios</h1>
          <p className="text-gray-600 text-sm mt-1 max-w-xl">
            Digite o código do vale apresentado pelo aluno para baixar o item do estoque e registrar a retirada oficial.
          </p>
        </div>

        {/* Caixa de Validação Rápida */}
        <div className="w-full lg:w-[420px] bg-white p-5 rounded-2xl shadow-sm border border-gray-100 shrink-0">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Validar Código do Vale
          </label>
          
          {mensagemFeedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold mb-3 flex items-start gap-2.5 shadow-sm border animate-fadeIn ${
              mensagemFeedback.tipo === 'sucesso' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {mensagemFeedback.tipo === 'sucesso' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{mensagemFeedback.texto}</span>
            </div>
          )}

          <form onSubmit={(e) => handleValidar(e)} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ex: PG-8A2F-41C9" 
              value={codigoVoucher}
              onChange={e => setCodigoVoucher(e.target.value.toUpperCase())}
              className="flex-1 uppercase border border-gray-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-pontus focus:outline-none font-mono font-bold tracking-wider text-sm bg-gray-50/50"
            />
            <button 
              type="submit"
              disabled={validando || !codigoVoucher.trim()} 
              className="bg-pontus hover:bg-pontus-dark disabled:bg-gray-300 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm flex items-center gap-1.5 shadow-sm"
            >
              {validando ? 'Validando...' : 'Validar'}
            </button>
          </form>
        </div>
      </div>

      {/* Histórico de Movimentações com Filtros, Busca e Paginação */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Histórico de Movimentações</h3>
            <p className="text-xs text-gray-500">Acompanhe e confirme a entrega de todos os resgates solicitados</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Filtro por Status em Abas Rápidas */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-bold">
              <button 
                onClick={() => { setFiltroStatus('ALL'); setPaginaAtual(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${filtroStatus === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Todos ({resgates.length})
              </button>
              <button 
                onClick={() => { setFiltroStatus('Pending'); setPaginaAtual(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${filtroStatus === 'Pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Pendentes ({pendentesTotal})
              </button>
              <button 
                onClick={() => { setFiltroStatus('Collected'); setPaginaAtual(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${filtroStatus === 'Collected' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Entregues ({entreguesTotal})
              </button>
            </div>

            {/* Barra de Pesquisa Instantânea */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar aluno, prêmio ou código..." 
                value={busca}
                onChange={e => { setBusca(e.target.value); setPaginaAtual(1); }}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pontus/50 w-full bg-white"
              />
            </div>
          </div>
        </div>

        {carregando ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando histórico de resgates...</div>
        ) : resgatesFiltrados.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">Nenhum registro encontrado para os filtros selecionados.</div>
        ) : (
          <>
            {/* Visualização em CARDS no Mobile (< md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {resgatesPaginados.map((resgate) => {
                const isPendente = resgate.status?.toLowerCase() === 'pending' || resgate.status === '1';

                return (
                  <div 
                    key={resgate.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                      isPendente 
                        ? 'bg-amber-50/30 border-amber-200/80 shadow-xs' 
                        : 'bg-white border-gray-100 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{resgate.studentName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Resgatado em {new Date(resgate.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      {getStatusBadge(resgate.status)}
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 bg-white/80 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Recompensa</span>
                        <span className="font-bold text-gray-800">{resgate.productName}</span>
                      </div>
                      <span className="font-black text-pontus text-sm">{resgate.pointsSpent} pts</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-gray-400 block font-bold">CÓDIGO</span>
                        <span className="font-mono font-black text-xs text-gray-900 tracking-wider select-all">{resgate.voucherCode}</span>
                      </div>

                      {isPendente ? (
                        <button
                          onClick={() => handleValidar(undefined, resgate.voucherCode)}
                          disabled={validando}
                          className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl transition-all font-bold shadow-xs"
                        >
                          <Check size={14} /> Entregar Prêmio
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium px-3 py-1.5 bg-gray-50 rounded-lg">Entrega Concluída</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visualização em TABELA no Desktop (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 bg-gray-50/50">
                    <th className="py-3.5 px-4 font-semibold rounded-l-xl">Estudante</th>
                    <th className="py-3.5 px-4 font-semibold">Recompensa</th>
                    <th className="py-3.5 px-4 font-semibold">Data do Resgate</th>
                    <th className="py-3.5 px-4 font-semibold">Código do Vale</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right rounded-r-xl">Ação Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {resgatesPaginados.map((resgate) => {
                    const isPendente = resgate.status?.toLowerCase() === 'pending' || resgate.status === '1';

                    return (
                      <tr key={resgate.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Estudante */}
                        <td className="py-4 px-4 whitespace-nowrap font-bold text-gray-900">
                          {resgate.studentName}
                        </td>

                        {/* Recompensa */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-800">{resgate.productName}</span>
                          <span className="text-xs text-pontus font-bold ml-1.5">({resgate.pointsSpent} pts)</span>
                        </td>

                        {/* Data */}
                        <td className="py-4 px-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(resgate.createdAt).toLocaleDateString('pt-BR')}
                        </td>

                        {/* Código do Vale */}
                        <td className="py-4 px-4 font-mono font-bold text-gray-900 tracking-wider whitespace-nowrap select-all">
                          {resgate.voucherCode}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getStatusBadge(resgate.status)}
                        </td>

                        {/* Ação Rápida */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          {isPendente ? (
                            <button
                              onClick={() => handleValidar(undefined, resgate.voucherCode)}
                              disabled={validando}
                              className="inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-200 transition-all font-bold shadow-sm"
                              title="Dar baixa e entregar prêmio"
                            >
                              <Check size={14} /> Entregar
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">Finalizado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapé da Paginação */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <p>
                Exibindo <strong>{indiceInicial + 1}</strong> a <strong>{Math.min(indiceInicial + itensPorPagina, resgatesFiltrados.length)}</strong> de <strong>{resgatesFiltrados.length}</strong> movimentações
              </p>

              {totalPaginas > 1 && (
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
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}