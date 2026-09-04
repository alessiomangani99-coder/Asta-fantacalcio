const fs = require('fs');

const defaultDataContent = fs.readFileSync('js/defaultData.js', 'utf-8');
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(defaultDataContent, sandbox);
const players = sandbox.window.DEFAULT_PLAYERS || [];

const listoneTeams = Array.from(new Set(players.map(p => p.squadra))).sort();
console.log("Listone teams:", listoneTeams);

function decodeEntities(str) {
  return str
    .replace(/&#xE8;?/gi, 'è')
    .replace(/&#x27;?/gi, "'")
    .replace(/&#xF2;?/gi, 'ò')
    .replace(/&#xEC;?/gi, 'ì')
    .replace(/&#xE0;?/gi, 'à')
    .replace(/&#xE9;?/gi, 'é');
}

function getCsvTeams(file) {
  const content = decodeEntities(fs.readFileSync(file, 'utf-8'));
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const teams = new Set();
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';').map(s => s.trim().replace(/^"|"$/g, ''));
    if (parts[1]) teams.add(parts[1]);
  }
  return Array.from(teams).sort();
}

console.log("CSV 25-26 teams:", getCsvTeams('fantacalcio_2025_26.csv'));
console.log("CSV Storico teams:", getCsvTeams('fantacalcio_storico_PRONTO.csv'));
