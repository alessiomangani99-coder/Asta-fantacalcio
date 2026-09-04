const fs = require('fs');

const defaultDataContent = fs.readFileSync('js/defaultData.js', 'utf-8');
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(defaultDataContent, sandbox);
const defaultPlayers = sandbox.window.DEFAULT_PLAYERS || [];

// Run test_generate logic in memory
function decodeEntities(str) {
  return str
    .replace(/&#xE8;?/gi, 'è')
    .replace(/&#x27;?/gi, "'")
    .replace(/&#xF2;?/gi, 'ò')
    .replace(/&#xEC;?/gi, 'ì')
    .replace(/&#xE0;?/gi, 'à')
    .replace(/&#xE9;?/gi, 'é');
}

function cleanRating(valStr) {
  if (!valStr) return 0;
  let num = parseFloat(valStr.replace(',', '.'));
  if (isNaN(num)) return 0;
  if (num > 0 && num < 2.0) {
    num = Math.round(num * 100) / 10;
  }
  return Math.round(num * 100) / 100;
}

function parseCSV(file) {
  const content = decodeEntities(fs.readFileSync(file, 'utf-8'));
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';').map(s => s.trim().replace(/^"|"$/g, ''));
    if (parts.length >= 12) {
      const player = parts[0].trim();
      const team = parts[1].trim();
      const pres = parseInt(parts[2], 10) || 0;
      const mv = cleanRating(parts[3]);
      const fm = cleanRating(parts[4]);
      const gol = parseInt(parts[5], 10) || 0;
      const gol_sub = parseInt(parts[6], 10) || 0;
      const rig = parts[7].replace(/\s*\/\s*/g, '/');
      const rig_par = parseInt(parts[8], 10) || 0;
      const ass = parseInt(parts[9], 10) || 0;
      const season = parts[12].trim();
      rows.push({ player, team, pres, mv, fm, gol, gol_sub, rig, rig_par, ass, season });
    }
  }
  return rows;
}

const allRows = [...parseCSV('fantacalcio_2025_26.csv'), ...parseCSV('fantacalcio_storico_PRONTO.csv')];
const seasonsOrder = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

const playersMap = {};
allRows.forEach(row => {
  if (!playersMap[row.player]) playersMap[row.player] = [];
  playersMap[row.player].push(row);
});

const STATS_STORICHE = {};
for (const [name, records] of Object.entries(playersMap)) {
  records.sort((a, b) => seasonsOrder.indexOf(a.season) - seasonsOrder.indexOf(b.season));
  const mostRecent = records[0];
  let tot_pres = 0, tot_gol = 0, tot_gol_sub = 0, tot_rig_par = 0, tot_ass = 0, weightedFmSum = 0, anyPenalties = false;
  records.forEach(r => {
    tot_pres += r.pres;
    tot_gol += r.gol;
    tot_gol_sub += r.gol_sub;
    tot_rig_par += r.rig_par;
    tot_ass += r.ass;
    if (r.pres > 0 && r.fm > 0) weightedFmSum += (r.fm * r.pres);
    if (r.rig && r.rig !== '0/0') {
      const parts = r.rig.split('/');
      if (parseInt(parts[1], 10) > 0) anyPenalties = true;
    }
  });
  const avg_fm = tot_pres > 0 && weightedFmSum > 0 ? Math.round((weightedFmSum / tot_pres) * 100) / 100 : mostRecent.fm;

  // Track teams and role
  const teams = Array.from(new Set(records.map(r => r.team)));
  const isGoalkeeper = records.some(r => r.gol_sub > 0 || r.rig_par > 0);

  STATS_STORICHE[name] = {
    last: {
      season: mostRecent.season,
      team: mostRecent.team,
      pres: mostRecent.pres,
      mv: mostRecent.mv,
      fm: mostRecent.fm,
      gol: mostRecent.gol,
      gol_sub: mostRecent.gol_sub,
      rig: mostRecent.rig,
      rig_par: mostRecent.rig_par,
      ass: mostRecent.ass
    },
    carriera: {
      tot_pres,
      tot_gol,
      tot_gol_sub,
      tot_rig_par,
      tot_ass,
      avg_fm,
      has_penalties: anyPenalties
    },
    meta: {
      teams,
      isGoalkeeper
    }
  };
}

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

// Pre-index clean names
const cleanIndex = {};
for (const [name, data] of Object.entries(STATS_STORICHE)) {
  const c = cleanStr(name);
  if (!cleanIndex[c]) cleanIndex[c] = [];
  cleanIndex[c].push({ name, data });
}

function getHistoricalStats(playerOrName, squadName, role) {
  let name = typeof playerOrName === 'object' ? playerOrName.nome : playerOrName;
  let team = typeof playerOrName === 'object' ? playerOrName.squadra : squadName;
  let rRole = typeof playerOrName === 'object' ? playerOrName.ruolo : role;
  if (!name) return null;

  // 1. Direct exact match
  if (STATS_STORICHE[name]) return STATS_STORICHE[name];

  // 2. Clean match
  const cName = cleanStr(name);
  if (cleanIndex[cName]) {
    const list = cleanIndex[cName];
    if (list.length === 1) return list[0].data;
    // If multiple, match team
    const team3 = team ? TEAM_MAP_FULL_TO_3[team.toLowerCase()] : null;
    if (team3) {
      const matchTeam = list.find(item => item.data.meta.teams.includes(team3));
      if (matchTeam) return matchTeam.data;
    }
    return list[0].data;
  }

  // 3. Surname + team matching
  const words = (name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/);
  const surname = words[0];
  const team3 = team ? TEAM_MAP_FULL_TO_3[team.toLowerCase()] : null;
  const isP = rRole === 'P';

  if (surname && surname.length >= 3) {
    const candidates = [];
    for (const [sName, sData] of Object.entries(STATS_STORICHE)) {
      const sWords = sName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/);
      if (sWords[0] === surname) {
        // Role check
        if (isP === sData.meta.isGoalkeeper || sData.carriera.tot_pres === 0) {
          candidates.push({ name: sName, data: sData, words: sWords });
        }
      }
    }

    if (candidates.length === 1) {
      return candidates[0].data;
    }

    if (candidates.length > 1) {
      // Check initial if available
      if (words.length > 1 && words[1].length === 1) {
        const initial = words[1];
        const matchInitial = candidates.filter(c => c.words.some((w, idx) => idx > 0 && w.startsWith(initial)));
        if (matchInitial.length === 1) return matchInitial[0].data;
      }
      // Check team
      if (team3) {
        const matchTeam = candidates.filter(c => c.data.meta.teams.includes(team3));
        if (matchTeam.length === 1) return matchTeam[0].data;
      }
    }
  }

  return null;
}

let foundCount = 0;
let rookieCount = 0;
const rookieList = [];

defaultPlayers.forEach(p => {
  const stats = getHistoricalStats(p);
  if (stats) {
    foundCount++;
  } else {
    rookieCount++;
    rookieList.push(p);
  }
});

console.log(`Matched with historical stats: ${foundCount} / ${defaultPlayers.length}`);
console.log(`Rookies / Esordienti: ${rookieCount}`);
console.log("Sample Rookies:", rookieList.slice(0, 15).map(p => `${p.nome} (${p.squadra})`));
