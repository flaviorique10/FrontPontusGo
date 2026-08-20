import { useState, useEffect } from 'react';
import { Search, UserPlus, Award, X, CheckCircle2, Clock, AlertTriangle, Sparkles, CheckSquare, Square, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { userService } from '../services/userService';
import type { Student, TuitionStatus } from '../types';

export default function Estudantes() {
  const [estudantes, setEstudantes] = useState<Student[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroMensalidade, setFiltroMensalidade] = useState<string>('todos');

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  // Modais
  const [modalNovoAluno, setModalNovoAluno] = useState(false);
  const [modalPontos, setModalPontos] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Student | null>(null);

  // Formulários
  const [novoAluno, setNovoAluno] = useState<{ name: string; email: string; password: string; tuitionStatus: TuitionStatus }>({
    name: '',
    email: '',
    password: '',
    tuitionStatus: 'UpToDate'
  });

  // Estado do formulário de atividades diárias (10 pts cada)
  const [atividades, setAtividades] = useState({
    assiduidade: false,
    participacao: false,
    fazerTarefa: false,
    observacao: ''
  });

  // Modo avulso / personalizado
  const [modoAvulso, setModoAvulso] = useState(false);
  const [pontosAvulsos, setPontosAvulsos] = useState<number>(10);
  const [descricaoAvulsa, setDescricaoAvulsa] = useState<string>('Atividade pedagógica');

  const [salvando, setSalvando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    carregarEstudantes();
  }, []);

  const carregarEstudantes = async () => {
    try {
      setCarregando(true);
      const dados = await userService.getAllStudents();
      setEstudantes(dados);
    } catch (error) {
      console.error("Erro ao buscar estudantes:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleCriarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvando(true);
      await userService.createStudent(novoAluno);
      setModalNovoAluno(false);
      setNovoAluno({ name: '', email: '', password: '', tuitionStatus: 'UpToDate' });
      await carregarEstudantes();
      exibirFeedback('sucesso', 'Estudante cadastrado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao cadastrar aluno.");
    } finally {
      setSalvando(false);
    }
  };

  const handleAtualizarMensalidade = async (alunoId: string, novoStatus: TuitionStatus) => {
    try {
      await userService.updateTuitionStatus(alunoId, novoStatus);
      setEstudantes(prev => prev.map(a => a.id === alunoId ? { ...a, tuitionStatus: novoStatus } : a));
      exibirFeedback('sucesso', 'Status da mensalidade atualizado!');
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao atualizar status da mensalidade.");
    }
  };

  const handleBonificarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoSelecionado) return;

    try {
      setSalvando(true);

      if (modoAvulso) {
        if (pontosAvulsos <= 0) {
          alert("Informe uma quantidade positiva de pontos.");
          return;
        }
        await userService.addPoints(alunoSelecionado.id, pontosAvulsos, descricaoAvulsa);
      } else {
        const totalPontosSelecionados = 
          (atividades.assiduidade ? 10 : 0) +
          (atividades.participacao ? 10 : 0) +
          (atividades.fazerTarefa ? 10 : 0);

        if (totalPontosSelecionados === 0) {
          alert("Selecione pelo menos uma atividade (Assiduidade, Participação ou Fazer Tarefa).");
          return;
        }

        await userService.awardDailyPoints(alunoSelecionado.id, {
          assiduidade: atividades.assiduidade,
          participacao: atividades.participacao,
          fazerTarefa: atividades.fazerTarefa,
          observation: atividades.observacao
        });
      }

      setModalPontos(false);
      resetFormPontos();
      await carregarEstudantes();
      exibirFeedback('sucesso', 'Pontos concedidos com sucesso ao aluno!');
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao adicionar pontos. Verifique o limite diário.");
    } finally {
      setSalvando(false);
    }
  };

  const resetFormPontos = () => {
    setAtividades({
      assiduidade: false,
      participacao: false,
      fazerTarefa: false,
      observacao: ''
    });
    setModoAvulso(false);
    setPontosAvulsos(10);
    setDescricaoAvulsa('Atividade pedagógica');
  };

  const abrirModalPontos = (aluno: Student) => {
    setAlunoSelecionado(aluno);
    resetFormPontos();
    setModalPontos(true);
  };

  const exibirFeedback = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagemStatus({ tipo, texto });
    setTimeout(() => {
      setMensagemStatus(null);
    }, 4000);
  };

  const getStatusMensalidadeBadge = (status?: string) => {
    const normalizado = status?.toString().toLowerCase();

    if (normalizado === 'uptodate' || normalizado === '1' || normalizado === 'emdia' || normalizado === 'em dia') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <CheckCircle2 size={13} className="text-emerald-500" /> Em dia
        </span>
      );
    }

    if (normalizado === 'pending' || normalizado === '2' || normalizado === 'pendente') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <Clock size={13} className="text-amber-500" /> Pendente
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
        <AlertTriangle size={13} className="text-rose-500" /> Atrasado
      </span>
    );
  };

  const normalizarTuitionStatus = (status?: string): TuitionStatus => {
    const norm = status?.toString().toLowerCase();
    if (norm === 'pending' || norm === '2') return 'Pending';
    if (norm === 'overdue' || norm === '3') return 'Overdue';
    return 'UpToDate';
  };

  const pontosSelecionadosCalculados = 
    (atividades.assiduidade ? 10 : 0) +
    (atividades.participacao ? 10 : 0) +
    (atividades.fazerTarefa ? 10 : 0);

  const pontosGanhosHojeAluno = alunoSelecionado?.pointsEarnedToday ?? 0;
  const pontosRestantesHojeAluno = Math.max(0, 30 - pontosGanhosHojeAluno);
  const totalPrevistoHoje = modoAvulso 
    ? pontosGanhosHojeAluno + (Number(pontosAvulsos) || 0)
    : pontosGanhosHojeAluno + pontosSelecionadosCalculados;

  const ultrapassaLimite = totalPrevistoHoje > 30;

  const alunosFiltrados = estudantes.filter(e => {
    const matchBusca = e.name.toLowerCase().includes(busca.toLowerCase()) || e.email.toLowerCase().includes(busca.toLowerCase());
    if (!matchBusca) return false;

    if (filtroMensalidade === 'todos') return true;
    const statusNormalizado = normalizarTuitionStatus(e.tuitionStatus);
    return statusNormalizado.toLowerCase() === filtroMensalidade.toLowerCase();
  });

  const totalPaginas = Math.ceil(alunosFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const alunosPaginados = alunosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {mensagemStatus && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-md border ${
          mensagemStatus.tipo === 'sucesso' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {mensagemStatus.tipo === 'sucesso' ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-rose-600" />}
          <span>{mensagemStatus.texto}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pontus-light/20 via-pontus-light/10 to-transparent p-6 md:p-8 rounded-3xl border border-pontus-light/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pontus text-white uppercase tracking-wider mb-2">
            <Sparkles size={13} /> Sistema de Gestão & Bonificação
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Estudantes</h1>
          <p className="text-gray-600 text-sm mt-1">
            Controle de pontuação diária (máx. 30 pts/dia por <strong>Assiduidade</strong>, <strong>Participação</strong> e <strong>Tarefa</strong>) e status de mensalidade.
          </p>
        </div>
        <button 
          onClick={() => setModalNovoAluno(true)} 
          className="bg-pontus hover:bg-pontus-dark text-white px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
        >
          <UserPlus size={18} /> Novo Estudante
        </button>
      </div>

      {/* Tabela, Cards e Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Alunos Cadastrados ({alunosFiltrados.length})</h3>
            <p className="text-xs text-gray-500">Monitore o saldo geral e o cumprimento das metas diárias</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Filtro Mensalidade */}
            <select
              value={filtroMensalidade}
              onChange={(e) => { setFiltroMensalidade(e.target.value); setPaginaAtual(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus/50 bg-white"
            >
              <option value="todos">Todas as Mensalidades</option>
              <option value="uptodate">Mensalidade: Em dia</option>
              <option value="pending">Mensalidade: Pendente</option>
              <option value="overdue">Mensalidade: Atrasada</option>
            </select>

            {/* Campo de Busca */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou e-mail..." 
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus/50 w-full text-sm"
              />
            </div>
          </div>
        </div>

        {carregando ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando estudantes...</div>
        ) : alunosFiltrados.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">Nenhum estudante encontrado para os filtros selecionados.</div>
        ) : (
          <>
            {/* Visualização em CARDS no Mobile (< md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {alunosPaginados.map((aluno) => {
                const ptsHoje = aluno.pointsEarnedToday ?? 0;
                const percentualHoje = Math.min(100, Math.round((ptsHoje / 30) * 100));

                return (
                  <div 
                    key={aluno.id}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow flex flex-col gap-3.5"
                  >
                    {/* Header do Card: Avatar, Nome, Email e Saldo Total */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-pontus-light/20 text-pontus font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {aluno.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{aluno.name}</p>
                          <p className="text-xs text-gray-500 truncate">{aluno.email}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-gray-400 font-medium">Saldo Total</p>
                        <p className="font-black text-pontus text-base leading-none mt-0.5">
                          {aluno.totalPoints.toLocaleString('pt-BR')} <span className="text-[10px] text-gray-400 font-bold">pts</span>
                        </p>
                      </div>
                    </div>

                    {/* Status da Mensalidade */}
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-gray-50/80 rounded-xl">
                      <span className="text-xs font-semibold text-gray-600">Mensalidade:</span>
                      <div className="flex items-center gap-2">
                        {getStatusMensalidadeBadge(aluno.tuitionStatus)}
                        <select
                          value={normalizarTuitionStatus(aluno.tuitionStatus)}
                          onChange={(e) => handleAtualizarMensalidade(aluno.id, e.target.value as TuitionStatus)}
                          aria-label={`Alterar status da mensalidade de ${aluno.name}`}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-pontus cursor-pointer shadow-xs"
                        >
                          <option value="UpToDate">Em dia</option>
                          <option value="Pending">Pendente</option>
                          <option value="Overdue">Atrasado</option>
                        </select>
                      </div>
                    </div>

                    {/* Pontos de Hoje com Barra de Progresso */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-gray-500 font-medium">Meta Diária: <strong>{ptsHoje} / 30 pts</strong></span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          ptsHoje >= 30 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {ptsHoje >= 30 ? 'Máx Atingido' : `${30 - ptsHoje} pts restantes`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            ptsHoje >= 30 ? 'bg-emerald-500' : ptsHoje > 0 ? 'bg-pontus' : 'bg-transparent'
                          }`}
                          style={{ width: `${percentualHoje}%` }}
                        />
                      </div>
                    </div>

                    {/* Ação: Botão Bonificar */}
                    <button 
                      onClick={() => abrirModalPontos(aluno)} 
                      className="w-full mt-1 inline-flex items-center justify-center gap-2 text-xs bg-pontus text-white hover:bg-pontus-dark py-2.5 rounded-xl transition-colors font-bold shadow-xs"
                    >
                      <Award size={15} /> Bonificar Aluno
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Visualização em TABELA no Desktop (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 bg-gray-50/50">
                    <th className="py-3.5 px-4 font-semibold rounded-l-xl">Estudante</th>
                    <th className="py-3.5 px-4 font-semibold">Status Mensalidade</th>
                    <th className="py-3.5 px-4 font-semibold">Pontos de Hoje</th>
                    <th className="py-3.5 px-4 font-semibold">Saldo Total</th>
                    <th className="py-3.5 px-4 font-semibold text-right rounded-r-xl">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {alunosPaginados.map((aluno) => {
                    const ptsHoje = aluno.pointsEarnedToday ?? 0;
                    const percentualHoje = Math.min(100, Math.round((ptsHoje / 30) * 100));

                    return (
                      <tr key={aluno.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Nome e Email */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-pontus-light/20 text-pontus font-black flex items-center justify-center text-xs">
                              {aluno.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{aluno.name}</p>
                              <p className="text-xs text-gray-500">{aluno.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status Mensalidade com Seletor Rápido */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusMensalidadeBadge(aluno.tuitionStatus)}
                            <select
                              value={normalizarTuitionStatus(aluno.tuitionStatus)}
                              onChange={(e) => handleAtualizarMensalidade(aluno.id, e.target.value as TuitionStatus)}
                              aria-label={`Alterar status da mensalidade de ${aluno.name}`}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-pontus cursor-pointer"
                            >
                              <option value="UpToDate">Em dia</option>
                              <option value="Pending">Pendente</option>
                              <option value="Overdue">Atrasado</option>
                            </select>
                          </div>
                        </td>

                        {/* Pontos de Hoje (Limite 30) */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="w-36">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-bold text-gray-700">{ptsHoje} / 30 pts</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                ptsHoje >= 30 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {ptsHoje >= 30 ? 'Máx Atingido' : `${30 - ptsHoje} restam`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  ptsHoje >= 30 ? 'bg-emerald-500' : ptsHoje > 0 ? 'bg-pontus' : 'bg-transparent'
                                }`}
                                style={{ width: `${percentualHoje}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Saldo Total */}
                        <td className="py-4 px-4 whitespace-nowrap font-black text-pontus text-base">
                          {aluno.totalPoints.toLocaleString('pt-BR')} <span className="text-xs text-gray-400 font-semibold">pts</span>
                        </td>

                        {/* Ações */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button 
                            onClick={() => abrirModalPontos(aluno)} 
                            className="inline-flex items-center gap-1.5 text-xs bg-pontus text-white hover:bg-pontus-dark px-3.5 py-2 rounded-xl transition-colors font-bold shadow-sm"
                          >
                            <Award size={15} /> Bonificar Aluno
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <p>
                  Exibindo <strong>{indiceInicial + 1}</strong> a <strong>{Math.min(indiceInicial + itensPorPagina, alunosFiltrados.length)}</strong> de <strong>{alunosFiltrados.length}</strong> estudantes
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

      {/* Modal Novo Aluno */}
      {modalNovoAluno && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md relative shadow-2xl border border-gray-100">
            <button 
              onClick={() => setModalNovoAluno(false)} 
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Cadastrar Estudante</h2>
            <p className="text-xs text-gray-500 mb-6">Preencha os dados do novo aluno para inclusão no sistema</p>

            <form onSubmit={handleCriarAluno} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nome Completo</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ex: Ana Clara Souza" 
                  value={novoAluno.name} 
                  onChange={e => setNovoAluno({...novoAluno, name: e.target.value})} 
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">E-mail de Acesso</label>
                <input 
                  required 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  value={novoAluno.email} 
                  onChange={e => setNovoAluno({...novoAluno, email: e.target.value})} 
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Senha Inicial</label>
                <input 
                  required 
                  type="password" 
                  placeholder="Mínimo 8 caracteres" 
                  value={novoAluno.password} 
                  onChange={e => setNovoAluno({...novoAluno, password: e.target.value})} 
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status da Mensalidade</label>
                <select 
                  value={novoAluno.tuitionStatus} 
                  onChange={e => setNovoAluno({...novoAluno, tuitionStatus: e.target.value as TuitionStatus})} 
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm bg-white"
                >
                  <option value="UpToDate">Em dia (Padrão)</option>
                  <option value="Pending">Pendente</option>
                  <option value="Overdue">Atrasado</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={salvando} 
                  className="w-full bg-pontus hover:bg-pontus-dark disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
                >
                  {salvando ? 'Cadastrando...' : 'Cadastrar Estudante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Bonificação / Concessão de Pontos com Regras de Negócio */}
      {modalPontos && alunoSelecionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg relative shadow-2xl border border-gray-100">
            <button 
              onClick={() => setModalPontos(false)} 
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-pontus/10 text-pontus flex items-center justify-center font-black">
                <Award size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Bonificar Estudante</h2>
                <p className="text-xs text-gray-500">Aluno(a): <strong className="text-gray-800">{alunoSelecionado.name}</strong></p>
              </div>
            </div>

            {/* Painel do Limite Diário (Máx 30 pts) */}
            <div className="my-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-gray-600">Limite Diário (Máx. 30 pts/dia)</span>
                <span className="font-extrabold text-gray-900">{pontosGanhosHojeAluno} / 30 pts hoje</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all ${
                    pontosGanhosHojeAluno >= 30 ? 'bg-emerald-500' : 'bg-pontus'
                  }`}
                  style={{ width: `${Math.min(100, (pontosGanhosHojeAluno / 30) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 flex items-center justify-between">
                <span>Saldo disponível para hoje:</span>
                <strong className={pontosRestantesHojeAluno === 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {pontosRestantesHojeAluno} pontos restantes
                </strong>
              </p>
            </div>

            {/* Alerta de Limite Atingido */}
            {pontosRestantesHojeAluno === 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <span>Este aluno já atingiu o teto diário de <strong>30 pontos</strong> hoje. Novos pontos só poderão ser concedidos amanhã.</span>
              </div>
            )}

            <form onSubmit={handleBonificarAluno} className="space-y-4">
              {/* Seletor de Modo: Atividades Padrão vs Pontuação Avulsa */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Critérios de Pontuação</span>
                <button
                  type="button"
                  onClick={() => setModoAvulso(!modoAvulso)}
                  className="text-xs text-pontus hover:text-pontus-dark font-bold underline"
                >
                  {modoAvulso ? 'Usar Atividades Padrão' : 'Modo Pontuação Personalizada'}
                </button>
              </div>

              {!modoAvulso ? (
                /* 3 Atividades Padrão (10 pts cada) */
                <div className="space-y-2.5">
                  {/* Assiduidade */}
                  <label 
                    onClick={() => setAtividades(prev => ({ ...prev, assiduidade: !prev.assiduidade }))}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      atividades.assiduidade 
                        ? 'bg-pontus-light/15 border-pontus ring-1 ring-pontus shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5 text-pontus">
                      {atividades.assiduidade ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-900">Assiduidade</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-pontus-light/30 text-pontus">+10 pts</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Presença e pontualidade na aula</p>
                    </div>
                  </label>

                  {/* Participação */}
                  <label 
                    onClick={() => setAtividades(prev => ({ ...prev, participacao: !prev.participacao }))}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      atividades.participacao 
                        ? 'bg-pontus-light/15 border-pontus ring-1 ring-pontus shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5 text-pontus">
                      {atividades.participacao ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-900">Participação</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-pontus-light/30 text-pontus">+10 pts</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Engajamento ativo e colaboração durante a aula</p>
                    </div>
                  </label>

                  {/* Fazer Tarefa */}
                  <label 
                    onClick={() => setAtividades(prev => ({ ...prev, fazerTarefa: !prev.fazerTarefa }))}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      atividades.fazerTarefa 
                        ? 'bg-pontus-light/15 border-pontus ring-1 ring-pontus shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5 text-pontus">
                      {atividades.fazerTarefa ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-900">Fazer Tarefa</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-pontus-light/30 text-pontus">+10 pts</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Lições de casa e desafios cumpridos</p>
                    </div>
                  </label>

                  {/* Observação Extra */}
                  <div className="pt-1">
                    <input 
                      type="text" 
                      placeholder="Observação opcional (ex: Destaque na aula de hoje)" 
                      value={atividades.observacao} 
                      onChange={e => setAtividades({ ...atividades, observacao: e.target.value })} 
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pontus"
                    />
                  </div>
                </div>
              ) : (
                /* Modo Personalizado */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Quantidade de Pontos (Máx. 30)</label>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      max="30" 
                      placeholder="Ex: 10" 
                      value={pontosAvulsos || ''} 
                      onChange={e => setPontosAvulsos(Number(e.target.value))} 
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Motivo / Descrição</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: Desafio de Lógica / Simulado" 
                      value={descricaoAvulsa} 
                      onChange={e => setDescricaoAvulsa(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm" 
                    />
                  </div>
                </div>
              )}

              {/* Resumo da Concessão */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                ultrapassaLimite 
                  ? 'bg-rose-50 border-rose-200 text-rose-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div>
                  <span className="font-semibold block">Total a Bonificar:</span>
                  <span className="text-base font-black">
                    +{modoAvulso ? (Number(pontosAvulsos) || 0) : pontosSelecionadosCalculados} pts
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">Total do Dia Após Concessão:</span>
                  <span className={`font-black ${ultrapassaLimite ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {totalPrevistoHoje} / 30 pts
                  </span>
                </div>
              </div>

              {ultrapassaLimite && (
                <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={14} /> A pontuação ultrapassa o limite diário de 30 pontos. Reduza os itens selecionados.
                </p>
              )}

              {/* Botão de Envio */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={salvando || pontosRestantesHojeAluno === 0 || ultrapassaLimite || (!modoAvulso && pontosSelecionadosCalculados === 0)} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {salvando ? 'Processando Bonificação...' : 'Confirmar e Adicionar Pontos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}