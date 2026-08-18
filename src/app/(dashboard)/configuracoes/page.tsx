'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { dbService } from '@/features/shared/services/dbService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  KeyRound, 
  User, 
  Shield, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sliders, 
  Building,
  Info,
  Sparkles,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const { user, switchUserById } = useAuth();
  const { t, language } = useLanguage();

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Preferences
  const [notifyNewLeads, setNotifyNewLeads] = useState(true);
  const [notifyCollections, setNotifyCollections] = useState(true);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { text: '', color: '', percent: 0 };
    if (pass.length < 6) return { text: language === 'pt' ? 'Muito fraca (mínimo 6 dígitos)' : 'Weak (min 6 chars)', color: 'bg-rose-500 text-rose-600', percent: 25 };
    if (pass.length < 8) return { text: language === 'pt' ? 'Média' : 'Medium', color: 'bg-amber-500 text-amber-600', percent: 60 };
    return { text: language === 'pt' ? 'Forte e Segura' : 'Strong & Secure', color: 'bg-emerald-500 text-emerald-600', percent: 100 };
  };

  const strength = getPasswordStrength(newPassword);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileErrorMsg(language === 'pt' ? 'O nome não pode ficar em branco.' : 'Name cannot be blank.');
      return;
    }

    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);
    setIsUpdatingProfile(true);

    try {
      if (isSupabaseConfigured && supabase && user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ name: profileName.trim() })
          .eq('id', user.id);

        if (error) throw error;
      }
      setProfileSuccessMsg(language === 'pt' ? 'Perfil atualizado com sucesso!' : 'Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setProfileErrorMsg(err.message || (language === 'pt' ? 'Erro ao atualizar informações do perfil.' : 'Error updating profile info.'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (!currentPassword) {
      setPasswordErrorMsg(language === 'pt' ? 'Informe sua senha atual.' : 'Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg(language === 'pt' ? 'A nova senha deve ter no mínimo 6 caracteres.' : 'New password must have at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg(language === 'pt' ? 'A confirmação de senha não confere com a nova senha.' : 'Password confirmation does not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordErrorMsg(language === 'pt' ? 'A nova senha não pode ser igual à senha atual.' : 'New password cannot be the same as current password.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      if (!isSupabaseConfigured || !supabase || !user?.email) {
        throw new Error(language === 'pt' ? 'Serviço de autenticação não está disponível no momento.' : 'Authentication service unavailable.');
      }

      // 1. Re-authenticate to verify that current password is correct
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInErr) {
        throw new Error(language === 'pt' ? 'A senha atual informada está incorreta.' : 'Current password entered is incorrect.');
      }

      // 2. Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateErr) throw updateErr;

      setPasswordSuccessMsg(language === 'pt' ? 'Sua senha foi alterada com sucesso!' : 'Your password was changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      setPasswordErrorMsg(err.message || (language === 'pt' ? 'Falha ao alterar senha.' : 'Failed to change password.'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return t('role.superAdmin', 'Super Admin');
      case 'ADMIN': return t('role.admin', 'Administrador Geral');
      case 'BUYER': return t('role.buyer', 'Comercial & Compras');
      case 'LOGISTICS': return t('role.logistics', 'Logística & Operações');
      default: return role || 'Usuário';
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-[#2098D1] rounded-2xl">
              <Sliders size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('settings.title', 'Configurações & Perfil')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('settings.subtitle', 'Gerencie seus dados pessoais, preferências de alertas e segurança de acesso.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="dropdown" />
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Shield size={13} className="text-[#2098D1]" />
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Profile & Account Information */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Language Preference Card */}
          <Card className="!p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-[#2098D1]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('settings.languageTitle', 'Idioma do Sistema')}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {t('settings.languageSubtitle', 'Escolha o idioma de exibição para todas as telas do ERP.')}
            </p>

            <LanguageSelector variant="full" className="w-full justify-center" />
          </Card>

          <Card className="!p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-tr from-[#136F90] to-[#2098D1] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#2098D1]/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-3.5">{user?.name}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Nível de Acesso:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{getRoleLabel(user?.role)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Hub Regional:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">Sorocaba - SP</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> {language === 'pt' ? 'Ativo' : 'Active'}
                </span>
              </div>
            </div>
          </Card>

          {/* Preferences Card */}
          <Card className="!p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Bell size={15} className="text-[#2098D1]" />
              {t('settings.alertPreferences', 'Preferências de Alertas')}
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{t('settings.notifyLeads', 'Novos Leads e Prospecção')}</span>
                <input
                  type="checkbox"
                  checked={notifyNewLeads}
                  onChange={e => setNotifyNewLeads(e.target.checked)}
                  className="rounded text-[#2098D1] focus:ring-[#2098D1] h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{t('settings.notifyCollections', 'Agendamento de Coletas')}</span>
                <input
                  type="checkbox"
                  checked={notifyCollections}
                  onChange={e => setNotifyCollections(e.target.checked)}
                  className="rounded text-[#2098D1] focus:ring-[#2098D1] h-4 w-4"
                />
              </label>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile + Password Change */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Edit Personal Info */}
          <Card className="!p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <User size={18} className="text-[#2098D1]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Dados Pessoais</h2>
            </div>

            {profileSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                {profileSuccessMsg}
              </div>
            )}

            {profileErrorMsg && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Nome de Exibição"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">E-mail Corporativo</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl px-3.5 py-2.5 text-xs outline-none cursor-not-allowed font-mono"
                />
                <p className="text-[10px] text-slate-400">O e-mail de login corporativo é gerenciado pelo Super Admin.</p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2 text-xs font-bold"
                >
                  {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Card: Security & Password Change */}
          <Card className="!p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <KeyRound size={18} className="text-[#2098D1]" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Segurança & Alteração de Senha</h2>
                <p className="text-xs text-slate-400">Para atualizar sua senha, digite a senha atual e confirme a nova senha.</p>
              </div>
            </div>

            {passwordSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} />
                {passwordSuccessMsg}
              </div>
            )}

            {passwordErrorMsg && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={16} />
                {passwordErrorMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Senha Atual (Antiga) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    required
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#2098D1] focus:ring-1 focus:ring-[#2098D1] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nova Senha <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    required
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#2098D1] focus:ring-1 focus:ring-[#2098D1] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${strength.color.split(' ')[0]}`}
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${strength.color.split(' ')[1]}`}>
                      Força: {strength.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirmar Nova Senha <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Digite novamente a nova senha"
                    required
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#2098D1] focus:ring-1 focus:ring-[#2098D1] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-rose-500 font-bold">As senhas digitadas não coincidem.</p>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingPassword || (!!confirmPassword && newPassword !== confirmPassword)}
                  className="px-6 py-2.5 text-xs font-bold shadow-lg shadow-[#2098D1]/20"
                >
                  {isUpdatingPassword ? 'Atualizando Senha...' : 'Atualizar Minha Senha'}
                </Button>
              </div>

            </form>
          </Card>

        </div>

      </div>

    </div>
  );
}
