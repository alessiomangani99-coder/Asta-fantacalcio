const fs = require('fs');

const defaultDataContent = fs.readFileSync('js/defaultData.js', 'utf-8');
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(defaultDataContent, sandbox);
const players = sandbox.window.DEFAULT_PLAYERS || [];

function parseCSV(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    if (parts.length >= 12) {
      rows.push({
        player: parts[0].trim(),
        team: parts[1].trim(),
        season: parts[12].trim()
      });
    }
  }
  return rows;
}

const allCsv = [...parseCSV('fantacalcio_2025_26.csv'), ...parseCSV('fantacalcio_storico_PRONTO.csv')];
const csvNames = Array.from(new Set(allCsv.map(r => r.player)));

console.log("Searching for Montipo / Montipò:");
console.log(csvNames.filter(n => n.toLowerCase().includes("montip")));

console.log("Searching for Chalobah:");
console.log(csvNames.filter(n => n.toLowerCase().includes("chalob")));

console.log("Searching for Conceicao / Conceição:");
console.log(csvNames.filter(n => n.toLowerCase().includes("concei")));

console.log("Searching for Martinez:");
console.log(csvNames.filter(n => n.toLowerCase().includes("martinez")));

console.log("Searching for Thuram:");
console.log(csvNames.filter(n => n.toLowerCase().includes("thuram")));

console.log("Searching for Hernandez:");
console.log(csvNames.filter(n => n.toLowerCase().includes("hernandez")));

console.log("Searching for Esposito:");
console.log(csvNames.filter(n => n.toLowerCase().includes("esposito")));
