'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/features/shared/services/dbService';
import { Supplier, Collection, Receipt, SupplierTask, SupplierInteraction } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatVolume, translateLogText } from '@/lib/utils';
import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  Scale, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Plus,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Recycle,
  Truck
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';

export default function DashboardPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const fetchData = async () => {
    try {
      const [s, c, r] = await Promise.all([
        dbService.getSuppliers(),
        dbService.getCollections(),
        dbService.getReceipts()
      ]);
      setSuppliers(s);
      setCollections(c);
      setReceipts(r);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
        <div className="h-10 w-10 border-4 border-[#CDEAF1] border-t-[#2098D1] rounded-full animate-spin" />
        <p className="text-sm text-[#145772] font-bold">Carregando painel...</p>
      </div>
    );
  }

  // Operational Funnel / Pipeline Calculations
  const totalSuppliers = suppliers.length;
  const prospectingCount = suppliers.filter(s => !s.current_stage || s.current_stage === 'PROSPECTING').length;
  const qualificationCount = suppliers.filter(s => s.current_stage === 'QUALIFICATION').length;
  const logisticsCount = suppliers.filter(s => s.current_stage === 'LOGISTICS').length;
  const activeCount = suppliers.filter(s => s.current_stage === 'OPERATION' || (s as any).status === 'APPROVED').length;
  
  // Scheduled / In Progress Collections
  const pendingCollections = collections.filter(c => c.status === 'SCHEDULED' || c.status === 'IN_TRANSIT').length;

  // Processed Volume from Receipts
  let totalWeight = 0;
  receipts.forEach(r => {
    r.items?.forEach(i => {
      totalWeight += i.weight_kg;
    });
  });

  const pendingTasks: (SupplierTask & { supplierName: string })[] = [];
  suppliers.forEach(s => {
    s.tasks?.forEach(t => {
      if (t.status === 'pending') {
        pendingTasks.push({
          ...t,
          supplierName: s.name
        });
      }
    });
  });

  const allInteractions: (SupplierInteraction & { supplierName: string; supplierId: string })[] = [];
  suppliers.forEach(s => {
    s.interactions?.forEach(i => {
      allInteractions.push({
        ...i,
        supplierName: s.name,
        supplierId: s.id
      });
    });
  });

  const recentInteractions = allInteractions
    .sort((a, b) => {
      const dateA = new Date(`${a.interaction_date}T${a.interaction_time}`);
      const dateB = new Date(`${b.interaction_date}T${b.interaction_time}`);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const handleCompleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await dbService.completeSupplierTask(taskId, user.id);
      fetchData();
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const stagesList = [
    { key: 'PROSPECTING', label: language === 'pt' ? 'Prospecção Comercial' : 'Commercial Prospecting', count: prospectingCount, color: 'bg-slate-400' },
    { key: 'QUALIFICATION', label: language === 'pt' ? 'Qualificação' : 'Qualification', count: qualificationCount, color: 'bg-[#2098D1]' },
    { key: 'LOGISTICS', label: language === 'pt' ? 'Análise Logística' : 'Logistics Analysis', count: logisticsCount, color: 'bg-amber-500' },
    { key: 'DOCUMENTATION', label: language === 'pt' ? 'Documentação / MTR' : 'Documentation / MTR', count: suppliers.filter(s => s.current_stage === 'DOCUMENTATION').length, color: 'bg-sky-400' },
    { key: 'COLLECTION', label: language === 'pt' ? 'Em Coleta' : 'In Collection', count: suppliers.filter(s => s.current_stage === 'COLLECTION').length, color: 'bg-indigo-400' },
    { key: 'OPERATION', label: language === 'pt' ? 'Geradores Homologados' : 'Approved Generators', count: activeCount, color: 'bg-[#9ECE42]' }
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-[#0D2439] tracking-tight">
              {t('dashboard.title', 'Painel Operacional')}
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#E5F5F8] text-[#136F90] px-2.5 py-0.5 rounded-full border border-[#CCEAF1]">
              {language === 'pt' ? 'Visão Geral' : 'Overview'}
            </span>
          </div>
          <p className="text-[#3F6880] text-sm mt-1 font-medium">
            {language === 'pt' ? `Olá, ${user?.name}. Acompanhe a circularidade e o fluxo de geradores hoje.` : `Hello, ${user?.name}. Track waste circularity and generator pipeline today.`}
          </p>
        </div>
        
        {(user?.role === 'ADMIN' || user?.role === 'BUYER') && (
          <Link href="/fornecedores?new=true">
            <Button size="md" className="gap-2 shrink-0">
              <Plus size={16} />
              {t('action.newSupplier', 'Novo Gerador')}
            </Button>
          </Link>
        )}
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[#E5F5F8] text-[#2098D1] rounded-2xl flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'pt' ? 'Total de Leads / Geradores' : 'Total Leads / Generators'}
            </p>
            <h3 className="text-2xl font-black text-[#0D2439] mt-0.5">{totalSuppliers}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'pt' ? 'Em Negociação' : 'In Negotiation'}
            </p>
            <h3 className="text-2xl font-black text-[#0D2439] mt-0.5">{prospectingCount + qualificationCount}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[#E5F5F8] text-[#2098D1] rounded-2xl flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'pt' ? 'Coletas Programadas' : 'Scheduled Collections'}
            </p>
            <h3 className="text-2xl font-black text-[#0D2439] mt-0.5">{pendingCollections}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[#EBF7D4] text-[#48780E] rounded-2xl flex items-center justify-center shrink-0">
            <Recycle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {language === 'pt' ? 'Resíduos Processados' : 'Processed Waste'}
            </p>
            <h3 className="text-2xl font-black text-[#0D2439] mt-0.5">{formatVolume(totalWeight, 'kg')}</h3>
          </div>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Pipeline & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pipeline Funnel */}
          <Card>
            <h3 className="font-bold text-[#0D2439] text-sm uppercase tracking-wider flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-[#2098D1]" />
              {language === 'pt' ? 'Funil Operacional de Circularidade' : 'Circular Operational Funnel'}
            </h3>
            
            <div className="space-y-4">
              {stagesList.map((stage) => {
                const percentage = totalSuppliers > 0 ? (stage.count / totalSuppliers) * 100 : 0;
                return (
                  <div key={stage.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#2B4E63]">{stage.label}</span>
                      <span className="text-[#0D2439]">{stage.count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#E5F5F8] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <h3 className="font-bold text-[#0D2439] text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
              <ClipboardList size={16} className="text-[#2098D1]" />
              {language === 'pt' ? 'Tarefas & Pendências da Equipe' : 'Team Tasks & Pending Items'} ({pendingTasks.length})
            </h3>
            
            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                {language === 'pt' ? 'Nenhuma pendência ativa no momento. Operação em dia!' : 'No pending items at this time. Operations up to date!'}
              </div>
            ) : (
              <div className="divide-y divide-[#EBF5F8]">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#0D2439] leading-snug">{translateLogText(task.description, language)}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-bold text-[#2098D1]">{task.supplierName}</span>
                        {task.due_date && (
                          <>
                            <span>•</span>
                            <span>{language === 'pt' ? 'Prazo:' : 'Due:'} {formatDate(task.due_date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="inline-flex items-center gap-1 text-xs text-[#2098D1] hover:text-white hover:bg-[#2098D1] border border-[#CCEAF1] px-3 py-1.5 rounded-full transition-all font-bold cursor-pointer"
                    >
                      <CheckCircle2 size={12} />
                      {language === 'pt' ? 'Concluir' : 'Complete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Recent Activities */}
        <div>
          <Card className="h-full flex flex-col">
            <h3 className="font-bold text-[#0D2439] text-sm uppercase tracking-wider flex items-center gap-2 mb-6 shrink-0">
              <Sparkles size={16} className="text-[#2098D1]" />
              {language === 'pt' ? 'Atividades Recentes' : 'Recent Activities'}
            </h3>

            {recentInteractions.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-12 text-slate-400 text-sm">
                {language === 'pt' ? 'Nenhuma interação registrada recentemente.' : 'No recent interactions logged.'}
              </div>
            ) : (
              <div className="flex-1 space-y-5 overflow-y-auto">
                {recentInteractions.map((act) => (
                  <div key={act.id} className="relative pl-6 before:absolute before:left-2 before:top-1.5 before:bottom-0 before:w-0.5 before:bg-[#D5EEF4] last:before:hidden">
                    <div className="absolute left-0.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#2098D1] shadow-sm" />
                    
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <Link 
                          href={`/fornecedores/${act.supplierId}`}
                          className="text-xs font-bold text-[#0D2439] hover:text-[#2098D1] transition-all truncate"
                        >
                          {act.supplierName}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(act.interaction_date)}
                        </span>
                      </div>
                      <p className="text-xs text-[#486D82] line-clamp-2 leading-relaxed">
                        {translateLogText(act.description, language)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4 border-t border-[#E5F4F7] mt-5 text-center shrink-0">
              <Link href="/fornecedores" className="inline-flex items-center gap-1 text-xs text-[#2098D1] hover:underline font-bold">
                {language === 'pt' ? 'Ver todos os geradores' : 'View all generators'}
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
