'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/features/shared/services/dbService';
import { Collection } from '@/types';
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
  Scale
} from 'lucide-react';
import Link from 'next/link';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const c = await dbService.getCollections();
      setCollections(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Carregando coletas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 leading-tight">Programação de Coletas</h1>
        <p className="text-slate-500 text-sm mt-1">Acompanhe as coletas programadas e realize o recebimento dos materiais.</p>
      </div>

      {/* Collections list */}
      <Card className="overflow-hidden !p-0 border border-slate-200 dark:border-slate-800">
        {collections.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            Nenhuma coleta cadastrada.
          </div>
        ) : (
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Data Prevista</th>
                  <th className="px-6 py-4">Fornecedor</th>
                  <th className="px-6 py-4">Materiais Previstos</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Operação (Motorista/Frete)</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-900">{formatDate(col.scheduled_date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building2 size={12} className="text-slate-400" />
                        <Link href={`/fornecedores/${col.supplier_id}`} className="hover:text-emerald-600 hover:underline">
                          {col.supplier?.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        {col.items?.map((item, idx) => (
                          <span key={idx} className="text-xs text-slate-650">
                            {item.material_name} ({formatVolume(item.estimated_volume, item.unit)})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getCollectionColor(col.status)}>
                        {translateCollectionStatus(col.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 space-y-0.5">
                      {col.driver_name && (
                        <div className="flex items-center gap-1">
                          <User size={10} />
                          <span>Motorista: {col.driver_name}</span>
                        </div>
                      )}
                      {col.carrier_name && (
                        <div className="flex items-center gap-1">
                          <Truck size={10} />
                          <span>Frete: {col.carrier_name}</span>
                        </div>
                      )}
                      {!col.driver_name && !col.carrier_name && <span>Não informado</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {col.status !== 'COMPLETED' && col.status !== 'CANCELLED' ? (
                        <Link href={`/recebimentos?collectionId=${col.id}`}>
                          <button className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-white hover:bg-emerald-650 border border-emerald-250 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer">
                            <Scale size={12} />
                            Registrar Recebimento
                          </button>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-slate-400 text-xs font-semibold">
                          <FileCheck size={14} className="text-emerald-500" />
                          <span>Pesado em Balança</span>
                        </div>
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
