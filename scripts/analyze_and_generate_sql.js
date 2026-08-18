const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Possíveis fornecedores_HUB Sorocaba (1).xlsx');
const workbook = XLSX.readFile(filePath);

// Let's analyze the sheets
console.log('Workbook sheets:', workbook.SheetNames);

const sheet1 = XLSX.utils.sheet_to_json(workbook.Sheets['Prospecção de Geradores'], { header: 1 });
console.log('Prospecção de Geradores headers:', sheet1[1]);
console.log('Sample row from Prospecção de Geradores:', sheet1[2]);

const sheet2 = XLSX.utils.sheet_to_json(workbook.Sheets['Possíveis Fornec'], { header: 1 });
console.log('Possíveis Fornec headers:', sheet2[2]);
console.log('Sample row from Possíveis Fornec:', sheet2[3]);

const sheet3 = XLSX.utils.sheet_to_json(workbook.Sheets['Gabs'], { header: 1 });
console.log('Gabs headers:', sheet3[1]);
console.log('Sample row from Gabs:', sheet3[2]);
