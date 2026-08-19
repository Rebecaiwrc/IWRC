'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '@/features/shared/services/dbService';
import { 
  Supplier, 
  Collection, 
  Receipt, 
  SupplierTask, 
  SupplierInteraction, 
  MaterialDispatch, 
  Profile 
} from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  formatDate, 
  formatVolume, 
  formatCurrency, 
  translateLogText, 
  getLogisticsSlaInfo,
  translateMaterialName
} from '@/lib/utils';
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
  Truck,
  Users,
  Award,
  AlertTriangle,
  ShieldCheck,
  Target,
  ArrowUpRight,
  BarChart3,
  Layers,
  UserCheck,
  PackageCheck,
  Send,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';

export default function DashboardPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [dispatches, setDispatches] = useState<MaterialDispatch[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hub' | 'performance'>('hub');
  
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const fetchData = async () => {
    try {
      const [s, c, r, d, p] = await Promise.all([
        dbService.getSuppliers(),
        dbService.getCollections(),
        dbService.getReceipts(),
        dbService.getMaterialDispatches(),
        dbService.getProfiles()
      ]);
      setSuppliers(s);
      setCollections(c);
      setReceipts(r);
      setDispatches(d);
      setProfiles(p);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 1. CORE OPERATIONAL METRICS (VISÃO GERAL DO HUB) ---
  
  // 1.1 Total de empresas em Prospecção (Leads nas etapas comerciais)
  const prospectingCount = useMemo(() => {
    return suppliers.filter(s => 
      !s.current_stage || 
      s.current_stage === 'PROSPECTING' || 
      s.current_stage === 'QUALIFICATION' ||
      s.prospecting_status === 'NEW_LEAD' ||
      s.prospecting_status === 'FIRST_CONTACT' ||
      s.prospecting_status === 'PRESENTATION_SENT' ||
      s.prospecting_status === 'QUALIFIED'
    ).filter(s => !['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage)).length;
  }, [suppliers]);

  // 1.2 Total de Geradores (Homologados / Operacionais)
  const totalGeneratorsCount = useMemo(() => {
    return suppliers.filter(s => ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage)).length;
  }, [suppliers]);

  // 1.3 Quantidade de coletas realizadas (Completadas com sucesso)
  const completedCollectionsCount = useMemo(() => {
    return collections.filter(c => c.status === 'COMPLETED').length;
  }, [collections]);

  // Total de coletas agendadas/em trânsito
  const scheduledCollectionsCount = useMemo(() => {
    return collections.filter(c => c.status === 'SCHEDULED' || c.status === 'IN_TRANSIT').length;
  }, [collections]);

  // 1.4 Quantidade total, em kg, de materiais disponíveis no Hub (Saldo = Recebidos - Expedidos)
  const totalReceivedKg = useMemo(() => {
    return receipts.reduce((acc, r) => {
      const net = r.items ? r.items.reduce((sum, it) => sum + (Number(it.weight_kg) || 0), 0) : 0;
      return acc + net;
    }, 0);
  }, [receipts]);

  const totalDispatchedKg = useMemo(() => {
    return dispatches.reduce((acc, d) => acc + (Number(d.quantity_kg) || 0), 0);
  }, [dispatches]);

  const totalHubStockKg = Math.max(0, totalReceivedKg - totalDispatchedKg);

  // 1.5 Distribuição de materiais disponíveis no Hub (em kg) por tipo
  const materialsStockBreakdown = useMemo(() => {
    const receivedByMat: Record<string, number> = {};
    const dispatchedByMat: Record<string, number> = {};

    receipts.forEach(r => {
      r.items?.forEach(it => {
        const name = (it.material_name || 'Outros').trim();
        receivedByMat[name] = (receivedByMat[name] || 0) + (Number(it.weight_kg) || 0);
      });
    });

    dispatches.forEach(d => {
      const name = (d.material_name || 'Outros').trim();
      dispatchedByMat[name] = (dispatchedByMat[name] || 0) + (Number(d.quantity_kg) || 0);
    });

    // Merge all known material types
    const allMatNames = Array.from(new Set([...Object.keys(receivedByMat), ...Object.keys(dispatchedByMat)]));
    
    const list = allMatNames.map(name => {
      const rec = receivedByMat[name] || 0;
      const disp = dispatchedByMat[name] || 0;
      const stock = Math.max(0, rec - disp);
      return {
        name,
        receivedKg: rec,
        dispatchedKg: disp,
        stockKg: stock
      };
    }).filter(m => m.receivedKg > 0 || m.stockKg > 0);

    // Sort by stock descending
    list.sort((a, b) => b.stockKg - a.stockKg);

    return list;
  }, [receipts, dispatches]);

  // Stages breakdown for Circular Funnel
  const stagesList = useMemo(() => {
    const total = suppliers.length || 1;
    const stages = [
      { key: 'PROSPECTING', label: language === 'pt' ? 'Prospecção Comercial' : 'Commercial Prospecting', count: prospectingCount, color: 'bg-slate-400' },
      { key: 'LOGISTICS', label: language === 'pt' ? 'Análise Logística' : 'Logistics Analysis', count: suppliers.filter(s => s.current_stage === 'LOGISTICS').length, color: 'bg-amber-500' },
      { key: 'DOCUMENTATION', label: language === 'pt' ? 'Documentação & MTR' : 'Documentation & MTR', count: suppliers.filter(s => s.current_stage === 'DOCUMENTATION').length, color: 'bg-sky-400' },
      { key: 'COLLECTION', label: language === 'pt' ? 'Preparação de Coleta' : 'Collection Prep', count: suppliers.filter(s => s.current_stage === 'COLLECTION').length, color: 'bg-indigo-400' },
      { key: 'OPERATION', label: language === 'pt' ? 'Geradores Homologados' : 'Approved Generators', count: suppliers.filter(s => s.current_stage === 'OPERATION' || (s as any).status === 'APPROVED').length, color: 'bg-[#9ECE42]' }
    ];
    return stages.map(s => ({
      ...s,
      percentage: Math.round((s.count / total) * 100)
    }));
  }, [suppliers, prospectingCount, language]);

  // Pending Tasks
  const pendingTasks = useMemo(() => {
    const list: (SupplierTask & { supplierName: string })[] = [];
    suppliers.forEach(s => {
      s.tasks?.forEach(t => {
        if (t.status === 'pending') {
          list.push({
            ...t,
            supplierName: s.name
          });
        }
      });
    });
    return list;
  }, [suppliers]);

  // Recent Interactions Log
  const recentInteractions = useMemo(() => {
    const list: (SupplierInteraction & { supplierName: string; supplierId: string })[] = [];
    suppliers.forEach(s => {
      s.interactions?.forEach(i => {
        list.push({
          ...i,
          supplierName: s.name,
          supplierId: s.id
        });
      });
    });
    return list
      .sort((a, b) => {
        const dateA = new Date(`${a.interaction_date}T${a.interaction_time}`);
        const dateB = new Date(`${b.interaction_date}T${b.interaction_time}`);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [suppliers]);

  const handleCompleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await dbService.completeSupplierTask(taskId, user.id);
      fetchData();
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  // --- 2. GESTÃO, PERFORMANCE & RH METRICS (EXCLUSIVO ADMIN / GESTÃO) ---
  
  // 2.1 Desempenho por Comprador (Área Comercial - apenas perfil BUYER)
  const buyerPerformance = useMemo(() => {
    const buyers = profiles.filter(p => p.role === 'BUYER');
    
    return buyers.map(buyer => {
      // Leads assigned or created by this buyer
      const userSuppliers = suppliers.filter(s => 
        s.internal_responsible_id === buyer.id ||
        s.responsible?.id === buyer.id ||
        (s.responsible?.name && s.responsible.name.toLowerCase() === buyer.name.toLowerCase()) ||
        (s.lead_source && s.lead_source.toLowerCase().includes(buyer.name.toLowerCase()))
      );

      // Quantidade de empresas encontradas e cadastradas
      const totalRegistered = userSuppliers.length;

      // Quantidade de processos enviados por Compras para a Logística
      const sentToLogistics = userSuppliers.filter(s => 
        s.current_stage === 'LOGISTICS' || 
        s.prospecting_status === 'WAITING_LOGISTICS' ||
        (s.logistics_analyses && s.logistics_analyses.length > 0) ||
        ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage)
      ).length;

      // Quantos desses processos se tornaram efetivamente Geradores
      const convertedGenerators = userSuppliers.filter(s => 
        ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage)
      ).length;

      // Taxa de conversão (% prospecção -> gerador)
      const conversionRate = totalRegistered > 0 ? Math.round((convertedGenerators / totalRegistered) * 100) : 0;

      return {
        buyer,
        totalRegistered,
        sentToLogistics,
        convertedGenerators,
        conversionRate
      };
    }).sort((a, b) => b.totalRegistered - a.totalRegistered);
  }, [profiles, suppliers]);

  // 2.2 Desempenho da Área de Logística (Gabs & Equipe Operacional)
  const logisticsPerformance = useMemo(() => {
    // All suppliers that passed or are in logistics
    const inLogisticsQueue = suppliers.filter(s => s.current_stage === 'LOGISTICS');

    // Total de processos analisados e respondidos pela Logística
    const allEvaluatedSuppliers = suppliers.filter(s => {
      const act = s.logistics_analyses?.[0];
      return Boolean(act && act.feasibility && ['FEASIBLE', 'INFEASIBLE', 'NEED_INFO'].includes(act.feasibility));
    });

    const totalAnalysesAnswered = allEvaluatedSuppliers.length;
    const feasibleCount = suppliers.filter(s => s.logistics_analyses?.[0]?.feasibility === 'FEASIBLE').length;
    const infeasibleCount = suppliers.filter(s => s.logistics_analyses?.[0]?.feasibility === 'INFEASIBLE').length;
    const needInfoCount = suppliers.filter(s => s.logistics_analyses?.[0]?.feasibility === 'NEED_INFO').length;

    // Processos concluídos pela Logística (liberados para documentação / operação)
    const completedLogisticsProcesses = suppliers.filter(s => 
      ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage)
    ).length;

    // Coletas realizadas
    const completedCollections = collections.filter(c => c.status === 'COMPLETED').length;
    const totalKgCollected = receipts.reduce((acc, r) => {
      return acc + (r.items ? r.items.reduce((s, it) => s + (Number(it.weight_kg) || 0), 0) : 0);
    }, 0);

    // Processos que ficaram em atraso (> 5 dias sem resposta)
    const overdueLeads = inLogisticsQueue.filter(s => getLogisticsSlaInfo(s, 5, language)?.isOverdue).length;
    const onTimeLeads = inLogisticsQueue.length - overdueLeads;
    
    // Taxa de pontualidade da logística
    const slaComplianceRate = inLogisticsQueue.length > 0
      ? Math.round((onTimeLeads / inLogisticsQueue.length) * 100)
      : 100;

    return {
      queueCount: inLogisticsQueue.length,
      totalAnalysesAnswered,
      feasibleCount,
      infeasibleCount,
      needInfoCount,
      completedLogisticsProcesses,
      completedCollections,
      totalKgCollected,
      overdueLeads,
      onTimeLeads,
      slaComplianceRate
    };
  }, [suppliers, collections, receipts, language]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-[#CDEAF1] border-t-[#2098D1] rounded-full animate-spin" />
        <p className="text-sm text-[#145772] font-bold">Carregando painel de inteligência operacional...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black text-[#0D2439] tracking-tight">
              {t('dashboard.title', 'Painel Executivo & Operacional')}
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#E5F5F8] text-[#136F90] px-2.5 py-0.5 rounded-full border border-[#CCEAF1]">
              {activeTab === 'hub' ? (language === 'pt' ? 'Visão Geral do Hub' : 'Hub Overview') : (language === 'pt' ? 'Gestão & RH' : 'Management & HR')}
            </span>
          </div>
          <p className="text-[#3F6880] text-sm mt-1 font-medium">
            {language === 'pt'
              ? `Olá, ${user?.name}. Acompanhe em tempo real o fluxo de materiais, estoque do Hub e indicadores de desempenho.`
              : `Hello, ${user?.name}. Track real-time material flow, Hub inventory, and performance metrics.`}
          </p>
        </div>

        {/* Tab Switcher (Visible to Admins / Managers) */}
        <div className="flex items-center gap-2">
          {isAdminOrManager && (
            <div className="flex bg-[#EBF5F8] p-1 rounded-2xl border border-[#CCEAF1] shadow-xs">
              <button
                onClick={() => setActiveTab('hub')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'hub'
                    ? 'bg-white text-[#2098D1] shadow-xs'
                    : 'text-[#48738A] hover:text-[#0D2439]'
                }`}
              >
                <BarChart3 size={14} />
                {language === 'pt' ? 'Visão do Hub' : 'Hub Overview'}
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'performance'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-[#48738A] hover:text-[#0D2439]'
                }`}
              >
                <Users size={14} />
                {language === 'pt' ? 'Desempenho & RH' : 'Team & HR'}
                {logisticsPerformance.overdueLeads > 0 && (
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: VISÃO GERAL OPERACIONAL DO HUB (TODOS OS PERFIS) */}
      {/* ========================================================================= */}
      {activeTab === 'hub' && (
        <div className="space-y-8">
          {/* 4 KPIs PRINCIPAIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Total em Prospecção */}
            <Card className="flex items-center gap-4 hover:shadow-md transition-all border border-[#D5EFF5]">
              <div className="h-13 w-13 bg-[#E5F5F8] text-[#2098D1] rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Target size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">
                  {language === 'pt' ? 'Empresas em Prospecção' : 'Companies in Prospecting'}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl md:text-3xl font-black text-[#0D2439]">{prospectingCount}</h3>
                  <span className="text-[11px] font-bold text-[#2098D1] bg-[#E5F5F8] px-1.5 py-0.2 rounded">
                    {language === 'pt' ? 'Leads Comerciais' : 'Commercial Leads'}
                  </span>
                </div>
              </div>
            </Card>

            {/* 2. Total de Geradores Homologados */}
            <Card className="flex items-center gap-4 hover:shadow-md transition-all border border-[#D5EFF5]">
              <div className="h-13 w-13 bg-[#EBF7D4] text-[#48780E] rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Building2 size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">
                  {language === 'pt' ? 'Total de Geradores' : 'Total Generators'}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl md:text-3xl font-black text-[#0D2439]">{totalGeneratorsCount}</h3>
                  <span className="text-[11px] font-bold text-[#48780E] bg-[#EBF7D4] px-1.5 py-0.2 rounded">
                    {language === 'pt' ? 'Homologados' : 'Approved'}
                  </span>
                </div>
              </div>
            </Card>

            {/* 3. Quantidade de Coletas Realizadas */}
            <Card className="flex items-center gap-4 hover:shadow-md transition-all border border-[#D5EFF5]">
              <div className="h-13 w-13 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Truck size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">
                  {language === 'pt' ? 'Coletas Realizadas' : 'Completed Collections'}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl md:text-3xl font-black text-[#0D2439]">{completedCollectionsCount}</h3>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                    +{scheduledCollectionsCount} {language === 'pt' ? 'agendadas' : 'scheduled'}
                  </span>
                </div>
              </div>
            </Card>

            {/* 4. Quantidade Total de Materiais no Hub (em kg) */}
            <Card className="flex items-center gap-4 hover:shadow-md transition-all border border-[#D5EFF5] bg-gradient-to-br from-white to-[#F0FAFC]">
              <div className="h-13 w-13 bg-[#2098D1] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Scale size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">
                  {language === 'pt' ? 'Disponível no Hub' : 'Available in Hub'}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl md:text-3xl font-black text-[#0D2439]">{formatVolume(totalHubStockKg, 'kg')}</h3>
                </div>
              </div>
            </Card>
          </div>

          {/* GRÁFICO & DISTRIBUIÇÃO DE ESTOQUE NO HUB POR MATERIAL (EM KG) */}
          <Card className="border border-[#D5EFF5] p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5F4F7]">
              <div>
                <h3 className="text-base font-black text-[#0D2439] flex items-center gap-2">
                  <Layers size={18} className="text-[#2098D1]" />
                  {language === 'pt' ? 'Estoque de Materiais Disponíveis no Hub (kg)' : 'Available Hub Materials Stock (kg)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {language === 'pt' 
                    ? 'Distribuição real calculada por saldo líquido de pesagens de entrada menos saídas/vendas expedidas.' 
                    : 'Real balance computed from inbound weighings minus outbound dispatches.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'pt' ? 'Estoque Total Consolidado' : 'Total Consolidate Stock'}
                  </span>
                  <span className="text-lg font-black text-[#2098D1]">
                    {formatVolume(totalHubStockKg, 'kg')}
                  </span>
                </div>
              </div>
            </div>

            {materialsStockBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Recycle size={36} className="mx-auto text-slate-300 opacity-60" />
                <p className="text-sm font-bold text-slate-600">
                  {language === 'pt' ? 'Nenhum material registrado no estoque do Hub ainda.' : 'No materials logged in Hub inventory yet.'}
                </p>
                <p className="text-xs text-slate-400">
                  {language === 'pt' ? 'Os materiais aparecerão aqui conforme os recebimentos forem registrados na balança.' : 'Materials will appear here as scale receipts are logged.'}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Horizontal Visual Stack Bar */}
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  {materialsStockBreakdown.map((m, idx) => {
                    const pct = totalHubStockKg > 0 ? (m.stockKg / totalHubStockKg) * 100 : 0;
                    if (pct <= 0) return null;
                    const colors = [
                      'bg-[#2098D1]', 'bg-[#9ECE42]', 'bg-amber-500', 'bg-indigo-500', 
                      'bg-sky-400', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500'
                    ];
                    const color = colors[idx % colors.length];
                    return (
                      <div 
                        key={m.name} 
                        className={`h-full ${color} transition-all duration-500 hover:opacity-90`}
                        style={{ width: `${pct}%` }}
                        title={`${m.name}: ${formatVolume(m.stockKg, 'kg')} (${Math.round(pct)}%)`}
                      />
                    );
                  })}
                </div>

                {/* Material Breakdown Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
                  {materialsStockBreakdown.map((mat, idx) => {
                    const pct = totalHubStockKg > 0 ? (mat.stockKg / totalHubStockKg) * 100 : 0;
                    const colors = [
                      'border-l-[#2098D1]', 'border-l-[#9ECE42]', 'border-l-amber-500', 'border-l-indigo-500', 
                      'border-l-sky-400', 'border-l-emerald-500', 'border-l-purple-500', 'border-l-rose-500', 'border-l-teal-500'
                    ];
                    const dotColors = [
                      'bg-[#2098D1]', 'bg-[#9ECE42]', 'bg-amber-500', 'bg-indigo-500', 
                      'bg-sky-400', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500'
                    ];
                    const borderLeft = colors[idx % colors.length];
                    const dotColor = dotColors[idx % dotColors.length];

                    return (
                      <div 
                        key={mat.name} 
                        className={`p-3.5 rounded-2xl bg-white border border-[#E1F3F7] border-l-4 ${borderLeft} shadow-2xs hover:shadow-xs transition-all space-y-2`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`h-2.5 w-2.5 rounded-full ${dotColor} shrink-0`} />
                            <span className="text-xs font-bold text-[#0D2439] truncate" title={translateMaterialName(mat.name, language)}>
                              {translateMaterialName(mat.name, language)}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 shrink-0">
                            {Math.round(pct)}%
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-base font-black text-[#0D2439]">
                            {formatVolume(mat.stockKg, 'kg')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {mat.dispatchedKg > 0 ? `-${formatVolume(mat.dispatchedKg, 'kg')}` : '0 kg exp.'}
                          </span>
                        </div>

                        {/* Mini progress bar */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${dotColor} rounded-full`}
                            style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* FUNIL OPERACIONAL & TAREFAS/ATIVIDADES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Circular Funnel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-[#D5EFF5]">
                <h3 className="font-bold text-[#0D2439] text-sm uppercase tracking-wider flex items-center gap-2 mb-6">
                  <TrendingUp size={16} className="text-[#2098D1]" />
                  {language === 'pt' ? 'Funil Operacional de Circularidade' : 'Circular Operational Funnel'}
                </h3>
                
                <div className="space-y-4">
                  {stagesList.map((stage) => (
                    <div key={stage.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#2B4E63]">{stage.label}</span>
                        <span className="text-[#0D2439]">{stage.count} ({stage.percentage}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#E5F5F8] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pending Tasks */}
              <Card className="border border-[#D5EFF5]">
                <h3 className="font-bold text-[#0D2439] text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
                  <ClipboardList size={16} className="text-[#2098D1]" />
                  {language === 'pt' ? 'Tarefas & Pendências da Equipe' : 'Team Tasks & Pending Items'} ({pendingTasks.length})
                </h3>
                
                {pendingTasks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm font-medium">
                    {language === 'pt' ? 'Nenhuma pendência ativa no momento. Operação em dia!' : 'No pending items at this time. Operations up to date!'}
                  </div>
                ) : (
                  <div className="divide-y divide-[#EBF5F8]">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="py-3 flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-bold text-[#0D2439] leading-snug">{translateLogText(task.description, language)}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
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
                          className="inline-flex items-center gap-1 text-xs text-[#2098D1] hover:text-white hover:bg-[#2098D1] border border-[#CCEAF1] px-3 py-1.5 rounded-full transition-all font-bold cursor-pointer shrink-0"
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

            {/* Right Col: Recent Activities */}
            <div>
              <Card className="h-full flex flex-col border border-[#D5EFF5]">
                <h3 className="font-bold text-[#0D2439] text-sm uppercase tracking-wider flex items-center gap-2 mb-6 shrink-0">
                  <Sparkles size={16} className="text-[#2098D1]" />
                  {language === 'pt' ? 'Atividades Recentes' : 'Recent Activities'}
                </h3>

                {recentInteractions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-12 text-slate-400 text-sm font-medium">
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
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
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
      )}

      {/* ========================================================================= */}
      {/* ABA 2: DESEMPENHO DA EQUIPE & RH (ADMINS E GESTORES) */}
      {/* ========================================================================= */}
      {activeTab === 'performance' && isAdminOrManager && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Top Overview Banner for HR & Managers */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-indigo-400" />
                <h2 className="text-lg font-black tracking-tight">
                  {language === 'pt' ? 'Painel de Desempenho por Usuário & Área' : 'User & Department Performance Dashboard'}
                </h2>
              </div>
              <p className="text-xs text-indigo-200">
                {language === 'pt' 
                  ? 'Acompanhamento executivo de produtividade, taxas de conversão de prospecção, cumprimento de prazos de logística e métricas de RH.' 
                  : 'Executive tracking of commercial conversion rates, logistics turnaround time, and HR metrics.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-indigo-800/60 border border-indigo-700 px-3 py-1.5 rounded-xl">
                👥 {profiles.filter(p => p.role === 'BUYER' || p.role === 'LOGISTICS').length} {language === 'pt' ? 'Colaboradores Operacionais (Compras & Logística)' : 'Operational Staff (Buying & Logistics)'}
              </span>
            </div>
          </div>

          {/* SEÇÃO 1: ÁREA COMERCIAL (COMPRAS) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#2098D1]" />
                <h3 className="text-base font-black text-[#0D2439]">
                  {language === 'pt' ? 'Desempenho Comercial (Compras & Prospecção)' : 'Commercial Performance (Buying & Prospecting)'}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {language === 'pt' ? 'Origem dos Leads & Conversão (apenas Compradores)' : 'Lead Sources & Conversion (Buyers only)'}
              </span>
            </div>

            {/* Buyer Cards Table */}
            <Card className="overflow-hidden !p-0 border border-slate-200">
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">{language === 'pt' ? 'Colaborador(a)' : 'Team Member'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Empresas em Prospecção' : 'Prospecting Leads'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Enviados p/ Logística' : 'Sent to Logistics'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Geradores Homologados' : 'Approved Generators'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Taxa de Conversão' : 'Conversion Rate'}</th>
                      <th className="px-6 py-4 text-right">{language === 'pt' ? 'Status Produtividade' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {buyerPerformance.map(({ buyer, totalRegistered, sentToLogistics, convertedGenerators, conversionRate }) => (
                      <tr key={buyer.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-[#E5F5F8] text-[#2098D1] font-black flex items-center justify-center text-xs shrink-0">
                              {buyer.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{buyer.name}</p>
                              <p className="text-[11px] text-slate-400">{buyer.email} • <span className="font-bold text-[#2098D1]">{buyer.role}</span></p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-sm">{totalRegistered}</span>
                            <span className="text-[10px] text-slate-400">{language === 'pt' ? 'empresas cadastradas' : 'registered companies'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-indigo-700 text-sm">
                              {sentToLogistics}
                            </span>
                            <span className="text-[10px] text-slate-400">{language === 'pt' ? 'encaminhadas à Logística' : 'sent to Logistics'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-emerald-700 text-sm">
                              {convertedGenerators}
                            </span>
                            <span className="text-[10px] text-slate-400">{language === 'pt' ? 'em operação ativa' : 'in active operation'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-black text-[#0D2439]">
                              <span>{conversionRate}%</span>
                            </div>
                            <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${conversionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {totalRegistered > 5 ? (
                            <Badge variant="success" className="font-black">
                              🚀 {language === 'pt' ? 'Alta Atividade' : 'High Activity'}
                            </Badge>
                          ) : totalRegistered > 0 ? (
                            <Badge variant="info" className="font-black">
                              ✓ {language === 'pt' ? 'Ativo' : 'Active'}
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-slate-400 font-normal">
                              {language === 'pt' ? 'Sem registros' : 'No records'}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* SEÇÃO 2: ÁREA DE LOGÍSTICA (OPERAÇÕES) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-indigo-600" />
                <h3 className="text-base font-black text-[#0D2439]">
                  {language === 'pt' ? 'Desempenho da Logística (Operações)' : 'Logistics Performance (Operations)'}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {language === 'pt' ? 'Prazos de Retorno (SLA 5d) & Coletas' : 'Return Time (5d SLA) & Collections'}
              </span>
            </div>

            {/* Logistics Performance Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Processos Analisados e Respondidos */}
              <Card className="border border-slate-200 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {language === 'pt' ? 'Pareceres Emitidos' : 'Opinions Issued'}
                  </span>
                  <CheckCircle size={16} className="text-indigo-600" />
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <h4 className="text-2xl font-black text-[#0D2439]">{logisticsPerformance.totalAnalysesAnswered}</h4>
                  <span className="text-[10px] text-slate-400">{language === 'pt' ? 'processos analisados' : 'analyzed processes'}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 flex-wrap">
                  <span className="font-bold text-emerald-600">✓ {logisticsPerformance.feasibleCount} {language === 'pt' ? 'viáveis' : 'feasible'}</span>
                  <span>•</span>
                  <span className="font-bold text-rose-600">✗ {logisticsPerformance.infeasibleCount} {language === 'pt' ? 'inviáveis' : 'infeasible'}</span>
                </div>
              </Card>

              {/* 2. Processos Concluídos pela Logística */}
              <Card className="border border-slate-200 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {language === 'pt' ? 'Homologados p/ Coleta' : 'Released for Collection'}
                  </span>
                  <PackageCheck size={16} className="text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <h4 className="text-2xl font-black text-[#0D2439]">{logisticsPerformance.completedLogisticsProcesses}</h4>
                  <span className="text-[10px] text-slate-400">{language === 'pt' ? 'geradores ativos' : 'active generators'}</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-bold pt-1">
                  {language === 'pt' ? 'Liberados pela Logística' : 'Released by Logistics'}
                </p>
              </Card>

              {/* 3. Coletas Realizadas & Volume */}
              <Card className="border border-slate-200 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {language === 'pt' ? 'Coletas Executadas' : 'Executed Collections'}
                  </span>
                  <Truck size={16} className="text-[#2098D1]" />
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <h4 className="text-2xl font-black text-[#0D2439]">{logisticsPerformance.completedCollections}</h4>
                  <span className="text-[10px] text-slate-400">({formatVolume(logisticsPerformance.totalKgCollected, 'kg')})</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium pt-1">
                  {language === 'pt' ? 'Total transportado ao Hub' : 'Total transported to Hub'}
                </p>
              </Card>

              {/* 4. Controle de SLA de 5 dias & Atrasos */}
              <Card className={`border p-4 space-y-1 ${logisticsPerformance.overdueLeads > 0 ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {language === 'pt' ? 'SLA de Retorno (5 dias)' : '5-Day Return SLA'}
                  </span>
                  {logisticsPerformance.overdueLeads > 0 ? (
                    <AlertTriangle size={16} className="text-rose-600 animate-pulse" />
                  ) : (
                    <Clock size={16} className="text-emerald-600" />
                  )}
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <h4 className={`text-2xl font-black ${logisticsPerformance.overdueLeads > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {logisticsPerformance.overdueLeads > 0 
                      ? (language === 'pt' ? `${logisticsPerformance.overdueLeads} Atrasado(s)` : `${logisticsPerformance.overdueLeads} Overdue`) 
                      : (language === 'pt' ? '100% no Prazo' : '100% On-Time')}
                  </h4>
                </div>
                <p className={`text-[10px] font-bold pt-1 ${logisticsPerformance.overdueLeads > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {logisticsPerformance.overdueLeads > 0 
                    ? (language === 'pt' ? `🚨 ${logisticsPerformance.overdueLeads} processo(s) ultrapassaram 5 dias` : `🚨 ${logisticsPerformance.overdueLeads} process(es) exceeded 5 days`) 
                    : (language === 'pt' ? `✓ Todos os processos respondidos em até 5 dias` : `✓ All processes answered within 5 days`)}
                </p>
              </Card>
            </div>

            {/* Logistics Staff Table */}
            <Card className="overflow-hidden !p-0 border border-slate-200">
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">{language === 'pt' ? 'Responsável Logística' : 'Logistics Member'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Fila de Análise' : 'Analysis Queue'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Pareceres Respondidos' : 'Answered Analyses'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Homologados p/ Coleta' : 'Released for Collection'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Atrasos (> 5 dias)' : 'Overdue (> 5d)'}</th>
                      <th className="px-6 py-4 text-right">{language === 'pt' ? 'Pontualidade no SLA' : 'SLA Compliance'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profiles.filter(p => p.role === 'LOGISTICS').map(member => (
                      <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{member.name}</p>
                              <p className="text-[11px] text-slate-400">{member.email} • <span className="font-bold text-indigo-600">{member.role}</span></p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-black text-slate-900 text-sm">
                            {logisticsPerformance.queueCount} {language === 'pt' ? 'processos' : 'processes'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-indigo-700 text-sm">
                            {logisticsPerformance.totalAnalysesAnswered}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-700 text-sm">
                            {logisticsPerformance.completedLogisticsProcesses}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {logisticsPerformance.overdueLeads > 0 ? (
                            <span className="font-bold text-rose-600 text-sm flex items-center gap-1">
                              🚨 {logisticsPerformance.overdueLeads} {language === 'pt' ? 'em atraso' : 'overdue'}
                            </span>
                          ) : (
                            <span className="font-bold text-emerald-600 text-sm">
                              ✓ {language === 'pt' ? '0 atrasos' : '0 overdue'}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Badge variant={logisticsPerformance.slaComplianceRate >= 80 ? 'success' : 'danger'} className="font-black">
                            {logisticsPerformance.slaComplianceRate}% {language === 'pt' ? 'no prazo' : 'on-time'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* RESUMO EXECUTIVO DE METAS & RH */}
          <Card className="border border-slate-200 p-6 bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                {language === 'pt' ? 'Resumo de Indicadores para Gestão & RH' : 'Summary Indicators for HR & Management'}
              </h4>
              <span className="text-xs text-slate-400 font-medium">
                {language === 'pt' ? 'Atualizado automaticamente' : 'Auto-updated'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'pt' ? 'Eficiência do Funil Comercial' : 'Commercial Funnel Efficiency'}
                </span>
                <p className="text-xl font-black text-slate-900">
                  {prospectingCount > 0 
                    ? `${Math.round((totalGeneratorsCount / (prospectingCount + totalGeneratorsCount)) * 100)}%` 
                    : '100%'}
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'pt' ? 'Taxa geral de conversão de leads em geradores' : 'Overall conversion rate of leads into generators'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'pt' ? 'Pontualidade da Logística (SLA)' : 'Logistics Punctuality (SLA)'}
                </span>
                <p className="text-xl font-black text-slate-900">
                  {logisticsPerformance.slaComplianceRate}%
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'pt' ? 'Processos respondidos dentro do prazo de 5 dias' : 'Processes answered within 5-day deadline'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'pt' ? 'Volume Médio por Coleta' : 'Average Volume per Collection'}
                </span>
                <p className="text-xl font-black text-slate-900">
                  {completedCollectionsCount > 0 
                    ? formatVolume(Math.round(totalReceivedKg / completedCollectionsCount), 'kg') 
                    : '0 kg'}
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'pt' ? 'Média de materiais recebidos por viagem' : 'Average material received per trip'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
