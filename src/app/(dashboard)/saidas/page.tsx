'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { dbService } from '@/features/shared/services/dbService';
import { MaterialDispatch, DispatchDestinationType, Receipt, Supplier } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import {
  formatDate,
  formatVolume,
  formatCurrency,
  translateDestinationType
} from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  PackageCheck,
  Search,
  Plus,
  Trash2,
  Calendar,
  Truck,
  Building2,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Boxes,
  Printer,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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

export default function SaidasPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();

  const [dispatches, setDispatches] = useState<MaterialDispatch[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Indicators visibility toggle
  const [showIndicators, setShowIndicators] = useState(true);

  // Financial values privacy toggle for Admin
  const [hideFinancialValues, setHideFinancialValues] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDispatchForPrint, setSelectedDispatchForPrint] = useState<MaterialDispatch | null>(null);

  // Form State
  const [form, setForm] = useState<{
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

  const isBuyer = currentUser?.role === 'BUYER';
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const canManageDispatches = currentUser?.role === 'LOGISTICS' || isAdmin;

  const isResponsibleForSupplier = useCallback((s?: Supplier | null) => {
    if (!s || !currentUser) return false;
    if (!isBuyer) return true; // Admins and Logistics see everything
    return (
      s.internal_responsible_id === currentUser.id ||
      s.responsible?.id === currentUser.id ||
      (s.responsible?.email && currentUser.email && s.responsible.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (s.responsible?.name && currentUser.name && s.responsible.name.toLowerCase() === currentUser.name.toLowerCase()) ||
      (s.lead_source && currentUser.name && s.lead_source.toLowerCase().includes(currentUser.name.toLowerCase()))
    );
  }, [currentUser, isBuyer]);

  const fetchData = useCallback(async () => {
    try {
      const [d, r, s] = await Promise.all([
        dbService.getMaterialDispatches(),
        dbService.getReceipts(),
        dbService.getSuppliers()
      ]);
      setDispatches(d);
      setReceipts(r);
      setSuppliers(s);
    } catch (err) {
      console.error('Error loading dispatches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Strategic Hub Balance Calculations
  const totalReceivedKg = useMemo(() => {
    return receipts
      .filter(r => {
        const sup = r.supplier || suppliers.find(s => s.id === r.supplier_id);
        return isResponsibleForSupplier(sup);
      })
      .reduce((acc, r) => {
        const net = r.items ? r.items.reduce((sum, it) => sum + (Number(it.weight_kg) || 0), 0) : 0;
        return acc + net;
      }, 0);
  }, [receipts, suppliers, isResponsibleForSupplier]);

  const totalDispatchedKg = useMemo(() => {
    return dispatches.reduce((acc, d) => acc + (Number(d.quantity_kg) || 0), 0);
  }, [dispatches]);

  const totalRevenue = useMemo(() => {
    if (!isAdmin) return 0;
    return dispatches.reduce((acc, d) => acc + (Number(d.total_value) || 0), 0);
  }, [dispatches, isAdmin]);

  const currentHubBalanceKg = Math.max(0, totalReceivedKg - totalDispatchedKg);
  const avgPricePerKg = totalDispatchedKg > 0 && isAdmin ? (totalRevenue / totalDispatchedKg) : 0;

  // Filtered Dispatches List
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(d => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || (
        d.buyer_name.toLowerCase().includes(q) ||
        (d.buyer_document && d.buyer_document.toLowerCase().includes(q)) ||
        d.material_name.toLowerCase().includes(q) ||
        (d.invoice_number && d.invoice_number.toLowerCase().includes(q)) ||
        (d.mtr_number && d.mtr_number.toLowerCase().includes(q)) ||
        (d.carrier_name && d.carrier_name.toLowerCase().includes(q)) ||
        (d.driver_name && d.driver_name.toLowerCase().includes(q))
      );

      const matchesDest = destinationFilter === 'ALL' || d.destination_type === destinationFilter;
      const matchesMat = materialFilter === 'ALL' || d.material_name.toLowerCase().includes(materialFilter.toLowerCase());

      return matchesSearch && matchesDest && matchesMat;
    });
  }, [dispatches, searchTerm, destinationFilter, materialFilter]);

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageDispatches) {
      alert(language === 'pt' ? 'Apenas a equipe de Logística e Administradores podem registrar saídas de materiais do Hub.' : 'Only Logistics and Administrators can register material dispatches.');
      return;
    }

    if (!form.buyer_name || !form.quantity_kg) {
      alert(language === 'pt' ? 'Preencha o comprador e a quantidade de material.' : 'Please fill in buyer and quantity.');
      return;
    }

    const finalMaterial = (form.material_name === 'Outros' && form.custom_material_name.trim())
      ? form.custom_material_name.trim()
      : form.material_name;

    try {
      setIsSubmitting(true);
      await dbService.createMaterialDispatch({
        buyer_name: form.buyer_name,
        buyer_document: form.buyer_document || null,
        material_name: finalMaterial || 'Material Geral',
        quantity_kg: Number(form.quantity_kg) || 0,
        unit_price: isAdmin ? (Number(form.unit_price) || 0) : 0,
        total_value: isAdmin 
          ? (Number(form.total_value) || (Number(form.quantity_kg) * Number(form.unit_price))) 
          : 0,
        dispatch_date: form.dispatch_date,
        invoice_number: form.invoice_number || null,
        mtr_number: form.mtr_number || null,
        carrier_name: form.carrier_name || null,
        vehicle_plate: form.vehicle_plate || null,
        driver_name: form.driver_name || null,
        destination_type: form.destination_type,
        notes: form.notes || null,
        created_by: currentUser?.id || null
      });

      setIsModalOpen(false);
      setForm({
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
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao registrar saída: ${err.message || 'Falha ao salvar'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDispatch = async (id: string, buyer: string) => {
    if (!canManageDispatches) {
      alert(language === 'pt' ? 'Apenas a equipe de Logística e Administradores podem excluir saídas de materiais.' : 'Only Logistics and Administrators can delete material dispatches.');
      return;
    }

    if (!confirm(language === 'pt' ? `Deseja realmente excluir a saída para "${buyer}"?` : `Do you really want to delete dispatch for "${buyer}"?`)) return;
    try {
      await dbService.deleteMaterialDispatch(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(language === 'pt' ? 'Erro ao excluir saída.' : 'Error deleting dispatch.');
    }
  };

  const handlePrintManifest = (disp: MaterialDispatch) => {
    setSelectedDispatchForPrint(disp);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-[#C8EEF5] border-t-[#2098D1] rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#146482]">
          {language === 'pt' ? 'Carregando módulo de Saídas do Hub...' : 'Loading Hub Dispatches module...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2.5">
            <TrendingUp size={28} className="text-purple-600" />
            {language === 'pt' ? 'Saídas de Materiais & Vendas do Hub' : 'Hub Material Dispatches & Outbound Sales'}
          </h1>

          {/* Toggle Indicators Button */}
          <button
            type="button"
            onClick={() => setShowIndicators(prev => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
            title={showIndicators ? (language === 'pt' ? 'Recolher todos os indicadores' : 'Hide all indicators') : (language === 'pt' ? 'Mostrar indicadores' : 'Show indicators')}
          >
            {showIndicators ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{showIndicators ? (language === 'pt' ? 'Ocultar indicadores' : 'Hide metrics') : (language === 'pt' ? 'Mostrar indicadores' : 'Show metrics')}</span>
          </button>
        </div>

        {/* Action Button */}
        {canManageDispatches && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-lg shadow-purple-600/20 rounded-xl cursor-pointer"
            >
              <Plus size={16} />
              {language === 'pt' ? 'Registrar Saída de Material' : 'Register Outbound Dispatch'}
            </Button>
          </div>
        )}
      </div>

      {/* Strategic Hub Balance Overview (Collapsible Row) */}
      {showIndicators && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 animate-fadeIn`}>
          
          {/* Total Recebido (Entradas) */}
          <Card className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 text-[#2098D1] rounded-2xl flex items-center justify-center shrink-0">
              <ArrowDownLeft size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {language === 'pt' ? 'Entradas no Hub (Recebido)' : 'Hub Inbound (Received)'}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatVolume(totalReceivedKg, 'kg')}
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">
                {(totalReceivedKg / 1000).toFixed(2)} ton registradas
              </span>
            </div>
          </Card>

          {/* Total Expedido (Saídas) */}
          <Card className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {language === 'pt' ? 'Saídas / Vendas Expedidas' : 'Dispatched / Sold'}
              </p>
              <h3 className="text-xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
                {formatVolume(totalDispatchedKg, 'kg')}
              </h3>
              <span className="text-[10px] text-purple-500 font-semibold">
                {dispatches.length} {language === 'pt' ? 'cargas expedidas' : 'loads shipped'}
              </span>
            </div>
          </Card>

          {/* Saldo Físico em Galpão */}
          <Card className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="h-12 w-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
              <Boxes size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {language === 'pt' ? 'Saldo Atual em Galpão' : 'Warehouse Inventory Balance'}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatVolume(currentHubBalanceKg, 'kg')}
              </h3>
              <span className="text-[10px] text-amber-600 font-semibold">
                {(currentHubBalanceKg / 1000).toFixed(2)} ton disponíveis
              </span>
            </div>
          </Card>

          {/* Faturamento Total com Vendas (EXCLUSIVO PARA ADMIN/GESTÃO) */}
          {isAdmin && (
            <Card className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider truncate">
                    {language === 'pt' ? 'Faturamento Total de Saídas' : 'Total Dispatches Revenue'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setHideFinancialValues(prev => !prev)}
                    className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title={hideFinancialValues ? (language === 'pt' ? 'Mostrar valores' : 'Show values') : (language === 'pt' ? 'Ocultar valores' : 'Hide values')}
                  >
                    {hideFinancialValues ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>

                <h3 className="text-xl font-black text-emerald-600 mt-0.5 truncate">
                  {hideFinancialValues ? 'R$ ••••••••' : formatCurrency(totalRevenue)}
                </h3>
                <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                  {hideFinancialValues ? '•••• / kg médio' : `${formatCurrency(avgPricePerKg)} / kg médio`}
                </span>
              </div>
            </Card>
          )}

        </div>
      )}

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'pt' ? 'Buscar comprador, CNPJ, material, NF-e, MTR...' : 'Search buyer, tax ID, material, invoice, MTR...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Destination Type Filter */}
          <select
            value={destinationFilter}
            onChange={e => setDestinationFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-medium cursor-pointer"
          >
            <option value="ALL">{language === 'pt' ? 'Todas as Destinações' : 'All Destinations'}</option>
            {DISPATCH_DESTINATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Material Filter */}
          <select
            value={materialFilter}
            onChange={e => setMaterialFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-medium cursor-pointer"
          >
            <option value="ALL">{language === 'pt' ? 'Todos os Materiais' : 'All Materials'}</option>
            {DISPATCH_MATERIAL_OPTIONS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

        </div>

        <span className="text-xs font-semibold text-slate-400 shrink-0">
          {filteredDispatches.length} {language === 'pt' ? 'expedições listadas' : 'dispatches listed'}
        </span>
      </div>

      {/* Dispatches Table */}
      <Card className="overflow-hidden !p-0 border border-slate-200 dark:border-slate-800 shadow-sm">
        {filteredDispatches.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <TrendingUp size={44} className="mx-auto text-purple-300 opacity-60" />
            <p className="font-bold text-base text-slate-700 dark:text-slate-200">
              {language === 'pt' ? 'Nenhuma saída de material registrada.' : 'No material dispatches recorded yet.'}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {language === 'pt' 
                ? 'Utilize o botão "Registrar Saída de Material" para lançar vendas de fardos, transferências para recicladores e comprovações de MTR.'
                : 'Click "Register Outbound Dispatch" to record bale sales, transfers to recyclers, and MTR proofs.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">{language === 'pt' ? 'Data da Saída' : 'Dispatch Date'}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'Comprador / Destinatário' : 'Buyer / Destination'}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'Material Expedido' : 'Material'}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'Peso Líquido (kg)' : 'Net Weight (kg)'}</th>
                  {isAdmin && (
                    <th className="px-6 py-4">{language === 'pt' ? 'Preço e Total (R$)' : 'Price & Total (R$)'}</th>
                  )}
                  <th className="px-6 py-4">{language === 'pt' ? 'NF-e & MTR' : 'Invoice & MTR'}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'Transporte' : 'Transport'}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'Destinação' : 'Destination'}</th>
                  <th className="px-6 py-4 text-right">{language === 'pt' ? 'Ações' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDispatches.map(disp => (
                  <tr key={disp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/20 transition-colors">
                    
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-purple-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white">{formatDate(disp.dispatch_date)}</span>
                      </div>
                    </td>

                    {/* Buyer */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white leading-snug">{disp.buyer_name}</span>
                        {disp.buyer_document && (
                          <span className="text-[11px] font-mono text-slate-400">{disp.buyer_document}</span>
                        )}
                      </div>
                    </td>

                    {/* Material */}
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="inline-block bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 font-bold">
                        {disp.material_name}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-4 whitespace-nowrap font-black text-slate-900 dark:text-white">
                      {formatVolume(disp.quantity_kg, 'kg')}
                    </td>

                    {/* Value (Admin Only) */}
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-black text-emerald-600 block text-sm">
                          {hideFinancialValues ? 'R$ •••••' : formatCurrency(disp.total_value)}
                        </span>
                        {!hideFinancialValues && disp.unit_price ? (
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {formatCurrency(disp.unit_price)} / kg
                          </span>
                        ) : null}
                      </td>
                    )}

                    {/* NF-e and MTR */}
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

                    {/* Transport info */}
                    <td className="px-6 py-4 text-xs text-slate-500 space-y-0.5">
                      <p className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Truck size={13} className="text-slate-400" />
                        {disp.carrier_name || (language === 'pt' ? 'Frota do Comprador' : 'Buyer Fleet')}
                      </p>
                      {(disp.driver_name || disp.vehicle_plate) && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          {[disp.driver_name, disp.vehicle_plate].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </td>

                    {/* Destination Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={disp.destination_type === 'sale' ? 'emerald' : disp.destination_type === 'recycler' ? 'info' : 'purple'}>
                        {translateDestinationType(disp.destination_type, language)}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePrintManifest(disp)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors cursor-pointer"
                          title={language === 'pt' ? 'Imprimir Romaneio de Expedição' : 'Print Dispatch Manifest'}
                        >
                          <Printer size={15} />
                        </button>

                        {canManageDispatches && (
                          <button
                            onClick={() => handleDeleteDispatch(disp.id, disp.buyer_name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                            title={language === 'pt' ? 'Excluir Saída' : 'Delete Dispatch'}
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* Registration Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={language === 'pt' ? 'Registrar Saída de Material (Expedição / Venda do Hub)' : 'Register Outbound Material Dispatch'}
          size="lg"
        >
          <form onSubmit={handleSaveDispatch} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={language === 'pt' ? 'Comprador / Destinatário (Razão Social ou Nome) *' : 'Buyer / Destination Name *'}
                value={form.buyer_name}
                onChange={e => setForm(p => ({ ...p, buyer_name: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: Recicladora Paulistana Ltda' : 'E.g. Paulistana Recycling Ltd'}
                required
              />

              <Input
                label={language === 'pt' ? 'CNPJ / CPF do Comprador' : 'Buyer CNPJ / Tax ID'}
                value={form.buyer_document}
                onChange={e => setForm(p => ({ ...p, buyer_document: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Tipo de Destinação *' : 'Destination Type *'}
                </label>
                <select
                  value={form.destination_type}
                  onChange={e => setForm(p => ({ ...p, destination_type: e.target.value as DispatchDestinationType }))}
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
                  value={form.material_name}
                  onChange={e => setForm(p => ({ ...p, material_name: e.target.value }))}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  {DISPATCH_MATERIAL_OPTIONS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {form.material_name === 'Outros' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Digite o nome do material...' : 'Type material name...'}
                    value={form.custom_material_name}
                    onChange={e => setForm(p => ({ ...p, custom_material_name: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-purple-400 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                )}
              </div>
            </div>

            <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} gap-3`}>
              <Input
                label={language === 'pt' ? 'Quantidade / Peso Líquido (kg) *' : 'Quantity / Net Weight (kg) *'}
                type="number"
                value={form.quantity_kg}
                onChange={e => {
                  const qty = e.target.value;
                  const price = form.unit_price;
                  const autoTotal = (Number(qty) || 0) * (Number(price) || 0);
                  setForm(p => ({ 
                    ...p, 
                    quantity_kg: qty, 
                    total_value: autoTotal > 0 ? autoTotal.toFixed(2) : p.total_value 
                  }));
                }}
                placeholder="Ex: 5000"
                required
              />

              {isAdmin && (
                <>
                  <Input
                    label={language === 'pt' ? 'Preço Unitário (R$/kg)' : 'Unit Price (R$/kg)'}
                    type="number"
                    step="0.01"
                    value={form.unit_price}
                    onChange={e => {
                      const price = e.target.value;
                      const qty = form.quantity_kg;
                      const autoTotal = (Number(qty) || 0) * (Number(price) || 0);
                      setForm(p => ({ 
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
                    value={form.total_value}
                    onChange={e => setForm(p => ({ ...p, total_value: e.target.value }))}
                    placeholder="Ex: 4250.00"
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label={language === 'pt' ? 'Data da Saída *' : 'Dispatch Date *'}
                type="date"
                value={form.dispatch_date}
                onChange={e => setForm(p => ({ ...p, dispatch_date: e.target.value }))}
                required
              />

              <Input
                label={language === 'pt' ? 'Número da NF-e' : 'Invoice Number (NF-e)'}
                value={form.invoice_number}
                onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))}
                placeholder="Ex: 001.234"
              />

              <Input
                label={language === 'pt' ? 'Número do MTR' : 'MTR Number'}
                value={form.mtr_number}
                onChange={e => setForm(p => ({ ...p, mtr_number: e.target.value }))}
                placeholder="Ex: MTR-2026-889"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label={language === 'pt' ? 'Transportadora / Veículo' : 'Carrier'}
                value={form.carrier_name}
                onChange={e => setForm(p => ({ ...p, carrier_name: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: TransLog Sorocaba' : 'E.g. TransLog'}
              />

              <Input
                label={language === 'pt' ? 'Placa do Veículo' : 'Vehicle Plate'}
                value={form.vehicle_plate}
                onChange={e => setForm(p => ({ ...p, vehicle_plate: e.target.value }))}
                placeholder="ABC-1D23"
              />

              <Input
                label={language === 'pt' ? 'Nome do Motorista' : 'Driver Name'}
                value={form.driver_name}
                onChange={e => setForm(p => ({ ...p, driver_name: e.target.value }))}
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Observações Gerais da Expedição' : 'Dispatch Notes'}
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: Carga enfardada, carregamento realizado pela doca 2...' : 'E.g. Baled load, loaded at dock 2...'}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-purple-500 min-h-[60px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
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
