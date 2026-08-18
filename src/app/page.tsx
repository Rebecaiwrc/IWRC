'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'BUYER') {
          router.replace('/prospeccao');
        } else if (user.role === 'LOGISTICS') {
          router.replace('/logistica');
        } else {
          router.replace('/prospeccao');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Carregando ERP iWrc...
        </p>
      </div>
    </div>
  );
}
