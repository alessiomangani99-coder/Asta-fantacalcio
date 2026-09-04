const fs = require('fs');

function checkSuspicious(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  console.log(`Checking ${file}...`);
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    const mv = parseFloat(parts[3].replace(',', '.'));
    const fm = parseFloat(parts[4].replace(',', '.'));
    const pres = parseInt(parts[2], 10);
    if (pres > 0 && ((mv > 0 && mv < 3) || (fm > 0 && fm < 3))) {
      count++;
      if (count <= 15) {
        console.log(`Line ${i+1}: ${parts[0]} (${parts[1]}, ${parts[12]}): pres=${pres}, mv=${mv}, fm=${fm}`);
      }
    }
  }
  console.log(`Total suspicious rows with mv or fm between 0 and 3: ${count}`);
}

checkSuspicious('fantacalcio_2025_26.csv');
checkSuspicious('fantacalcio_storico_PRONTO.csv');
