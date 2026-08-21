import { 
  SupplierStage, 
  SupplierStatus, 
  FeasibilityStatus, 
  CollectionStatus, 
  InteractionType,
  ProspectingStatus,
  Supplier
} from '@/types';

// Helpers to get active language
const getActiveLang = (lang?: 'pt' | 'en'): 'pt' | 'en' => {
  if (lang) return lang;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('iwrc_lang');
    if (saved === 'en' || saved === 'pt') return saved;
  }
  return 'pt';
};

// Stages translator
export const translateStage = (stage: SupplierStage, lang?: 'pt' | 'en'): string => {
  const currentLang = getActiveLang(lang);
  const mapping: Record<'pt' | 'en', Record<SupplierStage, string>> = {
    pt: {
      PROSPECTING: 'Prospecção',
      QUALIFICATION: 'Qualificação',
      LOGISTICS: 'Análise Logística',
      DOCUMENTATION: 'Documentação',
      COLLECTION: 'Preparação de Coleta',
      OPERATION: 'Ativo/Operacional'
    },
    en: {
      PROSPECTING: 'Prospecting',
      QUALIFICATION: 'Qualification',
      LOGISTICS: 'Logistics Analysis',
      DOCUMENTATION: 'Documentation',
      COLLECTION: 'Collection Prep',
      OPERATION: 'Active / Operational'
    }
  };
  return mapping[currentLang]?.[stage] || stage;
};

export const getStageColor = (stage: SupplierStage): 'default' | 'info' | 'purple' | 'warning' | 'emerald' => {
  const mapping: Record<SupplierStage, 'default' | 'info' | 'purple' | 'warning' | 'emerald'> = {
    PROSPECTING: 'default',
    QUALIFICATION: 'info',
    LOGISTICS: 'purple',
    DOCUMENTATION: 'warning',
    COLLECTION: 'purple',
    OPERATION: 'emerald'
  };
  return mapping[stage] || 'default';
};

// Prospecting status translator (used by Compras team)
export const translateProspectingStatus = (status: ProspectingStatus, lang?: 'pt' | 'en'): string => {
  const currentLang = getActiveLang(lang);
  const mapping: Record<'pt' | 'en', Record<ProspectingStatus, string>> = {
    pt: {
      NEW_LEAD: 'Novo Lead',
      FIRST_CONTACT: 'Primeiro Contato Feito',
      PRESENTATION_SENT: 'Apresentação Enviada',
      QUALIFIED: 'Qualificado ✓',
      WAITING_LOGISTICS: 'Aguard. Logística'
    },
    en: {
      NEW_LEAD: 'New Lead',
      FIRST_CONTACT: 'First Contact Made',
      PRESENTATION_SENT: 'Presentation Sent',
      QUALIFIED: 'Qualified ✓',
      WAITING_LOGISTICS: 'Awaiting Logistics'
    }
  };
  return mapping[currentLang]?.[status] || status;
};

export const getProspectingColor = (status: ProspectingStatus): 'default' | 'warning' | 'info' | 'success' | 'purple' => {
  const mapping: Record<ProspectingStatus, 'default' | 'warning' | 'info' | 'success' | 'purple'> = {
    NEW_LEAD: 'default',
    FIRST_CONTACT: 'warning',
    PRESENTATION_SENT: 'info',
    QUALIFIED: 'success',
    WAITING_LOGISTICS: 'purple'
  };
  return mapping[status] || 'default';
};

// Statuses translator
export const translateStatus = (status: SupplierStatus, lang?: 'pt' | 'en'): string => {
  const currentLang = getActiveLang(lang);
  const mapping: Record<'pt' | 'en', Record<SupplierStatus, string>> = {
    pt: {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em Andamento',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado/Inviável',
      COMPLETED: 'Concluído',
      INACTIVE: 'Inativo'
    },
    en: {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      APPROVED: 'Approved',
      REJECTED: 'Rejected / Infeasible',
      COMPLETED: 'Completed',
      INACTIVE: 'Inactive'
    }
  };
  return mapping[currentLang]?.[status] || status;
};

export const getStatusColor = (status: SupplierStatus): 'warning' | 'info' | 'success' | 'danger' | 'emerald' | 'default' => {
  const mapping: Record<SupplierStatus, 'warning' | 'info' | 'success' | 'danger' | 'emerald' | 'default'> = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    APPROVED: 'success',
    REJECTED: 'danger',
    COMPLETED: 'emerald',
    INACTIVE: 'danger'
  };
  return mapping[status] || 'default';
};

// Feasibility translator
export const translateFeasibility = (feasibility: FeasibilityStatus, lang?: 'pt' | 'en'): string => {
  const currentLang = getActiveLang(lang);
  const mapping: Record<'pt' | 'en', Record<FeasibilityStatus, string>> = {
    pt: {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em análise',
      FEASIBLE: 'Viável',
      INFEASIBLE: 'Inviável',
      NEED_INFO: 'Necessita info adicional'
    },
    en: {
      PENDING: 'Pending',
      IN_PROGRESS: 'Under Analysis',
      FEASIBLE: 'Feasible',
      INFEASIBLE: 'Infeasible',
      NEED_INFO: 'Needs Info'
    }
  };
  return mapping[currentLang]?.[feasibility] || feasibility;
};

export const getFeasibilityColor = (feasibility: FeasibilityStatus): 'warning' | 'info' | 'success' | 'danger' | 'purple' => {
  const mapping: Record<FeasibilityStatus, 'warning' | 'info' | 'success' | 'danger' | 'purple'> = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    FEASIBLE: 'success',
    INFEASIBLE: 'danger',
    NEED_INFO: 'purple'
  };
  return mapping[feasibility] || 'info';
};

// Collection status translator
export const translateCollectionStatus = (status: CollectionStatus, lang?: 'pt' | 'en'): string => {
  const currentLang = getActiveLang(lang);
  const mapping: Record<'pt' | 'en', Record<CollectionStatus, string>> = {
    pt: {
      SCHEDULED: 'Agendada',
      IN_TRANSIT: 'Em Trânsito',
      COMPLETED: 'Realizada',
      CANCELLED: 'Cancelada'
    },
    en: {
      SCHEDULED: 'Scheduled',
      IN_TRANSIT: 'In Transit',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    }
  };
  return mapping[currentLang]?.[status] || status;
};

export const getCollectionColor = (status: CollectionStatus): 'warning' | 'info' | 'success' | 'danger' | 'emerald' => {
  const mapping: Record<CollectionStatus, 'warning' | 'info' | 'success' | 'danger' | 'emerald'> = {
    SCHEDULED: 'warning',
    IN_TRANSIT: 'info',
    COMPLETED: 'emerald',
    CANCELLED: 'danger'
  };
  return mapping[status] || 'warning';
};

// Interaction translator
export const translateInteractionType = (type: InteractionType, lang?: 'pt' | 'en'): string => {
  const currentLang = getActiveLang(lang);
  const mapping: Record<'pt' | 'en', Record<InteractionType, string>> = {
    pt: {
      whatsapp: 'WhatsApp',
      phone: 'Ligação Telefônica',
      email: 'E-mail',
      meeting: 'Reunião',
      visit: 'Visita Técnica',
      internal_obs: 'Obs. Interna',
      other: 'Outro'
    },
    en: {
      whatsapp: 'WhatsApp',
      phone: 'Phone Call',
      email: 'Email',
      meeting: 'Meeting',
      visit: 'Technical Visit',
      internal_obs: 'Internal Note',
      other: 'Other'
    }
  };
  return mapping[currentLang]?.[type] || type;
};

// Supplier Type / Segment translator
export const translateSupplierType = (type?: string | null, lang?: 'pt' | 'en'): string => {
  if (!type) return lang === 'en' ? 'Industry' : 'Indústria';
  const currentLang = getActiveLang(lang);
  if (currentLang === 'pt') return type;

  const mapping: Record<string, string> = {
    'Indústria': 'Industry',
    'Comércio': 'Commerce',
    'Serviços': 'Services',
    'Restaurante / Alimentação': 'Restaurant / Food Service',
    'Restaurante': 'Restaurant',
    'Alimentação': 'Food Service',
    'Logística': 'Logistics',
    'Agronegócio': 'Agribusiness',
    'Construção': 'Construction',
    'Tecnologia': 'Technology',
    'Educação': 'Education',
    'Escola / Universidade': 'School / University',
    'Saúde': 'Healthcare',
    'Hospital / Saúde': 'Hospital / Healthcare',
    'Hospitalar': 'Healthcare / Hospital',
    'Supermercado': 'Supermarket',
    'Hotelaria': 'Hospitality',
    'Eventos': 'Events',
    'Condomínio': 'Condominium',
    'Posto de Combustível': 'Gas Station',
    'Alimentos': 'Food & Beverage',
    'Automotivo': 'Automotive',
    'Metalúrgica': 'Metallurgy',
    'Química': 'Chemical',
    'Têxtil': 'Textile',
    'Embalagens': 'Packaging',
    'Outro': 'Other'
  };
  return mapping[type] || type;
};

// Lead Source translator
export const translateLeadSource = (source?: string | null, lang?: 'pt' | 'en'): string => {
  if (!source) return '-';
  const currentLang = getActiveLang(lang);
  if (currentLang === 'pt') return source;

  const mapping: Record<string, string> = {
    'Prospecção HUB Sorocaba': 'HUB Sorocaba Prospecting',
    'Prospecção HUB': 'HUB Prospecting',
    'Prospecção Comercial': 'Commercial Prospecting',
    'Prospecção': 'Prospecting',
    'Busca': 'Outbound Search',
    'Indicação': 'Referral',
    'Site / Formulário': 'Website / Form',
    'Inbound': 'Inbound',
    'Outbound': 'Outbound',
    'Evento / Feira': 'Event / Trade Show',
    'Outro': 'Other'
  };

  if (mapping[source]) return mapping[source];

  let translated = source;
  translated = translated.replace(/Prospecção HUB/gi, 'HUB Prospecting');
  translated = translated.replace(/Prospecção/gi, 'Prospecting');
  translated = translated.replace(/Indicação/gi, 'Referral');
  translated = translated.replace(/Site/gi, 'Website');
  return translated;
};

// Material name translator
export const translateMaterialName = (name?: string | null, lang?: 'pt' | 'en'): string => {
  if (!name) return '-';
  const currentLang = getActiveLang(lang);
  if (currentLang === 'pt') return name;

  const exact: Record<string, string> = {
    'Recicláveis diversos': 'Mixed Recyclables',
    'Recicláveis em geral': 'General Recyclables',
    'Recicláveis': 'Recyclables',
    'Reciclável': 'Recyclable',
    'Papelão': 'Cardboard',
    'Papelão Ondulado': 'Corrugated Cardboard',
    'Papel Branco Sigiloso': 'Confidential White Paper',
    'Papel Misto': 'Mixed Paper',
    'Papel': 'Paper',
    'Plástico Filme': 'Plastic Film',
    'Plástico Rígido': 'Rigid Plastic',
    'Plástico': 'Plastic',
    'Plastico': 'Plastic',
    'PET': 'PET',
    'Alumínio': 'Aluminum',
    'Aluminio': 'Aluminum',
    'Latinha': 'Cans',
    'Latinhas': 'Cans',
    'Metais': 'Metals',
    'Metal': 'Metal',
    'Ferro/Aço': 'Iron/Steel',
    'Ferro': 'Iron',
    'Aço': 'Steel',
    'Cobre': 'Copper',
    'Vidro': 'Glass',
    'Eletrônicos (REEE)': 'Electronics (WEEE)',
    'Eletrônicos': 'Electronics',
    'Orgânicos': 'Organics',
    'Sucata de Alumínio': 'Aluminum Scrap',
    'Sucata': 'Scrap',
    'Diversos': 'Mixed / Various',
    'Outro': 'Other',
    'Outros': 'Others'
  };

  if (exact[name]) return exact[name];

  let translated = name;
  translated = translated.replace(/recicláveis diversos/gi, 'Mixed Recyclables');
  translated = translated.replace(/recicláveis em geral/gi, 'General Recyclables');
  translated = translated.replace(/recicláveis|reciclaveis/gi, 'Recyclables');
  translated = translated.replace(/papel branco sigiloso/gi, 'Confidential White Paper');
  translated = translated.replace(/papel misto/gi, 'Mixed Paper');
  translated = translated.replace(/papelão ondulado/gi, 'Corrugated Cardboard');
  translated = translated.replace(/papelão/gi, 'Cardboard');
  translated = translated.replace(/papel/gi, 'Paper');
  translated = translated.replace(/plástico filme|plastico filme/gi, 'Plastic Film');
  translated = translated.replace(/plástico rígido|plastico rigido/gi, 'Rigid Plastic');
  translated = translated.replace(/plásticos|plasticos/gi, 'Plastics');
  translated = translated.replace(/plástico|plastico/gi, 'Plastic');
  translated = translated.replace(/\bpet\b/gi, 'PET');
  translated = translated.replace(/latinhas|latinha/gi, 'Cans');
  translated = translated.replace(/alumínio|aluminio/gi, 'Aluminum');
  translated = translated.replace(/metais/gi, 'Metals');
  translated = translated.replace(/metal\./gi, 'Metal.');
  translated = translated.replace(/metal/gi, 'Metal');
  translated = translated.replace(/ferro\/aço/gi, 'Iron/Steel');
  translated = translated.replace(/ferro/gi, 'Iron');
  translated = translated.replace(/aço/gi, 'Steel');
  translated = translated.replace(/cobre/gi, 'Copper');
  translated = translated.replace(/vidro/gi, 'Glass');
  translated = translated.replace(/eletrônicos \(reee\)|eletronicos \(reee\)/gi, 'Electronics (WEEE)');
  translated = translated.replace(/eletrônicos|eletronicos/gi, 'Electronics');
  translated = translated.replace(/orgânicos|organicos/gi, 'Organics');
  translated = translated.replace(/\s+e\s+/gi, ' and ');
  translated = translated.replace(/\boutro\b|\boutros\b/gi, 'Other');

  return translated.charAt(0).toUpperCase() + translated.slice(1);
};

// Storage form translator
export const translateStorageForm = (storage?: string | null, lang?: 'pt' | 'en'): string => {
  if (!storage) return '-';
  const currentLang = getActiveLang(lang);
  if (currentLang === 'pt') return storage;

  const mapping: Record<string, string> = {
    'Sacos / Bags / Caixas': 'Bags / Boxes / Sacks',
    'Sacos de Lixo': 'Trash Bags',
    'Big Bags': 'Big Bags',
    'Caixas / Paletes': 'Boxes / Pallets',
    'Caixas': 'Boxes',
    'Paletes': 'Pallets',
    'Tambores / Bombonas': 'Drums / Barrels',
    'Tambores': 'Drums',
    'A Granel': 'In Bulk',
    'Fardos Prensados': 'Pressed Bales',
    'Caçamba Estacionária': 'Stationary Dumpster',
    'Outro': 'Other'
  };
  return mapping[storage] || storage;
};

// Frequency translator
export const translateFrequency = (freq?: string | null, lang?: 'pt' | 'en'): string => {
  if (!freq) return '-';
  const currentLang = getActiveLang(lang);
  if (currentLang === 'pt') return freq;

  const mapping: Record<string, string> = {
    '1x por mês': '1x per month',
    '1x por semana': '1x per week',
    '2x por mês': '2x per month',
    'Diário': 'Daily',
    'Semanal': 'Weekly',
    'Quinzenal': 'Biweekly',
    'Mensal': 'Monthly',
    'Bimestral': 'Bimonthly',
    'Trimestral': 'Quarterly',
    'Semestral': 'Semiannual',
    'Anual': 'Annual',
    'Esporádico': 'Sporadic',
    'Sob Demanda': 'On Demand',
    'Única Vez': 'One-time',
    'Entrega única': 'Single delivery',
    'Entrega Única': 'Single delivery',
    'Entrega única (sem recorrência)': 'Single delivery (one-off)'
  };
  return mapping[freq] || freq;
};

// Destination type translator
export const translateDestinationType = (dest?: string | null, lang?: 'pt' | 'en'): string => {
  if (!dest) return '-';
  const currentLang = getActiveLang(lang);
  const mapping: Record<'pt' | 'en', Record<string, string>> = {
    pt: {
      sale: 'Venda Comercial',
      recycler: 'Reciclador Homologado',
      coprocessing: 'Coprocessamento',
      donation: 'Doação',
      other: 'Outro'
    },
    en: {
      sale: 'Commercial Sale',
      recycler: 'Certified Recycler',
      coprocessing: 'Coprocessing',
      donation: 'Donation',
      other: 'Other'
    }
  };
  return mapping[currentLang]?.[dest] || dest;
};

// Log text dynamic translator
export const translateLogText = (text: string | null | undefined, lang?: 'pt' | 'en'): string => {
  if (!text) return '';
  const currentLang = getActiveLang(lang);
  if (currentLang === 'pt') return text;

  let translated = text;

  // Replace common action phrases
  translated = translated.replace(/alterou de\s+(.*?)\s+para\s+(.*)/i, (match, p1, p2) => {
    return `changed from ${translateProspectingStatus(p1.trim() as any, 'en')} to ${translateProspectingStatus(p2.trim() as any, 'en')}`;
  });
  translated = translated.replace(/Lead cadastrado no sistema/gi, 'Lead registered in system');
  translated = translated.replace(/Cadastrado pelo Comercial/gi, 'Registered by Commercial');
  translated = translated.replace(/Origem:/gi, 'Source:');
  translated = translated.replace(/Segmento:\s*Indústria/gi, 'Segment: Industry');
  translated = translated.replace(/Segmento:\s*Comércio/gi, 'Segment: Commerce');
  translated = translated.replace(/Segmento:\s*Serviços/gi, 'Segment: Services');
  translated = translated.replace(/Segmento:\s*Restaurante\s*\/\s*Alimentação/gi, 'Segment: Restaurant / Food Service');
  translated = translated.replace(/Segmento:/gi, 'Segment:');
  translated = translated.replace(/Status prospecção:\s*(.*)/gi, (m, p) => `Prospecting Status: ${translateProspectingStatus(p.trim() as any, 'en')}`);
  translated = translated.replace(/Atualização de Status/gi, 'Status Update');
  translated = translated.replace(/Parecer logístico registrado/gi, 'Logistics analysis submitted');
  translated = translated.replace(/Logística respondeu análise\.\s*Decisão:\s*Viável\.\s*Notas:\s*(.*)/gi, (m, notes) => `Logistics answered analysis. Decision: Feasible. Notes: ${notes}`);
  translated = translated.replace(/Logística respondeu análise\.\s*Decisão:\s*Inviável\.\s*Notas:\s*(.*)/gi, (m, notes) => `Logistics answered analysis. Decision: Infeasible. Notes: ${notes}`);
  translated = translated.replace(/Logística respondeu análise\.\s*Decisão:\s*Necessita Informações\.\s*Notas:\s*(.*)/gi, (m, notes) => `Logistics answered analysis. Decision: Needs Information. Notes: ${notes}`);
  translated = translated.replace(/Logística respondeu análise\.\s*Decisão:\s*(.*?)\.\s*Notas:\s*(.*)/gi, (m, d, notes) => `Logistics answered analysis. Decision: ${d}. Notes: ${notes}`);
  translated = translated.replace(/Lead retirado da Logística pelo responsável/gi, 'Lead withdrawn from Logistics by owner');
  translated = translated.replace(/Informações esclarecidas por Compras/gi, 'Information clarified by Commercial');

  return translated;
};

// Date formatter
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateTimeString: string | null | undefined): string => {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateTimeString;
  }
};

// Currency formatter
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Volume formatter
export const formatVolume = (val: number, unit: string): string => {
  return `${val.toLocaleString('pt-BR')} ${unit}`;
};

// CEP Formatter & Free ViaCEP Integration
export const formatCep = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const fetchAddressByCep = async (cep: string): Promise<{
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
} | null> => {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      complement: data.complemento || ''
    };
  } catch (err) {
    console.error('Error fetching CEP:', err);
    return null;
  }
};

// --- LOGISTICS SLA (GABS 5-DAY RETURN TRACKING) ---
export interface LogisticsSlaInfo {
  sentAt: Date;
  deadlineDate: Date;
  daysElapsed: number;
  daysRemaining: number;
  isOverdue: boolean;
  statusLabel: string;
  badgeVariant: 'warning' | 'danger' | 'info' | 'purple' | 'success';
}

export const getLogisticsSlaInfo = (supplier?: Supplier | null, slaDays: number = 5, lang?: 'pt' | 'en'): LogisticsSlaInfo | null => {
  if (!supplier) return null;

  // Check if logistics analysis was already completed
  const act = supplier.logistics_analyses?.[0];
  const isCompleted = Boolean(
    act && 
    act.feasibility && 
    ['FEASIBLE', 'NEED_INFO', 'INFEASIBLE'].includes(act.feasibility)
  );

  const isInLogistics = supplier.current_stage === 'LOGISTICS' || supplier.prospecting_status === 'WAITING_LOGISTICS';
  if (!isInLogistics || isCompleted) {
    return null;
  }

  // Determine when it was sent to logistics
  let sentAt: Date;
  if (supplier.sent_to_logistics_at) {
    sentAt = new Date(supplier.sent_to_logistics_at);
  } else {
    // Fallback: check status history for transition to LOGISTICS or WAITING_LOGISTICS
    const histEntry = supplier.status_history?.find(
      h => h.new_stage === 'LOGISTICS' || h.notes?.includes('WAITING_LOGISTICS') || h.notes?.toLowerCase().includes('logística')
    );
    if (histEntry?.created_at) {
      sentAt = new Date(histEntry.created_at);
    } else {
      sentAt = new Date(supplier.updated_at || supplier.created_at || Date.now());
    }
  }

  // Calculate deadline and diff
  const now = new Date();
  const deadlineDate = supplier.logistics_deadline
    ? new Date(supplier.logistics_deadline)
    : new Date(sentAt.getTime() + slaDays * 24 * 60 * 60 * 1000);

  const diffMs = now.getTime() - sentAt.getTime();
  const daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const remainingMs = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  
  const isOverdue = now.getTime() > deadlineDate.getTime() || daysRemaining < 0;

  const currentLang = getActiveLang(lang);
  let statusLabel = '';
  let badgeVariant: 'warning' | 'danger' | 'info' | 'purple' | 'success' = 'purple';

  if (isOverdue) {
    const overdueDays = Math.max(1, Math.abs(daysRemaining) || (daysElapsed - slaDays));
    statusLabel = currentLang === 'pt' 
      ? `🚨 Pendente (>5 dias: +${overdueDays}d)`
      : `🚨 Overdue (>5 days: +${overdueDays}d)`;
    badgeVariant = 'danger';
  } else if (daysRemaining === 0) {
    statusLabel = currentLang === 'pt'
      ? `⚠️ Vence hoje (${daysElapsed}d decorrido)`
      : `⚠️ Due today (${daysElapsed}d elapsed)`;
    badgeVariant = 'warning';
  } else if (daysRemaining === 1) {
    statusLabel = currentLang === 'pt'
      ? `⏳ Vence amanhã (1 dia rest.)`
      : `⏳ Due tomorrow (1 day left)`;
    badgeVariant = 'warning';
  } else {
    statusLabel = currentLang === 'pt'
      ? `⏳ No prazo (${daysRemaining} dias rest.)`
      : `⏳ On time (${daysRemaining} days left)`;
    badgeVariant = 'purple';
  }

  return {
    sentAt,
    deadlineDate,
    daysElapsed,
    daysRemaining,
    isOverdue,
    statusLabel,
    badgeVariant
  };
};

export const formatCnpj = (value: string): string => {
  const clean = value.replace(/\D/g, '').slice(0, 14);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
};

export const formatDocument = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  if (clean.length > 11) {
    return formatCnpj(clean);
  }
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
};

