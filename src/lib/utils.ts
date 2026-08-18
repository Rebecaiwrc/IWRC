import { 
  SupplierStage, 
  SupplierStatus, 
  FeasibilityStatus, 
  CollectionStatus, 
  InteractionType,
  ProspectingStatus
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
export const translateCollectionStatus = (status: CollectionStatus): string => {
  const mapping: Record<CollectionStatus, string> = {
    SCHEDULED: 'Agendada',
    IN_TRANSIT: 'Em Trânsito',
    COMPLETED: 'Realizada',
    CANCELLED: 'Cancelada'
  };
  return mapping[status] || status;
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
export const translateInteractionType = (type: InteractionType): string => {
  const mapping: Record<InteractionType, string> = {
    whatsapp: 'WhatsApp',
    phone: 'Ligação',
    email: 'E-mail',
    meeting: 'Reunião',
    visit: 'Visita',
    internal_obs: 'Obs. Interna',
    other: 'Outro'
  };
  return mapping[type] || type;
};

// Date formatter
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    // Format to DD/MM/YYYY
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
    // Format to DD/MM/YYYY HH:MM
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
