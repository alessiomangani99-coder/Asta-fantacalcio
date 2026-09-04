const fs = require('fs');

function checkEntities(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const entityMatches = content.match(/&#[xX]?[0-9a-fA-F]+;?/g) || [];
  console.log(`Entities in ${file}:`, Array.from(new Set(entityMatches)));
}

checkEntities('fantacalcio_2025_26.csv');
checkEntities('fantacalcio_storico_PRONTO.csv');
