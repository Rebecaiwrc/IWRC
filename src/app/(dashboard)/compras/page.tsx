'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/features/shared/context/LanguageContext';
import { dbService } from '@/features/shared/services/dbService';
import { Supplier, Profile, SupplierInteraction } from '@/types';
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
  RotateCcw
} from 'lucide-react';
import { 
  formatSupplierCode, 
  formatTitleCase, 
  formatCityState, 
  formatPhone, 
  formatDate,
  translateSupplierType,
  formatShortSegment
} from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function ComprasPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');

  // Response Modal state
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierInteractions, setSupplierInteractions] = useState<SupplierInteraction[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppList, profList] = await Promise.all([
        dbService.getSuppliers(),
        dbService.getProfiles()
      ]);
      setSuppliers(suppList);
      setProfiles(profList);
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
  const pendingSuppliers = suppliers.filter(s => {
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

  const handleOpenResponseModal = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setResponseText('');
    setIsResponseModalOpen(true);

    try {
      const fullSupplier = await dbService.getSupplier(supplier.id);
      setSupplierInteractions(fullSupplier?.interactions || []);
    } catch (err) {
      console.error('Error loading interactions:', err);
      setSupplierInteractions([]);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !currentUser) return;
    if (!responseText.trim()) {
      alert(language === 'pt' ? 'Por favor, escreva os detalhes da resposta para a Logística.' : 'Please enter the response details for Logistics.');
      return;
    }

    try {
      setIsSubmitting(true);
      const activeAnalysis = selectedSupplier.logistics_analyses?.[0];
      const supplierName = selectedSupplier.trade_name || selectedSupplier.name;

      // 1. Add interaction in Ficha 360 timeline
      await dbService.addSupplierInteraction({
        supplier_id: selectedSupplier.id,
        user_id: currentUser.id,
        type: 'internal_obs',
        description: `💬 [Resposta de Compras para Logística]: ${responseText.trim()}`
      });

      // 2. Update logistics analysis: return feasibility to PENDING with updated notes
      if (activeAnalysis?.id) {
        const previousNotes = activeAnalysis.notes ? `${activeAnalysis.notes}\n\n` : '';
        const updatedNotes = `${previousNotes}[${new Date().toLocaleDateString('pt-BR')} - Resposta de Compras por ${currentUser.name}]: ${responseText.trim()}`;
        
        await dbService.createOrUpdateLogisticsAnalysis({
          id: activeAnalysis.id,
          supplier_id: selectedSupplier.id,
          feasibility: 'PENDING',
          notes: updatedNotes
        });
      }

      // 3. Update supplier stage/status to return to Logistics queue
      await dbService.updateSupplier(selectedSupplier.id, {
        current_stage: 'LOGISTICS',
        current_status: 'IN_PROGRESS',
        backlog_reason: `Respondido por Compras (${currentUser.name}) - Aguardando reanálise logística`
      });

      // 4. Add status history
      await dbService.addSupplierStatusHistory({
        supplier_id: selectedSupplier.id,
        old_stage: selectedSupplier.current_stage,
        new_stage: 'LOGISTICS',
        old_status: selectedSupplier.current_status,
        new_status: 'IN_PROGRESS',
        user_id: currentUser.id,
        notes: `Compras respondeu à solicitação da Logística: "${responseText.trim().slice(0, 100)}..."`
      });

      setIsResponseModalOpen(false);
      setSelectedSupplier(null);
      setResponseText('');
      await fetchData();

      alert(language === 'pt' 
        ? `Sucesso! A resposta para "${supplierName}" foi enviada e o registro retornou para a fila da Logística.` 
        : `Success! Response for "${supplierName}" sent. Returned to Logistics queue.`
      );
    } catch (err: any) {
      console.error('Error sending response to logistics:', err);
      alert(language === 'pt' ? `Erro ao enviar resposta: ${err.message || 'Tente novamente.'}` : `Error sending response: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Carregando pendências de Compras...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">
                {language === 'pt' ? 'Compras' : 'Purchasing'}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {language === 'pt' 
                  ? 'Fornecedores que necessitam de informações adicionais solicitadas pela Logística antes da aprovação.' 
                  : 'Suppliers that need additional information requested by Logistics prior to approval.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="flex flex-col md:flex-row gap-4 items-end bg-white border border-slate-200/90 shadow-2xs rounded-2xl p-4">
        <div className="flex-1 w-full">
          <Input
            placeholder={language === 'pt' ? 'Buscar por Nome, Razão Social, Código (IW-xxx) ou Cidade...' : 'Search by name, legal name, code (IW-xxx), city...'}
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
              ...profiles.map(p => ({ value: p.id, label: formatTitleCase(p.name, { isPerson: true }) }))
            ]}
          />
        </div>
      </Card>

      {/* Pending Suppliers List */}
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
                  const requestDate = activeAnalysis?.created_at || supplier.updated_at;

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
                          {requestDate && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar size={10} />
                              Solicitado em: {formatDate(requestDate)}
                            </span>
                          )}
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
                              <span>{language === 'pt' ? 'Ficha 360°' : 'Ficha 360°'}</span>
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

      {/* Response Modal */}
      {isResponseModalOpen && selectedSupplier && (
        <Modal
          isOpen={isResponseModalOpen}
          onClose={() => !isSubmitting && setIsResponseModalOpen(false)}
          title={language === 'pt' ? 'Responder Pendência à Logística' : 'Respond to Logistics Inquiry'}
          size="lg"
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

            {/* Response Input Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {language === 'pt' ? 'Resposta e Esclarecimentos de Compras *' : 'Purchasing Response & Clarifications *'}
              </label>
              <textarea
                required
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={language === 'pt' 
                  ? 'Ex: Confirmado com o cliente que o galpão aceita caminhão Truck de até 12m. Horário de carga permitido: segunda a sexta das 8h às 17h. Telefone direto do encarregado: (11) 98888-7777...'
                  : 'Example: Confirmed with client that warehouse accommodates 12m truck. Loading hours 8am to 5pm...'}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-900 bg-white leading-relaxed resize-none"
              />
              <p className="text-[11px] text-slate-400">
                {language === 'pt' 
                  ? 'Ao enviar, o fornecedor sairá desta aba e retornará automaticamente para a fila de análise da Logística.' 
                  : 'Upon submission, this supplier will return to the Logistics analysis queue.'}
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
                disabled={isSubmitting || !responseText.trim()}
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

    </div>
  );
}
