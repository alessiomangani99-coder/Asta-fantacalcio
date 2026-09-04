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
      const pres = parseInt(parts[2], 10) || 0;
      const mv = parseFloat(parts[3].replace(',', '.')) || 0;
      const fm = parseFloat(parts[4].replace(',', '.')) || 0;
      const gol = parseInt(parts[5], 10) || 0;
      const gol_sub = parseInt(parts[6], 10) || 0;
      const rig = parts[7].replace(/\s*\/\s*/g, '/');
      const rig_par = parseInt(parts[8], 10) || 0;
      const ass = parseInt(parts[9], 10) || 0;
      const season = parts[12].trim();
      const team = parts[1].trim();
      const player = parts[0].trim();
      rows.push({ player, team, pres, mv, fm, gol, gol_sub, rig, rig_par, ass, season });
    }
  }
  return rows;
}

const allRows = [...parseCSV('fantacalcio_2025_26.csv'), ...parseCSV('fantacalcio_storico_PRONTO.csv')];

function showPlayerStats(name) {
  const pRows = allRows.filter(r => r.player.toLowerCase() === name.toLowerCase());
  console.log(`=== ${name} (${pRows.length} seasons) ===`);
  pRows.forEach(r => console.log(`  ${r.season} (${r.team}): pres=${r.pres}, mv=${r.mv}, fm=${r.fm}, gol=${r.gol}, gol_sub=${r.gol_sub}, rig=${r.rig}, rig_par=${r.rig_par}, ass=${r.ass}`));
  const tot_pres = pRows.reduce((acc, r) => acc + r.pres, 0);
  const tot_gol = pRows.reduce((acc, r) => acc + r.gol, 0);
  const weighted_fm = tot_pres > 0 ? (pRows.reduce((acc, r) => acc + (r.fm * r.pres), 0) / tot_pres) : 0;
  const seasonsWithPres = pRows.filter(r => r.pres > 0);
  const simple_fm = seasonsWithPres.length > 0 ? (seasonsWithPres.reduce((acc, r) => acc + r.fm, 0) / seasonsWithPres.length) : 0;
  console.log(`  Tot Pres: ${tot_pres}, Tot Gol: ${tot_gol}`);
  console.log(`  Weighted Avg FM: ${weighted_fm.toFixed(2)}, Simple Avg FM: ${simple_fm.toFixed(2)}`);
}

showPlayerStats('Martinez L.');
showPlayerStats('Vlahovic');
showPlayerStats('Svilar');
showPlayerStats('Maignan');
showPlayerStats('Retegui');
