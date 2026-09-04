const fs = require('fs');

function checkDuplicates(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const seen = new Map();
  const duplicates = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    const player = parts[0].trim();
    const season = parts[12].trim();
    const key = `${player}_${season}`;
    if (seen.has(key)) {
      duplicates.push({ player, season, row1: seen.get(key), row2: lines[i] });
    } else {
      seen.set(key, lines[i]);
    }
  }
  console.log(`Duplicates in ${file}: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log("Sample duplicates:", duplicates.slice(0, 5));
  }
}

checkDuplicates('fantacalcio_2025_26.csv');
checkDuplicates('fantacalcio_storico_PRONTO.csv');
