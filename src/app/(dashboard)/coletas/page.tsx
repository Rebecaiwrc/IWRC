'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  X,
  Layers,
  CalendarRange,
  ArrowUpDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

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
          const codeMatch = sup?.code?.toLowerCase().includes(query);
          const docMatch = sup?.document?.toLowerCase().includes(query);
          const driverMatch = col.driver_name?.toLowerCase().includes(query);
          const carrierMatch = col.carrier_name?.toLowerCase().includes(query);
          if (!nameMatch && !tradeMatch && !codeMatch && !docMatch && !driverMatch && !carrierMatch) {
            return false;
          }
        }

        // 2. Date Period (Start Date & End Date)
        if (startDate && col.scheduled_date) {
          if (col.scheduled_date < startDate) return false;
        }
        if (endDate && col.scheduled_date) {
          if (col.scheduled_date > endDate) return false;
        }

        // 3. Status Filter
        if (statusFilter !== 'ALL') {
          if (col.status !== statusFilter) return false;
        }

        // 4. Vehicle / Transport Filter
        if (vehicleFilter !== 'ALL') {
          const vQuery = vehicleFilter.toLowerCase();
          const carrierMatch = col.carrier_name?.toLowerCase().includes(vQuery);
          const driverMatch = col.driver_name?.toLowerCase().includes(vQuery);
          const logTransportMatch = sup?.logistics_analyses?.[0]?.transport_type?.toLowerCase().includes(vQuery);
          if (!carrierMatch && !driverMatch && !logTransportMatch) return false;
        }

        // 5. Material Filter
        if (materialFilter !== 'ALL') {
          const mQuery = materialFilter.toLowerCase();
          const hasMaterial = (col.items || []).some(item => 
            item.material_name?.toLowerCase().includes(mQuery)
          );
          if (!hasMaterial) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = a.scheduled_date ? new Date(a.scheduled_date + 'T00:00:00').getTime() : (sortOrder === 'asc' ? 9999999999999 : -9999999999999);
        const timeB = b.scheduled_date ? new Date(b.scheduled_date + 'T00:00:00').getTime() : (sortOrder === 'asc' ? 9999999999999 : -9999999999999);
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [visibleCollections, suppliers, searchQuery, startDate, endDate, statusFilter, vehicleFilter, materialFilter, sortOrder]);

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
            {t('collections.subtitle', 'Acompanhe as coletas programadas organizadas cronologicamente e realize o recebimento dos materiais.')}
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

      {/* FILTERS PANEL (COLLAPSIBLE) */}
      <Card className="p-4 border border-[#CCEAF1] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3.5 transition-all">
        {/* Header Bar */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${isFiltersOpen ? 'border-b border-slate-100 dark:border-slate-800/60 pb-3' : ''}`}>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#0D2439] dark:text-slate-200 uppercase tracking-wider">
              <Filter size={15} className="text-[#2098D1]" />
              <span>{language === 'pt' ? 'Filtros de Pesquisa' : 'Search Filters'}</span>
            </div>

            <span className="text-[11px] font-bold text-slate-600 bg-[#EAF7FA] px-2.5 py-0.5 rounded-full border border-[#CCEAF1]">
              {filteredAndSortedCollections.length} {filteredAndSortedCollections.length === 1 ? (language === 'pt' ? 'coleta' : 'collection') : (language === 'pt' ? 'coletas' : 'collections')}
            </span>

            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                ● {language === 'pt' ? 'Filtros aplicados' : 'Filters applied'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Interactive Sort Toggle in Compact / Expanded Bar */}
            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2098D1] hover:text-[#1783B5] bg-[#EAF7FA] hover:bg-[#DDF4F9] px-3 py-1.5 rounded-xl border border-[#CCEAF1] transition-all cursor-pointer shadow-xs active:scale-95"
              title={language === 'pt' ? 'Clique para alternar a ordenação por data' : 'Click to toggle date sort order'}
            >
              <ArrowUpDown size={13} />
              <span>
                {sortOrder === 'asc' 
                  ? (language === 'pt' ? 'Mais próxima primeiro' : 'Closest date first')
                  : (language === 'pt' ? 'Mais distante primeiro' : 'Furthest date first')}
              </span>
              <span className="text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-500 px-1 rounded border border-[#CCEAF1]">
                {sortOrder === 'asc' ? '↑ Próximas' : '↓ Futuras'}
              </span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                title={language === 'pt' ? 'Resetar todos os filtros' : 'Reset all filters'}
              >
                <RotateCcw size={13} />
                <span>{language === 'pt' ? 'Limpar filtros' : 'Clear filters'}</span>
              </button>
            )}

            {/* Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFiltersOpen(prev => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
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
                  <th className="px-6 py-4 text-right">{t('suppliers.actions', 'Ação')}</th>
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
