const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Possíveis fornecedores_HUB Sorocaba (1).xlsx');
const workbook = XLSX.readFile(filePath);

// Helpers
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
    return { street: '', number: '', neighborhood: '', city: 'Sorocaba', state: 'SP', zip_code: '' };
  }

  let street = '';
  let number = '';
  let neighborhood = '';
  let city = 'Sorocaba';
  let state = 'SP';
  let zip_code = '';

  // Extract CEP (format 00000-000 or 00000000)
  const cepMatch = full.match(/(\d{5}-\d{3}|\d{8})/);
  if (cepMatch) {
    zip_code = cepMatch[1];
  }

  // Extract State (SP, RJ, MG, etc.)
  const stateMatch = full.match(/-\s*([A-Z]{2})\b/);
  if (stateMatch) {
    state = stateMatch[1];
  }

  // Split by comma or hyphen
  const parts = full.split(',').map(p => p.trim());

  if (parts.length >= 1) {
    // First part is usually street or street + number
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
    // Check if second part is number
    const second = parts[1];
    const numMatch2 = second.match(/^(\d+[\w\s\-/]*?)(?:\s*-\s*|\s+|$)(.*)/);
    if (numMatch2) {
      number = numMatch2[1].trim();
      if (numMatch2[2] && !neighborhood) neighborhood = numMatch2[2].trim();
    } else {
      neighborhood = second;
    }
  }

  // Look for neighborhood
  const neighMatch = full.match(/-\s*([^,-]+?)\s*,\s*([^,-]+?)\s*-\s*([A-Z]{2})/i);
  if (neighMatch) {
    neighborhood = neighMatch[1].trim();
    city = neighMatch[2].trim();
    state = neighMatch[3].trim();
  } else {
    // Check for city
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
    street: street || full,
    number: number || '',
    neighborhood: neighborhood || '',
    city: city || 'Sorocaba',
    state: state || 'SP',
    zip_code: zip_code || ''
  };
}

function inferSegment(name, comments, mat) {
  const text = `${name} ${comments} ${mat}`.toLowerCase();
  if (text.includes('business park') || text.includes('galpões') || text.includes('logístico') || text.includes('condomínio') || text.includes('logistica')) {
    return 'Condomínio Logístico / Galpão';
  }
  if (text.includes('restaurante') || text.includes('buffet') || text.includes('café') || text.includes('padaria') || text.includes('churrascaria') || text.includes('alimento')) {
    return 'Restaurante / Alimentação';
  }
  if (text.includes('escola') || text.includes('faculdade') || text.includes('instituto') || text.includes('universidade') || text.includes('hospital') || text.includes('lar')) {
    return 'Instituição / Educação / Saúde';
  }
  if (text.includes('metalúrgica') || text.includes('química') || text.includes('plásticos') || text.includes('embalagens') || text.includes('fábrica') || text.includes('autopeças') || text.includes('indústria') || text.includes('industria')) {
    return 'Indústria';
  }
  if (text.includes('supermercado') || text.includes('mercado') || text.includes('atacado') || text.includes('loja') || text.includes('shopping') || text.includes('comércio') || text.includes('comercio')) {
    return 'Comércio / Varejo';
  }
  if (text.includes('hotel') || text.includes('pousada') || text.includes('resort')) {
    return 'Hotelaria / Turismo';
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

// Data accumulator keyed by lowercase clean name
const companiesMap = new Map();

// 1. Process "Prospecção de Geradores"
const sheetProsp = XLSX.utils.sheet_to_json(workbook.Sheets['Prospecção de Geradores'], { header: 1 });
for (let i = 2; i < sheetProsp.length; i++) {
  const row = sheetProsp[i];
  if (!row || !row[1]) continue;
  const name = cleanStr(row[1]);
  if (!name || name.length < 2) continue;

  const key = name.toLowerCase().replace(/[^\w\s]/gi, '').trim();
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

  companiesMap.set(key, {
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
    source: 'Prospecção de Geradores HUB Sorocaba'
  });
}

// 2. Process "Possíveis Fornec"
const sheetFornec = XLSX.utils.sheet_to_json(workbook.Sheets['Possíveis Fornec'], { header: 1 });
for (let i = 3; i < sheetFornec.length; i++) {
  const row = sheetFornec[i];
  if (!row || !row[1]) continue;
  const name = cleanStr(row[1]);
  if (!name || name.length < 2) continue;

  const key = name.toLowerCase().replace(/[^\w\s]/gi, '').trim();
  const address = cleanStr(row[2]);
  const phone = cleanStr(row[3]);
  const email = cleanStr(row[4]);
  const website = cleanStr(row[5]);
  const comments = cleanStr(row[6]);
  const materialsStr = cleanStr(row[7]);
  const volumeStr = cleanStr(row[8]);
  const freqStr = cleanStr(row[9]);

  if (companiesMap.has(key)) {
    const existing = companiesMap.get(key);
    if (!existing.phone && phone) existing.phone = phone;
    if (!existing.email && email) existing.email = email;
    if (!existing.rawAddress && address) existing.rawAddress = address;
    if (!existing.materialsStr && materialsStr) existing.materialsStr = materialsStr;
    if (!existing.volumeStr && volumeStr) existing.volumeStr = volumeStr;
    if (comments) existing.notes = (existing.notes ? existing.notes + ' | ' : '') + comments;
    if (website) existing.website = website;
  } else {
    companiesMap.set(key, {
      name,
      rawAddress: address,
      phone,
      email,
      website,
      comments,
      materialsStr,
      volumeStr,
      freqStr,
      notes: comments,
      source: 'Possíveis Fornec HUB Sorocaba'
    });
  }
}

// 3. Process "Gabs" (Logistics Leads)
const sheetGabs = XLSX.utils.sheet_to_json(workbook.Sheets['Gabs'], { header: 1 });
for (let i = 2; i < sheetGabs.length; i++) {
  const row = sheetGabs[i];
  if (!row || !row[0]) continue;
  const name = cleanStr(row[0]);
  if (!name || name.length < 2) continue;

  const key = name.toLowerCase().replace(/[^\w\s]/gi, '').trim();
  const loc = cleanStr(row[1]);
  const mat = cleanStr(row[2]);
  const qty = cleanStr(row[3]);
  const val = cleanStr(row[4]);
  const quote = cleanStr(row[5]);
  const transport = cleanStr(row[6]);
  const statusStr = cleanStr(row[7]);

  if (companiesMap.has(key)) {
    const existing = companiesMap.get(key);
    existing.sentGabsStr = 'Sim';
    existing.statusStr = statusStr || 'Aguardando Logística';
    if (mat) existing.materialsStr = mat;
    if (qty) existing.volumeStr = qty;
    if (transport) existing.transport = transport;
    if (quote) existing.quote = quote;
  } else {
    companiesMap.set(key, {
      name,
      rawAddress: loc,
      materialsStr: mat,
      volumeStr: qty,
      modalityStr: val,
      transport,
      quote,
      statusStr: statusStr || 'Aguardando Logística',
      sentGabsStr: 'Sim',
      source: 'Gabs Logística'
    });
  }
}

console.log(`\nTotal unique companies extracted: ${companiesMap.size}`);

// Generate SQL statements
let sql = `-- ============================================================
-- SCRIPT DE IMPORTAÇÃO EM LOTE: FORNECEDORES / GERADORES HUB SOROCABA
-- Gerado automaticamente a partir da planilha oficial da iWrc
-- Total de Geradores: ${companiesMap.size}
-- ============================================================

DO $$
DECLARE
  v_admin_id UUID;
  v_supplier_id UUID;
BEGIN
  -- Identifica o usuário admin/comprador atual no banco
  SELECT id INTO v_admin_id FROM profiles LIMIT 1;

`;

let count = 0;
for (const [key, item] of companiesMap.entries()) {
  count++;
  const addr = parseAddress(item.rawAddress);
  const segment = inferSegment(item.name, item.notes || item.comments || '', item.materialsStr || '');
  const { stage, status, backlog } = inferStageAndStatus(item.statusStr, item.sentGabsStr);

  const cleanName = item.name;
  const phone = item.phone || '';
  const email = item.email || '';
  const matStr = item.materialsStr || 'Recicláveis em geral';
  const volStr = item.volumeStr || '';
  const modality = (item.modalityStr && item.modalityStr.toLowerCase().includes('compra')) ? 'purchase' : 'donation';

  sql += `
  -- ------------------------------------------------------------
  -- [${count}] ${cleanName.replace(/--/g, '')}
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
}

sql += `
END $$;
`;

const outputPath = path.join(__dirname, '..', 'supabase', 'seed_sorocaba_fornecedores.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`\nSuccessfully generated SQL file at: ${outputPath}`);
