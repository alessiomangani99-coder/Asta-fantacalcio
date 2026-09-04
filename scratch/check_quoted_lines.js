const fs = require('fs');

const content = fs.readFileSync('fantacalcio_2025_26.csv', 'utf-8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
for (let i = 1; i < lines.length; i++) {
  if (lines[i].includes('&#') || lines[i].includes('"')) {
    console.log(`Line ${i}: ${lines[i]}`);
  }
}
