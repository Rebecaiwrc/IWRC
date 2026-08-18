const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Possíveis fornecedores_HUB Sorocaba (1).xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\n--- Sheet: ${sheetName} (Total Rows: ${data.length}) ---`);
  console.log('First 5 rows:');
  console.log(data.slice(0, 5));
});
