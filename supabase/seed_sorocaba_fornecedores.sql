-- ============================================================
-- SCRIPT DE IMPORTAÇÃO EM LOTE: FORNECEDORES / GERADORES HUB SOROCABA
-- Gerado automaticamente a partir da planilha oficial da iWrc
-- Total de Geradores: 182
-- ============================================================

DO $$
DECLARE
  v_admin_id UUID;
  v_supplier_id UUID;
BEGIN
  -- Identifica o usuário admin/comprador atual no banco
  SELECT id INTO v_admin_id FROM profiles LIMIT 1;


  -- ------------------------------------------------------------
  -- [1] Fulwood Sorocaba Business Park
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Fulwood Sorocaba Business Park',
    'Fulwood Sorocaba Business Park',
    NULL,
    'Condomínio Logístico / Galpão',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18087-220',
    'Av. Jerome Case',
    '2600',
    NULL,
    'Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Fulwood Sorocaba Business Park (Contato)',
    'Comercial / Responsável',
    '(11) 96476-0517',
    '(11) 96476-0517',
    'contato@fulwood.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [2] Braslog Sorocaba - Condomínio de Galpões Industriais
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Braslog Sorocaba - Condomínio de Galpões Industriais',
    'Braslog Sorocaba - Condomínio de Galpões Industriais',
    NULL,
    'Condomínio Logístico / Galpão',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18085-852',
    'Av. Antonio Bardella',
    '2650',
    NULL,
    'Boa Vista',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Braslog Sorocaba - Condomínio de Galpões Industriais (Contato)',
    'Comercial / Responsável',
    '(15) 99628-1100',
    '(15) 99628-1100',
    'braslog@braslogsorocaba.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [3] M5 Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'M5 Sorocaba',
    'M5 Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18105-122',
    'Estr. dos Carvalhos',
    '1441',
    NULL,
    'Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'M5 Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 3225-0400',
    '(15) 3225-0400',
    'Richard@m5centrologistico.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papelão e Plástico',
    'Papelão e Plástico',
    1,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: 1–2 t/semana',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [4] Votorantim Park Industrial
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Votorantim Park Industrial',
    'Votorantim Park Industrial',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18117-487',
    'Av. Vitalino Pagliato',
    '50',
    NULL,
    'Capoavinha',
    'Votorantim',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Votorantim Park Industrial (Contato)',
    'Comercial / Responsável',
    '(15) 99791-6406',
    '(15) 99791-6406',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Entulho e papelão',
    'Entulho e papelão',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: Baixo volume',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [5] Condomínio Empresarial Ômega
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Condomínio Empresarial Ômega',
    'Condomínio Empresarial Ômega',
    NULL,
    'Condomínio Logístico / Galpão',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18086-601',
    'R. Nathália Orejana',
    '671',
    NULL,
    'Zona Industrial',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Condomínio Empresarial Ômega (Contato)',
    'Comercial / Responsável',
    '(15) 3228-3548',
    '(15) 3228-3548',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [6] Condominio Aurora Business Park 2
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Condominio Aurora Business Park 2',
    'Condominio Aurora Business Park 2',
    NULL,
    'Condomínio Logístico / Galpão',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'bairro Varejão - Estr. Mun. de Aparecidinha',
    NULL,
    NULL,
    'Estr. Mun. de Aparecidinha',
    'Itu',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Condominio Aurora Business Park 2 (Contato)',
    'Comercial / Responsável',
    '(15) 3235-4800',
    '(15) 3235-4800',
    'atendimento@eapiaurora.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [7] Condominio Empresarial Panamericano
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Condominio Empresarial Panamericano',
    'Condominio Empresarial Panamericano',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Condominio Empresarial Panamericano (Contato)',
    'Comercial / Responsável',
    '(15) 3032-5500',
    '(15) 3032-5500',
    'Contato@delrios.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [8] Tauste Itavuvu - (Sorocaba)
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Tauste Itavuvu - (Sorocaba)',
    'Tauste Itavuvu - (Sorocaba)',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Tauste Itavuvu - (Sorocaba) (Contato)',
    'Comercial / Responsável',
    '(15) 3331-9900                                         (15) 99683-8677',
    '(15) 3331-9900                                         (15) 99683-8677',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [9] Tauste Campolim - (Sorocaba)
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Tauste Campolim - (Sorocaba)',
    'Tauste Campolim - (Sorocaba)',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Tauste Campolim - (Sorocaba) (Contato)',
    'Comercial / Responsável',
    '(15) 3333-3838',
    '(15) 3333-3838',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [10] Rede Bom Lugar
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Rede Bom Lugar',
    'Rede Bom Lugar',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Rede Bom Lugar (Contato)',
    'Comercial / Responsável',
    '(15) 3223-5111',
    '(15) 3223-5111',
    'redebomlugar@redebomlugar.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Plastico e Metal.',
    'Plastico e Metal.',
    0,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: N.A',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [11] Taurus Helmets
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Taurus Helmets',
    'Taurus Helmets',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Itu',
    NULL,
    NULL,
    NULL,
    'Itu',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Taurus Helmets (Contato)',
    'Comercial / Responsável',
    NULL,
    NULL,
    'Eduardo.nascimento@taurus.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Plastico e papelão',
    'Plastico e papelão',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: Não tem estimativa',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [12] Brasil Reverso
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Brasil Reverso',
    'Brasil Reverso',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Cabreúva e Jundiaí',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Brasil Reverso (Contato)',
    'Comercial / Responsável',
    '(19) 3476-4617',
    '(19) 3476-4617',
    'comercial@brasilreverso.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [13] UNIP
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNIP',
    'UNIP',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'UNIP (Contato)',
    'Comercial / Responsável',
    '(15) 3412-1000                                                               (15) 99836-2746',
    '(15) 3412-1000                                                               (15) 99836-2746',
    'jeniffer.filadelfo@unip.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papel, papelão e plástico',
    'Papel, papelão e plástico',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: N.A',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [14] UNISO
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNISO',
    'UNISO',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'UNISO (Contato)',
    'Comercial / Responsável',
    '(15) 2101-7000',
    '(15) 2101-7000',
    'Vanderson.gimenez@uniso.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [15] UFSCAR
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UFSCAR',
    'UFSCAR',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Carlos',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'UFSCAR (Contato)',
    'Comercial / Responsável',
    '(16) 3351-8015',
    '(16) 3351-8015',
    'degr@ufscar.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    40,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: 40 T',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [16] UNESP
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNESP',
    'UNESP',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'UNESP (Contato)',
    'Comercial / Responsável',
    '(15) 3238-3409',
    '(15) 3238-3409',
    'compras.campus@unesp.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [17] PUC-CAMPINAS
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'PUC-CAMPINAS',
    'PUC-CAMPINAS',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Campinas',
    NULL,
    NULL,
    NULL,
    'Campinas',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'PUC-CAMPINAS (Contato)',
    'Comercial / Responsável',
    '(19) 3343-7000',
    '(19) 3343-7000',
    'gps.asseio.superv@puc-campinas.edu.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [18] UNISANTA
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNISANTA',
    'UNISANTA',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Santos',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'UNISANTA (Contato)',
    'Comercial / Responsável',
    '(13) 3202-7101',
    '(13) 3202-7101',
    'cassio@unisanta.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [19] Anglo
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Anglo',
    'Anglo',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Anglo (Contato)',
    'Comercial / Responsável',
    '(15) 3331-8080',
    '(15) 3331-8080',
    'tiago@anglosoroca.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [20] GMRA
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'GMRA',
    'GMRA',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São José dos Campos',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'GMRA (Contato)',
    'Comercial / Responsável',
    '(12) 3932-5100',
    '(12) 3932-5100',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [21] CIESP Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CIESP Sorocaba',
    'CIESP Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CIESP Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 4009-2900',
    '(15) 4009-2900',
    'Renata.labarca@ciesp.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [22] CIESP Campinas
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CIESP Campinas',
    'CIESP Campinas',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Campinas',
    NULL,
    NULL,
    NULL,
    'Campinas',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CIESP Campinas (Contato)',
    'Comercial / Responsável',
    '(19) 3743-2200',
    '(19) 3743-2200',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'N/A',
    'N/A',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [23] CIESP Indaiatuba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CIESP Indaiatuba',
    'CIESP Indaiatuba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Indaiatuba',
    NULL,
    NULL,
    NULL,
    'Indaiatuba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CIESP Indaiatuba (Contato)',
    'Comercial / Responsável',
    '(19) 3935-8981',
    '(19) 3935-8981',
    'Adm.indaiatuba@ciesp.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papel e plastico',
    'Papel e plastico',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: Aprox (1 t)',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [24] CIESP São Carlos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CIESP São Carlos',
    'CIESP São Carlos',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Carlos',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CIESP São Carlos (Contato)',
    'Comercial / Responsável',
    '(16) 3368-1037',
    '(16) 3368-1037',
    'contato.saocarlos@ciesp.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'N/A',
    'N/A',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: N/A',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [25] Lord Brasil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Lord Brasil',
    'Lord Brasil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Comendador Camilo Júlio',
    '2600',
    NULL,
    '– Jardim Ibiti do Paço',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Lord Brasil (Contato)',
    'Comercial / Responsável',
    '(15) 34140350',
    '(15) 34140350',
    'andressa@diamondoffice.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [26] Soroplast Indústria e Comércio de Artefatos Plásticos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Soroplast Indústria e Comércio de Artefatos Plásticos',
    'Soroplast Indústria e Comércio de Artefatos Plásticos',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Anuar Dequech',
    '425',
    NULL,
    '– Iporanga',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Soroplast Indústria e Comércio de Artefatos Plásticos (Contato)',
    'Comercial / Responsável',
    '(15) 3228-3675',
    '(15) 3228-3675',
    'compras@soroplast.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Platisco e papelão',
    'Platisco e papelão',
    0,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: Aprox (1 t)',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [27] Majesty América do Sul Embalagens
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Majesty América do Sul Embalagens',
    'Majesty América do Sul Embalagens',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18105-122',
    'Estrada Mário Monteiro de Carvalho',
    '1441',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Majesty América do Sul Embalagens (Contato)',
    'Comercial / Responsável',
    '(15) 3141-0720',
    '(15) 3141-0720',
    'Leonardo@majestyglobal.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    0,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [28] Parabor Indústria e Comércio de Produtos Químicos Ltda
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Parabor Indústria e Comércio de Produtos Químicos Ltda',
    'Parabor Indústria e Comércio de Produtos Químicos Ltda',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Lucídio Monteiro de Carvalho',
    '373',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Parabor Indústria e Comércio de Produtos Químicos Ltda (Contato)',
    'Comercial / Responsável',
    '(15) 3225-1802',
    '(15) 3225-1802',
    'vendas@parabor.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papelão',
    'Papelão',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [29] Militão Vidros
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Militão Vidros',
    'Militão Vidros',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '81770-230',
    'Rua Professor Raul Rodrigues Gomes',
    '325',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Militão Vidros (Contato)',
    'Comercial / Responsável',
    '(41) 3156-4994',
    '(41) 3156-4994',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Alumínio',
    'Alumínio',
    0,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [30] Éden Park Hotel
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Éden Park Hotel',
    'Éden Park Hotel',
    NULL,
    'Hotelaria / Turismo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua João Mustafá',
    '341',
    NULL,
    'Éden',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Éden Park Hotel (Contato)',
    'Comercial / Responsável',
    '(15) 3018-7250                                                               (15) 99684-8934',
    '(15) 3018-7250                                                               (15) 99684-8934',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Pet',
    'Pet',
    6,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: 6 sacos, de 50 á 100 litros por dia',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [31] Toyota do Brasil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Toyota do Brasil',
    'Toyota do Brasil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rod. Castelo Branco',
    NULL,
    NULL,
    'Km 92',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Toyota do Brasil (Contato)',
    'Comercial / Responsável',
    '(15) 3235-8000',
    '(15) 3235-8000',
    'contato@toyota.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [32] ZF do Brasil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'ZF do Brasil',
    'ZF do Brasil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Independência',
    NULL,
    NULL,
    'Sorocaba/SP',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'ZF do Brasil (Contato)',
    'Comercial / Responsável',
    '(15) 2102-9000',
    '(15) 2102-9000',
    'zfbrasil@zf.com, marta@mmeditorial.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [33] Schaeffler Brasil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Schaeffler Brasil',
    'Schaeffler Brasil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Schaeffler Brasil (Contato)',
    'Comercial / Responsável',
    '(15) 3335-1000',
    '(15) 3335-1000',
    'marketing.br@schaeffler.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [34] CNH Industrial
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CNH Industrial',
    'CNH Industrial',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CNH Industrial (Contato)',
    'Comercial / Responsável',
    '(15) 3334-1700',
    '(15) 3334-1700',
    'contato@cnhind.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [35] Metso Brasil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Metso Brasil',
    'Metso Brasil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Metso Brasil (Contato)',
    'Comercial / Responsável',
    '(15) 2102 1700',
    '(15) 2102 1700',
    'brasil.info@metso.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [36] Clarios
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Clarios',
    'Clarios',
    NULL,
    'Instituição / Educação / Saúde',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Clarios (Contato)',
    'Comercial / Responsável',
    '(15) 2101-1000',
    '(15) 2101-1000',
    'contato@clarios.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [37] Tecsis
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Tecsis',
    'Tecsis',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Tecsis (Contato)',
    'Comercial / Responsável',
    '(15) 3219-8000',
    '(15) 3219-8000',
    'contato@tecsis.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [38] GCP Applied Technologies
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'GCP Applied Technologies',
    'GCP Applied Technologies',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'GCP Applied Technologies (Contato)',
    'Comercial / Responsável',
    '(15) 2102-2000',
    '(15) 2102-2000',
    'filipe.zarur@chemyunion.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [39] Prysmian Group
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Prysmian Group',
    'Prysmian Group',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Prysmian Group (Contato)',
    'Comercial / Responsável',
    '(15) 98179-8597',
    '(15) 98179-8597',
    'brasil@prysmiangroup.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [40] Nissin Foods
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Nissin Foods',
    'Nissin Foods',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Ibiúna/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Nissin Foods (Contato)',
    'Comercial / Responsável',
    '(15) 3248-9000',
    '(15) 3248-9000',
    'contato@nissin.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [41] Amcor Flexibles
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Amcor Flexibles',
    'Amcor Flexibles',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Louveira/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Amcor Flexibles (Contato)',
    'Comercial / Responsável',
    '(19) 3878-9000',
    '(19) 3878-9000',
    'contato@amcor.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [42] Unilever
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Unilever',
    'Unilever',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Indaiatuba/SP',
    NULL,
    NULL,
    NULL,
    'Indaiatuba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Unilever (Contato)',
    'Comercial / Responsável',
    '(19) 3801-9000',
    '(19) 3801-9000',
    'sac@unilever.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [43] John Deere
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'John Deere',
    'John Deere',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Indaiatuba/SP',
    NULL,
    NULL,
    NULL,
    'Indaiatuba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'John Deere (Contato)',
    'Comercial / Responsável',
    '(19) 3313-4000',
    '(19) 3313-4000',
    'contato@johndeere.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [44] Kion South America
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Kion South America',
    'Kion South America',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Indaiatuba/SP',
    NULL,
    NULL,
    NULL,
    'Indaiatuba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Kion South America (Contato)',
    'Comercial / Responsável',
    '(19) 3935-8200',
    '(19) 3935-8200',
    'marketing.br@kiongroup.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [45] DHL Supply Chain
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'DHL Supply Chain',
    'DHL Supply Chain',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Louveira/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'DHL Supply Chain (Contato)',
    'Comercial / Responsável',
    '(11) 3618-3200                                                                                                          (11) 4200-0033',
    '(11) 3618-3200                                                                                                          (11) 4200-0033',
    'contato@dhl.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [46] Mercado Livre (Fulfillment)
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Mercado Livre (Fulfillment)',
    'Mercado Livre (Fulfillment)',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Cajamar/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Mercado Livre (Fulfillment) (Contato)',
    'Comercial / Responsável',
    '(11) 2543-8000',
    '(11) 2543-8000',
    'contato@mercadolivre.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [47] Amazon Brasil (Fulfillment)
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Amazon Brasil (Fulfillment)',
    'Amazon Brasil (Fulfillment)',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Cajamar/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Amazon Brasil (Fulfillment) (Contato)',
    'Comercial / Responsável',
    '—',
    '—',
    'contato@amazon.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [48] Magazine Luiza CD
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Magazine Luiza CD',
    'Magazine Luiza CD',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Louveira/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Magazine Luiza CD (Contato)',
    'Comercial / Responsável',
    '(19) 3878-6000',
    '(19) 3878-6000',
    'contato@magazineluiza.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [49] CEVA Logistics
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CEVA Logistics',
    'CEVA Logistics',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jundiaí/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CEVA Logistics (Contato)',
    'Comercial / Responsável',
    '(11) 4589-8000',
    '(11) 4589-8000',
    'contato@cevalogistics.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [50] Crown Embalagens
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Crown Embalagens',
    'Crown Embalagens',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Cabreúva/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Crown Embalagens (Contato)',
    'Comercial / Responsável',
    '(11) 4528-9000',
    '(11) 4528-9000',
    'contato@crowncork.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [51] Tetra Pak
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Tetra Pak',
    'Tetra Pak',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Monte Mor/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Tetra Pak (Contato)',
    'Comercial / Responsável',
    '(19) 3879-7000',
    '(19) 3879-7000',
    'contato@tetrapak.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [52] Brasilata
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Brasilata',
    'Brasilata',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jundiaí/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Brasilata (Contato)',
    'Comercial / Responsável',
    '(11) 4589-8000',
    '(11) 4589-8000',
    'contato@brasilata.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [53] Klabin
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Klabin',
    'Klabin',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jundiaí/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Klabin (Contato)',
    'Comercial / Responsável',
    '(11) 2134-4000',
    '(11) 2134-4000',
    'klabin@klabin.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [54] PepsiCo
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'PepsiCo',
    'PepsiCo',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Itu/SP',
    NULL,
    NULL,
    NULL,
    'Itu',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'PepsiCo (Contato)',
    'Comercial / Responsável',
    '(11) 4022-9000',
    '(11) 4022-9000',
    'atendimento@pepsico.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [55] Ajinomoto
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Ajinomoto',
    'Ajinomoto',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Limeira/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Ajinomoto (Contato)',
    'Comercial / Responsável',
    '(19) 3404-9128',
    '(19) 3404-9128',
    'contato@ajinomoto.com.br                           leo_silva@dr.ajinomoto.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [56] Ypê
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Ypê',
    'Ypê',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Amparo/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Ypê (Contato)',
    'Comercial / Responsável',
    '(19) 3807-3000',
    '(19) 3807-3000',
    'contato@ype.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [57] Adimax
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Adimax',
    'Adimax',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Salto de Pirapora/SP',
    NULL,
    NULL,
    NULL,
    'Salto',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Adimax (Contato)',
    'Comercial / Responsável',
    '(15) 3238-8000',
    '(15) 3238-8000',
    'ronaldo.pereira@adimax.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papelão e plastico',
    'Papelão e plastico',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [58] Case IH
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Case IH',
    'Case IH',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Jerome Case',
    NULL,
    NULL,
    'Sorocaba/SP',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Case IH (Contato)',
    'Comercial / Responsável',
    '(15) 3334-1700',
    '(15) 3334-1700',
    'loja.caseih@cnhind.com',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [59] Parker Hannifin
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Parker Hannifin',
    'Parker Hannifin',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Parker Hannifin (Contato)',
    'Comercial / Responsável',
    '(15) 3325-3942',
    '(15) 3325-3942',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'N/A',
    'N/A',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [60] Bardella
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Bardella',
    'Bardella',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Bardella (Contato)',
    'Comercial / Responsável',
    '(15) 3238-5509',
    '(15) 3238-5509',
    'isantos@bardella.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [61] Splice Indústria
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Splice Indústria',
    'Splice Indústria',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Votorantim/SP',
    NULL,
    NULL,
    NULL,
    'Votorantim',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Splice Indústria (Contato)',
    'Comercial / Responsável',
    '(15) 2101-1000',
    '(15) 2101-1000',
    'contato@splice.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [62] Wobben (Enercon)
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Wobben (Enercon)',
    'Wobben (Enercon)',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Wobben (Enercon) (Contato)',
    'Comercial / Responsável',
    '(15) 2102-2200',
    '(15) 2102-2200',
    'contato@enercon.de',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [63] Hexis Científica
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Hexis Científica',
    'Hexis Científica',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jundiaí/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Hexis Científica (Contato)',
    'Comercial / Responsável',
    '(11) 4589-2600',
    '(11) 4589-2600',
    'comercial@hexis.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [64] Rexam (Ardagh)
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Rexam (Ardagh)',
    'Rexam (Ardagh)',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jacareí/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Rexam (Ardagh) (Contato)',
    'Comercial / Responsável',
    '(12) 3954-9000',
    '(12) 3954-9000',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [65] Castelo Alimentos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Castelo Alimentos',
    'Castelo Alimentos',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Boituva/SP',
    NULL,
    NULL,
    NULL,
    'Itu',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Castelo Alimentos (Contato)',
    'Comercial / Responsável',
    '(15) 3363-9500',
    '(15) 3363-9500',
    'atendimento@casteloalimentos.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [66] Marfrig
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Marfrig',
    'Marfrig',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Promissão/SP (escritório regional em SP)',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Marfrig (Contato)',
    'Comercial / Responsável',
    '(14) 3543-9292',
    '(14) 3543-9292',
    'paralegal.corporativo@marfrig.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [67] JBS Couros
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'JBS Couros',
    'JBS Couros',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Lins/SP (compras SP)',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'JBS Couros (Contato)',
    'Comercial / Responsável',
    '(11) 3144-4000',
    '(11) 3144-4000',
    '(corporativo)
imprensa@jbs.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [68] Colégio Objetivo Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Objetivo Sorocaba',
    'Colégio Objetivo Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Colégio Objetivo Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 3332-9900',
    '(15) 3332-9900',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [69] Colégio Uirapuru
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Uirapuru',
    'Colégio Uirapuru',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Colégio Uirapuru (Contato)',
    'Comercial / Responsável',
    '(15) 2102-6600',
    '(15) 2102-6600',
    'ouvidoria@colegiouirapuru.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [70] Colégio Dom Aguirre
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Dom Aguirre',
    'Colégio Dom Aguirre',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'LOGISTICS',
    'PENDING',
    'WAITING_LOGISTICS',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Colégio Dom Aguirre (Contato)',
    'Comercial / Responsável',
    '(15) 98155-6889',
    '(15) 98155-6889',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    1,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: 1 lixeira 500l mês',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [71] SESI Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'SESI Sorocaba',
    'SESI Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'SESI Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 3388-0444                                                    (15) 3388-0450',
    '(15) 3388-0444                                                    (15) 3388-0450',
    'abatista@sesisp.org.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [72] SENAI Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'SENAI Sorocaba',
    'SENAI Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'SENAI Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 3212-7400',
    '(15) 3212-7400',
    'rigoni@sp.senai.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papelão, plastico, metal e papel',
    'Papelão, plastico, metal e papel',
    0,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [73] Parque Tecnológico de Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Parque Tecnológico de Sorocaba',
    'Parque Tecnológico de Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba/SP',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Parque Tecnológico de Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 3316-2323',
    '(15) 3316-2323',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [74] Kostela do Japonês
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Kostela do Japonês',
    'Kostela do Japonês',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'LOGISTICS',
    'PENDING',
    'WAITING_LOGISTICS',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Victor Andrew',
    '4455',
    NULL,
    '– Éden',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Kostela do Japonês (Contato)',
    'Comercial / Responsável',
    '(15) 3325-4255',
    '(15) 3325-4255',
    'Wpp',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papelão, plastico e vidro',
    'Papelão, plastico e vidro',
    1,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: 1 bag - 90x90x120                                   1 caixa de vidro',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [75] Restaurante Picanha na Villa
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Restaurante Picanha na Villa',
    'Restaurante Picanha na Villa',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Cleide Fonseca Mustafá',
    '30',
    NULL,
    '– Jardim Paraíso',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Restaurante Picanha na Villa (Contato)',
    'Comercial / Responsável',
    '(15) 99725-9162',
    '(15) 99725-9162',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [76] Mio Sapore Restaurante
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Mio Sapore Restaurante',
    'Mio Sapore Restaurante',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Independência',
    '5271',
    NULL,
    '– Iporanga',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Mio Sapore Restaurante (Contato)',
    'Comercial / Responsável',
    '(15) 99642-4527',
    '(15) 99642-4527',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [77] Pizzaria da Rita
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Pizzaria da Rita',
    'Pizzaria da Rita',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Bonifácio de Oliveira Cassú',
    '474',
    NULL,
    '– Éden',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Pizzaria da Rita (Contato)',
    'Comercial / Responsável',
    '(15) 3225-1803',
    '(15) 3225-1803',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [78] Restaurante Vecchio Cancian
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Restaurante Vecchio Cancian',
    'Restaurante Vecchio Cancian',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18065-290',
    'Avenida Santos Dumont',
    '400',
    NULL,
    'Jardim Ana Maria Jd. Ana Maria',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Restaurante Vecchio Cancian (Contato)',
    'Comercial / Responsável',
    '(15) 98810-4141',
    '(15) 98810-4141',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [79] Restaurante Refazenda Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Restaurante Refazenda Sorocaba',
    'Restaurante Refazenda Sorocaba',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua',
    '28 de outubro',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Restaurante Refazenda Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 99824-2962',
    '(15) 99824-2962',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [80] Do Japonês
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Do Japonês',
    'Do Japonês',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18103-015',
    'R João Mustafá',
    '135',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Do Japonês (Contato)',
    'Comercial / Responsável',
    '(15) 98147-3443',
    '(15) 98147-3443',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Plastico, papelão e vidro',
    'Plastico, papelão e vidro',
    1,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: 1 bag/mês',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [81] Domo Restaurante
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Domo Restaurante',
    'Domo Restaurante',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18071-121',
    'R. Moacyr de Castro',
    '100',
    NULL,
    'Éden',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Domo Restaurante (Contato)',
    'Comercial / Responsável',
    '(15) 98162-2470',
    '(15) 98162-2470',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [82] Paladare Grill Restaurante
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Paladare Grill Restaurante',
    'Paladare Grill Restaurante',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18103-555',
    'Rua Miguel Arcangelo Matielo',
    '400',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Paladare Grill Restaurante (Contato)',
    'Comercial / Responsável',
    '(15) 99689-2449',
    '(15) 99689-2449',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [83] Café HP Restaurante
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Café HP Restaurante',
    'Café HP Restaurante',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'LOGISTICS',
    'PENDING',
    'WAITING_LOGISTICS',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18086-602',
    'Avenida Iporanga',
    '255',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Café HP Restaurante (Contato)',
    'Comercial / Responsável',
    '(15) 99789-4100                                   (15) 99169-0228',
    '(15) 99789-4100                                   (15) 99169-0228',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papelão',
    'Papelão',
    4,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: 4 bags/2 semanal',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [84] Gelar Comida Caseira
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Gelar Comida Caseira',
    'Gelar Comida Caseira',
    NULL,
    'Instituição / Educação / Saúde',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18085-600',
    'Rua Pedro José de Camargo',
    '114',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Gelar Comida Caseira (Contato)',
    'Comercial / Responsável',
    '(15) 99860-0060                             (15) 3033-2020',
    '(15) 99860-0060                             (15) 3033-2020',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [85] Roda d' Ferro Churrascaria e Pizzaria
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Roda d'' Ferro Churrascaria e Pizzaria',
    'Roda d'' Ferro Churrascaria e Pizzaria',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18103-000',
    'Av. Independência',
    '4615',
    NULL,
    'Éden',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Roda d'' Ferro Churrascaria e Pizzaria (Contato)',
    'Comercial / Responsável',
    '(15) 3342-8884',
    '(15) 3342-8884',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [86] Restaurante da Lu
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Restaurante da Lu',
    'Restaurante da Lu',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. André Vargas Rodrigues – Cajuru do Sul',
    NULL,
    NULL,
    'Sorocaba/SP',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Restaurante da Lu (Contato)',
    'Comercial / Responsável',
    '(15) 99859-1220',
    '(15) 99859-1220',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [87] Restaurante da Dorinha
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Restaurante da Dorinha',
    'Restaurante da Dorinha',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Maria Aparecida Novais Consorti',
    '389',
    NULL,
    '– Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Restaurante da Dorinha (Contato)',
    'Comercial / Responsável',
    '(15) 99686-5985',
    '(15) 99686-5985',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papelão',
    'Papelão',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [88] Feitosa Supermercados – Loja 1
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Feitosa Supermercados – Loja 1',
    'Feitosa Supermercados – Loja 1',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Paraná',
    '3865',
    NULL,
    '– Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Feitosa Supermercados – Loja 1 (Contato)',
    'Comercial / Responsável',
    '(15) 3225-2356',
    '(15) 3225-2356',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [89] Supermercado Feitosa 02
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Supermercado Feitosa 02',
    'Supermercado Feitosa 02',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Juvenal de Paula Souza',
    '231',
    NULL,
    '– Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Supermercado Feitosa 02 (Contato)',
    'Comercial / Responsável',
    '(15) 99695-4338',
    '(15) 99695-4338',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [90] Rede Bom Lugar – Loja Cajuru
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Rede Bom Lugar – Loja Cajuru',
    'Rede Bom Lugar – Loja Cajuru',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Paraná',
    '3756',
    NULL,
    '– Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Rede Bom Lugar – Loja Cajuru (Contato)',
    'Comercial / Responsável',
    '(15) 99630-1357',
    '(15) 99630-1357',
    'WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [91] San Marcos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'San Marcos',
    'San Marcos',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Juvenal de Paula Souza',
    '1316',
    NULL,
    '– Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'San Marcos (Contato)',
    'Comercial / Responsável',
    '(15) 3342-2742',
    '(15) 3342-2742',
    'Enviado WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [92] Rede Bom Lugar – Loja 09
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Rede Bom Lugar – Loja 09',
    'Rede Bom Lugar – Loja 09',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Flôr do Carvalho',
    '525',
    NULL,
    '– Éden',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Rede Bom Lugar – Loja 09 (Contato)',
    'Comercial / Responsável',
    '(15) 99630-1357',
    '(15) 99630-1357',
    'Enviado WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [93] Colégio Adventista de Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Adventista de Sorocaba',
    'Colégio Adventista de Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jardim Guadalajara - Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Colégio Adventista de Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 3500-0230                                   (15) 3500-0230',
    '(15) 3500-0230                                   (15) 3500-0230',
    'Enviado WPP',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [94] Colégio Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Sorocaba',
    'Colégio Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jardim Maria Eugênia',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Colégio Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 3226-3025',
    '(15) 3226-3025',
    'Retornar segunda ás 12:00',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [95] Colégio Horizonte
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Horizonte',
    'Colégio Horizonte',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Vila Santa Terezinha - Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Colégio Horizonte (Contato)',
    'Comercial / Responsável',
    '(15) 3222-4536',
    '(15) 3222-4536',
    'Retornar segunda ás 9:00',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [96] Colégio Renascer Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Renascer Sorocaba',
    'Colégio Renascer Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Central Parque - Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Colégio Renascer Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 3229-4444',
    '(15) 3229-4444',
    'julianabovo@colegiorenascer.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [97] College International Talent
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'College International Talent',
    'College International Talent',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Vila Lucy',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'College International Talent (Contato)',
    'Comercial / Responsável',
    '(15) 3221-8568',
    '(15) 3221-8568',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'N/A',
    'N/A',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [98] The Lighthouse School
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'The Lighthouse School',
    'The Lighthouse School',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jardim Santa Rosália',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'The Lighthouse School (Contato)',
    'Comercial / Responsável',
    '(15) 3233-2607',
    '(15) 3233-2607',
    'suportepedagogico@ufarol.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [99] Colégio Espaço Criança – Berçário e Educação Infantil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Espaço Criança – Berçário e Educação Infantil',
    'Colégio Espaço Criança – Berçário e Educação Infantil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jardim Vergueiro',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Colégio Espaço Criança – Berçário e Educação Infantil (Contato)',
    'Comercial / Responsável',
    '(15) 99608-9164',
    '(15) 99608-9164',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [100] Colégio Pleno – Educação Infantil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Colégio Pleno – Educação Infantil',
    'Colégio Pleno – Educação Infantil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Vila Progresso',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [101] Espaço de Eventos - Monteiro Lobato
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Espaço de Eventos - Monteiro Lobato',
    'Espaço de Eventos - Monteiro Lobato',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Antônio Aparecido Ferraz',
    '1111',
    NULL,
    'Parque Santa Isabel',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Espaço de Eventos - Monteiro Lobato (Contato)',
    'Comercial / Responsável',
    '(15) 99601-7877',
    '(15) 99601-7877',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papel, papelão, pet, latinha e plastico',
    'Papel, papelão, pet, latinha e plastico',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: A depender do evento',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [102] GD Eventos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'GD Eventos',
    'GD Eventos',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Serafina Milego Latorre',
    '430',
    NULL,
    'Jardim Vera Cruz',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'GD Eventos (Contato)',
    'Comercial / Responsável',
    '(15) 98835-6087',
    '(15) 98835-6087',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [103] Casa Magna Eventos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Casa Magna Eventos',
    'Casa Magna Eventos',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Estr. Raphael Lobo de Moraes',
    '395',
    NULL,
    'Brigadeiro Tobias',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Casa Magna Eventos (Contato)',
    'Comercial / Responsável',
    '(15) 99131-4020',
    '(15) 99131-4020',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [104] Camacho Espaço para Eventos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Camacho Espaço para Eventos',
    'Camacho Espaço para Eventos',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Antônio Monteiro Machado',
    '31',
    NULL,
    'Parque São Bento',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Camacho Espaço para Eventos (Contato)',
    'Comercial / Responsável',
    '(15) 98140-7930',
    '(15) 98140-7930',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [105] Espaço Verde Encanto
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Espaço Verde Encanto',
    'Espaço Verde Encanto',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Estr. da Servidão',
    '237',
    NULL,
    'Ana Maria',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Espaço Verde Encanto (Contato)',
    'Comercial / Responsável',
    '(15) 98152-5323',
    '(15) 98152-5323',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [106] Alhambra Eventos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Alhambra Eventos',
    'Alhambra Eventos',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Augusto Lippel',
    '10405',
    NULL,
    'Parque Campolim',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Alhambra Eventos (Contato)',
    'Comercial / Responsável',
    '(15) 97403-1474',
    '(15) 97403-1474',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Garrafa de wisky',
    'Garrafa de wisky',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [107] Espaço Casa da Vó
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Espaço Casa da Vó',
    'Espaço Casa da Vó',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Mogi Mirim',
    '130',
    NULL,
    'Cidade Jardim',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Espaço Casa da Vó (Contato)',
    'Comercial / Responsável',
    '(15) 99157-1664',
    '(15) 99157-1664',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [108] Espaço Festa e Lazer Novo Sol
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Espaço Festa e Lazer Novo Sol',
    'Espaço Festa e Lazer Novo Sol',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Esdras Gonçalves',
    '33',
    NULL,
    'Parque Vista Bárbara',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Espaço Festa e Lazer Novo Sol (Contato)',
    'Comercial / Responsável',
    '(15) 98806-4484',
    '(15) 98806-4484',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [109] Espaço Festa Summer
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Espaço Festa Summer',
    'Espaço Festa Summer',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Roberto Justi',
    '114',
    NULL,
    'Jardim Santa Catarina',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Espaço Festa Summer (Contato)',
    'Comercial / Responsável',
    '(15) 99722-6381',
    '(15) 99722-6381',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [110] Palace Club Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Palace Club Sorocaba',
    'Palace Club Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Campinas',
    '45',
    NULL,
    'Jardim Leocádia',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Palace Club Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 99144-1837',
    '(15) 99144-1837',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [111] Cervejaria Estação Beer
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Cervejaria Estação Beer',
    'Cervejaria Estação Beer',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Vila Fiori',
    NULL,
    NULL,
    'Sorocaba/SP',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Cervejaria Estação Beer (Contato)',
    'Comercial / Responsável',
    '(15) 99132-1958',
    '(15) 99132-1958',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [112] Cervejaria Burgman
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Cervejaria Burgman',
    'Cervejaria Burgman',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Eng. Carlos Reinaldo Mendes',
    '5025',
    NULL,
    'Jardim Pelegrino',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Cervejaria Burgman (Contato)',
    'Comercial / Responsável',
    '(15) 3218-1818',
    '(15) 3218-1818',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [113] Buffet Matsushima
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Buffet Matsushima',
    'Buffet Matsushima',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Savério Fazzio',
    '134',
    NULL,
    'Jardim Magnólia',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Buffet Matsushima (Contato)',
    'Comercial / Responsável',
    '(15) 98148-0022',
    '(15) 98148-0022',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [114] Buffet Guimarães
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Buffet Guimarães',
    'Buffet Guimarães',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Oswaldo Martins',
    '212',
    NULL,
    'Jardim Refúgio',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Buffet Guimarães (Contato)',
    'Comercial / Responsável',
    '(15) 99755-7500',
    '(15) 99755-7500',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [115] Buffet Vó Landa
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Buffet Vó Landa',
    'Buffet Vó Landa',
    NULL,
    'Restaurante / Alimentação',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Antônio de Oliveira',
    '117',
    NULL,
    'Vila Lucy',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Buffet Vó Landa (Contato)',
    'Comercial / Responsável',
    '(15) 98147-1780',
    '(15) 98147-1780',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [116] Eventos Damas e José
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Eventos Damas e José',
    'Eventos Damas e José',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Luís Paes de Almeida',
    '228',
    NULL,
    'Vila Raszl',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Eventos Damas e José (Contato)',
    'Comercial / Responsável',
    '(15) 99850-1961',
    '(15) 99850-1961',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [117] Bar do Tio Oscar
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Bar do Tio Oscar',
    'Bar do Tio Oscar',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Antônio Máximo',
    '32',
    NULL,
    'Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Bar do Tio Oscar (Contato)',
    'Comercial / Responsável',
    '(15) 99192-0097',
    '(15) 99192-0097',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [118] RR Águias Bar
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'RR Águias Bar',
    'RR Águias Bar',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Serra da Estrela',
    '01',
    NULL,
    'Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'RR Águias Bar (Contato)',
    'Comercial / Responsável',
    '(15) 99631-1014',
    '(15) 99631-1014',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [119] Road Shopping - Rodovia Castello Branco
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Road Shopping - Rodovia Castello Branco',
    'Road Shopping - Rodovia Castello Branco',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'IN_PROGRESS',
    'PRESENTATION_SENT',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '13308-700',
    'Rod. Pres. Castello Branco',
    NULL,
    NULL,
    'City Castello',
    'Itu',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Road Shopping - Rodovia Castello Branco (Contato)',
    'Comercial / Responsável',
    '(11) 4026-5050',
    '(11) 4026-5050',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [120] Catarina Fashion Outlet
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Catarina Fashion Outlet',
    'Catarina Fashion Outlet',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18147-000',
    'R. Rafael Dias Costa',
    '140',
    NULL,
    'São Roque',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Catarina Fashion Outlet (Contato)',
    'Comercial / Responsável',
    '(11) 4130-4800',
    '(11) 4130-4800',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [121] São Paulo Catarina Aeroporto Executivo Internacional
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'São Paulo Catarina Aeroporto Executivo Internacional',
    'São Paulo Catarina Aeroporto Executivo Internacional',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18132-900',
    'Rod. Pres. Castello Branco',
    NULL,
    NULL,
    'km 62 - São Roque',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'São Paulo Catarina Aeroporto Executivo Internacional (Contato)',
    'Comercial / Responsável',
    '(11) 4130-4870',
    '(11) 4130-4870',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [122] Embraer Executive Jets
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Embraer Executive Jets',
    'Embraer Executive Jets',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [123] Carrefour Hipermercado
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Carrefour Hipermercado',
    'Carrefour Hipermercado',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18065-100',
    'Av. Brasil',
    '376',
    NULL,
    'Terra Vermelha',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Carrefour Hipermercado (Contato)',
    'Comercial / Responsável',
    '(11) 3004-2222',
    '(11) 3004-2222',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [124] Golden Park Sorocaba & Convenções
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Golden Park Sorocaba & Convenções',
    'Golden Park Sorocaba & Convenções',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18087-125',
    'Rodovia Senador José Ermírio de Moraes',
    NULL,
    NULL,
    'Iporanga',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Golden Park Sorocaba & Convenções (Contato)',
    'Comercial / Responsável',
    '(11) 3512-8789',
    '(11) 3512-8789',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [125] Cacau Park
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Cacau Park',
    'Cacau Park',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [126] No Precinho - Loja 1
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'No Precinho - Loja 1',
    'No Precinho - Loja 1',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18103-431',
    'R. Eugênio Leite da Cruz',
    '431',
    NULL,
    'Jardim Jatoba',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'No Precinho - Loja 1 (Contato)',
    'Comercial / Responsável',
    '(15) 99128-9289',
    '(15) 99128-9289',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [127] Prysmian - Cabos e Sistemas do Brasil SA
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Prysmian - Cabos e Sistemas do Brasil SA',
    'Prysmian - Cabos e Sistemas do Brasil SA',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18103-085',
    'Av. Pirelli',
    '1100',
    NULL,
    'Éden',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Prysmian - Cabos e Sistemas do Brasil SA (Contato)',
    'Comercial / Responsável',
    '(15)3235-9000',
    '(15)3235-9000',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [128] DFF Embalagens | Fábrica de Embalagens Caixas em Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'DFF Embalagens | Fábrica de Embalagens Caixas em Sorocaba',
    'DFF Embalagens | Fábrica de Embalagens Caixas em Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18103-412',
    'R. Mariana Ribeiro de Andrade',
    '38',
    NULL,
    'Jardim Eden Ville',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'DFF Embalagens | Fábrica de Embalagens Caixas em Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 99736-0602',
    '(15) 99736-0602',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [129] Rewplastic Artefatos Plásticos - Indústria De Injeção Termoplástica
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Rewplastic Artefatos Plásticos - Indústria De Injeção Termoplástica',
    'Rewplastic Artefatos Plásticos - Indústria De Injeção Termoplástica',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18105-000',
    'Av. Paraná',
    '852',
    NULL,
    'Cajuru do Sul',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Rewplastic Artefatos Plásticos - Indústria De Injeção Termoplástica (Contato)',
    'Comercial / Responsável',
    '(15) 3325-6051',
    '(15) 3325-6051',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [130] CONSEG Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CONSEG Sorocaba',
    'CONSEG Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'LOGISTICS',
    'PENDING',
    'WAITING_LOGISTICS',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CONSEG Sorocaba (Contato)',
    'Comercial / Responsável',
    'Zeca',
    'Zeca',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: A definir',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [131] Condomínio Vert Ville
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Condomínio Vert Ville',
    'Condomínio Vert Ville',
    NULL,
    'Condomínio Logístico / Galpão',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'LOGISTICS',
    'PENDING',
    'WAITING_LOGISTICS',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Avenida Carlos Drummond de Andrade',
    NULL,
    NULL,
    'nº 159',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Condomínio Vert Ville (Contato)',
    'Comercial / Responsável',
    'Zion',
    'Zion',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    4,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: 4 contentores de 1.000 L',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [132] Edifício Deuses do Olimpo
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Edifício Deuses do Olimpo',
    'Edifício Deuses do Olimpo',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'LOGISTICS',
    'PENDING',
    'WAITING_LOGISTICS',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Val de Palmas',
    '302',
    NULL,
    '– Vila Prudente',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Edifício Deuses do Olimpo (Contato)',
    'Comercial / Responsável',
    'Zion',
    'Zion',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: Big Bags / 2.000 kg ou contentores de 1000 L',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [133] NelSom Eletrônica
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'NelSom Eletrônica',
    'NelSom Eletrônica',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Cel. Nogueira Padilha',
    '683',
    NULL,
    '– Vila Hortência',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'NelSom Eletrônica (Contato)',
    'Comercial / Responsável',
    '(15) 99122-7384',
    '(15) 99122-7384',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Eletrônicos',
    'Eletrônicos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [134] MR Eletrônica - Conserto e Reparos de Aparelhos Eletrônicos
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'MR Eletrônica - Conserto e Reparos de Aparelhos Eletrônicos',
    'MR Eletrônica - Conserto e Reparos de Aparelhos Eletrônicos',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Atílio Silvano',
    '292',
    NULL,
    '– Jd. Pacaembu',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'MR Eletrônica - Conserto e Reparos de Aparelhos Eletrônicos (Contato)',
    'Comercial / Responsável',
    '(15) 99701-6593',
    '(15) 99701-6593',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Eletrônicos',
    'Eletrônicos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: N/A',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [135] Eletrônica Total
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Eletrônica Total',
    'Eletrônica Total',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Dr. Artur Bernardes',
    '815',
    NULL,
    '– Vila Progresso',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Eletrônica Total (Contato)',
    'Comercial / Responsável',
    '(15) 99627-8359',
    '(15) 99627-8359',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Eletrônicos',
    'Eletrônicos',
    0,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [136] Infomaxx Informática Sorocaba
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Infomaxx Informática Sorocaba',
    'Infomaxx Informática Sorocaba',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. Dr. Américo Figueiredo',
    '2451',
    NULL,
    '– Jd. Simus',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Infomaxx Informática Sorocaba (Contato)',
    'Comercial / Responsável',
    '(15) 98815-4655',
    '(15) 98815-4655',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Eletrônicos',
    'Eletrônicos',
    0,
    'kg',
    'monthly',
    'purchase',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [137] FAERTECH TECNOLOGIA
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'FAERTECH TECNOLOGIA',
    'FAERTECH TECNOLOGIA',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'R. João Crespo Lopes',
    '13',
    NULL,
    '– Jd. América',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'FAERTECH TECNOLOGIA (Contato)',
    'Comercial / Responsável',
    '(15) 99797-1872',
    '(15) 99797-1872',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [138] Hackers Informática
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Hackers Informática',
    'Hackers Informática',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Gen. Osório',
    '967',
    NULL,
    '– Vila Trujillo',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Hackers Informática (Contato)',
    'Comercial / Responsável',
    '(15) 97404-0208',
    '(15) 97404-0208',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [139] E9 INFORMÁTICA
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'E9 INFORMÁTICA',
    'E9 INFORMÁTICA',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Av. Manoel de Camargo Sampaio',
    '763',
    NULL,
    '– Vila Helena',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'E9 INFORMÁTICA (Contato)',
    'Comercial / Responsável',
    '(15) 98100-4559',
    '(15) 98100-4559',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [140] Condomínio Modular Trade Center
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Condomínio Modular Trade Center',
    'Condomínio Modular Trade Center',
    NULL,
    'Condomínio Logístico / Galpão',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18087-170',
    'Av. Liberdade',
    '4565',
    NULL,
    'Iporanga',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Condomínio Modular Trade Center (Contato)',
    'Comercial / Responsável',
    '(15) 3228-3548',
    '(15) 3228-3548',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [141] BARRACÃO REVERSA COMERCIO DE PRODUTOS
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'BARRACÃO REVERSA COMERCIO DE PRODUTOS',
    'BARRACÃO REVERSA COMERCIO DE PRODUTOS',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18086-432',
    'R. José João Alves',
    '31',
    NULL,
    'Parque empresarial das Mangueiras',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'BARRACÃO REVERSA COMERCIO DE PRODUTOS (Contato)',
    'Comercial / Responsável',
    '(15) 99696-6956',
    '(15) 99696-6956',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [142] O Caçador de Galpões
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'O Caçador de Galpões',
    'O Caçador de Galpões',
    NULL,
    'Condomínio Logístico / Galpão',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18030-005',
    'Rod. Raposo Tavares',
    NULL,
    NULL,
    'S/N',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'O Caçador de Galpões (Contato)',
    'Comercial / Responsável',
    '(11) 98344-7886',
    '(11) 98344-7886',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [143] Direct Express Logística Integrada
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Direct Express Logística Integrada',
    'Direct Express Logística Integrada',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Yashica',
    '519 - glp 4',
    NULL,
    'glp 4',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Direct Express Logística Integrada (Contato)',
    'Comercial / Responsável',
    '(15) 3227-2990',
    '(15) 3227-2990',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [144] Condomínio Industrial Aparecidinha
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Condomínio Industrial Aparecidinha',
    'Condomínio Industrial Aparecidinha',
    NULL,
    'Condomínio Logístico / Galpão',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18087-280',
    'Rua Joaquim Machado',
    '250',
    NULL,
    'Aparecidinha',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Condomínio Industrial Aparecidinha (Contato)',
    'Comercial / Responsável',
    '(15) 3225-2807',
    '(15) 3225-2807',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [145] METROPOLITANO EMPRESARIAL
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'METROPOLITANO EMPRESARIAL',
    'METROPOLITANO EMPRESARIAL',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    '18103-000',
    'R. Moacyr de Castro',
    '100',
    NULL,
    'Éden',
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'METROPOLITANO EMPRESARIAL (Contato)',
    'Comercial / Responsável',
    '(15) 99634-9079',
    '(15) 99634-9079',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [146] Flex (Flextronics)
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Flex (Flextronics)',
    'Flex (Flextronics)',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Flex (Flextronics) (Contato)',
    'Comercial / Responsável',
    '(15) 4009-6647 - (15) 4009-6200',
    '(15) 4009-6647 - (15) 4009-6200',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [147] Robert Bosch
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Robert Bosch',
    'Robert Bosch',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Campinas',
    NULL,
    NULL,
    NULL,
    'Campinas',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Robert Bosch (Contato)',
    'Comercial / Responsável',
    '(19) 2103-4278',
    '(19) 2103-4278',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [148] Samsung Eletrônica
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Samsung Eletrônica',
    'Samsung Eletrônica',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Campinas',
    NULL,
    NULL,
    NULL,
    'Campinas',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [149] Ambev
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Ambev',
    'Ambev',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jaguariúna',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [150] Tauste Supermercados
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Tauste Supermercados',
    'Tauste Supermercados',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Tauste Supermercados (Contato)',
    'Comercial / Responsável',
    '(15) 3414-1880 - (15)996838677',
    '(15) 3414-1880 - (15)996838677',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [151] Mercado Livre
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Mercado Livre',
    'Mercado Livre',
    NULL,
    'Comércio / Varejo',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Cajamar',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [152] Amazon Brasil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Amazon Brasil',
    'Amazon Brasil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Cajamar',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [153] Whirlpool
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Whirlpool',
    'Whirlpool',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rio Claro',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Whirlpool (Contato)',
    'Comercial / Responsável',
    '(11) 4480-7100',
    '(11) 4480-7100',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [154] Eurofarma
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Eurofarma',
    'Eurofarma',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Itapevi',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [155] Multicoisas
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Multicoisas',
    'Multicoisas',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Várias',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Multicoisas (Contato)',
    'Comercial / Responsável',
    '(15) 3032-0142',
    '(15) 3032-0142',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [156] Ferramentarias Éden
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Ferramentarias Éden',
    'Ferramentarias Éden',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [157] Cintitec
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Cintitec',
    'Cintitec',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Osasco',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Cintitec (Contato)',
    'Comercial / Responsável',
    'Brito -',
    'Brito -',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [158] Global Reverso
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Global Reverso',
    'Global Reverso',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Nacional',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [159] Reciclagem Brasil
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Reciclagem Brasil',
    'Reciclagem Brasil',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Cabreúva',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Reciclagem Brasil (Contato)',
    'Comercial / Responsável',
    '(11) 4529-3776/ (11) 96389-1753',
    '(11) 4529-3776/ (11) 96389-1753',
    'contato@reciclagembrasil.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [160] Reversis
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Reversis',
    'Reversis',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Campinas',
    NULL,
    NULL,
    NULL,
    'Campinas',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Reversis (Contato)',
    'Comercial / Responsável',
    '(19) 2101-5100',
    '(19) 2101-5100',
    'contato@reversis.com.br',
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [161] PUC-SP
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'PUC-SP',
    'PUC-SP',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Sorocaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [162] UNICAMP
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNICAMP',
    'UNICAMP',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Campinas',
    NULL,
    NULL,
    NULL,
    'Campinas',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'UNICAMP (Contato)',
    'Comercial / Responsável',
    '1935218071',
    '1935218071',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [163] UNIMEP
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNIMEP',
    'UNIMEP',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Piracicaba',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [164] FMJ
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'FMJ',
    'FMJ',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jundiaí',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [165] USP
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'USP',
    'USP',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Paulo',
    NULL,
    NULL,
    NULL,
    'São Paulo',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'USP (Contato)',
    'Comercial / Responsável',
    '(16) 3373-9333',
    '(16) 3373-9333',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [166] UNIFESP
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNIFESP',
    'UNIFESP',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Paulo',
    NULL,
    NULL,
    NULL,
    'São Paulo',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [167] UFABC
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UFABC',
    'UFABC',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Diadema',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'UFABC (Contato)',
    'Comercial / Responsável',
    '(11) 3356-7000',
    '(11) 3356-7000',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [168] FGV
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'FGV',
    'FGV',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Paulo',
    NULL,
    NULL,
    NULL,
    'São Paulo',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'FGV (Contato)',
    'Comercial / Responsável',
    '(11) 3799-7700',
    '(11) 3799-7700',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [169] INSPER
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'INSPER',
    'INSPER',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Paulo',
    NULL,
    NULL,
    NULL,
    'São Paulo',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'INSPER (Contato)',
    'Comercial / Responsável',
    '(11) 4504-2400',
    '(11) 4504-2400',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [170] ESPM
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'ESPM',
    'ESPM',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Paulo',
    NULL,
    NULL,
    NULL,
    'São Paulo',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'ESPM (Contato)',
    'Comercial / Responsável',
    '0800 607 3777',
    '0800 607 3777',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [171] PUC
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'PUC',
    'PUC',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Paulo',
    NULL,
    NULL,
    NULL,
    'São Paulo',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'PUC (Contato)',
    'Comercial / Responsável',
    '(11) 3670-8000',
    '(11) 3670-8000',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [172] Mackenzie
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Mackenzie',
    'Mackenzie',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Paulo',
    NULL,
    NULL,
    NULL,
    'São Paulo',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Mackenzie (Contato)',
    'Comercial / Responsável',
    '(11) 2114-8000',
    '(11) 2114-8000',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [173] ITA
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'ITA',
    'ITA',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São José dos Campos',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'ITA (Contato)',
    'Comercial / Responsável',
    '(12) 3947-5856',
    '(12) 3947-5856',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [174] UNITAU
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNITAU',
    'UNITAU',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Taubaté',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'UNITAU (Contato)',
    'Comercial / Responsável',
    '(12) 3624-2888',
    '(12) 3624-2888',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [175] UNISANTOS
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'UNISANTOS',
    'UNISANTOS',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Santos',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [176] Instituto Mauá de Tecnologia
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Instituto Mauá de Tecnologia',
    'Instituto Mauá de Tecnologia',
    NULL,
    'Instituição / Educação / Saúde',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'São Caetano do Sul',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Instituto Mauá de Tecnologia (Contato)',
    'Comercial / Responsável',
    '0800 019 3100',
    '0800 019 3100',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [177] Vivo/Telefônica
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Vivo/Telefônica',
    'Vivo/Telefônica',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Nacional',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [178] CIESP Jundiaí
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CIESP Jundiaí',
    'CIESP Jundiaí',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Jundiaí',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CIESP Jundiaí (Contato)',
    'Comercial / Responsável',
    '(11) 4815-7941',
    '(11) 4815-7941',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [179] CIESP Cotia
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CIESP Cotia',
    'CIESP Cotia',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Cotia',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CIESP Cotia (Contato)',
    'Comercial / Responsável',
    '(11) 4612-9722',
    '(11) 4612-9722',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [180] CIESP Americana
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'CIESP Americana',
    'CIESP Americana',
    NULL,
    'Indústria',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'PROSPECTING',
    'PENDING',
    'NEW_LEAD',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Americana',
    NULL,
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'CIESP Americana (Contato)',
    'Comercial / Responsável',
    '(19) 3471-0400',
    '(19) 3471-0400',
    NULL,
    TRUE,
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis em geral',
    'Recicláveis em geral',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    NULL,
    NOW()
  );

  -- ------------------------------------------------------------
  -- [181] Lar Escola Monteiro Lobato
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Lar Escola Monteiro Lobato',
    'Lar Escola Monteiro Lobato',
    NULL,
    'Instituição / Educação / Saúde',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'LOGISTICS',
    'PENDING',
    'WAITING_LOGISTICS',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Rua Antônio Aparecido Ferraz',
    '1111',
    NULL,
    NULL,
    'Sorocaba',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Recicláveis diversos',
    'Recicláveis diversos',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: A definir',
    NOW()
  );

  -- ------------------------------------------------------------
  -- [182] Universidade Mackenzie
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    'Universidade Mackenzie',
    'Universidade Mackenzie',
    NULL,
    'Instituição / Educação / Saúde',
    'Prospecção HUB Sorocaba',
    v_admin_id,
    'LOGISTICS',
    'PENDING',
    'WAITING_LOGISTICS',
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    NULL,
    'Higienópolis/São Paulo',
    NULL,
    NULL,
    NULL,
    'São Paulo',
    'SP',
    NOW()
  );

  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    'Papelão, papel branco/sigiloso, plásticos, latas de alumínio, tampinhas, livros e metais',
    'Papelão, papel branco/sigiloso, plásticos, latas d',
    0,
    'kg',
    'monthly',
    'donation',
    0,
    'Sacos / Bags / Caixas',
    'Estimativa: Aproximadamente 2 VUCs/semana (950 a 1.000 kg por coleta)',
    NOW()
  );

END $$;
