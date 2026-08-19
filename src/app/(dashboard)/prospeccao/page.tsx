'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { dbService } from '@/features/shared/services/dbService';
import { Supplier, Profile, ProspectingStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { translateProspectingStatus, formatDate, formatCep, fetchAddressByCep } from '@/lib/utils';
import { 
  Plus, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Trash2, 
  PackagePlus,
  LayoutGrid,
  Table as TableIcon,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Layers,
  Upload,
  FileCheck,
  Loader2,
  Lock
} from 'lucide-react';

const PROSPECTING_COLUMNS: { key: ProspectingStatus; label: string; color: string; badgeVariant: 'default' | 'warning' | 'info' | 'emerald' | 'purple' }[] = [
  { key: 'NEW_LEAD',          label: 'Novo Lead',            color: 'bg-slate-400',   badgeVariant: 'default' },
  { key: 'FIRST_CONTACT',     label: 'Contato Feito',        color: 'bg-amber-400',   badgeVariant: 'warning' },
  { key: 'PRESENTATION_SENT', label: 'Apresentação Enviada', color: 'bg-sky-500',     badgeVariant: 'info' },
  { key: 'QUALIFIED',         label: 'Qualificado',          color: 'bg-emerald-500', badgeVariant: 'emerald' },
  { key: 'WAITING_LOGISTICS', label: 'Aguard. Logística',    color: 'bg-indigo-500',  badgeVariant: 'purple' },
];

const STATUS_OPTIONS = PROSPECTING_COLUMNS.map(c => ({ value: c.key, label: c.label }));

export const getLeadStatus = (s: Partial<Supplier>): ProspectingStatus => {
  if (s.prospecting_status && PROSPECTING_COLUMNS.some(c => c.key === s.prospecting_status)) {
    return s.prospecting_status;
  }
  if (s.current_stage === 'LOGISTICS') return 'WAITING_LOGISTICS';
  if (['QUALIFICATION', 'DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage || '')) return 'QUALIFIED';
  if (s.backlog_reason === 'PRESENTATION_SENT') return 'PRESENTATION_SENT';
  if (s.backlog_reason === 'FIRST_CONTACT') return 'FIRST_CONTACT';
  if (s.backlog_reason === 'QUALIFIED') return 'QUALIFIED';
  if (s.current_status === 'APPROVED') return 'QUALIFIED';
  if (s.current_status === 'IN_PROGRESS') return 'FIRST_CONTACT';
  return 'NEW_LEAD';
};

const MATERIAL_OPTIONS = [
  'Papelão', 
  'Papel Branco Sigiloso', 
  'Papel Misto', 
  'Plástico Filme',
  'Plástico Rígido', 
  'PET', 
  'Alumínio', 
  'Ferro/Aço', 
  'Cobre',
  'Vidro', 
  'Eletrônicos (REEE)', 
  'Orgânicos', 
  'Recicláveis em geral', 
  'Outro'
];

const SEGMENT_OPTIONS = [
  { value: 'Indústria', label: 'Indústria' },
  { value: 'Comércio', label: 'Comércio' },
  { value: 'Condomínio', label: 'Condomínio' },
  { value: 'Cooperativa', label: 'Cooperativa' },
  { value: 'Residencial', label: 'Residencial' },
  { value: 'Outro', label: 'Outro (digitar novo)' }
];

const LEAD_SOURCE_OPTIONS = [
  { value: 'Busca própria', label: 'Busca própria' },
  { value: 'Zion', label: 'Zion' },
  { value: 'Google Search', label: 'Google Search' },
  { value: 'Indicação', label: 'Indicação' },
  { value: 'Outro', label: 'Outro (digitar novo)' }
];

const STORAGE_OPTIONS = ['Container', 'Big Bag', 'Sacos de Lixo', 'Caçamba', 'Lixeira', 'Prensa / Enfardado', 'Granel / Solto', 'Outro'];
const FREQUENCY_OPTIONS = ['2x por semana', '1x por semana', 'Quinzenal', '1x por mês', 'Sob demanda', 'Esporádico'];

interface MaterialLine {
  id: string; 
  material_name: string;
  custom_material_name?: string;
  storage_form: string;
  frequency: string; 
  transaction_type: 'donation' | 'purchase';
  price_per_kg: string; 
  estimated_volume: string; 
  unit: string;
}

const newLine = (): MaterialLine => ({
  id: Math.random().toString(36).slice(2),
  material_name: '', 
  custom_material_name: '',
  storage_form: '', 
  frequency: '',
  transaction_type: 'donation', 
  price_per_kg: '', 
  estimated_volume: '', 
  unit: 'kg'
});

export default function ProspectingPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  
  // Data States
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // View Preference: Kanban or List/Table
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [cardDensity, setCardDensity] = useState<'compact' | 'detailed'>('detailed');
  const [showMetrics, setShowMetrics] = useState(true);

  // Initialize and persist showMetrics in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('prospecting_show_metrics');
      if (saved !== null) {
        setShowMetrics(saved === 'true');
      }
    } catch {
      // Ignore localStorage errors if blocked
    }
  }, []);

  const handleToggleMetrics = () => {
    setShowMetrics(prev => {
      const next = !prev;
      try {
        localStorage.setItem('prospecting_show_metrics', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [modalityFilter, setModalityFilter] = useState<'ALL' | 'donation' | 'purchase'>('ALL');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'city'>('recent');

  // Pagination for Table View
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals & Drag State
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedOverCol, setDraggedOverCol] = useState<ProspectingStatus | null>(null);
  
  // Material / Logistics Modals
  const [activeMaterialSupplier, setActiveMaterialSupplier] = useState<Supplier | null>(null);
  const [isSendingToLogistics, setIsSendingToLogistics] = useState(false);
  const [materials, setMaterials] = useState<MaterialLine[]>([newLine()]);
  
  // Optional attachments for logistics
  const [mtrFileName, setMtrFileName] = useState('');
  const [donationLetterFileName, setDonationLetterFileName] = useState('');

  // Form State for New Lead (nenhum campo pré-preenchido)
  const [form, setForm] = useState({
    name: '', 
    trade_name: '', 
    segment: '',
    custom_segment: '',
    lead_source: '',
    custom_lead_source: '',
    phone: '', 
    email: '', 
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    city: '', 
    neighborhood: '', 
    state: '', 
    internal_responsible_id: ''
  });

  const [isCepLoading, setIsCepLoading] = useState(false);

  const handleCepChange = async (val: string) => {
    const formatted = formatCep(val);
    setForm(p => ({ ...p, zip_code: formatted }));

    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsCepLoading(true);
      const addr = await fetchAddressByCep(clean);
      setIsCepLoading(false);
      if (addr) {
        setForm(p => ({
          ...p,
          street: addr.street || p.street,
          neighborhood: addr.neighborhood || p.neighborhood,
          city: addr.city || p.city,
          state: addr.state || p.state,
          complement: addr.complement || p.complement
        }));
      }
    }
  };

  const [attachedFiles, setAttachedFiles] = useState<{
    id: string;
    name: string;
    size: string;
    file_data: string;
    type: 'mtr' | 'donation_letter' | 'partnership_agreement' | 'env_license' | 'cnpj_card' | 'other';
    notes: string;
  }[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([dbService.getSuppliers(), dbService.getProfiles()]);
      const list = s
        .filter(x => !x.current_stage || ['PROSPECTING', 'QUALIFICATION', 'LOGISTICS'].includes(x.current_stage))
        .map(x => ({
          ...x,
          prospecting_status: getLeadStatus(x)
        }));
      setSuppliers(list);
      setProfiles(p);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const openMaterialsModal = (supplier: Supplier, forLogistics = false) => {
    setActiveMaterialSupplier(supplier);
    setIsSendingToLogistics(forLogistics);
    setAttachedFiles([]);

    if (supplier.materials && supplier.materials.length > 0) {
      setMaterials(supplier.materials.map(m => {
        const isStandard = MATERIAL_OPTIONS.includes(m.material_name);
        return {
          id: m.id, 
          material_name: isStandard ? m.material_name : 'Outro', 
          custom_material_name: isStandard ? '' : m.material_name,
          storage_form: m.storage_form || 'Sacos de Lixo',
          frequency: m.frequency || '1x por mês', 
          transaction_type: m.transaction_type,
          price_per_kg: m.price_per_kg ? String(m.price_per_kg) : '',
          estimated_volume: m.estimated_volume ? String(m.estimated_volume) : '', 
          unit: m.unit || 'kg'
        };
      }));
    } else { 
      setMaterials([newLine()]); 
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

      let inferredType: 'mtr' | 'donation_letter' | 'partnership_agreement' | 'env_license' | 'cnpj_card' | 'other' = 'other';
      const lower = file.name.toLowerCase();
      if (lower.includes('mtr') || lower.includes('manifesto')) inferredType = 'mtr';
      else if (lower.includes('doacao') || lower.includes('doação') || lower.includes('carta')) inferredType = 'donation_letter';
      else if (lower.includes('termo') || lower.includes('contrato') || lower.includes('parceria')) inferredType = 'partnership_agreement';
      else if (lower.includes('licenca') || lower.includes('licença')) inferredType = 'env_license';
      else if (lower.includes('cnpj')) inferredType = 'cnpj_card';

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

  const handleDeleteLead = async (supplierId: string, supplierName: string) => {
    if (!confirm(`Tem certeza que deseja apagar o lead "${supplierName}" permanentemente do sistema?`)) return;
    try {
      await dbService.deleteSupplier(supplierId);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir lead.');
    }
  };

  const canUserModifyLeadInLogistics = (s: Supplier) => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') return true;
    if (s.internal_responsible_id && s.internal_responsible_id === currentUser.id) return true;
    if (s.responsible?.name && currentUser.name && s.responsible.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    return false;
  };

  const updateStatus = async (supplierId: string, newStatus: ProspectingStatus) => {
    const s = suppliers.find(x => x.id === supplierId);
    if (!s || getLeadStatus(s) === newStatus) return;

    // Security Rule: If lead is currently in WAITING_LOGISTICS, only the responsible user or Admin can move it
    if (s.prospecting_status === 'WAITING_LOGISTICS' && !canUserModifyLeadInLogistics(s)) {
      alert(
        language === 'pt'
          ? `Apenas o responsável (${s.responsible?.name || 'quem enviou'}) ou Administrador pode alterar ou retirar este lead da Logística.`
          : `Only the responsible owner (${s.responsible?.name || 'sender'}) or Administrator can move or withdraw this lead from Logistics.`
      );
      return;
    }

    const stage = newStatus === 'WAITING_LOGISTICS' ? 'LOGISTICS'
                : newStatus === 'QUALIFIED'         ? 'QUALIFICATION' : 'PROSPECTING';
    const oldSuppliers = [...suppliers];

    // ⚡ 1. OPTIMISTIC UPDATE: Instant 0ms visual feedback on the board
    setSuppliers(prev => prev.map(item => {
      if (item.id === supplierId) {
        return {
          ...item,
          prospecting_status: newStatus,
          current_stage: stage,
          current_status: newStatus === 'WAITING_LOGISTICS' ? 'PENDING' : 'IN_PROGRESS'
        };
      }
      return item;
    }));

    // Auto-open materials modal ONLY if materials were not filled yet
    const hasMaterials = s.materials && s.materials.length > 0;
    if (newStatus === 'QUALIFIED' && !hasMaterials) {
      openMaterialsModal({ ...s, prospecting_status: newStatus, current_stage: stage }, false);
    } else if (newStatus === 'WAITING_LOGISTICS' && !hasMaterials) {
      openMaterialsModal({ ...s, prospecting_status: newStatus, current_stage: stage }, true);
    }

    // ⚡ 2. ASYNC BACKGROUND PERSISTENCE: Save to Supabase in parallel
    try {
      await Promise.all([
        dbService.updateSupplier(supplierId, {
          prospecting_status: newStatus, 
          current_stage: stage,
          current_status: newStatus === 'WAITING_LOGISTICS' ? 'PENDING' : 'IN_PROGRESS'
        }),
        dbService.addSupplierStatusHistory({
          supplier_id: supplierId, 
          old_stage: s.current_stage, 
          new_stage: stage,
          old_status: s.current_status, 
          new_status: newStatus === 'WAITING_LOGISTICS' ? 'PENDING' : 'IN_PROGRESS',
          user_id: currentUser?.id,
          notes: 'Status prospecção: ' + translateProspectingStatus(newStatus)
        })
      ]);
    } catch (err) { 
      console.error('Error persisting status change:', err);
      setSuppliers(oldSuppliers);
    }
  };

  const handleDrop = async (e: React.DragEvent, col: ProspectingStatus) => {
    e.preventDefault(); 
    setDraggedOverCol(null);
    const id = e.dataTransfer.getData('text/plain');
    if (id) await updateStatus(id, col);
  };

  const updMat = (id: string, field: keyof MaterialLine, val: string) =>
    setMaterials(p => p.map(m => m.id === id ? { ...m, [field]: val } : m));

  const handleSaveMaterialsAndLogistics = async () => {
    if (!activeMaterialSupplier || !currentUser) return;
    setIsSubmitting(true);
    try {
      // 1. Parallel save materials
      const materialPromises = materials.map(mat => {
        const finalName = mat.material_name === 'Outro' 
          ? (mat.custom_material_name?.trim() || 'Material Diversos') 
          : mat.material_name;

        if (!finalName) return Promise.resolve(null);

        return dbService.addSupplierMaterial({
          supplier_id: activeMaterialSupplier.id, 
          material_name: finalName, 
          category: finalName,
          estimated_volume: Number(mat.estimated_volume) || 0, 
          unit: mat.unit, 
          frequency: mat.frequency,
          transaction_type: mat.transaction_type,
          price_per_kg: mat.transaction_type === 'purchase' ? Number(mat.price_per_kg) || 0 : 0,
          storage_form: mat.storage_form, 
          notes: null
        });
      });

      await Promise.all(materialPromises);

      // 2. Save all attached files
      if (attachedFiles.length > 0) {
        await dbService.addSupplierDocuments(activeMaterialSupplier.id, attachedFiles);
      }

      // 3. If sending to logistics
      if (isSendingToLogistics && activeMaterialSupplier.prospecting_status !== 'WAITING_LOGISTICS') {
        await updateStatus(activeMaterialSupplier.id, 'WAITING_LOGISTICS');
      }

      setActiveMaterialSupplier(null);
      setAttachedFiles([]);
      await fetchData();
    } catch (err) { 
      console.error(err); 
      alert('Erro ao salvar materiais.'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { 
      alert('Informe a Razão Social ou Nome do Lead.'); 
      return; 
    }
    setIsSubmitting(true);

    const finalSegment = form.segment === 'Outro' 
      ? (form.custom_segment.trim() || 'Outro') 
      : form.segment;

    const finalLeadSource = form.lead_source === 'Outro' 
      ? (form.custom_lead_source.trim() || 'Outro') 
      : form.lead_source;

    try {
      const createdSupplier = await dbService.createSupplier(
        { 
          name: form.name, 
          trade_name: form.trade_name || form.name, 
          document: '', 
          supplier_type: finalSegment, 
          lead_source: finalLeadSource, 
          internal_responsible_id: form.internal_responsible_id || currentUser?.id || undefined
        },
        { 
          zip_code: form.zip_code, 
          street: form.street, 
          number: form.number, 
          complement: form.complement, 
          neighborhood: form.neighborhood, 
          city: form.city, 
          state: form.state 
        },
        { 
          name: form.name + ' (Contato)', 
          role: '', 
          phone: form.phone, 
          whatsapp: form.phone, 
          email: form.email 
        }
      );

      // ⚡ Direct state insertion: Appears instantly without waiting for slow table refetch
      if (createdSupplier) {
        setSuppliers(prev => [
          {
            ...createdSupplier,
            prospecting_status: 'NEW_LEAD'
          },
          ...prev
        ]);
      }

      setForm({ 
        name: '', 
        trade_name: '', 
        segment: 'Indústria', 
        custom_segment: '',
        lead_source: 'Busca própria', 
        custom_lead_source: '',
        phone: '', 
        email: '', 
        zip_code: '',
        street: '',
        number: '',
        complement: '',
        city: '', 
        neighborhood: '', 
        state: '', 
        internal_responsible_id: currentUser?.id || '' 
      });

      setIsNewLeadOpen(false);
    } catch (err: any) { 
      console.error(err); 
      alert(`Falha ao cadastrar lead: ${err.message || err.details || 'Verifique sua conexão com o Supabase.'}`); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Filtered & Sorted Suppliers
  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      const pStatus = getLeadStatus(s);
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        s.name.toLowerCase().includes(q) ||
        (s.trade_name && s.trade_name.toLowerCase().includes(q)) ||
        (s.address?.city && s.address.city.toLowerCase().includes(q)) ||
        (s.address?.neighborhood && s.address.neighborhood.toLowerCase().includes(q)) ||
        (s.address?.street && s.address.street.toLowerCase().includes(q)) ||
        (s.contacts && s.contacts.some(c => c.phone?.includes(q) || c.whatsapp?.includes(q) || c.name?.toLowerCase().includes(q)))
      );

      const matchesResponsible = responsibleFilter ? s.internal_responsible_id === responsibleFilter : true;
      const matchesStatus = statusFilter ? pStatus === statusFilter : true;

      const matchesMaterial = materialFilter 
        ? s.materials?.some(m => m.material_name.toLowerCase().includes(materialFilter.toLowerCase()))
        : true;

      const matchesModality = modalityFilter === 'ALL'
        ? true
        : s.materials?.some(m => m.transaction_type === modalityFilter);

      return matchesQuery && matchesResponsible && matchesStatus && matchesMaterial && matchesModality;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'city') return (a.address?.city || '').localeCompare(b.address?.city || '');
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [suppliers, searchQuery, responsibleFilter, statusFilter, materialFilter, modalityFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, responsibleFilter, statusFilter, materialFilter, modalityFilter, sortBy]);

  const hasActiveFilters = Boolean(searchQuery || responsibleFilter || statusFilter || materialFilter || modalityFilter !== 'ALL');

  const clearAllFilters = () => {
    setSearchQuery('');
    setResponsibleFilter('');
    setStatusFilter('');
    setMaterialFilter('');
    setModalityFilter('ALL');
  };

  const stats = useMemo(() => {
    const total = suppliers.length;
    const qualified = suppliers.filter(s => getLeadStatus(s) === 'QUALIFIED').length;
    const waitingLogistics = suppliers.filter(s => getLeadStatus(s) === 'WAITING_LOGISTICS').length;
    const donationsCount = suppliers.filter(s => s.materials?.some(m => m.transaction_type === 'donation')).length;
    return { total, qualified, waitingLogistics, donationsCount };
  }, [suppliers]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"/>
      <p className="text-sm text-slate-500 font-medium">Carregando funil comercial...</p>
    </div>
  );

  return (
    <div className="space-y-5 font-sans pb-10">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('prospecting.title', 'Funil de Prospecção')}
            </h1>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {suppliers.length} {language === 'pt' ? 'leads em prospecção' : 'leads in prospecting'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('prospecting.subtitle', 'Gerencie contatos comerciais e envie os qualificados para validação logística.')}
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* View Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kanban"
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table / List"
            >
              <TableIcon size={14} />
              {t('prospecting.viewTable', 'Tabela')}
            </button>
          </div>

          {viewMode === 'kanban' && (
            <button
              onClick={() => setCardDensity(prev => prev === 'detailed' ? 'compact' : 'detailed')}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
              title={cardDensity === 'detailed' ? 'Modo Compacto' : 'Modo Detalhado'}
            >
              {cardDensity === 'detailed' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{cardDensity === 'detailed' ? (language === 'pt' ? 'Compacto' : 'Compact') : (language === 'pt' ? 'Detalhado' : 'Detailed')}</span>
            </button>
          )}

          {/* Metrics Visibility Toggle */}
          <button
            onClick={handleToggleMetrics}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-sm ${
              showMetrics
                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white'
                : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            {showMetrics ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showMetrics ? (language === 'pt' ? 'Ocultar Indicadores' : 'Hide Metrics') : (language === 'pt' ? 'Mostrar Indicadores' : 'Show Metrics')}</span>
          </button>

          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'BUYER') && (
            <Button onClick={() => setIsNewLeadOpen(true)} className="gap-2 shrink-0 shadow-sm">
              <Plus size={16}/> {t('action.newLead', 'Cadastrar Lead')}
            </Button>
          )}
        </div>
      </div>

      {/* Mini KPI Bar & Funnel Pipeline Breadcrumb (Collapsible) */}
      {showMetrics && (
        <div className="space-y-3 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          {/* Mini KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total no Funil</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">
                <Layers size={16} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Qualificados</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.qualified}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs">
                <CheckCircle size={16} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Aguardando Logística</p>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{stats.waitingLogistics}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold text-xs">
                <Clock size={16} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Com Doação</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.donationsCount}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold text-xs">
                🤝
              </div>
            </div>
          </div>

          {/* Funnel Pipeline Visual Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium overflow-x-auto pb-1 flex-nowrap bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
            {PROSPECTING_COLUMNS.map((col, i) => (
              <React.Fragment key={col.key}>
                <button
                  onClick={() => setStatusFilter(statusFilter === col.key ? '' : col.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === col.key 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' 
                      : 'hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${col.color}`}/>
                  {col.label}
                  <span className="text-[10px] opacity-70 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-full font-bold">
                    {suppliers.filter(s => getLeadStatus(s) === col.key).length}
                  </span>
                </button>
                {i < PROSPECTING_COLUMNS.length - 1 && <span className="text-slate-200 dark:text-slate-700 mx-0.5">›</span>}
              </React.Fragment>
            ))}
            <span className="text-slate-200 dark:text-slate-700 mx-1">›</span>
            <span className="flex items-center gap-1 text-indigo-500 font-bold whitespace-nowrap px-2 py-1"><Users size={11}/>Logística analisa</span>
            <span className="text-slate-200 dark:text-slate-700 mx-1">›</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold whitespace-nowrap px-2 py-1"><CheckCircle size={11}/>Gerador Ativo</span>
          </div>
        </div>
      )}

      {/* Advanced Filter Toolbar */}
      <Card className="!p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          
          <div className="lg:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {language === 'pt' ? 'Pesquisar Lead' : 'Search Lead'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'pt' ? 'Empresa, segmento, rua, cidade, telefone...' : 'Company, segment, street, city, phone...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {language === 'pt' ? 'Material' : 'Material'}
            </label>
            <select
              value={materialFilter}
              onChange={e => setMaterialFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white cursor-pointer"
            >
              <option value="">{language === 'pt' ? 'Todos os materiais' : 'All materials'}</option>
              {MATERIAL_OPTIONS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {language === 'pt' ? 'Modalidade' : 'Modality'}
            </label>
            <select
              value={modalityFilter}
              onChange={e => setModalityFilter(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white cursor-pointer"
            >
              <option value="ALL">{language === 'pt' ? 'Todas' : 'All'}</option>
              <option value="donation">{language === 'pt' ? '🤝 Somente Doação' : '🤝 Donation Only'}</option>
              <option value="purchase">{language === 'pt' ? '💰 Somente Compra' : '💰 Purchase Only'}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {language === 'pt' ? 'Responsável' : 'Responsible'}
            </label>
            <select
              value={responsibleFilter}
              onChange={e => setResponsibleFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white cursor-pointer"
            >
              <option value="">{language === 'pt' ? 'Todos os responsáveis' : 'All responsibles'}</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {language === 'pt' ? 'Ordenar por' : 'Sort by'}
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white cursor-pointer"
              >
                <option value="recent">{language === 'pt' ? 'Mais Recentes' : 'Most Recent'}</option>
                <option value="name">{language === 'pt' ? 'Nome (A-Z)' : 'Name (A-Z)'}</option>
                <option value="city">{language === 'pt' ? 'Cidade (A-Z)' : 'City (A-Z)'}</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-5 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/40 text-xs font-semibold flex items-center gap-1 shrink-0"
                title={language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>
      </Card>

      {/* ===================== VIEW 1: KANBAN BOARD ===================== */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-start">
          {PROSPECTING_COLUMNS.map(col => {
            const cards = filtered.filter(s => getLeadStatus(s) === col.key);
            const isLogCol = col.key === 'WAITING_LOGISTICS';

            return (
              <div 
                key={col.key}
                onDragOver={e => { e.preventDefault(); setDraggedOverCol(col.key); }}
                onDragLeave={() => setDraggedOverCol(null)}
                onDrop={e => handleDrop(e, col.key)}
                className={`flex flex-col rounded-xl border-2 transition-all duration-200 bg-slate-50/60 dark:bg-slate-900/30 overflow-hidden ${
                  draggedOverCol === col.key 
                    ? 'border-emerald-400 bg-emerald-50/30 scale-[1.01]'
                    : isLogCol 
                      ? 'border-dashed border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/20'
                      : 'border-dashed border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Column Sticky Header */}
                <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.color}`}/>
                    <h3 className={`font-bold text-xs ${isLogCol ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {translateProspectingStatus(col.key, language)}
                    </h3>
                  </div>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold px-2 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>

                {/* Column Scrollable Content Area */}
                <div className="p-2.5 space-y-2.5 max-h-[calc(100vh-270px)] min-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {cards.map(supplier => {
                    const pc = supplier.contacts?.find(c => c.is_primary) || supplier.contacts?.[0];
                    const isQ = supplier.prospecting_status === 'QUALIFIED';
                    const isNewLeadCol = col.key === 'NEW_LEAD';
                    const canModifyLogistics = canUserModifyLeadInLogistics(supplier);
                    const isDraggable = !isLogCol || canModifyLogistics;

                    if (cardDensity === 'compact') {
                      return (
                        <div 
                          key={supplier.id}
                          draggable={isDraggable}
                          onDragStart={e => {
                            if (!isDraggable) {
                              e.preventDefault();
                              return;
                            }
                            e.dataTransfer.setData('text/plain', supplier.id);
                          }}
                          className={`bg-white dark:bg-slate-950 border p-2.5 rounded-xl shadow-xs hover:shadow-md transition-all duration-150 space-y-2 ${
                            isLogCol && !canModifyLogistics 
                              ? 'opacity-75 cursor-not-allowed border-indigo-100 dark:border-indigo-900/30' 
                              : isLogCol && canModifyLogistics
                                ? 'cursor-grab active:cursor-grabbing border-indigo-300 dark:border-indigo-700 bg-indigo-50/20'
                                : 'border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate" title={supplier.name}>
                                {supplier.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {supplier.supplier_type} • {supplier.address?.city || (language === 'pt' ? 'Sem cidade' : 'No city')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Link href={`/fornecedores/${supplier.id}`} className="text-slate-400 hover:text-[#2098D1] p-1 rounded" title="Ficha">
                                <Eye size={12} />
                              </Link>
                              <button
                                onClick={() => handleDeleteLead(supplier.id, supplier.name)}
                                className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                                title={language === 'pt' ? 'Apagar Lead' : 'Delete Lead'}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {supplier.attached_documents && supplier.attached_documents.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#2098D1] bg-[#E5F5F8] px-1.5 py-0.5 rounded-full border border-[#CCEAF1]">
                              <FileCheck size={10} /> {supplier.attached_documents.length} {language === 'pt' ? 'anexo(s)' : 'attachment(s)'}
                            </span>
                          )}

                          {!isNewLeadCol && supplier.materials && supplier.materials.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {supplier.materials.slice(0, 2).map((m, i) => (
                                <span 
                                  key={i} 
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    m.transaction_type === 'donation' 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {m.material_name}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                            {!isNewLeadCol && (
                              <button
                                onClick={() => openMaterialsModal(supplier, false)}
                                className="text-[10px] text-slate-500 hover:text-[#2098D1] font-semibold cursor-pointer"
                              >
                                + {language === 'pt' ? 'Materiais' : 'Materials'}
                              </button>
                            )}
                            {isQ && !isLogCol && (
                              <button 
                                onClick={() => {
                                  if (supplier.materials && supplier.materials.length > 0) {
                                    updateStatus(supplier.id, 'WAITING_LOGISTICS');
                                  } else {
                                    openMaterialsModal(supplier, true);
                                  }
                                }}
                                className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#2098D1] hover:bg-[#1883B5] px-2 py-0.5 rounded-full cursor-pointer shadow-xs"
                              >
                                <Send size={10}/> {language === 'pt' ? 'Logística' : 'Logistics'}
                              </button>
                            )}
                            {isLogCol && canModifyLogistics && (
                              <button 
                                onClick={() => updateStatus(supplier.id, 'QUALIFIED')}
                                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 cursor-pointer flex items-center gap-0.5"
                                title={language === 'pt' ? 'Retirar da Logística e voltar para Qualificado' : 'Return to Qualified'}
                              >
                                ↩️ {language === 'pt' ? 'Voltar' : 'Return'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={supplier.id}
                        draggable={isDraggable}
                        onDragStart={e => {
                          if (!isDraggable) {
                            e.preventDefault();
                            return;
                          }
                          e.dataTransfer.setData('text/plain', supplier.id);
                        }}
                        className={`bg-white border p-3 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 space-y-2.5 ${
                          isLogCol && !canModifyLogistics 
                            ? 'opacity-80 cursor-not-allowed bg-slate-50/50 border-[#D6EFF5]' 
                            : isLogCol && canModifyLogistics
                              ? 'cursor-grab active:cursor-grabbing border-indigo-300 bg-indigo-50/10 hover:border-indigo-500'
                              : 'border-[#D6EFF5] cursor-grab active:cursor-grabbing hover:border-[#2098D1]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#0D2439] leading-tight line-clamp-2" title={supplier.name}>
                              {supplier.name}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="inline-block text-[10px] font-bold text-[#146A88] bg-[#E5F5F8] px-1.5 py-0.2 rounded">
                                {supplier.supplier_type || (language === 'pt' ? 'Segmento n/d' : 'Segment n/a')}
                              </span>
                              {supplier.attached_documents && supplier.attached_documents.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#2098D1] bg-[#DDF4F9] px-1.5 py-0.2 rounded border border-[#CCEAF1]">
                                  <FileCheck size={9} /> {supplier.attached_documents.length} {language === 'pt' ? 'anexo(s)' : 'attachment(s)'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link 
                              href={`/fornecedores/${supplier.id}`}
                              className="p-1 rounded-md text-slate-400 hover:text-[#2098D1] hover:bg-[#E5F5F8] transition-colors"
                              title="Ficha 360º"
                            >
                              <Eye size={13} />
                            </Link>
                            <button
                              onClick={() => handleDeleteLead(supplier.id, supplier.name)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title={language === 'pt' ? 'Apagar Lead' : 'Delete Lead'}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {supplier.address?.street ? (
                          <div className="flex items-start gap-1.5 text-[10px] text-slate-500">
                            <MapPin size={10} className="shrink-0 text-slate-400 mt-0.5"/>
                            <span className="truncate">{supplier.address.street}, {supplier.address.number || 'S/N'} • {supplier.address.city}/{supplier.address.state}</span>
                          </div>
                        ) : supplier.address?.city ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <MapPin size={10} className="shrink-0 text-slate-400"/>
                            <span className="truncate">{supplier.address.city} - {supplier.address.state}</span>
                          </div>
                        ) : null}

                        {pc?.phone && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Phone size={10} className="shrink-0 text-slate-400"/>
                            <span className="truncate">{pc.whatsapp || pc.phone} {pc.name ? `(${pc.name.split(' ')[0]})` : ''}</span>
                          </div>
                        )}

                        {/* Materials Section: Hidden on Novo Lead */}
                        {!isNewLeadCol && (
                          supplier.materials && supplier.materials.length > 0 ? (
                            <div className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                  {language === 'pt' ? 'Materiais Identificados' : 'Identified Materials'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-500">
                                  {supplier.materials.length} {language === 'pt' ? 'item(ns)' : 'item(s)'}
                                </span>
                              </div>
                              {supplier.materials.slice(0, 2).map((m, i) => (
                                <div key={i} className="flex items-center justify-between gap-1">
                                  <span className="truncate font-medium">• {m.material_name}</span>
                                  <span className={`text-[9px] font-bold px-1 rounded shrink-0 ${
                                    m.transaction_type === 'donation' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                                  }`}>
                                    {m.transaction_type === 'donation' ? (language === 'pt' ? 'Doação' : 'Donation') : (language === 'pt' ? 'Compra' : 'Purchase')}
                                  </span>
                                </div>
                              ))}
                              <button
                                onClick={() => openMaterialsModal(supplier, false)}
                                className="text-[9px] font-bold text-[#2098D1] hover:underline pt-0.5 block cursor-pointer"
                              >
                                + {language === 'pt' ? 'Gerenciar / Editar Materiais' : 'Manage / Edit Materials'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openMaterialsModal(supplier, false)}
                              className={`w-full py-2 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                                isLogCol 
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-2 border-dashed border-amber-300 hover:bg-amber-100'
                                  : 'text-slate-600 hover:text-[#2098D1] border border-dashed border-slate-300 hover:border-[#2098D1] bg-slate-50 hover:bg-[#E5F5F8]/50'
                              }`}
                            >
                              <PackagePlus size={13} className={isLogCol ? 'text-amber-600' : 'text-slate-400'} />
                              {isLogCol 
                                ? (language === 'pt' ? '⚠️ Preencher Materiais Disponíveis' : '⚠️ Fill Available Materials')
                                : (language === 'pt' ? 'Preencher Materiais Disponíveis' : 'Fill Available Materials')}
                            </button>
                          )
                        )}

                        {/* Status change dropdown & Logistics controls */}
                        {isLogCol ? (
                          canModifyLogistics ? (
                            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                  <Clock size={10}/> {language === 'pt' ? 'Na Logística (Seu Lead)' : 'In Logistics (Yours)'}
                                </span>
                                <button 
                                  onClick={() => updateStatus(supplier.id, 'QUALIFIED')}
                                  className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 cursor-pointer flex items-center gap-0.5"
                                  title={language === 'pt' ? 'Retirar da Logística e voltar para Qualificado' : 'Return to Qualified'}
                                >
                                  ↩️ {language === 'pt' ? 'Voltar p/ Qualificado' : 'Back to Qualified'}
                                </button>
                              </div>
                              <select 
                                value={supplier.prospecting_status}
                                onChange={e => updateStatus(supplier.id, e.target.value as ProspectingStatus)}
                                className="w-full text-[10px] font-medium bg-indigo-50/50 border border-indigo-200 rounded-lg px-2 py-1 text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                              >
                                {STATUS_OPTIONS.map(o => (
                                  <option key={o.value} value={o.value}>{translateProspectingStatus(o.value, language)}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1.5 rounded-lg border border-indigo-100">
                              <Lock size={10} className="shrink-0 text-indigo-500" />
                              <span>{language === 'pt' ? 'Em análise (bloqueado p/ outros)' : 'In review (locked for others)'}</span>
                            </div>
                          )
                        ) : (
                          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            <select 
                              value={supplier.prospecting_status}
                              onChange={e => updateStatus(supplier.id, e.target.value as ProspectingStatus)}
                              className="w-full text-[10px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            >
                              {STATUS_OPTIONS.filter(o => o.value !== 'WAITING_LOGISTICS').map(o => (
                                <option key={o.value} value={o.value}>{translateProspectingStatus(o.value, language)}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {isQ && !isLogCol && (
                          <button 
                            onClick={() => {
                              if (supplier.materials && supplier.materials.length > 0) {
                                updateStatus(supplier.id, 'WAITING_LOGISTICS');
                              } else {
                                openMaterialsModal(supplier, true);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            <Send size={11}/> {language === 'pt' ? 'Enviar para Logística' : 'Send to Logistics'}
                          </button>
                        )}

                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                          <span className="truncate max-w-[90px] font-medium">{supplier.responsible?.name?.split(' ')[0] || (language === 'pt' ? 'Sem resp.' : 'Unassigned')}</span>
                          <span>{formatDate(supplier.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}

                  {cards.length === 0 && (
                    <div className="py-16 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      {isLogCol ? (language === 'pt' ? 'Nenhum lead enviado ainda' : 'No leads sent yet') : (language === 'pt' ? 'Nenhum lead nesta etapa' : 'No leads in this stage')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== VIEW 2: TABLE VIEW ===================== */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden !p-0 border border-slate-200 dark:border-slate-800 shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Search size={32} className="mx-auto text-slate-300 mb-2 opacity-60" />
              <p className="font-semibold text-sm">Nenhum lead encontrado com os filtros atuais.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="px-5 py-3.5">{language === 'pt' ? 'Lead / Segmento' : 'Lead / Segment'}</th>
                      <th className="px-4 py-3.5">{language === 'pt' ? 'Localização' : 'Location'}</th>
                      <th className="px-4 py-3.5">{language === 'pt' ? 'Contato' : 'Contact'}</th>
                      <th className="px-4 py-3.5">{language === 'pt' ? 'Materiais Declarados' : 'Declared Materials'}</th>
                      <th className="px-4 py-3.5">{language === 'pt' ? 'Status no Funil' : 'Funnel Status'}</th>
                      <th className="px-4 py-3.5">{language === 'pt' ? 'Responsável' : 'Responsible'}</th>
                      <th className="px-5 py-3.5 text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {paginatedSuppliers.map(supplier => {
                      const pc = supplier.contacts?.find(c => c.is_primary) || supplier.contacts?.[0];
                      const isQ = supplier.prospecting_status === 'QUALIFIED';
                      const isLog = supplier.prospecting_status === 'WAITING_LOGISTICS';

                      return (
                        <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white leading-snug">{supplier.name}</span>
                              <span className="text-[11px] text-slate-400">{supplier.supplier_type} • {supplier.lead_source}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex flex-col text-slate-600 text-[11px]">
                              <span>{supplier.address?.city || 'São Paulo'} - {supplier.address?.state || 'SP'}</span>
                              {supplier.address?.street && <span className="text-slate-400">{supplier.address.street}, {supplier.address.number}</span>}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {pc ? (
                              <div className="flex flex-col text-slate-600">
                                <span className="font-medium text-slate-800">{pc.name}</span>
                                <span className="text-[11px] text-slate-400">{pc.whatsapp || pc.phone || '-'}</span>
                              </div>
                            ) : '-'}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {supplier.materials && supplier.materials.length > 0 ? (
                                supplier.materials.map((m, i) => (
                                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-700">
                                    {m.material_name}
                                  </span>
                                ))
                              ) : (
                                <button
                                  onClick={() => openMaterialsModal(supplier, false)}
                                  className="text-[10px] text-emerald-600 font-bold hover:underline"
                                >
                                  + {language === 'pt' ? 'Adicionar' : 'Add'}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {isLog ? (
                              canUserModifyLeadInLogistics(supplier) ? (
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={supplier.prospecting_status}
                                    onChange={e => updateStatus(supplier.id, e.target.value as ProspectingStatus)}
                                    className="text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg px-2 py-1 outline-none cursor-pointer"
                                  >
                                    {STATUS_OPTIONS.map(o => (
                                      <option key={o.value} value={o.value}>{translateProspectingStatus(o.value, language)}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => updateStatus(supplier.id, 'QUALIFIED')}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100/70 hover:bg-indigo-200 px-2 py-1 rounded-md cursor-pointer transition-colors"
                                    title={language === 'pt' ? 'Voltar p/ Qualificado' : 'Back to Qualified'}
                                  >
                                    ↩️
                                  </button>
                                </div>
                              ) : (
                                <Badge variant="purple" className="gap-1">
                                  <Lock size={11} /> {translateProspectingStatus('WAITING_LOGISTICS', language)}
                                </Badge>
                              )
                            ) : (
                              <select
                                value={supplier.prospecting_status}
                                onChange={e => updateStatus(supplier.id, e.target.value as ProspectingStatus)}
                                className="text-[11px] font-semibold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none cursor-pointer"
                              >
                                {STATUS_OPTIONS.filter(o => o.value !== 'WAITING_LOGISTICS').map(o => (
                                  <option key={o.value} value={o.value}>{translateProspectingStatus(o.value, language)}</option>
                                ))}
                              </select>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="text-slate-700 font-medium">{supplier.responsible?.name || '-'}</span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {supplier.attached_documents && supplier.attached_documents.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2098D1] bg-[#E5F5F8] px-2 py-0.5 rounded-full border border-[#CCEAF1]">
                                  <FileCheck size={11} /> {supplier.attached_documents.length}
                                </span>
                              )}
                              {isQ && !isLog && (
                                <button
                                  onClick={() => openMaterialsModal(supplier, true)}
                                  className="inline-flex items-center gap-1 text-[11px] text-white bg-[#2098D1] hover:bg-[#1883B5] px-2.5 py-1 rounded-full font-bold shadow-xs cursor-pointer"
                                >
                                  <Send size={11} /> {language === 'pt' ? 'Logística' : 'Logistics'}
                                </button>
                              )}
                              <Link href={`/fornecedores/${supplier.id}`}>
                                <button className="inline-flex items-center gap-1 text-[11px] text-[#2098D1] bg-[#E5F5F8] hover:bg-[#DDF4F9] px-2.5 py-1 rounded-full font-bold border border-[#CCEAF1] cursor-pointer">
                                  <Eye size={11} /> {language === 'pt' ? 'Ficha' : 'Details'}
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDeleteLead(supplier.id, supplier.name)}
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

              {/* Table Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                <span>
                  {language === 'pt'
                    ? <>Exibindo <strong>{(currentPage - 1) * pageSize + 1}</strong> a <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> de <strong>{filtered.length}</strong> leads</>
                    : <>Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> leads</>}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft size={13} /> Anterior
                  </button>
                  <span className="px-2 font-bold text-slate-700">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-semibold flex items-center gap-1"
                  >
                    Próxima <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Modal: Materiais Disponíveis & Envio para Logística */}
      {activeMaterialSupplier && (
        <Modal 
          isOpen={!!activeMaterialSupplier} 
          onClose={() => setActiveMaterialSupplier(null)}
          title={isSendingToLogistics 
            ? `Enviar para Logística — ${activeMaterialSupplier.name}`
            : `Materiais Disponíveis — ${activeMaterialSupplier.name}`
          } 
          size="xl"
        >
          <div className="space-y-5">
            <div className={`flex items-start gap-3 p-3 rounded-xl text-xs ${
              isSendingToLogistics 
                ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' 
                : 'bg-emerald-50 border border-emerald-100 text-emerald-800'
            }`}>
              <FileText size={15} className="shrink-0 mt-0.5"/>
              <p>
                {isSendingToLogistics 
                  ? 'Confirme os materiais que o lead possui para que a equipe de Logística realize o cálculo de frete e capacidade operacional.'
                  : 'Preencha os materiais identificados no contato comercial. Essas informações acompanharão o lead até a aprovação.'}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Materiais do Lead</h4>
                <button 
                  onClick={() => setMaterials(p => [...p, newLine()])}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <PackagePlus size={13}/>Adicionar Material
                </button>
              </div>

              {materials.map((mat, idx) => (
                <div key={mat.id} className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{`Material #${idx + 1}`}</span>
                    {materials.length > 1 && (
                      <button 
                        onClick={() => setMaterials(p => p.filter(m => m.id !== mat.id))}
                        className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remover material"
                      >
                        <Trash2 size={13}/>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Tipo de Material / Categoria *</label>
                      <select 
                        value={mat.material_name} 
                        onChange={e => updMat(mat.id, 'material_name', e.target.value)}
                        className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                      >
                        <option value="">Selecione o material...</option>
                        {MATERIAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      {mat.material_name === 'Outro' && (
                        <input
                          type="text"
                          placeholder="Digite o nome do material personalizado..."
                          value={mat.custom_material_name || ''}
                          onChange={e => updMat(mat.id, 'custom_material_name', e.target.value)}
                          className="mt-1 px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Armazenamento no Local</label>
                      <select 
                        value={mat.storage_form} 
                        onChange={e => updMat(mat.id, 'storage_form', e.target.value)}
                        className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                      >
                        <option value="">Selecione o acondicionamento...</option>
                        {STORAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Frequência Estimada</label>
                      <select 
                        value={mat.frequency} 
                        onChange={e => updMat(mat.id, 'frequency', e.target.value)}
                        className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                      >
                        <option value="">Selecione a frequência...</option>
                        {FREQUENCY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-600">Volume Estimado</label>
                        <input 
                          type="number" 
                          value={mat.estimated_volume} 
                          placeholder="Ex: 500"
                          onChange={e => updMat(mat.id, 'estimated_volume', e.target.value)}
                          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="w-24 flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-600">Unidade</label>
                        <select 
                          value={mat.unit} 
                          onChange={e => updMat(mat.id, 'unit', e.target.value)}
                          className="px-2 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="kg">kg</option>
                          <option value="ton">ton</option>
                          <option value="un">un</option>
                          <option value="m³">m³</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Modalidade Comercial *</label>
                      <div className="flex gap-2">
                        {(['donation', 'purchase'] as const).map(type => (
                          <label 
                            key={type} 
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                              mat.transaction_type === type
                                ? (type === 'donation' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-amber-400 bg-amber-50 text-amber-700')
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            <input 
                              type="radio" 
                              className="sr-only" 
                              checked={mat.transaction_type === type}
                              onChange={() => updMat(mat.id, 'transaction_type', type)}
                            />
                            {type === 'donation' ? '🤝 Doação' : '💰 Compra'}
                          </label>
                        ))}
                      </div>
                    </div>

                    {mat.transaction_type === 'purchase' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-600">Preço Estimado por kg (R$)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={mat.price_per_kg} 
                          placeholder="Ex: 0.50"
                          onChange={e => updMat(mat.id, 'price_per_kg', e.target.value)}
                          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Multi-file Attachments from PC */}
            <div className="p-4 bg-[#F0F9FB] border border-[#CCEAF1] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0E2439]">
                  <Upload size={15} className="text-[#2098D1]" />
                  <span>Anexar Documentos do Computador {isSendingToLogistics ? '(Para a Logística)' : ''}</span>
                </div>
                <label className="inline-flex items-center gap-1.5 bg-white hover:bg-[#E5F5F8] text-[#2098D1] border border-[#CCEAF1] px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs">
                  <Plus size={13} />
                  <span>Buscar no PC</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              <p className="text-[11px] text-[#4F7891]">
                Selecione um ou vários arquivos (MTR, Carta de Doação, Termo de Parceria, Licenças, PDF, imagens ou planilhas). Eles ficarão salvos permanentemente na ficha deste lead em todas as etapas.
              </p>

              {/* Attached Files List */}
              {attachedFiles.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="p-2.5 bg-white border border-[#CCEAF1] rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-[#E5F5F8] text-[#2098D1] flex items-center justify-center font-bold text-xs shrink-0">
                          <FileCheck size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0E2439] truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                          <span className="text-[10px] text-slate-400">{file.size}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={file.type}
                          onChange={e => {
                            const newType = e.target.value as any;
                            setAttachedFiles(prev => prev.map(f => f.id === file.id ? { ...f, type: newType } : f));
                          }}
                          className="px-2 py-1 text-[11px] font-bold bg-[#F7FCFD] border border-[#CCEAF1] rounded-lg outline-none cursor-pointer"
                        >
                          <option value="mtr">MTR (Manifesto)</option>
                          <option value="donation_letter">Carta de Doação</option>
                          <option value="partnership_agreement">Termo de Parceria</option>
                          <option value="env_license">Licença Ambiental</option>
                          <option value="cnpj_card">Cartão CNPJ</option>
                          <option value="other">Outro Documento</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                          title="Remover anexo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 border border-dashed border-[#CCEAF1] rounded-xl text-center text-xs text-slate-400">
                  Nenhum arquivo anexado ainda. Clique em "Buscar no PC" para selecionar arquivos.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setActiveMaterialSupplier(null)}>Cancelar</Button>
              <Button 
                onClick={handleSaveMaterialsAndLogistics} 
                isLoading={isSubmitting} 
                className={`gap-2 ${isSendingToLogistics ? '!bg-indigo-600 hover:!bg-indigo-700' : ''}`}
              >
                {isSendingToLogistics ? (
                  <>
                    <Send size={14}/>{language === 'pt' ? 'Confirmar e Enviar para Logística' : 'Confirm and Send to Logistics'}
                  </>
                ) : (
                  <>
                    <FileCheck size={14}/>{language === 'pt' ? 'Salvar Materiais' : 'Save Materials'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Cadastrar Novo Lead */}
      <Modal isOpen={isNewLeadOpen} onClose={() => setIsNewLeadOpen(false)} title={language === 'pt' ? 'Cadastrar Novo Lead' : 'Register New Lead'} size="lg">
        <form onSubmit={handleCreateLead} className="space-y-5">
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
            {language === 'pt' ? 'Cadastre os dados básicos e de localização do lead. Campos adicionais podem ser completados conforme o contato avança.' : 'Enter basic and location details for the lead. Additional fields can be completed as negotiations advance.'}
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
              {language === 'pt' ? 'Empresa & Segmento' : 'Company & Segment'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Input 
                  label={language === 'pt' ? 'Razão Social / Nome *' : 'Company Name / Lead Name *'}
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                  placeholder={language === 'pt' ? 'Ex: Metalúrgica SP Ltda' : 'e.g. Acme Recycling Corp'}
                  required
                />
              </div>
              
              {/* Segmento do Gerador */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'pt' ? 'Segmento do Gerador *' : 'Generator Segment *'}
                </label>
                <select
                  value={form.segment}
                  onChange={e => setForm(p => ({ ...p, segment: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  <option value="">{language === 'pt' ? 'Selecione o segmento...' : 'Select segment...'}</option>
                  {SEGMENT_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {form.segment === 'Outro' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Digite o novo segmento...' : 'Enter custom segment...'}
                    value={form.custom_segment}
                    onChange={e => setForm(p => ({ ...p, custom_segment: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white border border-emerald-400 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                )}
              </div>

              {/* Como encontramos */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'pt' ? 'Como encontramos *' : 'Lead Source *'}
                </label>
                <select
                  value={form.lead_source}
                  onChange={e => setForm(p => ({ ...p, lead_source: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  <option value="">{language === 'pt' ? 'Selecione como encontramos...' : 'Select lead source...'}</option>
                  {LEAD_SOURCE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {form.lead_source === 'Outro' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Digite o meio de origem...' : 'Enter custom lead source...'}
                    value={form.custom_lead_source}
                    onChange={e => setForm(p => ({ ...p, custom_lead_source: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white border border-emerald-400 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
              {language === 'pt' ? 'Localização e Endereço Completo' : 'Location and Full Address'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Input 
                  label="CEP / Postal Code" 
                  value={form.zip_code} 
                  onChange={e => handleCepChange(e.target.value)} 
                  placeholder="01001-000"
                  maxLength={9}
                />
                {isCepLoading && (
                  <span className="absolute right-3 top-8 text-xs text-[#2098D1] flex items-center gap-1 font-semibold animate-pulse">
                    <Loader2 size={13} className="animate-spin" /> {language === 'pt' ? 'Buscando...' : 'Searching...'}
                  </span>
                )}
              </div>
              <div className="md:col-span-2">
                <Input 
                  label={language === 'pt' ? 'Logradouro / Rua / Avenida' : 'Street Address'} 
                  value={form.street} 
                  onChange={e => setForm(p => ({ ...p, street: e.target.value }))} 
                  placeholder={language === 'pt' ? 'Ex: Avenida Paulista' : 'e.g. 5th Avenue'}
                />
              </div>
              <Input 
                label={language === 'pt' ? 'Número' : 'Number'} 
                value={form.number} 
                onChange={e => setForm(p => ({ ...p, number: e.target.value }))} 
                placeholder="1000"
              />
              <Input 
                label={language === 'pt' ? 'Complemento' : 'Complement'} 
                value={form.complement} 
                onChange={e => setForm(p => ({ ...p, complement: e.target.value }))} 
                placeholder={language === 'pt' ? 'Bloco B, Galpão 3' : 'Suite 200, Warehouse'}
              />
              <Input 
                label={language === 'pt' ? 'Bairro' : 'Neighborhood'} 
                value={form.neighborhood} 
                onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))} 
                placeholder="Industrial"
              />
              <div className="md:col-span-2">
                <Input 
                  label={language === 'pt' ? 'Cidade' : 'City'} 
                  value={form.city} 
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))} 
                  placeholder="Sorocaba"
                />
              </div>
              <Input 
                label={language === 'pt' ? 'UF / Estado' : 'State'} 
                value={form.state} 
                onChange={e => setForm(p => ({ ...p, state: e.target.value.toUpperCase().slice(0, 2) }))} 
                placeholder="SP"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
              {language === 'pt' ? 'Contato & Responsável' : 'Contact & Responsible'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input 
                label={language === 'pt' ? 'Telefone / WhatsApp' : 'Phone / WhatsApp'} 
                value={form.phone} 
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} 
                placeholder="(15) 99999-9999"
              />
              <Input 
                label={language === 'pt' ? 'E-mail Comercial' : 'Corporate Email'} 
                type="email"
                value={form.email} 
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                placeholder="contato@empresa.com.br"
              />
              
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'pt' ? 'Responsável Comercial *' : 'Commercial Responsible *'}
                </label>
                <select
                  value={form.internal_responsible_id}
                  onChange={e => setForm(p => ({ ...p, internal_responsible_id: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  <option value="">{language === 'pt' ? 'Selecione o responsável...' : 'Select responsible...'}</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsNewLeadOpen(false)}>
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> {language === 'pt' ? 'Salvando...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Plus size={14} /> {language === 'pt' ? 'Cadastrar Lead' : 'Register Lead'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
