'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { dbService } from '@/features/shared/services/dbService';
import { Supplier, Collection, Receipt } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { formatDate, formatVolume } from '@/lib/utils';
import { Scale, Building2, Calendar, ClipboardCheck, Plus, Trash2, ShieldCheck, UserCheck } from 'lucide-react';

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

export const PACKAGING_UNIT_OPTIONS = [
  { value: 'fardos', label: 'Fardos' },
  { value: 'paletes', label: 'Paletes' },
  { value: 'sacos', label: 'Sacos / Sacarias' },
  { value: 'big bags', label: 'Big Bags' },
  { value: 'caixas', label: 'Caixas' },
  { value: 'caçamba', label: 'Caçamba' },
  { value: 'tambores', label: 'Tambores / Bombonas' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'granel', label: 'Granel' },
  { value: 'Outros', label: 'Outros (digitar embalagem)' }
];

export default function ReceiptsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  
  const targetCollectionId = searchParams.get('collectionId');

  // Data state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // Weigh items state
  const [weighItems, setWeighItems] = useState<{
    material_name: string;
    custom_material_name?: string;
    quantity: string;
    unit: string;
    custom_unit?: string;
    weight_kg: string;
    notes: string;
  }[]>([]);

  const fetchData = async () => {
    try {
      const s = await dbService.getSuppliers();
      const c = await dbService.getCollections();
      const r = await dbService.getReceipts();
      setSuppliers(s);
      setCollections(c);
      setReceipts(r);

      // Handle redirect from collection page
      if (targetCollectionId) {
        const targetCol = c.find(col => col.id === targetCollectionId);
        if (targetCol) {
          setSelectedSupplierId(targetCol.supplier_id);
          setSelectedCollectionId(targetCol.id);
          
          // Pre-fill materials from collection
          const items = targetCol.items || [];
          setWeighItems(items.map(item => ({
            material_name: item.material_name,
            custom_material_name: '',
            quantity: '',
            unit: 'fardos',
            custom_unit: '',
            weight_kg: '',
            notes: ''
          })));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetCollectionId]);

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

  const isGeradorConfirmed = (s: Supplier) => {
    const activeLogistics = s.logistics_analyses?.[0];
    const isLogisticsEligible = Boolean(
      activeLogistics && 
      activeLogistics.feasibility && 
      (activeLogistics.feasibility === 'FEASIBLE' || activeLogistics.feasibility === 'NEED_INFO')
    );
    const isStageConfirmed = ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage);
    const hasCollections = Boolean(s.collections && s.collections.length > 0);

    return isLogisticsEligible || isStageConfirmed || hasCollections;
  };

  const visibleSuppliers = suppliers
    .filter(s => isResponsibleForSupplier(s))
    .filter(s => isGeradorConfirmed(s));

  const visibleCollections = collections.filter(c => {
    const sup = c.supplier || suppliers.find(s => s.id === c.supplier_id);
    return isResponsibleForSupplier(sup);
  });

  const visibleReceipts = receipts.filter(r => {
    const sup = r.supplier || suppliers.find(s => s.id === r.supplier_id);
    return isResponsibleForSupplier(sup);
  });

  // Selected supplier declared materials
  const selectedSupplier = visibleSuppliers.find(s => s.id === selectedSupplierId);
  const declaredMaterials = selectedSupplier?.materials?.map(m => m.material_name) || [];

  // Handle supplier change to update collections list
  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setSelectedCollectionId('');
    
    // If supplier has declared materials, pre-seed one row
    const sup = visibleSuppliers.find(s => s.id === supplierId);
    if (sup?.materials && sup.materials.length > 0) {
      setWeighItems([{
        material_name: sup.materials[0].material_name,
        custom_material_name: '',
        quantity: '',
        unit: 'fardos',
        custom_unit: '',
        weight_kg: '',
        notes: ''
      }]);
    } else {
      setWeighItems([]);
    }
  };

  // Handle collection selection to pre-fill materials
  const handleCollectionChange = (colId: string) => {
    setSelectedCollectionId(colId);
    if (!colId) {
      setWeighItems([]);
      return;
    }
    const col = visibleCollections.find(c => c.id === colId);
    if (col && col.items) {
      setWeighItems(col.items.map(item => ({
        material_name: item.material_name,
        custom_material_name: '',
        quantity: '',
        unit: 'fardos',
        custom_unit: '',
        weight_kg: '',
        notes: ''
      })));
    }
  };

  // Manage weigh items list
  const handleAddWeighRow = () => {
    const defaultMat = declaredMaterials[0] || 'Papelão';
    setWeighItems(prev => [
      ...prev,
      { 
        material_name: defaultMat, 
        custom_material_name: '', 
        quantity: '', 
        unit: 'fardos', 
        custom_unit: '', 
        weight_kg: '', 
        notes: '' 
      }
    ]);
  };

  const handleRemoveWeighRow = (index: number) => {
    setWeighItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateWeighRow = (index: number, field: string, value: string) => {
    setWeighItems(prev => prev.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || weighItems.length === 0) {
      alert(language === 'pt' ? 'Selecione o fornecedor e insira pelo menos 1 material pesado.' : 'Select the supplier and insert at least 1 weighed material.');
      return;
    }

    // Validate rows
    const invalidRow = weighItems.find(r => {
      const matName = (r.material_name === 'Outro' && r.custom_material_name?.trim()) ? r.custom_material_name.trim() : r.material_name;
      return !matName || !r.weight_kg;
    });

    if (invalidRow) {
      alert(language === 'pt' ? 'Preencha o material e o peso líquido (kg) em todas as linhas.' : 'Please fill in material and net weight (kg) on all rows.');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsToSave = weighItems.map(row => {
        const finalName = (row.material_name === 'Outro' && row.custom_material_name?.trim())
          ? row.custom_material_name.trim()
          : row.material_name;
        
        const finalUnit = (row.unit === 'Outros' && row.custom_unit?.trim())
          ? row.custom_unit.trim()
          : (row.unit || 'fardos');

        return {
          material_name: finalName || 'Material Diverso',
          quantity: Number(row.quantity) || 0,
          unit: finalUnit,
          weight_kg: Number(row.weight_kg),
          notes: row.notes || null
        };
      });

      // 1. Save weighing receipt
      await dbService.createReceipt(
        {
          supplier_id: selectedSupplierId,
          collection_id: selectedCollectionId || null,
          received_date: receivedDate,
          notes: notes || null
        },
        itemsToSave
      );

      // 2. Add interaction log
      let list = '';
      itemsToSave.forEach(i => {
        list += `${i.material_name} (${i.weight_kg}kg - ${i.unit}), `;
      });
      await dbService.addSupplierInteraction({
        supplier_id: selectedSupplierId,
        user_id: currentUser?.id || 'd3b07384-d113-4e4e-9b2f-123456789013',
        type: 'internal_obs',
        description: `Balança: Carga recebida e pesada. Itens: ${list.slice(0, -2)}. Notas: ${notes || '-'}`
      });

      // Clear search and form
      setSelectedSupplierId('');
      setSelectedCollectionId('');
      setNotes('');
      setWeighItems([]);
      
      // Clean query parameter from URL
      if (targetCollectionId) {
        router.replace('/recebimentos');
      }

      await fetchData(); // reload lists
      alert(language === 'pt' ? 'Pesagem e recebimento registrados com sucesso!' : 'Weighing and receipt registered successfully!');
    } catch (err: any) {
      console.error(err);
      alert(`Falha ao salvar recebimento: ${err.message || err.details || 'Erro desconhecido.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter collections for selected supplier that are not completed
  const supplierCollections = visibleCollections.filter(
    c => c.supplier_id === selectedSupplierId && c.status !== 'COMPLETED'
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {t('receipts.title', 'Balança e Recebimento de Cargas')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('receipts.subtitle', 'Registro de pesagem de entrada, pesagem de saída, MTR digital e cálculo de peso líquido.')}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form registration */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
              <Scale size={16} className="text-emerald-600" />
              {language === 'pt' ? 'Lançamento de Pesagem' : 'Weighbridge Record Entry'}
            </h3>

            <form onSubmit={handleSaveReceipt} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableSelect
                  label={language === 'pt' ? 'Selecionar Gerador *' : 'Select Waste Generator *'}
                  placeholder={language === 'pt' ? 'Pesquise ou selecione o gerador...' : 'Search or select generator...'}
                  searchPlaceholder={language === 'pt' ? 'Digite Razão Social, CNPJ ou Cidade...' : 'Type company name, CNPJ or city...'}
                  value={selectedSupplierId}
                  onChange={(val) => handleSupplierChange(val)}
                  options={visibleSuppliers.map(s => ({
                    value: s.id,
                    label: s.name,
                    sublabel: [s.trade_name, s.document, s.address ? `${s.address.city}/${s.address.state}` : ''].filter(Boolean).join(' • '),
                    badge: s.supplier_type || undefined
                  }))}
                  disabled={!!targetCollectionId}
                  emptyText={language === 'pt' ? 'Nenhum gerador homologado encontrado' : 'No approved generators found'}
                />

                <Select
                  label={language === 'pt' ? 'Vincular a Coleta Programada (Opcional)' : 'Link to Scheduled Collection (Optional)'}
                  value={selectedCollectionId}
                  onChange={(e) => handleCollectionChange(e.target.value)}
                  options={[
                    { value: '', label: language === 'pt' ? 'Sem agendamento (Entrada direta)' : 'No schedule (Direct inbound)' },
                    ...supplierCollections.map(c => ({
                      value: c.id,
                      label: `${language === 'pt' ? 'Coleta para' : 'Collection for'} ${formatDate(c.scheduled_date)}`
                    }))
                  ]}
                  disabled={!selectedSupplierId || !!targetCollectionId}
                />

                <Input
                  label={language === 'pt' ? 'Data de Recebimento *' : 'Receipt Date *'}
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  required
                />
              </div>

              {/* Weigh Items Dynamic Form Block */}
              <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {language === 'pt' ? 'Detalhamento dos Pesos' : 'Weights Breakdown'}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddWeighRow}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                  >
                    <Plus size={14} />
                    {language === 'pt' ? 'Adicionar Item' : 'Add Item'}
                  </button>
                </div>

                {weighItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    {language === 'pt' 
                      ? 'Selecione um fornecedor ou clique em "Adicionar Item" para pesar resíduos.'
                      : 'Select a supplier or click "Add Item" to weigh materials.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weighItems.map((row, idx) => {
                      const isStd = MATERIAL_OPTIONS.includes(row.material_name);
                      const selectVal = isStd ? row.material_name : (row.material_name ? 'Outro' : '');

                      const isStdUnit = PACKAGING_UNIT_OPTIONS.some(u => u.value === row.unit && u.value !== 'Outros');
                      const unitSelectVal = isStdUnit ? row.unit : (row.unit ? 'Outros' : 'fardos');

                      return (
                        <div 
                          key={idx} 
                          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl relative"
                        >
                          {/* Material Selector */}
                          <div className="md:col-span-4 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                              {language === 'pt' ? 'Nome do Material *' : 'Material Name *'}
                            </label>
                            <select
                              value={selectVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'Outro') {
                                  handleUpdateWeighRow(idx, 'material_name', 'Outro');
                                  handleUpdateWeighRow(idx, 'custom_material_name', '');
                                } else {
                                  handleUpdateWeighRow(idx, 'material_name', val);
                                  handleUpdateWeighRow(idx, 'custom_material_name', '');
                                }
                              }}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                              required
                            >
                              <option value="">{language === 'pt' ? 'Selecione o material...' : 'Select material...'}</option>
                              {declaredMaterials.length > 0 && (
                                <optgroup label={language === 'pt' ? 'Materiais Declarados do Gerador' : 'Declared Materials'}>
                                  {declaredMaterials.map(m => (
                                    <option key={`decl-${m}`} value={m}>⭐ {m}</option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label={language === 'pt' ? 'Todos os Materiais' : 'All Materials'}>
                                {MATERIAL_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </optgroup>
                            </select>

                            {(row.material_name === 'Outro' || (!isStd && row.material_name !== '')) && (
                              <input
                                type="text"
                                placeholder={language === 'pt' ? 'Digite o nome do material...' : 'Type material name...'}
                                value={row.custom_material_name !== undefined ? row.custom_material_name : (row.material_name === 'Outro' ? '' : row.material_name)}
                                onChange={(e) => {
                                  handleUpdateWeighRow(idx, 'custom_material_name', e.target.value);
                                }}
                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-[#2098D1] rounded-lg outline-none focus:ring-1 focus:ring-[#2098D1]"
                                required
                              />
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="md:col-span-2">
                            <Input
                              label={language === 'pt' ? 'Volume/Qtd' : 'Quantity'}
                              type="number"
                              value={row.quantity}
                              onChange={(e) => handleUpdateWeighRow(idx, 'quantity', e.target.value)}
                              placeholder="Ex: 10"
                            />
                          </div>

                          {/* Unit / Packaging with 'Outros' + custom input */}
                          <div className="md:col-span-3 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                              {language === 'pt' ? 'Unidade / Embalagem' : 'Unit / Packaging'}
                            </label>
                            <select
                              value={unitSelectVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateWeighRow(idx, 'unit', val);
                                if (val !== 'Outros') {
                                  handleUpdateWeighRow(idx, 'custom_unit', '');
                                }
                              }}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                            >
                              {PACKAGING_UNIT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            {(unitSelectVal === 'Outros' || (!isStdUnit && row.unit !== '')) && (
                              <input
                                type="text"
                                placeholder={language === 'pt' ? 'Ex: Caçamba 30m³, Tambor 200L...' : 'E.g. 30m³ Container, 200L Drum...'}
                                value={row.custom_unit !== undefined ? row.custom_unit : (row.unit === 'Outros' ? '' : row.unit)}
                                onChange={(e) => {
                                  handleUpdateWeighRow(idx, 'custom_unit', e.target.value);
                                }}
                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-[#2098D1] rounded-lg outline-none focus:ring-1 focus:ring-[#2098D1]"
                                required
                              />
                            )}
                          </div>

                          {/* Net Weight */}
                          <div className="md:col-span-2">
                            <Input
                              label={language === 'pt' ? 'Peso Líquido (kg) *' : 'Net Weight (kg) *'}
                              type="number"
                              value={row.weight_kg}
                              onChange={(e) => handleUpdateWeighRow(idx, 'weight_kg', e.target.value)}
                              placeholder="Ex: 1250"
                              required
                            />
                          </div>

                          {/* Delete Row Button */}
                          <div className="md:col-span-1 text-right pt-6">
                            <button
                              type="button"
                              onClick={() => handleRemoveWeighRow(idx)}
                              className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-150 dark:border-slate-800">
                <Input
                  label={language === 'pt' ? 'Notas do Recebimento / Observações da Balança' : 'Receipt / Scale Notes'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'pt' ? 'Ex: Material seco, sem contaminação, motorista entregou o canhoto...' : 'E.g. Dry material, uncontaminated, receipt signed...'}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="submit"
                  className="w-full justify-center text-xs font-bold"
                  isLoading={isSubmitting}
                  disabled={!selectedSupplierId || weighItems.length === 0}
                >
                  {language === 'pt' ? 'Registrar Pesagem e Concluir Recebimento' : 'Record Weighing & Complete Receipt'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Historical logs of recent weighings */}
        <div>
          <Card className="h-full flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <ClipboardCheck size={16} className="text-emerald-600" />
              {language === 'pt' ? 'Últimas Pesagens (Balança)' : 'Recent Weighings (Hub Scale)'}
            </h3>

            {visibleReceipts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm text-center py-12">
                {language === 'pt' ? 'Nenhum recebimento registrado recentemente.' : 'No receipts registered recently.'}
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-1">
                {visibleReceipts.slice(0, 12).map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-white truncate max-w-[170px]">{rec.supplier?.name || 'Fornecedor'}</span>
                      <span className="text-slate-400">{formatDate(rec.received_date)}</span>
                    </div>
                    
                    <div className="space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                      {rec.items?.map((item, idx) => (
                        <p key={idx} className="flex justify-between items-center bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="truncate max-w-[140px]">{item.material_name} <span className="text-slate-400">({item.quantity} {item.unit})</span></span>
                          <span className="font-bold text-emerald-600">{formatVolume(item.weight_kg, 'kg')}</span>
                        </p>
                      ))}
                    </div>
                    
                    {rec.notes && (
                      <p className="text-[10px] text-slate-400 border-t border-slate-150 dark:border-slate-800 pt-1 leading-normal italic">
                        &quot;{rec.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}
