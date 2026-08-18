-- Create custom database enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'BUYER', 'LOGISTICS');
CREATE TYPE supplier_stage AS ENUM ('PROSPECTING', 'QUALIFICATION', 'LOGISTICS', 'DOCUMENTATION', 'COLLECTION', 'OPERATION');
CREATE TYPE supplier_status AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'COMPLETED', 'INACTIVE');
CREATE TYPE feasibility_status AS ENUM ('PENDING', 'IN_PROGRESS', 'FEASIBLE', 'INFEASIBLE', 'NEED_INFO');
CREATE TYPE interaction_type AS ENUM ('whatsapp', 'phone', 'email', 'meeting', 'visit', 'internal_obs', 'other');
CREATE TYPE collection_status AS ENUM ('SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'BUYER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Suppliers Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trade_name TEXT,
    document TEXT,
    supplier_type TEXT NOT NULL,
    lead_source TEXT NOT NULL,
    internal_responsible_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    current_stage supplier_stage NOT NULL DEFAULT 'PROSPECTING',
    current_status supplier_status NOT NULL DEFAULT 'PENDING',
    backlog_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Supplier Contacts Table
CREATE TABLE supplier_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Supplier Addresses Table
CREATE TABLE supplier_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE UNIQUE,
    zip_code TEXT NOT NULL,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Supplier Materials Table
CREATE TABLE supplier_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_volume NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    frequency TEXT NOT NULL,
    transaction_type TEXT NOT NULL DEFAULT 'donation', -- 'purchase' or 'donation'
    price_per_kg NUMERIC DEFAULT 0,
    storage_form TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Supplier Interactions Table
CREATE TABLE supplier_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    type interaction_type NOT NULL DEFAULT 'whatsapp',
    description TEXT NOT NULL,
    interaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    interaction_time TIME NOT NULL DEFAULT CURRENT_TIME
);

-- 7. Supplier Status History Table
CREATE TABLE supplier_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    old_stage supplier_stage,
    new_stage supplier_stage NOT NULL,
    old_status supplier_status,
    new_status supplier_status NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Supplier Tasks (Pendências) Table
CREATE TABLE supplier_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' or 'completed'
    due_date DATE,
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Logistics Analyses Table
CREATE TABLE logistics_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    distance_km NUMERIC,
    transport_type TEXT, -- 'Fiorino', 'VUC', 'Truck', 'Carreta', etc.
    estimated_cost NUMERIC,
    recommended_frequency TEXT,
    transport_responsible TEXT, -- 'iWrc', 'Fornecedor', 'Terceirizado'
    conditioning_infrastructure_needed TEXT,
    feasibility feasibility_status NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    analyst_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Collections Table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status collection_status NOT NULL DEFAULT 'SCHEDULED',
    driver_name TEXT,
    carrier_name TEXT,
    recurrence_cycle TEXT,
    recurrence_custom TEXT,
    next_recurrence_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Collection Items Table
CREATE TABLE collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    estimated_volume NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL
);

-- 12. Receipts Table
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. Receipt Items Table
CREATE TABLE receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    unit TEXT NOT NULL,
    weight_kg NUMERIC NOT NULL DEFAULT 0,
    notes TEXT
);

-- TRIGGERS to update updated_at on suppliers
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suppliers_modtime
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- Create basic permissive RLS policies for authenticated users for the MVP
-- (In production, these would be segmented by role)
CREATE POLICY "Allow all read/write for authenticated users on profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on suppliers" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on supplier_contacts" ON supplier_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on supplier_addresses" ON supplier_addresses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on supplier_materials" ON supplier_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on supplier_interactions" ON supplier_interactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on supplier_status_history" ON supplier_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on supplier_tasks" ON supplier_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on logistics_analyses" ON logistics_analyses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on collections" ON collections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on collection_items" ON collection_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on receipts" ON receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all read/write for authenticated users on receipt_items" ON receipt_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
