import { isSupabaseConfigured, supabase } from '@/lib/supabase';
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
  ReceiptItem,
  SupplierStage,
  SupplierStatus,
  FeasibilityStatus,
  CollectionStatus,
  AttachedDocument
} from '@/types';
import {
  mockProfiles,
  mockSuppliers,
  mockAddresses,
  mockContacts,
  mockMaterials,
  mockInteractions,
  mockStatusHistory,
  mockTasks,
  mockLogistics,
  mockCollections,
  mockCollectionItems,
  mockReceipts,
  mockReceiptItems
} from './mockData';

// --- IN-MEMORY BACKUP FOR SERVER-SIDE RENDERING ---
let memoryDb: {
  profiles: Profile[];
  suppliers: Supplier[];
  addresses: SupplierAddress[];
  contacts: SupplierContact[];
  materials: SupplierMaterial[];
  interactions: SupplierInteraction[];
  statusHistory: SupplierStatusHistory[];
  tasks: SupplierTask[];
  logistics: LogisticsAnalysis[];
  collections: Collection[];
  collectionItems: CollectionItem[];
  receipts: Receipt[];
  receiptItems: ReceiptItem[];
} = {
  profiles: [...mockProfiles],
  suppliers: [...mockSuppliers],
  addresses: [...mockAddresses],
  contacts: [...mockContacts],
  materials: [...mockMaterials],
  interactions: [...mockInteractions],
  statusHistory: [...mockStatusHistory],
  tasks: [...mockTasks],
  logistics: [...mockLogistics],
  collections: [...mockCollections],
  collectionItems: [...mockCollectionItems],
  receipts: [...mockReceipts],
  receiptItems: [...mockReceiptItems]
};

// Helper for local storage
const isBrowser = typeof window !== 'undefined';

function getLocalData<T>(key: string, defaultVal: T[]): T[] {
  if (!isBrowser) {
    return memoryDb[key as keyof typeof memoryDb] as unknown as T[];
  }
  const data = localStorage.getItem(`iwrc_${key}`);
  if (!data) {
    localStorage.setItem(`iwrc_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
}

function saveLocalData<T>(key: string, data: T[]): void {
  if (isBrowser) {
    localStorage.setItem(`iwrc_${key}`, JSON.stringify(data));
  } else {
    (memoryDb as any)[key] = data;
  }
}

// Initialise Local Database on load in browser
if (isBrowser) {
  // Always update profiles with latest mockProfiles definitions
  saveLocalData('profiles', mockProfiles);
  getLocalData('suppliers', mockSuppliers);
  getLocalData('addresses', mockAddresses);
  getLocalData('contacts', mockContacts);
  getLocalData('materials', mockMaterials);
  getLocalData('interactions', mockInteractions);
  getLocalData('statusHistory', mockStatusHistory);
  getLocalData('tasks', mockTasks);
  getLocalData('logistics', mockLogistics);
  getLocalData('collections', mockCollections);
  getLocalData('collectionItems', mockCollectionItems);
  getLocalData('receipts', mockReceipts);
  getLocalData('receiptItems', mockReceiptItems);
}

// --- DATABASE SERVICE IMPLEMENTATION ---
export const dbService = {
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data || [];
    }
    return mockProfiles;
  },

  async getProfile(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    }
    const profiles = getLocalData<Profile>('profiles', mockProfiles);
    return profiles.find(p => p.id === id) || null;
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          responsible:profiles(id, name, email, role),
          address:supplier_addresses(*),
          contacts:supplier_contacts(*),
          materials:supplier_materials(*),
          interactions:supplier_interactions(*),
          tasks:supplier_tasks(*),
          logistics_analyses:logistics_analyses(*),
          collections:collections(*),
          receipts:receipts(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    // Local Storage Mock Join Query
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const profiles = getLocalData<Profile>('profiles', mockProfiles);
    const addresses = getLocalData<SupplierAddress>('addresses', mockAddresses);
    const contacts = getLocalData<SupplierContact>('contacts', mockContacts);
    const materials = getLocalData<SupplierMaterial>('materials', mockMaterials);
    const interactions = getLocalData<SupplierInteraction>('interactions', mockInteractions);
    const tasks = getLocalData<SupplierTask>('tasks', mockTasks);
    const logistics = getLocalData<LogisticsAnalysis>('logistics', mockLogistics);
    const collections = getLocalData<Collection>('collections', mockCollections);
    const receipts = getLocalData<Receipt>('receipts', mockReceipts);

    return suppliers.map(s => ({
      ...s,
      responsible: profiles.find(p => p.id === s.internal_responsible_id) || null,
      address: addresses.find(a => a.supplier_id === s.id) || null,
      contacts: contacts.filter(c => c.supplier_id === s.id),
      materials: materials.filter(m => m.supplier_id === s.id),
      interactions: interactions.filter(i => i.supplier_id === s.id),
      tasks: tasks.filter(t => t.supplier_id === s.id),
      logistics_analyses: logistics.filter(l => l.supplier_id === s.id),
      collections: collections.filter(col => col.supplier_id === s.id),
      receipts: receipts.filter(r => r.supplier_id === s.id)
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getSupplier(id: string): Promise<Supplier | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          responsible:profiles(id, name, email, role),
          address:supplier_addresses(*),
          contacts:supplier_contacts(*),
          materials:supplier_materials(*),
          interactions:supplier_interactions(*),
          tasks:supplier_tasks(*),
          logistics_analyses:logistics_analyses(*),
          collections:collections(*),
          receipts:receipts(*)
        `)
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    }

    const suppliers = await this.getSuppliers();
    return suppliers.find(s => s.id === id) || null;
  },

  async createSupplier(
    supplierData: Partial<Supplier>,
    addressData: Partial<SupplierAddress>,
    contactData: Partial<SupplierContact>
  ): Promise<Supplier> {
    const supplierId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // 1. Insert Supplier with sanitized columns matching PostgreSQL schema
      const supplierPayload: any = {
        name: supplierData.name,
        trade_name: supplierData.trade_name || supplierData.name,
        document: supplierData.document || null,
        supplier_type: supplierData.supplier_type || 'Indústria',
        lead_source: supplierData.lead_source || 'Busca própria',
        current_stage: supplierData.current_stage || 'PROSPECTING',
        current_status: supplierData.current_status || 'PENDING',
        backlog_reason: supplierData.backlog_reason || null,
      };

      if (supplierData.internal_responsible_id && supplierData.internal_responsible_id.trim() !== '') {
        supplierPayload.internal_responsible_id = supplierData.internal_responsible_id;
      }

      const { data: supplier, error: sErr } = await supabase
        .from('suppliers')
        .insert([supplierPayload])
        .select()
        .single();
      
      if (sErr) {
        console.error('Error inserting supplier:', sErr);
        throw sErr;
      }

      const insertedSupplierId = supplier.id;

      // 2. Insert Address
      if (addressData) {
        const { error: aErr } = await supabase
          .from('supplier_addresses')
          .insert([{
            supplier_id: insertedSupplierId,
            zip_code: addressData.zip_code || '',
            street: addressData.street || '',
            number: addressData.number || '',
            complement: addressData.complement || null,
            neighborhood: addressData.neighborhood || '',
            city: addressData.city || '',
            state: addressData.state || ''
          }]);
        if (aErr) {
          console.error('Error inserting supplier address:', aErr);
        }
      }

      // 3. Insert Contact
      if (contactData) {
        const { error: cErr } = await supabase
          .from('supplier_contacts')
          .insert([{
            supplier_id: insertedSupplierId,
            name: contactData.name || supplierData.name || 'Contato Principal',
            role: contactData.role || null,
            phone: contactData.phone || null,
            whatsapp: contactData.whatsapp || null,
            email: contactData.email || null,
            is_primary: true
          }]);
        if (cErr) {
          console.error('Error inserting supplier contact:', cErr);
        }
      }

      const fullSupplier = await this.getSupplier(insertedSupplierId);
      if (!fullSupplier) return supplier as Supplier;
      return fullSupplier;
    }

    // Local Storage Mock
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const addresses = getLocalData<SupplierAddress>('addresses', mockAddresses);
    const contacts = getLocalData<SupplierContact>('contacts', mockContacts);

    const geradorCode = supplierData.code || ('GER-' + String(suppliers.length + 1).padStart(3, '0'));

    const newSupplier: Supplier = {
      id: supplierId,
      code: geradorCode,
      name: supplierData.name || '',
      trade_name: supplierData.trade_name || null,
      document: supplierData.document || null,
      supplier_type: supplierData.supplier_type || '',
      lead_source: supplierData.lead_source || '',
      internal_responsible_id: supplierData.internal_responsible_id || null,
      current_stage: supplierData.current_stage || 'PROSPECTING',
      current_status: supplierData.current_status || 'PENDING',
      prospecting_status: supplierData.prospecting_status || 'NEW_LEAD',
      backlog_reason: supplierData.backlog_reason || null,
      mtr_login: supplierData.mtr_login || null,
      mtr_password: supplierData.mtr_password || null,
      first_collection_date: supplierData.first_collection_date || null,
      last_collection_date: supplierData.last_collection_date || null,
      attached_documents: supplierData.attached_documents || [],
      created_at: now,
      updated_at: now
    };

    const newAddress: SupplierAddress = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      supplier_id: supplierId,
      zip_code: addressData.zip_code || '',
      street: addressData.street || '',
      number: addressData.number || '',
      complement: addressData.complement || null,
      neighborhood: addressData.neighborhood || '',
      city: addressData.city || '',
      state: addressData.state || '',
      created_at: now
    };

    const newContact: SupplierContact = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      supplier_id: supplierId,
      name: contactData.name || '',
      role: contactData.role || null,
      phone: contactData.phone || null,
      whatsapp: contactData.whatsapp || null,
      email: contactData.email || null,
      is_primary: true,
      created_at: now
    };

    suppliers.push(newSupplier);
    addresses.push(newAddress);
    contacts.push(newContact);

    saveLocalData('suppliers', suppliers);
    saveLocalData('addresses', addresses);
    saveLocalData('contacts', contacts);

    // Track status history
    await this.addSupplierStatusHistory({
      supplier_id: supplierId,
      old_stage: null,
      new_stage: newSupplier.current_stage,
      old_status: null,
      new_status: newSupplier.current_status,
      user_id: newSupplier.internal_responsible_id || 'd3b07384-d113-4e4e-9b2f-123456789013',
      notes: 'Cadastro inicial do fornecedor'
    });

    const fullSupplier = await this.getSupplier(supplierId);
    return fullSupplier!;
  },

  async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<Supplier> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('suppliers')
        .update({
          ...supplierData,
          updated_at: now
        })
        .eq('id', id);
      if (error) throw error;
      const fullSupplier = await this.getSupplier(id);
      return fullSupplier!;
    }

    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');

    const updated = {
      ...suppliers[index],
      ...supplierData,
      updated_at: now
    };
    suppliers[index] = updated;
    saveLocalData('suppliers', suppliers);

    const fullSupplier = await this.getSupplier(id);
    return fullSupplier!;
  },

  async deleteSupplier(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('suppliers').delete().eq('id', id);
      return;
    }

    // Local Storage Mock cascade delete
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers).filter(s => s.id !== id);
    saveLocalData('suppliers', suppliers);

    const addresses = getLocalData<SupplierAddress>('addresses', mockAddresses).filter(a => a.supplier_id !== id);
    saveLocalData('addresses', addresses);

    const contacts = getLocalData<SupplierContact>('contacts', mockContacts).filter(c => c.supplier_id !== id);
    saveLocalData('contacts', contacts);

    const materials = getLocalData<SupplierMaterial>('materials', mockMaterials).filter(m => m.supplier_id !== id);
    saveLocalData('materials', materials);

    const interactions = getLocalData<SupplierInteraction>('interactions', mockInteractions).filter(i => i.supplier_id !== id);
    saveLocalData('interactions', interactions);

    const statusHistory = getLocalData<SupplierStatusHistory>('statusHistory', mockStatusHistory).filter(sh => sh.supplier_id !== id);
    saveLocalData('statusHistory', statusHistory);

    const tasks = getLocalData<SupplierTask>('tasks', mockTasks).filter(t => t.supplier_id !== id);
    saveLocalData('tasks', tasks);

    const logistics = getLocalData<LogisticsAnalysis>('logistics', mockLogistics).filter(l => l.supplier_id !== id);
    saveLocalData('logistics', logistics);

    const collections = getLocalData<Collection>('collections', mockCollections).filter(c => c.supplier_id !== id);
    saveLocalData('collections', collections);

    const receipts = getLocalData<Receipt>('receipts', mockReceipts).filter(r => r.supplier_id !== id);
    saveLocalData('receipts', receipts);
  },

  // Supplier Documents
  async addSupplierDocument(supplierId: string, doc: Partial<AttachedDocument>): Promise<void> {
    await this.addSupplierDocuments(supplierId, [doc]);
  },

  async addSupplierDocuments(supplierId: string, docs: Partial<AttachedDocument>[]): Promise<void> {
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const index = suppliers.findIndex(s => s.id === supplierId);
    if (index === -1) return;

    const newDocs: AttachedDocument[] = docs.map(doc => ({
      id: doc.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)),
      name: doc.name || 'Documento',
      type: doc.type || 'other',
      file_url: doc.file_url || '',
      file_data: doc.file_data || '',
      uploaded_at: doc.uploaded_at || new Date().toISOString(),
      size: doc.size || 'Arquivo',
      notes: doc.notes || ''
    }));

    const currentDocs = suppliers[index].attached_documents || [];
    suppliers[index].attached_documents = [...currentDocs, ...newDocs];
    saveLocalData('suppliers', suppliers);
  },

  async deleteSupplierDocument(supplierId: string, docId: string): Promise<void> {
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const index = suppliers.findIndex(s => s.id === supplierId);
    if (index === -1) return;

    suppliers[index].attached_documents = (suppliers[index].attached_documents || []).filter(d => d.id !== docId);
    saveLocalData('suppliers', suppliers);
  },
  async addSupplierContact(contactData: Partial<SupplierContact>): Promise<SupplierContact> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('supplier_contacts')
        .insert([{
          ...contactData,
          id,
          created_at: now
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const contacts = getLocalData<SupplierContact>('contacts', mockContacts);
    if (contactData.is_primary) {
      // Mark others as non-primary
      contacts.forEach(c => {
        if (c.supplier_id === contactData.supplier_id) c.is_primary = false;
      });
    }

    const newContact: SupplierContact = {
      id,
      supplier_id: contactData.supplier_id || '',
      name: contactData.name || '',
      role: contactData.role || null,
      phone: contactData.phone || null,
      whatsapp: contactData.whatsapp || null,
      email: contactData.email || null,
      is_primary: contactData.is_primary || false,
      created_at: now
    };
    contacts.push(newContact);
    saveLocalData('contacts', contacts);
    return newContact;
  },

  async deleteSupplierContact(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('supplier_contacts').delete().eq('id', id);
      if (error) throw error;
      return;
    }

    const contacts = getLocalData<SupplierContact>('contacts', mockContacts);
    const filtered = contacts.filter(c => c.id !== id);
    saveLocalData('contacts', filtered);
  },

  // Supplier Materials
  async addSupplierMaterial(materialData: Partial<SupplierMaterial>): Promise<SupplierMaterial> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('supplier_materials')
        .insert([{
          ...materialData,
          id,
          created_at: now
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const materials = getLocalData<SupplierMaterial>('materials', mockMaterials);
    const newMaterial: SupplierMaterial = {
      id,
      supplier_id: materialData.supplier_id || '',
      material_name: materialData.material_name || '',
      category: materialData.category || '',
      estimated_volume: Number(materialData.estimated_volume) || 0,
      unit: materialData.unit || 'kg',
      frequency: materialData.frequency || 'monthly',
      transaction_type: (materialData.transaction_type as any) || 'donation',
      price_per_kg: Number(materialData.price_per_kg) || 0,
      storage_form: materialData.storage_form || null,
      notes: materialData.notes || null,
      created_at: now
    };
    materials.push(newMaterial);
    saveLocalData('materials', materials);
    return newMaterial;
  },

  async deleteSupplierMaterial(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('supplier_materials').delete().eq('id', id);
      if (error) throw error;
      return;
    }

    const materials = getLocalData<SupplierMaterial>('materials', mockMaterials);
    const filtered = materials.filter(m => m.id !== id);
    saveLocalData('materials', filtered);
  },

  // Supplier Interactions
  async addSupplierInteraction(interactionData: Partial<SupplierInteraction>): Promise<SupplierInteraction> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('supplier_interactions')
        .insert([{
          ...interactionData,
          id,
          interaction_date: dateStr,
          interaction_time: timeStr
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const interactions = getLocalData<SupplierInteraction>('interactions', mockInteractions);
    const newInteraction: SupplierInteraction = {
      id,
      supplier_id: interactionData.supplier_id || '',
      user_id: interactionData.user_id || 'd3b07384-d113-4e4e-9b2f-123456789013',
      type: interactionData.type || 'whatsapp',
      description: interactionData.description || '',
      interaction_date: dateStr,
      interaction_time: timeStr
    };
    interactions.push(newInteraction);
    saveLocalData('interactions', interactions);
    return newInteraction;
  },

  // Supplier Status History
  async getSupplierStatusHistory(supplierId: string): Promise<SupplierStatusHistory[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('supplier_status_history')
        .select('*, user:profiles(id, name, email, role)')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    const history = getLocalData<SupplierStatusHistory>('statusHistory', mockStatusHistory);
    const profiles = getLocalData<Profile>('profiles', mockProfiles);

    return history
      .filter(h => h.supplier_id === supplierId)
      .map(h => ({
        ...h,
        user: profiles.find(p => p.id === h.user_id) || undefined
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addSupplierStatusHistory(historyData: Partial<SupplierStatusHistory>): Promise<SupplierStatusHistory> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('supplier_status_history')
        .insert([{
          ...historyData,
          id,
          created_at: now
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const history = getLocalData<SupplierStatusHistory>('statusHistory', mockStatusHistory);
    const newHistory: SupplierStatusHistory = {
      id,
      supplier_id: historyData.supplier_id || '',
      old_stage: historyData.old_stage || null,
      new_stage: historyData.new_stage || 'PROSPECTING',
      old_status: historyData.old_status || null,
      new_status: historyData.new_status || 'PENDING',
      user_id: historyData.user_id || 'd3b07384-d113-4e4e-9b2f-123456789013',
      notes: historyData.notes || null,
      created_at: now
    };
    history.push(newHistory);
    saveLocalData('statusHistory', history);
    return newHistory;
  },

  // Supplier Tasks (Pendências)
  async getSupplierTasks(supplierId: string): Promise<SupplierTask[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('supplier_tasks')
        .select('*, completed_by_profile:profiles(id, name, email, role)')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    const tasks = getLocalData<SupplierTask>('tasks', mockTasks);
    const profiles = getLocalData<Profile>('profiles', mockProfiles);

    return tasks
      .filter(t => t.supplier_id === supplierId)
      .map(t => ({
        ...t,
        completed_by_profile: profiles.find(p => p.id === t.completed_by) || null
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addSupplierTask(taskData: Partial<SupplierTask>): Promise<SupplierTask> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('supplier_tasks')
        .insert([{
          ...taskData,
          id,
          status: 'pending',
          created_at: now
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const tasks = getLocalData<SupplierTask>('tasks', mockTasks);
    const newTask: SupplierTask = {
      id,
      supplier_id: taskData.supplier_id || '',
      description: taskData.description || '',
      status: 'pending',
      due_date: taskData.due_date || null,
      completed_by: null,
      completed_at: null,
      created_at: now
    };
    tasks.push(newTask);
    saveLocalData('tasks', tasks);
    return newTask;
  },

  async completeSupplierTask(id: string, userId: string): Promise<SupplierTask> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('supplier_tasks')
        .update({
          status: 'completed',
          completed_by: userId,
          completed_at: now
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const tasks = getLocalData<SupplierTask>('tasks', mockTasks);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');

    const updatedTask = {
      ...tasks[index],
      status: 'completed' as const,
      completed_by: userId,
      completed_at: now
    };
    tasks[index] = updatedTask;
    saveLocalData('tasks', tasks);
    return updatedTask;
  },

  // Logistics
  async getLogisticsAnalyses(): Promise<LogisticsAnalysis[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('logistics_analyses')
        .select('*, analyst:profiles(id, name, email, role)');
      if (error) throw error;
      return data || [];
    }

    const logistics = getLocalData<LogisticsAnalysis>('logistics', mockLogistics);
    const profiles = getLocalData<Profile>('profiles', mockProfiles);

    return logistics.map(l => ({
      ...l,
      analyst: profiles.find(p => p.id === l.analyst_id) || null
    }));
  },

  async getLogisticsAnalysisForSupplier(supplierId: string): Promise<LogisticsAnalysis | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('logistics_analyses')
        .select('*, analyst:profiles(id, name, email, role)')
        .eq('supplier_id', supplierId)
        .single();
      if (error) return null;
      return data;
    }

    const analyses = await this.getLogisticsAnalyses();
    return analyses.find(l => l.supplier_id === supplierId) || null;
  },

  async createOrUpdateLogisticsAnalysis(analysisData: Partial<LogisticsAnalysis>): Promise<LogisticsAnalysis> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // Check if exists
      const { data: existing } = await supabase
        .from('logistics_analyses')
        .select('id')
        .eq('supplier_id', analysisData.supplier_id)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('logistics_analyses')
          .update({
            ...analysisData,
            analyzed_at: now
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        const { data, error } = await supabase
          .from('logistics_analyses')
          .insert([{
            ...analysisData,
            id,
            analyzed_at: now,
            created_at: now
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }

    const logistics = getLocalData<LogisticsAnalysis>('logistics', mockLogistics);
    const index = logistics.findIndex(l => l.supplier_id === analysisData.supplier_id);

    if (index !== -1) {
      const updated = {
        ...logistics[index],
        ...analysisData,
        analyzed_at: now
      };
      logistics[index] = updated;
      saveLocalData('logistics', logistics);
      return updated;
    } else {
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      const newAnalysis: LogisticsAnalysis = {
        id,
        supplier_id: analysisData.supplier_id || '',
        distance_km: analysisData.distance_km !== undefined ? Number(analysisData.distance_km) : null,
        transport_type: analysisData.transport_type || null,
        estimated_cost: analysisData.estimated_cost !== undefined ? Number(analysisData.estimated_cost) : null,
        recommended_frequency: analysisData.recommended_frequency || null,
        transport_responsible: analysisData.transport_responsible || null,
        conditioning_infrastructure_needed: analysisData.conditioning_infrastructure_needed || null,
        pending_docs: analysisData.pending_docs || [],
        feasibility: analysisData.feasibility || 'PENDING',
        notes: analysisData.notes || null,
        analyst_id: analysisData.analyst_id || 'd3b07384-d113-4e4e-9b2f-123456789014',
        analyzed_at: now,
        created_at: now
      };
      logistics.push(newAnalysis);
      saveLocalData('logistics', logistics);
      return newAnalysis;
    }
  },

  async saveLogisticsAnalysis(analysisData: Partial<LogisticsAnalysis>): Promise<LogisticsAnalysis> {
    return this.createOrUpdateLogisticsAnalysis(analysisData);
  },

  // Collections (Coletas)
  async getCollections(): Promise<Collection[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('collections')
        .select('*, items:collection_items(*), supplier:suppliers(*)');
      if (error) throw error;
      return data || [];
    }

    const collections = getLocalData<Collection>('collections', mockCollections);
    const colItems = getLocalData<CollectionItem>('collectionItems', mockCollectionItems);
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);

    return collections.map(c => ({
      ...c,
      supplier: suppliers.find(s => s.id === c.supplier_id) || undefined,
      items: colItems.filter(ci => ci.collection_id === c.id)
    })).sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
  },

  async createCollection(collectionData: Partial<Collection>, items: Partial<CollectionItem>[]): Promise<Collection> {
    const collectionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data: collection, error: cErr } = await supabase
        .from('collections')
        .insert([{
          ...collectionData,
          id: collectionId,
          created_at: now
        }])
        .select()
        .single();
      if (cErr) throw cErr;

      const itemsToInsert = items.map(item => ({
        ...item,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        collection_id: collectionId
      }));

      const { error: iErr } = await supabase.from('collection_items').insert(itemsToInsert);
      if (iErr) throw iErr;

      const allCol = await this.getCollections();
      return allCol.find(c => c.id === collectionId)!;
    }

    const collections = getLocalData<Collection>('collections', mockCollections);
    const collectionItems = getLocalData<CollectionItem>('collectionItems', mockCollectionItems);

    const newCollection: Collection = {
      id: collectionId,
      supplier_id: collectionData.supplier_id || '',
      scheduled_date: collectionData.scheduled_date || '',
      completed_date: null,
      status: collectionData.status || 'SCHEDULED',
      driver_name: collectionData.driver_name || null,
      carrier_name: collectionData.carrier_name || null,
      notes: collectionData.notes || null,
      created_at: now
    };

    collections.push(newCollection);
    saveLocalData('collections', collections);

    items.forEach(item => {
      const newItem: CollectionItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        collection_id: collectionId,
        material_name: item.material_name || '',
        estimated_volume: Number(item.estimated_volume) || 0,
        unit: item.unit || 'kg'
      };
      collectionItems.push(newItem);
    });
    saveLocalData('collectionItems', collectionItems);

    const allCol = await this.getCollections();
    return allCol.find(c => c.id === collectionId)!;
  },

  async updateCollectionStatus(
    id: string,
    status: CollectionStatus,
    driverName?: string | null,
    carrierName?: string | null,
    completedDate?: string | null
  ): Promise<Collection> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('collections')
        .update({
          status,
          driver_name: driverName,
          carrier_name: carrierName,
          completed_date: completedDate
        })
        .eq('id', id);
      if (error) throw error;
      const all = await this.getCollections();
      return all.find(c => c.id === id)!;
    }

    const collections = getLocalData<Collection>('collections', mockCollections);
    const index = collections.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Collection not found');

    collections[index] = {
      ...collections[index],
      status,
      driver_name: driverName !== undefined ? driverName : collections[index].driver_name,
      carrier_name: carrierName !== undefined ? carrierName : collections[index].carrier_name,
      completed_date: completedDate !== undefined ? completedDate : collections[index].completed_date
    };

    saveLocalData('collections', collections);
    const all = await this.getCollections();
    return all.find(c => c.id === id)!;
  },

  // Receipts (Recebimentos)
  async getReceipts(): Promise<Receipt[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('receipts')
        .select('*, items:receipt_items(*), supplier:suppliers(*), collection:collections(*)');
      if (error) throw error;
      return data || [];
    }

    const receipts = getLocalData<Receipt>('receipts', mockReceipts);
    const recItems = getLocalData<ReceiptItem>('receiptItems', mockReceiptItems);
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const collections = getLocalData<Collection>('collections', mockCollections);

    return receipts.map(r => ({
      ...r,
      supplier: suppliers.find(s => s.id === r.supplier_id) || undefined,
      collection: collections.find(c => c.id === r.collection_id) || null,
      items: recItems.filter(ri => ri.receipt_id === r.id)
    })).sort((a, b) => new Date(b.received_date).getTime() - new Date(a.received_date).getTime());
  },

  async createReceipt(receiptData: Partial<Receipt>, items: Partial<ReceiptItem>[]): Promise<Receipt> {
    const receiptId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data: receipt, error: rErr } = await supabase
        .from('receipts')
        .insert([{
          ...receiptData,
          id: receiptId,
          created_at: now
        }])
        .select()
        .single();
      if (rErr) throw rErr;

      const itemsToInsert = items.map(item => ({
        ...item,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        receipt_id: receiptId
      }));

      const { error: iErr } = await supabase.from('receipt_items').insert(itemsToInsert);
      if (iErr) throw iErr;

      const allRec = await this.getReceipts();
      return allRec.find(r => r.id === receiptId)!;
    }

    const receipts = getLocalData<Receipt>('receipts', mockReceipts);
    const receiptItems = getLocalData<ReceiptItem>('receiptItems', mockReceiptItems);

    const newReceipt: Receipt = {
      id: receiptId,
      supplier_id: receiptData.supplier_id || '',
      collection_id: receiptData.collection_id || null,
      received_date: receiptData.received_date || new Date().toISOString().split('T')[0],
      notes: receiptData.notes || null,
      created_at: now
    };

    receipts.push(newReceipt);
    saveLocalData('receipts', receipts);

    items.forEach(item => {
      const newItem: ReceiptItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        receipt_id: receiptId,
        material_name: item.material_name || '',
        quantity: Number(item.quantity) || 0,
        unit: item.unit || 'kg',
        weight_kg: Number(item.weight_kg) || 0,
        notes: item.notes || null
      };
      receiptItems.push(newItem);
    });
    saveLocalData('receiptItems', receiptItems);

    // If receipt is tied to a collection, make sure collection status becomes completed
    if (receiptData.collection_id) {
      await this.updateCollectionStatus(receiptData.collection_id, 'COMPLETED', undefined, undefined, newReceipt.received_date);
    }

    const allRec = await this.getReceipts();
    return allRec.find(r => r.id === receiptId)!;
  },

  // Clear / Reset All Data
  async clearDatabase(): Promise<void> {
    const keys = [
      'suppliers', 'addresses', 'contacts', 'materials',
      'interactions', 'statusHistory', 'tasks', 'logistics',
      'collections', 'collectionItems', 'receipts', 'receiptItems'
    ];
    if (typeof window !== 'undefined') {
      keys.forEach(k => localStorage.setItem(`iwrc_${k}`, JSON.stringify([])));
    }
    keys.forEach(k => {
      (memoryDb as any)[k] = [];
    });
  }
};
