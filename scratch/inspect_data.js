const fs = require('fs');

function analyzeCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = lines[0].split(';');
  console.log(`File: ${filePath}`);
  console.log(`Total rows: ${lines.length - 1}`);
  console.log(`Header: ${header.join(' | ')}`);
  
  const seasons = new Set();
  const sample = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    if (cols.length >= header.length) {
      seasons.add(cols[cols.length - 1].trim());
      if (i <= 5) sample.push(cols);
    }
  }
  console.log(`Seasons found:`, Array.from(seasons));
  console.log(`Sample row 1:`, sample[0]);
}

analyzeCSV('fantacalcio_2025_26.csv');
console.log('---');
analyzeCSV('fantacalcio_storico_PRONTO.csv');
