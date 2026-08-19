'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/features/shared/services/dbService';
import { Supplier, AttachedDocument } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import {
  translateFeasibility,
  getFeasibilityColor,
  formatVolume,
  formatDate,
  formatCurrency
} from '@/lib/utils';
import {
  Truck,
  MapPin,
  FileEdit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  ArrowRight,
  FileText,
  FileCheck,
  Calendar,
  CalendarCheck,
  Plus,
  Trash2,
  Download
} from 'lucide-react';
import Link from 'next/link';

export const DOC_CHECKLIST = [
  { key: 'Aguardando documentação', label: 'Aguardando documentação' },
  { key: 'Aguardando dados MTR',     label: 'Aguardando dados MTR' },
  { key: 'Carta de Doação',          label: 'Carta de Doação' },
  { key: 'Cartão CNPJ',              label: 'Cartão CNPJ' },
  { key: 'Doc. do Responsável',      label: 'Doc. do Responsável' },
  { key: 'Outros',                   label: 'Outros (digitar pendência)' }
];

export const transportTypeOptions = [
  { value: 'VUC', label: 'VUC' },
  { value: 'Toco', label: 'Toco' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Carreta', label: 'Carreta' },
  { value: 'Fiorino / Van', label: 'Fiorino / Van' },
  { value: 'Outros', label: 'Outros (especificar)' }
];

export const responsibleOptions = [
  { value: 'Terceirizado da iWrc', label: 'Terceirizado da iWrc' },
  { value: 'Fornecedor (entrega no Hub)', label: 'Fornecedor (entrega no Hub)' },
  { value: 'Empresa terceirizada', label: 'Empresa terceirizada' },
  { value: 'Outros', label: 'Outros (especificar)' }
];

export const frequencyOptions = [
  { value: 'Semanal', label: 'Semanal (a cada 7 dias)' },
  { value: '2x por semana', label: '2x por semana (duas vezes na semana)' },
  { value: 'Quinzenal', label: 'A cada 15 dias (Quinzenal)' },
  { value: 'Mensal', label: 'Mensal (uma vez por mês)' }, 
  { value: 'Bimestral', label: 'Bimestral (a cada 2 meses)' },
  { value: 'Trimestral', label: 'Trimestral (a cada 3 meses)' },
  { value: 'Semestral', label: 'Semestral (a cada 6 meses)' },
  { value: 'Sob Demanda', label: 'Sob Demanda (sob solicitação)' },
  { value: 'Outros', label: 'Outros (especificar frequência)' }
];

export const feasibilityOptions = [
  { value: 'FEASIBLE', label: '✓ Viável para Coleta — Aprovar' },
  { value: 'NEED_INFO', label: '⚠️ Necessita Informação Adicional do Comercial' },
  { value: 'INFEASIBLE', label: '❌ Inviável — Reprovar' },
  { value: 'PENDING', label: '⏳ Em Análise' }
];

export default function LogisticsPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();

  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'scheduling' | 'history'>('queue');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<string[]>([]);
  const [customPendingDoc, setCustomPendingDoc] = useState('');

  // Analysis Form
  const [analysisForm, setAnalysisForm] = useState({
    distance_km: '',
    transport_type: 'VUC',
    custom_transport_type: '',
    estimated_cost: '0',
    recommended_frequency: 'Mensal',
    custom_frequency: '',
    transport_responsible: 'Terceirizado da iWrc',
    custom_transport_responsible: '',
    conditioning_infrastructure_needed: '',
    feasibility: 'FEASIBLE',
    notes: '',
    need_info_reason: ''
  });

  // Scheduling Form
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingSupplier, setSchedulingSupplier] = useState<Supplier | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    scheduled_date: '',
    frequency: 'Mensal',
    custom_frequency: '',
    material_name: '',
    estimated_volume: '',
    unit: 'kg',
    driver_name: '',
    carrier_name: '',
    notes: ''
  });

  const getNextCollectionDate = (baseDateStr: string, frequency?: string | null): Date => {
    const date = new Date(baseDateStr + 'T00:00:00');
    const freq = (frequency || 'mensal').toLowerCase().trim();
    if (freq.includes('2x') || freq.includes('duas') || freq.includes('2 vezes') || freq.includes('bi-semanal')) {
      date.setDate(date.getDate() + 3);
    } else if (freq.includes('3x') || freq.includes('três') || freq.includes('3 vezes')) {
      date.setDate(date.getDate() + 2);
    } else if (freq.includes('diario') || freq.includes('diário')) {
      date.setDate(date.getDate() + 1);
    } else if (freq.includes('semanal') || freq.includes('7 dias')) {
      date.setDate(date.getDate() + 7);
    } else if (freq.includes('quinzenal') || freq.includes('15 dias')) {
      date.setDate(date.getDate() + 15);
    } else if (freq.includes('bimestral') || freq.includes('2 meses') || freq.includes('60 dias')) {
      date.setMonth(date.getMonth() + 2);
    } else if (freq.includes('trimestral') || freq.includes('3 meses') || freq.includes('90 dias')) {
      date.setMonth(date.getMonth() + 3);
    } else if (freq.includes('semestral') || freq.includes('6 meses') || freq.includes('180 dias')) {
      date.setMonth(date.getMonth() + 6);
    } else if (/\d+\s*dias?/.test(freq)) {
      const match = freq.match(/(\d+)\s*dias?/);
      const days = match ? parseInt(match[1], 10) : 30;
      date.setDate(date.getDate() + days);
    } else {
      // Default: Mensal (+1 month)
      date.setMonth(date.getMonth() + 1);
    }
    return date;
  };

  const fetchData = useCallback(async () => {
    try {
      const s = await dbService.getSuppliers();
      setAllSuppliers(s);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // 1. Queue: Leads in LOGISTICS stage that are pending or in progress (stays in queue when IN_PROGRESS)
  const queue = allSuppliers.filter(s => {
    const act = s.logistics_analyses?.[0];
    const isCompleted = Boolean(
      act && 
      act.feasibility && 
      (act.feasibility === 'FEASIBLE' || act.feasibility === 'NEED_INFO' || act.feasibility === 'INFEASIBLE')
    );
    return s.current_stage === 'LOGISTICS' && !isCompleted;
  });
  
  // 2. Scheduling: Suppliers awaiting 1st collection OR active suppliers within 3 days of their next recurring collection date
  const schedulingQueue = allSuppliers.filter(s => {
    // 1. Initial 1st collection pending
    const isInitialPending = s.current_stage === 'COLLECTION' || 
      (s.backlog_reason?.toLowerCase().includes('agendamento')) ||
      (s.logistics_analyses?.[0]?.feasibility === 'FEASIBLE' && (!s.collections || s.collections.length === 0));
    
    if (isInitialPending) return true;

    // 2. Active operation: check if within 3 days of next collection cycle
    if (s.current_stage === 'OPERATION') {
      const activeLog = s.logistics_analyses?.[0];
      const freq = activeLog?.recommended_frequency || 'Mensal';
      if (freq.toLowerCase().includes('demanda')) return false;

      // Find the latest scheduled collection date
      const allColDates = (s.collections || [])
        .map(c => c.scheduled_date)
        .concat(s.last_collection_date ? [s.last_collection_date] : [])
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const latestDateStr = allColDates[0];
      if (!latestDateStr) return true;

      const latestColDate = new Date(latestDateStr + 'T00:00:00');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // If already scheduled for a future date, it has already been scheduled and must NOT appear now
      if (latestColDate.getTime() > today.getTime()) {
        return false;
      }

      // Calculate next due date
      const nextDue = getNextCollectionDate(latestDateStr, freq);
      
      // Appears 3 days before the next due date
      const threeDaysBeforeNextDue = new Date(nextDue.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      return today.getTime() >= threeDaysBeforeNextDue.getTime();
    }

    return false;
  });

  // 3. History: Any supplier with a logistics evaluation completed
  const history = allSuppliers.filter(s => {
    const act = s.logistics_analyses?.[0];
    const isCompleted = Boolean(
      act && 
      act.feasibility && 
      (act.feasibility === 'FEASIBLE' || act.feasibility === 'NEED_INFO' || act.feasibility === 'INFEASIBLE')
    );
    return isCompleted || (['DOCUMENTATION', 'COLLECTION', 'OPERATION'] as string[]).includes(s.current_stage);
  });

  const handleOpenAnalysis = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPendingDocs([]);
    setCustomPendingDoc('');
    
    const existing = await dbService.getLogisticsAnalysisForSupplier(supplier.id);
    if (existing) {
      const isStdTransport = transportTypeOptions.some(o => o.value === existing.transport_type && o.value !== 'Outros');
      const isStdResp = responsibleOptions.some(o => o.value === existing.transport_responsible && o.value !== 'Outros');
      const isStdFreq = frequencyOptions.some(o => o.value === existing.recommended_frequency && o.value !== 'Outros');

      setAnalysisForm({
        distance_km: existing.distance_km?.toString() || '',
        transport_type: isStdTransport ? (existing.transport_type || 'VUC') : 'Outros',
        custom_transport_type: isStdTransport ? '' : (existing.transport_type || ''),
        estimated_cost: existing.estimated_cost?.toString() || '0',
        recommended_frequency: isStdFreq ? (existing.recommended_frequency || 'Mensal') : 'Outros',
        custom_frequency: isStdFreq ? '' : (existing.recommended_frequency || ''),
        transport_responsible: isStdResp ? (existing.transport_responsible || 'Terceirizado da iWrc') : 'Outros',
        custom_transport_responsible: isStdResp ? '' : (existing.transport_responsible || ''),
        conditioning_infrastructure_needed: existing.conditioning_infrastructure_needed || '',
        feasibility: existing.feasibility || 'FEASIBLE',
        notes: existing.notes || '',
        need_info_reason: supplier.backlog_reason || ''
      });
      setPendingDocs((existing as any).pending_docs || []);
    } else {
      setAnalysisForm({
        distance_km: '', 
        transport_type: 'VUC', 
        custom_transport_type: '',
        estimated_cost: '0',
        recommended_frequency: 'Mensal', 
        custom_frequency: '',
        transport_responsible: 'Terceirizado da iWrc',
        custom_transport_responsible: '',
        conditioning_infrastructure_needed: '', 
        feasibility: 'FEASIBLE', 
        notes: '', 
        need_info_reason: ''
      });
    }
    setIsModalOpen(true);
  };

  const toggleDoc = (key: string) => {
    setPendingDocs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSaveAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !currentUser) return;
    setIsSubmitting(true);
    try {
      const finalTransport = analysisForm.transport_type === 'Outros'
        ? (analysisForm.custom_transport_type?.trim() || 'Outros')
        : analysisForm.transport_type;

      const finalResponsible = analysisForm.transport_responsible === 'Outros'
        ? (analysisForm.custom_transport_responsible?.trim() || 'Outros')
        : analysisForm.transport_responsible;

      const finalFrequency = analysisForm.recommended_frequency === 'Outros'
        ? (analysisForm.custom_frequency?.trim() || 'Outros')
        : analysisForm.recommended_frequency;

      const finalPendingDocs = pendingDocs.map(d => 
        d === 'Outros' ? (customPendingDoc?.trim() ? `Outros: ${customPendingDoc.trim()}` : 'Outros') : d
      );

      // Save logistics analysis
      await dbService.saveLogisticsAnalysis({
        supplier_id: selectedSupplier.id,
        distance_km: Number(analysisForm.distance_km) || null,
        transport_type: finalTransport || null,
        estimated_cost: Number(analysisForm.estimated_cost) || null,
        recommended_frequency: finalFrequency || null,
        transport_responsible: finalResponsible || null,
        conditioning_infrastructure_needed: analysisForm.conditioning_infrastructure_needed || null,
        feasibility: analysisForm.feasibility as any,
        notes: analysisForm.notes || null,
        analyst_id: currentUser.id,
        pending_docs: finalPendingDocs
      } as any);

      // Stage transition according to decision
      let newStage = selectedSupplier.current_stage;
      let newStatus = selectedSupplier.current_status;
      let backlogReason = null;

      if (analysisForm.feasibility === 'FEASIBLE') {
        if (finalPendingDocs.length > 0) {
          newStage = 'DOCUMENTATION';
          newStatus = 'PENDING';
          backlogReason = `Aprovado pela Logística. Pendências: ${finalPendingDocs.join(', ')}`;
          for (const doc of finalPendingDocs) {
            await dbService.addSupplierTask({
              supplier_id: selectedSupplier.id,
              description: `Obter documentação: ${doc}`,
              due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          }
        } else {
          newStage = 'DOCUMENTATION';
          newStatus = 'APPROVED';
          backlogReason = 'Aprovado pela Logística. Pronto para documentação e agendamento.';
        }
      } else if (analysisForm.feasibility === 'INFEASIBLE') {
        newStage = 'LOGISTICS';
        newStatus = 'REJECTED';
        backlogReason = 'Inviável para coleta: ' + (analysisForm.notes || '-');
      } else if (analysisForm.feasibility === 'NEED_INFO') {
        newStage = 'LOGISTICS';
        newStatus = 'PENDING';
        backlogReason = analysisForm.need_info_reason || 'Logística solicitou informações adicionais ao Comercial';
        await dbService.addSupplierTask({
          supplier_id: selectedSupplier.id,
          description: `Logística precisa de info: ${backlogReason}`,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      } else if (analysisForm.feasibility === 'PENDING') {
        newStatus = 'PENDING';
        backlogReason = 'Análise logística em andamento';
      }

      await dbService.updateSupplier(selectedSupplier.id, {
        current_stage: newStage, 
        current_status: newStatus, 
        backlog_reason: backlogReason
      });

      await dbService.addSupplierStatusHistory({
        supplier_id: selectedSupplier.id,
        old_stage: selectedSupplier.current_stage, 
        new_stage: newStage,
        old_status: selectedSupplier.current_status, 
        new_status: newStatus,
        user_id: currentUser.id,
        notes: `Parecer logístico: ${translateFeasibility(analysisForm.feasibility as any)}.${finalPendingDocs.length > 0 ? ' Pendências: ' + finalPendingDocs.join(', ') : ''}`
      });

      await dbService.addSupplierInteraction({
        supplier_id: selectedSupplier.id, 
        user_id: currentUser.id, 
        type: 'internal_obs',
        description: `Logística concluiu análise. Decisão: ${translateFeasibility(analysisForm.feasibility as any)}. Notas: ${analysisForm.notes || '-'}`
      });

      setIsModalOpen(false);
      fetchData();
    } catch (err) { 
      console.error(err); 
      alert('Erro ao salvar análise.'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleOpenScheduleModal = (supplier: Supplier) => {
    setSchedulingSupplier(supplier);
    const mainMaterial = supplier.materials?.[0];
    const initialFreq = supplier.logistics_analyses?.[0]?.recommended_frequency || 'Mensal';
    const isStdFreq = frequencyOptions.some(o => o.value === initialFreq && o.value !== 'Outros');

    setScheduleForm({
      scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      frequency: isStdFreq ? initialFreq : 'Outros',
      custom_frequency: isStdFreq ? '' : initialFreq,
      material_name: mainMaterial ? mainMaterial.material_name : '',
      estimated_volume: mainMaterial ? mainMaterial.estimated_volume.toString() : '',
      unit: mainMaterial?.unit || 'kg',
      driver_name: '',
      carrier_name: supplier.logistics_analyses?.[0]?.transport_responsible || 'Terceirizado da iWrc',
      notes: ''
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingSupplier) return;
    try {
      await dbService.createCollection(
        {
          supplier_id: schedulingSupplier.id,
          scheduled_date: scheduleForm.scheduled_date,
          driver_name: scheduleForm.driver_name || null,
          carrier_name: scheduleForm.carrier_name || null,
          notes: scheduleForm.notes || null,
          status: 'SCHEDULED'
        },
        [
          {
            material_name: scheduleForm.material_name,
            estimated_volume: Number(scheduleForm.estimated_volume) || 0,
            unit: scheduleForm.unit
          }
        ]
      );

      // Update supplier status and last collection date
      await dbService.updateSupplier(schedulingSupplier.id, {
        current_stage: 'OPERATION',
        current_status: 'APPROVED',
        last_collection_date: scheduleForm.scheduled_date,
        first_collection_date: schedulingSupplier.first_collection_date || scheduleForm.scheduled_date,
        backlog_reason: null
      });

      // Update logistics analysis frequency
      const existingLog = schedulingSupplier.logistics_analyses?.[0];
      if (existingLog) {
        await dbService.saveLogisticsAnalysis({
          supplier_id: schedulingSupplier.id,
          distance_km: existingLog.distance_km,
          transport_type: existingLog.transport_type,
          estimated_cost: existingLog.estimated_cost,
          recommended_frequency: scheduleForm.frequency,
          transport_responsible: existingLog.transport_responsible,
          conditioning_infrastructure_needed: existingLog.conditioning_infrastructure_needed,
          feasibility: existingLog.feasibility,
          notes: existingLog.notes,
          analyst_id: existingLog.analyst_id,
          pending_docs: existingLog.pending_docs || []
        } as any);
      }

      await dbService.addSupplierStatusHistory({
        supplier_id: schedulingSupplier.id,
        old_stage: schedulingSupplier.current_stage,
        new_stage: 'OPERATION',
        old_status: schedulingSupplier.current_status,
        new_status: 'APPROVED',
        user_id: currentUser?.id || 'usr-logistics',
        notes: `Coleta agendada para ${formatDate(scheduleForm.scheduled_date)} (Recorrência: ${scheduleForm.frequency}). Motorista: ${scheduleForm.driver_name || '-'}, Transportadora: ${scheduleForm.carrier_name || '-'}`
      });

      await dbService.addSupplierInteraction({
        supplier_id: schedulingSupplier.id,
        user_id: currentUser?.id || 'usr-logistics',
        type: 'internal_obs',
        description: `Coleta operacional agendada para ${formatDate(scheduleForm.scheduled_date)} (${scheduleForm.material_name}, ${scheduleForm.estimated_volume}${scheduleForm.unit}, Recorrência: ${scheduleForm.frequency}).`
      });

      setIsScheduleModalOpen(false);
      await fetchData();
      alert('Coleta agendada com sucesso! Gerador agora está Ativo.');
    } catch (err) {
      console.error(err);
      alert('Erro ao agendar coleta.');
    }
  };

  const handleDownloadDoc = (doc: AttachedDocument) => {
    if (doc.file_data) {
      const a = document.createElement('a');
      a.href = doc.file_data;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      alert(`Documento registrado: ${doc.name}`);
    }
  };

  const handleDeleteSupplier = async (supplierId: string, supplierName: string) => {
    if (!confirm(`Deseja realmente apagar o lead/gerador "${supplierName}" permanentemente?`)) return;
    try {
      await dbService.deleteSupplier(supplierId);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir gerador.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Carregando módulo de logística...</p>
    </div>
  );

  return (
    <div className="space-y-6 font-sans">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 leading-tight">
          {t('logistics.title', 'Logística & Coletas')}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t('logistics.subtitle', 'Analise a viabilidade dos leads enviados pelo Comercial e realize os agendamentos operacionais de coleta.')}
        </p>
      </div>

      {/* Flow banner */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 overflow-x-auto flex-nowrap">
        <span className="flex items-center gap-1 text-indigo-600 font-bold whitespace-nowrap"><Truck size={12} /> {language === 'pt' ? 'Compras qualifica' : 'Commercial qualifies'}</span>
        <ArrowRight size={12} className="text-indigo-300 shrink-0" />
        <span className="font-bold text-indigo-700 whitespace-nowrap">{language === 'pt' ? 'Logística responde viabilidade' : 'Logistics evaluates feasibility'}</span>
        <ArrowRight size={12} className="text-indigo-300 shrink-0" />
        <span className="flex items-center gap-1 text-purple-700 font-bold whitespace-nowrap"><Building2 size={12} /> {language === 'pt' ? 'Exibição em Geradores' : 'Generator Registry'}</span>
        <ArrowRight size={12} className="text-indigo-300 shrink-0" />
        <span className="flex items-center gap-1 text-emerald-600 font-bold whitespace-nowrap"><CalendarCheck size={12} /> {language === 'pt' ? 'Agendamento de Coleta' : 'Collection Scheduled'}</span>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 w-fit overflow-x-auto">
        <button onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'queue' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <Clock size={14} />
          {language === 'pt' ? 'Aguardando Análise' : 'Awaiting Analysis'}
          {queue.length > 0 && <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{queue.length}</span>}
        </button>

        <button onClick={() => setActiveTab('scheduling')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'scheduling' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <Calendar size={14} />
          {language === 'pt' ? 'Agendamento de Coletas' : 'Collection Scheduling'}
          {schedulingQueue.length > 0 && <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{schedulingQueue.length}</span>}
        </button>

        <button onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <CheckCircle size={14} />
          {language === 'pt' ? 'Histórico de Pareceres' : 'Opinion History'}
          <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-black">{history.length}</span>
        </button>
      </div>

      {/* TAB 1: FILA DE ANÁLISE INICIAL */}
      {activeTab === 'queue' && (
        <Card className="overflow-hidden !p-0 border border-slate-200">
          {queue.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Clock size={36} className="mx-auto text-slate-300 opacity-60" />
              <p className="font-semibold text-sm">
                {language === 'pt' ? 'Nenhum lead pendente de análise inicial no momento.' : 'No leads pending initial analysis at the moment.'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'pt' ? 'Assim que Compras mandar um lead para análise, ele aparecerá aqui.' : 'Once Commercial sends a lead for analysis, it will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">{language === 'pt' ? 'Lead / Gerador' : 'Lead / Generator'}</th>
                    <th className="px-6 py-4">{t('logistics.colAddress', 'Endereço de Coleta')}</th>
                    <th className="px-6 py-4">{t('logistics.colMaterials', 'Materiais Declarados')}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Documentos / Anexos' : 'Documents / Attachments'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Responsável Comercial' : 'Commercial Responsible'}</th>
                    <th className="px-6 py-4 text-right">{t('suppliers.actions', 'Ações')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queue.map(supplier => (
                    <tr key={supplier.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 leading-snug">{supplier.name}</span>
                          <span className="text-xs text-slate-400">{supplier.supplier_type || 'Indústria'} • {supplier.lead_source || 'Busca'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {supplier.address ? (
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-slate-700">{supplier.address.city} - {supplier.address.state}</span>
                            {supplier.address.street && <span className="text-slate-400 text-[11px]">{supplier.address.street}, {supplier.address.number}</span>}
                          </div>
                        ) : <span className="text-slate-400 text-xs">Não informado</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          {supplier.materials && supplier.materials.length > 0 ? (
                            supplier.materials.map((m, i) => (
                              <span key={i} className="text-xs font-semibold text-slate-700">
                                • {m.material_name} ({formatVolume(m.estimated_volume, m.unit)} • {m.transaction_type === 'purchase' ? (language === 'pt' ? 'Compra' : 'Purchase') : (language === 'pt' ? 'Doação' : 'Donation')})
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                              ⚠️ {language === 'pt' ? 'Materiais pendentes' : 'Pending materials'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {supplier.attached_documents && supplier.attached_documents.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {supplier.attached_documents.map(d => (
                              <button
                                key={d.id}
                                onClick={() => handleDownloadDoc(d)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#E5F5F8] text-[#2098D1] hover:bg-[#DDF4F9] px-2 py-0.5 rounded-full border border-[#CCEAF1] transition-all cursor-pointer text-left w-fit"
                                title="Clique para baixar ou visualizar arquivo"
                              >
                                <Download size={10} /> {d.name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Sem anexos</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{supplier.responsible?.name || 'Não atribuído'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/fornecedores/${supplier.id}`}>
                            <button className="text-xs text-[#2098D1] hover:text-[#1883B5] bg-[#E5F5F8] px-3 py-1.5 rounded-full font-bold border border-[#CCEAF1] cursor-pointer">
                              Analisar
                            </button>
                          </Link>

                          <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                            onClick={() => handleOpenAnalysis(supplier)}>
                            <FileEdit size={12} />
                            Responder
                          </Button>

                          <button
                            onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                            className="inline-flex items-center justify-center h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                            title="Apagar Lead"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: AGENDAMENTO DE COLETAS OPERACIONAIS */}
      {activeTab === 'scheduling' && (
        <Card className="overflow-hidden !p-0 border border-slate-200">
          {schedulingQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calendar size={36} className="mx-auto text-slate-300 opacity-60" />
              <p className="font-semibold text-sm">Nenhum gerador aguardando agendamento no momento.</p>
              <p className="text-xs text-slate-400">Os geradores liberados pelo Comercial e aqueles cujo ciclo da coleta mensal/periódica venceu reaparecem automaticamente aqui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Gerador</th>
                    <th className="px-6 py-4">Endereço de Coleta</th>
                    <th className="px-6 py-4">Materiais</th>
                    <th className="px-6 py-4">Frequência</th>
                    <th className="px-6 py-4">Última Coleta</th>
                    <th className="px-6 py-4">Situação do Agendamento</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedulingQueue.map(supplier => {
                    const activeLog = supplier.logistics_analyses?.[0];
                    const freq = activeLog?.recommended_frequency || 'Mensal';
                    const hasScheduledCol = supplier.collections && supplier.collections.length > 0;
                    const latestCol = supplier.collections?.[0];
                    const hasLastDate = Boolean(supplier.last_collection_date);
                    const nextDueDate = hasLastDate 
                      ? getNextCollectionDate(supplier.last_collection_date!, freq)
                      : null;

                    return (
                      <tr key={supplier.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-snug">{supplier.name}</span>
                            <span className="text-xs text-slate-400">{supplier.code || 'GER-001'} • {supplier.supplier_type || 'Indústria'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {supplier.address ? (
                            <div className="flex flex-col text-xs">
                              <span className="font-medium text-slate-700">{supplier.address.city} - {supplier.address.state}</span>
                              {supplier.address.street && <span className="text-slate-400 text-[11px]">{supplier.address.street}, {supplier.address.number}</span>}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            {supplier.materials && supplier.materials.length > 0 ? supplier.materials.map((m, i) => (
                              <span key={i} className="text-xs font-semibold text-slate-700">
                                • {m.material_name} ({formatVolume(m.estimated_volume, m.unit)})
                              </span>
                            )) : <span className="text-xs text-slate-400">Nenhum</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                            🔄 {freq}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {supplier.last_collection_date ? (
                            <div className="flex flex-col text-xs">
                              <span className="font-bold text-slate-800">{formatDate(supplier.last_collection_date)}</span>
                              <span className="text-[10px] text-slate-400">Última realizada</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Nenhuma (1ª coleta)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {hasLastDate && nextDueDate ? (
                            <Badge variant="warning" className="gap-1">
                              🔔 Nova Coleta Devida ({formatDate(nextDueDate.toISOString())})
                            </Badge>
                          ) : hasScheduledCol && latestCol ? (
                            <div className="flex flex-col gap-0.5">
                              <Badge variant="success">Agendada p/ {formatDate(latestCol.scheduled_date)}</Badge>
                              {latestCol.driver_name && <span className="text-[10px] text-slate-500">Mot: {latestCol.driver_name}</span>}
                            </div>
                          ) : (
                            <Badge variant="info">
                              🆕 Aguardando 1º Agendamento
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/fornecedores/${supplier.id}`}>
                              <button className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer">
                                Ver Ficha
                              </button>
                            </Link>
                            <Button
                              size="sm"
                              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              onClick={() => handleOpenScheduleModal(supplier)}
                            >
                              <Calendar size={13} />
                              {hasLastDate ? 'Agendar Próxima Coleta' : 'Agendar Coleta'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: HISTÓRICO DE PARECERES */}
      {activeTab === 'history' && (
        <Card className="overflow-hidden !p-0 border border-slate-200">
          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Nenhum parecer concluído no histórico.
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Gerador</th>
                    <th className="px-6 py-4">Endereço</th>
                    <th className="px-6 py-4">Parecer Logístico</th>
                    <th className="px-6 py-4">Distância / Frete</th>
                    <th className="px-6 py-4">Veículo</th>
                    <th className="px-6 py-4">Etapa Atual</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(supplier => {
                    const feasibility = supplier.logistics_analyses?.[0]?.feasibility || 'PENDING';
                    const activeLog = supplier.logistics_analyses?.[0];

                    return (
                      <tr key={supplier.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-snug">{supplier.name}</span>
                            <span className="text-xs text-slate-400">{supplier.supplier_type || 'Indústria'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {supplier.address ? `${supplier.address.city} - ${supplier.address.state}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getFeasibilityColor(feasibility as any)}>
                            {translateFeasibility(feasibility as any)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="font-bold text-slate-800">{activeLog?.distance_km ? `${activeLog.distance_km} km` : '-'}</span>
                          <span className="text-slate-400 block">{activeLog?.estimated_cost ? formatCurrency(activeLog.estimated_cost) : '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">{activeLog?.transport_type || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                            {supplier.current_stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/fornecedores/${supplier.id}`}>
                              <button className="text-xs text-[#2098D1] hover:text-[#1883B5] bg-[#E5F5F8] px-3 py-1.5 rounded-full font-bold border border-[#CCEAF1] cursor-pointer">
                                Ver Ficha 360º
                              </button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => handleOpenAnalysis(supplier)}>
                              Editar Parecer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Analysis Modal (Idêntico em todas as telas) */}
      {selectedSupplier && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          title={`Análise Logística — ${selectedSupplier.name}`} size="lg">
          <form onSubmit={handleSaveAnalysis} className="space-y-5">

            {/* Materials recap */}
            {selectedSupplier.materials && selectedSupplier.materials.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-600">Materiais Declarados:</span>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {selectedSupplier.materials.map((m, i) => (
                    <span key={i} className="font-semibold text-slate-700">
                      • {m.material_name}: {formatVolume(m.estimated_volume, m.unit)} ({m.transaction_type === 'purchase' ? 'Compra' : 'Doação'})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Documents attached */}
            {selectedSupplier.attached_documents && selectedSupplier.attached_documents.length > 0 && (
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs space-y-1">
                <span className="font-bold text-indigo-700">Documentos Anexados pelo Comercial:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSupplier.attached_documents.map(d => (
                    <span key={d.id} className="inline-flex items-center gap-1 font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      <FileCheck size={12} /> {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {selectedSupplier.address && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                <MapPin size={13} className="text-slate-400" />
                <span>{selectedSupplier.address.street || 'Endereço'}, {selectedSupplier.address.number || 'S/N'} — {selectedSupplier.address.neighborhood || ''} • {selectedSupplier.address.city}/{selectedSupplier.address.state}</span>
              </div>
            )}

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Distância até o local (km)" type="number"
                value={analysisForm.distance_km}
                onChange={e => setAnalysisForm(p => ({ ...p, distance_km: e.target.value }))}
                placeholder="Ex: 45" />

              <Input label="Custo estimado de frete (R$)" type="number"
                value={analysisForm.estimated_cost}
                onChange={e => setAnalysisForm(p => ({ ...p, estimated_cost: e.target.value }))}
                placeholder="Ex: 350" />

              {/* Tipo de Veículo */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Tipo de Veículo *</label>
                <select
                  value={analysisForm.transport_type}
                  onChange={e => setAnalysisForm(p => ({ ...p, transport_type: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  {transportTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {analysisForm.transport_type === 'Outros' && (
                  <input
                    type="text"
                    placeholder="Digite o outro tipo de transporte..."
                    value={analysisForm.custom_transport_type}
                    onChange={e => setAnalysisForm(p => ({ ...p, custom_transport_type: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>

              {/* Responsável pelo Transporte */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Responsável pelo Transporte *</label>
                <select
                  value={analysisForm.transport_responsible}
                  onChange={e => setAnalysisForm(p => ({ ...p, transport_responsible: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  {responsibleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {analysisForm.transport_responsible === 'Outros' && (
                  <input
                    type="text"
                    placeholder="Digite o responsável..."
                    value={analysisForm.custom_transport_responsible}
                    onChange={e => setAnalysisForm(p => ({ ...p, custom_transport_responsible: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>

              {/* Frequência Recomendada */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Frequência Recomendada *</label>
                <select
                  value={analysisForm.recommended_frequency}
                  onChange={e => setAnalysisForm(p => ({ ...p, recommended_frequency: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  {frequencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {analysisForm.recommended_frequency === 'Outros' && (
                  <input
                    type="text"
                    placeholder="Especifique a frequência (ex: 2x por semana, a cada 10 dias)..."
                    value={analysisForm.custom_frequency}
                    onChange={e => setAnalysisForm(p => ({ ...p, custom_frequency: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>

              <Select label="Decisão de Viabilidade *" value={analysisForm.feasibility}
                onChange={e => setAnalysisForm(p => ({ ...p, feasibility: e.target.value }))}
                options={feasibilityOptions} />
            </div>

            {/* Documentation checklist (shown only when Necessita Informação Adicional) */}
            {analysisForm.feasibility === 'NEED_INFO' && (
              <div className="space-y-2 p-3.5 bg-amber-50/70 border border-amber-300 rounded-xl">
                <label className="text-xs font-bold text-amber-900 uppercase tracking-widest block">Documentação Pendente a ser Solicitada</label>
                <div className="grid grid-cols-2 gap-2">
                  {DOC_CHECKLIST.map(doc => (
                    <label key={doc.key} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      pendingDocs.includes(doc.key)
                        ? 'border-amber-300 bg-amber-100 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}>
                      <input type="checkbox" className="rounded accent-amber-500"
                        checked={pendingDocs.includes(doc.key)}
                        onChange={() => toggleDoc(doc.key)} />
                      {doc.label}
                    </label>
                  ))}
                </div>

                {pendingDocs.includes('Outros') && (
                  <input
                    type="text"
                    placeholder="Especifique qual outra documentação está pendente..."
                    value={customPendingDoc}
                    onChange={e => setCustomPendingDoc(e.target.value)}
                    className="w-full mt-2 px-3 py-2 text-xs bg-white border border-amber-400 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                )}

                {pendingDocs.length > 0 && (
                  <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle size={10} />
                    {pendingDocs.length} pendência(s) marcada(s) para Compras providenciar.
                  </p>
                )}
              </div>
            )}

            {analysisForm.feasibility === 'NEED_INFO' && (
              <Input label="O que precisa ser esclarecido com Compras? (Gera pendência automática) *"
                value={analysisForm.need_info_reason}
                onChange={e => setAnalysisForm(p => ({ ...p, need_info_reason: e.target.value }))}
                placeholder="Ex: Confirmar se o acesso do caminhão Truck comporta portão de 4m" required />
            )}

            <Input label="Infraestrutura necessária no local"
              value={analysisForm.conditioning_infrastructure_needed}
              onChange={e => setAnalysisForm(p => ({ ...p, conditioning_infrastructure_needed: e.target.value }))}
              placeholder="Ex: Deixar 2 caçambas de 30m³, disponibilizar paleteira..." />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Observações Gerais da Logística</label>
              <textarea value={analysisForm.notes}
                onChange={e => setAnalysisForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Justifique a decisão, rotas sugeridas, pedágios ou restrições de trânsito..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
            </div>

            {analysisForm.feasibility === 'FEASIBLE' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-semibold">
                <CheckCircle size={16} />
                Este lead será homologado e integrado ao módulo de <strong>Geradores</strong>.
              </div>
            )}

            {analysisForm.feasibility === 'INFEASIBLE' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-semibold">
                <XCircle size={16} />
                Este lead será marcado como <strong>Inviável</strong> e constará em Geradores com status de inviabilidade.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Salvar Parecer</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Schedule Collection Modal */}
      {schedulingSupplier && (
        <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)}
          title={`Agendar Coleta — ${schedulingSupplier.name}`} size="md">
          <form onSubmit={handleSaveSchedule} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
              <p className="font-bold text-slate-800">Endereço de Coleta:</p>
              <p className="text-slate-600">
                {schedulingSupplier.address ? `${schedulingSupplier.address.street || ''}, ${schedulingSupplier.address.number || ''} — ${schedulingSupplier.address.city}/${schedulingSupplier.address.state}` : 'Não informado'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Data Programada da Coleta *"
                type="date"
                value={scheduleForm.scheduled_date}
                onChange={e => setScheduleForm(p => ({ ...p, scheduled_date: e.target.value }))}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Frequência da Coleta (Recorrência) *</label>
                <select
                  value={scheduleForm.frequency}
                  onChange={e => setScheduleForm(p => ({ ...p, frequency: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                >
                  {frequencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {scheduleForm.frequency === 'Outros' && (
                  <input
                    type="text"
                    placeholder="Especifique (ex: 2x por semana, a cada 10 dias)..."
                    value={scheduleForm.custom_frequency}
                    onChange={e => setScheduleForm(p => ({ ...p, custom_frequency: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>
            </div>

            <p className="text-[11px] text-indigo-700 bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-100 leading-relaxed">
              💡 <strong>Aviso Antecipado (3 dias):</strong> Ao confirmar, o gerador sai desta lista imediatamente. Ele reaparecerá automaticamente aqui <strong>3 dias antes</strong> da data da próxima coleta para a Logística realizar o novo agendamento.
            </p>

            <Input
              label="Material a Coletar *"
              value={scheduleForm.material_name}
              onChange={e => setScheduleForm(p => ({ ...p, material_name: e.target.value }))}
              placeholder="Ex: Papelão Ondulado"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Volume Estimado *"
                type="number"
                value={scheduleForm.estimated_volume}
                onChange={e => setScheduleForm(p => ({ ...p, estimated_volume: e.target.value }))}
                placeholder="1000"
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Unidade</label>
                <select
                  value={scheduleForm.unit}
                  onChange={e => setScheduleForm(p => ({ ...p, unit: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="un">un</option>
                  <option value="m³">m³</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Motorista"
                value={scheduleForm.driver_name}
                onChange={e => setScheduleForm(p => ({ ...p, driver_name: e.target.value }))}
                placeholder="Ex: Carlos Oliveira"
              />
              <Input
                label="Transportadora / Veículo"
                value={scheduleForm.carrier_name}
                onChange={e => setScheduleForm(p => ({ ...p, carrier_name: e.target.value }))}
                placeholder="Ex: Terceirizado iWrc (VUC)"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Observações Operacionais</label>
              <textarea
                value={scheduleForm.notes}
                onChange={e => setScheduleForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Horário de chegada, instruções de pesagem..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none min-h-[70px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsScheduleModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmar Agendamento</Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}