import React, { useState, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Star,
  Calendar,
  Clock,
  MapPin,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  UploadCloud,
  BellRing,
  Volume2,
} from 'lucide-react';
import { ChurchPost, PostType } from '../types';
import { PRESET_IMAGE_GALLERY } from '../data/initialPosts';

interface PublishPostViewProps {
  churchProfile?: {
    idRegistro: string;
    nome: string;
    pastorPrincipal: string;
  };
  onPublish: (
    post: Omit<ChurchPost, 'id' | 'createdAt' | 'visualizacoes' | 'likes'>,
    options?: { sendPushNotification: boolean }
  ) => void;
  onCancel: () => void;
  onPreviewInApp: (tempPost: Partial<ChurchPost>) => void;
}

export const PublishPostView: React.FC<PublishPostViewProps> = ({
  churchProfile,
  onPublish,
  onCancel,
  onPreviewInApp,
}) => {
  const [tipo, setTipo] = useState<PostType>('noticia');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [horarioEvento, setHorarioEvento] = useState('');
  const [localEvento, setLocalEvento] = useState('Templo Principal');
  const [categoria, setCategoria] = useState('Geral');
  const [imagemCapa, setImagemCapa] = useState('');
  const [destaqueCarrossel, setDestaqueCarrossel] = useState(false);
  const [enviarPushNotification, setEnviarPushNotification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const churchId = churchProfile?.idRegistro || '1042';
  const churchName = churchProfile?.nome || 'Minha Igreja';
  const pastorName = churchProfile?.pastorPrincipal || 'Liderança';

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToastMessage({
        type: 'error',
        text: 'Por favor, envie um arquivo de imagem válido (PNG ou JPG).',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagemCapa(e.target.result as string);
        setToastMessage({
          type: 'success',
          text: 'Imagem de capa carregada com sucesso!',
        });
        setTimeout(() => setToastMessage(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setToastMessage({
        type: 'error',
        text: 'Por favor, informe o título em destaque.',
      });
      return;
    }

    if (tipo === 'evento' && !dataEvento) {
      setToastMessage({
        type: 'error',
        text: 'Por favor, selecione a data do evento.',
      });
      return;
    }

    if (!conteudo.trim()) {
      setToastMessage({
        type: 'error',
        text: 'Por favor, insira o texto completo da publicação.',
      });
      return;
    }

    setIsSubmitting(true);

    // Fallback default image if none chosen
    const finalImage =
      imagemCapa ||
      (tipo === 'evento'
        ? 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80'
        : 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80');

    setTimeout(() => {
      onPublish(
        {
          tipo,
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          dataEvento: tipo === 'evento' ? dataEvento : undefined,
          horarioEvento: tipo === 'evento' ? horarioEvento || '19:30' : undefined,
          localEvento: tipo === 'evento' ? localEvento : undefined,
          categoria,
          imagemCapa: finalImage,
          destaqueCarrossel,
          igrejaId: churchId,
          autor: pastorName,
          autorCargo: 'Administrador',
          status: 'publicado',
        },
        { sendPushNotification: enviarPushNotification }
      );
      setIsSubmitting(false);
    }, 600);
  };

  const currentPreviewData: Partial<ChurchPost> = {
    tipo,
    titulo: titulo || 'Título da Publicação',
    conteudo: conteudo || 'Conteúdo da publicação aparecerá aqui no aplicativo dos membros.',
    dataEvento: tipo === 'evento' ? dataEvento || new Date().toISOString().split('T')[0] : undefined,
    horarioEvento: tipo === 'evento' ? horarioEvento || '19:30' : undefined,
    localEvento: tipo === 'evento' ? localEvento : undefined,
    imagemCapa:
      imagemCapa ||
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    destaqueCarrossel,
    categoria,
    autor: pastorName,
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center justify-between text-sm transition-all shadow-sm ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Publishing Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6"
      >
        {/* Top bar with quick Preview in App button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Formulário Oficial de Publicação
            </span>
            <p className="text-xs text-gray-500">{churchName} (ID: #{churchId})</p>
          </div>
          <button
            type="button"
            onClick={() => onPreviewInApp(currentPreviewData)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition cursor-pointer"
            title="Simular visualização no celular"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ver Prévia no Celular</span>
          </button>
        </div>

        {/* 1. Tipo de Publicação */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tipo de Publicação
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <label
              className={`flex items-center justify-center p-3 sm:p-3.5 rounded-lg cursor-pointer font-medium transition ${
                tipo === 'noticia'
                  ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                  : 'border border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value="noticia"
                checked={tipo === 'noticia'}
                onChange={() => setTipo('noticia')}
                className="mr-2.5 accent-indigo-600 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm">📰 Nova Notícia</span>
            </label>

            <label
              className={`flex items-center justify-center p-3 sm:p-3.5 rounded-lg cursor-pointer font-medium transition ${
                tipo === 'evento'
                  ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                  : 'border border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value="evento"
                checked={tipo === 'evento'}
                onChange={() => setTipo('evento')}
                className="mr-2.5 accent-indigo-600 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm">📅 Novo Evento / Culto</span>
            </label>
          </div>
        </div>

        {/* 2. Título da Notícia */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700">
              Título em Destaque
            </label>
            <span
              className={`text-xs font-mono ${
                titulo.length > 50 ? 'text-amber-600 font-bold' : 'text-gray-400'
              }`}
            >
              {titulo.length}/60 caracteres
            </span>
          </div>
          <input
            type="text"
            id="titulo"
            name="titulo"
            maxLength={60}
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Grande Culto de Jovens neste Sábado"
            className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Máximo de 60 caracteres (Ideal para os cards do aplicativo móvel).
          </p>
        </div>

        {/* 3. Campo Condicional de Data (Apenas para Eventos) */}
        {tipo === 'evento' && (
          <div
            id="campo-data-evento"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50/50 p-4 sm:p-5 rounded-lg border border-indigo-100 transition-all"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Data do Evento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required={tipo === 'evento'}
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Horário de Início
              </label>
              <input
                type="time"
                value={horarioEvento}
                onChange={(e) => setHorarioEvento(e.target.value)}
                placeholder="19:30"
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Local / Sala
              </label>
              <input
                type="text"
                value={localEvento}
                onChange={(e) => setLocalEvento(e.target.value)}
                placeholder="Templo Principal"
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm placeholder:text-gray-400"
              />
            </div>
          </div>
        )}

        {/* Categoria / Ministério */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Categoria / Ministério
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Geral',
              'Culto & Celebração',
              'Ação Social',
              'Jovens',
              'Família & Casais',
              'Ensino & EBD',
              'Infantil / Kids',
              'Oração',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoria(cat)}
                className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer ${
                  categoria === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Corpo / Conteúdo */}
        <div>
          <label htmlFor="conteudo" className="block text-sm font-semibold text-gray-700 mb-1">
            Texto Completo da Notícia
          </label>
          <textarea
            id="conteudo"
            name="conteudo"
            rows={6}
            required
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Escreva aqui todas as informações detalhadas sobre a postagem..."
            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm placeholder:text-gray-400"
          />
        </div>

        {/* 5. Upload de Imagem de Capa */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-gray-700">
              Imagem de Capa (Banner)
            </label>
            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Escolher da Galeria Temática
            </button>
          </div>

          {imagemCapa ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-300 group">
              <img
                src={imagemCapa}
                alt="Banner de Capa"
                className="w-full h-48 sm:h-56 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-md shadow hover:bg-gray-100 transition"
                >
                  Trocar Imagem
                </button>
                <button
                  type="button"
                  onClick={() => setImagemCapa('')}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md shadow hover:bg-red-700 transition"
                >
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center transition cursor-pointer ${
                isDragOver
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 text-center">
                Clique para fazer upload ou arraste a imagem
              </p>
              <p className="text-xs text-gray-400 mt-1 text-center">
                Formatos suportados: PNG, JPG (Proporção sugerida 16:9)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                name="imagem_capa"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* 6. Controle do Carrossel (Destaque Principal) */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex space-x-3 items-start pr-4">
            <Star className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0 fill-yellow-500" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                Destacar no Carrossel Principal?
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Se ativado, esta notícia vai rodar no banner rotativo no topo do app dos irmãos.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              name="destaque_carrossel"
              checked={destaqueCarrossel}
              onChange={(e) => setDestaqueCarrossel(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
        </div>

        {/* 7. Notificação Push Instantânea para os Membros */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex space-x-3 items-start pr-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-indigo-950">
                  Enviar Notificação Push Instantânea?
                </p>
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                Dispara um alerta com som no celular e navegador de todos os membros e visitantes cadastrados nesta congregação.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enviarPushNotification}
              onChange={(e) => setEnviarPushNotification(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* 8. Botão Oculto de Proteção (Injeta o ID no Backend) */}
        <input type="hidden" name="igreja_id" value={churchId} />

        {/* 9. Botões de Ação */}
        <div className="flex items-center justify-end space-x-3 sm:space-x-4 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publicar Agora</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de Escolha da Galeria Temática */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-800">
                  Galeria de Banners Temáticos
                </h3>
              </div>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Selecione uma imagem de alta resolução otimizada para o aplicativo da igreja:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {PRESET_IMAGE_GALLERY.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setImagemCapa(img.url);
                    setShowGalleryModal(false);
                    setToastMessage({
                      type: 'success',
                      text: `Imagem "${img.title}" selecionada!`,
                    });
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-600 cursor-pointer shadow-xs hover:shadow-md transition"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="p-2 bg-white">
                    <p className="text-xs font-medium text-gray-800 truncate">{img.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
