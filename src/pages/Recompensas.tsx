import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../types';

export default function Recompensas() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [mensagemFeedback, setMensagemFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    name: '',
    description: '',
    pointsCost: 0,
    stockQuantity: 0
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      const dados = await productService.getAllForAdmin();
      setProdutos(dados);
    } catch (error) {
      console.error("Erro ao buscar recompensas:", error);
    } finally {
      setCarregando(false);
    }
  };

  const exibirFeedback = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagemFeedback({ tipo, texto });
    setTimeout(() => {
      setMensagemFeedback(null);
    }, 4000);
  };

  // Função para salvar nova recompensa
  const handleCriarRecompensa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvando(true);
      await productService.create(novoProduto);
      setModalAberto(false);
      setNovoProduto({ name: '', description: '', pointsCost: 0, stockQuantity: 0 });
      await carregarProdutos();
      exibirFeedback('sucesso', 'Recompensa criada e adicionada ao catálogo com sucesso!');
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      exibirFeedback('erro', error.response?.data?.message || "Erro ao criar a recompensa.");
    } finally {
      setSalvando(false);
    }
  };

  // Função para desativar recompensa
  const handleDesativar = async (id: string) => {
    if (window.confirm("Tem certeza que deseja desativar esta recompensa do catálogo?")) {
      try {
        await productService.deactivate(id);
        await carregarProdutos();
        exibirFeedback('sucesso', 'Recompensa desativada com sucesso.');
      } catch (error: any) {
        console.error("Erro ao desativar:", error);
        exibirFeedback('erro', error.response?.data?.message || "Erro ao desativar o produto.");
      }
    }
  };

  const recompensasAtivas = produtos.filter(p => p.isActive).length;
  const estoqueTotal = produtos.reduce((total, p) => total + p.stockQuantity, 0);
  const estoqueBaixo = produtos.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  
  const produtosFiltrados = produtos.filter(p => 
    p.name.toLowerCase().includes(busca.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="space-y-6 relative">
      {/* Toast Feedback */}
      {mensagemFeedback && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-md border animate-fadeIn ${
          mensagemFeedback.tipo === 'sucesso' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {mensagemFeedback.tipo === 'sucesso' ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-rose-600" />}
          <span>{mensagemFeedback.texto}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-pontus-light/20 via-pontus-light/10 to-transparent p-6 md:p-8 rounded-3xl border border-pontus-light/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pontus text-white uppercase tracking-wider mb-2">
            <Sparkles size={13} /> Catálogo de Prêmios
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Recompensas</h1>
          <p className="text-gray-600 text-sm mt-1">
            Cadastre novos prêmios, gerencie pontos necessários e monitore a quantidade em estoque.
          </p>
        </div>
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-pontus hover:bg-pontus-dark text-white px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus size={18} /> Nova Recompensa
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Recompensas Ativas</p>
          <p className="text-3xl font-black text-gray-900">{carregando ? '-' : recompensasAtivas}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Itens em Estoque</p>
          <p className="text-3xl font-black text-gray-900">{carregando ? '-' : estoqueTotal}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-sm">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Estoque Baixo (≤ 5)</p>
          <p className="text-3xl font-black text-amber-800">{carregando ? '-' : estoqueBaixo}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total de Itens</p>
          <p className="text-3xl font-black text-pontus">{carregando ? '-' : produtos.length}</p>
        </div>
      </div>

      {/* Lista de Recompensas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Catálogo de Recompensas</h3>
            <p className="text-xs text-gray-500">Lista completa de produtos disponíveis para troca por pontos</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar recompensa..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus/50 w-full text-xs"
            />
          </div>
        </div>

        {carregando ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando catálogo...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">Nenhuma recompensa encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 bg-gray-50/50">
                  <th className="py-3.5 px-4 font-semibold rounded-l-xl">Recompensa</th>
                  <th className="py-3.5 px-4 font-semibold">Custo em Pontos</th>
                  <th className="py-3.5 px-4 font-semibold">Estoque</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right rounded-r-xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900">{produto.name}</p>
                      {produto.description && <p className="text-xs text-gray-500 mt-0.5">{produto.description}</p>}
                    </td>
                    <td className="py-4 px-4 font-black text-pontus whitespace-nowrap">
                      {produto.pointsCost} <span className="text-xs text-gray-400 font-semibold">pts</span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`font-semibold px-2.5 py-1 rounded-lg text-xs ${
                        produto.stockQuantity <= 5 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {produto.stockQuantity} un
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        produto.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {produto.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleDesativar(produto.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50" 
                          title="Desativar item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Nova Recompensa */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative border border-gray-100">
            <button 
              onClick={() => setModalAberto(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Nova Recompensa</h2>
            <p className="text-xs text-gray-500 mb-6">Cadastre um novo prêmio no catálogo do Supera</p>
            
            <form onSubmit={handleCriarRecompensa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nome do Produto</label>
                <input 
                  required
                  type="text"
                  value={novoProduto.name}
                  onChange={e => setNovoProduto({...novoProduto, name: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm"
                  placeholder="Ex: Caneca Supera Pontus"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Descrição</label>
                <textarea 
                  value={novoProduto.description}
                  onChange={e => setNovoProduto({...novoProduto, description: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm"
                  placeholder="Detalhes e benefícios da recompensa..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Custo (Pontos)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={novoProduto.pointsCost || ''}
                    onChange={e => setNovoProduto({...novoProduto, pointsCost: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm"
                    placeholder="Ex: 500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Estoque Inicial</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={novoProduto.stockQuantity || ''}
                    onChange={e => setNovoProduto({...novoProduto, stockQuantity: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontus text-sm"
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-pontus hover:bg-pontus-dark text-white px-4 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm shadow-md"
                >
                  {salvando ? 'Salvando...' : 'Salvar Recompensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}