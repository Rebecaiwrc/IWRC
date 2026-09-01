'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { useToast } from '@/features/shared/context/ToastContext';
import { dbService } from '@/features/shared/services/dbService';
import { Supplier, Profile, SupplierInteraction, Receipt, AttachedDocument } from '@/types';
import { 
  Building2, 
  Search, 
  Eye, 
  MessageSquare, 
  Send, 
  Clock, 
  UserCheck, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Phone,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Upload,
  Paperclip,
  FileCheck,
  Trash2,
  Plus,
  FileText,
  Scale,
  Check,
  X,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { 
  formatSupplierCode, 
  formatTitleCase, 
  formatCityState, 
  formatPhone, 
  formatDate,
  formatVolume,
  translateSupplierType,
  formatShortSegment
} from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export const INVOICE_DIVERGENCE_REASONS = [
  'Peso/quantidade divergente',
  'Material divergente',
  'Valor divergente',
  'Dados cadastrais incorretos',
  'Outro motivo'
];

export default function ComprasPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'logistics_pending' | 'invoice_check'>('logistics_pending');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');

  // Response Modal state (Logistics Inquiry)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{
    id: string;
    name: string;
    size: string;
    file_data: string;
    type: 'mtr' | 'invoice' | 'donation_letter' | 'other';
    notes?: string;
  }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierInteractions, setSupplierInteractions] = useState<SupplierInteraction[]>([]);

  // Invoice Verification Modal state
  const [selectedReceiptForInvoice, setSelectedReceiptForInvoice] = useState<Receipt | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceModalStep, setInvoiceModalStep] = useState<'check' | 'divergence'>('check');
  const [divergenceReason, setDivergenceReason] = useState(INVOICE_DIVERGENCE_REASONS[0]);
  const [divergenceNotes, setDivergenceNotes] = useState('');
  const [correctedInvoiceNumber, setCorrectedInvoiceNumber] = useState('');
  const [correctedInvoiceFile, setCorrectedInvoiceFile] = useState<{
    name: string;
    size: string;
    file_data: string;
  } | null>(null);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppList, profList, recList] = await Promise.all([
        dbService.getSuppliers(),
        dbService.getProfiles(),
        dbService.getReceipts()
      ]);
      setSuppliers(suppList);
      setProfiles(profList);
      setReceipts(recList);
    } catch (err) {
      console.error('Error fetching Compras data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter suppliers that have Logistics feasibility === 'NEED_INFO'
  const pendingSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      if (!isResponsibleForSupplier(s)) return false;
      const act = s.logistics_analyses?.[0];
      const isNeedInfo = act?.feasibility === 'NEED_INFO';
      if (!isNeedInfo) return false;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        s.name.toLowerCase().includes(q) ||
        (s.trade_name && s.trade_name.toLowerCase().includes(q)) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.document && s.document.includes(q)) ||
        (s.address && s.address.city.toLowerCase().includes(q)) ||
        (s.supplier_type && s.supplier_type.toLowerCase().includes(q))
      );

      const matchesResp = !responsibleFilter || s.internal_responsible_id === responsibleFilter;

      return matchesSearch && matchesResp;
    });
  }, [suppliers, searchQuery, responsibleFilter, currentUser, isBuyer]);

  // Filter receipts awaiting invoice check (PENDING_CHECK or DIVERGENT)
  const pendingInvoiceReceipts = useMemo(() => {
    return receipts.filter(r => {
      const sup = r.supplier || suppliers.find(s => s.id === r.supplier_id);
      if (!isResponsibleForSupplier(sup)) return false;

      const isPending = !r.invoice_status || r.invoice_status === 'PENDING_CHECK' || r.invoice_status === 'DIVERGENT';
      if (!isPending) return false;

      const q = searchQuery.toLowerCase().trim();
      const supName = sup?.trade_name || sup?.name || '';
      const matNames = r.items ? r.items.map(i => i.material_name).join(' ') : '';
      const nf = r.invoice_number || '';

      const matchesSearch = !q || (
        supName.toLowerCase().includes(q) ||
        matNames.toLowerCase().includes(q) ||
        nf.toLowerCase().includes(q)
      );

      const matchesResp = !responsibleFilter || sup?.internal_responsible_id === responsibleFilter;

      return matchesSearch && matchesResp;
    });
  }, [receipts, suppliers, searchQuery, responsibleFilter, currentUser, isBuyer]);

  // Logistics Response Modal handlers
  const handleOpenResponseModal = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setResponseText('');
    setAttachedFiles([]);
    setIsResponseModalOpen(true);

    try {
      const fullSupplier = await dbService.getSupplier(supplier.id);
      setSupplierInteractions(fullSupplier?.interactions || []);
    } catch (err) {
      console.error('Error loading interactions:', err);
      setSupplierInteractions([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const sizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      let inferredType: 'mtr' | 'invoice' | 'donation_letter' | 'other' = 'other';
      const lower = file.name.toLowerCase();
      if (lower.includes('mtr') || lower.includes('manifesto')) inferredType = 'mtr';
      else if (lower.includes('nf') || lower.includes('nota') || lower.includes('fiscal') || lower.includes('danfe')) inferredType = 'invoice';
      else if (lower.includes('doacao') || lower.includes('doação') || lower.includes('carta')) inferredType = 'donation_letter';

      reader.onload = () => {
        setAttachedFiles(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: sizeStr,
            file_data: reader.result as string,
            type: inferredType,
            notes: ''
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !currentUser) return;

    if (!responseText.trim() && attachedFiles.length === 0) {
      showError(language === 'pt' 
        ? 'Por favor, escreva uma resposta OU anexe pelo menos um documento para enviar à Logística.' 
        : 'Please enter a written response or attach at least one document for Logistics.');
      return;
    }

    try {
      setIsSubmitting(true);
      const activeAnalysis = selectedSupplier.logistics_analyses?.[0];
      const supplierName = selectedSupplier.trade_name || selectedSupplier.name;

      // 1. Save attached documents to lead permanently (Visible in 360° Ficha)
      if (attachedFiles.length > 0) {
        await dbService.addSupplierDocuments(selectedSupplier.id, attachedFiles.map(f => ({
          name: f.name,
          size: f.size,
          file_data: f.file_data,
          type: f.type as any,
          notes: `Anexado por Compras (${currentUser.name}) em resposta à Logística`,
          uploaded_at: new Date().toISOString()
        })));
      }

      // 2. Add interaction in Ficha 360 timeline
      const responseDesc = responseText.trim() ? `Texto: "${responseText.trim()}"` : 'Sem mensagem de texto';
      const docsDesc = attachedFiles.length > 0 
        ? `Documentos anexados (${attachedFiles.length}): ${attachedFiles.map(f => `${f.name} [${f.type === 'mtr' ? 'MTR' : f.type === 'invoice' ? 'Nota Fiscal' : f.type === 'donation_letter' ? 'Carta de Doação' : 'Outro'}]`).join(', ')}`
        : '';
      const fullDesc = `💬 [Esclarecimento de Compras para Logística por ${currentUser.name}]: ${responseDesc}. ${docsDesc}`.trim();

      await dbService.addSupplierInteraction({
        supplier_id: selectedSupplier.id,
        user_id: currentUser.id,
        type: 'internal_obs',
        description: fullDesc
      });

      // 3. Update logistics analysis: return feasibility to PENDING with updated notes
      const docNames = attachedFiles.length > 0 
        ? ` | Anexos: ${attachedFiles.map(f => f.name).join(', ')}` 
        : '';
      const writtenResp = responseText.trim() ? ` "${responseText.trim()}"` : ' [Documentação anexada]';
      const noteEntry = `[${new Date().toLocaleDateString('pt-BR')} - Retorno de Compras por ${currentUser.name}]:${writtenResp}${docNames}`;

      if (activeAnalysis?.id) {
        const previousNotes = activeAnalysis.notes ? `${activeAnalysis.notes}\n\n` : '';
        const updatedNotes = `${previousNotes}${noteEntry}`;
        
        await dbService.createOrUpdateLogisticsAnalysis({
          id: activeAnalysis.id,
          supplier_id: selectedSupplier.id,
          feasibility: 'PENDING',
          notes: updatedNotes
        });
      } else {
        await dbService.createOrUpdateLogisticsAnalysis({
          supplier_id: selectedSupplier.id,
          feasibility: 'PENDING',
          notes: noteEntry
        });
      }

      // 4. Update supplier stage/status to return to Logistics queue
      const docSummary = attachedFiles.length > 0 
        ? ` (${attachedFiles.length} doc(s) anexado(s))`
        : '';

      await dbService.updateSupplier(selectedSupplier.id, {
        current_stage: 'LOGISTICS',
        current_status: 'IN_PROGRESS',
        backlog_reason: `Respondido por Compras (${currentUser.name})${docSummary} - Aguardando reanálise logística`
      });

      // 5. Add status history
      await dbService.addSupplierStatusHistory({
        supplier_id: selectedSupplier.id,
        old_stage: selectedSupplier.current_stage,
        new_stage: 'LOGISTICS',
        old_status: selectedSupplier.current_status,
        new_status: 'IN_PROGRESS',
        user_id: currentUser.id,
        notes: `Compras respondeu à solicitação da Logística (${responseText.trim().slice(0, 60) || `${attachedFiles.length} anexo(s) enviado(s)`})`
      });

      setIsResponseModalOpen(false);
      setSelectedSupplier(null);
      setResponseText('');
      setAttachedFiles([]);
      await fetchData();

      showSuccess(
        language === 'pt'
          ? 'Resposta enviada para a Logística com sucesso.'
          : 'Response sent to Logistics successfully.'
      );
    } catch (err: any) {
      console.error('Error sending response to logistics:', err);
      showError(
        language === 'pt'
          ? `Erro ao enviar resposta: ${err.message || 'Tente novamente.'}`
          : `Error sending response: ${err.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // INVOICE CHECKING HANDLERS
  // ==========================================
  const handleOpenInvoiceModal = (receipt: Receipt) => {
    setSelectedReceiptForInvoice(receipt);
    setInvoiceModalStep(receipt.invoice_status === 'DIVERGENT' ? 'divergence' : 'check');
    setDivergenceReason(receipt.invoice_divergence_reason || INVOICE_DIVERGENCE_REASONS[0]);
    setDivergenceNotes(receipt.invoice_divergence_notes || '');
    setCorrectedInvoiceNumber(receipt.corrected_invoice_number || '');
    setCorrectedInvoiceFile(null);
    setIsInvoiceModalOpen(true);
  };

  const handleApproveInvoice = async (receipt: Receipt) => {
    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      const totalWeight = receipt.items?.reduce((sum, it) => sum + (Number(it.weight_kg) || 0), 0) || 0;
      const sup = receipt.supplier || suppliers.find(s => s.id === receipt.supplier_id);
      const supName = sup?.trade_name || sup?.name || 'Gerador';

      // 1. Update receipt status to APPROVED
      await dbService.updateReceipt(receipt.id, {
        invoice_status: 'APPROVED',
        invoice_checked_by: currentUser?.id || null,
        invoice_checked_at: now
      });

      // 2. Add interaction in Ficha 360 timeline
      await dbService.addSupplierInteraction({
        supplier_id: receipt.supplier_id,
        user_id: currentUser?.id || 'd3b07384-d113-4e4e-9b2f-123456789013',
        type: 'internal_obs',
        description: `📄 [Conferência de NF]: Nota Fiscal nº ${receipt.invoice_number || 'S/N'} referente ao recebimento de ${totalWeight} kg em ${formatDate(receipt.received_date)} foi CONFERIDA E APROVADA por ${currentUser?.name || 'Compras'}. Status: NF OK.`
      });

      setIsInvoiceModalOpen(false);
      setSelectedReceiptForInvoice(null);
      await fetchData();

      showSuccess(
        language === 'pt'
          ? 'Nota Fiscal conferida com sucesso.'
          : 'Invoice checked successfully.'
      );
    } catch (err: any) {
      console.error(err);
      showError(language === 'pt' ? 'Erro ao aprovar Nota Fiscal.' : 'Error approving invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDivergence = async (receipt: Receipt) => {
    try {
      setIsSubmitting(true);
      const totalWeight = receipt.items?.reduce((sum, it) => sum + (Number(it.weight_kg) || 0), 0) || 0;

      // 1. Update receipt status to DIVERGENT
      await dbService.updateReceipt(receipt.id, {
        invoice_status: 'DIVERGENT',
        invoice_divergence_reason: divergenceReason,
        invoice_divergence_notes: divergenceNotes.trim() || null
      });

      // 2. Add interaction in Ficha 360 timeline
      await dbService.addSupplierInteraction({
        supplier_id: receipt.supplier_id,
        user_id: currentUser?.id || 'd3b07384-d113-4e4e-9b2f-123456789013',
        type: 'internal_obs',
        description: `⚠️ [Conferência de NF - Divergente]: Apontada divergência na NF nº ${receipt.invoice_number || 'S/N'} do recebimento de ${totalWeight} kg em ${formatDate(receipt.received_date)}. Motivo: ${divergenceReason}. ${divergenceNotes.trim() ? `Observações: "${divergenceNotes.trim()}".` : ''} Aguardando envio de NF corrigida.`
      });

      setIsInvoiceModalOpen(false);
      setSelectedReceiptForInvoice(null);
      await fetchData();

      showSuccess(
        language === 'pt'
          ? 'Divergência registrada. Pendência mantida em Compras aguardando a NF corrigida.'
          : 'Divergence recorded. Kept in Purchasing queue.'
      );
    } catch (err: any) {
      console.error(err);
      showError(language === 'pt' ? 'Erro ao registrar divergência.' : 'Error recording divergence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCorrectedFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    const sizeStr = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    reader.onload = () => {
      setCorrectedInvoiceFile({
        name: file.name,
        size: sizeStr,
        file_data: reader.result as string
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCorrectedInvoiceAndApprove = async (receipt: Receipt) => {
    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      const totalWeight = receipt.items?.reduce((sum, it) => sum + (Number(it.weight_kg) || 0), 0) || 0;

      // 1. Save new corrected document to supplier's documents WITHOUT deleting previous documents
      if (correctedInvoiceFile) {
        await dbService.addSupplierDocument(receipt.supplier_id, {
          name: `NF Corrigida - ${correctedInvoiceFile.name}`,
          file_data: correctedInvoiceFile.file_data,
          size: correctedInvoiceFile.size,
          type: 'invoice',
          notes: `Nota Fiscal Corrigida referente ao recebimento de ${formatDate(receipt.received_date)} (${totalWeight} kg)`,
          uploaded_at: now
        });
      }

      // 2. Update receipt
      const finalNfNumber = correctedInvoiceNumber.trim() || receipt.invoice_number;
      await dbService.updateReceipt(receipt.id, {
        invoice_status: 'APPROVED',
        invoice_number: finalNfNumber,
        corrected_invoice_number: correctedInvoiceNumber.trim() || null,
        invoice_checked_by: currentUser?.id || null,
        invoice_checked_at: now
      });

      // 3. Add interaction
      await dbService.addSupplierInteraction({
        supplier_id: receipt.supplier_id,
        user_id: currentUser?.id || 'd3b07384-d113-4e4e-9b2f-123456789013',
        type: 'internal_obs',
        description: `✓ [NF Corrigida Aprovada]: Nota Fiscal Corrigida ${correctedInvoiceNumber.trim() ? `nº ${correctedInvoiceNumber.trim()}` : ''} referente ao recebimento de ${totalWeight} kg em ${formatDate(receipt.received_date)} foi anexada e APROVADA por ${currentUser?.name || 'Compras'}. Status final: NF OK.`
      });

      setIsInvoiceModalOpen(false);
      setSelectedReceiptForInvoice(null);
      setCorrectedInvoiceFile(null);
      setCorrectedInvoiceNumber('');
      await fetchData();

      showSuccess(
        language === 'pt'
          ? 'Nota Fiscal corrigida anexada e conferida com sucesso.'
          : 'Corrected invoice attached and approved.'
      );
    } catch (err: any) {
      console.error(err);
      showError(language === 'pt' ? 'Erro ao salvar NF corrigida.' : 'Error saving corrected invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Carregando módulo de Compras...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
            <ShoppingBag size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {language === 'pt' ? 'Módulo Compras' : 'Purchasing'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {language === 'pt' 
                ? 'Acompanhamento de pendências da Logística e conferência documental de Notas Fiscais pós-pesagem.' 
                : 'Logistics inquiry follow-ups and post-weighing invoice verifications.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('logistics_pending')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'logistics_pending'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
          }`}
        >
          <HelpCircle size={15} />
          <span>{language === 'pt' ? 'Pendências da Logística' : 'Logistics Inquiries'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'logistics_pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {pendingSuppliers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoice_check')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'invoice_check'
              ? 'bg-[#2098D1] text-white shadow-md shadow-[#2098D1]/20'
              : 'bg-white text-slate-600 hover:bg-[#E5F5F8] border border-slate-200'
          }`}
        >
          <Scale size={15} />
          <span>{language === 'pt' ? 'Aguardando Conferência de NF' : 'Invoice Checks (Weighings)'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'invoice_check' ? 'bg-white/20 text-white' : 'bg-[#E5F5F8] text-[#2098D1]'
          }`}>
            {pendingInvoiceReceipts.length}
          </span>
        </button>
      </div>

      {/* Filters Card */}
      <Card className="flex flex-col md:flex-row gap-4 items-end bg-white border border-slate-200/90 shadow-2xs rounded-2xl p-4">
        <div className="flex-1 w-full">
          <Input
            placeholder={activeTab === 'logistics_pending'
              ? (language === 'pt' ? 'Buscar por Nome, Razão Social, Código (IW-xxx) ou Cidade...' : 'Search by name, legal name, code, city...')
              : (language === 'pt' ? 'Buscar por Gerador, Código, Material ou Número de NF...' : 'Search by generator, code, material or invoice...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64">
          <Select
            label={language === 'pt' ? 'Responsável Comercial' : 'Commercial Rep'}
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            options={[
              { value: '', label: language === 'pt' ? 'Todos os responsáveis' : 'All representatives' },
              ...profiles
                .filter(p => p.role !== 'SUPER_ADMIN' && !p.email?.toLowerCase().includes('adm@123.com') && !p.name?.toLowerCase().includes('admin master'))
                .map(p => ({ value: p.id, label: formatTitleCase(p.name, { isPerson: true }) }))
            ]}
          />
        </div>
      </Card>

      {/* TAB 1: PENDING LOGISTICS INQUIRIES */}
      {activeTab === 'logistics_pending' && (
        <Card className="overflow-hidden !p-0 border border-slate-200/90 shadow-xs rounded-2xl bg-white">
          {pendingSuppliers.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <CheckCircle2 size={32} />
              </div>
              <p className="font-bold text-slate-800 text-base">
                {language === 'pt' ? 'Nenhuma pendência de informação com Compras no momento!' : 'No pending information requests for Purchasing right now!'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {language === 'pt' 
                  ? 'Quando a Logística analisar um lead e solicitar esclarecimentos adicionais, ele aparecerá automaticamente aqui para resposta.' 
                  : 'When Logistics requests additional details during analysis, suppliers will automatically appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto lg:overflow-x-visible w-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pl-4 lg:pl-5 pr-2 py-3.5 w-[22%]">{language === 'pt' ? 'Fornecedor / Razão Social' : 'Supplier / Legal Name'}</th>
                    <th className="px-2 py-3.5 w-[10%]">{language === 'pt' ? 'Cidade/UF' : 'City/State'}</th>
                    <th className="px-2 py-3.5 w-[11%]">{language === 'pt' ? 'Contato' : 'Contact'}</th>
                    <th className="px-2 py-3.5 w-[28%]">{language === 'pt' ? 'Solicitação da Logística' : 'Logistics Request'}</th>
                    <th className="px-2 py-3.5 w-[11%]">{language === 'pt' ? 'Solicitado Por' : 'Requested By'}</th>
                    <th className="pl-2 pr-4 lg:pr-5 py-3.5 w-[18%] text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pendingSuppliers.map((supplier) => {
                    const primaryContact = supplier.contacts?.find(c => c.is_primary) || supplier.contacts?.[0];
                    const formattedCode = formatSupplierCode(supplier.code);
                    const formattedName = formatTitleCase(supplier.name, { isCompany: true });
                    const formattedTradeName = supplier.trade_name ? formatTitleCase(supplier.trade_name, { isCompany: true }) : '';
                    const mainTitle = formattedTradeName || formattedName;
                    const cityState = formatCityState(supplier.address?.city, supplier.address?.state);
                    const respName = formatTitleCase(supplier.responsible?.name || (language === 'pt' ? 'Não atribuído' : 'Unassigned'), { isPerson: true });

                    const activeAnalysis = supplier.logistics_analyses?.[0];
                    const needInfoReason = supplier.backlog_reason || activeAnalysis?.notes || (language === 'pt' ? 'Logística solicitou informações adicionais de acesso e documentação.' : 'Logistics requested additional details.');

                    return (
                      <tr 
                        key={supplier.id}
                        className="hover:bg-amber-50/40 transition-colors group"
                      >
                        {/* Fornecedor / Razão Social */}
                        <td className="pl-4 lg:pl-5 pr-2 py-3.5">
                          <div className="flex flex-col pr-1 overflow-hidden">
                            <Link 
                              href={`/fornecedores/${supplier.id}`}
                              className="font-bold text-slate-900 hover:text-[#0284c7] transition-colors leading-snug line-clamp-2 text-xs lg:text-sm"
                              title={mainTitle !== formattedName ? `${mainTitle} (${formattedName})` : formattedName}
                            >
                              {mainTitle}
                            </Link>
                            <div 
                              className="text-[11px] text-slate-400 mt-0.5 truncate font-normal flex items-center gap-1.5"
                              title={`${formattedName} • ${formattedCode}`}
                            >
                              <span className="truncate">{formattedName}</span>
                              <span className="text-slate-300 shrink-0">•</span>
                              <span className="font-mono text-slate-500 font-medium shrink-0">{formattedCode}</span>
                            </div>
                          </div>
                        </td>

                        {/* Cidade/UF */}
                        <td className="px-2 py-3.5">
                          <span className="font-semibold text-slate-800 text-xs whitespace-nowrap truncate block" title={cityState}>
                            {cityState}
                          </span>
                        </td>

                        {/* Contato (Telefone) */}
                        <td className="px-2 py-3.5">
                          {(() => {
                            const rawPhone = primaryContact?.whatsapp || primaryContact?.phone;
                            const ph = formatPhone(rawPhone);
                            if (ph === '—') {
                              return <span className="text-slate-300 text-xs">—</span>;
                            }
                            return (
                              <span className="text-xs text-slate-700 font-medium whitespace-nowrap font-mono">
                                {ph}
                              </span>
                            );
                          })()}
                        </td>

                        {/* Solicitação da Logística */}
                        <td className="px-2 py-3.5">
                          <div className="flex flex-col gap-1 pr-2 overflow-hidden">
                            <div className="flex items-start gap-1.5 bg-amber-50/80 border border-amber-200/80 p-2 rounded-lg">
                              <HelpCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-950 font-medium line-clamp-2 leading-relaxed" title={needInfoReason}>
                                {needInfoReason}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Solicitado Por (Analista / Responsável) */}
                        <td className="px-2 py-3.5">
                          <div className="flex items-center gap-1 text-xs text-slate-700 whitespace-nowrap overflow-hidden">
                            <UserCheck size={12} className="text-amber-600 shrink-0" />
                            <span className="font-medium truncate max-w-full" title={respName}>{respName}</span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="pl-2 pr-4 lg:pr-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenResponseModal(supplier)}
                              className="inline-flex items-center gap-1.5 text-xs text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 px-3 py-1.5 rounded-lg font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap"
                              title={language === 'pt' ? 'Responder solicitação da Logística' : 'Respond to Logistics'}
                            >
                              <MessageSquare size={13} />
                              <span>{language === 'pt' ? 'Responder' : 'Respond'}</span>
                            </button>

                            <Link href={`/fornecedores/${supplier.id}`}>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg font-semibold transition-all border border-sky-200 cursor-pointer shadow-2xs whitespace-nowrap"
                                title={language === 'pt' ? 'Abrir Ficha 360°' : 'Open 360° Details'}
                              >
                                <Eye size={13} className="text-sky-600" />
                                <span>Ficha 360°</span>
                              </button>
                            </Link>
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

      {/* TAB 2: INVOICE CHECKS FOR HUB RECEIPTS */}
      {activeTab === 'invoice_check' && (
        <Card className="overflow-hidden !p-0 border border-slate-200/90 shadow-xs rounded-2xl bg-white">
          {pendingInvoiceReceipts.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <div className="w-16 h-16 bg-[#E5F5F8] text-[#2098D1] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#CCEAF1]">
                <CheckCircle2 size={32} />
              </div>
              <p className="font-bold text-slate-800 text-base">
                {language === 'pt' ? 'Todas as Notas Fiscais conferidas com sucesso!' : 'All invoices checked successfully!'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {language === 'pt' 
                  ? 'Assim que a Balança registrar uma nova pesagem no Hub, o recebimento entrará aqui automaticamente para conferência documental da NF.' 
                  : 'Whenever a weighing is recorded at the Hub, it will appear here for invoice verification.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3.5">{language === 'pt' ? 'Gerador' : 'Generator'}</th>
                    <th className="px-3 py-3.5">{language === 'pt' ? 'Data Recebimento' : 'Received Date'}</th>
                    <th className="px-3 py-3.5">{language === 'pt' ? 'Material Pesado' : 'Material'}</th>
                    <th className="px-3 py-3.5">{language === 'pt' ? 'Peso Líquido' : 'Net Weight'}</th>
                    <th className="px-3 py-3.5">{language === 'pt' ? 'Nota Fiscal' : 'Invoice (NF)'}</th>
                    <th className="px-3 py-3.5">{language === 'pt' ? 'Responsável Comercial' : 'Rep'}</th>
                    <th className="px-3 py-3.5">{language === 'pt' ? 'Status da NF' : 'Invoice Status'}</th>
                    <th className="px-4 py-3.5 text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pendingInvoiceReceipts.map((receipt) => {
                    const sup = receipt.supplier || suppliers.find(s => s.id === receipt.supplier_id);
                    const formattedCode = formatSupplierCode(sup?.code);
                    const formattedName = formatTitleCase(sup?.name || 'Gerador', { isCompany: true });
                    const formattedTradeName = sup?.trade_name ? formatTitleCase(sup.trade_name, { isCompany: true }) : '';
                    const mainTitle = formattedTradeName || formattedName;
                    const respName = formatTitleCase(sup?.responsible?.name || (language === 'pt' ? 'Não atribuído' : 'Unassigned'), { isPerson: true });
                    const totalWeight = receipt.items?.reduce((sum, it) => sum + (Number(it.weight_kg) || 0), 0) || 0;
                    const isDivergent = receipt.invoice_status === 'DIVERGENT';

                    return (
                      <tr 
                        key={receipt.id}
                        className={`hover:bg-slate-50/60 transition-colors ${isDivergent ? 'bg-rose-50/20' : ''}`}
                      >
                        {/* Gerador */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col overflow-hidden">
                            {sup ? (
                              <Link 
                                href={`/fornecedores/${sup.id}`}
                                className="font-bold text-slate-900 hover:text-[#2098D1] transition-colors leading-snug line-clamp-1 text-xs sm:text-sm"
                              >
                                {mainTitle}
                              </Link>
                            ) : (
                              <span className="font-bold text-slate-900 text-xs">{mainTitle}</span>
                            )}
                            <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                              {formattedCode}
                            </span>
                          </div>
                        </td>

                        {/* Data Recebimento */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#2098D1]" />
                            <span>{formatDate(receipt.received_date)}</span>
                          </div>
                        </td>

                        {/* Material Pesado */}
                        <td className="px-3 py-3.5 text-xs text-slate-700">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {receipt.items && receipt.items.length > 0 ? (
                              receipt.items.map((it, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                  {it.material_name} ({it.weight_kg} kg)
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">Material geral</span>
                            )}
                          </div>
                        </td>

                        {/* Peso Líquido */}
                        <td className="px-3 py-3.5 whitespace-nowrap font-black text-slate-900 text-sm">
                          {formatVolume(totalWeight, 'kg')}
                        </td>

                        {/* Nota Fiscal */}
                        <td className="px-3 py-3.5 text-xs">
                          {receipt.invoice_number ? (
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              NF: {receipt.invoice_number}
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-amber-200">
                              Sem NF inicial
                            </span>
                          )}
                        </td>

                        {/* Responsável Comercial */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-1 text-slate-700">
                            <UserCheck size={13} className="text-[#2098D1]" />
                            <span className="font-semibold">{respName}</span>
                          </div>
                        </td>

                        {/* Status da NF */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {isDivergent ? (
                            <Badge variant="danger" className="font-bold text-[11px]">
                              ⚠️ Divergente (Aguardando Correção)
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="font-bold text-[11px]">
                              ⏳ Aguardando Conferência
                            </Badge>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenInvoiceModal(receipt)}
                              className="inline-flex items-center gap-1.5 text-xs text-white bg-[#2098D1] hover:bg-[#156E98] px-3 py-1.5 rounded-lg font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <FileCheck size={14} />
                              <span>{isDivergent ? 'Tratar Divergência' : 'Conferir NF'}</span>
                            </button>

                            {sup && (
                              <Link href={`/fornecedores/${sup.id}`}>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg font-semibold transition-all border border-sky-200 cursor-pointer"
                                  title="Abrir Ficha 360°"
                                >
                                  <Eye size={13} className="text-sky-600" />
                                  <span>360°</span>
                                </button>
                              </Link>
                            )}
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

      {/* MODAL 1: Logistics Response Modal */}
      {isResponseModalOpen && selectedSupplier && (
        <Modal
          isOpen={isResponseModalOpen}
          onClose={() => {
            setIsResponseModalOpen(false);
            setResponseText('');
          }}
          title={language === 'pt' ? 'Responder Pendência à Logística' : 'Respond to Logistics Inquiry'}
          size="lg"
          hasUnsavedChanges={Boolean(responseText.trim() || attachedFiles.length > 0)}
        >
          <form onSubmit={handleSendResponse} className="space-y-4">
            {/* Header / Supplier Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'pt' ? 'Fornecedor em análise' : 'Supplier under review'}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedSupplier.trade_name || selectedSupplier.name}
                </span>
                <span className="text-xs text-slate-500 block font-mono">
                  {formatSupplierCode(selectedSupplier.code)} • {formatCityState(selectedSupplier.address?.city, selectedSupplier.address?.state)}
                </span>
              </div>
              <Badge variant="purple" className="px-2.5 py-1 text-xs font-bold shrink-0">
                ⚠️ {language === 'pt' ? 'Aguardando Compras' : 'Awaiting Purchasing'}
              </Badge>
            </div>

            {/* Logistics Question Box */}
            <div className="bg-amber-50/90 border-2 border-amber-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <HelpCircle size={16} className="text-amber-700" />
                <span>{language === 'pt' ? 'O que a Logística solicitou:' : 'Logistics requested:'}</span>
              </div>
              <p className="text-sm text-amber-950 font-medium leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-200/60">
                {selectedSupplier.backlog_reason || selectedSupplier.logistics_analyses?.[0]?.notes || 'Informações adicionais de rota, acesso de caminhão ou documentação.'}
              </p>
            </div>

            {/* Previous Conversation History if available */}
            {supplierInteractions.length > 0 && (
              <div className="space-y-2 max-h-36 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <span className="font-bold text-slate-600 block text-[11px] uppercase tracking-wider">
                  {language === 'pt' ? 'Histórico recente de notas e interações:' : 'Recent interactions history:'}
                </span>
                <div className="space-y-1.5">
                  {supplierInteractions.slice(0, 4).map((inter) => (
                    <div key={inter.id} className="p-2 bg-white rounded border border-slate-200/60">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600">{inter.user?.name || 'Sistema'}</span>
                        <span>{inter.interaction_date}</span>
                      </div>
                      <p className="text-slate-700 text-xs mt-0.5">{inter.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents & Attachments Area */}
            <div className="p-3.5 bg-[#F0F9FB] border border-[#CCEAF1] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E2439]">
                  <Upload size={15} className="text-[#2098D1]" />
                  <span>{language === 'pt' ? 'Anexar Documentos (MTR, Nota Fiscal, Carta de Doação, etc.)' : 'Attach Documents'}</span>
                </div>
                <label className="inline-flex items-center gap-1.5 bg-white hover:bg-[#E5F5F8] text-[#2098D1] border border-[#CCEAF1] px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs">
                  <Plus size={13} />
                  <span>{language === 'pt' ? 'Buscar no PC' : 'Browse PC'}</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              <p className="text-[11px] text-[#4F7891]">
                {language === 'pt' 
                  ? 'Anexe os documentos solicitados pela Logística. Eles ficarão salvos na Ficha 360° do lead e disponíveis imediatamente para a Logística.' 
                  : 'Attach the documents requested by Logistics. They will be saved to the lead 360° record.'}
              </p>

              {/* List of Attached Files */}
              {attachedFiles.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="p-2 bg-white border border-[#CCEAF1] rounded-xl flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-6 w-6 rounded-lg bg-[#E5F5F8] text-[#2098D1] flex items-center justify-center font-bold text-xs shrink-0">
                          <FileCheck size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#0E2439] truncate text-xs">{file.name}</p>
                          <span className="text-[10px] text-slate-400">{file.size}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={file.type}
                          onChange={e => {
                            const newType = e.target.value as any;
                            setAttachedFiles(prev => prev.map(f => f.id === file.id ? { ...f, type: newType } : f));
                          }}
                          className="px-2 py-1 text-[11px] font-bold bg-[#F7FCFD] border border-[#CCEAF1] rounded-lg outline-none cursor-pointer"
                        >
                          <option value="mtr">MTR (Manifesto)</option>
                          <option value="invoice">Nota Fiscal (NF-e)</option>
                          <option value="donation_letter">Carta de Doação</option>
                          <option value="other">Outro Documento</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                          title={language === 'pt' ? 'Remover anexo' : 'Remove attachment'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 border border-dashed border-[#CCEAF1] rounded-xl text-center text-xs text-slate-400 bg-white/50">
                  {language === 'pt' 
                    ? 'Nenhum arquivo anexado ainda. Clique em "Buscar no PC" se houver documentos para enviar.' 
                    : 'No files attached yet. Click "Browse PC" to add documents.'}
                </div>
              )}
            </div>

            {/* Response Input Area (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'pt' ? 'Resposta e Esclarecimentos de Compras (Opcional)' : 'Purchasing Response & Clarifications (Optional)'}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {language === 'pt' ? 'Opcional se anexar documentos' : 'Optional if documents attached'}
                </span>
              </div>
              <textarea
                rows={3}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={language === 'pt' 
                  ? 'Ex: Dados do MTR confirmados com o gerador e anexados acima. Rota liberada para caminhão Truck...'
                  : 'Example: MTR details confirmed and attached above. Route cleared for Truck...'}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-900 bg-white leading-relaxed resize-none"
              />
              <p className="text-[11px] text-slate-400">
                {language === 'pt' 
                  ? 'Ao enviar, o lead sairá desta fila e retornará automaticamente para a Logística realizar a análise.' 
                  : 'Upon submission, this lead will return to the Logistics analysis queue.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setIsResponseModalOpen(false)}
              >
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || (!responseText.trim() && attachedFiles.length === 0)}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>{language === 'pt' ? 'Enviando...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>{language === 'pt' ? 'Enviar Resposta para a Logística' : 'Send Response to Logistics'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: INVOICE CHECKING MODAL */}
      {isInvoiceModalOpen && selectedReceiptForInvoice && (() => {
        const receipt = selectedReceiptForInvoice;
        const sup = receipt.supplier || suppliers.find(s => s.id === receipt.supplier_id);
        const totalWeight = receipt.items?.reduce((sum, it) => sum + (Number(it.weight_kg) || 0), 0) || 0;
        const formattedCode = formatSupplierCode(sup?.code);
        const mainTitle = sup?.trade_name || sup?.name || 'Gerador';

        return (
          <Modal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            title={language === 'pt' ? 'Conferência de Nota Fiscal do Recebimento' : 'Receipt Invoice Verification'}
            size="lg"
          >
            <div className="space-y-4">
              
              {/* Receipt & Generator Summary */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {language === 'pt' ? 'Gerador' : 'Generator'}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {mainTitle}
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      {formattedCode} {sup?.address?.city ? `• ${sup.address.city}/${sup.address.state}` : ''}
                    </span>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {language === 'pt' ? 'Data do Recebimento' : 'Receipt Date'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {formatDate(receipt.received_date)}
                    </span>
                  </div>
                </div>

                {/* Weighed Items List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {language === 'pt' ? 'Materiais Recebidos no Hub' : 'Materials Received'}
                    </span>
                    <div className="space-y-1">
                      {receipt.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200/60 text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{it.material_name}</span>
                          <span className="font-black text-slate-900 dark:text-white">{formatVolume(it.weight_kg, 'kg')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      {language === 'pt' ? 'Peso Total e NF Informada' : 'Total Weight & Invoice'}
                    </span>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200/60 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Peso Total:</span>
                        <span className="font-black text-[#2098D1] text-sm">{formatVolume(totalWeight, 'kg')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Número da NF:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {receipt.invoice_number ? `NF ${receipt.invoice_number}` : 'Não informada na balança'}
                        </span>
                      </div>
                      {receipt.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                          Obs: {receipt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 1: INITIAL DECISION (SIM / NAO) */}
              {invoiceModalStep === 'check' && (
                <div className="p-5 bg-[#F0F9FB] border-2 border-[#CCEAF1] rounded-2xl text-center space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-[#0E2439]">
                      {language === 'pt' ? 'A Nota Fiscal está correta?' : 'Is the Invoice correct?'}
                    </h4>
                    <p className="text-xs text-[#4F7891] max-w-md mx-auto">
                      {language === 'pt' 
                        ? 'Verifique se o peso líquido, material e valores correspondem ao recebimento realizado no Hub.' 
                        : 'Verify if net weight, materials and values correspond to the hub receipt.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto">
                    {/* SIM — NF OK */}
                    <Button
                      type="button"
                      onClick={() => handleApproveInvoice(receipt)}
                      isLoading={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl gap-2 shadow-md shadow-emerald-600/20 text-xs cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>{language === 'pt' ? 'SIM — NF OK' : 'YES — Invoice OK'}</span>
                    </Button>

                    {/* NAO — NF INCORRETA */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setInvoiceModalStep('divergence')}
                      disabled={isSubmitting}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold py-3 rounded-xl gap-2 text-xs cursor-pointer"
                    >
                      <AlertTriangle size={16} />
                      <span>{language === 'pt' ? 'NÃO — NF Divergente' : 'NO — Divergent'}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: DIVERGENCE & CORRECTION FLOW */}
              {invoiceModalStep === 'divergence' && (
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertTriangle size={16} className="text-rose-600" />
                      <span>{language === 'pt' ? 'Apontar Divergência na Nota Fiscal' : 'Point Out Invoice Divergence'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInvoiceModalStep('check')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                    >
                      ← {language === 'pt' ? 'Voltar' : 'Back'}
                    </button>
                  </div>

                  {/* Divergence Reason Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'pt' ? 'Motivo da Divergência *' : 'Divergence Reason *'}
                    </label>
                    <select
                      value={divergenceReason}
                      onChange={(e) => setDivergenceReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 font-medium cursor-pointer"
                    >
                      {INVOICE_DIVERGENCE_REASONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes / Details */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'pt' ? 'Detalhes do que precisa ser corrigido pelo fornecedor' : 'Details of what needs correction'}
                    </label>
                    <textarea
                      rows={2}
                      value={divergenceNotes}
                      onChange={(e) => setDivergenceNotes(e.target.value)}
                      placeholder={language === 'pt' 
                        ? 'Ex: NF emitida com 1.200 kg porém a balança pesou 800 kg. Solicitada carta de correção ou cancelamento e reemissão...'
                        : 'E.g. Invoice issued with 1200kg but scale weighed 800kg...'}
                      className="w-full rounded-xl border border-rose-200 p-2.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 bg-white resize-none"
                    />
                  </div>

                  {/* Attach Corrected NF Area (If already received) */}
                  <div className="p-3 bg-white border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {language === 'pt' ? 'Já recebeu a NF corrigida do fornecedor?' : 'Already have the corrected invoice?'}
                      </span>
                      <label className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer">
                        <Upload size={12} />
                        <span>{language === 'pt' ? 'Anexar NF Corrigida' : 'Upload Corrected NF'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleCorrectedFileSelect}
                        />
                      </label>
                    </div>

                    {correctedInvoiceFile && (
                      <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck size={14} className="text-emerald-600" />
                          <span className="font-bold text-emerald-900">{correctedInvoiceFile.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({correctedInvoiceFile.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCorrectedInvoiceFile(null)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}

                    {correctedInvoiceFile && (
                      <Input
                        label={language === 'pt' ? 'Novo Número da NF Corrigida' : 'New Corrected Invoice Number'}
                        value={correctedInvoiceNumber}
                        onChange={(e) => setCorrectedInvoiceNumber(e.target.value)}
                        placeholder="Ex: 001.235"
                      />
                    )}
                  </div>

                  {/* Actions for divergence */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-rose-200">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsInvoiceModalOpen(false)}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto text-xs"
                    >
                      {language === 'pt' ? 'Fechar' : 'Close'}
                    </Button>

                    {correctedInvoiceFile ? (
                      <Button
                        type="button"
                        onClick={() => handleSaveCorrectedInvoiceAndApprove(receipt)}
                        isLoading={isSubmitting}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 size={15} />
                        <span>{language === 'pt' ? 'Aprovar NF Corrigida / NF OK' : 'Approve Corrected NF'}</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => handleSaveDivergence(receipt)}
                        isLoading={isSubmitting}
                        className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5"
                      >
                        <AlertTriangle size={15} />
                        <span>{language === 'pt' ? 'Salvar Divergência (Aguardar Correção)' : 'Save Divergence'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </Modal>
        );
      })()}

    </div>
  );
}
