import { 
  Profile, 
  Supplier, 
  SupplierContact, 
  SupplierAddress, 
  SupplierMaterial, 
  SupplierInteraction, 
  SupplierStatusHistory, 
  SupplierTask, 
  LogisticsAnalysis, 
  Collection, 
  CollectionItem, 
  Receipt, 
  ReceiptItem 
} from '@/types';

export const mockProfiles: Profile[] = [
  {
    id: 'usr-gabriel-log',
    email: 'gabriel@iwrc.com.br',
    name: 'Gabriel (Logística)',
    role: 'LOGISTICS',
    created_at: '2026-08-01T12:00:00Z'
  },
  {
    id: 'usr-rebeca-buy',
    email: 'rebeca@iwrc.com.br',
    name: 'Rebeca (Compras)',
    role: 'BUYER',
    created_at: '2026-08-01T12:00:00Z'
  },
  {
    id: 'usr-pamela-buy',
    email: 'pamela@iwrc.com.br',
    name: 'Pamela (Compras)',
    role: 'BUYER',
    created_at: '2026-08-01T12:00:00Z'
  },
  {
    id: 'usr-mariaeduarda-adm',
    email: 'mariaeduarda@iwrc.com.br',
    name: 'Maria Eduarda (Gestora)',
    role: 'ADMIN',
    created_at: '2026-08-01T12:00:00Z'
  },
  {
    id: 'usr-talita-adm',
    email: 'talita@iwrc.com.br',
    name: 'Talita (Gestora)',
    role: 'ADMIN',
    created_at: '2026-08-01T12:00:00Z'
  },
  {
    id: 'usr-artur-adm',
    email: 'artur@iwrc.com.br',
    name: 'Artur (Gestor)',
    role: 'ADMIN',
    created_at: '2026-08-01T12:00:00Z'
  },
  {
    id: 'usr-aline-adm',
    email: 'admin@iwrc.com.br',
    name: 'Aline (Gestora)',
    role: 'ADMIN',
    created_at: '2026-08-01T12:00:00Z'
  }
];

// Clean database tables for fresh testing
export const mockSuppliers: Supplier[] = [];
export const mockAddresses: SupplierAddress[] = [];
export const mockContacts: SupplierContact[] = [];
export const mockMaterials: SupplierMaterial[] = [];
export const mockInteractions: SupplierInteraction[] = [];
export const mockStatusHistory: SupplierStatusHistory[] = [];
export const mockTasks: SupplierTask[] = [];
export const mockLogistics: LogisticsAnalysis[] = [];
export const mockCollections: Collection[] = [];
export const mockCollectionItems: CollectionItem[] = [];
export const mockReceipts: Receipt[] = [];
export const mockReceiptItems: ReceiptItem[] = [];
