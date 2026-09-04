const fs = require('fs');

const content = fs.readFileSync('fantacalcio_storico_PRONTO.csv', 'utf-8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(';');
  const mv = parseFloat(parts[3].replace(',', '.'));
  const fm = parseFloat(parts[4].replace(',', '.'));
  const pres = parseInt(parts[2], 10);
  if (pres > 0) {
    if ((mv > 0 && mv < 3.0) || (fm > 0 && fm < 3.0)) {
      if (mv * 10 > 10.5 || fm * 10 > 13.0) {
        console.log(`Outlier: line ${i+1}: ${lines[i]}`);
      }
    }
  }
}
console.log("Check complete.");
