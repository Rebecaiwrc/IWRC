'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  KeyRound, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock
} from 'lucide-react';

export function ForcePasswordChangeModal() {
  const { user, markPasswordChanged } = useAuth();
  const { language } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If user does not need to change password, render nothing
  if (!user || !user.must_change_password) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew) {
      setErrorMsg(
        language === 'pt'
          ? 'Por favor, digite sua nova senha.'
          : 'Please enter your new password.'
      );
      return;
    }

    if (cleanNew.length < 6) {
      setErrorMsg(
        language === 'pt'
          ? 'A nova senha deve possuir no mínimo 6 caracteres.'
          : 'New password must be at least 6 characters.'
      );
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMsg(
        language === 'pt'
          ? 'A confirmação de senha não confere com a nova senha.'
          : 'Password confirmation does not match.'
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Update in client Supabase session if configured
      if (isSupabaseConfigured && supabase) {
        const { error: updateErr } = await supabase.auth.updateUser({
          password: cleanNew,
          data: { must_change_password: false }
        });

        if (updateErr) {
          throw updateErr;
        }

        // Try updating profiles table directly
        try {
          await supabase
            .from('profiles')
            .update({ must_change_password: false })
            .eq('id', user.id);
        } catch {
          // Ignore if column doesn't exist
        }
      }

      // 2. Also notify backend API
      try {
        await fetch('/api/auth/complete-password-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            newPassword: cleanNew
          })
        });
      } catch (apiErr) {
        console.warn('Backend complete-password-change notification:', apiErr);
      }

      setSuccess(true);
      setTimeout(() => {
        markPasswordChanged();
      }, 1500);
    } catch (err: any) {
      console.error('Error changing initial password:', err);
      setErrorMsg(
        err.message ||
          (language === 'pt'
            ? 'Ocorreu um erro ao redefinir a senha. Tente novamente.'
            : 'An error occurred while resetting the password. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header Badge & Icon */}
        <div className="flex items-center gap-3.5">
          <div className="h-13 w-13 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <KeyRound size={26} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 mb-1">
              <ShieldAlert size={12} />
              {language === 'pt' ? 'Primeiro Acesso — Ação Obrigatória' : 'First Login — Mandatory Action'}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {language === 'pt' ? 'Defina sua Nova Senha' : 'Set Your New Password'}
            </h2>
          </div>
        </div>

        {/* Informative Explanation */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {language === 'pt' ? (
            <>
              Olá, <strong className="text-slate-900 dark:text-white">{user.name}</strong>! Como sua conta foi criada recentemente pelo administrador com uma senha inicial padrão, por políticas de segurança é obrigatório cadastrar uma nova senha pessoal para continuar.
            </>
          ) : (
            <>
              Hello, <strong className="text-slate-900 dark:text-white">{user.name}</strong>! Because your account was recently created by the administrator with a default initial password, you must set a new personal password to continue.
            </>
          )}
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>
              {language === 'pt'
                ? 'Senha alterada com sucesso! Liberando acesso ao ERP...'
                : 'Password changed successfully! Unlocking ERP access...'}
            </span>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'pt' ? 'Nova Senha Pessoal *' : 'New Personal Password *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={language === 'pt' ? 'Mínimo 6 caracteres...' : 'Minimum 6 characters...'}
                  disabled={loading}
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium dark:text-white"
                />
                <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'pt' ? 'Confirme a Nova Senha *' : 'Confirm New Password *'}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={language === 'pt' ? 'Repita a nova senha...' : 'Repeat new password...'}
                  disabled={loading}
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium dark:text-white"
                />
                <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {language === 'pt' ? 'Salvando nova senha...' : 'Saving new password...'}
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    {language === 'pt' ? 'Salvar Nova Senha e Acessar' : 'Save New Password & Access'}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
