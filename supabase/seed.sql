-- Seed profiles (Note: In a real Supabase Auth setup, these link to auth.users.
-- We use static UUIDs for testing, which works in our local-first implementation as well)
INSERT INTO profiles (id, email, name, role) VALUES
('d3b07384-d113-4e4e-9b2f-123456789012', 'admin@iwrc.com.br', 'Aline Administrator', 'ADMIN'),
('d3b07384-d113-4e4e-9b2f-123456789013', 'comprador@iwrc.com.br', 'Carlos Comercial', 'BUYER'),
('d3b07384-d113-4e4e-9b2f-123456789014', 'logistica@iwrc.com.br', 'Lucas Logística', 'LOGISTICS')
ON CONFLICT (id) DO NOTHING;

-- Define Supplier UUIDs for reference
-- Supplier A (Lead Novo): 11111111-1111-1111-1111-111111111111
-- Supplier B (Aguardando Resposta): 22222222-2222-2222-2222-222222222222
-- Supplier C (Em Análise Logística): 33333333-3333-3333-3333-333333333333
-- Supplier D (Ativo / Operacional): 44444444-4444-4444-4444-444444444444

-- 1. Insert Suppliers
INSERT INTO suppliers (id, name, trade_name, document, supplier_type, lead_source, internal_responsible_id, current_stage, current_status, backlog_reason) VALUES
('11111111-1111-1111-1111-111111111111', 'Metalúrgica Recicla Brasil Ltda', 'Recicla Brasil', '12.345.678/0001-90', 'Indústria', 'Google Search', 'd3b07384-d113-4e4e-9b2f-123456789013', 'PROSPECTING', 'PENDING', NULL),
('22222222-2222-2222-2222-222222222222', 'Supermercados Pão e Queijo S/A', 'Pão e Queijo', '98.765.432/0001-10', 'Comércio', 'Indicação', 'd3b07384-d113-4e4e-9b2f-123456789013', 'QUALIFICATION', 'IN_PROGRESS', 'Aguardando retorno do fornecedor sobre volumes de plástico'),
('33333333-3333-3333-3333-333333333333', 'Indústria de Bebidas Vale do Sol S/A', 'Vale do Sol', '11.222.333/0001-44', 'Indústria', 'Prospecção Ativa', 'd3b07384-d113-4e4e-9b2f-123456789013', 'LOGISTICS', 'PENDING', 'Aguardando cotação de frete terceirizado'),
('44444444-4444-4444-4444-444444444444', 'EletroEletrônicos Zetta Ltda', 'Zetta', '55.666.777/0001-88', 'Indústria', 'Prospecção Ativa', 'd3b07384-d113-4e4e-9b2f-123456789013', 'OPERATION', 'APPROVED', NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Addresses
INSERT INTO supplier_addresses (id, supplier_id, zip_code, street, number, complement, neighborhood, city, state) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '01001-000', 'Praça da Sé', '100', 'Sala 4', 'Sé', 'São Paulo', 'SP'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '13010-001', 'Rua General Osório', '500', NULL, 'Centro', 'Campinas', 'SP'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '12245-000', 'Avenida Nove de Julho', '1200', 'Portão B', 'Jardim Apolo', 'São José dos Campos', 'SP'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '09010-000', 'Rua Marechal Deodoro', '300', NULL, 'Centro', 'Santo André', 'SP')
ON CONFLICT (supplier_id) DO NOTHING;

-- 3. Insert Contacts
INSERT INTO supplier_contacts (id, supplier_id, name, role, phone, whatsapp, email, is_primary) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Roberto Silva', 'Gerente de Compras', '(11) 3211-1234', '(11) 98765-4321', 'roberto@reciclabrasil.com.br', TRUE),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Clara Souza', 'Coord. de Sustentabilidade', '(19) 3456-7890', '(19) 99876-5432', 'clara.sustentabilidade@paoequeijo.com.br', TRUE),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Marcos Lima', 'Diretor Operacional', '(12) 3987-6543', '(12) 99765-1122', 'marcos.lima@valedosol.com.br', TRUE),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Ana Paula', 'Analista de Meio Ambiente', '(11) 4433-2211', '(11) 99221-8899', 'ana.paula@zetta.com.br', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Supplier Materials
INSERT INTO supplier_materials (id, supplier_id, material_name, category, estimated_volume, unit, frequency, transaction_type, price_per_kg, storage_form, notes) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Sucata de Ferro', 'Metal', 5, 'tonelada', 'monthly', 'donation', 0, 'Caçambas metálicas', 'Resíduo de estampagem industrial'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Papelão Ondulado', 'Papel/Papelão', 2, 'tonelada', 'monthly', 'purchase', 0.40, 'Fardos de prensa vertical', 'Fardos de 150kg'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Plástico Filme (PEBD)', 'Plástico', 500, 'kg', 'biweekly', 'donation', 0, 'Sacos grandes', 'Plástico de embalagem de paletes'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Garrafas PET Verde/Transparente', 'Plástico', 8, 'tonelada', 'monthly', 'purchase', 1.20, 'Fardos de prensa', 'Lotes triados e prensados na fábrica'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Papelão Ondulado', 'Papel/Papelão', 15, 'tonelada', 'monthly', 'purchase', 0.45, 'Fardos', 'Alta frequência de geração'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Sucata Eletrônica', 'Outros', 1, 'tonelada', 'sporadic', 'donation', 0, 'Paletes amarrados', 'Placas e carcaças fora de uso')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Interactions
INSERT INTO supplier_interactions (id, supplier_id, user_id, type, description, interaction_date, interaction_time) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'd3b07384-d113-4e4e-9b2f-123456789013', 'internal_obs', 'Lead cadastrado via formulário de prospecção do site. Necessário primeiro contato para qualificação.', '2026-08-11', '09:42:00'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'd3b07384-d113-4e4e-9b2f-123456789013', 'whatsapp', 'Carlos Comercial enviou a proposta de compra do papelão. Clara Souza ficou de validar os volumes de plástico filme e retornar.', '2026-08-12', '14:18:00'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'd3b07384-d113-4e4e-9b2f-123456789013', 'phone', 'Marcos Lima confirmou interesse em fechar parceria para destinar as garrafas PET. Exige cotação rápida da logística.', '2026-08-13', '10:05:00'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'd3b07384-d113-4e4e-9b2f-123456789013', 'meeting', 'Reunião presencial de fechamento de contrato na fábrica da Zetta. Assinatura da carta de doação para eletrônicos e contrato comercial de papelão.', '2026-08-01', '14:30:00')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Status History
INSERT INTO supplier_status_history (id, supplier_id, old_stage, new_stage, old_status, new_status, user_id, notes) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', NULL, 'PROSPECTING', NULL, 'PENDING', 'd3b07384-d113-4e4e-9b2f-123456789013', 'Cadastro do lead no funil de prospecção.'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'PROSPECTING', 'QUALIFICATION', 'PENDING', 'IN_PROGRESS', 'd3b07384-d113-4e4e-9b2f-123456789013', 'Contato efetuado, aguardando definições de plástico.'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'QUALIFICATION', 'LOGISTICS', 'APPROVED', 'PENDING', 'd3b07384-d113-4e4e-9b2f-123456789013', 'Dados validados. Enviado para análise logística de viabilidade de coleta de PET.'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'DOCUMENTATION', 'OPERATION', 'APPROVED', 'APPROVED', 'd3b07384-d113-4e4e-9b2f-123456789013', 'Contrato assinado. Fornecedor habilitado para coletas.')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Tasks (Pendências)
INSERT INTO supplier_tasks (id, supplier_id, description, status, due_date, completed_by, completed_at) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Realizar ligação de primeiro contato comercial', 'pending', '2026-08-20', NULL, NULL),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Obter estimativa exata de geração mensal de plástico PEBD', 'pending', '2026-08-18', NULL, NULL),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Orçar custo de frete com transportadoras terceirizadas de SJC', 'pending', '2026-08-16', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Logistics Analyses
INSERT INTO logistics_analyses (id, supplier_id, distance_km, transport_type, estimated_cost, recommended_frequency, transport_responsible, conditioning_infrastructure_needed, feasibility, notes, analyst_id, analyzed_at) VALUES
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 82.5, 'Truck', 800, 'Mensal', 'iWrc', 'Necessário deixar 1 caçamba de 30m³ no local', 'IN_PROGRESS', 'Análise em andamento. Custo do pedágio da Dutra sendo verificado.', 'd3b07384-d113-4e4e-9b2f-123456789014', NOW()),
('44444444-4444-4444-4444-ffffffffffff', '44444444-4444-4444-4444-444444444444', 25, 'VUC', 350, 'Quinzenal', 'iWrc', 'Nenhuma estrutura necessária (acondicionado em paletes)', 'FEASIBLE', 'Operação muito viável devido à proximidade e bom volume de papelão.', 'd3b07384-d113-4e4e-9b2f-123456789014', '2026-08-03 10:00:00')
ON CONFLICT (id) DO NOTHING;

-- 9. Insert Collections (Coletas)
-- Active Scheduled Collection
INSERT INTO collections (id, supplier_id, scheduled_date, completed_date, status, driver_name, carrier_name, notes) VALUES
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '2026-08-20', NULL, 'SCHEDULED', 'José Carlos', 'Bora Transportes', 'Coleta programada do papelão quinzenal e lote de sucata eletrônica.'),
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '2026-08-06', '2026-08-06', 'COMPLETED', 'Roberto Martins', 'iWrc própria', 'Coleta concluída sem pendências.')
ON CONFLICT (id) DO NOTHING;

-- Insert Collection Items
INSERT INTO collection_items (id, collection_id, material_name, estimated_volume, unit) VALUES
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Papelão Ondulado', 7.5, 'tonelada'),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Sucata Eletrônica', 500, 'kg'),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'Papelão Ondulado', 7.5, 'tonelada'),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'Sucata Eletrônica', 500, 'kg')
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Receipts (Recebimentos)
INSERT INTO receipts (id, supplier_id, collection_id, received_date, notes) VALUES
('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', '2026-08-06', 'Pesagem realizada na balança principal da iWrc. Material bem enfardado.')
ON CONFLICT (id) DO NOTHING;

-- Insert Receipt Items (Real Weight in kg)
INSERT INTO receipt_items (id, receipt_id, material_name, quantity, unit, weight_kg, notes) VALUES
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'Papelão Ondulado', 52, 'fardos', 7800, 'Fardos de aproximadamente 150kg cada.'),
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'Sucata Eletrônica', 2, 'paletes', 420, 'Descarte homologado de resíduos eletrônicos.')
ON CONFLICT (id) DO NOTHING;
