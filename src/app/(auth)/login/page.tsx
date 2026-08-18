'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setLocalError('Por favor, informe seu e-mail corporativo.');
      return;
    }
    if (!password) {
      setLocalError('Por favor, informe sua senha.');
      return;
    }

    setLocalError(null);
    setIsLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'SUPER_ADMIN' || loggedUser?.email?.toLowerCase().includes('adm@123.com')) {
        router.replace('/admin/painel');
      } else if (loggedUser?.role === 'BUYER') {
        router.replace('/prospeccao');
      } else if (loggedUser?.role === 'LOGISTICS') {
        router.replace('/logistica');
      } else {
        router.replace('/prospeccao');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao efetuar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-[#0E2439] flex flex-col justify-between overflow-hidden selection:bg-[#2098D1] selection:text-white font-sans">
      
      {/* 🌌 SOFT PULSING BLUE RADIAL GRADIENTS */}
      <div className="absolute -top-36 -left-36 w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(32,152,209,0.22)_0%,rgba(56,189,248,0.12)_45%,transparent_70%)] rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-40 -right-36 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(56,189,248,0.25)_0%,rgba(32,152,209,0.14)_45%,transparent_70%)] rounded-full blur-3xl pointer-events-none animate-pulse-slow-reverse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(32,152,209,0.09)_0%,rgba(14,165,233,0.03)_50%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle Micro-dot pattern overlay for high-end polish */}
      <div className="absolute inset-0 bg-[radial-gradient(#2098D1_1px,transparent_1px)] [background-size:36px_36px] opacity-[0.035] pointer-events-none" />

      {/* CENTER LOGIN CONTAINER */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-[400px] w-full flex flex-col items-center">
          
          {/* 🔘 LOGO OFICIAL IWRC */}
          <div className="mb-6 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/iwrc-logo.png" 
              alt="Logo iWrc" 
              className="h-24 md:h-28 w-auto object-contain select-none"
            />
          </div>

          {/* HEADLINE & SUBTITLE */}
          <div className="text-center mb-7 space-y-1.5">
            <h1 className="text-xl md:text-2xl font-black text-[#0E2439] tracking-tight">
              Sistema de Gestão de Geradores
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Acesse sua conta corporativa autenticada
            </p>
          </div>

          {/* ERROR ALERT BANNER */}
          {localError && (
            <div className="w-full mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-start gap-2.5 animate-fadeIn shadow-xs">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{localError}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            
            {/* EMAIL INPUT */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#2D536E] uppercase tracking-wider">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2098D1] transition-colors">
                  <Mail size={17} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@iwrc.com.br"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-xs border border-[#CCEAF1] rounded-2xl text-sm font-medium text-[#0E2439] placeholder:text-slate-400 outline-none focus:border-[#2098D1] focus:ring-3 focus:ring-[#2098D1]/15 transition-all shadow-[0_2px_8px_rgba(32,152,209,0.04)]"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-[#2D536E] uppercase tracking-wider">
                  Senha
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2098D1] transition-colors">
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-white/90 backdrop-blur-xs border border-[#CCEAF1] rounded-2xl text-sm font-medium text-[#0E2439] placeholder:text-slate-400 outline-none focus:border-[#2098D1] focus:ring-3 focus:ring-[#2098D1]/15 transition-all shadow-[0_2px_8px_rgba(32,152,209,0.04)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#2098D1] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-6 bg-gradient-to-r from-[#2098D1] to-[#1883B5] hover:from-[#1883B5] hover:to-[#126F9C] text-white text-sm font-black rounded-2xl shadow-lg shadow-[#2098D1]/25 hover:shadow-xl hover:shadow-[#2098D1]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 py-4 text-center border-t border-[#EAF5F8] bg-white/60 backdrop-blur-xs">
        <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck size={13} className="text-[#2098D1]" />
          iWrc ERP &bull; Autenticação Segura via Supabase
        </p>
      </footer>
    </div>
  );
}
