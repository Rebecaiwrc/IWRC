'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Nav Items
    'nav.prospecting': 'Prospecção',
    'nav.logistics': 'Logística',
    'nav.purchasing': 'Compras',
    'nav.suppliers': 'Geradores',
    'nav.collections': 'Coletas',
    'nav.receipts': 'Recebimentos',
    'nav.dispatches': 'Saídas do Hub',
    'nav.dashboard': 'Dashboard',
    'nav.masterPanel': 'Painel Master',
    'nav.settings': 'Configurações',
    'nav.logout': 'Sair do Sistema',

    // Role Names
    'role.superAdmin': 'Super Admin',
    'role.admin': 'Gestão',
    'role.buyer': 'Comercial',
    'role.logistics': 'Logística',

    // Kanban Funnel Columns
    'funnel.newLead': 'Novo Lead',
    'funnel.firstContact': 'Contato Feito',
    'funnel.presentationSent': 'Apresentação Enviada',
    'funnel.qualified': 'Qualificado',
    'funnel.waitingLogistics': 'Aguardando Logística',

    // Stages
    'stage.prospecting': 'Prospecção',
    'stage.qualification': 'Qualificação',
    'stage.logistics': 'Logística',
    'stage.documentation': 'Documentação',
    'stage.collection': 'Coleta',
    'stage.operation': 'Operação',

    // Statuses
    'status.pending': 'Pendente',
    'status.inProgress': 'Em Andamento',
    'status.approved': 'Aprovado',
    'status.rejected': 'Rejeitado',
    'status.completed': 'Concluído',
    'status.inactive': 'Inativo',

    // Feasibility
    'feasibility.feasible': 'Viável',
    'feasibility.infeasible': 'Inviável',
    'feasibility.needInfo': 'Precisa de Info',
    'feasibility.pending': 'Pendente',

    // Common Buttons & Actions
    'action.newLead': 'Novo Lead',
    'action.newSupplier': 'Novo Gerador',
    'action.scheduleCollection': 'Agendar Coleta',
    'action.newReceipt': 'Registrar Recebimento',
    'action.save': 'Salvar',
    'action.saving': 'Salvando...',
    'action.cancel': 'Cancelar',
    'action.delete': 'Excluir',
    'action.edit': 'Editar',
    'action.export': 'Exportar',
    'action.filter': 'Filtrar',
    'action.search': 'Buscar por nome, cidade ou responsável...',
    'action.refresh': 'Atualizar',
    'action.close': 'Fechar',
    'action.confirm': 'Confirmar',
    'action.goToErp': 'Ir para o ERP',
    'action.back': 'Voltar',

    // Settings Page
    'settings.title': 'Configurações & Perfil',
    'settings.subtitle': 'Gerencie seus dados pessoais, preferências de alertas, idioma e segurança de acesso.',
    'settings.languageTitle': 'Idioma do Sistema (Language)',
    'settings.languageSubtitle': 'Escolha o idioma de exibição para todas as telas do ERP.',
    'settings.personalData': 'Dados Pessoais',
    'settings.displayName': 'Nome de Exibição',
    'settings.corporateEmail': 'E-mail Corporativo',
    'settings.securityTitle': 'Segurança & Alteração de Senha',
    'settings.securitySubtitle': 'Para atualizar sua senha, digite a senha atual e confirme a nova senha.',
    'settings.currentPassword': 'Senha Atual (Antiga)',
    'settings.newPassword': 'Nova Senha',
    'settings.confirmNewPassword': 'Confirmar Nova Senha',
    'settings.updatePasswordBtn': 'Atualizar Minha Senha',
    'settings.alertPreferences': 'Preferências de Alertas',
    'settings.notifyLeads': 'Novos Leads e Prospecção',
    'settings.notifyCollections': 'Agendamento de Coletas',

    // Master Panel
    'admin.masterHub': 'Painel Master',
    'admin.online': 'Sistema 100% Online',
    'admin.controlTitle': 'Centro de Controle & Infraestrutura',
    'admin.controlSubtitle': 'Gerencie usuários corporativos, monitore a saúde das conexões com o Supabase e acompanhe as cotas de consumo em tempo real.',
    'admin.createUser': 'Criar Novo Usuário',
    'admin.supabaseUsage': 'Uso do Supabase DB',
    'admin.totalRows': 'Total de Linhas Gravadas',
    'admin.teamUsers': 'Usuários / Equipe',
    'admin.apiServices': 'APIs & Serviços',
    'admin.testConnections': 'Testar Conexões Agora',
    // Prospecting Page
    'prospecting.title': 'Funil Comercial de Prospecção',
    'prospecting.subtitle': 'Arraste os cards entre as etapas para avançar no processo de negociação e homologação de geradores.',
    'prospecting.hubSorocaba': 'Hub Sorocaba',
    'prospecting.sorocabaCount': 'Fornecedores Mapeados no Hub',
    'prospecting.activeLeads': 'Leads em Negociação',
    'prospecting.readyLogistics': 'Prontos para Logística',
    'prospecting.viewKanban': 'Visão Kanban',
    'prospecting.viewTable': 'Visão Lista',
    'prospecting.searchPlaceholder': 'Buscar por empresa, segmento, cidade...',
    'prospecting.filterAll': 'Todos os Segmentos',
    'prospecting.newLeadModalTitle': 'Cadastrar Novo Lead',
    'prospecting.moveCardAlert': 'Movido para',

    // Suppliers Page
    'suppliers.title': 'Geradores & Fornecedores de Resíduos',
    'suppliers.subtitle': 'Gestão completa do ciclo de vida dos parceiros: da prospecção até a operação contínua.',
    'suppliers.totalRegistered': 'Total Cadastrados',
    'suppliers.inOperation': 'Em Operação Contínua',
    'suppliers.searchPlaceholder': 'Buscar por razão social, nome fantasia, CNPJ...',
    'suppliers.tabAll': 'Todos',
    'suppliers.tabProspecting': 'Prospecção',
    'suppliers.tabLogistics': 'Logística',
    'suppliers.tabDocumentation': 'Documentação',
    'suppliers.tabCollection': 'Coleta',
    'suppliers.tabOperation': 'Operação',
    'suppliers.colName': 'Gerador / Razão Social',
    'suppliers.colSegment': 'Segmento',
    'suppliers.colCity': 'Cidade/UF',
    'suppliers.colStage': 'Etapa Atual',
    'suppliers.colStatus': 'Status',
    'suppliers.colResponsible': 'Responsável',
    'suppliers.actions': 'Ações',
    'suppliers.view360': 'Ver Ficha 360º',

    // Logistics Page
    'logistics.title': 'Fila de Análise e Viabilidade Logística',
    'logistics.subtitle': 'Avalie rotas, frete estimado, cubagem e viabilidade operacional para coleta de materiais.',
    'logistics.pendingAnalysis': 'Pendentes de Análise',
    'logistics.feasibleCount': 'Aprovados / Viáveis',
    'logistics.infeasibleCount': 'Inviáveis',
    'logistics.colSupplier': 'Gerador',
    'logistics.colAddress': 'Endereço de Coleta',
    'logistics.colMaterials': 'Materiais Declarados',
    'logistics.colFeasibility': 'Parecer Logístico',
    'logistics.colDistance': 'Distância Estimada',
    'logistics.colCost': 'Custo Frete',
    'logistics.btnAnalyze': 'Emitir Parecer',

    // Collections Page
    'collections.title': 'Programação e Agendamento de Coletas',
    'collections.subtitle': 'Controle ordens de coleta, motoristas, veículos e janelas de atendimento nos geradores.',
    'collections.scheduled': 'Agendadas',
    'collections.inTransit': 'Em Trânsito',
    'collections.completed': 'Concluídas Hoje',
    'collections.btnNew': 'Agendar Nova Coleta',
    'collections.colCode': 'Ordem #',
    'collections.colGenerator': 'Gerador',
    'collections.colDate': 'Data Agendada',
    'collections.colVehicle': 'Veículo / Motorista',
    'collections.colStatus': 'Status da Coleta',

    // Receipts Page
    'receipts.title': 'Balança e Recebimento de Cargas',
    'receipts.subtitle': 'Registro de pesagem de entrada, pesagem de saída, MTR digital e cálculo de peso líquido.',
    'receipts.grossWeight': 'Peso Bruto',
    'receipts.tareWeight': 'Tara (Veículo)',
    'receipts.netWeight': 'Peso Líquido',
    'receipts.btnNewReceipt': 'Novo Ticket de Pesagem',
    'receipts.colTicket': 'Ticket #',
    'receipts.colPlate': 'Placa do Veículo',
    'receipts.colMaterial': 'Material / Resíduo',
    'receipts.colNet': 'Peso Líquido (kg)',
    'receipts.colMtr': 'Número MTR',

    // Dashboard Page
    'dashboard.title': 'Visão Geral Executiva',
    'dashboard.subtitle': 'Métricas operacionais, volume de captação de resíduos e performance do Hub Sorocaba.',
    'dashboard.totalVolume': 'Volume Total Captado',
    'dashboard.activeSuppliers': 'Geradores Ativos',
    'dashboard.conversionRate': 'Taxa de Conversão de Leads',
    'dashboard.averageFreight': 'Custo Médio de Frete/kg'
  },
  en: {
    // Nav Items
    'nav.prospecting': 'Prospecting',
    'nav.logistics': 'Logistics',
    'nav.purchasing': 'Purchasing',
    'nav.suppliers': 'Waste Generators',
    'nav.collections': 'Collections',
    'nav.receipts': 'Weighbridge / Receipts',
    'nav.dispatches': 'Hub Dispatches',
    'nav.dashboard': 'Dashboard',
    'nav.masterPanel': 'Master Hub',
    'nav.settings': 'Settings',
    'nav.logout': 'Sign Out',

    // Role Names
    'role.superAdmin': 'Super Admin',
    'role.admin': 'Management',
    'role.buyer': 'Commercial',
    'role.logistics': 'Logistics',

    // Kanban Funnel Columns
    'funnel.newLead': 'New Lead',
    'funnel.firstContact': 'Contact Made',
    'funnel.presentationSent': 'Presentation Sent',
    'funnel.qualified': 'Qualified',
    'funnel.waitingLogistics': 'Awaiting Logistics',

    // Stages
    'stage.prospecting': 'Prospecting',
    'stage.qualification': 'Qualification',
    'stage.logistics': 'Logistics',
    'stage.documentation': 'Documentation',
    'stage.collection': 'Collection',
    'stage.operation': 'Operation',

    // Statuses
    'status.pending': 'Pending',
    'status.inProgress': 'In Progress',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.completed': 'Completed',
    'status.inactive': 'Inactive',

    // Feasibility
    'feasibility.feasible': 'Feasible',
    'feasibility.infeasible': 'Infeasible',
    'feasibility.needInfo': 'Needs Info',
    'feasibility.pending': 'Pending',

    // Common Buttons & Actions
    'action.newLead': 'New Lead',
    'action.newSupplier': 'New Generator',
    'action.scheduleCollection': 'Schedule Collection',
    'action.newReceipt': 'Record Weighbridge Receipt',
    'action.save': 'Save',
    'action.saving': 'Saving...',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.export': 'Export',
    'action.filter': 'Filter',
    'action.search': 'Search by name, city or responsible...',
    'action.refresh': 'Refresh',
    'action.close': 'Close',
    'action.confirm': 'Confirm',
    'action.goToErp': 'Go to ERP',
    'action.back': 'Back',

    // Settings Page
    'settings.title': 'Settings & Profile',
    'settings.subtitle': 'Manage your personal details, notification alerts, language, and account security.',
    'settings.languageTitle': 'System Language',
    'settings.languageSubtitle': 'Choose the display language for all ERP screens.',
    'settings.personalData': 'Personal Details',
    'settings.displayName': 'Display Name',
    'settings.corporateEmail': 'Corporate Email',
    'settings.securityTitle': 'Security & Password Change',
    'settings.securitySubtitle': 'To change your password, enter your current password and confirm the new one.',
    'settings.currentPassword': 'Current Password (Old)',
    'settings.newPassword': 'New Password',
    'settings.confirmNewPassword': 'Confirm New Password',
    'settings.updatePasswordBtn': 'Update My Password',
    'settings.alertPreferences': 'Alert Preferences',
    'settings.notifyLeads': 'New Leads & Prospecting Alerts',
    'settings.notifyCollections': 'Collection Scheduling Alerts',

    // Master Panel
    'admin.masterHub': 'Master Hub',
    'admin.online': 'System 100% Operational',
    'admin.controlTitle': 'Control Center & Infrastructure',
    'admin.controlSubtitle': 'Manage corporate user accounts, monitor Supabase database connections, and track quotas in real time.',
    'admin.createUser': 'Create New User',
    'admin.supabaseUsage': 'Supabase DB Storage',
    'admin.totalRows': 'Total Database Records',
    'admin.teamUsers': 'Team Members / Users',
    'admin.apiServices': 'APIs & Services',
    'admin.testConnections': 'Test Connections Now',
    'admin.apiStatusTitle': 'APIs & Integrations Status',
    'admin.userManagementTitle': 'User & Role Access Management',
    'admin.tableDetails': 'Records Breakdown by Table',

    // Prospecting Page
    'prospecting.title': 'Commercial Prospecting Funnel',
    'prospecting.subtitle': 'Drag and drop cards between stages to advance negotiation and homologation.',
    'prospecting.hubSorocaba': 'Sorocaba Hub',
    'prospecting.sorocabaCount': 'Mapped Suppliers in Hub',
    'prospecting.activeLeads': 'Active Negotiation Leads',
    'prospecting.readyLogistics': 'Ready for Logistics',
    'prospecting.viewKanban': 'Kanban View',
    'prospecting.viewTable': 'List View',
    'prospecting.searchPlaceholder': 'Search by company, segment, city...',
    'prospecting.filterAll': 'All Segments',
    'prospecting.newLeadModalTitle': 'Register New Lead',
    'prospecting.moveCardAlert': 'Moved to',

    // Suppliers Page
    'suppliers.title': 'Waste Generators & Suppliers',
    'suppliers.subtitle': 'Complete partner lifecycle management: from initial outreach to ongoing operation.',
    'suppliers.totalRegistered': 'Total Registered',
    'suppliers.inOperation': 'In Continuous Operation',
    'suppliers.searchPlaceholder': 'Search by company name, trade name, tax ID (CNPJ)...',
    'suppliers.tabAll': 'All',
    'suppliers.tabProspecting': 'Prospecting',
    'suppliers.tabLogistics': 'Logistics',
    'suppliers.tabDocumentation': 'Documentation',
    'suppliers.tabCollection': 'Collection',
    'suppliers.tabOperation': 'Operation',
    'suppliers.colName': 'Generator / Legal Name',
    'suppliers.colSegment': 'Segment',
    'suppliers.colCity': 'City / State',
    'suppliers.colStage': 'Current Stage',
    'suppliers.colStatus': 'Status',
    'suppliers.colResponsible': 'Responsible',
    'suppliers.actions': 'Actions',
    'suppliers.view360': 'View 360º File',

    // Logistics Page
    'logistics.title': 'Logistics & Feasibility Queue',
    'logistics.subtitle': 'Evaluate routes, estimated freight, volume cubing, and operational viability.',
    'logistics.pendingAnalysis': 'Pending Analysis',
    'logistics.feasibleCount': 'Approved / Feasible',
    'logistics.infeasibleCount': 'Infeasible',
    'logistics.colSupplier': 'Generator',
    'logistics.colAddress': 'Collection Address',
    'logistics.colMaterials': 'Declared Materials',
    'logistics.colFeasibility': 'Logistics Opinion',
    'logistics.colDistance': 'Estimated Distance',
    'logistics.colCost': 'Freight Cost',
    'logistics.btnAnalyze': 'Submit Opinion',

    // Collections Page
    'collections.title': 'Collection Scheduling & Dispatch',
    'collections.subtitle': 'Manage collection orders, drivers, trucks, and pickup windows at waste generators.',
    'collections.scheduled': 'Scheduled',
    'collections.inTransit': 'In Transit',
    'collections.completed': 'Completed Today',
    'collections.btnNew': 'Schedule New Pickup',
    'collections.colCode': 'Order #',
    'collections.colGenerator': 'Generator',
    'collections.colDate': 'Scheduled Date',
    'collections.colVehicle': 'Truck / Driver',
    'collections.colStatus': 'Pickup Status',

    // Receipts Page
    'receipts.title': 'Weighbridge & Inbound Cargo',
    'receipts.subtitle': 'Gross weight check, tare weight deduction, digital waste manifesto (MTR) and net calculation.',
    'receipts.grossWeight': 'Gross Weight',
    'receipts.tareWeight': 'Tare Weight',
    'receipts.netWeight': 'Net Weight',
    'receipts.btnNewReceipt': 'New Weighbridge Ticket',
    'receipts.colTicket': 'Ticket #',
    'receipts.colPlate': 'License Plate',
    'receipts.colMaterial': 'Material / Waste',
    'receipts.colNet': 'Net Weight (kg)',
    'receipts.colMtr': 'MTR Number',

    // Dashboard Page
    'dashboard.title': 'Executive Dashboard',
    'dashboard.subtitle': 'Operational metrics, waste capture tonnage, and Sorocaba Hub performance.',
    'dashboard.totalVolume': 'Total Captured Volume',
    'dashboard.activeSuppliers': 'Active Generators',
    'dashboard.conversionRate': 'Lead Conversion Rate',
    'dashboard.averageFreight': 'Average Freight / kg'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('iwrc_lang') as Language;
      if (saved === 'en' || saved === 'pt') {
        setLanguageState(saved);
        document.documentElement.lang = saved === 'pt' ? 'pt-BR' : 'en-US';
      }
    } catch (e) {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('iwrc_lang', lang);
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
    } catch (e) {}
  };

  const toggleLanguage = () => {
    const next = language === 'pt' ? 'en' : 'pt';
    setLanguage(next);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
