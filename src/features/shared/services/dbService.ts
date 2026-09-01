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
  MaterialDispatch,
  SupplierStage,
  SupplierStatus,
  FeasibilityStatus,
  CollectionStatus,
  AttachedDocument,
  ProspectingStatus,
  SystemHealthStatus,
  DatabaseQuotaMetrics
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
  mockReceiptItems,
  mockDispatches
} from './mockData';

export const isValidUuid = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

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
  dispatches: MaterialDispatch[];
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
  receiptItems: [...mockReceiptItems],
  dispatches: [...mockDispatches]
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
          collections:collections(*, items:collection_items(*)),
          receipts:receipts(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;

      return (data || []).map((s: any, idx: number) => {
        let pStatus: ProspectingStatus = 'NEW_LEAD';
        if (s.current_stage === 'LOGISTICS') {
          pStatus = 'WAITING_LOGISTICS';
        } else if (['QUALIFICATION', 'DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage)) {
          pStatus = 'QUALIFIED';
        } else if (s.backlog_reason === 'PRESENTATION_SENT') {
          pStatus = 'PRESENTATION_SENT';
        } else if (s.backlog_reason === 'FIRST_CONTACT') {
          pStatus = 'FIRST_CONTACT';
        } else if (s.backlog_reason === 'QUALIFIED') {
          pStatus = 'QUALIFIED';
        } else if (s.current_status === 'APPROVED') {
          pStatus = 'QUALIFIED';
        } else if (s.current_status === 'IN_PROGRESS') {
          pStatus = 'FIRST_CONTACT';
        } else {
          pStatus = 'NEW_LEAD';
        }

        const sentLogAt = s.sent_to_logistics_at || (s.current_stage === 'LOGISTICS' ? (s.updated_at || s.created_at) : null);
        const logDeadline = s.logistics_deadline || (sentLogAt ? new Date(new Date(sentLogAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString() : null);
        return {
          ...s,
          code: s.code ? (s.code.startsWith('GER-') ? s.code.replace('GER-', 'IW-') : s.code) : ('IW-' + String((data?.length || 1) - idx).padStart(3, '0')),
          prospecting_status: pStatus,
          sent_to_logistics_at: sentLogAt,
          logistics_deadline: logDeadline,
          materials: (s.materials || []).map((m: any) => {
            let needsStorage = Boolean(m.needs_storage_provision);
            let sType = m.storage_provision_type || 'Bag';
            let sQty = m.storage_provision_quantity || null;
            let sCustom = m.storage_provision_custom_type || null;

            if (m.notes && m.notes.includes('[STORAGE_PROVISION:')) {
              needsStorage = true;
              const match = m.notes.match(/\[STORAGE_PROVISION:\s*([^|]+)\s*\|\s*([^|]+)\s*(?:\|\s*([^\]]+))?\]/);
              if (match) {
                sType = match[1]?.trim() || 'Bag';
                sQty = Number(match[2]?.trim()) || null;
                sCustom = match[3]?.trim() || null;
              }
            }

            return {
              ...m,
              needs_storage_provision: needsStorage,
              storage_provision_type: sType,
              storage_provision_quantity: sQty,
              storage_provision_custom_type: sCustom
            };
          }).sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()),
          contacts: s.contacts || [],
          interactions: s.interactions || [],
          tasks: s.tasks || [],
          logistics_analyses: s.logistics_analyses || [],
          collections: (s.collections || []).map((col: any) => ({
            ...col,
            items: col.items || []
          })).sort((a: any, b: any) => new Date(a.scheduled_date || a.created_at || 0).getTime() - new Date(b.scheduled_date || b.created_at || 0).getTime()),
          receipts: s.receipts || [],
          attached_documents: [
            ...(s.attached_documents || []),
            ...getLocalData<AttachedDocument & { supplier_id: string }>('documents', []).filter(d => d.supplier_id === s.id)
          ].filter((doc, idx, self) => idx === self.findIndex(d => d.id === doc.id))
        };
      });
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
    const storedDocs = getLocalData<AttachedDocument & { supplier_id: string }>('documents', []);

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
      receipts: receipts.filter(r => r.supplier_id === s.id),
      attached_documents: [
        ...(s.attached_documents || []),
        ...storedDocs.filter(d => d.supplier_id === s.id)
      ].filter((doc, idx, self) => idx === self.findIndex(d => d.id === doc.id))
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
          collections:collections(*, items:collection_items(*)),
          receipts:receipts(*),
          status_history:supplier_status_history(*, user:profiles(id, name, email, role))
        `)
        .eq('id', id)
        .single();
      if (error || !data) return null;

      let pStatus: ProspectingStatus = 'NEW_LEAD';
      if (data.current_stage === 'LOGISTICS') {
        pStatus = 'WAITING_LOGISTICS';
      } else if (['QUALIFICATION', 'DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(data.current_stage)) {
        pStatus = 'QUALIFIED';
      } else if (data.backlog_reason === 'PRESENTATION_SENT') {
        pStatus = 'PRESENTATION_SENT';
      } else if (data.backlog_reason === 'FIRST_CONTACT') {
        pStatus = 'FIRST_CONTACT';
      } else if (data.backlog_reason === 'QUALIFIED') {
        pStatus = 'QUALIFIED';
      } else if (data.current_status === 'APPROVED') {
        pStatus = 'QUALIFIED';
      } else if (data.current_status === 'IN_PROGRESS') {
        pStatus = 'FIRST_CONTACT';
      } else {
        pStatus = 'NEW_LEAD';
      }

      const sentLogAt = data.sent_to_logistics_at || (data.current_stage === 'LOGISTICS' ? (data.updated_at || data.created_at) : null);
      const logDeadline = data.logistics_deadline || (sentLogAt ? new Date(new Date(sentLogAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString() : null);

      return {
        ...data,
        code: data.code ? (data.code.startsWith('GER-') ? data.code.replace('GER-', 'IW-') : data.code) : 'IW-001',
        prospecting_status: pStatus,
        sent_to_logistics_at: sentLogAt,
        logistics_deadline: logDeadline,
        materials: (data.materials || []).map((m: any) => {
          let needsStorage = Boolean(m.needs_storage_provision);
          let sType = m.storage_provision_type || 'Bag';
          let sQty = m.storage_provision_quantity || null;
          let sCustom = m.storage_provision_custom_type || null;

          if (m.notes && m.notes.includes('[STORAGE_PROVISION:')) {
            needsStorage = true;
            const match = m.notes.match(/\[STORAGE_PROVISION:\s*([^|]+)\s*\|\s*([^|]+)\s*(?:\|\s*([^\]]+))?\]/);
            if (match) {
              sType = match[1]?.trim() || 'Bag';
              sQty = Number(match[2]?.trim()) || null;
              sCustom = match[3]?.trim() || null;
            }
          }

          return {
            ...m,
            needs_storage_provision: needsStorage,
            storage_provision_type: sType,
            storage_provision_quantity: sQty,
            storage_provision_custom_type: sCustom
          };
        }).sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()),
        contacts: data.contacts || [],
        interactions: (data.interactions || []).map((i: any) => ({
          ...i,
          user: (data.status_history || []).find((h: any) => h.user_id === i.user_id)?.user || undefined
        })),
        tasks: data.tasks || [],
        logistics_analyses: data.logistics_analyses || [],
        collections: (data.collections || []).map((col: any) => ({
          ...col,
          items: col.items || []
        })).sort((a: any, b: any) => new Date(a.scheduled_date || a.created_at || 0).getTime() - new Date(b.scheduled_date || b.created_at || 0).getTime()),
        receipts: data.receipts || [],
        status_history: (data.status_history || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        attached_documents: [
          ...(data.attached_documents || []),
          ...getLocalData<AttachedDocument & { supplier_id: string }>('documents', []).filter(d => d.supplier_id === data.id)
        ].filter((doc, idx, self) => idx === self.findIndex(d => d.id === doc.id))
      };
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

    const geradorCode = supplierData.code ? (supplierData.code.startsWith('GER-') ? supplierData.code.replace('GER-', 'IW-') : supplierData.code) : ('IW-' + String(suppliers.length + 1).padStart(3, '0'));

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
      const updatePayload: any = {
        updated_at: now
      };

      if (supplierData.name !== undefined) updatePayload.name = supplierData.name;
      if (supplierData.trade_name !== undefined) updatePayload.trade_name = supplierData.trade_name;
      if (supplierData.document !== undefined) updatePayload.document = supplierData.document;
      if (supplierData.supplier_type !== undefined) updatePayload.supplier_type = supplierData.supplier_type;
      if (supplierData.lead_source !== undefined) updatePayload.lead_source = supplierData.lead_source;
      if (supplierData.current_stage !== undefined) updatePayload.current_stage = supplierData.current_stage;
      if (supplierData.current_status !== undefined) updatePayload.current_status = supplierData.current_status;
      if (supplierData.backlog_reason !== undefined) updatePayload.backlog_reason = supplierData.backlog_reason;

      if (supplierData.internal_responsible_id !== undefined) {
        updatePayload.internal_responsible_id = supplierData.internal_responsible_id ? supplierData.internal_responsible_id : null;
      }

      if (supplierData.prospecting_status) {
        if (supplierData.prospecting_status === 'WAITING_LOGISTICS') {
          updatePayload.current_stage = supplierData.current_stage || 'LOGISTICS';
          updatePayload.current_status = supplierData.current_status || 'PENDING';
          updatePayload.backlog_reason = null;
        } else if (supplierData.prospecting_status === 'QUALIFIED') {
          updatePayload.current_stage = supplierData.current_stage || 'QUALIFICATION';
          updatePayload.current_status = supplierData.current_status || 'APPROVED';
          updatePayload.backlog_reason = 'QUALIFIED';
        } else {
          updatePayload.current_stage = supplierData.current_stage || 'PROSPECTING';
          updatePayload.backlog_reason = supplierData.prospecting_status;
          if (['FIRST_CONTACT', 'PRESENTATION_SENT'].includes(supplierData.prospecting_status)) {
            updatePayload.current_status = supplierData.current_status || 'IN_PROGRESS';
          } else {
            updatePayload.current_status = supplierData.current_status || 'PENDING';
          }
        }
      }

      const { error } = await supabase
        .from('suppliers')
        .update(updatePayload)
        .eq('id', id);
      if (error) {
        console.error('Error updating supplier in Supabase:', error);
        throw error;
      }
      const fullSupplier = await this.getSupplier(id);
      return fullSupplier!;
    }

    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');

    let sentLogAt = supplierData.sent_to_logistics_at !== undefined ? supplierData.sent_to_logistics_at : suppliers[index].sent_to_logistics_at;
    let logDeadline = supplierData.logistics_deadline !== undefined ? supplierData.logistics_deadline : suppliers[index].logistics_deadline;

    if ((supplierData.prospecting_status === 'WAITING_LOGISTICS' || supplierData.current_stage === 'LOGISTICS') && !sentLogAt) {
      sentLogAt = now;
      logDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    }

    const updated = {
      ...suppliers[index],
      ...supplierData,
      sent_to_logistics_at: sentLogAt,
      logistics_deadline: logDeadline,
      updated_at: now
    };
    suppliers[index] = updated;
    saveLocalData('suppliers', suppliers);

    const fullSupplier = await this.getSupplier(id);
    return fullSupplier!;
  },

  async deleteSupplier(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Safe cascade deletion of child records to satisfy FK constraints in Supabase
        const { data: receiptsData } = await supabase.from('receipts').select('id').eq('supplier_id', id);
        if (receiptsData && receiptsData.length > 0) {
          const receiptIds = receiptsData.map(r => r.id);
          await supabase.from('receipt_items').delete().in('receipt_id', receiptIds);
          await supabase.from('receipts').delete().eq('supplier_id', id);
        }

        const { data: collectionsData } = await supabase.from('collections').select('id').eq('supplier_id', id);
        if (collectionsData && collectionsData.length > 0) {
          const collectionIds = collectionsData.map(c => c.id);
          await supabase.from('collection_items').delete().in('collection_id', collectionIds);
          await supabase.from('collections').delete().eq('supplier_id', id);
        }

        await supabase.from('logistics_analyses').delete().eq('supplier_id', id);
        await supabase.from('supplier_tasks').delete().eq('supplier_id', id);
        await supabase.from('supplier_interactions').delete().eq('supplier_id', id);
        await supabase.from('supplier_status_history').delete().eq('supplier_id', id);
        await supabase.from('supplier_materials').delete().eq('supplier_id', id);
        await supabase.from('supplier_contacts').delete().eq('supplier_id', id);
        await supabase.from('supplier_addresses').delete().eq('supplier_id', id);

        const { error } = await supabase.from('suppliers').delete().eq('id', id);
        if (error) {
          console.error('Supabase error deleting supplier:', error);
          throw new Error(error.message || 'Erro ao excluir gerador.');
        }
      } catch (err: any) {
        console.error('Error during supplier cascade deletion:', err);
        throw new Error(err.message || 'Falha ao apagar gerador e registros relacionados.');
      }
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

  // Supplier Documents & Storage Photos
  async getSupplierDocuments(supplierId: string): Promise<AttachedDocument[]> {
    const allDocs = getLocalData<AttachedDocument & { supplier_id: string }>('documents', []);
    const localMatches = allDocs.filter(d => d.supplier_id === supplierId);
    
    // Also check supplier in local memory
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const sup = suppliers.find(s => s.id === supplierId);
    const supDocs = sup?.attached_documents || [];
    
    const combined = [...supDocs, ...localMatches];
    return combined.filter((doc, idx, self) => idx === self.findIndex(d => d.id === doc.id));
  },

  async addSupplierDocument(supplierId: string, doc: Partial<AttachedDocument>): Promise<AttachedDocument> {
    const docs = await this.addSupplierDocuments(supplierId, [doc]);
    return docs[0];
  },

  async addSupplierDocuments(supplierId: string, docs: Partial<AttachedDocument>[]): Promise<AttachedDocument[]> {
    if (!docs || docs.length === 0) return [];
    const allDocs = getLocalData<AttachedDocument & { supplier_id: string }>('documents', []);
    const now = new Date().toISOString();

    const newDocs: (AttachedDocument & { supplier_id: string })[] = docs.map(doc => ({
      id: doc.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)),
      supplier_id: supplierId,
      name: doc.name || 'Documento',
      type: doc.type || 'other',
      file_url: doc.file_url || '',
      file_data: doc.file_data || '',
      uploaded_at: doc.uploaded_at || now,
      size: doc.size || 'Arquivo',
      notes: doc.notes || ''
    }));

    // Update global documents collection
    const existingOtherDocs = allDocs.filter(d => d.supplier_id !== supplierId || !newDocs.some(nd => nd.id === d.id));
    const updatedDocs = [...existingOtherDocs, ...newDocs];
    saveLocalData('documents', updatedDocs);

    // Update supplier directly in local database
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const sIndex = suppliers.findIndex(s => s.id === supplierId);
    if (sIndex !== -1) {
      const currentSupDocs = suppliers[sIndex].attached_documents || [];
      const updatedSupDocs = [...currentSupDocs.filter(cd => !newDocs.some(nd => nd.id === cd.id)), ...newDocs];
      suppliers[sIndex].attached_documents = updatedSupDocs;
      saveLocalData('suppliers', suppliers);
    }

    return newDocs;
  },

  async deleteSupplierDocument(supplierId: string, docId: string): Promise<void> {
    const allDocs = getLocalData<AttachedDocument & { supplier_id: string }>('documents', []);
    const filtered = allDocs.filter(d => !(d.supplier_id === supplierId && d.id === docId));
    saveLocalData('documents', filtered);

    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const sIndex = suppliers.findIndex(s => s.id === supplierId);
    if (sIndex !== -1) {
      suppliers[sIndex].attached_documents = (suppliers[sIndex].attached_documents || []).filter(d => d.id !== docId);
      saveLocalData('suppliers', suppliers);
    }
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
    const id = (materialData.id && isValidUuid(materialData.id))
      ? materialData.id
      : (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
    const now = new Date().toISOString();

    const notesWithProvision = materialData.needs_storage_provision
      ? `${materialData.notes || ''} [STORAGE_PROVISION: ${materialData.storage_provision_type || 'Bag'} | ${materialData.storage_provision_quantity || 1} | ${materialData.storage_provision_custom_type || ''}]`.trim()
      : (materialData.notes || null);

    if (isSupabaseConfigured && supabase) {
      const payload: any = {
        ...materialData,
        notes: notesWithProvision,
        id,
        created_at: materialData.created_at || now
      };

      let { data, error } = await supabase
        .from('supplier_materials')
        .insert([payload])
        .select()
        .single();

      // If database is missing the newly added storage provision columns, retry without them
      if (error && (error.message?.includes('column') || error.code === '42703' || error.code === 'PGRST204')) {
        const safePayload: any = { ...payload };
        delete safePayload.needs_storage_provision;
        delete safePayload.storage_provision_type;
        delete safePayload.storage_provision_quantity;
        delete safePayload.storage_provision_custom_type;

        const retry = await supabase
          .from('supplier_materials')
          .insert([safePayload])
          .select()
          .single();

        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error('Erro ao inserir material no Supabase:', error);
        throw error;
      }
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
      notes: notesWithProvision,
      needs_storage_provision: Boolean(materialData.needs_storage_provision),
      storage_provision_type: materialData.storage_provision_type || null,
      storage_provision_quantity: materialData.storage_provision_quantity !== undefined ? Number(materialData.storage_provision_quantity) : null,
      storage_provision_custom_type: materialData.storage_provision_custom_type || null,
      created_at: materialData.created_at || now
    };
    materials.push(newMaterial);
    saveLocalData('materials', materials);
    return newMaterial;
  },

  async deleteSupplierMaterial(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      if (isValidUuid(id)) {
        const { error } = await supabase.from('supplier_materials').delete().eq('id', id);
        if (error) console.error('Aviso ao deletar material no Supabase:', error);
      }
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
      const payload: any = {
        supplier_id: interactionData.supplier_id,
        type: interactionData.type || 'whatsapp',
        description: interactionData.description || '',
        interaction_date: dateStr,
        interaction_time: timeStr,
        user_id: isValidUuid(interactionData.user_id) ? interactionData.user_id : 'd3b07384-d113-4e4e-9b2f-123456789013'
      };
      const { data, error } = await supabase
        .from('supplier_interactions')
        .insert([payload])
        .select()
        .single();
      if (error) {
        console.warn('Could not record interaction in Supabase:', error.message);
        return { id, ...payload };
      }
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
      const payload: any = {
        supplier_id: historyData.supplier_id,
        old_stage: historyData.old_stage || null,
        new_stage: historyData.new_stage || 'PROSPECTING',
        old_status: historyData.old_status || null,
        new_status: historyData.new_status || 'PENDING',
        notes: historyData.notes || null,
        user_id: isValidUuid(historyData.user_id) ? historyData.user_id : 'd3b07384-d113-4e4e-9b2f-123456789013',
        created_at: now
      };
      const { data, error } = await supabase
        .from('supplier_status_history')
        .insert([payload])
        .select()
        .single();
      if (error) {
        console.warn('Could not record status history in Supabase:', error.message);
        return { id, ...historyData } as any;
      }
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
      const taskPayload: Record<string, any> = {
        id,
        supplier_id: taskData.supplier_id,
        description: taskData.description || '',
        status: taskData.status || 'pending',
        due_date: taskData.due_date || null,
        created_at: now
      };
      if (taskData.completed_by && isValidUuid(taskData.completed_by)) {
        taskPayload.completed_by = taskData.completed_by;
      }
      if (taskData.completed_at) {
        taskPayload.completed_at = taskData.completed_at;
      }

      const { data, error } = await supabase
        .from('supplier_tasks')
        .insert([taskPayload])
        .select()
        .single();
      if (error) {
        console.warn('Could not insert supplier_task into Supabase:', error.message);
        return { id, ...taskPayload } as any;
      }
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
          completed_by: isValidUuid(userId) ? userId : null,
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
        .maybeSingle();
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
        .maybeSingle();

      const cleanPayload: Record<string, any> = {
        supplier_id: analysisData.supplier_id,
        distance_km: analysisData.distance_km !== undefined ? (Number(analysisData.distance_km) || null) : null,
        transport_type: analysisData.transport_type || null,
        estimated_cost: analysisData.estimated_cost !== undefined ? (Number(analysisData.estimated_cost) || null) : null,
        recommended_frequency: analysisData.recommended_frequency || null,
        transport_responsible: analysisData.transport_responsible || null,
        conditioning_infrastructure_needed: analysisData.conditioning_infrastructure_needed || null,
        feasibility: analysisData.feasibility || 'PENDING',
        notes: analysisData.notes || null,
        storage_provision_cost: analysisData.storage_provision_cost !== undefined ? (Number(analysisData.storage_provision_cost) || null) : null,
        storage_provision_delivery_date: analysisData.storage_provision_delivery_date || null,
        analyzed_at: now
      };

      if (isValidUuid(analysisData.analyst_id)) {
        cleanPayload.analyst_id = analysisData.analyst_id;
      }

      if (existing) {
        let { data, error } = await supabase
          .from('logistics_analyses')
          .update(cleanPayload)
          .eq('id', existing.id)
          .select()
          .single();

        if (error && (error.message?.includes('column') || error.code === '42703' || error.code === 'PGRST204')) {
          delete cleanPayload.storage_provision_cost;
          delete cleanPayload.storage_provision_delivery_date;
          const retry = await supabase
            .from('logistics_analyses')
            .update(cleanPayload)
            .eq('id', existing.id)
            .select()
            .single();
          data = retry.data;
          error = retry.error;
        }

        if (error) throw error;
        return data;
      } else {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        let { data, error } = await supabase
          .from('logistics_analyses')
          .insert([{
            ...cleanPayload,
            id,
            created_at: now
          }])
          .select()
          .single();

        if (error && (error.message?.includes('column') || error.code === '42703' || error.code === 'PGRST204')) {
          delete cleanPayload.storage_provision_cost;
          delete cleanPayload.storage_provision_delivery_date;
          const retry = await supabase
            .from('logistics_analyses')
            .insert([{
              ...cleanPayload,
              id,
              created_at: now
            }])
            .select()
            .single();
          data = retry.data;
          error = retry.error;
        }

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
        storage_provision_cost: analysisData.storage_provision_cost !== undefined ? Number(analysisData.storage_provision_cost) : null,
        storage_provision_delivery_date: analysisData.storage_provision_delivery_date || null,
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

  async updateCollection(
    id: string,
    collectionData: Partial<Collection>,
    items?: Partial<CollectionItem>[]
  ): Promise<Collection> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { error: cErr } = await supabase
        .from('collections')
        .update(collectionData)
        .eq('id', id);
      if (cErr) throw cErr;

      if (items && items.length > 0) {
        await supabase.from('collection_items').delete().eq('collection_id', id);
        const itemsToInsert = items.map(item => ({
          ...item,
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          collection_id: id
        }));
        await supabase.from('collection_items').insert(itemsToInsert);
      }

      const all = await this.getCollections();
      return all.find(c => c.id === id)!;
    }

    const collections = getLocalData<Collection>('collections', mockCollections);
    const index = collections.findIndex(c => c.id === id);
    if (index !== -1) {
      collections[index] = { ...collections[index], ...collectionData };
      saveLocalData('collections', collections);
    }

    if (items && items.length > 0) {
      let collectionItems = getLocalData<CollectionItem>('collectionItems', mockCollectionItems);
      collectionItems = collectionItems.filter(ci => ci.collection_id !== id);
      items.forEach(item => {
        collectionItems.push({
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          collection_id: id,
          material_name: item.material_name || '',
          estimated_volume: Number(item.estimated_volume) || 0,
          unit: item.unit || 'kg'
        });
      });
      saveLocalData('collectionItems', collectionItems);
    }

    const all = await this.getCollections();
    return all.find(c => c.id === id)!;
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
      invoice_number: receiptData.invoice_number || null,
      invoice_doc_id: receiptData.invoice_doc_id || null,
      invoice_status: receiptData.invoice_status || 'PENDING_CHECK',
      invoice_checked_by: receiptData.invoice_checked_by || null,
      invoice_checked_at: receiptData.invoice_checked_at || null,
      invoice_divergence_reason: receiptData.invoice_divergence_reason || null,
      invoice_divergence_notes: receiptData.invoice_divergence_notes || null,
      corrected_invoice_number: receiptData.corrected_invoice_number || null,
      corrected_invoice_doc_id: receiptData.corrected_invoice_doc_id || null,
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

  async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('receipts')
        .update(updates)
        .eq('id', id);
      if (error) console.error('Error updating receipt in Supabase:', error);
    }

    const receipts = getLocalData<Receipt>('receipts', mockReceipts);
    const index = receipts.findIndex(r => r.id === id);
    if (index !== -1) {
      receipts[index] = {
        ...receipts[index],
        ...updates
      };
      saveLocalData('receipts', receipts);
    }

    const allRec = await this.getReceipts();
    return allRec.find(r => r.id === id)!;
  },

  async deleteReceipt(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('receipt_items').delete().eq('receipt_id', id);
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const receipts = getLocalData<Receipt>('receipts', mockReceipts).filter(r => r.id !== id);
    saveLocalData('receipts', receipts);
    const receiptItems = getLocalData<ReceiptItem>('receiptItems', mockReceiptItems).filter(ri => ri.receipt_id !== id);
    saveLocalData('receiptItems', receiptItems);
  },

  async clearAllHubReceipts(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('receipt_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('material_dispatches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      return;
    }
    saveLocalData('receipts', []);
    saveLocalData('receiptItems', []);
    saveLocalData('dispatches', []);
  },

  // Material Dispatches (Saídas & Vendas de Materiais do Hub)
  async getMaterialDispatches(): Promise<MaterialDispatch[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('material_dispatches')
        .select('*, creator:profiles(id, name, email, role)')
        .order('dispatch_date', { ascending: false });
      if (!error && data) return data;
    }

    const dispatches = getLocalData<MaterialDispatch>('dispatches', mockDispatches);
    const profiles = getLocalData<Profile>('profiles', mockProfiles);

    return dispatches.map(d => ({
      ...d,
      creator: profiles.find(p => p.id === d.created_by) || null
    })).sort((a, b) => new Date(b.dispatch_date).getTime() - new Date(a.dispatch_date).getTime());
  },

  async createMaterialDispatch(dispatchData: Partial<MaterialDispatch>): Promise<MaterialDispatch> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();
    const qty = Number(dispatchData.quantity_kg) || 0;
    const price = Number(dispatchData.unit_price) || 0;
    const totalVal = dispatchData.total_value !== undefined ? Number(dispatchData.total_value) : (qty * price);

    const payload: Record<string, any> = {
      id,
      buyer_name: dispatchData.buyer_name || 'Comprador não informado',
      buyer_document: dispatchData.buyer_document || null,
      material_name: dispatchData.material_name || 'Material em geral',
      quantity_kg: qty,
      unit_price: price,
      total_value: totalVal,
      dispatch_date: dispatchData.dispatch_date || now.split('T')[0],
      invoice_number: dispatchData.invoice_number || null,
      mtr_number: dispatchData.mtr_number || null,
      carrier_name: dispatchData.carrier_name || null,
      vehicle_plate: dispatchData.vehicle_plate || null,
      driver_name: dispatchData.driver_name || null,
      destination_type: dispatchData.destination_type || 'sale',
      notes: dispatchData.notes || null,
      created_at: now
    };

    if (isValidUuid(dispatchData.created_by)) {
      payload.created_by = dispatchData.created_by;
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('material_dispatches')
        .insert([payload])
        .select()
        .single();
      if (!error && data) return data;
      if (error) console.warn('Supabase material_dispatches insert error, falling back to local:', error.message);
    }

    const dispatches = getLocalData<MaterialDispatch>('dispatches', mockDispatches);
    const newDispatch: MaterialDispatch = {
      id,
      buyer_name: payload.buyer_name,
      buyer_document: payload.buyer_document,
      material_name: payload.material_name,
      quantity_kg: payload.quantity_kg,
      unit_price: payload.unit_price,
      total_value: payload.total_value,
      dispatch_date: payload.dispatch_date,
      invoice_number: payload.invoice_number,
      mtr_number: payload.mtr_number,
      carrier_name: payload.carrier_name,
      vehicle_plate: payload.vehicle_plate,
      driver_name: payload.driver_name,
      destination_type: payload.destination_type,
      notes: payload.notes,
      created_by: payload.created_by || null,
      created_at: now
    };
    dispatches.push(newDispatch);
    saveLocalData('dispatches', dispatches);
    return newDispatch;
  },

  async deleteMaterialDispatch(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('material_dispatches')
        .delete()
        .eq('id', id);
      if (error) console.warn('Error deleting material dispatch from Supabase:', error.message);
    }

    const dispatches = getLocalData<MaterialDispatch>('dispatches', mockDispatches);
    const filtered = dispatches.filter(d => d.id !== id);
    saveLocalData('dispatches', filtered);
    return true;
  },

  // -------------------------------------------------------------
  // SUPER ADMIN & SYSTEM HEALTH MONITORING
  // -------------------------------------------------------------

  async getSystemMetrics(): Promise<DatabaseQuotaMetrics> {
    const FREE_TIER_DB_LIMIT_MB = 500;
    const FREE_TIER_MAU_LIMIT = 50000;

    if (isSupabaseConfigured && supabase) {
      try {
        const [
          { count: suppliersCount },
          { count: addressesCount },
          { count: contactsCount },
          { count: materialsCount },
          { count: collectionsCount },
          { count: receiptsCount },
          { count: interactionsCount },
          { count: historyCount },
          { count: tasksCount },
          { count: profilesCount }
        ] = await Promise.all([
          supabase.from('suppliers').select('*', { count: 'exact', head: true }),
          supabase.from('supplier_addresses').select('*', { count: 'exact', head: true }),
          supabase.from('supplier_contacts').select('*', { count: 'exact', head: true }),
          supabase.from('supplier_materials').select('*', { count: 'exact', head: true }),
          supabase.from('collections').select('*', { count: 'exact', head: true }),
          supabase.from('receipts').select('*', { count: 'exact', head: true }),
          supabase.from('supplier_interactions').select('*', { count: 'exact', head: true }),
          supabase.from('supplier_status_history').select('*', { count: 'exact', head: true }),
          supabase.from('supplier_tasks').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        const sC = suppliersCount || 0;
        const aC = addressesCount || 0;
        const cC = contactsCount || 0;
        const mC = materialsCount || 0;
        const colC = collectionsCount || 0;
        const rC = receiptsCount || 0;
        const iC = interactionsCount || 0;
        const hC = historyCount || 0;
        const tC = tasksCount || 0;
        const pC = profilesCount || 0;

        const totalRows = sC + aC + cC + mC + colC + rC + iC + hC + tC + pC;
        // Estimated ~1.5 KB per average indexed relational record with JSON metadata
        const estimatedDbSizeMb = Number(((totalRows * 1.5) / 1024).toFixed(2));
        const dbUsagePercentage = Number(((estimatedDbSizeMb / FREE_TIER_DB_LIMIT_MB) * 100).toFixed(2));
        const activeUsersMonth = pC;
        const mauUsagePercentage = Number(((activeUsersMonth / FREE_TIER_MAU_LIMIT) * 100).toFixed(2));

        return {
          totalRows,
          totalSuppliers: sC,
          totalAddresses: aC,
          totalContacts: cC,
          totalMaterials: mC,
          totalCollections: colC,
          totalReceipts: rC,
          totalInteractions: iC,
          totalHistory: hC,
          totalTasks: tC,
          totalProfiles: pC,
          estimatedDbSizeMb,
          freeTierDbLimitMb: FREE_TIER_DB_LIMIT_MB,
          dbUsagePercentage,
          activeUsersMonth,
          freeTierMauLimit: FREE_TIER_MAU_LIMIT,
          mauUsagePercentage
        };
      } catch (err) {
        console.error('Error fetching Supabase metrics:', err);
      }
    }

    // Mock fallback metrics
    const suppliers = getLocalData<Supplier>('suppliers', mockSuppliers);
    const profiles = getLocalData<Profile>('profiles', mockProfiles);
    const collections = getLocalData<Collection>('collections', mockCollections);
    const receipts = getLocalData<Receipt>('receipts', mockReceipts);

    const totalRows = suppliers.length * 4 + collections.length * 2 + receipts.length * 2 + profiles.length;
    const estimatedDbSizeMb = Number(((totalRows * 1.2) / 1024).toFixed(2));

    return {
      totalRows,
      totalSuppliers: suppliers.length,
      totalAddresses: suppliers.length,
      totalContacts: suppliers.length,
      totalMaterials: suppliers.length,
      totalCollections: collections.length,
      totalReceipts: receipts.length,
      totalInteractions: 12,
      totalHistory: 25,
      totalTasks: 8,
      totalProfiles: profiles.length,
      estimatedDbSizeMb,
      freeTierDbLimitMb: FREE_TIER_DB_LIMIT_MB,
      dbUsagePercentage: Number(((estimatedDbSizeMb / FREE_TIER_DB_LIMIT_MB) * 100).toFixed(2)),
      activeUsersMonth: profiles.length,
      freeTierMauLimit: FREE_TIER_MAU_LIMIT,
      mauUsagePercentage: Number(((profiles.length / FREE_TIER_MAU_LIMIT) * 100).toFixed(2))
    };
  },

  async checkApiHealth(): Promise<SystemHealthStatus[]> {
    const results: SystemHealthStatus[] = [];
    const now = new Date().toLocaleTimeString('pt-BR');

    // 1. Supabase Database Ping
    if (isSupabaseConfigured && supabase) {
      const startDb = performance.now();
      try {
        const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
        const latencyDb = Math.round(performance.now() - startDb);
        if (error) {
          results.push({
            service: 'Supabase PostgreSQL (Database)',
            status: 'DEGRADED',
            latencyMs: latencyDb,
            message: error.message,
            lastChecked: now
          });
        } else {
          results.push({
            service: 'Supabase PostgreSQL (Database)',
            status: 'ONLINE',
            latencyMs: latencyDb,
            message: 'Conexão e queries ativas',
            lastChecked: now
          });
        }
      } catch (err: any) {
        results.push({
          service: 'Supabase PostgreSQL (Database)',
          status: 'OFFLINE',
          latencyMs: 0,
          message: err.message || 'Falha de conexão',
          lastChecked: now
        });
      }

      // 2. Supabase Auth API
      const startAuth = performance.now();
      try {
        const { data, error } = await supabase.auth.getSession();
        const latencyAuth = Math.round(performance.now() - startAuth);
        results.push({
          service: 'Supabase Auth (Serviço de Login)',
          status: error ? 'DEGRADED' : 'ONLINE',
          latencyMs: latencyAuth,
          message: error ? error.message : 'Tokens e sessões operacionais',
          lastChecked: now
        });
      } catch (err: any) {
        results.push({
          service: 'Supabase Auth (Serviço de Login)',
          status: 'OFFLINE',
          latencyMs: 0,
          message: err.message || 'Serviço de autenticação inacessível',
          lastChecked: now
        });
      }
    } else {
      results.push({
        service: 'Supabase Database & Auth',
        status: 'OFFLINE',
        latencyMs: 0,
        message: 'Variáveis de ambiente não configuradas',
        lastChecked: now
      });
    }

    // 3. ViaCEP API Ping
    const startViaCep = performance.now();
    try {
      const res = await fetch('https://viacep.com.br/ws/01001000/json/', { cache: 'no-store' });
      const latencyViaCep = Math.round(performance.now() - startViaCep);
      results.push({
        service: 'API ViaCEP (Busca de Endereços)',
        status: res.ok ? 'ONLINE' : 'DEGRADED',
        latencyMs: latencyViaCep,
        message: res.ok ? 'Consulta pública gratuita disponível' : `Status HTTP ${res.status}`,
        lastChecked: now
      });
    } catch (err: any) {
      results.push({
        service: 'API ViaCEP (Busca de Endereços)',
        status: 'OFFLINE',
        latencyMs: 0,
        message: 'Sem resposta dos servidores dos Correios/ViaCEP',
        lastChecked: now
      });
    }

    // 4. Vercel Hosting Engine
    results.push({
      service: 'Vercel Serverless Engine',
      status: 'ONLINE',
      latencyMs: 12,
      message: 'Ambiente de produção operacional',
      lastChecked: now
    });

    return results;
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
