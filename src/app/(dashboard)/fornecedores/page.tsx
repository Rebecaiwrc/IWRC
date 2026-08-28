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
  fetchAddressByCep,
  translateSupplierType,
  translateFrequency,
  formatSupplierCode,
  formatTitleCase,
  cleanContactName,
  formatCityState,
  formatPhone,
  formatDocument,
  formatShortSegment
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
  const canUserModifySupplier = (s: Supplier) => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') return true;
    if (s.internal_responsible_id && s.internal_responsible_id === currentUser.id) return true;
    if (s.responsible?.id && s.responsible.id === currentUser.id) return true;
    if (s.responsible?.email && currentUser.email && s.responsible.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (s.responsible?.name && currentUser.name && s.responsible.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    if (s.lead_source && currentUser.name && s.lead_source.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
    return false;
  };

  const filteredSuppliers = suppliers.filter(s => {
    const activeLogistics = s.logistics_analyses?.[0];
    const isLogisticsFeasible = activeLogistics?.feasibility === 'FEASIBLE';
    const isGeradorConfirmed = ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage);
    
    // Only show if logistics has approved (FEASIBLE) or if it's already in confirmed stages
    // Specifically exclude any supplier that is still waiting for info (NEED_INFO)
    if (activeLogistics?.feasibility === 'NEED_INFO') return false;
    if (!isLogisticsFeasible && !isGeradorConfirmed) return false;

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
      ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(stageFilter)
        ? s.current_stage === stageFilter
        : s.logistics_analyses?.[0]?.feasibility === stageFilter;

    const matchesResponsible = responsibleFilter ? s.internal_responsible_id === responsibleFilter : true;

    return matchesSearch && matchesStage && matchesResponsible;
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
      date.setMonth(date.getMonth() + 1);
    }
    return date;
  };

  const stageOptions = [
    { value: '', label: language === 'pt' ? 'Todas as etapas homologadas' : 'All approved stages' },
    { value: 'OPERATION', label: language === 'pt' ? 'Ativo / Operacional' : 'Active / Operational' },
    { value: 'COLLECTION', label: language === 'pt' ? 'Em Preparação de Coleta' : 'Preparing Collection' },
    { value: 'DOCUMENTATION', label: language === 'pt' ? 'Documentação Pendente' : 'Pending Documentation' },
    { value: 'FEASIBLE', label: language === 'pt' ? 'Logística: Viável ✓' : 'Logistics: Feasible ✓' }
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
            {t('suppliers.subtitle', 'Empresas e condomínios com aprovação da Logística e homologados para rotinas de coleta e operação.')}
          </p>
        </div>
        
        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'BUYER') && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
            <Plus size={16} />
            {t('action.newSupplier', 'Cadastrar Gerador Direto')}
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            label={language === 'pt' ? 'Pesquisa Rápida' : 'Quick Search'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('suppliers.searchPlaceholder', 'Buscar por Código (IW-xxx), Razão Social, Fantasia, Segmento ou Cidade...')}
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
              ...profiles.map(p => ({ value: p.id, label: formatTitleCase(p.name, { isPerson: true }) }))
            ]}
          />
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card className="overflow-hidden !p-0 border border-slate-200/90 shadow-xs rounded-2xl bg-white">
        {filteredSuppliers.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Building2 size={40} className="mx-auto text-slate-300 mb-3 opacity-60" />
            <p className="font-bold text-slate-700 text-sm">
              {language === 'pt' ? 'Nenhum gerador ativo encontrado para os filtros selecionados.' : 'No active generators found for the selected filters.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'pt' ? 'Os leads aprovados pela Logística aparecem automaticamente aqui.' : 'Leads approved by logistics will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto lg:overflow-x-visible w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pl-4 lg:pl-5 pr-2 py-3.5 w-[24%]">{language === 'pt' ? 'Gerador / Razão Social' : 'Generator / Legal Name'}</th>
                  <th className="px-2 py-3.5 w-[9%]">{language === 'pt' ? 'Segmento' : 'Segment'}</th>
                  <th className="px-2 py-3.5 w-[11%]">{language === 'pt' ? 'Cidade/UF' : 'City/State'}</th>
                  <th className="px-2 py-3.5 w-[10%]">{language === 'pt' ? 'Contato' : 'Contact'}</th>
                  <th className="px-2 py-3.5 w-[12%]">{language === 'pt' ? 'Etapa Atual' : 'Current Stage'}</th>
                  <th className="px-2 py-3.5 w-[10%]">{language === 'pt' ? 'Última Coleta' : 'Last Collection'}</th>
                  <th className="px-2 py-3.5 w-[10%]">{language === 'pt' ? 'Responsável' : 'Responsible'}</th>
                  <th className="pl-2 pr-4 lg:pr-5 py-3.5 w-[14%] text-right">{language === 'pt' ? 'Ficha 360°' : '360° View'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSuppliers.map((supplier) => {
                  const primaryContact = supplier.contacts?.find(c => c.is_primary) || supplier.contacts?.[0];
                  const formattedCode = formatSupplierCode(supplier.code);
                  const formattedName = formatTitleCase(supplier.name, { isCompany: true });
                  const formattedTradeName = supplier.trade_name ? formatTitleCase(supplier.trade_name, { isCompany: true }) : '';
                  const mainTitle = formattedTradeName || formattedName;
                  const cityState = formatCityState(supplier.address?.city, supplier.address?.state);
                  const streetAddr = supplier.address?.street 
                    ? `${formatTitleCase(supplier.address.street, { isLocation: true })}${supplier.address.number ? `, ${supplier.address.number}` : ''}`
                    : '';
                  const respName = formatTitleCase(supplier.responsible?.name || (language === 'pt' ? 'Não atribuído' : 'Unassigned'), { isPerson: true });

                  return (
                    <tr 
                      key={supplier.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Gerador / Razão Social */}
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
                            title={`${formattedName} • ${formattedCode}${supplier.document ? ` • ${formatDocument(supplier.document)}` : ''}`}
                          >
                            <span className="truncate">{formattedName}</span>
                            <span className="text-slate-300 shrink-0">•</span>
                            <span className="font-mono text-slate-500 font-medium shrink-0">{formattedCode}</span>
                          </div>
                        </div>
                      </td>

                      {/* Segmento Resumido */}
                      <td className="px-2 py-3.5">
                        <span 
                          className="inline-block text-[11px] font-semibold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200/60 whitespace-nowrap truncate max-w-full"
                          title={translateSupplierType(supplier.supplier_type, language)}
                        >
                          {formatShortSegment(supplier.supplier_type, language)}
                        </span>
                      </td>

                      {/* Cidade/UF */}
                      <td className="px-2 py-3.5">
                        {supplier.address ? (
                          <div className="flex flex-col text-xs text-slate-600 overflow-hidden">
                            <span className="font-semibold text-slate-800 whitespace-nowrap truncate" title={cityState}>{cityState}</span>
                            {streetAddr && (
                              <span className="text-[10px] lg:text-[11px] text-slate-400 truncate max-w-full mt-0.5" title={streetAddr}>
                                {streetAddr}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs italic">{language === 'pt' ? 'Sem endereço' : 'No address'}</span>
                        )}
                      </td>

                      {/* Contato (Somente Telefone) */}
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

                      {/* Etapa Atual */}
                      <td className="px-2 py-3.5">
                        {(() => {
                          const scheduledCols = (supplier.collections || []).filter(c => c.status === 'SCHEDULED');
                          const nextCol = scheduledCols.length > 0 
                            ? [...scheduledCols].sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0]
                            : null;

                          return (
                            <div className="flex flex-col gap-0.5 items-start overflow-hidden">
                              {nextCol ? (
                                <>
                                  <Badge variant="emerald" className="text-[10px] lg:text-[11px] px-2 py-0.5 whitespace-nowrap">
                                    📅 {language === 'pt' ? 'Coleta Agendada' : 'Collection Scheduled'}
                                  </Badge>
                                  <span className="text-[10px] text-emerald-700 font-bold">
                                    {formatDate(nextCol.scheduled_date)}
                                  </span>
                                </>
                              ) : supplier.current_stage === 'OPERATION' && supplier.current_status === 'APPROVED' ? (
                                <Badge variant="success" className="text-[10px] lg:text-[11px] px-2 py-0.5 whitespace-nowrap">✓ {language === 'pt' ? 'Ativo' : 'Active'}</Badge>
                              ) : supplier.current_stage === 'COLLECTION' || (supplier.backlog_reason && supplier.backlog_reason.toLowerCase().includes('agendamento')) ? (
                                <Badge variant="warning" className="text-[10px] lg:text-[11px] px-2 py-0.5 whitespace-nowrap">📅 {language === 'pt' ? 'Agendamento' : 'Scheduling'}</Badge>
                              ) : supplier.logistics_analyses?.[0]?.feasibility === 'NEED_INFO' ? (
                                <>
                                  <Badge variant="purple" className="text-[10px] lg:text-[11px] px-2 py-0.5 whitespace-nowrap">⚠️ {language === 'pt' ? 'Precisa de Info' : 'Needs Info'}</Badge>
                                  {supplier.backlog_reason && (
                                    <span className="text-[10px] text-amber-700 font-medium truncate max-w-full" title={supplier.backlog_reason}>
                                      {supplier.backlog_reason}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Badge variant={getStageColor(supplier.current_stage)} className="text-[10px] lg:text-[11px] px-2 py-0.5 whitespace-nowrap">
                                    {translateStage(supplier.current_stage, language)}
                                  </Badge>
                                  {supplier.backlog_reason && (
                                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-full" title={supplier.backlog_reason}>
                                      {supplier.backlog_reason}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Última Coleta */}
                      <td className="px-2 py-3.5">
                        {(() => {
                          const scheduledCols = (supplier.collections || []).filter(c => c.status === 'SCHEDULED');
                          const nextCol = scheduledCols.length > 0 
                            ? [...scheduledCols].sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0]
                            : null;

                          if (nextCol) {
                            return (
                              <div className="flex flex-col text-xs whitespace-nowrap overflow-hidden">
                                <span className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                                  📅 {formatDate(nextCol.scheduled_date)}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                  {language === 'pt' ? 'Programada' : 'Scheduled'}
                                </span>
                              </div>
                            );
                          }

                          if (supplier.last_collection_date) {
                            const freq = supplier.logistics_analyses?.[0]?.recommended_frequency || 'Mensal';
                            const nextDate = getNextCollectionDate(supplier.last_collection_date, freq);
                            return (
                              <div className="flex flex-col text-xs whitespace-nowrap overflow-hidden">
                                <span className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                                  📅 {formatDate(supplier.last_collection_date)}
                                </span>
                                <span className="text-[10px] text-indigo-700 font-semibold mt-0.5" title={`Recorrência: ${freq}`}>
                                  {language === 'pt' ? 'Próx:' : 'Next:'} {formatDate(nextDate.toISOString())}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <span className="text-slate-400 text-xs italic whitespace-nowrap">
                              {language === 'pt' ? 'Aguardando 1ª coleta' : 'Awaiting 1st collection'}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Responsável */}
                      <td className="px-2 py-3.5">
                        <div className="flex items-center gap-1 text-xs text-slate-700 whitespace-nowrap overflow-hidden">
                          <UserCheck size={12} className="text-emerald-600 shrink-0" />
                          <span className="font-medium truncate max-w-full" title={respName}>{respName}</span>
                        </div>
                      </td>

                      {/* Ficha 360° / Ações */}
                      <td className="pl-2 pr-4 lg:pr-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {supplier.logistics_analyses?.[0]?.feasibility === 'NEED_INFO' && canUserModifySupplier(supplier) && (
                            <Link href={`/fornecedores/${supplier.id}`}>
                              <button 
                                type="button"
                                className="inline-flex items-center gap-1 text-[10px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md font-bold transition-all border border-amber-300 cursor-pointer shadow-2xs"
                                title={language === 'pt' ? 'Responder Informações' : 'Respond Info'}
                              >
                                💬
                              </button>
                            </Link>
                          )}
                          <Link href={`/fornecedores/${supplier.id}`}>
                            <button 
                              type="button"
                              className="inline-flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg font-semibold transition-all border border-sky-200 cursor-pointer shadow-2xs hover:shadow-xs whitespace-nowrap shrink-0"
                              title={language === 'pt' ? 'Abrir Ficha 360°' : 'Open 360° Details'}
                            >
                              <Eye size={13} className="text-sky-600 shrink-0" />
                              <span>{language === 'pt' ? 'Ficha 360°' : 'Ficha 360°'}</span>
                            </button>
                          </Link>
                          {canUserModifySupplier(supplier) && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm(language === 'pt' ? `Tem certeza que deseja apagar o gerador "${formattedName}" permanentemente?` : `Are you sure you want to permanently delete generator "${formattedName}"?`)) return;
                                try {
                                  await dbService.deleteSupplier(supplier.id);
                                  await fetchData();
                                } catch (err) {
                                  console.error(err);
                                  alert(language === 'pt' ? 'Erro ao excluir gerador.' : 'Error deleting generator.');
                                }
                              }}
                              className="inline-flex items-center justify-center h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0"
                              title={language === 'pt' ? 'Apagar Gerador' : 'Delete Generator'}
                            >
                              <Trash2 size={13} />
                            </button>
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

      {/* Cadastro Direto Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={language === 'pt' ? 'Cadastrar Gerador Homologado' : 'Register Approved Generator'}
        size="xl"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-6">
          
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">
              {language === 'pt' ? 'Dados da Empresa & Segmento' : 'Company Data & Segment'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={language === 'pt' ? 'Razão Social *' : 'Company Name *'}
                value={formSupplier.name}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, name: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: Indústrias Metalúrgicas S/A' : 'E.g. Industrial Metal Corp'}
                required
              />
              <Input
                label={language === 'pt' ? 'Nome Fantasia' : 'Trade Name'}
                value={formSupplier.trade_name}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, trade_name: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: Metalúrgica Alpha' : 'E.g. Alpha Metal'}
              />
              <Input
                label={language === 'pt' ? 'CNPJ / CPF' : 'Tax ID / CNPJ / CPF'}
                value={formSupplier.document}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, document: e.target.value }))}
                placeholder="Ex: 00.000.000/0001-00"
              />
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Segmento do Gerador *' : 'Generator Segment *'}
                </label>
                <select
                  value={formSupplier.supplier_type}
                  onChange={(e) => setFormSupplier(prev => ({ ...prev, supplier_type: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                >
                  <option value="">{language === 'pt' ? 'Selecione o segmento...' : 'Select segment...'}</option>
                  <option value="Indústria">{language === 'pt' ? 'Indústria' : 'Industry'}</option>
                  <option value="Comércio">{language === 'pt' ? 'Comércio' : 'Commerce'}</option>
                  <option value="Condomínio">{language === 'pt' ? 'Condomínio' : 'Condominium'}</option>
                  <option value="Cooperativa">{language === 'pt' ? 'Cooperativa' : 'Cooperative'}</option>
                  <option value="Residencial">{language === 'pt' ? 'Residencial' : 'Residential'}</option>
                  <option value="Outro">{language === 'pt' ? 'Outro (digitar)' : 'Other (type)'}</option>
                </select>
                {formSupplier.supplier_type === 'Outro' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Digite o segmento...' : 'Type segment name...'}
                    value={formSupplier.custom_supplier_type}
                    onChange={(e) => setFormSupplier(prev => ({ ...prev, custom_supplier_type: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-400 rounded-lg outline-none"
                    required
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Como encontramos *' : 'Lead Source *'}
                </label>
                <select
                  value={formSupplier.lead_source}
                  onChange={(e) => setFormSupplier(prev => ({ ...prev, lead_source: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                >
                  <option value="">{language === 'pt' ? 'Selecione como encontramos...' : 'Select lead source...'}</option>
                  <option value="Busca própria">{language === 'pt' ? 'Busca própria' : 'Direct Search'}</option>
                  <option value="Zion">Zion</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Indicação">{language === 'pt' ? 'Indicação' : 'Referral'}</option>
                  <option value="Outro">{language === 'pt' ? 'Outro (digitar)' : 'Other (type)'}</option>
                </select>
                {formSupplier.lead_source === 'Outro' && (
                  <input
                    type="text"
                    placeholder={language === 'pt' ? 'Digite a origem...' : 'Type source name...'}
                    value={formSupplier.custom_lead_source}
                    onChange={(e) => setFormSupplier(prev => ({ ...prev, custom_lead_source: e.target.value }))}
                    className="mt-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-400 rounded-lg outline-none"
                    required
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'pt' ? 'Responsável Interno *' : 'Internal Responsible *'}
                </label>
                <select
                  value={formSupplier.internal_responsible_id}
                  onChange={(e) => setFormSupplier(prev => ({ ...prev, internal_responsible_id: e.target.value }))}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-[#CCEAF1] dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] cursor-pointer font-medium"
                >
                  <option value="">{language === 'pt' ? 'Selecione o responsável...' : 'Select responsible...'}</option>
                  {profiles.filter(p => p.role !== 'SUPER_ADMIN').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">
              {language === 'pt' ? 'Credenciais MTR (Opcional)' : 'MTR Credentials (Optional)'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={language === 'pt' ? 'Login do MTR' : 'MTR Login'}
                value={formSupplier.mtr_login}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, mtr_login: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: usuario.sigor ou email' : 'E.g. user.sigor or email'}
              />
              <Input
                label={language === 'pt' ? 'Senha do MTR' : 'MTR Password'}
                type="password"
                value={formSupplier.mtr_password}
                onChange={(e) => setFormSupplier(prev => ({ ...prev, mtr_password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">
              {language === 'pt' ? 'Contato Principal' : 'Primary Contact'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={language === 'pt' ? 'Nome do Contato *' : 'Contact Name *'}
                value={formContact.name}
                onChange={(e) => setFormContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder={language === 'pt' ? 'Ex: Roberto Silva' : 'E.g. Robert Smith'}
                required
              />
              <Input
                label="WhatsApp"
                value={formContact.whatsapp}
                onChange={(e) => setFormContact(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="(11) 98765-4321"
              />
              <Input
                label={language === 'pt' ? 'E-mail' : 'Email'}
                type="email"
                value={formContact.email}
                onChange={(e) => setFormContact(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">
              {language === 'pt' ? 'Endereço Completo' : 'Complete Address'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Input
                  label={language === 'pt' ? 'CEP' : 'ZIP Code'}
                  value={formAddress.zip_code}
                  onChange={(e) => handleAddressCepChange(e.target.value)}
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
                  label={language === 'pt' ? 'Logradouro' : 'Street Address'}
                  value={formAddress.street}
                  onChange={(e) => setFormAddress(prev => ({ ...prev, street: e.target.value }))}
                  placeholder={language === 'pt' ? 'Avenida Paulista' : 'Main Street'}
                />
              </div>
              <Input
                label={language === 'pt' ? 'Número' : 'Number'}
                value={formAddress.number}
                onChange={(e) => setFormAddress(prev => ({ ...prev, number: e.target.value }))}
                placeholder="1000"
              />
              <Input
                label={language === 'pt' ? 'Bairro' : 'Neighborhood'}
                value={formAddress.neighborhood}
                onChange={(e) => setFormAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                placeholder={language === 'pt' ? 'Bela Vista' : 'Downtown'}
              />
              <Input
                label={language === 'pt' ? 'Cidade' : 'City'}
                value={formAddress.city}
                onChange={(e) => setFormAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder={language === 'pt' ? 'São Paulo' : 'City'}
              />
              <Input
                label={language === 'pt' ? 'UF' : 'State'}
                value={formAddress.state}
                onChange={(e) => setFormAddress(prev => ({ ...prev, state: e.target.value }))}
                placeholder="SP"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {language === 'pt' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              {language === 'pt' ? 'Salvar Gerador Homologado' : 'Save Approved Generator'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
