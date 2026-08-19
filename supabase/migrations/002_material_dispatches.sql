-- Migration: 002_material_dispatches.sql
-- Description: Table for tracking outbound material dispatches, sales, and destination from the Hub

CREATE TABLE IF NOT EXISTS material_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_name TEXT NOT NULL,
    buyer_document TEXT,
    material_name TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
    unit_price NUMERIC DEFAULT 0,
    total_value NUMERIC DEFAULT 0,
    dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_number TEXT,
    mtr_number TEXT,
    carrier_name TEXT,
    vehicle_plate TEXT,
    driver_name TEXT,
    destination_type TEXT NOT NULL DEFAULT 'sale', -- 'sale', 'recycler', 'coprocessing', 'donation', 'other'
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE material_dispatches ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated users
CREATE POLICY "Allow all authenticated users to read/write material_dispatches"
ON material_dispatches FOR ALL TO authenticated
USING (true) WITH CHECK (true);
