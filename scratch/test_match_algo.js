const fs = require('fs');

const defaultDataContent = fs.readFileSync('js/defaultData.js', 'utf-8');
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(defaultDataContent, sandbox);
const defaultPlayers = sandbox.window.DEFAULT_PLAYERS || [];

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
        season: parts[12].trim()
      });
    }
  }
  return rows;
}

const allCsv = [...parseCSV('fantacalcio_2025_26.csv'), ...parseCSV('fantacalcio_storico_PRONTO.csv')];
const csvPlayers = Array.from(new Set(allCsv.map(r => r.player)));

console.log(`Total default players: ${defaultPlayers.length}`);
console.log(`Total CSV unique players: ${csvPlayers.length}`);

// Team 3-letter map to Italian name
const TEAM_MAP_3_TO_FULL = {
  'ATA': 'Atalanta', 'BOL': 'Bologna', 'CAG': 'Cagliari', 'COM': 'Como',
  'CRE': 'Cremonese', 'EMP': 'Empoli', 'FIO': 'Fiorentina', 'FRO': 'Frosinone',
  'GEN': 'Genoa', 'INT': 'Inter', 'JUV': 'Juventus', 'LAZ': 'Lazio',
  'LEC': 'Lecce', 'MIL': 'Milan', 'MON': 'Monza', 'NAP': 'Napoli',
  'PAR': 'Parma', 'PIS': 'Pisa', 'ROM': 'Roma', 'SAL': 'Salernitana',
  'SAM': 'Sampdoria', 'SAS': 'Sassuolo', 'SPE': 'Spezia', 'TOR': 'Torino',
  'UDI': 'Udinese', 'VEN': 'Venezia', 'VER': 'Verona', 'BEN': 'Benevento', 'CRO': 'Crotone'
};

const TEAM_MAP_FULL_TO_3 = {};
for (const [k, v] of Object.entries(TEAM_MAP_3_TO_FULL)) {
  TEAM_MAP_FULL_TO_3[v.toLowerCase()] = k;
}

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics / accents
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Let's test smart matching
let matched = 0;
const unmatched = [];
const matches = [];

defaultPlayers.forEach(dp => {
  const normName = normalize(dp.nome);
  const dpTeam3 = TEAM_MAP_FULL_TO_3[dp.squadra.toLowerCase()];

  // 1. Exact match in CSV
  let found = csvPlayers.find(cp => cp === dp.nome);
  let method = 'exact';

  // 2. Normalized match (accents, punctuation)
  if (!found) {
    found = csvPlayers.find(cp => normalize(cp) === normName);
    if (found) method = 'normalized';
  }

  // 3. Match without initial/abbreviation:
  // e.g. "Martinez L." vs "Martinez" OR "Chalobah T." vs "Chalobah"
  // or "Esposito F.P." vs "Esposito"
  // or "Conceicao F." vs "Conceicao"
  if (!found) {
    // Check if dp.nome has trailing dot or initial like "Surname X."
    const nameTokens = normName.split(' ');
    const mainSurname = nameTokens[0]; // usually surname
    // If single token or surname + team matches
    const candidates = csvPlayers.filter(cp => {
      const cpNorm = normalize(cp);
      const cpTokens = cpNorm.split(' ');
      return cpTokens[0] === mainSurname || cpTokens.includes(mainSurname);
    });

    if (candidates.length === 1) {
      found = candidates[0];
      method = 'surname-unique';
    } else if (candidates.length > 1) {
      // Filter by team if possible
      const teamCandidates = candidates.filter(cp => {
        const rows = allCsv.filter(r => r.player === cp);
        return rows.some(r => r.team === dpTeam3);
      });
      if (teamCandidates.length === 1) {
        found = teamCandidates[0];
        method = 'surname-team';
      }
    }
  }

  if (found) {
    matched++;
    matches.push({ defaultName: dp.nome, found, method, team: dp.squadra });
  } else {
    unmatched.push(dp);
  }
});

console.log(`Matched: ${matched} / ${defaultPlayers.length}`);
console.log(`Unmatched: ${unmatched.length}`);
console.log("Sample matches with methods:", matches.filter(m => m.method !== 'exact').slice(0, 25));
console.log("Sample unmatched:", unmatched.slice(0, 30).map(p => `${p.nome} (${p.squadra})`));
