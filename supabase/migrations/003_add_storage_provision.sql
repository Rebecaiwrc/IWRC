-- Migration 003: Add storage provision columns to supplier_materials and logistics_analyses

ALTER TABLE supplier_materials 
ADD COLUMN IF NOT EXISTS needs_storage_provision BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS storage_provision_type TEXT,
ADD COLUMN IF NOT EXISTS storage_provision_quantity NUMERIC,
ADD COLUMN IF NOT EXISTS storage_provision_custom_type TEXT;

ALTER TABLE logistics_analyses 
ADD COLUMN IF NOT EXISTS storage_provision_cost NUMERIC,
ADD COLUMN IF NOT EXISTS storage_provision_delivery_date TEXT;
