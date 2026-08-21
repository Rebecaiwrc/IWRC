'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dbService } from '@/features/shared/services/dbService';
import { 
  Supplier, 
  Profile, 
  SupplierStage,
  SupplierStatus,
  AttachedDocument,
  Collection
} from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { 
  translateStage, 
  getStageColor, 
  translateStatus, 
  getStatusColor, 
  translateProspectingStatus,
  translateSupplierType,
  translateStorageForm,
  translateFrequency,
  translateLogText,
  formatDate, 
  formatCurrency, 
  formatVolume,
  translateInteractionType,
  translateFeasibility,
  getFeasibilityColor,
  getLogisticsSlaInfo,
  translateMaterialName
} from '@/lib/utils';
import Link from 'next/link';

import { 
  Building2, 
  MapPin, 
  Phone, 
  UserCheck, 
  Clock, 
  Calendar, 
  Scale, 
  Plus, 
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  XCircle,
  Truck,
  Send,
  Trash2,
  FileText,
  Key,
  Eye,
  EyeOff,
  Upload,
  FileCheck,
  Download,
  CalendarCheck,
  MessageSquare,
  GitBranch,
  Lock,
  PackagePlus,
  Edit2,
  Pencil
} from 'lucide-react';
import {
  DOC_CHECKLIST,
  transportTypeOptions,
  responsibleOptions,
  frequencyOptions,
  feasibilityOptions
} from '@/app/(dashboard)/logistica/page';

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

const STORAGE_OPTIONS = ['Container', 'Big Bag', 'Sacos de Lixo', 'Caçamba', 'Lixeira', 'Prensa / Enfardado', 'Granel / Solto', 'Outro'];
const FREQUENCY_OPTIONS = ['2x por semana', '1x por semana', 'Quinzenal', '1x por mês', 'Sob demanda', 'Esporádico', 'Entrega única'];

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
  needs_storage_provision?: boolean;
  storage_provision_type?: string;
  storage_provision_quantity?: string;
  storage_provision_custom_type?: string;
  created_at?: string;
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
  unit: 'kg',
  needs_storage_provision: false,
  storage_provision_type: 'Bag',
  storage_provision_quantity: '',
  storage_provision_custom_type: ''
});

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();

  // Data state
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'logistics' | 'documents' | 'collections' | 'timeline'>('overview');

  // MTR Password visibility toggle
  const [showMtrPassword, setShowMtrPassword] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [isRespondInfoModalOpen, setIsRespondInfoModalOpen] = useState(false);
  const [respondInfoText, setRespondInfoText] = useState('');
  const [pendingDocs, setPendingDocs] = useState<string[]>([]);
  const [customPendingDoc, setCustomPendingDoc] = useState('');

  // Logistics form state
  const [logisticsForm, setLogisticsForm] = useState({
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

  // Form states
  const [editSupplier, setEditSupplier] = useState({
    name: '',
    trade_name: '',
    document: '',
    supplier_type: '',
    custom_supplier_type: '',
    lead_source: '',
    custom_lead_source: '',
    internal_responsible_id: '',
    mtr_login: '',
    mtr_password: '',
    first_collection_date: '',
    last_collection_date: '',
    current_stage: '' as SupplierStage,
    current_status: '' as SupplierStatus,
    backlog_reason: ''
  });

  const [newDoc, setNewDoc] = useState({
    name: '',
    type: '' as AttachedDocument['type'],
    notes: ''
  });

  const [newInteraction, setNewInteraction] = useState({
    type: '',
    description: ''
  });

  const [newTask, setNewTask] = useState({
    description: '',
    due_date: ''
  });

  const [materialsForm, setMaterialsForm] = useState<MaterialLine[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{
    id: string;
    name: string;
    size: string;
    file_data: string;
    type: 'mtr' | 'donation_letter' | 'partnership_agreement' | 'env_license' | 'cnpj_card' | 'other';
    notes: string;
  }[]>([]);
  const [isSavingMaterials, setIsSavingMaterials] = useState(false);

  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [newCollection, setNewCollection] = useState({
    scheduled_date: '',
    driver_name: '',
    carrier_name: '',
    notes: '',
    material_name: '',
    estimated_volume: '',
    unit: 'kg',
    custom_unit: ''
  });

  const hasRealPendingAlert = (s: Supplier | null) => {
    if (!s || !s.backlog_reason) return false;
    const reason = s.backlog_reason.trim().toLowerCase();
    if (['qualified', 'new_lead', 'first_contact', 'presentation_sent', 'waiting_logistics'].includes(reason)) {
      return false;
    }
    if (reason.includes('aprovado') || reason.includes('pronto para')) {
      return false;
    }
    if (s.current_status === 'APPROVED' && !reason.includes('inviável') && !reason.includes('pendência')) {
      return false;
    }
    return true;
  };

  const fetchSupplierData = async () => {
    try {
      const data = await dbService.getSupplier(supplierId);
      if (!data) {
        alert('Gerador não encontrado');
        router.push('/fornecedores');
        return;
      }
      setSupplier(data);

      const isStdType = ['Indústria', 'Comércio', 'Condomínio', 'Cooperativa', 'Residencial'].includes(data.supplier_type);
      const isStdSource = ['Busca própria', 'Zion', 'Google Search', 'Indicação'].includes(data.lead_source);

      setEditSupplier({
        name: data.name,
        trade_name: data.trade_name || '',
        document: data.document || '',
        supplier_type: isStdType ? data.supplier_type : 'Outro',
        custom_supplier_type: isStdType ? '' : data.supplier_type,
        lead_source: isStdSource ? data.lead_source : 'Outro',
        custom_lead_source: isStdSource ? '' : data.lead_source,
        internal_responsible_id: data.internal_responsible_id || '',
        mtr_login: data.mtr_login || '',
        mtr_password: data.mtr_password || '',
        first_collection_date: data.first_collection_date || '',
        last_collection_date: data.last_collection_date || '',
        current_stage: data.current_stage,
        current_status: data.current_status,
        backlog_reason: data.backlog_reason || ''
      });

      const p = await dbService.getProfiles();
      setProfiles(p);
    } catch (err) {
      console.error('Error fetching supplier details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, [supplierId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Carregando ficha do gerador...</p>
      </div>
    );
  }

  if (!supplier) return null;

  // Actions
  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const oldStage = supplier.current_stage;
      const oldStatus = supplier.current_status;

      const finalSegment = editSupplier.supplier_type === 'Outro'
        ? (editSupplier.custom_supplier_type.trim() || 'Outro')
        : editSupplier.supplier_type;

      const finalSource = editSupplier.lead_source === 'Outro'
        ? (editSupplier.custom_lead_source.trim() || 'Outro')
        : editSupplier.lead_source;
      
      await dbService.updateSupplier(supplier.id, {
        name: editSupplier.name,
        trade_name: editSupplier.trade_name || null,
        document: editSupplier.document || null,
        supplier_type: finalSegment,
        lead_source: finalSource,
        internal_responsible_id: editSupplier.internal_responsible_id || null,
        mtr_login: editSupplier.mtr_login || null,
        mtr_password: editSupplier.mtr_password || null,
        first_collection_date: editSupplier.first_collection_date || null,
        last_collection_date: editSupplier.last_collection_date || null,
        current_stage: editSupplier.current_stage,
        current_status: editSupplier.current_status,
        backlog_reason: editSupplier.backlog_reason || null
      });

      if (oldStage !== editSupplier.current_stage || oldStatus !== editSupplier.current_status) {
        await dbService.addSupplierStatusHistory({
          supplier_id: supplier.id,
          old_stage: oldStage,
          new_stage: editSupplier.current_stage,
          old_status: oldStatus,
          new_status: editSupplier.current_status,
          user_id: currentUser?.id || 'usr-rebeca-buy',
          notes: 'Alteração cadastral manual da ficha'
        });
      }

      setIsEditModalOpen(false);
      fetchSupplierData();
    } catch (err) {
      console.error('Error updating supplier:', err);
      alert('Falha ao atualizar gerador');
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

  const canUserModifySupplier = () => {
    if (!currentUser || !supplier) return false;
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') return true;
    if (supplier.internal_responsible_id && supplier.internal_responsible_id === currentUser.id) return true;
    if (supplier.responsible?.id && supplier.responsible.id === currentUser.id) return true;
    if (supplier.responsible?.email && currentUser.email && supplier.responsible.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (supplier.responsible?.name && currentUser.name && supplier.responsible.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    if (supplier.lead_source && currentUser.name && supplier.lead_source.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
    return false;
  };
  const canUserDeleteSupplier = canUserModifySupplier;

  const canUserRespondLogistics = () => {
    if (!currentUser) return false;
    return currentUser.role === 'LOGISTICS' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  };

  const handleDeleteSupplier = async () => {
    if (!canUserDeleteSupplier()) {
      alert(
        language === 'pt'
          ? `Você não tem permissão para excluir este gerador. Apenas o responsável (${supplier.responsible?.name || 'quem o cadastrou/enviou'}) ou um Administrador podem realizar a exclusão.`
          : `You do not have permission to delete this generator. Only the responsible owner (${supplier.responsible?.name || 'sender'}) or an Administrator can delete it.`
      );
      return;
    }

    if (!confirm(language === 'pt' ? `Tem certeza que deseja apagar o gerador "${supplier.name}" e todo seu histórico permanentemente?` : `Are you sure you want to permanently delete generator "${supplier.name}"?`)) return;
    try {
      await dbService.deleteSupplier(supplier.id);
      router.push('/fornecedores');
    } catch (err) {
      console.error(err);
      alert(language === 'pt' ? 'Erro ao excluir gerador.' : 'Error deleting generator.');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name) return;
    try {
      await dbService.addSupplierDocument(supplier.id, {
        name: newDoc.name,
        type: newDoc.type,
        notes: newDoc.notes
      });
      setNewDoc({ name: '', type: 'mtr', notes: '' });
      setIsDocModalOpen(false);
      fetchSupplierData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSelectFromPC = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const sizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      let inferredType: AttachedDocument['type'] = 'other';
      const lower = file.name.toLowerCase();
      if (lower.includes('mtr') || lower.includes('manifesto')) inferredType = 'mtr';
      else if (lower.includes('doacao') || lower.includes('doação') || lower.includes('carta')) inferredType = 'donation_letter';
      else if (lower.includes('termo') || lower.includes('contrato') || lower.includes('parceria')) inferredType = 'partnership_agreement';
      else if (lower.includes('licenca') || lower.includes('licença')) inferredType = 'env_license';
      else if (lower.includes('cnpj')) inferredType = 'cnpj_card';

      reader.onload = async () => {
        await dbService.addSupplierDocument(supplier.id, {
          name: file.name,
          size: sizeStr,
          file_data: reader.result as string,
          type: inferredType,
          notes: 'Anexado diretamente na Ficha 360º'
        });
        fetchSupplierData();
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    setIsDocModalOpen(false);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Deseja remover este documento?')) return;
    try {
      await dbService.deleteSupplierDocument(supplier.id, docId);
      fetchSupplierData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.description) return;
    try {
      await dbService.addSupplierInteraction({
        supplier_id: supplier.id,
        user_id: currentUser?.id || 'usr-rebeca-buy',
        type: newInteraction.type as any,
        description: newInteraction.description
      });
      setNewInteraction({ type: 'whatsapp', description: '' });
      setIsInteractionModalOpen(false);
      fetchSupplierData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.description) return;
    try {
      await dbService.addSupplierTask({
        supplier_id: supplier.id,
        description: newTask.description,
        due_date: newTask.due_date || null
      });
      setNewTask({ description: '', due_date: '' });
      setIsTaskModalOpen(false);
      fetchSupplierData();
    } catch (err) {
      console.error(err);
    }
  };

  const openFullMaterialsModal = () => {
    if (supplier?.materials && supplier.materials.length > 0) {
      setMaterialsForm(supplier.materials.map(m => {
        const isStandard = MATERIAL_OPTIONS.includes(m.material_name);
        return {
          id: m.id,
          material_name: isStandard ? m.material_name : 'Outro',
          custom_material_name: isStandard ? '' : m.material_name,
          storage_form: m.storage_form || 'Sacos de Lixo',
          frequency: m.frequency || '1x por mês',
          transaction_type: m.transaction_type || 'donation',
          price_per_kg: m.price_per_kg ? String(m.price_per_kg) : '',
          estimated_volume: m.estimated_volume ? String(m.estimated_volume) : '',
          unit: m.unit || 'kg',
          needs_storage_provision: m.needs_storage_provision || false,
          storage_provision_type: m.storage_provision_type || 'Bag',
          storage_provision_quantity: m.storage_provision_quantity ? String(m.storage_provision_quantity) : '',
          storage_provision_custom_type: m.storage_provision_custom_type || '',
          created_at: m.created_at
        };
      }));
    } else {
      setMaterialsForm([newLine()]);
    }
    setAttachedFiles([]);
    setIsMaterialModalOpen(true);
  };

  const updMat = (id: string, field: keyof MaterialLine, val: string | boolean) =>
    setMaterialsForm(p => p.map(m => m.id === id ? { ...m, [field]: val } : m));

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

  const handleSaveFullMaterials = async () => {
    if (!supplier) return;
    setIsSavingMaterials(true);
    try {
      // 1. Delete previous materials to ensure clean sync
      if (supplier.materials && supplier.materials.length > 0) {
        await Promise.all(supplier.materials.map(m => dbService.deleteSupplierMaterial(m.id)));
      }

      // 2. Insert new materials list preserving created_at
      const materialPromises = materialsForm.map((mat, idx) => {
        const finalName = mat.material_name === 'Outro' 
          ? (mat.custom_material_name?.trim() || 'Material Diversos') 
          : mat.material_name;

        if (!finalName) return Promise.resolve(null);

        const origCreatedAt = mat.created_at || new Date(Date.now() + idx * 1000).toISOString();

        return dbService.addSupplierMaterial({
          supplier_id: supplier.id,
          material_name: finalName,
          category: finalName,
          estimated_volume: Number(mat.estimated_volume) || 0,
          unit: mat.unit || 'kg',
          frequency: mat.frequency || '1x por mês',
          transaction_type: mat.transaction_type,
          price_per_kg: mat.transaction_type === 'purchase' ? Number(mat.price_per_kg) || 0 : 0,
          storage_form: mat.storage_form || null,
          notes: null,
          needs_storage_provision: Boolean(mat.needs_storage_provision),
          storage_provision_type: mat.needs_storage_provision ? (mat.storage_provision_type || 'Bag') : null,
          storage_provision_quantity: mat.needs_storage_provision && mat.storage_provision_quantity ? Number(mat.storage_provision_quantity) : null,
          storage_provision_custom_type: mat.needs_storage_provision && mat.storage_provision_type === 'Outros' ? (mat.storage_provision_custom_type || '') : null,
          created_at: origCreatedAt
        });
      });

      await Promise.all(materialPromises);

      // 3. Save attached documents if any
      if (attachedFiles.length > 0) {
        await dbService.addSupplierDocuments(supplier.id, attachedFiles);
      }

      setIsMaterialModalOpen(false);
      await fetchSupplierData();
    } catch (err) {
      console.error('Error saving materials:', err);
      alert('Erro ao salvar materiais.');
    } finally {
      setIsSavingMaterials(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Deseja realmente remover este material?')) return;
    try {
      await dbService.deleteSupplierMaterial(materialId);
      fetchSupplierData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenLogisticsModal = () => {
    const act = supplier?.logistics_analyses?.[0];
    setPendingDocs([]);
    setCustomPendingDoc('');

    if (act) {
      const isStdTransport = transportTypeOptions.some(o => o.value === act.transport_type && o.value !== 'Outros');
      const isStdResp = responsibleOptions.some(o => o.value === act.transport_responsible && o.value !== 'Outros');

      const isStdFreq = frequencyOptions.some(o => o.value === act.recommended_frequency && o.value !== 'Outros');

      setLogisticsForm({
        distance_km: act.distance_km?.toString() || '',
        transport_type: isStdTransport ? (act.transport_type || 'VUC') : 'Outros',
        custom_transport_type: isStdTransport ? '' : (act.transport_type || ''),
        estimated_cost: act.estimated_cost?.toString() || '0',
        recommended_frequency: isStdFreq ? (act.recommended_frequency || 'Mensal') : 'Outros',
        custom_frequency: isStdFreq ? '' : (act.recommended_frequency || ''),
        transport_responsible: isStdResp ? (act.transport_responsible || 'Terceirizado da iWrc') : 'Outros',
        custom_transport_responsible: isStdResp ? '' : (act.transport_responsible || ''),
        conditioning_infrastructure_needed: act.conditioning_infrastructure_needed || '',
        storage_provision_cost: act.storage_provision_cost?.toString() || '',
        storage_provision_delivery_date: act.storage_provision_delivery_date || '',
        feasibility: act.feasibility || 'FEASIBLE',
        notes: act.notes || '',
        need_info_reason: supplier?.backlog_reason || ''
      });
      setPendingDocs((act as any).pending_docs || []);
    } else {
      setLogisticsForm({
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
    setIsLogisticsModalOpen(true);
  };

  const toggleDoc = (key: string) => {
    setPendingDocs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSaveLogisticsResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !currentUser) return;
    try {
      const finalTransport = logisticsForm.transport_type === 'Outros'
        ? (logisticsForm.custom_transport_type.trim() || 'Outros')
        : logisticsForm.transport_type;

      const finalResponsible = logisticsForm.transport_responsible === 'Outros'
        ? (logisticsForm.custom_transport_responsible.trim() || 'Outros')
        : logisticsForm.transport_responsible;

      const finalFrequency = logisticsForm.recommended_frequency === 'Outros'
        ? (logisticsForm.custom_frequency.trim() || 'Outros')
        : logisticsForm.recommended_frequency;

      const finalPendingDocs = pendingDocs.map(d => 
        d === 'Outros' ? (customPendingDoc?.trim() ? `Outros: ${customPendingDoc.trim()}` : 'Outros') : d
      );

      const isGenTransport = finalResponsible === 'Fornecedor (entrega no Hub)';

      await dbService.saveLogisticsAnalysis({
        supplier_id: supplier.id,
        distance_km: isGenTransport ? null : (Number(logisticsForm.distance_km) || null),
        transport_type: isGenTransport ? 'Entrega Própria (Gerador)' : (finalTransport || null),
        estimated_cost: isGenTransport ? 0 : (Number(logisticsForm.estimated_cost) || null),
        recommended_frequency: finalFrequency || null,
        transport_responsible: finalResponsible || null,
        conditioning_infrastructure_needed: logisticsForm.conditioning_infrastructure_needed || null,
        storage_provision_cost: logisticsForm.storage_provision_cost ? Number(logisticsForm.storage_provision_cost) : null,
        storage_provision_delivery_date: logisticsForm.storage_provision_delivery_date || null,
        feasibility: logisticsForm.feasibility as any,
        notes: logisticsForm.notes || null,
        analyst_id: currentUser.id,
        pending_docs: finalPendingDocs
      } as any);

      let newStage = supplier.current_stage;
      let newStatus = supplier.current_status;
      let backlogReason = null;

      if (logisticsForm.feasibility === 'FEASIBLE') {
        if (finalPendingDocs.length > 0) {
          newStage = 'DOCUMENTATION';
          newStatus = 'PENDING';
          backlogReason = `Aprovado pela Logística. Pendências: ${finalPendingDocs.join(', ')}`;
          for (const doc of finalPendingDocs) {
            await dbService.addSupplierTask({
              supplier_id: supplier.id,
              description: `Obter documentação: ${doc}`,
              due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          }
        } else {
          newStage = 'DOCUMENTATION';
          newStatus = 'APPROVED';
          backlogReason = null;
        }
      } else if (logisticsForm.feasibility === 'INFEASIBLE') {
        newStage = 'LOGISTICS';
        newStatus = 'REJECTED';
        backlogReason = 'Inviável para coleta: ' + (logisticsForm.notes || '-');
      } else if (logisticsForm.feasibility === 'NEED_INFO') {
        newStage = 'LOGISTICS';
        newStatus = 'PENDING';
        backlogReason = logisticsForm.need_info_reason || logisticsForm.notes || 'Logística solicitou informações adicionais ao Comercial';
        await dbService.addSupplierTask({
          supplier_id: supplier.id,
          description: `Logística precisa de info: ${backlogReason}`,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }

      await dbService.updateSupplier(supplier.id, {
        current_stage: newStage,
        current_status: newStatus,
        backlog_reason: backlogReason
      });

      await dbService.addSupplierStatusHistory({
        supplier_id: supplier.id,
        old_stage: supplier.current_stage,
        new_stage: newStage,
        old_status: supplier.current_status,
        new_status: newStatus,
        user_id: currentUser.id,
        notes: `Parecer logístico registrado: ${translateFeasibility(logisticsForm.feasibility as any)}.${finalPendingDocs.length > 0 ? ' Pendências: ' + finalPendingDocs.join(', ') : ''}`
      });

      await dbService.addSupplierInteraction({
        supplier_id: supplier.id,
        user_id: currentUser.id,
        type: 'internal_obs',
        description: `Logística respondeu análise. Decisão: ${translateFeasibility(logisticsForm.feasibility as any)}. Notas: ${logisticsForm.notes || '-'}`
      });

      setIsLogisticsModalOpen(false);
      await fetchSupplierData();
    } catch (err: any) {
      console.error('Error saving logistics analysis:', err);
      alert(`Erro ao salvar parecer logístico: ${err.message || err.details || 'Verifique sua conexão.'}`);
    }
  };

  const handleWithdrawFromLogistics = async () => {
    if (!supplier || !currentUser) return;
    if (!confirm(language === 'pt' ? 'Deseja retirar este lead da Logística e retornar para a etapa de Qualificação?' : 'Withdraw this lead from Logistics back to Qualification?')) return;
    try {
      await dbService.updateSupplier(supplier.id, {
        current_stage: 'QUALIFICATION',
        prospecting_status: 'QUALIFIED',
        current_status: 'IN_PROGRESS'
      });
      await dbService.addSupplierStatusHistory({
        supplier_id: supplier.id,
        old_stage: 'LOGISTICS',
        new_stage: 'QUALIFICATION',
        old_status: supplier.current_status,
        new_status: 'IN_PROGRESS',
        user_id: currentUser.id,
        notes: language === 'pt' ? 'Lead retirado da Logística pelo responsável' : 'Lead withdrawn from Logistics by owner'
      });
      await fetchSupplierData();
      alert(language === 'pt' ? 'Lead retornado para a etapa de Qualificação com sucesso!' : 'Lead returned to Qualification successfully!');
    } catch (err) {
      console.error(err);
      alert(language === 'pt' ? 'Erro ao retirar lead da Logística.' : 'Error withdrawing lead.');
    }
  };

  const handleRespondInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !currentUser || !respondInfoText.trim()) return;
    try {
      const activeLog = supplier.logistics_analyses?.[0];
      if (activeLog) {
        await dbService.saveLogisticsAnalysis({
          supplier_id: supplier.id,
          distance_km: activeLog.distance_km,
          transport_type: activeLog.transport_type,
          estimated_cost: activeLog.estimated_cost,
          recommended_frequency: activeLog.recommended_frequency,
          transport_responsible: activeLog.transport_responsible,
          conditioning_infrastructure_needed: activeLog.conditioning_infrastructure_needed,
          feasibility: 'FEASIBLE',
          notes: `Informações esclarecidas por Compras: ${respondInfoText.trim()}`,
          analyst_id: activeLog.analyst_id,
          pending_docs: []
        } as any);
      }

      await dbService.updateSupplier(supplier.id, {
        current_stage: 'COLLECTION',
        current_status: 'PENDING',
        backlog_reason: 'Aguardando agendamento da coleta'
      });

      await dbService.addSupplierStatusHistory({
        supplier_id: supplier.id,
        old_stage: supplier.current_stage,
        new_stage: 'COLLECTION',
        old_status: supplier.current_status,
        new_status: 'PENDING',
        user_id: currentUser.id,
        notes: `Compras respondeu as informações solicitadas: ${respondInfoText.trim()}. Situação alterada para Aguardando agendamento da coleta.`
      });

      await dbService.addSupplierInteraction({
        supplier_id: supplier.id,
        user_id: currentUser.id,
        type: 'internal_obs',
        description: `Compras respondeu à Logística: ${respondInfoText.trim()}. Encaminhado para agendamento de coleta.`
      });

      await dbService.addSupplierTask({
        supplier_id: supplier.id,
        description: `Realizar agendamento da coleta para ${supplier.name}`,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      setIsRespondInfoModalOpen(false);
      setRespondInfoText('');
      await fetchSupplierData();
      alert('Informações enviadas com sucesso! Gerador encaminhado para Aguardando agendamento da coleta na Logística.');
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar informações.');
    }
  };

  const handleReleaseForScheduling = async () => {
    if (!supplier || !currentUser) return;
    if (!confirm(`Deseja liberar "${supplier.name}" para a Logística realizar o agendamento da coleta?`)) return;
    try {
      await dbService.updateSupplier(supplier.id, {
        current_stage: 'COLLECTION',
        current_status: 'PENDING',
        backlog_reason: 'Aguardando agendamento da coleta'
      });

      await dbService.addSupplierStatusHistory({
        supplier_id: supplier.id,
        old_stage: supplier.current_stage,
        new_stage: 'COLLECTION',
        old_status: supplier.current_status,
        new_status: 'PENDING',
        user_id: currentUser.id,
        notes: 'Comercial liberou o gerador para agendamento de coleta na Logística.'
      });

      await dbService.addSupplierInteraction({
        supplier_id: supplier.id,
        user_id: currentUser.id,
        type: 'internal_obs',
        description: 'Gerador homologado e liberado para a fila de Agendamento da Logística.'
      });

      await dbService.addSupplierTask({
        supplier_id: supplier.id,
        description: `Agendar 1ª coleta para ${supplier.name}`,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      await fetchSupplierData();
      alert('Gerador enviado com sucesso para a fila de Agendamento de Coletas da Logística!');
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar para agendamento.');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await dbService.completeSupplierTask(taskId, currentUser?.id || 'usr-rebeca-buy');
      fetchSupplierData();
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateCollectionModal = () => {
    setEditingCollectionId(null);
    setNewCollection({
      scheduled_date: '',
      driver_name: '',
      carrier_name: '',
      notes: '',
      material_name: supplier?.materials?.[0]?.material_name || '',
      estimated_volume: supplier?.materials?.[0]?.estimated_volume ? String(supplier.materials[0].estimated_volume) : '',
      unit: supplier?.materials?.[0]?.unit || 'kg',
      custom_unit: ''
    });
    setIsCollectionModalOpen(true);
  };

  const openEditCollectionModal = (col: Collection) => {
    setEditingCollectionId(col.id);
    const firstItem = col.items?.[0];
    const stdUnits = ['kg', 'toneladas', 'ton', 'un', 'm³'];
    const isStd = firstItem?.unit ? stdUnits.includes(firstItem.unit) : true;

    setNewCollection({
      scheduled_date: col.scheduled_date ? col.scheduled_date.split('T')[0] : '',
      driver_name: col.driver_name || '',
      carrier_name: col.carrier_name || '',
      notes: col.notes || '',
      material_name: firstItem?.material_name || '',
      estimated_volume: firstItem?.estimated_volume ? String(firstItem.estimated_volume) : '',
      unit: isStd ? (firstItem?.unit === 'ton' ? 'toneladas' : (firstItem?.unit || 'kg')) : 'Outros',
      custom_unit: isStd ? '' : (firstItem?.unit || '')
    });
    setIsCollectionModalOpen(true);
  };

  const handleAddOrUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollection.scheduled_date || !newCollection.material_name || !newCollection.estimated_volume) return;

    const finalUnit = newCollection.unit === 'Outros'
      ? (newCollection.custom_unit.trim() || 'un')
      : newCollection.unit;

    try {
      if (editingCollectionId) {
        await dbService.updateCollection(
          editingCollectionId,
          {
            scheduled_date: newCollection.scheduled_date,
            driver_name: newCollection.driver_name || null,
            carrier_name: newCollection.carrier_name || null,
            notes: newCollection.notes || null
          },
          [
            {
              material_name: newCollection.material_name,
              estimated_volume: Number(newCollection.estimated_volume),
              unit: finalUnit
            }
          ]
        );
      } else {
        await dbService.createCollection(
          {
            supplier_id: supplier.id,
            scheduled_date: newCollection.scheduled_date,
            driver_name: newCollection.driver_name || null,
            carrier_name: newCollection.carrier_name || null,
            notes: newCollection.notes || null,
            status: 'SCHEDULED'
          },
          [
            {
              material_name: newCollection.material_name,
              estimated_volume: Number(newCollection.estimated_volume),
              unit: finalUnit
            }
          ]
        );

        // Update supplier stage to OPERATION / APPROVED and clear backlog_reason
        await dbService.updateSupplier(supplier.id, {
          current_stage: 'OPERATION',
          current_status: 'APPROVED',
          last_collection_date: newCollection.scheduled_date,
          first_collection_date: supplier.first_collection_date || newCollection.scheduled_date,
          backlog_reason: null
        });

        await dbService.addSupplierStatusHistory({
          supplier_id: supplier.id,
          old_stage: supplier.current_stage,
          new_stage: 'OPERATION',
          old_status: supplier.current_status,
          new_status: 'APPROVED',
          user_id: currentUser?.id || 'usr-rebeca-buy',
          notes: `Coleta agendada para ${formatDate(newCollection.scheduled_date)}. Gerador passa a constar como Ativo.`
        });
      }

      setNewCollection({
        scheduled_date: '',
        driver_name: '',
        carrier_name: '',
        notes: '',
        material_name: '',
        estimated_volume: '',
        unit: 'kg',
        custom_unit: ''
      });
      setEditingCollectionId(null);
      setIsCollectionModalOpen(false);
      fetchSupplierData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar coleta.');
    }
  };

  // Build timeline events
  const timelineEvents: any[] = [];

  timelineEvents.push({
    id: `create-${supplier.id}`,
    type: 'registration',
    title: 'Cadastro no Sistema',
    description: `Gerador ${supplier.name} cadastrado via ${supplier.lead_source} (${supplier.supplier_type}).`,
    date: supplier.created_at,
    user: supplier.responsible?.name || undefined
  });

  supplier.interactions?.forEach(i => {
    timelineEvents.push({
      id: `int-${i.id}`,
      type: 'interaction',
      title: `Contato via ${translateInteractionType(i.type)}`,
      description: i.description,
      date: `${i.interaction_date}T${i.interaction_time}Z`,
      user: profiles.find(p => p.id === i.user_id)?.name
    });
  });

  supplier.collections?.forEach(c => {
    timelineEvents.push({
      id: `col-${c.id}`,
      type: 'collection',
      title: c.status === 'COMPLETED' ? 'Coleta Realizada' : 'Coleta Agendada',
      description: `Coleta para ${formatDate(c.scheduled_date)}. Motorista: ${c.driver_name || '-'}. Transportadora: ${c.carrier_name || '-'}`,
      date: c.created_at
    });
  });

  const sortedTimeline = timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const activeLogistics = supplier.logistics_analyses?.[0];
  const primaryContact = supplier.contacts?.find(c => c.is_primary) || supplier.contacts?.[0];
  const isLeadInEvaluation = ['PROSPECTING', 'QUALIFICATION', 'LOGISTICS'].includes(supplier.current_stage) && 
    (!activeLogistics || !activeLogistics.feasibility || activeLogistics.feasibility === 'PENDING' || activeLogistics.feasibility === 'IN_PROGRESS');

  return (
    <div className="space-y-6 font-sans">
      
      {/* ===================== VIEW A: ANÁLISE DO LEAD / LOGÍSTICA ===================== */}
      {isLeadInEvaluation ? (
        <div className="space-y-6">
          {/* Top Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link 
              href={supplier.current_stage === 'LOGISTICS' ? "/logistica" : "/prospeccao"} 
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-all flex items-center gap-1"
            >
              ← Voltar para {supplier.current_stage === 'LOGISTICS' ? "Análise Logística" : "Funil de Prospecção"}
            </Link>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
              {supplier.current_stage === 'LOGISTICS' ? (
                <>
                  <Truck size={13} />
                  Lead em Análise Logística
                </>
              ) : supplier.current_stage === 'PROSPECTING' ? (
                <>
                  <GitBranch size={13} />
                  Lead em Prospecção
                </>
              ) : (
                <>
                  <CheckCircle size={13} />
                  Lead em Qualificação
                </>
              )}
            </span>
          </div>

          {!canUserModifySupplier() && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#2098D1] shrink-0" />
                <span>
                  {language === 'pt'
                    ? 'Modo Somente Leitura (Ficha 360º): Você não é o responsável que cadastrou este gerador. Alterações e exclusões estão bloqueadas.'
                    : 'Read-Only Mode (360º View): You are not the responsible creator of this generator. Edits and deletions are disabled.'}
                </span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                {supplier.responsible?.name || 'Comercial'}
              </span>
            </div>
          )}

          {/* Lead Header Card */}
          <Card className="border-t-4 border-t-indigo-600">
            <div className="space-y-5">
              {/* Row 1: Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{supplier.name}</h1>
                  <Badge variant={getStageColor(supplier.current_stage)}>
                    {translateStage(supplier.current_stage)}
                  </Badge>
                  <Badge variant={getStatusColor(supplier.current_status)}>
                    {translateStatus(supplier.current_status)}
                  </Badge>
                  {supplier.current_stage === 'LOGISTICS' && (() => {
                    const sla = getLogisticsSlaInfo(supplier, 5, language);
                    if (!sla) return null;
                    return (
                      <Badge variant={sla.badgeVariant} className="font-black gap-1 shadow-xs">
                        {sla.isOverdue ? <AlertTriangle size={12} className="animate-pulse" /> : <Clock size={12} />}
                        {sla.statusLabel}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {supplier.current_stage === 'LOGISTICS' && (
                    <>
                      {canUserRespondLogistics() && (
                        <Button 
                          size="sm" 
                          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs" 
                          onClick={handleOpenLogisticsModal}
                        >
                          <Truck size={14} />
                          {language === 'pt' ? 'Responder Análise Logística' : 'Respond to Logistics Analysis'}
                        </Button>
                      )}
                      
                      {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || supplier.internal_responsible_id === currentUser?.id || (currentUser?.name && supplier.responsible?.name?.toLowerCase() === currentUser?.name?.toLowerCase())) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 !border-indigo-200 !text-indigo-700 hover:!bg-indigo-50"
                          onClick={handleWithdrawFromLogistics}
                        >
                          ↩️ {language === 'pt' ? 'Retirar da Logística' : 'Withdraw from Logistics'}
                        </Button>
                      )}
                    </>
                  )}
                  {canUserModifySupplier() && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                      {language === 'pt' ? 'Editar Lead' : 'Edit Lead'}
                    </Button>
                  )}
                  {canUserDeleteSupplier() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDeleteSupplier} 
                      className="!border-rose-200 !text-rose-600 hover:!bg-rose-50 gap-1.5"
                    >
                      <Trash2 size={13} />
                      {language === 'pt' ? 'Excluir Lead' : 'Delete Lead'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Row 2: Full-width metadata grid */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-slate-500">
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {language === 'pt' ? 'Segmento' : 'Segment'}
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                    {translateSupplierType(supplier.supplier_type, language)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {language === 'pt' ? 'Como encontramos' : 'Lead Source'}
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">{supplier.lead_source || (language === 'pt' ? 'Busca própria' : 'Direct Search')}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {language === 'pt' ? 'Responsável Comercial' : 'Commercial Responsible'}
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">{supplier.responsible?.name || (language === 'pt' ? 'Não atribuído' : 'Unassigned')}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {language === 'pt' ? 'Data de Cadastro' : 'Registration Date'}
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">{formatDate(supplier.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Backlog Reason */}
            {hasRealPendingAlert(supplier) && (
              <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800">
                <AlertTriangle className="shrink-0 text-amber-500 mt-0.5" size={15} />
                <div>
                  <span className="font-bold">{language === 'pt' ? 'Atenção / Pendência da Etapa:' : 'Attention / Stage Pending:'}</span>
                  <p className="font-semibold mt-0.5">
                    {translateProspectingStatus(supplier.backlog_reason as any, language) || supplier.backlog_reason}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* 4 Focused Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Card 1: Localização & Contatos */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-600" />
                  {language === 'pt' ? 'Localização e Endereço para Coleta' : 'Location and Collection Address'}
                </h3>
              </div>
              
              <div className="space-y-3 text-xs">
                {supplier.address?.street ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {supplier.address.street}, {supplier.address.number || 'S/N'}
                      {supplier.address.complement && ` (${supplier.address.complement})`}
                    </p>
                    <p className="text-slate-500">
                      {supplier.address.neighborhood ? `${supplier.address.neighborhood} • ` : ''}
                      {supplier.address.city} - {supplier.address.state}
                      {supplier.address.zip_code && ` • CEP: ${supplier.address.zip_code}`}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-xl">
                    {language === 'pt' ? 'Endereço ainda não informado.' : 'Address not provided yet.'}
                  </div>
                )}

                {/* Primary Contact */}
                {primaryContact ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      {language === 'pt' ? 'Contato do Lead' : 'Lead Contact'}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{primaryContact.name} {primaryContact.role ? `(${primaryContact.role})` : ''}</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1"><Phone size={12}/>{primaryContact.whatsapp || primaryContact.phone || '-'}</span>
                    </div>
                    {primaryContact.email && <p className="text-slate-500 text-[11px]">{primaryContact.email}</p>}
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Card 2: Parecer e Resposta da Logística */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Truck size={15} className="text-indigo-600" />
                  {language === 'pt' ? 'Parecer da Análise Logística' : 'Logistics Analysis Report'}
                </h3>
                {supplier.current_stage === 'LOGISTICS' ? (
                  canUserRespondLogistics() ? (
                    <Button size="sm" variant="outline" onClick={handleOpenLogisticsModal} className="text-xs">
                      {activeLogistics ? (language === 'pt' ? 'Editar Parecer' : 'Edit Report') : (language === 'pt' ? 'Responder' : 'Respond')}
                    </Button>
                  ) : null
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    <Lock size={10} /> {language === 'pt' ? 'Bloqueado' : 'Locked'}
                  </span>
                )}
              </div>

              {supplier.current_stage !== 'LOGISTICS' ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-2.5 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6">
                  <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Lock size={18} />
                  </div>
                  <p className="font-bold text-slate-700">
                    {language === 'pt' ? 'Análise Logística Bloqueada' : 'Logistics Analysis Locked'}
                  </p>
                  <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                    {language === 'pt' 
                      ? 'A análise logística só é liberada para resposta quando este lead for qualificado e avançar para a etapa de Logística.'
                      : 'Logistics analysis is only enabled for review once this lead is qualified and advances to the Logistics stage.'}
                  </p>
                </div>
              ) : activeLogistics ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">
                        {language === 'pt' ? 'Situação / Viabilidade' : 'Status / Feasibility'}
                      </span>
                      <div className="mt-1">
                        <Badge variant={activeLogistics.feasibility === 'FEASIBLE' ? 'success' : activeLogistics.feasibility === 'INFEASIBLE' ? 'danger' : 'warning'}>
                          {translateFeasibility(activeLogistics.feasibility as any, language)}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">
                        {language === 'pt' ? 'Distância Calculada' : 'Calculated Distance'}
                      </span>
                      <p className="font-black text-slate-800 text-sm mt-0.5">
                        {activeLogistics.distance_km ? `${activeLogistics.distance_km} km` : (language === 'pt' ? 'Não calculada' : 'Not calculated')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">
                        {language === 'pt' ? 'Frete Estimado' : 'Estimated Freight'}
                      </span>
                      <p className="font-black text-slate-800 text-sm mt-0.5">{formatCurrency(activeLogistics.estimated_cost)}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">
                        {language === 'pt' ? 'Tipo de Veículo' : 'Vehicle Type'}
                      </span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeLogistics.transport_type || 'VUC'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px]">
                        {language === 'pt' ? 'Responsável pelo Frete' : 'Freight Responsible'}
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">{activeLogistics.transport_responsible || '-'}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px]">
                        {language === 'pt' ? 'Frequência Recomendada' : 'Recommended Frequency'}
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {translateFrequency(activeLogistics.recommended_frequency, language)}
                      </p>
                    </div>
                  </div>

                  {/* Cotação de Fornecimento de Armazenamento se preenchida */}
                  {(activeLogistics.storage_provision_cost !== null && activeLogistics.storage_provision_cost !== undefined || activeLogistics.storage_provision_delivery_date) && (
                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-150 dark:border-indigo-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 dark:text-indigo-200 uppercase text-[9px] flex items-center gap-1">
                          📦 {language === 'pt' ? 'Cotação de Armazenamento' : 'Storage Quotation'}
                        </span>
                        {activeLogistics.storage_provision_delivery_date && (
                          <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">
                            {language === 'pt' ? 'Entrega prevista:' : 'Est. Delivery:'} {formatDate(activeLogistics.storage_provision_delivery_date)}
                          </span>
                        )}
                      </div>
                      <p className="font-black text-indigo-950 dark:text-white text-sm">
                        {activeLogistics.storage_provision_cost ? formatCurrency(activeLogistics.storage_provision_cost) : (language === 'pt' ? 'Sem custo adicional' : 'No extra cost')}
                      </p>
                    </div>
                  )}

                  {activeLogistics.conditioning_infrastructure_needed && (
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px]">
                        {language === 'pt' ? 'Infraestrutura de Acondicionamento' : 'Conditioning Infrastructure'}
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">{activeLogistics.conditioning_infrastructure_needed}</p>
                    </div>
                  )}

                  {activeLogistics.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">
                        {language === 'pt' ? 'Observações da Logística' : 'Logistics Notes'}
                      </span>
                      <p className="font-medium text-slate-700 mt-0.5">{activeLogistics.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs space-y-3">
                  <Truck size={28} className="mx-auto text-slate-300 opacity-60" />
                  <p>{language === 'pt' ? 'Nenhuma resposta logística registrada ainda.' : 'No logistics report registered yet.'}</p>
                  {canUserRespondLogistics() && (
                    <Button size="sm" onClick={handleOpenLogisticsModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      {language === 'pt' ? 'Responder Análise Logística' : 'Respond Logistics Analysis'}
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Card 3: Materiais Declarados */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Scale size={15} className="text-emerald-600" />
                  {language === 'pt' ? 'Materiais Declarados' : 'Declared Materials'} ({supplier.materials?.length || 0})
                </h3>
                <Button size="sm" variant="outline" onClick={openFullMaterialsModal} className="text-xs gap-1">
                  <Plus size={12} /> {language === 'pt' ? 'Gerenciar / Adicionar' : 'Manage / Add'}
                </Button>
              </div>

              {supplier.materials && supplier.materials.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-3 py-2">{language === 'pt' ? 'Material' : 'Material'}</th>
                        <th className="px-3 py-2">{language === 'pt' ? 'Volume / Frequência' : 'Volume / Frequency'}</th>
                        <th className="px-3 py-2">{language === 'pt' ? 'Modalidade' : 'Modality'}</th>
                        <th className="px-3 py-2">{language === 'pt' ? 'Armazenamento' : 'Storage'}</th>
                        {canUserModifySupplier() && (
                          <th className="px-3 py-2 text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {supplier.materials.map(mat => (
                        <tr key={mat.id}>
                          <td className="px-3 py-2.5 font-bold text-slate-800">{translateMaterialName(mat.material_name, language)}</td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {formatVolume(mat.estimated_volume, mat.unit)} • {translateFrequency(mat.frequency, language)}
                          </td>
                          <td className="px-3 py-2.5">
                            {mat.transaction_type === 'purchase' ? (
                              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                                {language === 'pt' ? 'Compra' : 'Purchase'} ({formatCurrency(mat.price_per_kg)}/kg)
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                {language === 'pt' ? 'Doação' : 'Donation'}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">
                            <div className="flex flex-col gap-0.5">
                              <span>{translateStorageForm(mat.storage_form, language)}</span>
                              {mat.needs_storage_provision && (
                                <span className="inline-flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded text-[9px] border border-indigo-200 dark:border-indigo-800 w-fit">
                                  📦 {language === 'pt' ? 'Fornecer' : 'Provide'}: {mat.storage_provision_quantity || 1}x {mat.storage_provision_type === 'Outros' ? mat.storage_provision_custom_type || 'Outros' : mat.storage_provision_type}
                                </span>
                              )}
                            </div>
                          </td>
                          {canUserModifySupplier() && (
                            <td className="px-3 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={openFullMaterialsModal}
                                  className="text-slate-400 hover:text-[#2098D1] p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                  title={language === 'pt' ? 'Editar Material' : 'Edit Material'}
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMaterial(mat.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title={language === 'pt' ? 'Excluir Material' : 'Delete Material'}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {language === 'pt' ? 'Nenhum material cadastrado para este lead.' : 'No materials registered for this lead.'}
                </div>
              )}
            </Card>

            {/* Card 4: Documentos & Anexos */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText size={15} className="text-indigo-600" />
                  {language === 'pt' ? 'Documentos & Anexos do Lead' : 'Lead Documents & Attachments'} ({supplier.attached_documents?.length || 0})
                </h3>
                <Button size="sm" variant="outline" onClick={() => setIsDocModalOpen(true)} className="text-xs gap-1">
                  <Upload size={12} /> {language === 'pt' ? 'Anexar' : 'Attach'}
                </Button>
              </div>

              {supplier.attached_documents && supplier.attached_documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {supplier.attached_documents.map(doc => (
                    <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck size={16} className="text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                          <span className="text-[9px] uppercase font-semibold text-slate-400">
                            {doc.type === 'mtr' 
                              ? 'MTR' 
                              : doc.type === 'donation_letter' 
                                ? (language === 'pt' ? 'Carta de Doação' : 'Donation Letter')
                                : doc.type === 'cnpj_card' 
                                  ? (language === 'pt' ? 'Cartão CNPJ' : 'CNPJ / Tax Card') 
                                  : (language === 'pt' ? 'Anexo' : 'Attachment')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors shrink-0"
                        title={language === 'pt' ? 'Baixar / Visualizar' : 'Download / View'}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {language === 'pt' ? 'Nenhum documento anexado pelo Comercial.' : 'No documents attached by Commercial yet.'}
                </div>
              )}
            </Card>

          </div>

          {/* Section: Histórico de Alterações, Logs e Interações do Lead */}
          <Card className="space-y-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    {language === 'pt' ? 'Histórico de Alterações, Auditoria e Logs do Lead' : 'Lead Audit Trail, History & Logs'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'pt' 
                      ? 'Acompanhe quem criou, quem alterou status ou adicionou informações neste lead.'
                      : 'Track who created, changed status, or added information to this lead.'}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsInteractionModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <MessageSquare size={13} />
                {language === 'pt' ? 'Registrar Contato' : 'Log Contact'}
              </Button>
            </div>

            <div className="space-y-4">
              {/* Event 1: Lead Creation Record */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle size={15} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-xs text-slate-800">
                      {language === 'pt' ? 'Lead cadastrado no sistema' : 'Lead registered in system'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(supplier.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {language === 'pt' ? 'Cadastrado pelo Comercial:' : 'Registered by Commercial:'} <strong className="text-slate-800">{supplier.responsible?.name || (language === 'pt' ? 'Comercial / iWrc' : 'Commercial / iWrc')}</strong> ({supplier.responsible?.email || 'contato@iwrc.com.br'}).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                      {language === 'pt' ? 'Origem:' : 'Source:'} {supplier.lead_source || (language === 'pt' ? 'Prospecção Ativa' : 'Active Prospecting')}
                    </span>
                    <span className="text-[10px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                      {language === 'pt' ? 'Segmento:' : 'Segment:'} {translateSupplierType(supplier.supplier_type, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status History Changes */}
              {supplier.status_history && supplier.status_history.length > 0 && (
                supplier.status_history.map((hist: any, hIdx: number) => {
                  const userName = hist.user?.name || (language === 'pt' ? 'Usuário' : 'User');

                  let targetStatus = '';
                  if (hist.notes && hist.notes.includes('Status prospecção:')) {
                    targetStatus = hist.notes.replace(/Status prospecção:\s*/i, '').trim();
                  } else if (hist.new_stage === 'LOGISTICS') {
                    targetStatus = 'Aguardando Logística';
                  } else if (hist.new_stage === 'QUALIFICATION') {
                    targetStatus = 'Qualificado';
                  } else if (hist.new_stage === 'PROSPECTING') {
                    targetStatus = 'Novo Lead';
                  } else {
                    targetStatus = translateStage(hist.new_stage);
                  }

                  let originStatus = 'Novo Lead';
                  if (hist.old_stage === 'LOGISTICS') {
                    originStatus = 'Aguardando Logística';
                  } else if (hist.old_stage === 'QUALIFICATION') {
                    originStatus = 'Qualificado';
                  } else if (hist.old_stage && hist.old_stage !== hist.new_stage) {
                    originStatus = translateStage(hist.old_stage);
                  }

                  if (originStatus === targetStatus) {
                    if (targetStatus === 'Primeiro Contato Feito' || targetStatus === 'Contato Feito') {
                      originStatus = 'Novo Lead';
                    } else if (targetStatus === 'Apresentação Enviada') {
                      originStatus = 'Primeiro Contato Feito';
                    } else if (targetStatus === 'Qualificado') {
                      originStatus = 'Apresentação Enviada';
                    } else if (targetStatus === 'Aguardando Logística') {
                      originStatus = 'Qualificado';
                    }
                  }

                  return (
                    <div key={hist.id || hIdx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100/60">
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                        <GitBranch size={15} />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-xs text-indigo-950">
                            {language === 'pt' ? 'Atualização de Status' : 'Status Update'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {formatDate(hist.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 pt-0.5 leading-relaxed">
                          <strong className="text-slate-900 font-bold">{userName}</strong> {language === 'pt' ? 'alterou de' : 'changed from'} <strong className="font-bold text-indigo-950 bg-indigo-100/80 px-2 py-0.5 rounded border border-indigo-200">{translateProspectingStatus(originStatus as any, language) || originStatus}</strong> {language === 'pt' ? 'para' : 'to'} <strong className="font-bold text-emerald-950 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">{translateProspectingStatus(targetStatus as any, language) || targetStatus}</strong>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Interactions / Conversations */}
              {supplier.interactions && supplier.interactions.length > 0 && (
                supplier.interactions.map((inter, iIdx) => (
                  <div key={inter.id || iIdx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                      <MessageSquare size={15} />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-xs text-emerald-950">
                          {language === 'pt' ? 'Contato / Interação' : 'Contact / Interaction'} ({translateInteractionType(inter.type as any)})
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {inter.interaction_date} {inter.interaction_time || ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Registrado por <strong className="text-emerald-900">{inter.user?.name || supplier.responsible?.name || 'Comercial'}</strong>
                      </p>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs text-slate-700 mt-1">
                        {inter.description}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      ) : (
        /* ===================== VIEW B: TELA COMPLETA 360º DO GERADOR HOMOLOGADO ===================== */
        <>
          {/* Top Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link href="/fornecedores" className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-all">
              ← Voltar para Geradores
            </Link>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
              {language === 'pt' ? 'Código' : 'Code'}: {supplier.code || 'GER-001'}
            </span>
          </div>

          {!canUserModifySupplier() && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#2098D1] shrink-0" />
                <span>
                  {language === 'pt'
                    ? 'Modo Somente Leitura (Ficha 360º): Você não é o responsável que cadastrou este gerador. Alterações e exclusões estão bloqueadas.'
                    : 'Read-Only Mode (360º View): You are not the responsible creator of this generator. Edits and deletions are disabled.'}
                </span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                {supplier.responsible?.name || 'Comercial'}
              </span>
            </div>
          )}

          {/* Main Header Panel */}
          <Card className="border-t-4 border-t-emerald-600">
            <div className="space-y-5">
              {/* Row 1: Code + Title + Status + Action Buttons */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-black font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-300">
                    {supplier.code || 'GER-001'}
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 leading-tight">{supplier.name}</h1>
                  <Badge variant={getStageColor(supplier.current_stage)}>
                    {translateStage(supplier.current_stage, language)}
                  </Badge>
                  <Badge variant={getStatusColor(supplier.current_status)}>
                    {translateStatus(supplier.current_status, language)}
                  </Badge>
                </div>

                {/* Quick Actions Panel */}
                <div className="flex flex-wrap items-center gap-2">
                  {canUserModifySupplier() && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                      {language === 'pt' ? 'Editar Ficha' : 'Edit Details'}
                    </Button>
                  )}
                  
                  {canUserModifySupplier() && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsInteractionModalOpen(true)}>
                        {language === 'pt' ? 'Registrar Contato' : 'Log Interaction'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsTaskModalOpen(true)}>
                        {language === 'pt' ? 'Criar Tarefa' : 'Create Task'}
                      </Button>
                    </>
                  )}

                  {/* Encaminhar para Logística (se ainda não tiver coletas e não estiver em agendamento) */}
                  {canUserModifySupplier() && (!supplier.collections || supplier.collections.length === 0) && supplier.current_stage !== 'OPERATION' && supplier.current_stage !== 'COLLECTION' && (
                    <Button 
                      size="sm" 
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-bold" 
                      onClick={handleReleaseForScheduling}
                    >
                      <CalendarCheck size={14} />
                      {language === 'pt' ? 'Liberar p/ Agendamento' : 'Release for Scheduling'}
                    </Button>
                  )}

                  {(currentUser?.role === 'ADMIN' || (currentUser?.role === 'BUYER' && canUserModifySupplier()) || currentUser?.role === 'LOGISTICS') && (
                    <Button size="sm" className="gap-1.5 bg-[#2098D1] hover:bg-[#1883B5]" onClick={openCreateCollectionModal}>
                      <Calendar size={14} />
                      {language === 'pt' ? 'Agendar Coleta' : 'Book Collection'}
                    </Button>
                  )}

                  {canUserDeleteSupplier() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDeleteSupplier} 
                      className="!border-rose-200 !text-rose-600 hover:!bg-rose-50 gap-1.5"
                    >
                      <Trash2 size={13} />
                      {language === 'pt' ? 'Excluir Gerador' : 'Delete Generator'}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Row 2: Full-Width 360° Metadata Grid */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{language === 'pt' ? 'Segmento' : 'Segment'}</p>
                  <p className="font-semibold text-slate-800 mt-1 truncate">{translateSupplierType(supplier.supplier_type, language)}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{language === 'pt' ? 'Como encontramos' : 'Lead Source'}</p>
                  <p className="font-semibold text-slate-800 mt-1 truncate">{supplier.lead_source || (language === 'pt' ? 'Busca própria' : 'Direct Search')}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{language === 'pt' ? 'CNPJ/CPF' : 'Tax ID / CNPJ'}</p>
                  <p className="font-semibold text-slate-800 mt-1 truncate">{supplier.document || (language === 'pt' ? 'Não informado' : 'Not provided')}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{language === 'pt' ? 'Responsável iWrc' : 'iWrc Responsible'}</p>
                  <p className="font-semibold text-slate-800 mt-1 truncate">{supplier.responsible?.name || (language === 'pt' ? 'Não atribuído' : 'Unassigned')}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{language === 'pt' ? 'Última Atualização' : 'Last Updated'}</p>
                  <p className="font-semibold text-slate-800 mt-1 truncate">{formatDate(supplier.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Logistics Requested Info Banner for Compras vs Status for Logística */}
            {activeLogistics?.feasibility === 'NEED_INFO' ? (
              (currentUser?.role === 'ADMIN' || currentUser?.role === 'BUYER') ? (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 border-2 border-amber-300 p-4 rounded-xl text-xs text-amber-900 shadow-xs">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={20} />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                        {language === 'pt' ? 'Atenção Compras / Comercial: Informação Solicitada pela Logística' : 'Attention Commercial / Buying: Information Requested by Logistics'}
                      </span>
                      <p className="font-semibold text-sm text-slate-800 mt-1">
                        {supplier.backlog_reason || activeLogistics.notes || (language === 'pt' ? 'A Logística precisa de esclarecimentos adicionais.' : 'Logistics needs additional clarification.')}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shrink-0"
                    onClick={() => setIsRespondInfoModalOpen(true)}
                  >
                    <MessageSquare size={14} />
                    {language === 'pt' ? 'Responder Informações Solicitadas' : 'Respond to Requested Info'}
                  </Button>
                </div>
              ) : (
                <div className="mt-6 flex items-start gap-3 bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs text-amber-900">
                  <Clock className="shrink-0 text-amber-600 mt-0.5" size={18} />
                  <div className="space-y-0.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                      {language === 'pt' ? 'Aguardando Retorno do Comercial / Compras' : 'Awaiting Commercial / Buying Response'}
                    </span>
                    <p className="font-semibold text-slate-700">
                      {supplier.backlog_reason || activeLogistics.notes || (language === 'pt' ? 'Solicitação de informações enviada para Compras.' : 'Information request sent to Commercial.')}
                    </p>
                  </div>
                </div>
              )
            ) : hasRealPendingAlert(supplier) && (
              <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800">
                <AlertTriangle className="shrink-0 text-amber-500 mt-0.5" size={16} />
                <div className="space-y-1">
                  <span className="font-bold">{language === 'pt' ? 'Pendência Operacional / Atenção da Etapa' : 'Operational Pending / Stage Attention'}</span>
                  <p className="font-semibold leading-relaxed">{supplier.backlog_reason}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { key: 'overview', label: language === 'pt' ? 'Visão Geral & MTR' : 'Overview & MTR', icon: Building2 },
              { key: 'materials', label: `${language === 'pt' ? 'Materiais' : 'Materials'} (${supplier.materials?.length || 0})`, icon: Scale },
              { key: 'documents', label: `${language === 'pt' ? 'Documentos' : 'Documents'} (${supplier.attached_documents?.length || 0})`, icon: FileText },
              { key: 'logistics', label: language === 'pt' ? 'Logística' : 'Logistics', icon: Truck },
              { key: 'collections', label: language === 'pt' ? 'Coletas / Entregas' : 'Collections / Deliveries', icon: Calendar },
              { key: 'timeline', label: language === 'pt' ? 'Histórico' : 'History', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="space-y-6">
            
            {/* Tab 1: Visão Geral */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="md:col-span-2 space-y-6">
                  {/* MTR & Credentials Card */}
                  <Card className="border-l-4 border-l-indigo-600 bg-indigo-50/10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Key size={16} className="text-indigo-600" />
                        {language === 'pt' ? 'Acesso e Credenciais do MTR (SIGOR / SINIR)' : 'MTR Access & Credentials (SIGOR / SINIR)'}
                      </h3>
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-xs text-indigo-600 hover:underline font-bold"
                      >
                        {language === 'pt' ? 'Editar Acesso' : 'Edit Access'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'pt' ? 'Login / Usuário MTR' : 'MTR Login / Username'}</p>
                        <p className="font-bold text-slate-800 mt-1 font-mono text-sm">
                          {supplier.mtr_login || <span className="text-slate-300 font-sans font-normal italic">{language === 'pt' ? 'Não cadastrado' : 'Not registered'}</span>}
                        </p>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'pt' ? 'Senha do MTR' : 'MTR Password'}</p>
                          {supplier.mtr_password && (
                            <button 
                              onClick={() => setShowMtrPassword(p => !p)}
                              className="text-slate-400 hover:text-slate-600"
                              title={showMtrPassword ? (language === 'pt' ? 'Ocultar' : 'Hide') : (language === 'pt' ? 'Exibir senha' : 'Show password')}
                            >
                              {showMtrPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          )}
                        </div>
                        <p className="font-bold text-slate-800 mt-1 font-mono text-sm">
                          {supplier.mtr_password ? (
                            showMtrPassword ? supplier.mtr_password : '••••••••••••'
                          ) : (
                            <span className="text-slate-300 font-sans font-normal italic">{language === 'pt' ? 'Não cadastrada' : 'Not registered'}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Operational Dates */}
                  <Card>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                        <CalendarCheck size={16} className="text-emerald-600" />
                        {language === 'pt' ? 'Histórico de Entregas e Coletas' : 'Delivery and Collection History'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">{language === 'pt' ? 'Primeira Entrega / Coleta' : 'First Delivery / Collection'}</span>
                        <p className="font-bold text-slate-800 text-sm mt-1">
                          {supplier.first_collection_date ? formatDate(supplier.first_collection_date) : <span className="text-slate-400 font-normal italic">{language === 'pt' ? 'Nenhuma registrada' : 'None registered'}</span>}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">{language === 'pt' ? 'Última Entrega / Coleta' : 'Last Delivery / Collection'}</span>
                        <p className="font-bold text-slate-800 text-sm mt-1">
                          {supplier.last_collection_date ? formatDate(supplier.last_collection_date) : <span className="text-slate-400 font-normal italic">{language === 'pt' ? 'Nenhuma registrada' : 'None registered'}</span>}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Side Overview Column */}
                <div className="space-y-6">
                  {/* Contacts Summary */}
                  <Card>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Phone size={16} className="text-emerald-600" />
                        {language === 'pt' ? 'Contatos' : 'Contacts'}
                      </h3>
                    </div>
                    {supplier.contacts && supplier.contacts.length > 0 ? (
                      <div className="space-y-3">
                        {supplier.contacts.map(c => (
                          <div key={c.id} className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <p className="font-bold text-slate-800 text-xs">{c.name} {c.role ? `(${c.role})` : ''}</p>
                            <p className="text-emerald-600 font-semibold text-xs flex items-center gap-1"><Phone size={12}/>{c.whatsapp || c.phone || '-'}</p>
                            {c.email && <p className="text-slate-400 text-[11px]">{c.email}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-400 text-xs">{language === 'pt' ? 'Nenhum contato cadastrado.' : 'No contacts registered.'}</div>
                    )}
                  </Card>

                  {/* Tasks Summary */}
                  <Card>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                        <ClipboardList size={16} className="text-emerald-600" />
                        {language === 'pt' ? 'Tarefas e Pendências' : 'Tasks and Action Items'}
                      </h3>
                      <Button size="sm" variant="outline" onClick={() => setIsTaskModalOpen(true)} className="text-xs">
                        {language === 'pt' ? '+ Tarefa' : '+ Task'}
                      </Button>
                    </div>

                    {supplier.tasks && supplier.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {supplier.tasks.map(task => (
                          <div key={task.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs gap-2">
                            <div>
                              <p className={`font-semibold text-slate-800 ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                                {task.description}
                              </p>
                              {task.due_date && <span className="text-[10px] text-slate-400">{language === 'pt' ? 'Prazo:' : 'Due:'} {formatDate(task.due_date)}</span>}
                            </div>
                            {task.status === 'pending' && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-bold cursor-pointer hover:bg-emerald-100"
                              >
                                {language === 'pt' ? 'Concluir' : 'Complete'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-400 text-xs">{language === 'pt' ? 'Nenhuma pendência ativa.' : 'No active tasks.'}</div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* Tab 2: Materiais */}
            {activeTab === 'materials' && (
              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Scale size={16} className="text-emerald-600" />
                    {language === 'pt' ? 'Materiais Declarados' : 'Declared Materials'}
                  </h3>
                  {canUserModifySupplier() && (
                    <Button size="sm" className="gap-1.5" onClick={openFullMaterialsModal}>
                      <Plus size={14} />
                      {language === 'pt' ? 'Gerenciar / Adicionar Material' : 'Manage / Add Material'}
                    </Button>
                  )}
                </div>

                {supplier.materials && supplier.materials.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <th className="px-4 py-3">{language === 'pt' ? 'Material' : 'Material'}</th>
                          <th className="px-4 py-3">{language === 'pt' ? 'Est. Volume / Frequência' : 'Est. Volume / Frequency'}</th>
                          <th className="px-4 py-3">{language === 'pt' ? 'Modalidade' : 'Modality'}</th>
                          <th className="px-4 py-3">{language === 'pt' ? 'Acondicionamento' : 'Conditioning'}</th>
                          {canUserModifySupplier() && (
                            <th className="px-4 py-3 text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {supplier.materials.map(mat => (
                          <tr key={mat.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{translateMaterialName(mat.material_name, language)}</td>
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {formatVolume(mat.estimated_volume, mat.unit)} / {translateFrequency(mat.frequency, language)}
                            </td>
                            <td className="px-4 py-3">
                              {mat.transaction_type === 'purchase' ? (
                                <div className="flex flex-col text-xs text-amber-700">
                                  <span className="font-bold">{language === 'pt' ? 'Compra' : 'Purchase'}</span>
                                  <span className="text-[10px] text-slate-400">{formatCurrency(mat.price_per_kg)}/kg</span>
                                </div>
                              ) : (
                                <Badge variant="success">{language === 'pt' ? 'Doação' : 'Donation'}</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              <div className="flex flex-col gap-0.5">
                                <span>{translateStorageForm(mat.storage_form, language)}</span>
                                {mat.needs_storage_provision && (
                                  <span className="inline-flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded text-[10px] border border-indigo-200 dark:border-indigo-800 w-fit">
                                    📦 {language === 'pt' ? 'Fornecer' : 'Provide'}: {mat.storage_provision_quantity || 1}x {mat.storage_provision_type === 'Outros' ? mat.storage_provision_custom_type || 'Outros' : mat.storage_provision_type}
                                  </span>
                                )}
                              </div>
                            </td>
                            {canUserModifySupplier() && (
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={openFullMaterialsModal}
                                    className="text-slate-400 hover:text-[#2098D1] hover:bg-[#E5F5F8] dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
                                    title={language === 'pt' ? 'Editar Material' : 'Edit Material'}
                                  >
                                    <Edit2 size={15} />
                                    <span>{language === 'pt' ? 'Editar' : 'Edit'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMaterial(mat.id)}
                                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg transition-colors cursor-pointer"
                                    title={language === 'pt' ? 'Excluir Material' : 'Delete Material'}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    {language === 'pt' ? 'Nenhum material declarado para este gerador.' : 'No materials declared for this generator.'}
                  </div>
                )}
              </Card>
            )}

            {/* Tab 3: Documentos & Anexos */}
            {activeTab === 'documents' && (
              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                      <FileText size={16} className="text-emerald-600" />
                      {language === 'pt' ? 'Documentos & Termos Homologados' : 'Approved Documents & Terms'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {language === 'pt' ? 'Termo de Parceria, MTRs, Cartas de Doação e Licenças Ambientais.' : 'Partnership Agreement, MTRs, Donation Letters and Environmental Licenses.'}
                    </p>
                  </div>
                  {canUserModifySupplier() && (
                    <Button size="sm" className="gap-1.5" onClick={() => setIsDocModalOpen(true)}>
                      <Upload size={14} />
                      {language === 'pt' ? 'Anexar Documento' : 'Attach Document'}
                    </Button>
                  )}
                </div>

                {supplier.attached_documents && supplier.attached_documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {supplier.attached_documents.map(doc => (
                      <div key={doc.id} className="p-4 bg-[#F7FCFD] border border-[#CCEAF1] rounded-2xl space-y-2 relative group hover:border-[#2098D1] transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-9 w-9 rounded-xl bg-[#E5F5F8] text-[#2098D1] flex items-center justify-center font-bold shrink-0">
                              <FileCheck size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#0D2439] leading-tight truncate max-w-[160px]">{doc.name}</p>
                              <span className="text-[10px] uppercase font-bold text-[#146A88] tracking-wider block mt-0.5">
                                {doc.type === 'mtr' ? 'MTR' : doc.type === 'donation_letter' ? (language === 'pt' ? 'Carta de Doação' : 'Donation Letter') : doc.type === 'partnership_agreement' ? (language === 'pt' ? 'Termo de Parceria' : 'Partnership Agreement') : (language === 'pt' ? 'Documento' : 'Document')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownloadDoc(doc)}
                              className="text-slate-400 hover:text-[#2098D1] hover:bg-[#E5F5F8] p-1.5 rounded-full transition-colors"
                              title={language === 'pt' ? 'Baixar / Visualizar documento' : 'Download / View document'}
                            >
                              <Download size={14} />
                            </button>
                            {canUserModifySupplier() && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-colors"
                                title={language === 'pt' ? 'Remover documento' : 'Delete document'}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        {doc.notes && <p className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-[#CCEAF1]">{doc.notes}</p>}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#E5F4F7]">
                          <span>{language === 'pt' ? 'Anexado em' : 'Attached on'} {formatDate(doc.uploaded_at)}</span>
                          <span className="font-bold text-[#48780E] bg-[#EBF7D4] px-1.5 py-0.2 rounded-full">{language === 'pt' ? 'Válido' : 'Valid'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 text-sm space-y-2">
                    <FileText size={32} className="mx-auto text-slate-300" />
                    <p>{language === 'pt' ? 'Nenhum documento ou termo anexado para este gerador.' : 'No documents or agreements attached for this generator.'}</p>
                    <Button variant="outline" size="sm" onClick={() => setIsDocModalOpen(true)} className="mt-2 gap-1">
                      <Upload size={12} /> {language === 'pt' ? 'Anexar Primeiro Documento' : 'Attach First Document'}
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Tab 4: Logística */}
            {activeTab === 'logistics' && (
              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Truck size={16} className="text-emerald-600" />
                    {language === 'pt' ? 'Parecer e Viabilidade Logística' : 'Logistics Feasibility & Opinion'}
                  </h3>
                  {canUserRespondLogistics() && (
                    <Button size="sm" variant="outline" onClick={handleOpenLogisticsModal} className="text-xs">
                      {activeLogistics ? (language === 'pt' ? 'Editar Parecer' : 'Edit Opinion') : (language === 'pt' ? 'Preencher Parecer' : 'Submit Opinion')}
                    </Button>
                  )}
                </div>

                {activeLogistics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="font-bold text-slate-400 uppercase text-[9px]">{language === 'pt' ? 'Distância' : 'Distance'}</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{activeLogistics.distance_km ? `${activeLogistics.distance_km} km` : '-'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="font-bold text-slate-400 uppercase text-[9px]">{language === 'pt' ? 'Frete Estimado' : 'Estimated Freight'}</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{formatCurrency(activeLogistics.estimated_cost)}</p>
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px]">{language === 'pt' ? 'Tipo de Veículo' : 'Vehicle Type'}</span>
                        <p className="font-bold text-slate-800 mt-0.5">{activeLogistics.transport_type || '-'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px]">{language === 'pt' ? 'Responsável pelo Transporte' : 'Freight Responsible'}</span>
                        <p className="font-bold text-slate-800 mt-0.5">{activeLogistics.transport_responsible || '-'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px]">{language === 'pt' ? 'Frequência Recomendada' : 'Recommended Frequency'}</span>
                        <p className="font-bold text-slate-800 mt-0.5">{activeLogistics.recommended_frequency || '-'}</p>
                      </div>

                      {/* Cotação de Fornecimento de Armazenamento se preenchida */}
                      {(activeLogistics.storage_provision_cost !== null && activeLogistics.storage_provision_cost !== undefined || activeLogistics.storage_provision_delivery_date) && (
                        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-150 dark:border-indigo-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-900 dark:text-indigo-200 uppercase text-[9px] flex items-center gap-1">
                              📦 {language === 'pt' ? 'Cotação de Armazenamento' : 'Storage Quotation'}
                            </span>
                            {activeLogistics.storage_provision_delivery_date && (
                              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">
                                {language === 'pt' ? 'Entrega prevista:' : 'Est. Delivery:'} {formatDate(activeLogistics.storage_provision_delivery_date)}
                              </span>
                            )}
                          </div>
                          <p className="font-black text-indigo-950 dark:text-white text-sm">
                            {activeLogistics.storage_provision_cost ? formatCurrency(activeLogistics.storage_provision_cost) : (language === 'pt' ? 'Sem custo adicional' : 'No extra cost')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px]">{language === 'pt' ? 'Parecer da Análise' : 'Feasibility Decision'}</span>
                        <div className="mt-1">
                          <Badge variant={activeLogistics.feasibility === 'FEASIBLE' ? 'success' : activeLogistics.feasibility === 'INFEASIBLE' ? 'danger' : 'warning'}>
                            {translateFeasibility(activeLogistics.feasibility as any, language)}
                          </Badge>
                        </div>
                      </div>
                      {activeLogistics.conditioning_infrastructure_needed && (
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[9px]">{language === 'pt' ? 'Infraestrutura Necessária' : 'Required Infrastructure'}</span>
                          <p className="text-slate-800 mt-0.5">{activeLogistics.conditioning_infrastructure_needed}</p>
                        </div>
                      )}
                      {activeLogistics.notes && (
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[9px]">{language === 'pt' ? 'Observações da Logística' : 'Logistics Notes'}</span>
                          <p className="text-slate-800 mt-0.5 p-3 bg-slate-50 rounded-lg border border-slate-150">{activeLogistics.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm space-y-3">
                    <p>{language === 'pt' ? 'Nenhuma análise logística registrada para este gerador.' : 'No logistics analysis registered for this generator.'}</p>
                    {canUserRespondLogistics() && (
                      <Button size="sm" onClick={handleOpenLogisticsModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {language === 'pt' ? 'Preencher Análise Logística' : 'Fill Logistics Analysis'}
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Tab 5: Coletas */}
            {activeTab === 'collections' && (
              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-600" />
                    {language === 'pt' ? 'Histórico de Coletas Programadas' : 'Scheduled Collections History'}
                  </h3>
                  <Button size="sm" className="gap-1.5" onClick={openCreateCollectionModal}>
                    <Plus size={14} />
                    {language === 'pt' ? 'Agendar Coleta' : 'Schedule Collection'}
                  </Button>
                </div>

                {supplier.collections && supplier.collections.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <th className="px-4 py-3">{language === 'pt' ? 'Data Agendada' : 'Scheduled Date'}</th>
                          <th className="px-4 py-3">{language === 'pt' ? 'Material' : 'Material'}</th>
                          <th className="px-4 py-3">{language === 'pt' ? 'Volume Estimado' : 'Estimated Volume'}</th>
                          <th className="px-4 py-3">{language === 'pt' ? 'Situação' : 'Status'}</th>
                          <th className="px-4 py-3">{language === 'pt' ? 'Motorista / Veículo' : 'Driver / Vehicle'}</th>
                          <th className="px-4 py-3">{language === 'pt' ? 'Notas' : 'Notes'}</th>
                          {canUserModifySupplier() && (
                            <th className="px-4 py-3 text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {supplier.collections.map(col => {
                          const firstItem = col.items?.[0];
                          const volDisplay = firstItem 
                            ? `${firstItem.estimated_volume} ${firstItem.unit || 'kg'}`
                            : '-';
                          const matDisplay = firstItem?.material_name 
                            ? translateMaterialName(firstItem.material_name, language)
                            : (col.notes?.split('•')?.[0]?.trim() || '-');

                          return (
                            <tr key={col.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-bold text-slate-800">{formatDate(col.scheduled_date)}</td>
                              <td className="px-4 py-3 font-semibold text-slate-700">{matDisplay}</td>
                              <td className="px-4 py-3 font-black text-slate-900 bg-slate-50/80 rounded px-2 py-0.5 font-mono">
                                {volDisplay}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={col.status === 'COMPLETED' ? 'success' : 'warning'}>
                                  {col.status === 'COMPLETED' ? (language === 'pt' ? 'Realizada' : 'Completed') : (language === 'pt' ? 'Agendada' : 'Scheduled')}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                <div className="space-y-0.5">
                                  <p className="font-medium text-slate-800">{col.driver_name || '-'}</p>
                                  {col.carrier_name && <p className="text-[10px] text-slate-400">{col.carrier_name}</p>}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{col.notes || '-'}</td>
                              {canUserModifySupplier() && (
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openEditCollectionModal(col)}
                                      className="text-slate-400 hover:text-[#2098D1] hover:bg-[#E5F5F8] dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                                      title={language === 'pt' ? 'Editar Coleta' : 'Edit Collection'}
                                    >
                                      <Edit2 size={14} />
                                      <span>{language === 'pt' ? 'Editar' : 'Edit'}</span>
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    {language === 'pt' ? 'Nenhuma coleta registrada para este gerador.' : 'No collections registered for this generator.'}
                  </div>
                )}
              </Card>
            )}

            {/* Tab 6: Histórico */}
            {activeTab === 'timeline' && (
              <Card>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                  <Clock size={16} className="text-emerald-600" />
                  {language === 'pt' ? 'Linha do Tempo de Interações' : 'Interaction Timeline'}
                </h3>

                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                  {sortedTimeline.map(item => (
                    <div key={item.id} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-2 -translate-x-1/2 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-600 shadow-sm" />
                      <div className="flex-1 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{translateLogText(item.title, language)}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(item.date)}</span>
                        </div>
                        <p className="text-xs text-slate-600">{translateLogText(item.description, language)}</p>
                        {item.user && <p className="text-[10px] text-emerald-600 font-semibold">{language === 'pt' ? 'Por:' : 'By:'} {item.user}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>
        </>
      )}

      {/* Modal: Editar Ficha */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={language === 'pt' ? 'Editar Ficha do Gerador' : 'Edit Generator Record'} size="lg">
        <form onSubmit={handleUpdateSupplier} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label={language === 'pt' ? 'Razão Social *' : 'Company Name *'} value={editSupplier.name} onChange={e => setEditSupplier(p => ({ ...p, name: e.target.value }))} required />
            <Input label={language === 'pt' ? 'Nome Fantasia' : 'Trade Name'} value={editSupplier.trade_name} onChange={e => setEditSupplier(p => ({ ...p, trade_name: e.target.value }))} />
            <Input label={language === 'pt' ? 'CNPJ / CPF' : 'Tax ID / CNPJ'} value={editSupplier.document} onChange={e => setEditSupplier(p => ({ ...p, document: e.target.value }))} />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Segmento do Gerador *' : 'Generator Segment *'}
              </label>
              <select
                value={editSupplier.supplier_type}
                onChange={e => setEditSupplier(p => ({ ...p, supplier_type: e.target.value }))}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
              >
                <option value="Indústria">{language === 'pt' ? 'Indústria' : 'Industry'}</option>
                <option value="Comércio">{language === 'pt' ? 'Comércio' : 'Commerce'}</option>
                <option value="Condomínio">{language === 'pt' ? 'Condomínio' : 'Condominium'}</option>
                <option value="Cooperativa">{language === 'pt' ? 'Cooperativa' : 'Cooperative'}</option>
                <option value="Residencial">{language === 'pt' ? 'Residencial' : 'Residential'}</option>
                <option value="Outro">{language === 'pt' ? 'Outro (digitar)' : 'Other (type)'}</option>
              </select>
              {editSupplier.supplier_type === 'Outro' && (
                <input
                  type="text"
                  placeholder={language === 'pt' ? 'Digite o segmento...' : 'Type segment...'}
                  value={editSupplier.custom_supplier_type}
                  onChange={e => setEditSupplier(p => ({ ...p, custom_supplier_type: e.target.value }))}
                  className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-400 rounded-lg"
                />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Como encontramos *' : 'Lead Source *'}
              </label>
              <select
                value={editSupplier.lead_source}
                onChange={e => setEditSupplier(p => ({ ...p, lead_source: e.target.value }))}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
              >
                <option value="Busca própria">{language === 'pt' ? 'Busca própria' : 'Direct Search'}</option>
                <option value="Zion">Zion</option>
                <option value="Google Search">Google Search</option>
                <option value="Indicação">{language === 'pt' ? 'Indicação' : 'Referral'}</option>
                <option value="Outro">{language === 'pt' ? 'Outro (digitar)' : 'Other (type)'}</option>
              </select>
              {editSupplier.lead_source === 'Outro' && (
                <input
                  type="text"
                  placeholder={language === 'pt' ? 'Digite a origem...' : 'Type source...'}
                  value={editSupplier.custom_lead_source}
                  onChange={e => setEditSupplier(p => ({ ...p, custom_lead_source: e.target.value }))}
                  className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-400 rounded-lg"
                />
              )}
            </div>

            <Select
              label={language === 'pt' ? 'Responsável Interno' : 'Internal Responsible'}
              value={editSupplier.internal_responsible_id}
              onChange={e => setEditSupplier(p => ({ ...p, internal_responsible_id: e.target.value }))}
              options={profiles.map(p => ({ value: p.id, label: p.name }))}
            />
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
              {language === 'pt' ? 'Credenciais MTR' : 'MTR Credentials'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label={language === 'pt' ? 'Login do MTR' : 'MTR Login'}
                value={editSupplier.mtr_login}
                onChange={e => setEditSupplier(p => ({ ...p, mtr_login: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: usuario.sigor' : 'E.g. user.sigor'}
              />
              <Input
                label={language === 'pt' ? 'Senha do MTR' : 'MTR Password'}
                value={editSupplier.mtr_password}
                onChange={e => setEditSupplier(p => ({ ...p, mtr_password: e.target.value }))}
                placeholder={language === 'pt' ? 'Senha de emissão de MTR' : 'MTR emission password'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="submit">
              {language === 'pt' ? 'Salvar Alterações' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Anexar Documento */}
      <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title={language === 'pt' ? 'Anexar Documento do Gerador' : 'Attach Generator Document'} size="md">
        <div className="space-y-5">
          {/* Quick upload from PC */}
          <div className="p-4 bg-[#F0F9FB] dark:bg-slate-900 border border-[#CCEAF1] dark:border-slate-800 rounded-2xl text-center space-y-2">
            <Upload size={24} className="mx-auto text-[#2098D1]" />
            <p className="text-xs font-bold text-[#0D2439] dark:text-white">
              {language === 'pt' ? 'Anexar arquivos do Computador' : 'Attach files from Computer'}
            </p>
            <p className="text-[11px] text-[#547990] dark:text-slate-400">
              {language === 'pt' ? 'Selecione um ou vários arquivos (PDF, imagens, MTRs, contratos):' : 'Select one or multiple files (PDF, images, MTRs, agreements):'}
            </p>
            <label className="inline-flex items-center gap-1.5 bg-[#2098D1] hover:bg-[#1883B5] text-white px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#2098D1]/20">
              <Plus size={14} />
              <span>{language === 'pt' ? 'Buscar Arquivos no PC' : 'Browse Files on PC'}</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelectFromPC}
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px bg-[#E2F4F7] dark:bg-slate-800 flex-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {language === 'pt' ? 'ou preencha manualmente' : 'or fill in manually'}
            </span>
            <div className="h-px bg-[#E2F4F7] dark:bg-slate-800 flex-1" />
          </div>

          <form onSubmit={handleAddDocument} className="space-y-4">
            <Input
              label={language === 'pt' ? 'Nome do Arquivo / Título *' : 'File Name / Title *'}
              value={newDoc.name}
              onChange={e => setNewDoc(p => ({ ...p, name: e.target.value }))}
              placeholder={language === 'pt' ? 'Ex: Termo_Parceria_2026.pdf ou MTR-9821' : 'E.g. Partnership_Agreement_2026.pdf or MTR-9821'}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Tipo de Documento *' : 'Document Type *'}
              </label>
              <select
                value={newDoc.type}
                onChange={e => setNewDoc(p => ({ ...p, type: e.target.value as any }))}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                required
              >
                <option value="">{language === 'pt' ? 'Selecione o tipo de documento...' : 'Select document type...'}</option>
                <option value="mtr">{language === 'pt' ? 'MTR (Manifesto de Transporte)' : 'MTR (Transport Manifest)'}</option>
                <option value="donation_letter">{language === 'pt' ? 'Carta de Doação' : 'Donation Letter'}</option>
                <option value="partnership_agreement">{language === 'pt' ? 'Termo de Parceria / Contrato' : 'Partnership Agreement / Contract'}</option>
                <option value="env_license">{language === 'pt' ? 'Licença Ambiental' : 'Environmental License'}</option>
                <option value="cnpj_card">{language === 'pt' ? 'Cartão CNPJ' : 'Tax ID / CNPJ Card'}</option>
                <option value="other">{language === 'pt' ? 'Outro Documento' : 'Other Document'}</option>
              </select>
            </div>
            <Input
              label={language === 'pt' ? 'Observações / Validade' : 'Notes / Expiration'}
              value={newDoc.notes}
              onChange={e => setNewDoc(p => ({ ...p, notes: e.target.value }))}
              placeholder={language === 'pt' ? 'Ex: Válido até 31/12/2026' : 'E.g. Valid until 12/31/2026'}
            />
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsDocModalOpen(false)}>
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button type="submit">
                {language === 'pt' ? 'Salvar Documento' : 'Save Document'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal: Materiais Disponíveis & Gestão Completa */}
      <Modal 
        isOpen={isMaterialModalOpen} 
        onClose={() => setIsMaterialModalOpen(false)} 
        title={`${language === 'pt' ? 'Materiais Disponíveis' : 'Available Materials'} — ${supplier.name}`} 
        size="xl"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-3 rounded-xl text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <FileText size={15} className="shrink-0 mt-0.5" />
            <p>
              {language === 'pt' 
                ? 'Preencha os materiais identificados no contato comercial. Essas informações acompanharão o lead até a aprovação.'
                : 'Fill in the materials identified during commercial contact. This information will follow the lead until final approval.'}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {language === 'pt' ? 'Materiais do Lead' : 'Lead Materials'}
              </h4>
              <button 
                type="button"
                onClick={() => setMaterialsForm(p => [...p, newLine()])}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <PackagePlus size={13} /> {language === 'pt' ? 'Adicionar Material' : 'Add Material'}
              </button>
            </div>

            {materialsForm.map((mat, idx) => (
              <div key={mat.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 bg-slate-50/60 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{`Material #${idx + 1}`}</span>
                  {materialsForm.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => setMaterialsForm(p => p.filter(m => m.id !== mat.id))}
                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                      title={language === 'pt' ? 'Remover material' : 'Remove material'}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {language === 'pt' ? 'Tipo de Material / Categoria *' : 'Material Type / Category *'}
                    </label>
                    <select 
                      value={mat.material_name} 
                      onChange={e => updMat(mat.id, 'material_name', e.target.value)}
                      className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                    >
                      <option value="">{language === 'pt' ? 'Selecione o material...' : 'Select material...'}</option>
                      {MATERIAL_OPTIONS.map(o => <option key={o} value={o}>{translateMaterialName(o, language)}</option>)}
                    </select>
                    {mat.material_name === 'Outro' && (
                      <input
                        type="text"
                        placeholder={language === 'pt' ? 'Digite o nome do material personalizado...' : 'Enter custom material name...'}
                        value={mat.custom_material_name || ''}
                        onChange={e => updMat(mat.id, 'custom_material_name', e.target.value)}
                        className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {language === 'pt' ? 'Armazenamento no Local' : 'On-site Storage'}
                    </label>
                    <select 
                      value={mat.storage_form} 
                      onChange={e => updMat(mat.id, 'storage_form', e.target.value)}
                      className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                    >
                      <option value="">{language === 'pt' ? 'Selecione o acondicionamento...' : 'Select storage type...'}</option>
                      {STORAGE_OPTIONS.map(o => <option key={o} value={o}>{translateStorageForm(o, language)}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {language === 'pt' ? 'Frequência Estimada' : 'Estimated Frequency'}
                    </label>
                    <select 
                      value={mat.frequency} 
                      onChange={e => updMat(mat.id, 'frequency', e.target.value)}
                      className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                    >
                      <option value="">{language === 'pt' ? 'Selecione a frequência...' : 'Select frequency...'}</option>
                      {FREQUENCY_OPTIONS.map(o => <option key={o} value={o}>{translateFrequency(o, language)}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {language === 'pt' ? 'Volume Estimado' : 'Estimated Volume'}
                      </label>
                      <input 
                        type="number" 
                        value={mat.estimated_volume} 
                        placeholder="Ex: 500"
                        onChange={e => updMat(mat.id, 'estimated_volume', e.target.value)}
                        className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="w-24 flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {language === 'pt' ? 'Unidade' : 'Unit'}
                      </label>
                      <select 
                        value={mat.unit} 
                        onChange={e => updMat(mat.id, 'unit', e.target.value)}
                        className="px-2 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="kg">kg</option>
                        <option value="ton">ton</option>
                        <option value="un">un</option>
                        <option value="m³">m³</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {language === 'pt' ? 'Modalidade Comercial *' : 'Commercial Modality *'}
                    </label>
                    <div className="flex gap-2">
                      {(['donation', 'purchase'] as const).map(type => (
                        <label 
                          key={type} 
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                            mat.transaction_type === type
                              ? (type === 'donation' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300')
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <input 
                            type="radio" 
                            className="sr-only" 
                            checked={mat.transaction_type === type}
                            onChange={() => updMat(mat.id, 'transaction_type', type)}
                          />
                          {type === 'donation' ? (language === 'pt' ? '🤝 Doação' : '🤝 Donation') : (language === 'pt' ? '💰 Compra' : '💰 Purchase')}
                        </label>
                      ))}
                    </div>
                  </div>

                  {mat.transaction_type === 'purchase' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {language === 'pt' ? 'Preço Estimado por kg (R$)' : 'Estimated Price per kg (R$)'}
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={mat.price_per_kg} 
                        placeholder="Ex: 0.50"
                        onChange={e => updMat(mat.id, 'price_per_kg', e.target.value)}
                        className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {/* Fornecimento de Meio de Armazenamento */}
                  <div className="col-span-1 md:col-span-2 p-3.5 bg-[#F0F9FB] dark:bg-slate-900/80 border border-[#CCEAF1] dark:border-slate-800 rounded-xl space-y-3 mt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-[#0E2439] dark:text-slate-200">
                        {language === 'pt' ? 'Necessita fornecimento de meio de armazenamento?' : 'Requires storage container provision?'}
                      </label>
                      <div className="flex gap-2">
                        <label className={`px-4 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                          mat.needs_storage_provision
                            ? 'border-[#2098D1] bg-[#2098D1] text-white shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                        }`}>
                          <input
                            type="radio"
                            name={`needs_storage_${mat.id}`}
                            className="sr-only"
                            checked={Boolean(mat.needs_storage_provision)}
                            onChange={() => updMat(mat.id, 'needs_storage_provision', true)}
                          />
                          {language === 'pt' ? 'Sim' : 'Yes'}
                        </label>
                        <label className={`px-4 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                          !mat.needs_storage_provision
                            ? 'border-slate-400 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                        }`}>
                          <input
                            type="radio"
                            name={`needs_storage_${mat.id}`}
                            className="sr-only"
                            checked={!mat.needs_storage_provision}
                            onChange={() => updMat(mat.id, 'needs_storage_provision', false)}
                          />
                          {language === 'pt' ? 'Não' : 'No'}
                        </label>
                      </div>
                    </div>

                    {mat.needs_storage_provision && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-[#CCEAF1] dark:border-slate-800">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {language === 'pt' ? 'Tipo de Armazenamento *' : 'Storage Type *'}
                          </label>
                          <select
                            value={mat.storage_provision_type || 'Bag'}
                            onChange={e => updMat(mat.id, 'storage_provision_type', e.target.value)}
                            className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                          >
                            <option value="Bag">Bag</option>
                            <option value="Contêiner">{language === 'pt' ? 'Contêiner' : 'Container'}</option>
                            <option value="Caçamba">{language === 'pt' ? 'Caçamba' : 'Dumpster'}</option>
                            <option value="Outros">{language === 'pt' ? 'Outros' : 'Others'}</option>
                          </select>
                          {mat.storage_provision_type === 'Outros' && (
                            <input
                              type="text"
                              placeholder={language === 'pt' ? 'Descreva o tipo de armazenamento...' : 'Describe storage type...'}
                              value={mat.storage_provision_custom_type || ''}
                              onChange={e => updMat(mat.id, 'storage_provision_custom_type', e.target.value)}
                              className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                              required
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {language === 'pt' ? 'Quantidade Necessária *' : 'Required Quantity *'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Ex: 5"
                            value={mat.storage_provision_quantity || ''}
                            onChange={e => updMat(mat.id, 'storage_provision_quantity', e.target.value)}
                            className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-[#2098D1]"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Multi-file Attachments from PC */}
          <div className="p-4 bg-[#F0F9FB] dark:bg-slate-900 border border-[#CCEAF1] dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0E2439] dark:text-slate-100">
                <Upload size={15} className="text-[#2098D1]" />
                <span>{language === 'pt' ? 'Anexar Documentos do Computador' : 'Attach Documents from Computer'}</span>
              </div>
              <label className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-[#E5F5F8] text-[#2098D1] border border-[#CCEAF1] dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs">
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

            <p className="text-[11px] text-[#4F7891] dark:text-slate-400">
              {language === 'pt'
                ? 'Selecione um ou vários arquivos (MTR, Carta de Doação, Termo de Parceria, Licenças, PDF, imagens ou planilhas). Eles ficarão salvos permanentemente na ficha deste lead em todas as etapas.'
                : 'Select one or multiple files (MTR, Donation Letter, Agreement, Licenses, PDF, images or spreadsheets).'}
            </p>

            {/* Attached Files List */}
            {attachedFiles.length > 0 ? (
              <div className="space-y-2 pt-1">
                {attachedFiles.map(file => (
                  <div key={file.id} className="p-2.5 bg-white dark:bg-slate-800 border border-[#CCEAF1] dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-[#E5F5F8] dark:bg-slate-900 text-[#2098D1] flex items-center justify-center font-bold text-xs shrink-0">
                        <FileCheck size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0E2439] dark:text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
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
                        className="px-2 py-1 text-[11px] font-bold bg-[#F7FCFD] dark:bg-slate-900 border border-[#CCEAF1] dark:border-slate-700 rounded-lg outline-none cursor-pointer"
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
                        title={language === 'pt' ? 'Remover anexo' : 'Remove attachment'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 border border-dashed border-[#CCEAF1] dark:border-slate-700 rounded-xl text-center text-xs text-slate-400">
                {language === 'pt' 
                  ? 'Nenhum arquivo anexado ainda. Clique em "Buscar no PC" para selecionar arquivos.'
                  : 'No files attached yet. Click "Browse PC" to select files.'}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsMaterialModalOpen(false)}>
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="button" onClick={handleSaveFullMaterials} disabled={isSavingMaterials}>
              {isSavingMaterials ? (language === 'pt' ? 'Salvando...' : 'Saving...') : (language === 'pt' ? 'Salvar Materiais' : 'Save Materials')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Agendar / Editar Coleta */}
      <Modal 
        isOpen={isCollectionModalOpen} 
        onClose={() => { setIsCollectionModalOpen(false); setEditingCollectionId(null); }} 
        title={
          editingCollectionId 
            ? (language === 'pt' ? 'Editar Coleta Programada' : 'Edit Scheduled Collection')
            : (language === 'pt' ? 'Agendar Coleta de Materiais' : 'Schedule Material Collection')
        } 
        size="md"
      >
        <form onSubmit={handleAddOrUpdateCollection} className="space-y-4">
          <Input
            label={language === 'pt' ? 'Data Programada *' : 'Scheduled Date *'}
            type="date"
            value={newCollection.scheduled_date}
            onChange={e => setNewCollection(p => ({ ...p, scheduled_date: e.target.value }))}
            required
          />
          <Input
            label={language === 'pt' ? 'Material a Coletar *' : 'Material to Collect *'}
            value={newCollection.material_name}
            onChange={e => setNewCollection(p => ({ ...p, material_name: e.target.value }))}
            placeholder={language === 'pt' ? 'Ex: Papelão e Sucata' : 'E.g. Cardboard and Scrap'}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <Input
                label={language === 'pt' ? 'Volume Estimado *' : 'Estimated Volume *'}
                type="number"
                value={newCollection.estimated_volume}
                onChange={e => setNewCollection(p => ({ ...p, estimated_volume: e.target.value }))}
                placeholder="1000"
                required
              />
            </div>
            <div className="sm:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Unidade *' : 'Unit *'}
              </label>
              <select
                value={newCollection.unit}
                onChange={e => setNewCollection(p => ({ ...p, unit: e.target.value }))}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none font-medium h-[42px]"
              >
                <option value="kg">kg</option>
                <option value="toneladas">{language === 'pt' ? 'toneladas' : 'tons'}</option>
                <option value="un">un</option>
                <option value="m³">m³</option>
                <option value="Outros">{language === 'pt' ? 'Outros' : 'Others'}</option>
              </select>
            </div>
            <div className="sm:col-span-4">
              <Input
                label={language === 'pt' ? 'Motorista' : 'Driver'}
                value={newCollection.driver_name}
                onChange={e => setNewCollection(p => ({ ...p, driver_name: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: José Silva' : 'E.g. John Doe'}
              />
            </div>
          </div>
          {newCollection.unit === 'Outros' && (
            <Input
              label={language === 'pt' ? 'Especifique a Unidade de Medida *' : 'Specify Unit of Measure *'}
              value={newCollection.custom_unit}
              onChange={e => setNewCollection(p => ({ ...p, custom_unit: e.target.value }))}
              placeholder={language === 'pt' ? 'Ex: Bags, Tambores, Caixas...' : 'E.g. Bags, Drums, Boxes...'}
              required
            />
          )}
          <Input
            label={language === 'pt' ? 'Transportadora / Veículo' : 'Carrier / Vehicle'}
            value={newCollection.carrier_name}
            onChange={e => setNewCollection(p => ({ ...p, carrier_name: e.target.value }))}
            placeholder={language === 'pt' ? 'Ex: Terceirizado da iWrc, Caminhão Toco...' : 'E.g. iWrc 3rd party, Box truck...'}
          />
          <Input
            label={language === 'pt' ? 'Observações' : 'Notes'}
            value={newCollection.notes}
            onChange={e => setNewCollection(p => ({ ...p, notes: e.target.value }))}
            placeholder={language === 'pt' ? 'Instruções de acesso, contato local...' : 'Access notes, on-site contact...'}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => { setIsCollectionModalOpen(false); setEditingCollectionId(null); }}>
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="submit">
              {editingCollectionId 
                ? (language === 'pt' ? 'Salvar Alterações' : 'Save Changes')
                : (language === 'pt' ? 'Agendar Coleta' : 'Schedule Collection')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Tarefa */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={language === 'pt' ? 'Criar Nova Tarefa / Pendência' : 'Create New Task / Action Item'} size="md">
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            label={language === 'pt' ? 'Descrição da Tarefa *' : 'Task Description *'}
            value={newTask.description}
            onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
            placeholder={language === 'pt' ? 'Ex: Solicitar novo login de MTR' : 'E.g. Request new MTR login'}
            required
          />
          <Input
            label={language === 'pt' ? 'Prazo' : 'Due Date'}
            type="date"
            value={newTask.due_date}
            onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="submit">
              {language === 'pt' ? 'Criar Tarefa' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Contato */}
      <Modal isOpen={isInteractionModalOpen} onClose={() => setIsInteractionModalOpen(false)} title={language === 'pt' ? 'Registrar Contato com Gerador' : 'Log Contact with Generator'} size="md">
        <form onSubmit={handleAddInteraction} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'pt' ? 'Tipo de Contato *' : 'Contact Type *'}
            </label>
            <select
              value={newInteraction.type}
              onChange={e => setNewInteraction(p => ({ ...p, type: e.target.value }))}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
              required
            >
              <option value="">{language === 'pt' ? 'Selecione o tipo de contato...' : 'Select contact type...'}</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">{language === 'pt' ? 'Ligação Telefônica' : 'Phone Call'}</option>
              <option value="email">{language === 'pt' ? 'E-mail' : 'Email'}</option>
              <option value="meeting">{language === 'pt' ? 'Reunião Presencial / Online' : 'Meeting (In-person / Online)'}</option>
              <option value="visit">{language === 'pt' ? 'Visita Técnica' : 'Technical Visit'}</option>
              <option value="internal_obs">{language === 'pt' ? 'Anotação Interna' : 'Internal Note'}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'pt' ? 'Resumo do Contato *' : 'Contact Summary *'}
            </label>
            <textarea
              value={newInteraction.description}
              onChange={e => setNewInteraction(p => ({ ...p, description: e.target.value }))}
              placeholder={language === 'pt' ? 'Descreva os pontos alinhados...' : 'Describe the points discussed...'}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none min-h-[90px]"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsInteractionModalOpen(false)}>
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="submit">
              {language === 'pt' ? 'Registrar' : 'Log Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Resposta / Parecer Logístico (Idêntico ao da tela de Logística) */}
      <Modal isOpen={isLogisticsModalOpen} onClose={() => setIsLogisticsModalOpen(false)}
        title={`${language === 'pt' ? 'Análise Logística' : 'Logistics Analysis'} — ${supplier.name}`} size="lg">
        <form onSubmit={handleSaveLogisticsResponse} className="space-y-5">

          {/* Materials recap */}
          {supplier.materials && supplier.materials.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1">
              <span className="font-bold text-slate-600 dark:text-slate-400">{language === 'pt' ? 'Materiais Declarados:' : 'Declared Materials:'}</span>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {supplier.materials.map((m, i) => (
                  <span key={i} className="font-semibold text-slate-700 dark:text-slate-300">
                    • {translateMaterialName(m.material_name, language)}: {formatVolume(m.estimated_volume, m.unit)} ({m.transaction_type === 'purchase' ? (language === 'pt' ? 'Compra' : 'Purchase') : (language === 'pt' ? 'Doação' : 'Donation')})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents attached */}
          {supplier.attached_documents && supplier.attached_documents.length > 0 && (
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-lg text-xs space-y-1">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">{language === 'pt' ? 'Documentos Anexados pelo Comercial:' : 'Documents Attached by Commercial:'}</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {supplier.attached_documents.map(d => (
                  <span key={d.id} className="inline-flex items-center gap-1 font-bold text-indigo-800 dark:text-indigo-300 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    <FileCheck size={12} /> {d.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {supplier.address && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
              <MapPin size={13} className="text-slate-400" />
              <span>{supplier.address.street || (language === 'pt' ? 'Endereço' : 'Address')}, {supplier.address.number || 'S/N'} — {supplier.address.neighborhood || ''} • {supplier.address.city}/{supplier.address.state}</span>
            </div>
          )}

          {/* Responsável pelo Transporte */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Responsável pelo Transporte / Coleta *' : 'Freight / Transport Responsible *'}</label>
            <select
              value={logisticsForm.transport_responsible}
              onChange={e => setLogisticsForm(p => ({ ...p, transport_responsible: e.target.value }))}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
            >
              {responsibleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {logisticsForm.transport_responsible === 'Outros' && (
              <input
                type="text"
                placeholder={language === 'pt' ? 'Digite o responsável...' : 'Type responsible...'}
                value={logisticsForm.custom_transport_responsible}
                onChange={e => setLogisticsForm(p => ({ ...p, custom_transport_responsible: e.target.value }))}
                className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            )}
          </div>

          {/* Banner if Generator handles transport */}
          {logisticsForm.transport_responsible === 'Fornecedor (entrega no Hub)' ? (
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-xs space-y-1">
              <span className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                🚚 {language === 'pt' ? 'Coleta Realizada pelo Próprio Gerador (Entrega no Hub)' : 'Generator Self-Delivery to Hub'}
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                {(supplier.materials || []).some(m => m.needs_storage_provision)
                  ? (language === 'pt' 
                      ? 'A iWrc não realizará o frete/transporte. Preencha apenas a cotação e previsão de entrega dos recipientes de armazenamento solicitados abaixo.'
                      : 'iWrc will not perform transportation. Please fill the storage container quote and delivery date below.')
                  : (language === 'pt'
                      ? 'O gerador entregará os materiais no Hub e não necessita de recipientes. Nenhuma cotação de frete ou armazenamento é necessária.'
                      : 'The generator will deliver to the Hub with no container requirements. No freight or container quote required.')}
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
                value={logisticsForm.distance_km}
                onChange={e => setLogisticsForm(p => ({ ...p, distance_km: e.target.value }))}
                placeholder="Ex: 45" />

              <Input label={language === 'pt' ? 'Custo estimado de frete (R$)' : 'Estimated Freight Cost (R$)'} type="number"
                value={logisticsForm.estimated_cost}
                onChange={e => setLogisticsForm(p => ({ ...p, estimated_cost: e.target.value }))}
                placeholder="Ex: 350" />

              {/* Tipo de Veículo */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Tipo de Veículo *' : 'Vehicle Type *'}</label>
                <select
                  value={logisticsForm.transport_type}
                  onChange={e => setLogisticsForm(p => ({ ...p, transport_type: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                >
                  {transportTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {logisticsForm.transport_type === 'Outros' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Digite o outro tipo de transporte...' : 'Type transport type...'}
                    value={logisticsForm.custom_transport_type}
                    onChange={e => setLogisticsForm(p => ({ ...p, custom_transport_type: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>

              {/* Frequência Recomendada */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Frequência Recomendada *' : 'Recommended Frequency *'}</label>
                <select
                  value={logisticsForm.recommended_frequency}
                  onChange={e => setLogisticsForm(p => ({ ...p, recommended_frequency: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                >
                  {frequencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {logisticsForm.recommended_frequency === 'Outros' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Especifique a frequência...' : 'Specify frequency...'}
                    value={logisticsForm.custom_frequency}
                    onChange={e => setLogisticsForm(p => ({ ...p, custom_frequency: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>
            </div>
          )}

          {/* Storage Provision Section if requested */}
          {(supplier.materials || []).some(m => m.needs_storage_provision) && (
            <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  📦 {language === 'pt' ? 'Cotação de Fornecimento de Meios de Armazenamento' : 'Storage Provision Quotation'}
                </span>
                <span className="text-[10px] font-bold bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2.5 py-0.5 rounded-full">
                  {(supplier.materials || []).filter(m => m.needs_storage_provision).length} {language === 'pt' ? 'item(ns) solicitado(s)' : 'item(s) requested'}
                </span>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">{language === 'pt' ? 'Recipientes Solicitados pelo Comercial:' : 'Containers Requested by Commercial:'}</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(supplier.materials || []).filter(m => m.needs_storage_provision).map((m, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded text-xs border border-indigo-200 dark:border-indigo-800">
                      • {m.storage_provision_quantity || 1}x {m.storage_provision_type === 'Outros' ? m.storage_provision_custom_type || 'Outros' : m.storage_provision_type} ({translateMaterialName(m.material_name, language)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label={language === 'pt' ? 'Valor da Cotação dos Recipientes (R$) *' : 'Containers Quotation Value (R$) *'}
                  type="number"
                  step="0.01"
                  value={logisticsForm.storage_provision_cost}
                  onChange={e => setLogisticsForm(p => ({ ...p, storage_provision_cost: e.target.value }))}
                  placeholder="Ex: 800.00"
                  required
                />
                <Input
                  label={language === 'pt' ? 'Previsão / Data de Entrega dos Recipientes *' : 'Estimated Container Delivery Date *'}
                  type="date"
                  value={logisticsForm.storage_provision_delivery_date}
                  onChange={e => setLogisticsForm(p => ({ ...p, storage_provision_delivery_date: e.target.value }))}
                  required
                />
              </div>
            </div>
          )}

          {/* Feasibility Decision */}
          <div className="grid grid-cols-1 gap-4">
            <Select label={language === 'pt' ? 'Decisão de Viabilidade *' : 'Feasibility Decision *'} value={logisticsForm.feasibility}
              onChange={e => setLogisticsForm(p => ({ ...p, feasibility: e.target.value }))}
              options={feasibilityOptions} />
          </div>

            {/* Documentation checklist (shown only when Necessita Informação Adicional) */}
            {logisticsForm.feasibility === 'NEED_INFO' && (
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

          {logisticsForm.feasibility === 'NEED_INFO' && (
            <Input label={language === 'pt' ? 'O que precisa ser esclarecido com Compras? (Gera pendência automática) *' : 'What needs to be clarified with Commercial? (Creates auto-task) *'}
              value={logisticsForm.need_info_reason}
              onChange={e => setLogisticsForm(p => ({ ...p, need_info_reason: e.target.value }))}
              placeholder={language === 'pt' ? 'Ex: Confirmar se o acesso do caminhão Truck comporta portão de 4m' : 'E.g. Confirm whether 4m gate allows Truck access'} required />
          )}

          <Input label={language === 'pt' ? 'Infraestrutura necessária no local' : 'Infrastructure needed on site'}
            value={logisticsForm.conditioning_infrastructure_needed}
            onChange={e => setLogisticsForm(p => ({ ...p, conditioning_infrastructure_needed: e.target.value }))}
            placeholder={language === 'pt' ? 'Ex: Deixar 2 caçambas de 30m³, disponibilizar paleteira...' : 'E.g. Place 2x 30m³ dumpsters, provide pallet jack...'} />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'pt' ? 'Observações Gerais da Logística' : 'General Logistics Notes'}
            </label>
            <textarea value={logisticsForm.notes}
              onChange={e => setLogisticsForm(p => ({ ...p, notes: e.target.value }))}
              placeholder={language === 'pt' ? 'Justifique a decisão, rotas sugeridas, pedágios ou restrições de trânsito...' : 'Justify decision, suggested routes, tolls or traffic restrictions...'}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
          </div>

          {logisticsForm.feasibility === 'FEASIBLE' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
              <CheckCircle size={16} />
              {language === 'pt' 
                ? 'Este lead será homologado e integrado ao módulo de Geradores.'
                : 'This lead will be approved and integrated into the Generators module.'}
            </div>
          )}

          {logisticsForm.feasibility === 'INFEASIBLE' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 font-semibold">
              <XCircle size={16} />
              {language === 'pt'
                ? 'Este lead será marcado como Inviável e constará em Geradores com status de inviabilidade.'
                : 'This lead will be marked as Infeasible and listed with infeasibility status.'}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsLogisticsModalOpen(false)}>
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {language === 'pt' ? 'Salvar Parecer' : 'Save Opinion'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Responder Informações para Logística (Compras) */}
      <Modal isOpen={isRespondInfoModalOpen} onClose={() => setIsRespondInfoModalOpen(false)}
        title={`${language === 'pt' ? 'Esclarecimentos Solicitados pela Logística' : 'Clarifications Requested by Logistics'} — ${supplier.name}`} size="lg">
        <form onSubmit={handleRespondInfoSubmit} className="space-y-5">
          
          {/* Card 1: Dúvidas e Solicitações da Logística */}
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              {language === 'pt' ? 'O que a Logística precisa saber / solicitou:' : 'What Logistics needs to know / requested:'}
            </div>
            
            {/* Main reason / question */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 shadow-2xs">
              <p className="text-xs font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                {language === 'pt' ? 'Dúvida / Esclarecimento Principal:' : 'Main Question / Clarification:'}
              </p>
              <p className="text-sm font-bold text-amber-950 dark:text-amber-200 mt-1 leading-relaxed">
                {supplier.backlog_reason || activeLogistics?.notes || (language === 'pt' ? 'A Logística solicitou esclarecimentos adicionais de rota, acesso ou documentação.' : 'Logistics requested additional clarifications on route, access or documentation.')}
              </p>
            </div>

            {/* Pending documents checklist from Logistics */}
            {activeLogistics?.pending_docs && activeLogistics.pending_docs.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                  {language === 'pt' ? 'Documentação Solicitada pela Logística:' : 'Documentation Requested by Logistics:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeLogistics.pending_docs.map((doc, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 px-2.5 py-1 rounded-lg">
                      📋 {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Logistics context details */}
            {activeLogistics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">
                    {language === 'pt' ? 'Veículo Planejado:' : 'Planned Vehicle:'}
                  </span>
                  <span className="font-bold">{activeLogistics.transport_type || 'VUC'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">
                    {language === 'pt' ? 'Distância Estimada:' : 'Estimated Distance:'}
                  </span>
                  <span className="font-bold">{activeLogistics.distance_km ? `${activeLogistics.distance_km} km` : (language === 'pt' ? 'A calcular' : 'To calculate')}</span>
                </div>
                {activeLogistics.conditioning_infrastructure_needed && (
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">
                      {language === 'pt' ? 'Infraestrutura Solicitada:' : 'Requested Infrastructure:'}
                    </span>
                    <span className="font-bold truncate block" title={activeLogistics.conditioning_infrastructure_needed}>
                      {activeLogistics.conditioning_infrastructure_needed}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Campos de Resposta de Compras */}
          <div className="space-y-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>{language === 'pt' ? 'Sua Resposta e Esclarecimentos para a Logística *' : 'Your Response and Clarifications to Logistics *'}</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {language === 'pt' ? 'Seja detalhado sobre acesso, restrições e portão' : 'Be detailed about access, gate and time limits'}
                </span>
              </label>
              <textarea
                value={respondInfoText}
                onChange={e => setRespondInfoText(e.target.value)}
                placeholder={language === 'pt' ? 'Ex: Conversei com o responsável Fábio. O portão tem 4,5m de altura livre, comporta caminhão Truck sem problemas de segunda a sexta das 08h às 17h. O contato para recepção do motorista na expedição é (11) 98888-7777...' : 'E.g. Spoke with manager. Gate clearance is 4.5m, fits Truck easily Monday to Friday 8am to 5pm...'}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 min-h-[110px]"
                required
              />
            </div>

            {/* Optional Document Upload inside the response */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Upload size={14} className="text-indigo-600" />
                {language === 'pt' ? 'Anexar Documento ou Foto Solicitada (Opcional)' : 'Attach Requested Document or Photo (Optional)'}
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0 || !supplier) return;

                  Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    const sizeStr = file.size > 1024 * 1024 
                      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                      : (file.size / 1024).toFixed(0) + ' KB';

                    let inferredType: AttachedDocument['type'] = 'other';
                    const lower = file.name.toLowerCase();
                    if (lower.includes('mtr') || lower.includes('manifesto')) inferredType = 'mtr';
                    else if (lower.includes('doacao') || lower.includes('doação') || lower.includes('carta')) inferredType = 'donation_letter';
                    else if (lower.includes('termo') || lower.includes('contrato') || lower.includes('parceria')) inferredType = 'partnership_agreement';
                    else if (lower.includes('licenca') || lower.includes('licença')) inferredType = 'env_license';
                    else if (lower.includes('cnpj')) inferredType = 'cnpj_card';

                    reader.onload = async () => {
                      await dbService.addSupplierDocument(supplier.id, {
                        name: file.name,
                        size: sizeStr,
                        file_data: reader.result as string,
                        type: inferredType,
                        notes: language === 'pt' ? 'Anexado em resposta à solicitação da Logística' : 'Attached in response to Logistics request'
                      });
                      fetchSupplierData();
                    };
                    reader.readAsDataURL(file);
                  });
                }}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                {language === 'pt' 
                  ? 'Você pode anexar arquivos aqui (ex: Carta de Doação, Cartão CNPJ, fotos do portão ou doca de carga).'
                  : 'You can attach files here (e.g. Donation Letter, CNPJ card, gate or loading dock photos).'}
              </p>
            </div>
          </div>

          {/* Banner explicativo de envio */}
          <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 font-medium">
            <Send size={14} className="shrink-0 text-indigo-600" />
            <span>
              {language === 'pt'
                ? 'Ao clicar em Enviar Resposta à Logística, esses esclarecimentos serão registrados e o lead voltará automaticamente para a fila de avaliação da Logística.'
                : 'By clicking Send Response to Logistics, these details will be logged and the lead will automatically return to Logistics review queue.'}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsRespondInfoModalOpen(false)}>
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5">
              <Send size={14} />
              {language === 'pt' ? 'Enviar Resposta à Logística' : 'Send Response to Logistics'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
