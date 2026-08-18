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
import { useAuth } from '@/features/auth/context/AuthContext';
import { formatDate, formatVolume } from '@/lib/utils';
import { Scale, Building2, Calendar, ClipboardCheck, Plus, Trash2 } from 'lucide-react';

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

export default function ReceiptsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
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
            unit: 'fardos', // default packaging unit
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

  // Selected supplier declared materials
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const declaredMaterials = selectedSupplier?.materials?.map(m => m.material_name) || [];

  // Handle supplier change to update collections list
  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setSelectedCollectionId('');
    
    // If supplier has declared materials, pre-seed one row
    const sup = suppliers.find(s => s.id === supplierId);
    if (sup?.materials && sup.materials.length > 0) {
      setWeighItems([{
        material_name: sup.materials[0].material_name,
        custom_material_name: '',
        quantity: '',
        unit: 'fardos',
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
    const col = collections.find(c => c.id === colId);
    if (col && col.items) {
      setWeighItems(col.items.map(item => ({
        material_name: item.material_name,
        custom_material_name: '',
        quantity: '',
        unit: 'fardos',
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
      { material_name: defaultMat, custom_material_name: '', quantity: '', unit: 'fardos', weight_kg: '', notes: '' }
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
      alert('Selecione o fornecedor e insira pelo menos 1 material pesado.');
      return;
    }

    // Validate rows
    const invalidRow = weighItems.find(r => {
      const matName = (r.material_name === 'Outro' && r.custom_material_name?.trim()) ? r.custom_material_name.trim() : r.material_name;
      return !matName || !r.weight_kg;
    });

    if (invalidRow) {
      alert('Preencha o material e o peso líquido (kg) em todas as linhas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsToSave = weighItems.map(row => {
        const finalName = (row.material_name === 'Outro' && row.custom_material_name?.trim())
          ? row.custom_material_name.trim()
          : row.material_name;
        return {
          material_name: finalName || 'Material Diverso',
          quantity: Number(row.quantity) || 0,
          unit: row.unit,
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
        list += `${i.material_name} (${i.weight_kg}kg), `;
      });
      await dbService.addSupplierInteraction({
        supplier_id: selectedSupplierId,
        user_id: currentUser?.id || 'usr-rebeca-buy',
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

      fetchData(); // reload lists
      alert('Pesagem e recebimento registrados com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Falha ao salvar recebimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter collections for selected supplier that are not completed
  const supplierCollections = collections.filter(
    c => c.supplier_id === selectedSupplierId && c.status !== 'COMPLETED'
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 leading-tight">Recebimento de Materiais (Balança)</h1>
        <p className="text-slate-500 text-sm mt-1">Registrar pesagem final e controle físico de entrada de materiais na base.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form registration */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <Scale size={16} className="text-emerald-600" />
              Lançamento de Pesagem
            </h3>

            <form onSubmit={handleSaveReceipt} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Selecionar Fornecedor *"
                  value={selectedSupplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  options={[
                    { value: '', label: 'Selecione...' },
                    ...suppliers.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  disabled={!!targetCollectionId}
                />

                <Select
                  label="Vincular a Coleta Programada (Opcional)"
                  value={selectedCollectionId}
                  onChange={(e) => handleCollectionChange(e.target.value)}
                  options={[
                    { value: '', label: 'Sem agendamento (Entrada direta)' },
                    ...supplierCollections.map(c => ({
                      value: c.id,
                      label: `Coleta para ${formatDate(c.scheduled_date)}`
                    }))
                  ]}
                  disabled={!selectedSupplierId || !!targetCollectionId}
                />

                <Input
                  label="Data de Recebimento *"
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  required
                />
              </div>

              {/* Weigh Items Dynamic Form Block */}
              <div className="space-y-4 pt-4 border-t border-slate-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Detalhamento dos Pesos
                  </span>
                  <button
                    type="button"
                    onClick={handleAddWeighRow}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                  >
                    <Plus size={14} />
                    Adicionar Item
                  </button>
                </div>

                {weighItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    Selecione um fornecedor ou clique em &quot;Adicionar Item&quot; para pesar resíduos.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weighItems.map((row, idx) => {
                      const isStd = MATERIAL_OPTIONS.includes(row.material_name);
                      const selectVal = isStd ? row.material_name : (row.material_name ? 'Outro' : '');

                      return (
                        <div 
                          key={idx} 
                          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3.5 bg-slate-50 border border-slate-200 rounded-xl relative"
                        >
                          <div className="md:col-span-4">
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Nome do Material *
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
                              className="w-full px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                              required
                            >
                              <option value="">Selecione o material...</option>
                              {declaredMaterials.length > 0 && (
                                <optgroup label="Materiais Declarados do Gerador">
                                  {declaredMaterials.map(m => (
                                    <option key={`decl-${m}`} value={m}>⭐ {m}</option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label="Todos os Materiais">
                                {MATERIAL_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </optgroup>
                            </select>

                            {(row.material_name === 'Outro' || (!isStd && row.material_name !== '')) && (
                              <input
                                type="text"
                                placeholder="Digite o nome do material..."
                                value={row.custom_material_name !== undefined ? row.custom_material_name : (row.material_name === 'Outro' ? '' : row.material_name)}
                                onChange={(e) => {
                                  handleUpdateWeighRow(idx, 'custom_material_name', e.target.value);
                                }}
                                className="mt-1.5 w-full px-3 py-1.5 text-xs bg-white border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <Input
                              label="Volume/Qtd"
                              type="number"
                              value={row.quantity}
                              onChange={(e) => handleUpdateWeighRow(idx, 'quantity', e.target.value)}
                              placeholder="Ex: 10"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Select
                              label="Unidade Embalagem"
                              value={row.unit}
                              onChange={(e) => handleUpdateWeighRow(idx, 'unit', e.target.value)}
                              options={[
                                { value: 'fardos', label: 'Fardos' },
                                { value: 'paletes', label: 'Paletes' },
                                { value: 'sacos', label: 'Sacos' },
                                { value: 'unidades', label: 'Unidades' },
                                { value: 'caçamba', label: 'Caçamba' },
                                { value: 'granel', label: 'Granel' }
                              ]}
                            />
                          </div>

                          <div className="md:col-span-3">
                            <Input
                              label="Peso Líquido Balança (kg) *"
                              type="number"
                              value={row.weight_kg}
                              onChange={(e) => handleUpdateWeighRow(idx, 'weight_kg', e.target.value)}
                              placeholder="Ex: 1250"
                              required
                            />
                          </div>

                          <div className="md:col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveWeighRow(idx)}
                              className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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
                  label="Notas do Recebimento / Observações da Balança"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Material seco, sem contaminação, motorista entregou o canhoto..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="submit"
                  className="w-full justify-center"
                  isLoading={isSubmitting}
                  disabled={!selectedSupplierId || weighItems.length === 0}
                >
                  Registrar Pesagem e Concluir Recebimento
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Historical logs of recent weighings */}
        <div>
          <Card className="h-full flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <ClipboardCheck size={16} className="text-emerald-600" />
              Últimas Pesagens (Balança)
            </h3>

            {receipts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm text-center py-12">
                Nenhum recebimento registrado recentemente.
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto">
                {receipts.slice(0, 8).map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800 truncate max-w-[150px]">{rec.supplier?.name}</span>
                      <span className="text-slate-400">{formatDate(rec.received_date)}</span>
                    </div>
                    
                    <div className="space-y-0.5 text-slate-600 font-medium">
                      {rec.items?.map((item, idx) => (
                        <p key={idx} className="flex justify-between">
                          <span>{item.material_name} ({item.quantity} {item.unit})</span>
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
