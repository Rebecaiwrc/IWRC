'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '@/features/shared/services/dbService';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Collection, CollectionStatus, Supplier } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  X,
  Layers,
  CalendarRange,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Plus,
  AlertTriangle,
  PackagePlus
} from 'lucide-react';
import Link from 'next/link';

interface EditItemLine {
  id?: string;
  material_name: string;
  custom_material_name?: string;
  estimated_volume: string;
  unit: string;
}

const COMMON_MATERIALS = [
  'Sucata Mista',
  'Papelão',
  'Plástico Filme',
  'PET',
  'Metais / Alumínio',
  'Eletrônicos',
  'Madeira / Pallets',
  'Vidro',
  'Bombonas / Tambores',
  'Outro'
];

const COMMON_VEHICLES = [
  'VUC',
  'Toco',
  'Truck',
  'Carreta',
  'Fiorino / Van',
  'Frota Própria iWrc',
  'Transporte Terceirizado',
  'Entrega Própria (Gerador)',
  'Outro'
];

export default function CollectionsPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' = closest date first, 'desc' = furthest date first
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editSupplierId, setEditSupplierId] = useState('');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editCarrierName, setEditCarrierName] = useState('');
  const [editCustomCarrierName, setEditCustomCarrierName] = useState('');
  const [editDriverName, setEditDriverName] = useState('');
  const [editStatus, setEditStatus] = useState<CollectionStatus>('SCHEDULED');
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState<EditItemLine[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

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

  // Base list of collections visible to current user
  const visibleCollections = useMemo(() => {
    return collections.filter(c => {
      const sup = c.supplier || suppliers.find(s => s.id === c.supplier_id);
      if (!sup) return false;
      return isResponsibleForSupplier(sup);
    });
  }, [collections, suppliers, currentUser, isBuyer]);

  // Extract unique materials from collections for the filter dropdown
  const availableMaterials = useMemo(() => {
    const matSet = new Set<string>();
    visibleCollections.forEach(c => {
      (c.items || []).forEach(item => {
        if (item.material_name?.trim()) {
          matSet.add(item.material_name.trim());
        }
      });
    });
    return Array.from(matSet).sort();
  }, [visibleCollections]);

  // Extract unique vehicle / carrier / transport types for the filter dropdown
  const availableVehicles = useMemo(() => {
    const vSet = new Set<string>(['VUC', 'Toco', 'Truck', 'Carreta', 'Fiorino / Van']);
    visibleCollections.forEach(c => {
      if (c.carrier_name?.trim()) vSet.add(c.carrier_name.trim());
      const sup = c.supplier || suppliers.find(s => s.id === c.supplier_id);
      const transType = sup?.logistics_analyses?.[0]?.transport_type;
      if (transType?.trim()) vSet.add(transType.trim());
    });
    return Array.from(vSet).sort();
  }, [visibleCollections, suppliers]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    startDate ||
    endDate ||
    statusFilter !== 'ALL' ||
    vehicleFilter !== 'ALL' ||
    materialFilter !== 'ALL'
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('ALL');
    setVehicleFilter('ALL');
    setMaterialFilter('ALL');
  };

  // Filter and sort chronologically according to sortOrder
  const filteredAndSortedCollections = useMemo(() => {
    return visibleCollections
      .filter(col => {
        const sup = col.supplier || suppliers.find(s => s.id === col.supplier_id);

        // 1. Search Query (Generator name, trade name, document, code)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const nameMatch = sup?.name?.toLowerCase().includes(query);
          const tradeMatch = sup?.trade_name?.toLowerCase().includes(query);
          const docMatch = sup?.document?.toLowerCase().includes(query);
          const codeMatch = sup?.code?.toLowerCase().includes(query);
          const driverMatch = col.driver_name?.toLowerCase().includes(query);
          const carrierMatch = col.carrier_name?.toLowerCase().includes(query);

          if (!nameMatch && !tradeMatch && !docMatch && !codeMatch && !driverMatch && !carrierMatch) {
            return false;
          }
        }

        // 2. Status Filter
        if (statusFilter !== 'ALL' && col.status !== statusFilter) {
          return false;
        }

        // 3. Material Filter
        if (materialFilter !== 'ALL') {
          const hasMaterial = (col.items || []).some(
            item => item.material_name?.trim().toLowerCase() === materialFilter.toLowerCase()
          );
          if (!hasMaterial) return false;
        }

        // 4. Vehicle / Carrier Filter
        if (vehicleFilter !== 'ALL') {
          const supTrans = sup?.logistics_analyses?.[0]?.transport_type;
          const carrierMatch = col.carrier_name?.trim().toLowerCase() === vehicleFilter.toLowerCase();
          const transMatch = supTrans?.trim().toLowerCase() === vehicleFilter.toLowerCase();
          if (!carrierMatch && !transMatch) return false;
        }

        // 5. Date Period Filter (startDate / endDate)
        if (startDate || endDate) {
          const colDate = col.scheduled_date ? col.scheduled_date.substring(0, 10) : '';
          if (startDate && colDate < startDate) return false;
          if (endDate && colDate > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.scheduled_date || 0).getTime();
        const timeB = new Date(b.scheduled_date || 0).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [visibleCollections, suppliers, searchQuery, statusFilter, materialFilter, vehicleFilter, startDate, endDate, sortOrder]);

  // Handle opening the Edit modal
  const handleOpenEditModal = (col: Collection) => {
    setEditingCollection(col);
    setEditSupplierId(col.supplier_id || '');
    setEditScheduledDate(col.scheduled_date ? col.scheduled_date.substring(0, 10) : '');
    
    const isStdVehicle = COMMON_VEHICLES.includes(col.carrier_name || '');
    setEditCarrierName(isStdVehicle ? (col.carrier_name || '') : (col.carrier_name ? 'Outro' : ''));
    setEditCustomCarrierName(isStdVehicle ? '' : (col.carrier_name || ''));
    
    setEditDriverName(col.driver_name || '');
    setEditStatus(col.status || 'SCHEDULED');
    setEditNotes(col.notes || '');

    if (col.items && col.items.length > 0) {
      setEditItems(col.items.map(item => {
        const isStdMat = COMMON_MATERIALS.includes(item.material_name || '');
        return {
          id: item.id,
          material_name: isStdMat ? (item.material_name || 'Sucata Mista') : 'Outro',
          custom_material_name: isStdMat ? '' : (item.material_name || ''),
          estimated_volume: item.estimated_volume !== undefined ? String(item.estimated_volume) : '',
          unit: item.unit || 'kg'
        };
      }));
    } else {
      setEditItems([
        { material_name: 'Sucata Mista', custom_material_name: '', estimated_volume: '1000', unit: 'kg' }
      ]);
    }

    setIsEditModalOpen(true);
  };

  const handleAddEditItem = () => {
    setEditItems(prev => [
      ...prev,
      { material_name: 'Sucata Mista', custom_material_name: '', estimated_volume: '', unit: 'kg' }
    ]);
  };

  const handleRemoveEditItem = (index: number) => {
    setEditItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateEditItem = (index: number, field: keyof EditItemLine, val: string) => {
    setEditItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: val } : item));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;
    if (!editSupplierId) {
      alert(language === 'pt' ? 'Selecione um gerador/fornecedor.' : 'Select a generator/supplier.');
      return;
    }
    if (!editScheduledDate) {
      alert(language === 'pt' ? 'Informe a data prevista da coleta.' : 'Specify the collection date.');
      return;
    }

    setIsSubmittingEdit(true);

    const finalCarrier = editCarrierName === 'Outro'
      ? (editCustomCarrierName.trim() || 'Outro')
      : editCarrierName;

    const finalItems = editItems.map(item => {
      const finalMatName = item.material_name === 'Outro'
        ? (item.custom_material_name?.trim() || 'Resíduos Diversos')
        : item.material_name;
      return {
        material_name: finalMatName,
        estimated_volume: Number(item.estimated_volume) || 0,
        unit: item.unit || 'kg'
      };
    });

    try {
      const updated = await dbService.updateCollection(
        editingCollection.id,
        {
          supplier_id: editSupplierId,
          scheduled_date: editScheduledDate ? editScheduledDate.split('T')[0] : new Date().toISOString().split('T')[0],
          carrier_name: finalCarrier || null,
          driver_name: editDriverName.trim() || null,
          status: editStatus,
          notes: editNotes.trim() || null
        },
        finalItems
      );

      // Optimistic state update
      setCollections(prev => prev.map(c => c.id === editingCollection.id ? {
        ...c,
        ...updated,
        supplier: suppliers.find(s => s.id === editSupplierId) || c.supplier,
        items: finalItems as any
      } : c));

      setIsEditModalOpen(false);
      setEditingCollection(null);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating collection:', err);
      alert(language === 'pt' ? 'Erro ao salvar alterações da coleta: ' + (err?.message || '') : 'Error saving collection changes.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle opening the Delete confirmation modal
  const handleOpenDeleteModal = (col: Collection) => {
    setDeletingCollection(col);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCollection) return;
    setIsSubmittingDelete(true);
    try {
      await dbService.deleteCollection(deletingCollection.id);
      setCollections(prev => prev.filter(c => c.id !== deletingCollection.id));
      setIsDeleteModalOpen(false);
      setDeletingCollection(null);
    } catch (err: any) {
      console.error('Error deleting collection:', err);
      alert(language === 'pt' ? 'Erro ao excluir agendamento: ' + (err?.message || '') : 'Error deleting collection schedule.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Carregando programação de coletas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5">
            <Calendar className="text-[#2098D1]" size={28} />
            {t('collections.title', 'Programação e Agendamento de Coletas')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'pt'
              ? 'Visualize, edite e gerencie as coletas agendadas por data, gerador, tipo de veículo ou material.'
              : 'View, edit and manage scheduled collections by date, generator, vehicle or material.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Chronological Sort Toggle Button */}
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              sortOrder === 'asc'
                ? 'bg-[#EBF7FA] text-[#2098D1] border-[#CCEAF1] shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
            title={language === 'pt' ? 'Alternar ordem cronológica' : 'Toggle chronological order'}
          >
            <ArrowUpDown size={14} className={sortOrder === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            <span>
              {sortOrder === 'asc' 
                ? (language === 'pt' ? 'Mais próximas primeiro' : 'Closest date first') 
                : (language === 'pt' ? 'Mais distantes primeiro' : 'Furthest date first')}
            </span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{language === 'pt' ? 'Total Agendadas' : 'Total Scheduled'}</span>
            <Calendar size={18} className="text-[#2098D1]" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            {visibleCollections.filter(c => c.status === 'SCHEDULED').length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{language === 'pt' ? 'Em Trânsito' : 'In Transit'}</span>
            <Truck size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {visibleCollections.filter(c => c.status === 'IN_TRANSIT').length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{language === 'pt' ? 'Concluídas' : 'Completed'}</span>
            <FileCheck size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {visibleCollections.filter(c => c.status === 'COMPLETED').length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{language === 'pt' ? 'Canceladas' : 'Cancelled'}</span>
            <X size={18} className="text-rose-400" />
          </div>
          <p className="text-2xl font-black text-slate-500 mt-1">
            {visibleCollections.filter(c => c.status === 'CANCELLED').length}
          </p>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="p-4 space-y-3 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <Filter size={15} className="text-[#2098D1]" />
            <span>{language === 'pt' ? 'Filtros de Pesquisa' : 'Search Filters'}</span>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2098D1] text-white">
                {filteredAndSortedCollections.length} {language === 'pt' ? 'encontradas' : 'found'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>{language === 'pt' ? 'Limpar filtros' : 'Reset filters'}</span>
              </button>
            )}

            <button
              onClick={() => setIsFiltersOpen(prev => !prev)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2098D1] hover:underline cursor-pointer"
            >
              {isFiltersOpen ? (
                <>
                  <ChevronUp size={14} />
                  <span>{language === 'pt' ? 'Ocultar filtros' : 'Hide filters'}</span>
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  <span>{language === 'pt' ? 'Mostrar filtros' : 'Show filters'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Inputs Area */}
        {isFiltersOpen && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Row 1: Search, Status, Material, Vehicle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Gerador / Empresa Search */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'pt' ? 'Gerador / Empresa' : 'Generator / Company'}
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={language === 'pt' ? 'Buscar gerador, CNPJ...' : 'Search generator...'}
                    className="w-full pl-8.5 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Status da Coleta */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'pt' ? 'Status da Coleta' : 'Collection Status'}
                </label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium cursor-pointer"
                >
                  <option value="ALL">{language === 'pt' ? 'Todos os status' : 'All statuses'}</option>
                  <option value="SCHEDULED">{language === 'pt' ? 'Agendada' : 'Scheduled'}</option>
                  <option value="IN_TRANSIT">{language === 'pt' ? 'Em Trânsito' : 'In Transit'}</option>
                  <option value="COMPLETED">{language === 'pt' ? 'Concluída' : 'Completed'}</option>
                  <option value="CANCELLED">{language === 'pt' ? 'Cancelada' : 'Cancelled'}</option>
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'pt' ? 'Material' : 'Material'}
                </label>
                <select
                  value={materialFilter}
                  onChange={e => setMaterialFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium cursor-pointer"
                >
                  <option value="ALL">{language === 'pt' ? 'Todos os materiais' : 'All materials'}</option>
                  {availableMaterials.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              {/* Veículo / Transporte */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'pt' ? 'Tipo de Veículo / Transporte' : 'Vehicle / Transport Type'}
                </label>
                <select
                  value={vehicleFilter}
                  onChange={e => setVehicleFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium cursor-pointer"
                >
                  <option value="ALL">{language === 'pt' ? 'Todos os transportes' : 'All transports'}</option>
                  {availableVehicles.map(veh => (
                    <option key={veh} value={veh}>{veh}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Row 2: Date Period (De / Até) */}
            <div className="flex flex-wrap items-end gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <CalendarRange size={14} className="text-[#2098D1]" />
                <span>{language === 'pt' ? 'Período da Coleta:' : 'Collection Period:'}</span>
              </div>

              <div className="flex items-center gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">{language === 'pt' ? 'De' : 'From'}</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">{language === 'pt' ? 'Até' : 'To'}</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Collections list */}
      <Card className="overflow-hidden !p-0 border border-slate-200 dark:border-slate-800 shadow-sm">
        {filteredAndSortedCollections.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <p className="font-semibold">
              {hasActiveFilters 
                ? (language === 'pt' ? 'Nenhuma coleta encontrada com os filtros selecionados.' : 'No collections match the selected filters.')
                : (language === 'pt' ? 'Nenhuma coleta cadastrada para o seu usuário.' : 'No collections registered for your account.')}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-[#2098D1] hover:underline font-bold cursor-pointer"
              >
                {language === 'pt' ? 'Limpar todos os filtros' : 'Clear all filters'}
              </button>
            )}
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
                  <th className="px-6 py-4 text-right">{t('suppliers.actions', 'Ações')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAndSortedCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#2098D1]" />
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
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Ação 1: EDITAR */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(col)}
                          className="gap-1.5 text-xs font-bold border-[#CCEAF1] hover:border-[#2098D1] text-[#2098D1] hover:bg-[#E5F5F8]"
                          title={language === 'pt' ? 'Editar Agendamento' : 'Edit Schedule'}
                        >
                          <Edit2 size={13} />
                          {language === 'pt' ? 'Editar' : 'Edit'}
                        </Button>

                        {/* Ação 2: EXCLUIR */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDeleteModal(col)}
                          className="gap-1.5 text-xs font-bold border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                          title={language === 'pt' ? 'Excluir Agendamento' : 'Delete Schedule'}
                        >
                          <Trash2 size={13} />
                          {language === 'pt' ? 'Excluir' : 'Delete'}
                        </Button>

                        {/* Ação 3: RECEBER NA BALANÇA / CONCLUÍDA */}
                        {col.status === 'SCHEDULED' || col.status === 'IN_TRANSIT' ? (
                          <Link href={`/recebimentos?collectionId=${col.id}`}>
                            <Button size="sm" className="gap-1.5 text-xs font-bold bg-[#2098D1] hover:bg-[#1b82b3] text-white shadow-xs">
                              <Scale size={14} />
                              {language === 'pt' ? 'Receber na Balança' : 'Weigh & Receive'}
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg">
                            <FileCheck size={14} />
                            {language === 'pt' ? 'Concluída' : 'Completed'}
                          </span>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: EDITAR AGENDAMENTO DE COLETA */}
      {editingCollection && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            if (!isSubmittingEdit) {
              setIsEditModalOpen(false);
              setEditingCollection(null);
            }
          }}
          title={language === 'pt' ? 'Editar Agendamento de Coleta' : 'Edit Collection Schedule'}
          size="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Gerador / Fornecedor */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Gerador / Fornecedor *' : 'Generator / Supplier *'}
                </label>
                <select
                  value={editSupplierId}
                  onChange={e => setEditSupplierId(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-semibold cursor-pointer"
                  required
                >
                  <option value="">{language === 'pt' ? 'Selecione o gerador...' : 'Select generator...'}</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code ? `[${s.code}] ` : ''}{s.name} {s.trade_name && s.trade_name !== s.name ? `(${s.trade_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data da Coleta */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar size={13} className="text-[#2098D1]" />
                  {language === 'pt' ? 'Data Prevista da Coleta *' : 'Scheduled Collection Date *'}
                </label>
                <input
                  type="date"
                  value={editScheduledDate}
                  onChange={e => setEditScheduledDate(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-semibold"
                  required
                />
              </div>

              {/* Status da Coleta */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Status da Coleta' : 'Collection Status'}
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as CollectionStatus)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-semibold cursor-pointer"
                >
                  <option value="SCHEDULED">{language === 'pt' ? 'Agendada' : 'Scheduled'}</option>
                  <option value="IN_TRANSIT">{language === 'pt' ? 'Em Trânsito' : 'In Transit'}</option>
                  <option value="COMPLETED">{language === 'pt' ? 'Concluída' : 'Completed'}</option>
                  <option value="CANCELLED">{language === 'pt' ? 'Cancelada' : 'Cancelled'}</option>
                </select>
              </div>

              {/* Veículo / Transporte */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Truck size={13} className="text-[#2098D1]" />
                  {language === 'pt' ? 'Tipo de Veículo / Transporte' : 'Vehicle / Transport Type'}
                </label>
                <select
                  value={editCarrierName}
                  onChange={e => setEditCarrierName(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium cursor-pointer"
                >
                  <option value="">{language === 'pt' ? 'Selecione ou deixe padrão...' : 'Select vehicle...'}</option>
                  {COMMON_VEHICLES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                {editCarrierName === 'Outro' && (
                  <input
                    type="text"
                    value={editCustomCarrierName}
                    onChange={e => setEditCustomCarrierName(e.target.value)}
                    placeholder={language === 'pt' ? 'Especifique o tipo de transporte...' : 'Specify transport type...'}
                    className="mt-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-[#2098D1] rounded-lg outline-none font-medium"
                    required
                  />
                )}
              </div>

              {/* Motorista */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <User size={13} className="text-slate-400" />
                  {language === 'pt' ? 'Motorista / Condutor' : 'Driver Name'}
                </label>
                <input
                  type="text"
                  value={editDriverName}
                  onChange={e => setEditDriverName(e.target.value)}
                  placeholder={language === 'pt' ? 'Ex: Carlos Souza' : 'Driver name...'}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium"
                />
              </div>

            </div>

            {/* Materiais e Volumes Previstos */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-[#2098D1]" />
                  {language === 'pt' ? 'Materiais / Volumes Previstos' : 'Expected Materials & Volumes'}
                </label>
                <button
                  type="button"
                  onClick={handleAddEditItem}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2098D1] hover:text-[#1883B5] bg-[#EBF7FA] hover:bg-[#D5EEF4] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={12} />
                  {language === 'pt' ? 'Adicionar Material' : 'Add Material'}
                </button>
              </div>

              <div className="space-y-2">
                {editItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-400 shrink-0">#{idx + 1}</span>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      {/* Material */}
                      <div className="flex flex-col gap-0.5">
                        <select
                          value={item.material_name}
                          onChange={e => handleUpdateEditItem(idx, 'material_name', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-[#2098D1] font-medium cursor-pointer"
                        >
                          {COMMON_MATERIALS.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        {item.material_name === 'Outro' && (
                          <input
                            type="text"
                            value={item.custom_material_name || ''}
                            onChange={e => handleUpdateEditItem(idx, 'custom_material_name', e.target.value)}
                            placeholder={language === 'pt' ? 'Especifique o material...' : 'Specify material...'}
                            className="mt-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-[#2098D1] rounded-md outline-none"
                            required
                          />
                        )}
                      </div>

                      {/* Volume & Unidade */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={item.estimated_volume}
                          onChange={e => handleUpdateEditItem(idx, 'estimated_volume', e.target.value)}
                          placeholder={language === 'pt' ? 'Volume (ex: 500)' : 'Volume'}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-[#2098D1] font-medium"
                        />
                        <select
                          value={item.unit}
                          onChange={e => handleUpdateEditItem(idx, 'unit', e.target.value)}
                          className="w-20 px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-[#2098D1] font-medium cursor-pointer"
                        >
                          <option value="kg">kg</option>
                          <option value="ton">ton</option>
                          <option value="un">un</option>
                          <option value="m³">m³</option>
                        </select>
                      </div>
                    </div>

                    {editItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEditItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
                        title={language === 'pt' ? 'Remover este material' : 'Remove material'}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="pt-2 flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Observações e Instruções da Coleta' : 'Collection Notes & Instructions'}
              </label>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                rows={2}
                placeholder={language === 'pt' ? 'Observações sobre portaria, horários ou restrições...' : 'Notes...'}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] font-medium resize-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCollection(null);
                }}
                disabled={isSubmittingEdit}
              >
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                isLoading={isSubmittingEdit}
                className="bg-[#2098D1] hover:bg-[#1b82b3] text-white font-bold"
              >
                {language === 'pt' ? 'Salvar Alterações' : 'Save Changes'}
              </Button>
            </div>

          </form>
        </Modal>
      )}

      {/* Modal: CONFIRMAÇÃO DE EXCLUSÃO */}
      {deletingCollection && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!isSubmittingDelete) {
              setIsDeleteModalOpen(false);
              setDeletingCollection(null);
            }
          }}
          title={language === 'pt' ? 'Confirmar Exclusão de Agendamento' : 'Confirm Collection Deletion'}
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-900">
              <AlertTriangle size={22} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-950">
                  {language === 'pt' ? 'Tem certeza que deseja excluir este agendamento?' : 'Are you sure you want to delete this schedule?'}
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {language === 'pt'
                    ? 'Esta ação removerá apenas o agendamento desta coleta. Os dados do gerador, materiais e documentos permanecerão intactos.'
                    : 'This action will only remove the collection schedule. The generator, materials and document data will remain intact.'}
                </p>
              </div>
            </div>

            {/* Resumo da Coleta */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">{language === 'pt' ? 'Gerador:' : 'Generator:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {deletingCollection.supplier?.name || 'Gerador'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">{language === 'pt' ? 'Data Prevista:' : 'Scheduled Date:'}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatDate(deletingCollection.scheduled_date)}
                </span>
              </div>
              {deletingCollection.carrier_name && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">{language === 'pt' ? 'Transporte:' : 'Transport:'}</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {deletingCollection.carrier_name}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingCollection(null);
                }}
                disabled={isSubmittingDelete}
              >
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                isLoading={isSubmittingDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 shadow-xs"
              >
                <Trash2 size={14} />
                {language === 'pt' ? 'Excluir' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
