'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF7FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-[#C8EEF5] border-t-[#2098D1] rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#146482]">Carregando painel iWrc...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#EAF7FA] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Utility Bar */}
        <header className="sticky top-0 z-30 bg-[#EAF7FA]/80 backdrop-blur-md px-6 py-3 border-b border-[#D8EFF5]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-[#146482] uppercase tracking-wider">
              iWrc Economia Circular • Hub Sorocaba
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="dropdown" />
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
