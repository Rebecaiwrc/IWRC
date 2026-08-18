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
    'nav.suppliers': 'Geradores',
    'nav.logistics': 'Logística',
    'nav.collections': 'Coletas',
    'nav.receipts': 'Recebimentos',
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
    'admin.apiStatusTitle': 'Status das APIs e Integrações',
    'admin.userManagementTitle': 'Gerenciamento de Usuários e Funções',
    'admin.tableDetails': 'Detalhamento de Registros por Tabela'
  },
  en: {
    // Nav Items
    'nav.prospecting': 'Prospecting',
    'nav.suppliers': 'Waste Generators',
    'nav.logistics': 'Logistics',
    'nav.collections': 'Collections',
    'nav.receipts': 'Weighbridge / Receipts',
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
    'admin.tableDetails': 'Records Breakdown by Table'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('iwrc_lang') as Language;
    if (saved === 'en' || saved === 'pt') {
      setLanguageState(saved);
      document.documentElement.lang = saved === 'pt' ? 'pt-BR' : 'en-US';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('iwrc_lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
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
