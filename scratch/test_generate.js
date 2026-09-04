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

function cleanRating(valStr) {
  if (!valStr) return 0;
  let num = parseFloat(valStr.replace(',', '.'));
  if (isNaN(num)) return 0;
  // Fix the decimal shift artifact in storico where 6.0 was exported as 0.6, 7.3 as 0.73, etc.
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
      const ammonizioni = parseInt(parts[10], 10) || 0;
      const espulsioni = parseInt(parts[11], 10) || 0;
      const season = parts[12].trim();

      rows.push({
        player, team, pres, mv, fm, gol, gol_sub, rig, rig_par, ass, ammonizioni, espulsioni, season
      });
    }
  }
  return rows;
}

const rows2526 = parseCSV('fantacalcio_2025_26.csv');
const rowsStorico = parseCSV('fantacalcio_storico_PRONTO.csv');

// Combine rows, season descending: 2025-26, 2024-25, 2023-24, 2022-23, 2021-22, 2020-21
const allRows = [...rows2526, ...rowsStorico];

const seasonsOrder = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

// Group by player name
const playersMap = {};

allRows.forEach(row => {
  if (!playersMap[row.player]) {
    playersMap[row.player] = [];
  }
  playersMap[row.player].push(row);
});

const statsObj = {};

for (const [name, records] of Object.entries(playersMap)) {
  // Sort records by season order
  records.sort((a, b) => seasonsOrder.indexOf(a.season) - seasonsOrder.indexOf(b.season));

  const mostRecent = records[0];

  // Calculate career
  let tot_pres = 0;
  let tot_gol = 0;
  let tot_gol_sub = 0;
  let tot_rig_par = 0;
  let tot_ass = 0;
  let weightedFmSum = 0;
  let anyPenaltiesTaken = false;

  records.forEach(r => {
    tot_pres += r.pres;
    tot_gol += r.gol;
    tot_gol_sub += r.gol_sub;
    tot_rig_par += r.rig_par;
    tot_ass += r.ass;
    if (r.pres > 0 && r.fm > 0) {
      weightedFmSum += (r.fm * r.pres);
    }
    if (r.rig && r.rig !== '0/0') {
      const parts = r.rig.split('/');
      const attempted = parseInt(parts[1], 10) || 0;
      if (attempted > 0) anyPenaltiesTaken = true;
    }
  });

  const avg_fm = tot_pres > 0 && weightedFmSum > 0 ? Math.round((weightedFmSum / tot_pres) * 100) / 100 : mostRecent.fm;

  statsObj[name] = {
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
      has_penalties: anyPenaltiesTaken
    }
  };
}

console.log("Total players processed:", Object.keys(statsObj).length);
console.log("Malen sample:", JSON.stringify(statsObj["Malen"], null, 2));
console.log("Martinez L. sample:", JSON.stringify(statsObj["Martinez L."], null, 2));
console.log("Retegui sample:", JSON.stringify(statsObj["Retegui"], null, 2));
console.log("Svilar sample:", JSON.stringify(statsObj["Svilar"], null, 2));
