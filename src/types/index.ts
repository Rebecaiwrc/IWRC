// Database Enums
export type UserRole = 'ADMIN' | 'BUYER' | 'LOGISTICS';

export type SupplierStage =
  | 'PROSPECTING'
  | 'QUALIFICATION'
  | 'LOGISTICS'
  | 'DOCUMENTATION'
  | 'COLLECTION'
  | 'OPERATION';

export type SupplierStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'INACTIVE';

// Granular status used only during the PROSPECTING/QUALIFICATION stage (Compras team)
export type ProspectingStatus =
  | 'NEW_LEAD'          // Recém cadastrado
  | 'FIRST_CONTACT'     // Contato Feito
  | 'PRESENTATION_SENT' // Apresentação Enviada
  | 'QUALIFIED'         // Qualificado — pronto para logística
  | 'WAITING_LOGISTICS'; // Aguardando Logística

export type FeasibilityStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'FEASIBLE'
  | 'INFEASIBLE'
  | 'NEED_INFO';

export type InteractionType =
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'meeting'
  | 'visit'
  | 'internal_obs'
  | 'other';

export type CollectionStatus =
  | 'SCHEDULED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AttachedDocument {
  id: string;
  name: string;
  type: 'mtr' | 'donation_letter' | 'partnership_agreement' | 'env_license' | 'cnpj_card' | 'other';
  file_url?: string;
  file_data?: string; // base64 data for local storage download
  uploaded_at: string;
  size?: string;
  notes?: string;
}

// Database Models
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Supplier {
  id: string;
  code?: string; // e.g. GER-001
  name: string;
  trade_name: string | null;
  document: string | null;
  supplier_type: string; // Segmento do Gerador
  lead_source: string;   // Como encontramos
  internal_responsible_id: string | null;
  current_stage: SupplierStage;
  current_status: SupplierStatus;
  prospecting_status: ProspectingStatus; // Granular commercial-team status
  backlog_reason: string | null;
  
  // MTR Credentials & Operational dates
  mtr_login?: string | null;
  mtr_password?: string | null;
  first_collection_date?: string | null;
  last_collection_date?: string | null;
  attached_documents?: AttachedDocument[];
  
  created_at: string;
  updated_at: string;
  
  // Joins (optional)
  responsible?: Profile | null;
  contacts?: SupplierContact[];
  address?: SupplierAddress | null;
  materials?: SupplierMaterial[];
  interactions?: SupplierInteraction[];
  tasks?: SupplierTask[];
  logistics_analyses?: LogisticsAnalysis[];
  collections?: Collection[];
  receipts?: Receipt[];
}

export interface SupplierContact {
  id: string;
  supplier_id: string;
  name: string;
  role: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface SupplierAddress {
  id: string;
  supplier_id: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  created_at: string;
}

export interface SupplierMaterial {
  id: string;
  supplier_id: string;
  material_name: string;
  category: string;
  estimated_volume: number;
  unit: string;
  frequency: string;
  transaction_type: 'purchase' | 'donation';
  price_per_kg: number;
  storage_form: string | null;
  notes: string | null;
  created_at: string;
}

export interface SupplierInteraction {
  id: string;
  supplier_id: string;
  user_id: string;
  type: InteractionType;
  description: string;
  interaction_date: string;
  interaction_time: string;
  
  // Joins
  user?: Profile;
}

export interface SupplierStatusHistory {
  id: string;
  supplier_id: string;
  old_stage: SupplierStage | null;
  new_stage: SupplierStage;
  old_status: SupplierStatus | null;
  new_status: SupplierStatus;
  user_id: string;
  notes: string | null;
  created_at: string;
  
  // Joins
  user?: Profile;
}

export interface SupplierTask {
  id: string;
  supplier_id: string;
  description: string;
  status: 'pending' | 'completed';
  due_date: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  
  // Joins
  completed_by_profile?: Profile | null;
}

export interface LogisticsAnalysis {
  id: string;
  supplier_id: string;
  distance_km: number | null;
  transport_type: string | null; // e.g. VUC, Truck, or custom
  estimated_cost: number | null;
  recommended_frequency: string | null;
  transport_responsible: string | null; // 'Terceirizado da iWrc', 'Fornecedor (entrega no Hub)', 'Empresa terceirizada', or custom
  conditioning_infrastructure_needed: string | null;
  pending_docs: string[]; // e.g. ['Aguardando documentação', 'Aguardando dados MTR', 'donation_letter', ...]
  feasibility: FeasibilityStatus;
  notes: string | null;
  analyst_id: string | null;
  analyzed_at: string;
  created_at: string;
  
  // Joins
  analyst?: Profile | null;
}

export interface Collection {
  id: string;
  supplier_id: string;
  scheduled_date: string;
  completed_date: string | null;
  status: CollectionStatus;
  driver_name: string | null;
  carrier_name: string | null;
  notes: string | null;
  created_at: string;
  
  // Joins
  supplier?: Supplier;
  items?: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  material_name: string;
  estimated_volume: number;
  unit: string;
}

export interface Receipt {
  id: string;
  supplier_id: string;
  collection_id: string | null;
  received_date: string;
  notes: string | null;
  created_at: string;
  
  // Joins
  supplier?: Supplier;
  collection?: Collection | null;
  items?: ReceiptItem[];
}

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  weight_kg: number;
  notes: string | null;
}
