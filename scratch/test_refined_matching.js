const fs = require('fs');

function decodeEntities(str) {
  return str
    .replace(/&#xE8;?/gi, 'è')
    .replace(/&#x27;?/gi, "'")
    .replace(/&#xF2;?/gi, 'ò')
    .replace(/&#xEC;?/gi, 'ì')
    .replace(/&#xE0;?/gi, 'à')
    .replace(/&#xE9;?/gi, 'é');
}

function parseCSV(file) {
  const content = decodeEntities(fs.readFileSync(file, 'utf-8'));
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';').map(s => s.trim().replace(/^"|"$/g, ''));
    if (parts.length >= 12) {
      rows.push({
        player: parts[0].trim(),
        team: parts[1].trim(),
        season: parts[12].trim(),
        goals_conceded: parseInt(parts[6], 10) || 0,
        penalties_saved: parseInt(parts[8], 10) || 0
      });
    }
  }
  return rows;
}

const defaultDataContent = fs.readFileSync('js/defaultData.js', 'utf-8');
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(defaultDataContent, sandbox);
const defaultPlayers = sandbox.window.DEFAULT_PLAYERS || [];

const allCsv = [...parseCSV('fantacalcio_2025_26.csv'), ...parseCSV('fantacalcio_storico_PRONTO.csv')];

// Map 3-letter team codes
const TEAM_MAP_FULL_TO_3 = {
  'atalanta': 'ATA', 'bologna': 'BOL', 'cagliari': 'CAG', 'como': 'COM',
  'cremonese': 'CRE', 'empoli': 'EMP', 'fiorentina': 'FIO', 'frosinone': 'FRO',
  'genoa': 'GEN', 'inter': 'INT', 'juventus': 'JUV', 'lazio': 'LAZ',
  'lecce': 'LEC', 'milan': 'MIL', 'monza': 'MON', 'napoli': 'NAP',
  'parma': 'PAR', 'pisa': 'PIS', 'roma': 'ROM', 'salernitana': 'SAL',
  'sampdoria': 'SAM', 'sassuolo': 'SAS', 'spezia': 'SPE', 'torino': 'TOR',
  'udinese': 'UDI', 'venezia': 'VEN', 'verona': 'VER'
};

function cleanStr(s) {
  return (s || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '');
}

// Build stats dictionary indexed by CSV player name
const csvPlayersMap = {};
allCsv.forEach(r => {
  if (!csvPlayersMap[r.player]) {
    csvPlayersMap[r.player] = {
      name: r.player,
      cleanName: cleanStr(r.player),
      teams: new Set(),
      isGoalkeeper: false
    };
  }
  csvPlayersMap[r.player].teams.add(r.team);
  if (r.goals_conceded > 0 || r.penalties_saved > 0) {
    csvPlayersMap[r.player].isGoalkeeper = true;
  }
});

const csvPlayerList = Object.values(csvPlayersMap);

// Smart matching function
function findMatch(player) {
  const pName = player.nome;
  const pClean = cleanStr(pName);
  const pTeam3 = TEAM_MAP_FULL_TO_3[player.squadra.toLowerCase()];
  const isP = player.ruolo === 'P';

  // 1. Exact match
  if (csvPlayersMap[pName]) return { match: pName, type: 'exact' };

  // 2. Clean match (no punct, lowercase, accents removed)
  const exactClean = csvPlayerList.filter(c => c.cleanName === pClean);
  if (exactClean.length === 1) return { match: exactClean[0].name, type: 'clean' };
  if (exactClean.length > 1 && pTeam3) {
    const teamMatch = exactClean.find(c => c.teams.has(pTeam3));
    if (teamMatch) return { match: teamMatch.name, type: 'clean+team' };
  }

  // 3. Surname + team matching
  // Let's extract surname:
  // Usually in Italian lists, e.g. "Martinez L." -> surname is "Martinez", initial is "L"
  // "Lautaro Martinez" -> could be "Lautaro" or "Martinez"
  // Let's get tokens
  const normWords = (pName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/);
  
  // Try matching where CSV name contains or starts with same surname
  const surname = normWords[0];
  if (surname.length >= 3) {
    const surnameCandidates = csvPlayerList.filter(c => {
      const cWords = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/);
      // match surname
      return cWords[0] === surname;
    });

    if (surnameCandidates.length > 0) {
      // Filter by role compatibility (GK vs non-GK)
      const roleFiltered = surnameCandidates.filter(c => isP ? c.isGoalkeeper : !c.isGoalkeeper);
      const candidates = roleFiltered.length > 0 ? roleFiltered : surnameCandidates;

      // If initial is provided in pName (e.g. "Martinez L.", initial is 'l')
      let initial = null;
      if (normWords.length > 1 && normWords[1].length === 1) {
        initial = normWords[1];
      }
      
      if (initial) {
        const initialMatches = candidates.filter(c => {
          const cWords = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/);
          return cWords.some((w, idx) => idx > 0 && w.startsWith(initial));
        });
        if (initialMatches.length === 1) return { match: initialMatches[0].name, type: 'surname+initial' };
      }

      // Check with team
      if (pTeam3) {
        const teamCandidates = candidates.filter(c => c.teams.has(pTeam3));
        if (teamCandidates.length === 1) return { match: teamCandidates[0].name, type: 'surname+team' };
      }

      // If only 1 candidate in total
      if (candidates.length === 1) {
        return { match: candidates[0].name, type: 'surname-unique' };
      }
    }
  }

  return null;
}

let matchedCount = 0;
let unmatchedList = [];
defaultPlayers.forEach(p => {
  const m = findMatch(p);
  if (m) {
    matchedCount++;
  } else {
    unmatchedList.push(p);
  }
});

console.log(`Matched: ${matchedCount} / ${defaultPlayers.length}`);
console.log(`Unmatched: ${unmatchedList.length}`);
console.log("Unmatched sample (first 25):", unmatchedList.slice(0, 25).map(p => `${p.nome} (${p.squadra}, ${p.ruolo})`));
