const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Possíveis fornecedores_HUB Sorocaba (1).xlsx');
const workbook = XLSX.readFile(filePath);

function cleanStr(val) {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (s === 'N/I' || s === 'n/i' || s === '-' || s === 'undefined' || s === 'null') return '';
  return s;
}

function escapeSql(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function parseAddress(raw) {
  const full = cleanStr(raw);
  if (!full) {
    return { street: 'Endereço não informado', number: 'S/N', neighborhood: 'Centro', city: 'Sorocaba', state: 'SP', zip_code: '18000-000' };
  }

  let street = '';
  let number = '';
  let neighborhood = '';
  let city = 'Sorocaba';
  let state = 'SP';
  let zip_code = '';

  const cepMatch = full.match(/(\d{5}-\d{3}|\d{8})/);
  if (cepMatch) zip_code = cepMatch[1];

  const stateMatch = full.match(/-\s*([A-Z]{2})\b/);
  if (stateMatch) state = stateMatch[1];

  const parts = full.split(',').map(p => p.trim());

  if (parts.length >= 1) {
    const streetPart = parts[0];
    const numMatch = streetPart.match(/(.*?)(?:,\s*|\s+n[º°.]?\s*|\s+)(\d+[\w\s\-/]*)$/i);
    if (numMatch && numMatch[2] && isNaN(Number(streetPart))) {
      street = numMatch[1].trim();
      number = numMatch[2].trim();
    } else {
      street = streetPart;
    }
  }

  if (parts.length >= 2 && !number) {
    const second = parts[1];
    const numMatch2 = second.match(/^(\d+[\w\s\-/]*?)(?:\s*-\s*|\s+|$)(.*)/);
    if (numMatch2) {
      number = numMatch2[1].trim();
      if (numMatch2[2] && !neighborhood) neighborhood = numMatch2[2].trim();
    } else {
      neighborhood = second;
    }
  }

  const neighMatch = full.match(/-\s*([^,-]+?)\s*,\s*([^,-]+?)\s*-\s*([A-Z]{2})/i);
  if (neighMatch) {
    neighborhood = neighMatch[1].trim();
    city = neighMatch[2].trim();
    state = neighMatch[3].trim();
  } else {
    if (full.toLowerCase().includes('sorocaba')) city = 'Sorocaba';
    else if (full.toLowerCase().includes('itupeva')) city = 'Itupeva';
    else if (full.toLowerCase().includes('votorantim')) city = 'Votorantim';
    else if (full.toLowerCase().includes('itu')) city = 'Itu';
    else if (full.toLowerCase().includes('salto')) city = 'Salto';
    else if (full.toLowerCase().includes('campinas')) city = 'Campinas';
    else if (full.toLowerCase().includes('indaiatuba')) city = 'Indaiatuba';
    else if (full.toLowerCase().includes('são paulo') || full.toLowerCase().includes('sao paulo')) city = 'São Paulo';
  }

  return {
    street: street || full || 'Endereço não informado',
    number: number || 'S/N',
    neighborhood: neighborhood || 'Centro',
    city: city || 'Sorocaba',
    state: state || 'SP',
    zip_code: zip_code || '18000-000'
  };
}

function inferSegment(name, comments, mat) {
  const text = `${name} ${comments} ${mat}`.toLowerCase();
  if (text.includes('business park') || text.includes('galpões') || text.includes('logístico') || text.includes('condomínio') || text.includes('logistica')) {
    return 'Condomínio Logístico / Galpão';
  }
  if (text.includes('restaurante') || text.includes('buffet') || text.includes('café') || text.includes('padaria') || text.includes('churrascaria') || text.includes('alimento') || text.includes('costela') || text.includes('kostela')) {
    return 'Restaurante / Alimentação';
  }
  if (text.includes('escola') || text.includes('faculdade') || text.includes('instituto') || text.includes('universidade') || text.includes('hospital') || text.includes('lar') || text.includes('mackenzie')) {
    return 'Instituição / Educação / Saúde';
  }
  if (text.includes('metalúrgica') || text.includes('química') || text.includes('plásticos') || text.includes('embalagens') || text.includes('fábrica') || text.includes('autopeças') || text.includes('indústria') || text.includes('industria')) {
    return 'Indústria';
  }
  if (text.includes('supermercado') || text.includes('mercado') || text.includes('atacado') || text.includes('loja') || text.includes('shopping') || text.includes('comércio') || text.includes('comercio')) {
    return 'Comércio / Varejo';
  }
  return 'Indústria';
}

function inferStageAndStatus(statusRaw, sentGabsRaw) {
  const st = cleanStr(statusRaw).toLowerCase();
  const gabs = cleanStr(sentGabsRaw).toLowerCase();

  if (gabs === 'sim' || st.includes('gabs') || st.includes('logística') || st.includes('logistica')) {
    return { stage: 'LOGISTICS', status: 'PENDING', backlog: 'WAITING_LOGISTICS' };
  }
  if (st.includes('qualificado') || st.includes('aprovado') || st.includes('interessado')) {
    return { stage: 'QUALIFICATION', status: 'APPROVED', backlog: 'QUALIFIED' };
  }
  if (st.includes('apresentação enviada') || st.includes('apresentacao enviada') || st.includes('e-mail enviado') || st.includes('email enviado')) {
    return { stage: 'PROSPECTING', status: 'IN_PROGRESS', backlog: 'PRESENTATION_SENT' };
  }
  if (st.includes('contato feito') || st.includes('em contato') || st.includes('em negociação') || st.includes('aguardando retorno')) {
    return { stage: 'PROSPECTING', status: 'IN_PROGRESS', backlog: 'FIRST_CONTACT' };
  }
  return { stage: 'PROSPECTING', status: 'PENDING', backlog: 'NEW_LEAD' };
}

// 1. Process "Prospecção de Geradores" (The official 139 rows)
const sheetProsp = XLSX.utils.sheet_to_json(workbook.Sheets['Prospecção de Geradores'], { header: 1 });
const leadsList = [];

for (let i = 2; i < sheetProsp.length; i++) {
  const row = sheetProsp[i];
  if (!row || !row[1]) continue;
  const name = cleanStr(row[1]);
  if (!name || name.length < 2) continue;

  const id = row[0];
  const address = cleanStr(row[2]);
  const phone = cleanStr(row[3]);
  const email = cleanStr(row[4]);
  const responsible = cleanStr(row[5]);
  const statusStr = cleanStr(row[6]);
  const materialsStr = cleanStr(row[7]);
  const volumeStr = cleanStr(row[8]);
  const partnerStr = cleanStr(row[9]);
  const modalityStr = cleanStr(row[10]);
  const priceStr = cleanStr(row[11]);
  const sentGabsStr = cleanStr(row[12]);

  leadsList.push({
    id,
    name,
    rawAddress: address,
    phone,
    email,
    responsible,
    statusStr,
    materialsStr,
    volumeStr,
    partnerStr,
    modalityStr,
    priceStr,
    sentGabsStr,
    notes: partnerStr ? `Parceiro atual: ${partnerStr}` : '',
    source: 'Prospecção HUB Sorocaba'
  });
}

console.log(`\nExact leads from "Prospecção de Geradores": ${leadsList.length}`);

// Generate SQL statements
let sql = `-- ============================================================
-- SCRIPT DE IMPORTAÇÃO EM LOTE: FORNECEDORES / GERADORES HUB SOROCABA
-- Gerado a partir da aba oficial "Prospecção de Geradores"
-- Total Exato de Geradores: ${leadsList.length}
-- ============================================================

DO $$
DECLARE
  v_admin_id UUID;
  v_supplier_id UUID;
BEGIN
  -- Identifica o usuário admin/comprador atual no banco
  SELECT id INTO v_admin_id FROM profiles LIMIT 1;

`;

leadsList.forEach((item, index) => {
  const count = index + 1;
  const addr = parseAddress(item.rawAddress);
  const segment = inferSegment(item.name, item.notes || '', item.materialsStr || '');
  const { stage, status, backlog } = inferStageAndStatus(item.statusStr, item.sentGabsStr);

  const cleanName = item.name;
  const phone = item.phone || '';
  const email = item.email || '';
  const matStr = item.materialsStr || 'Recicláveis em geral';
  const volStr = item.volumeStr || '';
  const modality = (item.modalityStr && item.modalityStr.toLowerCase().includes('compra')) ? 'purchase' : 'donation';

  sql += `
  -- ------------------------------------------------------------
  -- [${count}] (Planilha ID: ${item.id}) ${cleanName.replace(/--/g, '')}
  -- ------------------------------------------------------------
  v_supplier_id := gen_random_uuid();

  INSERT INTO suppliers (
    id, name, trade_name, document, supplier_type, lead_source,
    internal_responsible_id, current_stage, current_status, backlog_reason, created_at, updated_at
  ) VALUES (
    v_supplier_id,
    ${escapeSql(cleanName)},
    ${escapeSql(cleanName)},
    NULL,
    ${escapeSql(segment)},
    'Prospecção HUB Sorocaba',
    v_admin_id,
    '${stage}',
    '${status}',
    ${escapeSql(backlog)},
    NOW(),
    NOW()
  );

  INSERT INTO supplier_addresses (
    id, supplier_id, zip_code, street, number, complement, neighborhood, city, state, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    ${escapeSql(addr.zip_code)},
    ${escapeSql(addr.street)},
    ${escapeSql(addr.number)},
    NULL,
    ${escapeSql(addr.neighborhood)},
    ${escapeSql(addr.city)},
    ${escapeSql(addr.state)},
    NOW()
  );
`;

  if (phone || email) {
    sql += `
  INSERT INTO supplier_contacts (
    id, supplier_id, name, role, phone, whatsapp, email, is_primary, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    ${escapeSql(cleanName + ' (Contato)')},
    'Comercial / Responsável',
    ${escapeSql(phone)},
    ${escapeSql(phone)},
    ${escapeSql(email)},
    TRUE,
    NOW()
  );
`;
  }

  if (matStr && matStr !== 'N/I') {
    sql += `
  INSERT INTO supplier_materials (
    id, supplier_id, material_name, category, estimated_volume, unit, frequency,
    transaction_type, price_per_kg, storage_form, notes, created_at
  ) VALUES (
    gen_random_uuid(),
    v_supplier_id,
    ${escapeSql(matStr.slice(0, 100))},
    ${escapeSql(matStr.slice(0, 50))},
    ${isNaN(parseFloat(volStr)) ? 0 : parseFloat(volStr)},
    'kg',
    'monthly',
    '${modality}',
    0,
    'Sacos / Bags / Caixas',
    ${escapeSql(volStr ? `Estimativa: ${volStr}` : null)},
    NOW()
  );
`;
  }
});

sql += `
END $$;
`;

const outputPath = path.join(__dirname, '..', 'supabase', 'seed_sorocaba_fornecedores.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`\nSuccessfully generated SQL file with exactly ${leadsList.length} suppliers at: ${outputPath}`);
