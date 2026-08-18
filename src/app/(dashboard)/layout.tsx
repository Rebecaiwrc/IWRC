'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';

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
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
