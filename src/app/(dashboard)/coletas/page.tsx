'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/features/shared/services/dbService';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Collection, Supplier } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  translateCollectionStatus, 
  getCollectionColor, 
  formatDate,
  formatVolume 
} from '@/lib/utils';
import { 
  Calendar, 
  User, 
  Truck, 
  ClipboardCheck, 
  Building2,
  FileCheck,
  Scale,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function CollectionsPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [c, s] = await Promise.all([
        dbService.getCollections(),
        dbService.getSuppliers()
      ]);
      setCollections(c);
      setSuppliers(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isBuyer = currentUser?.role === 'BUYER';

  const isResponsibleForSupplier = (s?: Supplier | null) => {
    if (!s || !currentUser) return false;
    if (!isBuyer) return true; // Admins and Logistics see everything
    return (
      s.internal_responsible_id === currentUser.id ||
      s.responsible?.id === currentUser.id ||
      (s.responsible?.email && currentUser.email && s.responsible.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (s.responsible?.name && currentUser.name && s.responsible.name.toLowerCase() === currentUser.name.toLowerCase()) ||
      (s.lead_source && currentUser.name && s.lead_source.toLowerCase().includes(currentUser.name.toLowerCase()))
    );
  };

  const visibleCollections = collections.filter(c => {
    const sup = c.supplier || suppliers.find(s => s.id === c.supplier_id);
    return isResponsibleForSupplier(sup);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          {language === 'pt' ? 'Carregando coletas...' : 'Loading collections...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {t('collections.title', 'Programação de Coletas')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('collections.subtitle', 'Acompanhe as coletas programadas e realize o recebimento dos materiais.')}
          </p>
        </div>

        {/* User Scope Badge */}
        <div className="flex items-center gap-2">
          {isBuyer ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              <UserCheck size={14} />
              {language === 'pt' ? 'Visão: Meus Processos de Compras' : 'View: My Buying Leads'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <ShieldCheck size={14} />
              {language === 'pt' ? 'Visão: Geral do Hub (Todos)' : 'View: Hub Global (All)'}
            </span>
          )}
        </div>
      </div>

      {/* Collections list */}
      <Card className="overflow-hidden !p-0 border border-slate-200 dark:border-slate-800 shadow-sm">
        {visibleCollections.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {language === 'pt' ? 'Nenhuma coleta cadastrada para o seu usuário.' : 'No collections registered for your account.'}
          </div>
        ) : (
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">{t('collections.colDate', 'Data Prevista')}</th>
                  <th className="px-6 py-4">{t('collections.colGenerator', 'Gerador / Fornecedor')}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'Materiais Previstos' : 'Expected Materials'}</th>
                  <th className="px-6 py-4">{t('collections.colStatus', 'Status')}</th>
                  <th className="px-6 py-4">{t('collections.colVehicle', 'Operação (Motorista/Frete)')}</th>
                  <th className="px-6 py-4 text-right">{t('suppliers.actions', 'Ação')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-white">{formatDate(col.scheduled_date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Building2 size={15} className="text-[#2098D1]" />
                        <Link 
                          href={`/fornecedores/${col.supplier_id}`}
                          className="hover:text-[#2098D1] transition-colors"
                        >
                          {col.supplier?.name || 'Fornecedor'}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {col.items && col.items.length > 0 ? (
                          col.items.map((item, idx) => (
                            <span key={idx} className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-md mr-1 font-medium">
                              {item.material_name} ({item.estimated_volume} {item.unit})
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-xs">
                            {language === 'pt' ? 'Resíduos gerais' : 'General waste'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getCollectionColor(col.status) as any}>
                        {translateCollectionStatus(col.status, language)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 space-y-0.5">
                      <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <Truck size={13} className="text-slate-400" />
                        {col.carrier_name || (language === 'pt' ? 'Frota iWrc' : 'iWrc Fleet')}
                      </p>
                      {col.driver_name && (
                        <p className="flex items-center gap-1.5 text-slate-400">
                          <User size={13} />
                          {col.driver_name}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {col.status === 'SCHEDULED' || col.status === 'IN_TRANSIT' ? (
                        <Link href={`/recebimentos?collectionId=${col.id}`}>
                          <Button size="sm" className="gap-1.5 text-xs font-bold bg-[#2098D1] hover:bg-[#1b82b3] text-white">
                            <Scale size={14} />
                            {language === 'pt' ? 'Receber na Balança' : 'Weigh & Receive'}
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <FileCheck size={14} />
                          {language === 'pt' ? 'Concluída' : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}
