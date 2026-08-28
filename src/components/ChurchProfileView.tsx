import React, { useState } from 'react';
import {
  Church,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Youtube,
  CreditCard,
  Plus,
  Trash2,
} from 'lucide-react';
import { ChurchProfile } from '../types';

interface ChurchProfileViewProps {
  profile: ChurchProfile;
  onSaveProfile: (updatedProfile: ChurchProfile) => void;
}

export const ChurchProfileView: React.FC<ChurchProfileViewProps> = ({
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<ChurchProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddSchedule = () => {
    setFormData({
      ...formData,
      horariosCultos: [
        ...formData.horariosCultos,
        { dia: 'Domingo', horario: '19:00', titulo: 'Culto Especial' },
      ],
    });
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData({
      ...formData,
      horariosCultos: formData.horariosCultos.filter((_, i) => i !== index),
    });
  };

  const handleScheduleChange = (
    index: number,
    field: 'dia' | 'horario' | 'titulo',
    value: string
  ) => {
    const updated = [...formData.horariosCultos];
    updated[index][field] = value;
    setFormData({ ...formData, horariosCultos: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Informações institucionais da igreja atualizadas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação Principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-indigo-900 text-white rounded-full flex items-center justify-center text-lg font-bold">
              ✝️
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-800">
                Dados Institucionais da Igreja
              </h2>
              <p className="text-xs text-gray-500">ID do Registro no Sistema: #{formData.idRegistro}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nome Oficial da Igreja
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pastor Titular / Líder
              </label>
              <input
                type="text"
                value={formData.pastorPrincipal}
                onChange={(e) => setFormData({ ...formData, pastorPrincipal: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                E-mail de Contato
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Telefone / WhatsApp da Secretaria
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Endereço Completo do Templo
              </label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Horários Oficiais dos Cultos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-gray-800">
                Horários Oficiais dos Cultos
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddSchedule}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Horário
            </button>
          </div>

          <div className="space-y-3">
            {formData.horariosCultos.map((culto, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200 items-center"
              >
                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-gray-500 font-semibold uppercase mb-0.5">
                    Dia
                  </label>
                  <input
                    type="text"
                    value={culto.dia}
                    onChange={(e) => handleScheduleChange(index, 'dia', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white text-gray-900 border border-gray-300 rounded text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-gray-500 font-semibold uppercase mb-0.5">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={culto.horario}
                    onChange={(e) => handleScheduleChange(index, 'horario', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white text-gray-900 border border-gray-300 rounded text-xs"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-[10px] text-gray-500 font-semibold uppercase mb-0.5">
                    Nome do Culto / Reunião
                  </label>
                  <input
                    type="text"
                    value={culto.titulo}
                    onChange={(e) => handleScheduleChange(index, 'titulo', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white text-gray-900 border border-gray-300 rounded text-xs"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(index)}
                    className="text-gray-400 hover:text-red-600 p-1.5"
                    title="Remover horário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dízimos & Ofertas / Redes Sociais */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-gray-800 pb-3 border-b border-gray-100">
            Dízimos, Ofertas &amp; Redes Sociais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                Chave PIX da Igreja
              </label>
              <input
                type="text"
                value={formData.chavePix}
                onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                Instagram Oficial
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                Canal do YouTube
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações do Perfil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
