const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Possíveis fornecedores_HUB Sorocaba (1).xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheet inspection:');

const s1 = XLSX.utils.sheet_to_json(workbook.Sheets['Prospecção de Geradores'], { header: 1 });
const rows1 = s1.slice(2).filter(r => r && r[1] && String(r[1]).trim().length > 0);
console.log(`Prospecção de Geradores: ${rows1.length} valid companies with ID from ${rows1[0][0]} to ${rows1[rows1.length-1][0]}`);

const s2 = XLSX.utils.sheet_to_json(workbook.Sheets['Possíveis Fornec'], { header: 1 });
const rows2 = s2.slice(3).filter(r => r && r[1] && String(r[1]).trim().length > 0);
console.log(`Possíveis Fornec: ${rows2.length} companies with # from ${rows2[0][0]} to ${rows2[rows2.length-1][0]}`);

const s3 = XLSX.utils.sheet_to_json(workbook.Sheets['Gabs'], { header: 1 });
const rows3 = s3.slice(2).filter(r => r && r[0] && String(r[0]).trim().length > 0);
console.log(`Gabs: ${rows3.length} companies`);
