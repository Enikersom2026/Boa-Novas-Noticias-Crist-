import React, { useState, useEffect } from 'react';
import {
  Church,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  Hash,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { ChurchProfile } from '../types';
import {
  saveChurchToFirestore,
  saveMemberToFirestore,
  getChurchFromFirestore,
} from '../lib/firestoreService';

interface PortalAccessSelectorProps {
  churchProfile: ChurchProfile;
  onSelectAdmin: (churchId?: string) => void;
  onSelectMember: (churchId?: string) => void;
  onRegisterChurch?: (newProfile: ChurchProfile) => void;
}

export const PortalAccessSelector: React.FC<PortalAccessSelectorProps> = ({
  churchProfile,
  onSelectAdmin,
  onSelectMember,
  onRegisterChurch,
}) => {
  // Mode: 'login' | 'cadastro' (igreja/admin) | 'cadastro-membro' (app do irmão)
  const [viewMode, setViewMode] = useState<'login' | 'cadastro' | 'cadastro-membro'>('login');

  // Sub-tabs in login mode: 'admin' | 'member'
  const [activeLoginMode, setActiveLoginMode] = useState<'admin' | 'member'>('member');

  // =========================================================================
  // ADMIN LOGIN STATES
  // =========================================================================
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // =========================================================================
  // MEMBER LOGIN STATES (Nome, E-mail, Senha obrigatórios)
  // =========================================================================
  const [membroLoginNome, setMembroLoginNome] = useState('');
  const [membroLoginEmail, setMembroLoginEmail] = useState('');
  const [membroLoginSenha, setMembroLoginSenha] = useState('');
  const [membroLoginIdIgreja, setMembroLoginIdIgreja] = useState('');
  const [showMembroLoginPassword, setShowMembroLoginPassword] = useState(false);
  const [membroLoginError, setMembroLoginError] = useState('');
  const [membroLoginLoading, setMembroLoginLoading] = useState(false);

  // =========================================================================
  // CADASTRO DA IGREJA STATES (Admin / Liderança) - ID Gerado Automaticamente
  // =========================================================================
  const [autoChurchId, setAutoChurchId] = useState(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );
  const [nomeIgreja, setNomeIgreja] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [adminNome, setAdminNome] = useState('');
  const [adminCadEmail, setAdminCadEmail] = useState('');
  const [adminCadSenha, setAdminCadSenha] = useState('');
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [copiedChurchId, setCopiedChurchId] = useState(false);

  // =========================================================================
  // CADASTRO DO MEMBRO STATES (Digita Nome, E-mail, ID da Igreja e Senha)
  // =========================================================================
  const [membroCadNome, setMembroCadNome] = useState('');
  const [membroCadEmail, setMembroCadEmail] = useState('');
  const [membroCadIdIgreja, setMembroCadIdIgreja] = useState('');
  const [membroCadSenha, setMembroCadSenha] = useState('');
  const [membroCadTermos, setMembroCadTermos] = useState(true);
  const [membroCadLoading, setMembroCadLoading] = useState(false);
  const [membroCadError, setMembroCadError] = useState('');
  const [showMembroCadPassword, setShowMembroCadPassword] = useState(false);

  // Gera um novo ID quando entra na tela de cadastro da igreja se estiver vazio
  useEffect(() => {
    if (viewMode === 'cadastro' && !autoChurchId) {
      setAutoChurchId(Math.floor(1000 + Math.random() * 9000).toString());
    }
  }, [viewMode, autoChurchId]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // 1. Submit Login Admin
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setAdminError('Por favor, informe seu e-mail de acesso.');
      return;
    }
    if (!adminPassword.trim() || adminPassword.length < 3) {
      setAdminError('Por favor, informe sua senha de acesso.');
      return;
    }

    setAdminLoading(true);

    setTimeout(() => {
      setAdminLoading(false);
      onSelectAdmin(churchProfile.idRegistro || autoChurchId);
    }, 350);
  };

  // 2. Submit Login Membro (Exige Nome, E-mail e Senha)
  const handleMemberLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMembroLoginError('');

    const nome = membroLoginNome.trim();
    const email = membroLoginEmail.trim();
    const senha = membroLoginSenha.trim();
    const targetChurchId = membroLoginIdIgreja.trim() || churchProfile.idRegistro || '1042';

    if (!nome) {
      setMembroLoginError('Por favor, informe o seu nome.');
      return;
    }
    if (!email || !email.includes('@')) {
      setMembroLoginError('Por favor, informe um e-mail válido.');
      return;
    }
    if (!senha) {
      setMembroLoginError('Por favor, digite a sua senha de acesso.');
      return;
    }
    if (senha.length < 4) {
      setMembroLoginError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setMembroLoginLoading(true);

    try {
      // Salva identificação do membro
      localStorage.setItem('igreja_member_name', nome);
      localStorage.setItem('igreja_member_email', email);
      localStorage.setItem('igreja_member_access_code', targetChurchId);
      localStorage.setItem('igreja_member_congregacao', targetChurchId);

      // Tenta buscar os dados da igreja do ID digitado
      try {
        const found = await getChurchFromFirestore(targetChurchId);
        if (found && onRegisterChurch) {
          onRegisterChurch(found);
        }
      } catch (err) {
        console.warn('Busca de igreja no Firestore fallback:', err);
      }

      setMembroLoginLoading(false);
      onSelectMember(targetChurchId);
    } catch (err) {
      console.error('Erro no login do membro:', err);
      setMembroLoginLoading(false);
      onSelectMember(targetChurchId);
    }
  };

  // 3. Submit Cadastro da Igreja (Admin)
  const handleChurchCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadastroLoading(true);

    const finalChurchId = autoChurchId || Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const updatedProfile: ChurchProfile = {
        ...churchProfile,
        nome: nomeIgreja.trim() || 'Igreja Local Cadastrada',
        cidade: cidade.trim() || churchProfile.cidade,
        estado: estado.trim().toUpperCase() || churchProfile.estado,
        pastorPrincipal: adminNome.trim() || churchProfile.pastorPrincipal,
        email: adminCadEmail.trim() || churchProfile.email,
        idRegistro: finalChurchId,
      };

      // Salva no Firestore
      await saveChurchToFirestore(updatedProfile);

      if (onRegisterChurch) {
        onRegisterChurch(updatedProfile);
      }

      try {
        localStorage.setItem('igreja_portal_profile', JSON.stringify(updatedProfile));
        localStorage.setItem('igreja_member_access_code', finalChurchId);
        localStorage.setItem('igreja_portal_posts', JSON.stringify([]));
        localStorage.setItem('igreja_prayer_requests', JSON.stringify([]));
      } catch {}

      setCadastroLoading(false);
      setCadastroSucesso(true);

      setTimeout(() => {
        onSelectAdmin(finalChurchId);
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar igreja:', error);
      const fallbackProfile: ChurchProfile = {
        ...churchProfile,
        nome: nomeIgreja.trim() || 'Igreja Local',
        cidade: cidade.trim() || 'Sua Cidade',
        estado: estado.trim().toUpperCase() || 'UF',
        pastorPrincipal: adminNome.trim() || 'Pastor(a) Titular',
        email: adminCadEmail.trim(),
        idRegistro: finalChurchId,
      };
      if (onRegisterChurch) onRegisterChurch(fallbackProfile);
      setCadastroLoading(false);
      setCadastroSucesso(true);
      setTimeout(() => {
        onSelectAdmin(finalChurchId);
      }, 2000);
    }
  };

  // 4. Submit Cadastro do Membro (Digita ID da Igreja ao invés de listar todas)
  const handleMemberCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMembroCadError('');

    const nome = membroCadNome.trim();
    const email = membroCadEmail.trim();
    const idIgreja = membroCadIdIgreja.trim();
    const senha = membroCadSenha.trim();

    if (!nome) {
      setMembroCadError('Digite seu nome completo.');
      return;
    }
    if (!email || !email.includes('@')) {
      setMembroCadError('Digite um e-mail válido.');
      return;
    }
    if (!idIgreja) {
      setMembroCadError('Digite o ID da Igreja / Congregação.');
      return;
    }
    if (!senha || senha.length < 4) {
      setMembroCadError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setMembroCadLoading(true);

    try {
      // Salva membro no Firestore
      await saveMemberToFirestore({
        nome,
        email,
        senha,
        igrejaId: idIgreja,
        igrejaNome: `Igreja Congregação #${idIgreja}`,
        createdAt: new Date().toISOString(),
      });

      // Salva localmente
      localStorage.setItem('igreja_member_name', nome);
      localStorage.setItem('igreja_member_email', email);
      localStorage.setItem('igreja_member_access_code', idIgreja);
      localStorage.setItem('igreja_member_congregacao', idIgreja);

      // Tenta buscar os dados da igreja do ID digitado
      try {
        const found = await getChurchFromFirestore(idIgreja);
        if (found && onRegisterChurch) {
          onRegisterChurch(found);
        }
      } catch {}

      setMembroCadLoading(false);
      onSelectMember(idIgreja);
    } catch (error) {
      console.error('Erro no cadastro do membro:', error);
      localStorage.setItem('igreja_member_name', nome);
      localStorage.setItem('igreja_member_email', email);
      localStorage.setItem('igreja_member_access_code', idIgreja);
      localStorage.setItem('igreja_member_congregacao', idIgreja);
      setMembroCadLoading(false);
      onSelectMember(idIgreja);
    }
  };

  const handleCopyGeneratedId = () => {
    navigator.clipboard.writeText(autoChurchId);
    setCopiedChurchId(true);
    setTimeout(() => setCopiedChurchId(false), 2500);
  };

  // =========================================================================
  // TELA 3: CADASTRO DO MEMBRO (SIMULADOR MOBILE / APP DO IRMÃO)
  // Substitui a lista de todas as igrejas por DIGITAR O ID DA IGREJA
  // =========================================================================
  if (viewMode === 'cadastro-membro') {
    return (
      <div className="bg-gray-950 flex justify-center items-center min-h-screen w-screen p-0 sm:p-4 selection:bg-indigo-600 selection:text-white">
        <div className="w-full sm:w-[412px] h-full sm:h-[846px] bg-white sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-4 sm:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
          {/* Top phone bar */}
          <div className="hidden sm:flex items-center justify-between px-6 pt-3 text-[10px] text-gray-400 font-medium bg-indigo-50/50">
            <span>9:41</span>
            <div className="w-16 h-3.5 bg-gray-900 rounded-full mx-auto" />
            <span>5G • 100%</span>
          </div>

          {/* Conteúdo do Formulário */}
          <main className="flex-1 overflow-y-auto px-6 py-6 sm:py-7 flex flex-col justify-between bg-gradient-to-b from-indigo-50/50 via-white to-white">
            {/* Topo: Logo & Boas Vindas */}
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-indigo-900 text-white font-bold rounded-2xl flex items-center justify-center text-2xl shadow-md mx-auto mb-2">
                ✝️
              </div>
              <h1 className="text-xl font-bold text-gray-900">Cadastro de Membro</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Conecte-se à sua congregação através do ID da sua igreja.
              </p>
            </div>

            {/* Alerta de Erro */}
            {membroCadError && (
              <div className="p-3 mb-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{membroCadError}</span>
              </div>
            )}

            {/* FORMULÁRIO */}
            <form onSubmit={handleMemberCadastroSubmit} className="space-y-3.5 flex-1">
              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seu Nome Completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={membroCadNome}
                    onChange={(e) => {
                      setMembroCadNome(e.target.value);
                      setMembroCadError('');
                    }}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seu E-mail <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={membroCadEmail}
                    onChange={(e) => {
                      setMembroCadEmail(e.target.value);
                      setMembroCadError('');
                    }}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              {/* 🔑 CAMPO CRÍTICO: DIGITAR O ID DA IGREJA (Substitui lista de todas as igrejas) */}
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wide">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ID da Igreja / Congregação</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-bold px-2 py-0.5 rounded-md">
                    Código Local
                  </span>
                </div>

                <div className="relative">
                  <Church className="absolute left-3 top-2.5 w-4 h-4 text-indigo-600" />
                  <input
                    type="text"
                    required
                    value={membroCadIdIgreja}
                    onChange={(e) => {
                      setMembroCadIdIgreja(e.target.value);
                      setMembroCadError('');
                    }}
                    placeholder="Ex: 1042 ou código do seu pastor"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white text-gray-900 font-semibold placeholder:font-normal placeholder:text-gray-400 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>

                <div className="flex items-start gap-1.5 text-[10px] text-indigo-700 leading-tight pt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    Ao digitar o ID, o aplicativo abrirá diretamente nas postagens, cultos e pedidos de oração da sua igreja.
                  </span>
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Crie uma Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type={showMembroCadPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={membroCadSenha}
                    onChange={(e) => {
                      setMembroCadSenha(e.target.value);
                      setMembroCadError('');
                    }}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMembroCadPassword(!showMembroCadPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    {showMembroCadPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Termos de Uso */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="termos-membro"
                  required
                  checked={membroCadTermos}
                  onChange={(e) => setMembroCadTermos(e.target.checked)}
                  className="accent-indigo-600 rounded mt-0.5 cursor-pointer"
                />
                <label htmlFor="termos-membro" className="text-[11px] text-gray-500 leading-tight cursor-pointer">
                  Concordo em me conectar à minha igreja local e receber atualizações da congregação.
                </label>
              </div>

              {/* Botão de Cadastro */}
              <button
                type="submit"
                disabled={
                  membroCadLoading ||
                  !membroCadNome.trim() ||
                  !membroCadEmail.trim() ||
                  !membroCadIdIgreja.trim() ||
                  !membroCadSenha.trim()
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{membroCadLoading ? 'Cadastrando e Conectando...' : 'Cadastrar e Abrir Aplicativo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Alternar para Login */}
            <div className="text-center pt-3 border-t border-gray-100 mt-3">
              <p className="text-xs text-gray-500">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setActiveLoginMode('member');
                  }}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Fazer Login
                </button>
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TELA 2: CADASTRO DA IGREJA (ADMIN / LIDERANÇA)
  // Adiciona AUTOMATICAMENTE o ID DA IGREJA
  // =========================================================================
  if (viewMode === 'cadastro') {
    return (
      <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center p-3 sm:p-6 selection:bg-indigo-600 selection:text-white">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px] animate-in fade-in zoom-in-95 duration-200">
          {/* LATERAL ESQUERDA: APRESENTAÇÃO */}
          <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-2.5 z-10">
              <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                ✝️
              </div>
              <span className="font-bold text-base tracking-wider uppercase text-indigo-200">
                Rede Gospel
              </span>
            </div>

            <div className="space-y-4 z-10 my-auto py-6">
              <h2 className="text-2xl font-bold leading-tight">
                Cadastre sua Igreja e receba seu ID exclusivo.
              </h2>
              <p className="text-sm text-indigo-200">
                Seu ID é gerado automaticamente e permite que todos os seus membros acessem sua congregação com praticidade.
              </p>

              {/* ID DESTAQUE NA LATERAL */}
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 space-y-1">
                <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">
                  ID Automático Gerado:
                </span>
                <div className="text-2xl font-black font-mono text-emerald-300">
                  #{autoChurchId}
                </div>
              </div>
            </div>

            <div className="text-xs text-indigo-400 z-10">
              &copy; {new Date().getFullYear()} Boas Novas App. Sistema de Gestão e Aplicativo Mobile.
            </div>
          </div>

          {/* LATERAL DIREITA: FORMULÁRIO DE CADASTRO */}
          <div className="col-span-1 md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
            {/* Header da Tela de Cadastro */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-5">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Church className="w-4 h-4" />
                <span>Cadastro da Igreja</span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-medium transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Login</span>
              </button>
            </div>

            {/* SUCESSO DO CADASTRO */}
            {cadastroSucesso ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2.5 font-bold text-base text-emerald-900">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Igreja Registrada com Sucesso!</span>
                </div>

                <p className="text-xs text-emerald-700 leading-relaxed">
                  O cadastro foi concluído e seu ID de congregação foi registrado.
                </p>

                {/* Bloco com o ID gerado para copiar */}
                <div className="p-3.5 bg-white border border-emerald-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">
                      ID da sua Congregação:
                    </span>
                    <span className="text-lg font-black font-mono text-emerald-800">
                      #{autoChurchId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyGeneratedId}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {copiedChurchId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedChurchId ? 'Copiado!' : 'Copiar ID'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-emerald-700">
                  📢 <strong>Importante:</strong> Compartilhe este ID (#{autoChurchId}) com os membros para que eles digitem no aplicativo mobile ao se cadastrar.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onSelectAdmin(autoChurchId)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Ir para o Painel Administrativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* FORMULÁRIO DE REGISTRO DA IGREJA COM ID AUTOMÁTICO */
              <form onSubmit={handleChurchCadastroSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Registrar Nova Congregação</h3>
                  <p className="text-xs text-gray-500">
                    Preencha as informações para criar o painel administrativo da sua igreja.
                  </p>
                </div>

                {/* 🌟 ID GERADO AUTOMATICAMENTE */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-indigo-600" />
                      ID da Igreja (Gerado Automaticamente)
                    </span>
                    <p className="text-[11px] text-indigo-700">
                      Os membros digitarão este código no app para abrir na sua congregação.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-600 text-white font-mono font-black text-sm rounded-lg shadow-sm">
                    #{autoChurchId}
                  </div>
                </div>

                {/* Dados da Igreja */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nome da Igreja / Denominação <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Church className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={nomeIgreja}
                        onChange={(e) => setNomeIgreja(e.target.value)}
                        placeholder="Ex: Igreja Batista Central - Sede"
                        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        placeholder="Ex: Palmas"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Estado (UF) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={estado}
                        onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        placeholder="Ex: TO"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do Administrador */}
                <div className="border-t border-gray-100 pt-3 space-y-3">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    Dados da Liderança Pastoral / Secretaria
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nome do Pastor / Responsável <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={adminNome}
                      onChange={(e) => setAdminNome(e.target.value)}
                      placeholder="Ex: Pr. André Roberto"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail de Acesso <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={adminCadEmail}
                          onChange={(e) => setAdminCadEmail(e.target.value)}
                          placeholder="pastor@igreja.org"
                          className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Criar Senha <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          required
                          minLength={4}
                          value={adminCadSenha}
                          onChange={(e) => setAdminCadSenha(e.target.value)}
                          placeholder="Mínimo 4 dígitos"
                          className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cadastroLoading || !nomeIgreja.trim() || !adminNome.trim() || !adminCadEmail.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center justify-center space-x-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  <span>{cadastroLoading ? 'Cadastrando Igreja...' : 'Finalizar Cadastro da Igreja'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Rodapé: Já tenho conta */}
                <div className="pt-2 text-center border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setActiveLoginMode('admin');
                    }}
                    className="text-xs text-gray-500 hover:text-indigo-600 transition cursor-pointer"
                  >
                    Já tem cadastro? <span className="font-semibold text-indigo-600 hover:underline">Fazer Login</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TELA 1: TELA DE LOGIN (PADRÃO)
  // Exige Nome, E-mail e Senha para abrir o Aplicativo do Membro
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Luzes de fundo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-80 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
            ✝️
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold block">
              Portal Eclesiástico
            </span>
            <h1 className="font-extrabold text-base sm:text-lg text-white leading-tight">
              {churchProfile.nome || 'Aplicativo da Igreja'}
            </h1>
          </div>
        </div>

        {churchProfile.idRegistro && (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 rounded-full border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-medium hidden sm:inline">Congregação #{churchProfile.idRegistro}</span>
            <span className="text-[11px] font-medium sm:hidden">#{churchProfile.idRegistro}</span>
          </div>
        )}
      </header>

      {/* Main Login Container */}
      <main className="w-full max-w-md my-auto py-4 z-10">
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-md">
          {/* Borda superior gradiente */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

          {/* Heading */}
          <div className="text-center space-y-1.5 mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-1">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Acesso ao Sistema
            </h2>
            <p className="text-xs text-slate-400">
              Escolha seu perfil para acessar a comunidade
            </p>
          </div>

          {/* Tabs: App do Membro vs Painel Admin */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveLoginMode('member');
                setMembroLoginError('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeLoginMode === 'member'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>App do Membro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveLoginMode('admin');
                setAdminError('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeLoginMode === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Painel Admin</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ABA 1: FORMULÁRIO DO MEMBRO (EXIGE NOME, E-MAIL E SENHA) */}
          {/* ========================================================================= */}
          {activeLoginMode === 'member' && (
            <form onSubmit={handleMemberLoginSubmit} className="space-y-3.5 animate-in fade-in duration-200">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-200 block">Identificação do Membro</span>
                  Digite seu nome, e-mail e senha para abrir seu aplicativo congregacional.
                </div>
              </div>

              {/* Nome do Membro (Obrigatório) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Seu Nome Completo <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={membroLoginNome}
                    onChange={(e) => {
                      setMembroLoginNome(e.target.value);
                      setMembroLoginError('');
                    }}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* E-mail do Membro (Obrigatório) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Seu E-mail <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={membroLoginEmail}
                    onChange={(e) => {
                      setMembroLoginEmail(e.target.value);
                      setMembroLoginError('');
                    }}
                    placeholder="carlos@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* ID da Igreja (Configura congregação automaticamente) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>ID da Congregação / Igreja</span>
                  {membroLoginIdIgreja && (
                    <span className="text-[10px] text-emerald-400 font-mono">#{membroLoginIdIgreja}</span>
                  )}
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={membroLoginIdIgreja}
                    onChange={(e) => {
                      setMembroLoginIdIgreja(e.target.value);
                      setMembroLoginError('');
                    }}
                    placeholder="Digite o ID da sua congregação"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Senha do Membro (Obrigatório) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sua Senha <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showMembroLoginPassword ? 'text' : 'password'}
                    required
                    value={membroLoginSenha}
                    onChange={(e) => {
                      setMembroLoginSenha(e.target.value);
                      setMembroLoginError('');
                    }}
                    placeholder="Digite sua senha"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMembroLoginPassword(!showMembroLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showMembroLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mensagem de Erro de Validação */}
              {membroLoginError && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{membroLoginError}</span>
                </div>
              )}

              {/* BOTÃO: ABRIR APLICATIVO DO MEMBRO (Só funciona com Nome, Email e Senha) */}
              <button
                type="submit"
                disabled={
                  membroLoginLoading ||
                  !membroLoginNome.trim() ||
                  !membroLoginEmail.trim() ||
                  !membroLoginSenha.trim()
                }
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {membroLoginLoading ? (
                  <span>Conectando à congregação...</span>
                ) : (
                  <>
                    <span>Abrir Aplicativo do Membro</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Link para Cadastro de Membro */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('cadastro-membro');
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-300 transition cursor-pointer"
                >
                  Novo na congregação? <span className="font-semibold text-emerald-400 hover:underline">Cadastre-se com o ID</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: FORMULÁRIO DO ADMINISTRADOR (PASTOR / MÍDIA) */}
          {/* ========================================================================= */}
          {activeLoginMode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-200 block">Acesso Pastoral &amp; Gestão</span>
                  Gerencie comunicados, cultos, eventos e pedidos de oração da igreja.
                </div>
              </div>

              {/* Email Admin */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail ou Usuário Administrativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="pastor@igreja.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Senha Admin */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chave de Acesso / Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="Digite sua senha de acesso"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Botão Admin */}
              <button
                type="submit"
                disabled={adminLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {adminLoading ? (
                  <span>Verificando credenciais...</span>
                ) : (
                  <>
                    <span>Entrar no Painel Administrativo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Link Cadastrar Nova Igreja */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('cadastro');
                  }}
                  className="text-xs text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  Quer cadastrar sua igreja? <span className="font-semibold text-indigo-400 hover:underline">Clique aqui</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="w-full max-w-4xl py-3 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 z-10">
        <p>© {new Date().getFullYear()} {churchProfile.nome || 'Aplicativo da Igreja'} • Todos os direitos reservados</p>
        <p className="flex items-center gap-1.5 text-slate-400">
          {churchProfile.cidade && churchProfile.estado && (
            <>
              <span>{churchProfile.cidade} - {churchProfile.estado}</span>
              <span>•</span>
            </>
          )}
          <span className="font-mono text-indigo-400">
            {churchProfile.idRegistro ? `ID da Igreja: #${churchProfile.idRegistro}` : 'Sistema de Gestão Ministerial'}
          </span>
        </p>
      </footer>
    </div>
  );
};
