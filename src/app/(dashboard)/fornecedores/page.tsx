'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { dbService } from '@/features/shared/services/dbService';
import { Supplier, Profile } from '@/types';
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
  formatDate,
  formatCep,
  fetchAddressByCep
} from '@/lib/utils';
import { 
  Building2, 
  Search, 
  Plus, 
  Eye, 
  MapPin, 
  Phone, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Key, 
  Calendar, 
  Trash2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function SuppliersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  
  // Data State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');

  // Form State for direct registration
  const [formSupplier, setFormSupplier] = useState({
    name: '',
    trade_name: '',
    document: '',
    supplier_type: '',
    custom_supplier_type: '',
    lead_source: '',
    custom_lead_source: '',
    internal_responsible_id: '',
    mtr_login: '',
    mtr_password: ''
  });

  const [formContact, setFormContact] = useState({
    name: '',
    role: '',
    phone: '',
    whatsapp: '',
    email: ''
  });

  const [formAddress, setFormAddress] = useState({
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const [isCepLoading, setIsCepLoading] = useState(false);

  const handleAddressCepChange = async (val: string) => {
    const formatted = formatCep(val);
    setFormAddress(p => ({ ...p, zip_code: formatted }));

    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsCepLoading(true);
      const addr = await fetchAddressByCep(clean);
      setIsCepLoading(false);
      if (addr) {
        setFormAddress(p => ({
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

  const fetchData = async () => {
    try {
      const s = await dbService.getSuppliers();
      const p = await dbService.getProfiles();
      setSuppliers(s);
      setProfiles(p);

      if (currentUser && !formSupplier.internal_responsible_id) {
        setFormSupplier(prev => ({
          ...prev,
          internal_responsible_id: currentUser.id
        }));
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true);
      router.replace('/fornecedores');
    }
  }, [searchParams, router]);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplier.name || !formContact.name) {
      alert('Preencha os campos obrigatórios (Razão Social e Nome do Contato).');
      return;
    }

    setIsSubmitting(true);
    const finalSegment = formSupplier.supplier_type === 'Outro'
      ? (formSupplier.custom_supplier_type.trim() || 'Outro')
      : formSupplier.supplier_type;

    const finalSource = formSupplier.lead_source === 'Outro'
      ? (formSupplier.custom_lead_source.trim() || 'Outro')
      : formSupplier.lead_source;

    try {
      await dbService.createSupplier(
        {
          ...formSupplier,
          supplier_type: finalSegment,
          lead_source: finalSource,
          current_stage: 'OPERATION',
          current_status: 'APPROVED'
        },
        formAddress,
        formContact
      );
      
      setFormSupplier({
        name: '',
        trade_name: '',
        document: '',
        supplier_type: 'Indústria',
        custom_supplier_type: '',
        lead_source: 'Busca própria',
        custom_lead_source: '',
        internal_responsible_id: currentUser?.id || '',
        mtr_login: '',
        mtr_password: ''
      });
      setFormContact({ name: '', role: '', phone: '', whatsapp: '', email: '' });
      setFormAddress({ zip_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error creating supplier:', err);
      alert('Falha ao salvar gerador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show confirmed geradores OR any supplier where Logistics has responded FEASIBLE or NEED_INFO
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

  const filteredSuppliers = suppliers.filter(s => {
    if (!isResponsibleForSupplier(s)) return false;

    const activeLogistics = s.logistics_analyses?.[0];
    const isLogisticsEligible = Boolean(
      activeLogistics && 
      activeLogistics.feasibility && 
      (activeLogistics.feasibility === 'FEASIBLE' || activeLogistics.feasibility === 'NEED_INFO')
    );
    const isGeradorConfirmed = ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage);
    
    // Only show if logistics has responded FEASIBLE / NEED_INFO OR if it's already in confirmed stages
    if (!isLogisticsEligible && !isGeradorConfirmed) return false;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      s.name.toLowerCase().includes(q) ||
      (s.trade_name && s.trade_name.toLowerCase().includes(q)) ||
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.document && s.document.includes(q)) ||
      (s.address && s.address.city.toLowerCase().includes(q)) ||
      (s.supplier_type && s.supplier_type.toLowerCase().includes(q))
    );

    const matchesStage = !stageFilter ? true : 
      ['DOCUMENTATION', 'COLLECTION', 'OPERATION', 'LOGISTICS'].includes(stageFilter)
        ? s.current_stage === stageFilter
        : s.logistics_analyses?.[0]?.feasibility === stageFilter;

    const matchesResponsible = responsibleFilter ? s.internal_responsible_id === responsibleFilter : true;

    return matchesSearch && matchesStage && matchesResponsible;
  });

  const needInfoSuppliers = suppliers
    .filter(s => isResponsibleForSupplier(s))
    .filter(s => s.logistics_analyses?.[0]?.feasibility === 'NEED_INFO');

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
      date.setMonth(date.getMonth() + 1);
    }
    return date;
  };

  const stageOptions = [
    { value: '', label: language === 'pt' ? 'Todas as etapas e pareceres' : 'All stages and opinions' },
    { value: 'OPERATION', label: language === 'pt' ? 'Ativo / Operacional' : 'Active / Operational' },
    { value: 'COLLECTION', label: language === 'pt' ? 'Em Preparação de Coleta' : 'Preparing Collection' },
    { value: 'DOCUMENTATION', label: language === 'pt' ? 'Documentação Pendente' : 'Pending Documentation' },
    { value: 'FEASIBLE', label: language === 'pt' ? 'Logística: Viável ✓' : 'Logistics: Feasible ✓' },
    { value: 'NEED_INFO', label: language === 'pt' ? 'Logística: Precisa de Info ⚠️' : 'Logistics: Needs Info ⚠️' },
    { value: 'INFEASIBLE', label: language === 'pt' ? 'Logística: Inviável ❌' : 'Logistics: Infeasible ❌' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Carregando geradores homologados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {t('suppliers.title', 'Geradores Homologados')}
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {filteredSuppliers.length} {language === 'pt' ? 'geradores ativos' : 'active generators'}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {t('suppliers.subtitle', 'Empresas e condomínios com retorno da Logística ou homologados para rotinas de coleta e documentação.')}
          </p>
        </div>
        
        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'BUYER') && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
            <Plus size={16} />
            {t('action.newSupplier', 'Cadastrar Gerador Direto')}
          </Button>
        )}
      </div>

      {/* Compras Notification Banner for NEED_INFO */}
      {needInfoSuppliers.length > 0 && (currentUser?.role === 'ADMIN' || currentUser?.role === 'BUYER') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border-2 border-amber-300 p-4 rounded-xl text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200/80 rounded-lg text-amber-800 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span className="font-bold text-sm text-amber-950 block">
                🔔 {language === 'pt' ? `Atenção Compras: ${needInfoSuppliers.length} gerador(es) aguardando informações adicionais!` : `Notice Commercial: ${needInfoSuppliers.length} generator(s) awaiting additional information!`}
              </span>
              <span className="text-amber-800 text-xs mt-0.5 block">
                {language === 'pt' ? 'A Logística respondeu a análise solicitando esclarecimentos adicionais de acesso ou documentação.' : 'Logistics requested additional access or documentation details.'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setStageFilter('NEED_INFO')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            {language === 'pt' ? `Filtrar Pendências de Info (${needInfoSuppliers.length})` : `Filter Pending Info (${needInfoSuppliers.length})`}
          </button>
        </div>
      )}

      {/* Filters Card */}
      <Card className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            label={language === 'pt' ? 'Pesquisa Rápida' : 'Quick Search'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('suppliers.searchPlaceholder', 'Buscar por Código (GER-xxx), Razão Social, Fantasia, Segmento ou Cidade...')}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-52">
          <Select
            label={language === 'pt' ? 'Etapa Operacional' : 'Operational Stage'}
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            options={stageOptions}
          />
        </div>

        <div className="w-full md:w-56">
          <Select
            label={language === 'pt' ? 'Responsável Comercial' : 'Commercial Responsible'}
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            options={[
              { value: '', label: language === 'pt' ? 'Todos os responsáveis' : 'All responsibles' },
              ...profiles.map(p => ({ value: p.id, label: p.name }))
            ]}
          />
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card className="overflow-hidden !p-0 border border-slate-200">
        {filteredSuppliers.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Building2 size={36} className="mx-auto text-slate-300 mb-2 opacity-60" />
            <p className="font-semibold text-sm">
              {language === 'pt' ? 'Nenhum gerador ativo encontrado para os filtros selecionados.' : 'No active generators found for the selected filters.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'pt' ? 'Os leads aprovados pela Logística aparecem automaticamente aqui.' : 'Leads approved by logistics will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">{t('suppliers.colName', 'Código & Gerador')}</th>
                  <th className="px-6 py-4">{t('suppliers.colSegment', 'Segmento')}</th>
                  <th className="px-6 py-4">{t('suppliers.colCity', 'Localização')}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'Contato' : 'Contact'}</th>
                  <th className="px-6 py-4">{t('suppliers.colStage', 'Etapa / Situação')}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'Última Coleta' : 'Last Collection'}</th>
                  <th className="px-6 py-4">{language === 'pt' ? 'MTR / Acesso' : 'MTR / Access'}</th>
                  <th className="px-6 py-4">{t('suppliers.colResponsible', 'Responsável')}</th>
                  <th className="px-6 py-4 text-right">{t('suppliers.actions', 'Ações')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSuppliers.map((supplier) => {
                  const primaryContact = supplier.contacts?.find(c => c.is_primary) || supplier.contacts?.[0];
                  return (
                    <tr 
                      key={supplier.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Code & Name */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              {supplier.code || 'GER-001'}
                            </span>
                            <span className="font-bold text-slate-900 leading-snug">
                              {supplier.name}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 mt-0.5">
                            {supplier.trade_name || 'Sem fantasia'} • {supplier.document || 'Sem CNPJ'}
                          </span>
                        </div>
                      </td>

                      {/* Segment */}
                      <td className="px-6 py-4">
                        <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {supplier.supplier_type || 'Indústria'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        {supplier.address ? (
                          <div className="flex flex-col text-xs text-slate-600">
                            <span className="font-medium">{supplier.address.city} - {supplier.address.state}</span>
                            {supplier.address.street && <span className="text-[11px] text-slate-400">{supplier.address.street}, {supplier.address.number}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">Sem endereço</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        {primaryContact ? (
                          <div className="flex flex-col text-xs text-slate-500">
                            <span className="font-semibold text-slate-800">{primaryContact.name}</span>
                            <span className="flex items-center gap-1 mt-0.5 text-slate-400">
                              <Phone size={10} />
                              {primaryContact.whatsapp || primaryContact.phone || '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">Nenhum</span>
                        )}
                      </td>

                      {/* Stage & Status / Situação */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {supplier.current_stage === 'OPERATION' && supplier.current_status === 'APPROVED' ? (
                            <Badge variant="success">✓ Ativo</Badge>
                          ) : supplier.current_stage === 'COLLECTION' || supplier.backlog_reason?.toLowerCase().includes('agendamento') ? (
                            <Badge variant="warning">📅 Aguardando agendamento da coleta</Badge>
                          ) : supplier.logistics_analyses?.[0]?.feasibility === 'NEED_INFO' ? (
                            <>
                              <Badge variant="purple">⚠️ Precisa de Informação</Badge>
                              {supplier.backlog_reason && (
                                <span className="text-[10px] text-amber-700 font-medium line-clamp-1 max-w-[200px]" title={supplier.backlog_reason}>
                                  {supplier.backlog_reason}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <Badge variant={getStageColor(supplier.current_stage)}>
                                {translateStage(supplier.current_stage)}
                              </Badge>
                              {supplier.backlog_reason && (
                                <span className="text-[10px] text-slate-500 font-medium line-clamp-1 max-w-[180px]" title={supplier.backlog_reason}>
                                  {supplier.backlog_reason}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Última Coleta & Recorrência */}
                      <td className="px-6 py-4">
                        {supplier.last_collection_date ? (
                          <div className="flex flex-col text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              📅 {formatDate(supplier.last_collection_date)}
                            </span>
                            {(() => {
                              const freq = supplier.logistics_analyses?.[0]?.recommended_frequency || 'Mensal';
                              const nextDate = getNextCollectionDate(supplier.last_collection_date, freq);
                              return (
                                <span className="text-[10px] text-indigo-700 font-semibold mt-0.5" title={`Recorrência: ${freq}`}>
                                  Próx: {formatDate(nextDate.toISOString())} ({freq})
                                </span>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Aguardando 1ª coleta</span>
                        )}
                      </td>

                      {/* MTR status */}
                      <td className="px-6 py-4">
                        {supplier.mtr_login ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Key size={11} /> MTR Configurado
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Pendente</span>
                        )}
                      </td>

                      {/* Responsible */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <UserCheck size={12} className="text-emerald-500" />
                          <span>{supplier.responsible?.name || 'Não atribuído'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {supplier.logistics_analyses?.[0]?.feasibility === 'NEED_INFO' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'BUYER') && (
                            <Link href={`/fornecedores/${supplier.id}`}>
                              <button className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-full font-bold transition-all border border-amber-300 cursor-pointer shadow-xs">
                                💬 Responder Info
                              </button>
                            </Link>
                          )}
                          <Link href={`/fornecedores/${supplier.id}`}>
                            <button className="inline-flex items-center gap-1.5 text-xs text-[#2098D1] hover:text-[#1883B5] bg-[#E5F5F8] hover:bg-[#DDF4F9] px-3.5 py-1.5 rounded-full font-bold transition-all border border-[#CCEAF1] cursor-pointer">
                              <Eye size={12} />
                              Ficha 360º
                            </button>
                          </Link>
                          <button
                            onClick={async () => {
                              if (!confirm(`Tem certeza que deseja apagar o gerador "${supplier.name}" permanentemente?`)) return;
                              try {
                                await dbService.deleteSupplier(supplier.id);
                                await fetchData();
                              } catch (err) {
                                console.error(err);
                                alert('Erro ao excluir gerador.');
                              }
                            }}
                            className="inline-flex items-center justify-center h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                            title="Apagar Gerador"
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

      {/* Cadastro Direto Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Gerador Homologado"
        size="xl"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-6">
          
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
              Dados da Empresa & Segmento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Razão Social *"
                value={formSupplier.name}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Indústrias Metalúrgicas S/A"
                required
              />
              <Input
                label="Nome Fantasia"
                value={formSupplier.trade_name}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, trade_name: e.target.value }))}
                placeholder="Ex: Metalúrgica Alpha"
              />
              <Input
                label="CNPJ / CPF"
                value={formSupplier.document}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, document: e.target.value }))}
                placeholder="Ex: 00.000.000/0001-00"
              />
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Segmento do Gerador *</label>
                <select
                  value={formSupplier.supplier_type}
                  onChange={(e) => setFormSupplier(prev => ({ ...prev, supplier_type: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  <option value="">Selecione o segmento...</option>
                  <option value="Indústria">Indústria</option>
                  <option value="Comércio">Comércio</option>
                  <option value="Condomínio">Condomínio</option>
                  <option value="Cooperativa">Cooperativa</option>
                  <option value="Residencial">Residencial</option>
                  <option value="Outro">Outro (digitar)</option>
                </select>
                {formSupplier.supplier_type === 'Outro' && (
                  <input
                    type="text"
                    placeholder="Digite o segmento..."
                    value={formSupplier.custom_supplier_type}
                    onChange={(e) => setFormSupplier(prev => ({ ...prev, custom_supplier_type: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white border border-emerald-400 rounded-lg outline-none"
                    required
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Como encontramos *</label>
                <select
                  value={formSupplier.lead_source}
                  onChange={(e) => setFormSupplier(prev => ({ ...prev, lead_source: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  <option value="">Selecione como encontramos...</option>
                  <option value="Busca própria">Busca própria</option>
                  <option value="Zion">Zion</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Outro">Outro (digitar)</option>
                </select>
                {formSupplier.lead_source === 'Outro' && (
                  <input
                    type="text"
                    placeholder="Digite a origem..."
                    value={formSupplier.custom_lead_source}
                    onChange={(e) => setFormSupplier(prev => ({ ...prev, custom_lead_source: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white border border-emerald-400 rounded-lg outline-none"
                    required
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Responsável Interno *</label>
                <select
                  value={formSupplier.internal_responsible_id}
                  onChange={(e) => setFormSupplier(prev => ({ ...prev, internal_responsible_id: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white border border-[#CCEAF1] rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer"
                >
                  <option value="">Selecione o responsável...</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
              Credenciais MTR (Opcional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Login do MTR"
                value={formSupplier.mtr_login}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, mtr_login: e.target.value }))}
                placeholder="Ex: usuario.sigor ou email"
              />
              <Input
                label="Senha do MTR"
                type="password"
                value={formSupplier.mtr_password}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, mtr_password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
              Contato Principal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nome do Contato *"
                value={formContact.name}
                onChange={(e) => setFormContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Roberto Silva"
                required
              />
              <Input
                label="WhatsApp"
                value={formContact.whatsapp}
                onChange={(e) => setFormContact(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="(11) 98765-4321"
              />
              <Input
                label="E-mail"
                type="email"
                value={formContact.email}
                onChange={(e) => setFormContact(prev => ({ ...prev, email: e.target.value }))}
                placeholder="roberto@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
              Endereço Completo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Input
                  label="CEP"
                  value={formAddress.zip_code}
                  onChange={(e) => handleAddressCepChange(e.target.value)}
                  placeholder="01001-000"
                  maxLength={9}
                />
                {isCepLoading && (
                  <span className="absolute right-3 top-8 text-xs text-[#2098D1] flex items-center gap-1 font-semibold animate-pulse">
                    <Loader2 size={13} className="animate-spin" /> Buscando...
                  </span>
                )}
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Logradouro"
                  value={formAddress.street}
                  onChange={(e) => setFormAddress(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Avenida Paulista"
                />
              </div>
              <Input
                label="Número"
                value={formAddress.number}
                onChange={(e) => setFormAddress(prev => ({ ...prev, number: e.target.value }))}
                placeholder="1000"
              />
              <Input
                label="Bairro"
                value={formAddress.neighborhood}
                onChange={(e) => setFormAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                placeholder="Bela Vista"
              />
              <Input
                label="Cidade"
                value={formAddress.city}
                onChange={(e) => setFormAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="São Paulo"
              />
              <Input
                label="UF"
                value={formAddress.state}
                onChange={(e) => setFormAddress(prev => ({ ...prev, state: e.target.value }))}
                placeholder="SP"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Salvar Gerador Homologado
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
