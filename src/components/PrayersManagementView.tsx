import React, { useState } from 'react';
import {
  HeartHandshake,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  MessageSquare,
  Sparkles,
  Share2,
  Copy,
  Check,
  Send,
  PlusCircle,
  User,
  Calendar,
  AlertCircle,
  Phone,
  Flame,
  Award,
} from 'lucide-react';
import { PrayerRequest, ChurchProfile } from '../types';

interface PrayersManagementViewProps {
  prayers: PrayerRequest[];
  churchProfile: ChurchProfile;
  onPrayForRequest: (prayerId: string) => void;
  onDeletePrayer: (prayerId: string) => void;
  onRespondPrayer: (prayerId: string, resposta: string, novoStatus?: 'pendente' | 'em_oracao' | 'atendido') => void;
  onAddNewPrayer: (newPrayer: Omit<PrayerRequest, 'id' | 'createdAt' | 'intercessores'>) => void;
}

export const PrayersManagementView: React.FC<PrayersManagementViewProps> = ({
  prayers,
  churchProfile,
  onPrayForRequest,
  onDeletePrayer,
  onRespondPrayer,
  onAddNewPrayer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'em_oracao' | 'atendido'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [selectedPrayerForResponse, setSelectedPrayerForResponse] = useState<PrayerRequest | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState<'pendente' | 'em_oracao' | 'atendido'>('em_oracao');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Prayer Form State
  const [newNome, setNewNome] = useState('');
  const [newPedido, setNewPedido] = useState('');
  const [newCategoria, setNewCategoria] = useState('Vida Espiritual');
  const [newContato, setNewContato] = useState('');

  // Stats
  const totalPrayers = prayers.length;
  const pendentesCount = prayers.filter((p) => !p.status || p.status === 'pendente').length;
  const emOracaoCount = prayers.filter((p) => p.status === 'em_oracao' || p.orado).length;
  const atendidosCount = prayers.filter((p) => p.status === 'atendido').length;

  // Filtered list
  const filteredPrayers = prayers.filter((prayer) => {
    const matchesSearch =
      prayer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prayer.pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prayer.categoria && prayer.categoria.toLowerCase().includes(searchTerm.toLowerCase()));

    const currentStatus = prayer.status || (prayer.orado ? 'em_oracao' : 'pendente');
    const matchesStatus = statusFilter === 'todos' || currentStatus === statusFilter;
    const matchesCategory = categoryFilter === 'todos' || prayer.categoria === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenResponse = (prayer: PrayerRequest) => {
    setSelectedPrayerForResponse(prayer);
    setResponseText(prayer.respostaPastoral || '');
    setResponseStatus(prayer.status || (prayer.orado ? 'em_oracao' : 'em_oracao'));
  };

  const handleSaveResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrayerForResponse) return;
    onRespondPrayer(selectedPrayerForResponse.id, responseText, responseStatus);
    setSelectedPrayerForResponse(null);
    setResponseText('');
  };

  const handleCreateNewPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPedido.trim()) return;

    onAddNewPrayer({
      nome: newNome.trim() || 'Membro / Anônimo',
      pedido: newPedido.trim(),
      categoria: newCategoria,
      contato: newContato.trim() || undefined,
      status: 'em_oracao',
      igrejaId: churchProfile.idRegistro || '',
    });

    setNewNome('');
    setNewPedido('');
    setNewContato('');
    setIsNewModalOpen(false);
  };

  const handleCopyForIntercession = (prayer: PrayerRequest) => {
    const textToCopy = `🕊️ *PEDIDO DE ORAÇÃO - ${churchProfile.nome}*\n\n👤 *Membro/Irmão(ã):* ${prayer.nome}\n📅 *Data:* ${prayer.createdAt}\n🏷️ *Categoria:* ${prayer.categoria || 'Geral'}\n\n🙏 *Motivo de Oração:*\n"${prayer.pedido}"\n\n_Equipe de Intercessão e Oração Pastoral_`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(prayer.id);
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-700/60 border border-indigo-500/40 text-indigo-200 text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-indigo-300" />
            <span>Ministério de Oração &amp; Clamor Pastoral</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Pedidos de Oração dos Membros
          </h2>
          <p className="text-sm text-indigo-200 max-w-2xl leading-relaxed">
            Receba, interceda e acompanhe os motivos de oração e clamor enviados pelos membros e congregados através do aplicativo.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Novo Pedido Pastoral</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total de Pedidos</p>
            <p className="text-xl font-bold text-gray-900">{totalPrayers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Aguardando Oração</p>
            <p className="text-xl font-bold text-amber-700">{pendentesCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Em Intercessão</p>
            <p className="text-xl font-bold text-blue-700">{emOracaoCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Testemunhos / Atendidos</p>
            <p className="text-xl font-bold text-emerald-700">{atendidosCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou motivo..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todos ({totalPrayers})
            </button>
            <button
              onClick={() => setStatusFilter('pendente')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'pendente'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pendentes ({pendentesCount})
            </button>
            <button
              onClick={() => setStatusFilter('em_oracao')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'em_oracao'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Em Oração ({emOracaoCount})
            </button>
            <button
              onClick={() => setStatusFilter('atendido')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'atendido'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Atendidos ({atendidosCount})
            </button>
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="todos">Todas Categorias</option>
            <option value="Saúde & Cura">Saúde &amp; Cura</option>
            <option value="Família & Casamento">Família &amp; Casamento</option>
            <option value="Vida Espiritual">Vida Espiritual</option>
            <option value="Financeiro & Trabalho">Financeiro &amp; Trabalho</option>
            <option value="Libertação">Libertação</option>
            <option value="Gratidão & Louvor">Gratidão &amp; Louvor</option>
            <option value="Geral">Geral</option>
          </select>
        </div>
      </div>

      {/* Prayers List */}
      <div className="space-y-4">
        {filteredPrayers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              Nenhum pedido de oração encontrado
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'todos' || categoryFilter !== 'todos'
                ? 'Nenhum pedido corresponde aos filtros aplicados. Experimente limpar a busca.'
                : 'Os pedidos de oração enviados pelos membros pelo aplicativo aparecerão listados aqui para a liderança interceder.'}
            </p>
          </div>
        ) : (
          filteredPrayers.map((prayer) => {
            const currentStatus = prayer.status || (prayer.orado ? 'em_oracao' : 'pendente');
            const isOrado = currentStatus === 'em_oracao' || currentStatus === 'atendido' || prayer.orado;

            return (
              <div
                key={prayer.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:border-indigo-200 transition space-y-4"
              >
                {/* Header of Prayer Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center text-sm shrink-0">
                      {prayer.nome.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900">{prayer.nome}</h4>
                        {prayer.categoria && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {prayer.categoria}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {prayer.createdAt}
                        </span>
                        {prayer.contato && (
                          <span className="flex items-center gap-1 text-indigo-600 font-medium">
                            <Phone className="w-3 h-3" />
                            {prayer.contato}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {currentStatus === 'pendente' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pendente
                      </span>
                    )}
                    {currentStatus === 'em_oracao' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-blue-600" />
                        Em Intercessão
                      </span>
                    )}
                    {currentStatus === 'atendido' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Testemunho / Atendido
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <p className="text-sm text-gray-800 leading-relaxed italic">
                    "{prayer.pedido}"
                  </p>
                </div>

                {/* Pastoral Response if exists */}
                {prayer.respostaPastoral && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-indigo-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        Palavra / Resposta Pastoral:
                      </span>
                      {prayer.dataResposta && (
                        <span className="text-[10px] text-indigo-500 font-normal">
                          {prayer.dataResposta}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {prayer.respostaPastoral}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {/* Botão de Orar / Interceder */}
                    <button
                      onClick={() => onPrayForRequest(prayer.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isOrado
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                      }`}
                      title="Registrar oração da liderança por este pedido"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isOrado ? 'Intercedido (+1)' : 'Orar por Este Pedido'}</span>
                      <span className="bg-white/30 text-current px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                        {prayer.intercessores || 1}
                      </span>
                    </button>

                    {/* Botão Responder Pastoralmente */}
                    <button
                      onClick={() => handleOpenResponse(prayer)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{prayer.respostaPastoral ? 'Editar Resposta' : 'Acompanhamento Pastoral'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botão Copiar para WhatsApp de Intercessão */}
                    <button
                      onClick={() => handleCopyForIntercession(prayer)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                      title="Copiar pedido formatado para grupo de oração/WhatsApp"
                    >
                      {copiedId === prayer.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Botão Excluir Pedido */}
                    <button
                      onClick={() => onDeletePrayer(prayer.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Excluir Pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Resposta Pastoral / Acompanhamento */}
      {selectedPrayerForResponse && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Acompanhamento Pastoral</h3>
                  <p className="text-xs text-gray-500">Membro: {selectedPrayerForResponse.nome}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPrayerForResponse(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 italic border border-gray-200">
              "{selectedPrayerForResponse.pedido}"
            </div>

            <form onSubmit={handleSaveResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Status do Pedido no Ministério
                </label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="em_oracao">Em Intercessão Ativa</option>
                  <option value="atendido">Testemunho / Oração Atendida</option>
                  <option value="pendente">Pendente de Oração</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mensagem / Palavra Pastoral ou Versículo
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Ex: Amado irmão, a liderança pastoral e o ministério de intercessão oraram por você. Cremos na vitória em Cristo Jesus! (Sl 121)"
                  className="w-full px-3 py-2 text-xs bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedPrayerForResponse(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Salvar Acompanhamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Novo Pedido de Oração pela Liderança */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Novo Pedido / Motivo de Oração</h3>
                  <p className="text-xs text-gray-500">Cadastre um pedido ou clamor congregacional</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewPrayer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome do Solicitante ou Família
                </label>
                <input
                  type="text"
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="Ex: Família Silva / Ministério de Jovens"
                  className="w-full px-3 py-2 text-xs bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newCategoria}
                    onChange={(e) => setNewCategoria(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Saúde & Cura">Saúde &amp; Cura</option>
                    <option value="Família & Casamento">Família &amp; Casamento</option>
                    <option value="Vida Espiritual">Vida Espiritual</option>
                    <option value="Financeiro & Trabalho">Financeiro &amp; Trabalho</option>
                    <option value="Libertação">Libertação</option>
                    <option value="Gratidão & Louvor">Gratidão &amp; Louvor</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Telefone / WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newContato}
                    onChange={(e) => setNewContato(e.target.value)}
                    placeholder="Ex: (63) 99999-9999"
                    className="w-full px-3 py-2 text-xs bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Motivo do Clamor e Detalhes da Oração *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newPedido}
                  onChange={(e) => setNewPedido(e.target.value)}
                  placeholder="Descreva o motivo de intercessão para o mural pastoral e dos membros..."
                  className="w-full px-3 py-2 text-xs bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Cadastrar Pedido</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
