const fs = require('fs');

// Read defaultData.js
const defaultDataContent = fs.readFileSync('js/defaultData.js', 'utf-8');
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(defaultDataContent, sandbox);
const players = sandbox.window.DEFAULT_PLAYERS || [];

console.log(`Total players in defaultData: ${players.length}`);

// Let's read CSV players
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
        appearances: parts[2].trim(),
        average_rating: parts[3].trim(),
        fantasy_average: parts[4].trim(),
        goals: parts[5].trim(),
        goals_conceded: parts[6].trim(),
        penalties: parts[7].trim(),
        penalties_saved: parts[8].trim(),
        assists: parts[9].trim(),
        yellow_cards: parts[10].trim(),
        red_cards: parts[11].trim(),
        season: parts[12].trim()
      });
    }
  }
  return rows;
}

const csv2526 = parseCSV('fantacalcio_2025_26.csv');
const csvStorico = parseCSV('fantacalcio_storico_PRONTO.csv');

const csvPlayers2526 = new Set(csv2526.map(r => r.player));
const allCsvPlayers = new Set([...csv2526, ...csvStorico].map(r => r.player));

console.log(`Unique player names in 2025-26: ${csvPlayers2526.size}`);
console.log(`Unique player names in all 6 seasons: ${allCsvPlayers.size}`);

// Check sample players from listone
let matchedExact = 0;
let unmatched = [];

players.forEach(p => {
  if (allCsvPlayers.has(p.nome)) {
    matchedExact++;
  } else {
    unmatched.push(p);
  }
});

console.log(`Exact matches with default players: ${matchedExact} / ${players.length}`);
console.log(`Unmatched count: ${unmatched.length}`);
console.log(`First 20 unmatched default players:`, unmatched.slice(0, 20).map(p => `${p.nome} (${p.squadra}, ${p.ruolo})`));
