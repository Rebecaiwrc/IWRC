'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/features/shared/services/dbService';
import { Supplier, AttachedDocument, MaterialDispatch, DispatchDestinationType } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import {
  translateFeasibility,
  getFeasibilityColor,
  formatVolume,
  formatDate,
  formatCurrency,
  translateDestinationType,
  getLogisticsSlaInfo,
  translateMaterialName,
  translateSupplierType,
  translateLeadSource,
  formatSupplierCode
} from '@/lib/utils';
import {
  Truck,
  MapPin,
  FileEdit,
  CheckCircle,
  CheckCircle2,
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
  Download,
  TrendingUp,
  DollarSign,
  PackageCheck,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Layers,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export const DOC_CHECKLIST = [
  { key: 'Aguardando dados do MTR',    label: 'Aguardando dados do MTR' },
  { key: 'Aguardando Carta de Doação', label: 'Aguardando Carta de Doação' },
  { key: 'Aguardando Nota Fiscal',     label: 'Aguardando Nota Fiscal' },
  { key: 'Outros',                     label: 'Outros (digitar pendência)' }
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
  { value: 'PENDING', label: '⏳ Em Análise' }
];

export const DISPATCH_DESTINATION_OPTIONS: { value: DispatchDestinationType; label: string }[] = [
  { value: 'sale', label: 'Venda Comercial' },
  { value: 'recycler', label: 'Reciclador Homologado' },
  { value: 'coprocessing', label: 'Coprocessamento' },
  { value: 'donation', label: 'Doação' },
  { value: 'other', label: 'Outra Destinação' }
];

export const DISPATCH_MATERIAL_OPTIONS = [
  'Papelão',
  'Papel Branco Sigiloso',
  'Papel Misto',
  'Plástico Filme PEBD',
  'Plástico Rígido PEAD',
  'PET',
  'PP (Polipropileno)',
  'Sucata de Alumínio',
  'Sucata de Ferro/Aço',
  'Cobre',
  'Vidro Moído / Cacos',
  'Eletrônicos (REEE)',
  'Outros'
];

import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { useToast } from '@/features/shared/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function LogisticsPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const { showSuccess, showError, showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role === 'BUYER') {
      router.replace('/prospeccao');
    }
  }, [currentUser, router]);

  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [dispatches, setDispatches] = useState<MaterialDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'scheduling' | 'history' | 'dispatches'>('queue');
  const [queueSlaFilter, setQueueSlaFilter] = useState<'ALL' | 'OVERDUE' | 'ON_TIME'>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<string[]>([]);
  const [customPendingDoc, setCustomPendingDoc] = useState('');

  // Dispatches Form & Filtering
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchSearch, setDispatchSearch] = useState('');
  const [dispatchDestinationFilter, setDispatchDestinationFilter] = useState('ALL');

  if (currentUser && currentUser.role === 'BUYER') {
    return null;
  }
  const [dispatchForm, setDispatchForm] = useState<{
    buyer_name: string;
    buyer_document: string;
    material_name: string;
    custom_material_name: string;
    quantity_kg: string;
    unit_price: string;
    total_value: string;
    dispatch_date: string;
    invoice_number: string;
    mtr_number: string;
    carrier_name: string;
    vehicle_plate: string;
    driver_name: string;
    destination_type: DispatchDestinationType;
    notes: string;
  }>({
    buyer_name: '',
    buyer_document: '',
    material_name: 'Papelão',
    custom_material_name: '',
    quantity_kg: '',
    unit_price: '',
    total_value: '',
    dispatch_date: new Date().toISOString().split('T')[0],
    invoice_number: '',
    mtr_number: '',
    carrier_name: '',
    vehicle_plate: '',
    driver_name: '',
    destination_type: 'sale',
    notes: ''
  });

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
    storage_provision_cost: '',
    storage_provision_delivery_date: '',
    feasibility: 'FEASIBLE',
    notes: '',
    need_info_reason: ''
  });

  // Scheduling Form
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingSupplier, setSchedulingSupplier] = useState<Supplier | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
      const [s, d] = await Promise.all([
        dbService.getSuppliers(),
        dbService.getMaterialDispatches()
      ]);
      setAllSuppliers(s);
      setDispatches(d);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Buyer vs Admin Visibility Filtering
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

  // 1. Queue: Leads in LOGISTICS stage that are pending or in progress (stays in queue when IN_PROGRESS)
  const queue = allSuppliers
    .filter(s => isResponsibleForSupplier(s))
    .filter(s => {
      const act = s.logistics_analyses?.[0];
      const isLogisticsStage = s.current_stage === 'LOGISTICS' || s.prospecting_status === 'WAITING_LOGISTICS';
      if (!isLogisticsStage) return false;

      // If feasibility is NEED_INFO, it is currently waiting in the Compras tab
      if (act?.feasibility === 'NEED_INFO') return false;

      const isCompleted = Boolean(
        act && 
        act.feasibility && 
        (act.feasibility === 'FEASIBLE' || act.feasibility === 'INFEASIBLE') &&
        s.current_stage !== 'LOGISTICS' && s.prospecting_status !== 'WAITING_LOGISTICS'
      );
      return !isCompleted;
    });

  const overdueQueueCount = queue.filter(s => getLogisticsSlaInfo(s, 5, language)?.isOverdue).length;
  const onTimeQueueCount = queue.length - overdueQueueCount;

  const filteredQueue = queue.filter(s => {
    const sla = getLogisticsSlaInfo(s, 5, language);
    if (queueSlaFilter === 'OVERDUE') return sla?.isOverdue;
    if (queueSlaFilter === 'ON_TIME') return !sla?.isOverdue;
    return true;
  });
  
  // 2. Scheduling: Suppliers awaiting collection scheduling or storage container delivery scheduling
  const schedulingQueue = allSuppliers
    .filter(s => isResponsibleForSupplier(s))
    .filter(s => {
      const activeLog = s.logistics_analyses?.[0];
      const isSelfDelivery = 
        activeLog?.transport_responsible === 'Fornecedor (entrega no Hub)' ||
        activeLog?.transport_type === 'Entrega Própria (Gerador)' ||
        activeLog?.transport_responsible?.toLowerCase().includes('fornecedor') ||
        activeLog?.transport_responsible?.toLowerCase().includes('hub') ||
        activeLog?.transport_type?.toLowerCase().includes('própria') ||
        activeLog?.transport_type?.toLowerCase().includes('propria') ||
        s.transport_responsible === 'Fornecedor (entrega no Hub)' ||
        (s as any).self_delivery === true;

      const needsStorage = s.materials?.some(m => m.needs_storage_provision);

      // If supplier delivers to Hub and DOES NOT need storage containers, iWrc does not collect or deliver containers
      if (isSelfDelivery && !needsStorage) {
        return false;
      }

      // If supplier ALREADY has an upcoming scheduled collection or container delivery, it has already been scheduled
      const scheduledCols = (s.collections || []).filter(c => c.status === 'SCHEDULED');
      if (scheduledCols.length > 0) {
        return false;
      }

      // Special Case: Self-Delivery with Storage Provision Need
      // Appears in scheduling queue once Logistics approves feasibility, specifically to schedule the container delivery!
      if (isSelfDelivery && needsStorage) {
        const isFeasible = activeLog?.feasibility === 'FEASIBLE';
        const hasNoScheduledCols = !s.collections || s.collections.length === 0;
        return isFeasible && hasNoScheduledCols;
      }

      // 1. Initial 1st collection pending (standard flow)
      const isInitialPending = 
        (s.current_stage === 'COLLECTION' && (!s.collections || s.collections.length === 0)) || 
        (s.backlog_reason?.toLowerCase().includes('agendamento') && (!s.collections || s.collections.length === 0)) ||
        (s.logistics_analyses?.[0]?.feasibility === 'FEASIBLE' && (!s.collections || s.collections.length === 0));
      
      if (isInitialPending) return true;

      // 2. Active operation: check if within 3 days of next collection cycle and not yet scheduled
      if (s.current_stage === 'OPERATION') {
        const freq = activeLog?.recommended_frequency || 'Mensal';
        if (freq.toLowerCase().includes('demanda') || freq.toLowerCase().includes('única') || freq.toLowerCase().includes('unica')) return false;

        // Find the latest scheduled collection date
        const allColDates = (s.collections || [])
          .map(c => c.scheduled_date)
          .concat(s.last_collection_date ? [s.last_collection_date] : [])
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const latestDateStr = allColDates[0];
        if (!latestDateStr) return true;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Calculate next due date
        const nextDue = getNextCollectionDate(latestDateStr, freq);
        
        // Appears 3 days before the next due date
        const threeDaysBeforeNextDue = new Date(nextDue.getTime() - 3 * 24 * 60 * 60 * 1000);
        
        return today.getTime() >= threeDaysBeforeNextDue.getTime();
      }

      return false;
    });

  // 3. History: Any supplier with a logistics evaluation completed
  const history = allSuppliers
    .filter(s => isResponsibleForSupplier(s))
    .filter(s => {
      const act = s.logistics_analyses?.[0];
      const isCompleted = Boolean(
        act && 
        act.feasibility && 
        (act.feasibility === 'FEASIBLE' || act.feasibility === 'NEED_INFO' || act.feasibility === 'INFEASIBLE')
      );
      return isCompleted || (['DOCUMENTATION', 'COLLECTION', 'OPERATION'] as string[]).includes(s.current_stage);
    });

  // 4. Outbound Material Dispatches & Sales Filtering
  const filteredDispatches = dispatches.filter(d => {
    const matchesSearch = !dispatchSearch || 
      d.buyer_name.toLowerCase().includes(dispatchSearch.toLowerCase()) ||
      (d.buyer_document && d.buyer_document.toLowerCase().includes(dispatchSearch.toLowerCase())) ||
      d.material_name.toLowerCase().includes(dispatchSearch.toLowerCase()) ||
      (d.invoice_number && d.invoice_number.toLowerCase().includes(dispatchSearch.toLowerCase())) ||
      (d.mtr_number && d.mtr_number.toLowerCase().includes(dispatchSearch.toLowerCase())) ||
      (d.carrier_name && d.carrier_name.toLowerCase().includes(dispatchSearch.toLowerCase()));

    const matchesDest = dispatchDestinationFilter === 'ALL' || d.destination_type === dispatchDestinationFilter;

    return matchesSearch && matchesDest;
  });

  const totalDispatchedKg = dispatches.reduce((acc, d) => acc + (Number(d.quantity_kg) || 0), 0);
  const totalDispatchedRevenue = dispatches.reduce((acc, d) => acc + (Number(d.total_value) || 0), 0);
  const totalDispatchedLoads = dispatches.length;
  const avgPricePerKg = totalDispatchedKg > 0 ? (totalDispatchedRevenue / totalDispatchedKg) : 0;

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.buyer_name || !dispatchForm.quantity_kg) {
      alert(language === 'pt' ? 'Preencha o nome do comprador e a quantidade expedida.' : 'Please fill in buyer name and quantity.');
      return;
    }
    const finalMaterial = (dispatchForm.material_name === 'Outros' && dispatchForm.custom_material_name.trim())
      ? dispatchForm.custom_material_name.trim()
      : dispatchForm.material_name;

    try {
      setIsSubmitting(true);
      await dbService.createMaterialDispatch({
        buyer_name: dispatchForm.buyer_name,
        buyer_document: dispatchForm.buyer_document || null,
        material_name: finalMaterial || 'Material Geral',
        quantity_kg: Number(dispatchForm.quantity_kg) || 0,
        unit_price: Number(dispatchForm.unit_price) || 0,
        total_value: Number(dispatchForm.total_value) || (Number(dispatchForm.quantity_kg) * Number(dispatchForm.unit_price)),
        dispatch_date: dispatchForm.dispatch_date,
        invoice_number: dispatchForm.invoice_number || null,
        mtr_number: dispatchForm.mtr_number || null,
        carrier_name: dispatchForm.carrier_name || null,
        vehicle_plate: dispatchForm.vehicle_plate || null,
        driver_name: dispatchForm.driver_name || null,
        destination_type: dispatchForm.destination_type,
        notes: dispatchForm.notes || null,
        created_by: currentUser?.id || null
      });

      setIsDispatchModalOpen(false);
      setDispatchForm({
        buyer_name: '',
        buyer_document: '',
        material_name: 'Papelão',
        custom_material_name: '',
        quantity_kg: '',
        unit_price: '',
        total_value: '',
        dispatch_date: new Date().toISOString().split('T')[0],
        invoice_number: '',
        mtr_number: '',
        carrier_name: '',
        vehicle_plate: '',
        driver_name: '',
        destination_type: 'sale',
        notes: ''
      });
      await fetchData();
      showToast(language === 'pt' ? 'Saída de material registrada com sucesso.' : 'Material dispatch recorded successfully.');
    } catch (err: any) {
      console.error(err);
      showToast(`Erro ao registrar saída: ${err.message || 'Falha ao salvar'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDispatch = async (dispatchId: string, buyerName: string) => {
    if (!confirm(language === 'pt' ? `Excluir o registro de saída para "${buyerName}"?` : `Delete dispatch record for "${buyerName}"?`)) return;
    try {
      await dbService.deleteMaterialDispatch(dispatchId);
      await fetchData();
      showToast(language === 'pt' ? 'Saída excluída com sucesso.' : 'Dispatch deleted successfully.');
    } catch (err) {
      console.error(err);
      showToast(language === 'pt' ? 'Erro ao excluir saída.' : 'Error deleting dispatch.');
    }
  };

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
        storage_provision_cost: existing.storage_provision_cost?.toString() || '',
        storage_provision_delivery_date: existing.storage_provision_delivery_date || '',
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
        storage_provision_cost: '',
        storage_provision_delivery_date: '',
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

      const isGenTransport = finalResponsible === 'Fornecedor (entrega no Hub)';

      // Save logistics analysis
      await dbService.saveLogisticsAnalysis({
        supplier_id: selectedSupplier.id,
        distance_km: isGenTransport ? null : (Number(analysisForm.distance_km) || null),
        transport_type: isGenTransport ? 'Entrega Própria (Gerador)' : (finalTransport || null),
        estimated_cost: isGenTransport ? 0 : (Number(analysisForm.estimated_cost) || null),
        recommended_frequency: finalFrequency || null,
        transport_responsible: finalResponsible || null,
        conditioning_infrastructure_needed: analysisForm.conditioning_infrastructure_needed || null,
        storage_provision_cost: analysisForm.storage_provision_cost ? Number(analysisForm.storage_provision_cost) : null,
        storage_provision_delivery_date: analysisForm.storage_provision_delivery_date || null,
        feasibility: analysisForm.feasibility as any,
        notes: analysisForm.notes || null,
        analyst_id: currentUser.id,
        pending_docs: finalPendingDocs
      } as any);

      let newStage = selectedSupplier.current_stage;
      let newStatus = selectedSupplier.current_status;
      let backlogReason = null;
      let newDeadline: string | null = null;
      let isExtension = false;

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
          backlogReason = null;
        }
      } else if (analysisForm.feasibility === 'NEED_INFO') {
        newStage = 'LOGISTICS';
        newStatus = 'PENDING';
        backlogReason = analysisForm.need_info_reason || (finalPendingDocs.length > 0 ? `Pendência documental: ${finalPendingDocs.join(', ')}` : 'Logística solicitou informações adicionais ao Comercial');
        await dbService.addSupplierTask({
          supplier_id: selectedSupplier.id,
          description: `Logística precisa de info: ${backlogReason}`,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      } else if (analysisForm.feasibility === 'PENDING' || analysisForm.feasibility === 'IN_PROGRESS') {
        newStage = 'LOGISTICS';
        newStatus = 'IN_PROGRESS';
        isExtension = true;

        // Prorroga automaticamente o prazo por mais 5 dias a partir do prazo atual
        const baseTime = selectedSupplier.logistics_deadline
          ? new Date(selectedSupplier.logistics_deadline).getTime()
          : (selectedSupplier.sent_to_logistics_at
              ? new Date(selectedSupplier.sent_to_logistics_at).getTime() + 5 * 24 * 60 * 60 * 1000
              : Date.now());

        const extendedTime = Math.max(baseTime, Date.now()) + 5 * 24 * 60 * 60 * 1000;
        const extendedDate = new Date(extendedTime);
        newDeadline = extendedDate.toISOString();
        const formattedDate = extendedDate.toLocaleDateString('pt-BR');

        backlogReason = `Em análise pela Logística (prazo prorrogado até ${formattedDate})`;
      }

      const updatePayload: Partial<Supplier> = {
        current_stage: newStage, 
        current_status: newStatus, 
        backlog_reason: backlogReason
      };
      if (newDeadline) {
        updatePayload.logistics_deadline = newDeadline;
      }

      await dbService.updateSupplier(selectedSupplier.id, updatePayload);

      const formattedDeadline = newDeadline ? new Date(newDeadline).toLocaleDateString('pt-BR') : '';

      await dbService.addSupplierStatusHistory({
        supplier_id: selectedSupplier.id,
        old_stage: selectedSupplier.current_stage, 
        new_stage: newStage,
        old_status: selectedSupplier.current_status, 
        new_status: newStatus,
        user_id: currentUser.id,
        notes: isExtension
          ? `Prazo de análise prorrogado por mais 5 dias (novo prazo: ${formattedDeadline}). Decisão: Em Análise.${analysisForm.notes ? ' Notas: ' + analysisForm.notes : ''}`
          : `Parecer logístico: ${translateFeasibility(analysisForm.feasibility as any)}.${finalPendingDocs.length > 0 ? ' Pendências: ' + finalPendingDocs.join(', ') : ''}`
      });

      await dbService.addSupplierInteraction({
        supplier_id: selectedSupplier.id, 
        user_id: currentUser.id, 
        type: 'internal_obs',
        description: isExtension
          ? `Logística manteve o gerador em análise. Prazo prorrogado em +5 dias (novo prazo: ${formattedDeadline}). ${analysisForm.notes ? 'Observações: ' + analysisForm.notes : ''}`
          : `Logística concluiu análise. Decisão: ${translateFeasibility(analysisForm.feasibility as any)}. Notas: ${analysisForm.notes || '-'}`
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) { 
      console.error('Error saving logistics analysis:', err); 
      alert(`Erro ao salvar análise: ${err.message || err.details || 'Verifique sua conexão.'}`); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleOpenScheduleModal = (supplier: Supplier) => {
    setSchedulingSupplier(supplier);
    const mainMaterial = supplier.materials?.[0];
    const initialFreq = supplier.logistics_analyses?.[0]?.recommended_frequency || 'Mensal';
    const isStdFreq = frequencyOptions.some(o => o.value === initialFreq && o.value !== 'Outros');

    const isSelfDeliveryWithStorage = Boolean(
      (
        supplier.transport_responsible === 'Fornecedor (entrega no Hub)' ||
        supplier.logistics_analyses?.[0]?.transport_responsible === 'Fornecedor (entrega no Hub)' ||
        supplier.logistics_analyses?.[0]?.transport_type === 'Entrega Própria (Gerador)'
      ) && supplier.materials?.some(m => m.needs_storage_provision)
    );

    const containerSummary = (supplier.materials || [])
      .filter(m => m.needs_storage_provision)
      .map(m => `${m.storage_provision_quantity || 1}x ${m.storage_provision_type === 'Outros' ? (m.storage_provision_custom_type || 'Recipiente') : (m.storage_provision_type || 'Bag')}`)
      .join(', ');

    setScheduleForm({
      scheduled_date: '',
      frequency: isSelfDeliveryWithStorage ? 'Entrega única' : (isStdFreq ? initialFreq : 'Outros'),
      custom_frequency: isStdFreq ? '' : initialFreq,
      material_name: isSelfDeliveryWithStorage ? (containerSummary || 'Meios de Armazenamento (Recipientes)') : (mainMaterial ? mainMaterial.material_name : ''),
      estimated_volume: isSelfDeliveryWithStorage ? '1' : (mainMaterial ? mainMaterial.estimated_volume.toString() : ''),
      unit: isSelfDeliveryWithStorage ? 'un' : (mainMaterial?.unit || 'kg'),
      driver_name: '',
      carrier_name: isSelfDeliveryWithStorage ? 'iWrc / Logística' : (supplier.logistics_analyses?.[0]?.transport_responsible || 'Terceirizado da iWrc'),
      notes: isSelfDeliveryWithStorage ? `Entrega de meios de armazenamento: ${containerSummary || 'Bags/Caçambas/Contêineres'}` : ''
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingSupplier) return;
    if (!scheduleForm.scheduled_date) {
      alert(language === 'pt' ? 'Por favor, selecione a data da coleta.' : 'Please select the collection date.');
      return;
    }

    const isSelfDeliveryWithStorage = Boolean(
      (
        schedulingSupplier.transport_responsible === 'Fornecedor (entrega no Hub)' ||
        schedulingSupplier.logistics_analyses?.[0]?.transport_responsible === 'Fornecedor (entrega no Hub)' ||
        schedulingSupplier.logistics_analyses?.[0]?.transport_type === 'Entrega Própria (Gerador)'
      ) && schedulingSupplier.materials?.some(m => m.needs_storage_provision)
    );

    const containerSummary = (schedulingSupplier.materials || [])
      .filter(m => m.needs_storage_provision)
      .map(m => `${m.storage_provision_quantity || 1}x ${m.storage_provision_type === 'Outros' ? (m.storage_provision_custom_type || 'Recipiente') : (m.storage_provision_type || 'Bag')}`)
      .join(', ');

    const targetSupplier = schedulingSupplier;
    const currentScheduleForm = { ...scheduleForm };

    // Close modal immediately and show non-blocking toast
    setIsScheduleModalOpen(false);
    setSchedulingSupplier(null);

    const msg = isSelfDeliveryWithStorage 
      ? (language === 'pt' ? 'Entrega de recipientes agendada com sucesso.' : 'Container delivery scheduled successfully.')
      : (language === 'pt' ? 'Coleta agendada com sucesso.' : 'Collection scheduled successfully.');
    
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    try {
      // Parallel fast execution
      await Promise.all([
        dbService.createCollection(
          {
            supplier_id: targetSupplier.id,
            scheduled_date: currentScheduleForm.scheduled_date,
            driver_name: currentScheduleForm.driver_name || null,
            carrier_name: currentScheduleForm.carrier_name || null,
            notes: currentScheduleForm.notes || (isSelfDeliveryWithStorage ? `Entrega de meios de armazenamento: ${containerSummary}` : null),
            status: 'SCHEDULED'
          },
          [
            {
              material_name: currentScheduleForm.material_name,
              estimated_volume: Number(currentScheduleForm.estimated_volume) || 0,
              unit: currentScheduleForm.unit
            }
          ]
        ),
        dbService.updateSupplier(targetSupplier.id, {
          current_stage: 'OPERATION',
          current_status: 'APPROVED',
          last_collection_date: currentScheduleForm.scheduled_date,
          first_collection_date: targetSupplier.first_collection_date || currentScheduleForm.scheduled_date,
          backlog_reason: null
        }),
        dbService.addSupplierStatusHistory({
          supplier_id: targetSupplier.id,
          old_stage: targetSupplier.current_stage,
          new_stage: 'OPERATION',
          old_status: targetSupplier.current_status,
          new_status: 'APPROVED',
          user_id: currentUser?.id || 'usr-logistics',
          notes: isSelfDeliveryWithStorage
            ? `Entrega de meios de armazenamento (${containerSummary || 'Recipientes'}) agendada para ${formatDate(currentScheduleForm.scheduled_date)}. Responsável: ${currentScheduleForm.driver_name || '-'}, Veículo: ${currentScheduleForm.carrier_name || '-'}`
            : `Coleta agendada para ${formatDate(currentScheduleForm.scheduled_date)} (Recorrência: ${currentScheduleForm.frequency}). Motorista: ${currentScheduleForm.driver_name || '-'}, Transportadora: ${currentScheduleForm.carrier_name || '-'}`
        }),
        dbService.addSupplierInteraction({
          supplier_id: targetSupplier.id,
          user_id: currentUser?.id || 'usr-logistics',
          type: 'internal_obs',
          description: isSelfDeliveryWithStorage
            ? `Entrega de meios de armazenamento (${containerSummary || 'Recipientes'}) programada para ${formatDate(currentScheduleForm.scheduled_date)}.`
            : `Coleta operacional agendada para ${formatDate(currentScheduleForm.scheduled_date)} (${currentScheduleForm.material_name}, ${currentScheduleForm.estimated_volume}${currentScheduleForm.unit}, Recorrência: ${currentScheduleForm.frequency}).`
        })
      ]);

      const existingLog = targetSupplier.logistics_analyses?.[0];
      if (existingLog) {
        await dbService.saveLogisticsAnalysis({
          supplier_id: targetSupplier.id,
          distance_km: existingLog.distance_km,
          transport_type: existingLog.transport_type,
          estimated_cost: existingLog.estimated_cost,
          recommended_frequency: currentScheduleForm.frequency,
          transport_responsible: existingLog.transport_responsible,
          conditioning_infrastructure_needed: existingLog.conditioning_infrastructure_needed,
          storage_provision_cost: existingLog.storage_provision_cost,
          storage_provision_delivery_date: isSelfDeliveryWithStorage ? currentScheduleForm.scheduled_date : existingLog.storage_provision_delivery_date,
          feasibility: existingLog.feasibility,
          notes: existingLog.notes,
          analyst_id: existingLog.analyst_id,
          pending_docs: existingLog.pending_docs || []
        } as any);
      }

      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar agendamento: ${err.message || err.details || 'Tente novamente.'}`);
      await fetchData();
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
      showToast('Gerador excluído com sucesso.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir gerador.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Carregando módulo de logística...</p>
    </div>
  );

  return (
    <div className="space-y-6 font-sans relative">

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-xl shadow-emerald-600/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={18} className="shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {t('logistics.title', 'Logística & Coletas')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('logistics.subtitle', 'Analise a viabilidade dos leads enviados pelo Comercial, realize os agendamentos de coleta e gerencie as saídas de materiais.')}
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

      {/* Tabs Navigation */}
      <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 w-fit overflow-x-auto">
        <button onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'queue' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <Clock size={14} />
          {language === 'pt' ? 'Aguardando Análise' : 'Awaiting Analysis'}
          {queue.length > 0 && <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{queue.length}</span>}
        </button>

        <button onClick={() => setActiveTab('scheduling')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'scheduling' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <Calendar size={14} />
          {language === 'pt' ? 'Agendamento de Coletas' : 'Collection Scheduling'}
          {schedulingQueue.length > 0 && <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{schedulingQueue.length}</span>}
        </button>

        <button onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <CheckCircle size={14} />
          {language === 'pt' ? 'Histórico de Pareceres' : 'Opinion History'}
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-black">{history.length}</span>
        </button>

        <button onClick={() => setActiveTab('dispatches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'dispatches' ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
          <TrendingUp size={14} />
          {language === 'pt' ? 'Saídas & Vendas do Hub' : 'Hub Dispatches & Sales'}
          {dispatches.length > 0 && <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{dispatches.length}</span>}
        </button>
      </div>

      {/* TAB 1: FILA DE ANÁLISE INICIAL */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* KPI Filter Pills */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-850 p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 mr-1">
              {language === 'pt' ? 'Filtrar por prazo:' : 'Filter by deadline:'}
            </span>
            <button
              onClick={() => setQueueSlaFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${queueSlaFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {language === 'pt' ? 'Todos' : 'All'} ({queue.length})
            </button>
            <button
              onClick={() => setQueueSlaFilter('OVERDUE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${queueSlaFilter === 'OVERDUE' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'}`}
            >
              {language === 'pt' ? 'Pendentes' : 'Pending'} ({overdueQueueCount})
            </button>
            <button
              onClick={() => setQueueSlaFilter('ON_TIME')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${queueSlaFilter === 'ON_TIME' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
            >
              {language === 'pt' ? 'No prazo' : 'On time'} ({onTimeQueueCount})
            </button>
          </div>

          <Card className="overflow-hidden !p-0 border border-slate-200">
            {filteredQueue.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Clock size={36} className="mx-auto text-slate-300 opacity-60" />
                <p className="font-semibold text-sm">
                  {queueSlaFilter === 'OVERDUE'
                    ? (language === 'pt' ? 'Nenhum lead com prazo de 5 dias vencido!' : 'No leads with 5-day deadline overdue!')
                    : (language === 'pt' ? 'Nenhum lead pendente de análise inicial no momento.' : 'No leads pending initial analysis at the moment.')}
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
                      <th className="px-6 py-4">{language === 'pt' ? 'Prazo / SLA Logística' : 'SLA / Logistics Deadline'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Documentos / Anexos' : 'Documents / Attachments'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Responsável Comercial' : 'Commercial Responsible'}</th>
                      <th className="px-6 py-4 text-right">{t('suppliers.actions', 'Ações')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQueue.map(supplier => {
                      const sla = getLogisticsSlaInfo(supplier, 5, language);
                      const isOverdue = sla?.isOverdue;

                      return (
                        <tr 
                          key={supplier.id} 
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 leading-snug">{supplier.name}</span>
                              <span className="text-xs text-slate-400">{translateSupplierType(supplier.supplier_type, language)} • {translateLeadSource(supplier.lead_source, language)}</span>
                              {(supplier.backlog_reason?.toLowerCase().includes('respondido por compras') || supplier.logistics_analyses?.[0]?.notes?.includes('Resposta de Compras')) && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 w-fit mt-1 shadow-2xs">
                                  🔄 {language === 'pt' ? 'Respondido por Compras' : 'Answered by Purchasing'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {supplier.address ? (
                              <div className="flex flex-col text-xs">
                                <span className="font-medium text-slate-700">{supplier.address.city} - {supplier.address.state}</span>
                                {supplier.address.street && <span className="text-slate-400 text-[11px]">{supplier.address.street}, {supplier.address.number}</span>}
                              </div>
                            ) : <span className="text-slate-400 text-xs">{language === 'pt' ? 'Não informado' : 'Not provided'}</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              {supplier.materials && supplier.materials.length > 0 ? (
                                supplier.materials.map((m, i) => (
                                  <span key={i} className="text-xs font-semibold text-slate-700">
                                    • {translateMaterialName(m.material_name, language)} ({formatVolume(m.estimated_volume, m.unit)} • {m.transaction_type === 'purchase' ? (language === 'pt' ? 'Compra' : 'Purchase') : (language === 'pt' ? 'Doação' : 'Donation')})
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                                  ⚠️ {language === 'pt' ? 'Materiais pendentes' : 'Pending materials'}
                                </span>
                              )}
                            </div>
                          </td>
                          
                          {/* SLA / Prazo Column */}
                          <td className="px-6 py-4">
                            {isOverdue ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                {language === 'pt' ? 'Pendente' : 'Pending'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {language === 'pt' ? 'No prazo' : 'On time'}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {supplier.attached_documents && supplier.attached_documents.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {supplier.attached_documents.map(d => (
                                  <button
                                    key={d.id}
                                    onClick={() => handleDownloadDoc(d)}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#E5F5F8] text-[#2098D1] hover:bg-[#DDF4F9] px-2 py-0.5 rounded-full border border-[#CCEAF1] transition-all cursor-pointer text-left w-fit"
                                    title={language === 'pt' ? 'Clique para baixar ou visualizar arquivo' : 'Click to download or view file'}
                                  >
                                    <Download size={10} /> {d.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">{language === 'pt' ? 'Sem anexos' : 'No attachments'}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{supplier.responsible?.name || (language === 'pt' ? 'Não atribuído' : 'Unassigned')}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/fornecedores/${supplier.id}?from=logistica`}>
                                <button className="text-xs text-[#2098D1] hover:text-[#1883B5] bg-[#E5F5F8] px-3 py-1.5 rounded-full font-bold border border-[#CCEAF1] cursor-pointer">
                                  {language === 'pt' ? 'Analisar' : 'Review'}
                                </button>
                              </Link>

                              <Button size="sm" className="gap-1 shadow-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => handleOpenAnalysis(supplier)}>
                                <FileEdit size={12} />
                                {language === 'pt' ? 'Responder' : 'Respond'}
                              </Button>

                              <button
                                onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                                className="inline-flex items-center justify-center h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                                title={language === 'pt' ? 'Apagar Lead' : 'Delete Lead'}
                              >
                                <Trash2 size={13} />
                              </button>
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
        </div>
      )}

      {/* TAB 2: AGENDAMENTO DE COLETAS OPERACIONAIS */}
      {activeTab === 'scheduling' && (
        <Card className="overflow-hidden !p-0 border border-slate-200">
          {schedulingQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calendar size={36} className="mx-auto text-slate-300 opacity-60" />
              <p className="font-semibold text-sm">
                {language === 'pt' ? 'Nenhum gerador aguardando agendamento no momento.' : 'No generators awaiting scheduling at the moment.'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'pt' 
                  ? 'Os geradores liberados pelo Comercial e aqueles cujo ciclo da coleta mensal/periódica venceu reaparecem automaticamente aqui.'
                  : 'Generators released by Commercial and those due for periodic collection will automatically appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">{language === 'pt' ? 'Gerador' : 'Generator'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Endereço de Coleta' : 'Collection Address'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Materiais' : 'Materials'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Frequência' : 'Frequency'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Última Coleta' : 'Last Collection'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Situação do Agendamento' : 'Scheduling Status'}</th>
                    <th className="px-6 py-4 text-right">{language === 'pt' ? 'Ação' : 'Action'}</th>
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

                    const isSelfDeliveryWithStorage = Boolean(
                      (
                        supplier.transport_responsible === 'Fornecedor (entrega no Hub)' ||
                        activeLog?.transport_responsible === 'Fornecedor (entrega no Hub)' ||
                        activeLog?.transport_type === 'Entrega Própria (Gerador)'
                      ) && supplier.materials?.some(m => m.needs_storage_provision)
                    );

                    return (
                      <tr key={supplier.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-snug">{supplier.name}</span>
                            <span className="text-xs text-slate-400">{formatSupplierCode(supplier.code)} • {supplier.supplier_type || (language === 'pt' ? 'Indústria' : 'Industry')}</span>
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
                                • {translateMaterialName(m.material_name, language)} ({formatVolume(m.estimated_volume, m.unit)})
                                {m.needs_storage_provision && (
                                  <span className="ml-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                    📦 {m.storage_provision_quantity || 1}x {m.storage_provision_type === 'Outros' ? (m.storage_provision_custom_type || 'Recipiente') : (m.storage_provision_type || 'Bag')}
                                  </span>
                                )}
                              </span>
                            )) : <span className="text-xs text-slate-400">{language === 'pt' ? 'Nenhum' : 'None'}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                            {isSelfDeliveryWithStorage ? '📦 Entrega única' : `🔄 ${freq}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {supplier.last_collection_date ? (
                            <div className="flex flex-col text-xs">
                              <span className="font-bold text-slate-800">{formatDate(supplier.last_collection_date)}</span>
                              <span className="text-[10px] text-slate-400">{language === 'pt' ? 'Última realizada' : 'Last completed'}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              {isSelfDeliveryWithStorage 
                                ? (language === 'pt' ? 'Aguardando entrega de recipientes' : 'Awaiting container delivery')
                                : (language === 'pt' ? 'Nenhuma (1ª coleta)' : 'None (1st collection)')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isSelfDeliveryWithStorage ? (
                            <Badge variant="purple" className="gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                              📦 {language === 'pt' ? 'Aguardando Entrega de Recipientes' : 'Awaiting Container Delivery'}
                            </Badge>
                          ) : hasLastDate && nextDueDate ? (
                            <Badge variant="warning" className="gap-1">
                              🔔 {language === 'pt' ? 'Nova Coleta Devida' : 'New Collection Due'} ({formatDate(nextDueDate.toISOString())})
                            </Badge>
                          ) : hasScheduledCol && latestCol ? (
                            <div className="flex flex-col gap-0.5">
                              <Badge variant="success">{language === 'pt' ? 'Agendada p/' : 'Scheduled for'} {formatDate(latestCol.scheduled_date)}</Badge>
                              {latestCol.driver_name && <span className="text-[10px] text-slate-500">{language === 'pt' ? 'Mot:' : 'Driver:'} {latestCol.driver_name}</span>}
                            </div>
                          ) : (
                            <Badge variant="info">
                              🆕 {language === 'pt' ? 'Aguardando 1º Agendamento' : 'Awaiting 1st Scheduling'}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/fornecedores/${supplier.id}`}>
                              <button className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer">
                                {language === 'pt' ? 'Ver Ficha' : 'View Details'}
                              </button>
                            </Link>
                            <Button
                              size="sm"
                              className={`gap-1.5 font-bold shadow-xs text-white ${isSelfDeliveryWithStorage ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                              onClick={() => handleOpenScheduleModal(supplier)}
                            >
                              <Calendar size={13} />
                              {isSelfDeliveryWithStorage
                                ? (language === 'pt' ? 'Agendar Entrega de Recipientes' : 'Schedule Container Delivery')
                                : hasLastDate 
                                  ? (language === 'pt' ? 'Agendar Próxima Coleta' : 'Schedule Next Collection') 
                                  : (language === 'pt' ? 'Agendar Coleta' : 'Schedule Collection')}
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
              {language === 'pt' ? 'Nenhum parecer concluído no histórico.' : 'No completed opinions in history.'}
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">{language === 'pt' ? 'Gerador' : 'Generator'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Endereço' : 'Address'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Parecer Logístico' : 'Logistics Decision'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Distância / Frete' : 'Distance / Freight'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Veículo' : 'Vehicle'}</th>
                    <th className="px-6 py-4">{language === 'pt' ? 'Etapa Atual' : 'Current Stage'}</th>
                    <th className="px-6 py-4 text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
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
                            <span className="text-xs text-slate-400">{supplier.supplier_type || (language === 'pt' ? 'Indústria' : 'Industry')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {supplier.address ? `${supplier.address.city} - ${supplier.address.state}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getFeasibilityColor(feasibility as any)}>
                            {translateFeasibility(feasibility as any, language)}
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
                                {language === 'pt' ? 'Ver Ficha 360º' : 'View 360º File'}
                              </button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => handleOpenAnalysis(supplier)}>
                              {language === 'pt' ? 'Editar Parecer' : 'Edit Opinion'}
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

      {/* TAB 4: SAÍDAS & VENDAS DE MATERIAIS DO HUB */}
      {activeTab === 'dispatches' && (
        <div className="space-y-6">

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {language === 'pt' ? 'Total Expedido' : 'Total Dispatched'}
                </p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatVolume(totalDispatchedKg, 'kg')}
                </h3>
              </div>
            </Card>

            <Card className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {language === 'pt' ? 'Faturamento de Saídas' : 'Dispatches Revenue'}
                </p>
                <h3 className="text-xl font-black text-emerald-600 mt-0.5">
                  {formatCurrency(totalDispatchedRevenue)}
                </h3>
              </div>
            </Card>

            <Card className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 text-[#2098D1] rounded-2xl flex items-center justify-center shrink-0">
                <PackageCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {language === 'pt' ? 'Cargas Expedidas' : 'Dispatched Loads'}
                </p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {totalDispatchedLoads}
                </h3>
              </div>
            </Card>

            <Card className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Layers size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {language === 'pt' ? 'Preço Médio / kg' : 'Avg Price / kg'}
                </p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(avgPricePerKg)}
                </h3>
              </div>
            </Card>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === 'pt' ? 'Buscar comprador, material, NF-e, MTR...' : 'Search buyer, material, invoice, MTR...'}
                  value={dispatchSearch}
                  onChange={e => setDispatchSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <select
                value={dispatchDestinationFilter}
                onChange={e => setDispatchDestinationFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-medium cursor-pointer"
              >
                <option value="ALL">{language === 'pt' ? 'Todas as Destinações' : 'All Destinations'}</option>
                {DISPATCH_DESTINATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => setIsDispatchModalOpen(true)}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Plus size={15} />
              {language === 'pt' ? 'Registrar Saída de Material' : 'Register Material Dispatch'}
            </Button>
          </div>

          {/* Table of Dispatches */}
          <Card className="overflow-hidden !p-0 border border-slate-200 dark:border-slate-800 shadow-sm">
            {filteredDispatches.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <TrendingUp size={36} className="mx-auto text-slate-300 opacity-60" />
                <p className="font-semibold text-sm">
                  {language === 'pt' ? 'Nenhuma saída de material registrada.' : 'No material dispatches recorded yet.'}
                </p>
                <p className="text-xs text-slate-400">
                  {language === 'pt' ? 'Clique em "Registrar Saída de Material" para lançar uma venda ou expedição do galpão.' : 'Click "Register Material Dispatch" to record a warehouse outbound sale or transfer.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">{language === 'pt' ? 'Data da Saída' : 'Dispatch Date'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Comprador / Destinatário' : 'Buyer / Destination'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Material' : 'Material'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Quantidade (kg)' : 'Quantity (kg)'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Preço e Valor Total' : 'Price & Total Value'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'NF-e & MTR' : 'Invoice & MTR'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Frete / Motorista' : 'Carrier / Driver'}</th>
                      <th className="px-6 py-4">{language === 'pt' ? 'Destinação' : 'Destination'}</th>
                      <th className="px-6 py-4 text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDispatches.map(disp => (
                      <tr key={disp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="font-bold text-slate-900 dark:text-white">{formatDate(disp.dispatch_date)}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white leading-snug">{disp.buyer_name}</span>
                            {disp.buyer_document && (
                              <span className="text-[11px] font-mono text-slate-400">{disp.buyer_document}</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                          <span className="inline-block bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                            {disp.material_name}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap font-black text-slate-900 dark:text-white">
                          {formatVolume(disp.quantity_kg, 'kg')}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-black text-emerald-600 block">
                            {formatCurrency(disp.total_value)}
                          </span>
                          {disp.unit_price ? (
                            <span className="text-[11px] text-slate-400">
                              {formatCurrency(disp.unit_price)} / kg
                            </span>
                          ) : null}
                        </td>

                        <td className="px-6 py-4 text-xs space-y-0.5">
                          {disp.invoice_number ? (
                            <p className="font-semibold text-slate-700 dark:text-slate-300">
                              NF: <span className="font-mono">{disp.invoice_number}</span>
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">Sem NF</span>
                          )}
                          {disp.mtr_number && (
                            <p className="text-[11px] text-slate-400 font-mono">
                              MTR: {disp.mtr_number}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-500 space-y-0.5">
                          <p className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Truck size={13} className="text-slate-400" />
                            {disp.carrier_name || (language === 'pt' ? 'Frota do Comprador' : 'Buyer Fleet')}
                          </p>
                          {(disp.driver_name || disp.vehicle_plate) && (
                            <p className="text-[11px] text-slate-400">
                              {[disp.driver_name, disp.vehicle_plate].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={disp.destination_type === 'sale' ? 'emerald' : disp.destination_type === 'recycler' ? 'info' : 'purple'}>
                            {translateDestinationType(disp.destination_type, language)}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteDispatch(disp.id, disp.buyer_name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                            title={language === 'pt' ? 'Excluir Saída' : 'Delete Dispatch'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>
      )}

      {/* Analysis Modal (Idêntico em todas as telas) */}
      {selectedSupplier && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={`Análise Logística — ${selectedSupplier.name}`} 
          size="lg"
          hasUnsavedChanges={Boolean(
            analysisForm.distance_km || 
            (analysisForm.estimated_cost && analysisForm.estimated_cost !== '0') || 
            analysisForm.notes || 
            analysisForm.need_info_reason || 
            analysisForm.conditioning_infrastructure_needed || 
            analysisForm.storage_provision_cost
          )}
        >
          <form onSubmit={handleSaveAnalysis} className="space-y-5">

            {/* Materials recap */}
            {selectedSupplier.materials && selectedSupplier.materials.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-600">{language === 'pt' ? 'Materiais Declarados:' : 'Declared Materials:'}</span>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {selectedSupplier.materials.map((m, i) => (
                    <span key={i} className="font-semibold text-slate-700">
                      • {translateMaterialName(m.material_name, language)}: {formatVolume(m.estimated_volume, m.unit)} ({m.transaction_type === 'purchase' ? (language === 'pt' ? 'Compra' : 'Purchase') : (language === 'pt' ? 'Doação' : 'Donation')})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Documents attached */}
            {selectedSupplier.attached_documents && selectedSupplier.attached_documents.length > 0 && (
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs space-y-1">
                <span className="font-bold text-indigo-700">{language === 'pt' ? 'Documentos Anexados pelo Comercial:' : 'Documents Attached by Commercial:'}</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSupplier.attached_documents.map(d => (
                    <span key={d.id} className="inline-flex items-center gap-1 font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      <FileCheck size={12} /> {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compras Reply Box if lead returned from Compras */}
            {(selectedSupplier.backlog_reason?.toLowerCase().includes('respondido por compras') || 
              selectedSupplier.logistics_analyses?.[0]?.notes?.includes('Resposta de Compras') ||
              selectedSupplier.logistics_analyses?.[0]?.notes?.includes('Retorno de Compras') ||
              selectedSupplier.logistics_analyses?.[0]?.notes?.includes('Esclarecimento de Compras')) && (
              <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-xl space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <MessageSquare size={15} className="text-amber-700" />
                  <span>{language === 'pt' ? '💬 Retorno e Esclarecimentos Enviados por Compras:' : '💬 Response from Purchasing Team:'}</span>
                </div>
                <div className="bg-white/95 p-3 rounded-lg border border-amber-200 text-xs text-slate-800 whitespace-pre-wrap font-medium leading-relaxed">
                  {selectedSupplier.logistics_analyses?.[0]?.notes?.includes('Retorno de Compras por')
                    ? selectedSupplier.logistics_analyses?.[0]?.notes?.split('Retorno de Compras por').pop()?.split(']:').slice(1).join(']:').trim()
                    : selectedSupplier.logistics_analyses?.[0]?.notes?.includes('Resposta de Compras por')
                      ? selectedSupplier.logistics_analyses?.[0]?.notes?.split('Resposta de Compras por').pop()?.split(']:').slice(1).join(']:').trim()
                      : selectedSupplier.backlog_reason}
                </div>
              </div>
            )}

            {/* Location */}
            {selectedSupplier.address && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                <MapPin size={13} className="text-slate-400" />
                <span>{selectedSupplier.address.street || (language === 'pt' ? 'Endereço' : 'Address')}, {selectedSupplier.address.number || 'S/N'} — {selectedSupplier.address.neighborhood || ''} • {selectedSupplier.address.city}/{selectedSupplier.address.state}</span>
              </div>
            )}

          {/* Responsável pelo Transporte */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Responsável pelo Transporte / Coleta *' : 'Freight / Transport Responsible *'}</label>
            <select
              value={analysisForm.transport_responsible}
              onChange={e => setAnalysisForm(p => ({ ...p, transport_responsible: e.target.value }))}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
            >
              {responsibleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {analysisForm.transport_responsible === 'Outros' && (
              <input
                type="text"
                placeholder={language === 'pt' ? 'Digite o responsável...' : 'Type responsible...'}
                value={analysisForm.custom_transport_responsible}
                onChange={e => setAnalysisForm(p => ({ ...p, custom_transport_responsible: e.target.value }))}
                className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            )}
          </div>

          {/* Banner if Generator handles transport */}
          {analysisForm.transport_responsible === 'Fornecedor (entrega no Hub)' ? (
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-xs space-y-1">
              <span className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                🚚 {language === 'pt' ? 'Coleta Realizada pelo Próprio Gerador (Entrega no Hub)' : 'Generator Self-Delivery to Hub'}
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                {language === 'pt' 
                  ? 'A iWrc não realizará o frete/transporte (o próprio gerador entregará no Hub). Preencha abaixo a cotação e previsão de entrega dos meios de armazenamento solicitados.'
                  : 'iWrc will not perform transportation. Please fill the storage container quote and delivery date below.'}
              </p>
            </div>
          ) : (
            /* Transport Quotation Fields */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="md:col-span-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  🚚 {language === 'pt' ? 'Cotação de Frete & Transporte' : 'Freight & Transport Quotation'}
                </span>
              </div>

              <Input label={language === 'pt' ? 'Distância até o local (km)' : 'Distance to site (km)'} type="number"
                value={analysisForm.distance_km}
                onChange={e => setAnalysisForm(p => ({ ...p, distance_km: e.target.value }))}
                placeholder="Ex: 45" />

              <Input label={language === 'pt' ? 'Custo estimado de frete (R$)' : 'Estimated Freight Cost (R$)'} type="number"
                value={analysisForm.estimated_cost}
                onChange={e => setAnalysisForm(p => ({ ...p, estimated_cost: e.target.value }))}
                placeholder="Ex: 350" />

              {/* Tipo de Veículo */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Tipo de Veículo *' : 'Vehicle Type *'}</label>
                <select
                  value={analysisForm.transport_type}
                  onChange={e => setAnalysisForm(p => ({ ...p, transport_type: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                >
                  {transportTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {analysisForm.transport_type === 'Outros' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Digite o outro tipo de transporte...' : 'Type transport type...'}
                    value={analysisForm.custom_transport_type}
                    onChange={e => setAnalysisForm(p => ({ ...p, custom_transport_type: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>

              {/* Frequência Recomendada */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Frequência Recomendada *' : 'Recommended Frequency *'}</label>
                <select
                  value={analysisForm.recommended_frequency}
                  onChange={e => setAnalysisForm(p => ({ ...p, recommended_frequency: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                >
                  {frequencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {analysisForm.recommended_frequency === 'Outros' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Especifique a frequência...' : 'Specify frequency...'}
                    value={analysisForm.custom_frequency}
                    onChange={e => setAnalysisForm(p => ({ ...p, custom_frequency: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>
            </div>
          )}

          {/* Storage Provision Section */}
          {(() => {
            const storageItems: { type: string; quantity: number | string; custom_type?: string }[] = [];
            (selectedSupplier.materials || []).forEach(m => {
              if (m.needs_storage_provision) {
                storageItems.push({
                  type: m.storage_provision_type || 'Bag',
                  quantity: m.storage_provision_quantity || 1,
                  custom_type: m.storage_provision_custom_type || ''
                });
              }
            });

            if (storageItems.length === 0 && selectedSupplier.storage_provisions && selectedSupplier.storage_provisions.length > 0) {
              selectedSupplier.storage_provisions.forEach(p => storageItems.push(p));
            }

            if (storageItems.length === 0) {
              const text = `${selectedSupplier.logistics_analyses?.[0]?.conditioning_infrastructure_needed || ''} ${selectedSupplier.logistics_analyses?.[0]?.notes || ''}`;
              const matches = text.matchAll(/\[STORAGE_ITEM:\s*([^|]+)\s*\|\s*([^|]+)\s*(?:\|\s*([^\]]+))?\]/g);
              for (const match of matches) {
                storageItems.push({
                  type: match[1]?.trim() || 'Bag',
                  quantity: match[2]?.trim() || '1',
                  custom_type: match[3]?.trim() || ''
                });
              }
            }

            // CRITICAL FIX: If supplier does not need storage provision, DO NOT render this block at all
            if (storageItems.length === 0) {
              return null;
            }

            return (
              <div className="p-4 bg-indigo-50/90 dark:bg-indigo-950/50 border-2 border-indigo-300 dark:border-indigo-700 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    📦 {language === 'pt' ? 'Cotação de Meios de Armazenamento (Bags / Caçambas / Contêineres)' : 'Storage Provision Quotation'}
                  </span>
                  <span className="text-[10px] font-black bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2.5 py-0.5 rounded-full">
                    {storageItems.length} {language === 'pt' ? 'tipo(s) solicitado(s)' : 'item(s) requested'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs space-y-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Recipientes Solicitados pelo Comercial:' : 'Containers Requested by Commercial:'}</span>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {storageItems.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-200 bg-indigo-100/70 dark:bg-indigo-900/60 px-3 py-1 rounded-lg text-xs border border-indigo-300 dark:border-indigo-700">
                        📦 {item.quantity}x {item.type === 'Outros' ? (item.custom_type || 'Outros') : item.type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Input
                    label={language === 'pt' ? 'Valor da Cotação do Armazenamento (R$) *' : 'Storage Quotation Value (R$) *'}
                    type="number"
                    step="0.01"
                    value={analysisForm.storage_provision_cost}
                    onChange={e => setAnalysisForm(p => ({ ...p, storage_provision_cost: e.target.value }))}
                    placeholder="Ex: 800.00"
                    required
                  />
                  <Input
                    label={language === 'pt' ? 'Previsão / Data de Entrega dos Recipientes *' : 'Estimated Container Delivery Date *'}
                    type="date"
                    value={analysisForm.storage_provision_delivery_date}
                    onChange={e => setAnalysisForm(p => ({ ...p, storage_provision_delivery_date: e.target.value }))}
                    required
                  />
                </div>
              </div>
            );
          })()}

          {/* Feasibility Decision */}
          <div className="grid grid-cols-1 gap-4">
            <Select label={language === 'pt' ? 'Decisão de Viabilidade *' : 'Feasibility Decision *'} value={analysisForm.feasibility}
              onChange={e => setAnalysisForm(p => ({ ...p, feasibility: e.target.value }))}
              options={feasibilityOptions} />
          </div>

            {/* Documentation checklist (shown only when Necessita Informação Adicional) */}
            {analysisForm.feasibility === 'NEED_INFO' && (
              <div className="space-y-2 p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest block">
                  {language === 'pt' ? 'Documentação Pendente a ser Solicitada' : 'Pending Documentation to be Requested'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DOC_CHECKLIST.map(doc => (
                    <label key={doc.key} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      pendingDocs.includes(doc.key)
                        ? 'border-amber-300 bg-amber-100 text-amber-900'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-slate-300'
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
                    placeholder={language === 'pt' ? 'Especifique qual outra documentação está pendente...' : 'Specify which other documentation is pending...'}
                    value={customPendingDoc}
                    onChange={e => setCustomPendingDoc(e.target.value)}
                    className="w-full mt-2 px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-amber-400 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                )}

                {pendingDocs.length > 0 && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle size={10} />
                    {language === 'pt' 
                      ? `${pendingDocs.length} pendência(s) marcada(s) para Compras providenciar.`
                      : `${pendingDocs.length} action item(s) marked for Commercial to provide.`}
                  </p>
                )}
              </div>
            )}

            {analysisForm.feasibility === 'NEED_INFO' && (
              <Input label={language === 'pt' ? 'O que precisa ser esclarecido com Compras? (Gera pendência automática)' : 'What needs to be clarified with Commercial? (Creates auto-task)'}
                value={analysisForm.need_info_reason}
                onChange={e => setAnalysisForm(p => ({ ...p, need_info_reason: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: Confirmar se o acesso do caminhão Truck comporta portão de 4m' : 'E.g. Confirm whether 4m gate allows Truck access'} />
            )}

            <Input label={language === 'pt' ? 'Infraestrutura necessária no local' : 'Infrastructure needed on site'}
              value={analysisForm.conditioning_infrastructure_needed}
              onChange={e => setAnalysisForm(p => ({ ...p, conditioning_infrastructure_needed: e.target.value }))}
              placeholder={language === 'pt' ? 'Ex: Deixar 2 caçambas de 30m³, disponibilizar paleteira...' : 'E.g. Place 2x 30m³ dumpsters, provide pallet jack...'} />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Observações Gerais da Logística' : 'General Logistics Notes'}
              </label>
              <textarea value={analysisForm.notes}
                onChange={e => setAnalysisForm(p => ({ ...p, notes: e.target.value }))}
                placeholder={language === 'pt' ? 'Justifique a decisão, rotas sugeridas, pedágios ou restrições de trânsito...' : 'Justify decision, suggested routes, tolls or traffic restrictions...'}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
            </div>

            {analysisForm.feasibility === 'FEASIBLE' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                <CheckCircle size={16} />
                {language === 'pt' 
                  ? 'Este lead será homologado e integrado ao módulo de Geradores.'
                  : 'This lead will be approved and integrated into the Generators module.'}
              </div>
            )}

            {analysisForm.feasibility === 'INFEASIBLE' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 font-semibold">
                <XCircle size={16} />
                {language === 'pt'
                  ? 'Este lead será marcado como Inviável e constará em Geradores com status de inviabilidade.'
                  : 'This lead will be marked as Infeasible and listed with infeasibility status.'}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                {language === 'pt' ? 'Salvar Parecer' : 'Save Opinion'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Schedule Collection / Storage Container Delivery Modal */}
      {schedulingSupplier && (() => {
        const isSelfDeliveryWithStorage = Boolean(
          (
            schedulingSupplier.transport_responsible === 'Fornecedor (entrega no Hub)' ||
            schedulingSupplier.logistics_analyses?.[0]?.transport_responsible === 'Fornecedor (entrega no Hub)' ||
            schedulingSupplier.logistics_analyses?.[0]?.transport_type === 'Entrega Própria (Gerador)'
          ) && schedulingSupplier.materials?.some(m => m.needs_storage_provision)
        );

        const storageContainers = (schedulingSupplier.materials || [])
          .filter(m => m.needs_storage_provision);

        return (
          <Modal 
            isOpen={isScheduleModalOpen} 
            onClose={() => setIsScheduleModalOpen(false)}
            title={isSelfDeliveryWithStorage 
              ? `${language === 'pt' ? 'Agendar Entrega de Meios de Armazenamento' : 'Schedule Container Delivery'} — ${schedulingSupplier.name}`
              : `${language === 'pt' ? 'Agendar Coleta' : 'Schedule Collection'} — ${schedulingSupplier.name}`
            } 
            size="md"
          >
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {isSelfDeliveryWithStorage 
                    ? (language === 'pt' ? 'Endereço de Entrega dos Recipientes:' : 'Container Delivery Address:')
                    : (language === 'pt' ? 'Endereço de Coleta:' : 'Collection Address:')}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {schedulingSupplier.address ? `${schedulingSupplier.address.street || ''}, ${schedulingSupplier.address.number || ''} — ${schedulingSupplier.address.city}/${schedulingSupplier.address.state}` : (language === 'pt' ? 'Não informado' : 'Not provided')}
                </p>
              </div>

              {isSelfDeliveryWithStorage && (
                <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    📦 {language === 'pt' ? 'Entrega no Hub pelo Fornecedor' : 'Supplier Delivers to Hub'}
                  </span>
                  <p className="text-indigo-800 dark:text-indigo-300">
                    {language === 'pt'
                      ? 'Este gerador é responsável pelo transporte e entrega no Hub. Este agendamento destina-se exclusivamente à entrega dos recipientes solicitados no endereço do gerador.'
                      : 'This generator transports material themselves. This schedule is exclusively to deliver requested storage containers.'}
                  </p>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Recipientes Solicitados:' : 'Requested Containers:'}</span>
                    {storageContainers.map((m, idx) => (
                      <span key={idx} className="font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200">
                        {m.storage_provision_quantity || 1}x {m.storage_provision_type === 'Outros' ? (m.storage_provision_custom_type || 'Recipiente') : (m.storage_provision_type || 'Bag')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={isSelfDeliveryWithStorage 
                    ? (language === 'pt' ? 'Data de Entrega dos Recipientes *' : 'Container Delivery Date *')
                    : (language === 'pt' ? 'Data Programada da Coleta *' : 'Scheduled Collection Date *')}
                  type="date"
                  value={scheduleForm.scheduled_date}
                  onChange={e => setScheduleForm(p => ({ ...p, scheduled_date: e.target.value }))}
                  required
                />

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isSelfDeliveryWithStorage 
                      ? (language === 'pt' ? 'Modalidade' : 'Modality')
                      : (language === 'pt' ? 'Frequência da Coleta (Recorrência) *' : 'Collection Frequency (Recurrence) *')}
                  </label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={e => setScheduleForm(p => ({ ...p, frequency: e.target.value }))}
                    className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                  >
                    {isSelfDeliveryWithStorage ? (
                      <>
                        <option value="Entrega única">Entrega única</option>
                        <option value="Sob demanda">Sob demanda</option>
                        <option value="1x por mês">1x por mês</option>
                      </>
                    ) : (
                      frequencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
                    )}
                  </select>
                  {!isSelfDeliveryWithStorage && scheduleForm.frequency === 'Outros' && (
                    <input
                      type="text"
                      placeholder={language === 'pt' ? 'Especifique (ex: 2x por semana, a cada 10 dias)...' : 'Specify frequency...'}
                      value={scheduleForm.custom_frequency}
                      onChange={e => setScheduleForm(p => ({ ...p, custom_frequency: e.target.value }))}
                      className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  )}
                </div>
              </div>

              {!isSelfDeliveryWithStorage && (
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800 leading-relaxed">
                  💡 <strong>{language === 'pt' ? 'Aviso Antecipado (3 dias):' : 'Advance Notice (3 days):'}</strong> {language === 'pt' 
                    ? 'Ao confirmar, o gerador sai desta lista imediatamente. Ele reaparecerá automaticamente aqui 3 dias antes da data da próxima coleta para a Logística realizar o novo agendamento.'
                    : 'Upon confirming, generator leaves this queue immediately. It will reappear here 3 days before the next collection due date.'}
                </p>
              )}

              <Input
                label={isSelfDeliveryWithStorage 
                  ? (language === 'pt' ? 'Meios de Armazenamento / Descrição *' : 'Containers / Description *')
                  : (language === 'pt' ? 'Material a Coletar *' : 'Material to Collect *')}
                value={scheduleForm.material_name}
                onChange={e => setScheduleForm(p => ({ ...p, material_name: e.target.value }))}
                placeholder={isSelfDeliveryWithStorage ? 'Ex: 5 Bags, 1 Caçamba de 30m³' : (language === 'pt' ? 'Ex: Papelão Ondulado' : 'E.g. Corrugated Cardboard')}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={isSelfDeliveryWithStorage ? (language === 'pt' ? 'Quantidade Total' : 'Total Quantity') : (language === 'pt' ? 'Volume Estimado *' : 'Estimated Volume *')}
                  type="number"
                  value={scheduleForm.estimated_volume}
                  onChange={e => setScheduleForm(p => ({ ...p, estimated_volume: e.target.value }))}
                  placeholder="1"
                  required
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Unidade' : 'Unit'}</label>
                  <select
                    value={scheduleForm.unit}
                    onChange={e => setScheduleForm(p => ({ ...p, unit: e.target.value }))}
                    className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                  >
                    <option value="un">un (unidades)</option>
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                    <option value="m³">m³</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={isSelfDeliveryWithStorage ? (language === 'pt' ? 'Motorista / Entregador' : 'Delivery Driver') : (language === 'pt' ? 'Motorista' : 'Driver')}
                  value={scheduleForm.driver_name}
                  onChange={e => setScheduleForm(p => ({ ...p, driver_name: e.target.value }))}
                  placeholder={language === 'pt' ? 'Ex: Carlos Oliveira' : 'E.g. John Doe'}
                />
                <Input
                  label={isSelfDeliveryWithStorage ? (language === 'pt' ? 'Veículo / Transportadora de Entrega' : 'Delivery Vehicle') : (language === 'pt' ? 'Transportadora / Veículo' : 'Carrier / Vehicle')}
                  value={scheduleForm.carrier_name}
                  onChange={e => setScheduleForm(p => ({ ...p, carrier_name: e.target.value }))}
                  placeholder={language === 'pt' ? 'Ex: Logística iWrc / Fiorino' : 'E.g. iWrc Carrier (Truck)'}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Observações Operacionais' : 'Operational Notes'}
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={e => setScheduleForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder={isSelfDeliveryWithStorage 
                    ? (language === 'pt' ? 'Instruções de descarregamento dos bags/contêineres, contato na portaria, etc.' : 'Drop-off instructions, gate contact, etc.')
                    : (language === 'pt' ? 'Horário de chegada, instruções de pesagem...' : 'Arrival time, scale instructions...')}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none min-h-[70px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                  {language === 'pt' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {isSelfDeliveryWithStorage 
                    ? (language === 'pt' ? 'Confirmar Entrega de Recipientes' : 'Confirm Container Delivery')
                    : (language === 'pt' ? 'Confirmar Agendamento' : 'Confirm Scheduling')}
                </Button>
              </div>
            </form>
          </Modal>
        );
      })()}

      {/* Outbound Material Dispatch Modal */}
      {isDispatchModalOpen && (
        <Modal
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          title={language === 'pt' ? 'Registrar Saída de Material (Expedição / Venda do Hub)' : 'Register Outbound Material Dispatch'}
          size="lg"
        >
          <form onSubmit={handleSaveDispatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={language === 'pt' ? 'Comprador / Destinatário (Razão Social ou Nome) *' : 'Buyer / Destination Name *'}
                value={dispatchForm.buyer_name}
                onChange={e => setDispatchForm(p => ({ ...p, buyer_name: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: Recicladora Paulistana Ltda' : 'E.g. Paulistana Recycling Ltd'}
                required
              />

              <Input
                label={language === 'pt' ? 'CNPJ / CPF do Comprador' : 'Buyer CNPJ / Tax ID'}
                value={dispatchForm.buyer_document}
                onChange={e => setDispatchForm(p => ({ ...p, buyer_document: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Tipo de Destinação *' : 'Destination Type *'}
                </label>
                <select
                  value={dispatchForm.destination_type}
                  onChange={e => setDispatchForm(p => ({ ...p, destination_type: e.target.value as DispatchDestinationType }))}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  {DISPATCH_DESTINATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Material Expedido *' : 'Dispatched Material *'}
                </label>
                <select
                  value={dispatchForm.material_name}
                  onChange={e => setDispatchForm(p => ({ ...p, material_name: e.target.value }))}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  {DISPATCH_MATERIAL_OPTIONS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {dispatchForm.material_name === 'Outros' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Digite o nome do material...' : 'Type material name...'}
                    value={dispatchForm.custom_material_name}
                    onChange={e => setDispatchForm(p => ({ ...p, custom_material_name: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-purple-400 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label={language === 'pt' ? 'Quantidade / Peso Líquido (kg) *' : 'Quantity / Net Weight (kg) *'}
                type="number"
                value={dispatchForm.quantity_kg}
                onChange={e => {
                  const qty = e.target.value;
                  const price = dispatchForm.unit_price;
                  const autoTotal = (Number(qty) || 0) * (Number(price) || 0);
                  setDispatchForm(p => ({ 
                    ...p, 
                    quantity_kg: qty, 
                    total_value: autoTotal > 0 ? autoTotal.toFixed(2) : p.total_value 
                  }));
                }}
                placeholder="Ex: 5000"
                required
              />

              <Input
                label={language === 'pt' ? 'Preço Unitário (R$/kg)' : 'Unit Price (R$/kg)'}
                type="number"
                step="0.01"
                value={dispatchForm.unit_price}
                onChange={e => {
                  const price = e.target.value;
                  const qty = dispatchForm.quantity_kg;
                  const autoTotal = (Number(qty) || 0) * (Number(price) || 0);
                  setDispatchForm(p => ({ 
                    ...p, 
                    unit_price: price, 
                    total_value: autoTotal > 0 ? autoTotal.toFixed(2) : p.total_value 
                  }));
                }}
                placeholder="Ex: 0.85"
              />

              <Input
                label={language === 'pt' ? 'Valor Total da Saída (R$)' : 'Total Dispatch Value (R$)'}
                type="number"
                step="0.01"
                value={dispatchForm.total_value}
                onChange={e => setDispatchForm(p => ({ ...p, total_value: e.target.value }))}
                placeholder="Ex: 4250.00"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label={language === 'pt' ? 'Data da Saída *' : 'Dispatch Date *'}
                type="date"
                value={dispatchForm.dispatch_date}
                onChange={e => setDispatchForm(p => ({ ...p, dispatch_date: e.target.value }))}
                required
              />

              <Input
                label={language === 'pt' ? 'Número da NF-e' : 'Invoice Number (NF-e)'}
                value={dispatchForm.invoice_number}
                onChange={e => setDispatchForm(p => ({ ...p, invoice_number: e.target.value }))}
                placeholder="Ex: 001.234"
              />

              <Input
                label={language === 'pt' ? 'Número do MTR' : 'MTR Number'}
                value={dispatchForm.mtr_number}
                onChange={e => setDispatchForm(p => ({ ...p, mtr_number: e.target.value }))}
                placeholder="Ex: MTR-2026-889"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label={language === 'pt' ? 'Transportadora / Veículo' : 'Carrier'}
                value={dispatchForm.carrier_name}
                onChange={e => setDispatchForm(p => ({ ...p, carrier_name: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: TransLog Sorocaba' : 'E.g. TransLog'}
              />

              <Input
                label={language === 'pt' ? 'Placa do Veículo' : 'Vehicle Plate'}
                value={dispatchForm.vehicle_plate}
                onChange={e => setDispatchForm(p => ({ ...p, vehicle_plate: e.target.value }))}
                placeholder="ABC-1D23"
              />

              <Input
                label={language === 'pt' ? 'Nome do Motorista' : 'Driver Name'}
                value={dispatchForm.driver_name}
                onChange={e => setDispatchForm(p => ({ ...p, driver_name: e.target.value }))}
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Observações Gerais da Expedição' : 'Dispatch Notes'}
              </label>
              <textarea
                value={dispatchForm.notes}
                onChange={e => setDispatchForm(p => ({ ...p, notes: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: Carga enfardada, carregamento realizado pela doca 2...' : 'E.g. Baled load, loaded at dock 2...'}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-purple-500 min-h-[60px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsDispatchModalOpen(false)}>
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20">
                {language === 'pt' ? 'Confirmar Saída do Hub' : 'Confirm Hub Dispatch'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}