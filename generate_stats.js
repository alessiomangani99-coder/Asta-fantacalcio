/**
 * Script di generazione automatico per stats_giocatori.js
 * Elabora:
 *  - fantacalcio_2025_26.csv (stagione 2025-26)
 *  - fantacalcio_storico_PRONTO.csv (stagioni dal 2020-21 al 2024-25)
 *
 * Produce:
 *  - stats_giocatori.js con oggetto STATS_STORICHE e matcher intelligente
 */

const fs = require('fs');
const path = require('path');

// Decodifica entità HTML presenti nei CSV
function decodeEntities(str) {
  return (str || '')
    .replace(/&#xE8;?/gi, 'è')
    .replace(/&#x27;?/gi, "'")
    .replace(/&#xF2;?/gi, 'ò')
    .replace(/&#xEC;?/gi, 'ì')
    .replace(/&#xE0;?/gi, 'à')
    .replace(/&#xE9;?/gi, 'é');
}

// Normalizza e pulisce rating numerici con gestione virgola, punto e artefatti di esportazione
function cleanRating(valStr) {
  if (!valStr) return 0;
  let num = parseFloat(String(valStr).replace(',', '.'));
  if (isNaN(num)) return 0;
  // Corregge artefatto esportazione Excel in cui valutazioni a singola cifra decimale
  // sono state esportate divise per 10 (es. 0.73 -> 7.3, 0.6 -> 6.0, 0.65 -> 6.5)
  if (num > 0 && num < 2.0) {
    num = Math.round(num * 100) / 10;
  }
  return Math.round(num * 100) / 100;
}

// Parser CSV per file delimitati da punto e virgola
function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const decoded = decodeEntities(raw);
  const lines = decoded.split(/\r?\n/).filter(l => l.trim().length > 0);
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
      const rig = (parts[7] || '0/0').replace(/\s*\/\s*/g, '/').trim();
      const rig_par = parseInt(parts[8], 10) || 0;
      const ass = parseInt(parts[9], 10) || 0;
      const season = parts[12].trim();

      rows.push({
        player,
        team,
        pres,
        mv,
        fm,
        gol,
        gol_sub,
        rig,
        rig_par,
        ass,
        season
      });
    }
  }
  return rows;
}

console.log('Lettura file CSV...');
const rows2526 = parseCSV(path.join(__dirname, 'fantacalcio_2025_26.csv'));
const rowsStorico = parseCSV(path.join(__dirname, 'fantacalcio_storico_PRONTO.csv'));

console.log(`Caricati ${rows2526.length} record da fantacalcio_2025_26.csv`);
console.log(`Caricati ${rowsStorico.length} record da fantacalcio_storico_PRONTO.csv`);

const allRows = [...rows2526, ...rowsStorico];

// Ordine cronologico delle 6 stagioni (dalla più recente alla meno recente)
const seasonsOrder = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

// Raggruppa per nome calciatore
const playersMap = {};
allRows.forEach(row => {
  if (!playersMap[row.player]) {
    playersMap[row.player] = [];
  }
  playersMap[row.player].push(row);
});

const STATS_STORICHE = {};

for (const [name, records] of Object.entries(playersMap)) {
  // Ordina le stagioni del giocatore dalla più recente alla meno recente
  records.sort((a, b) => seasonsOrder.indexOf(a.season) - seasonsOrder.indexOf(b.season));

  const mostRecent = records[0];

  let tot_pres = 0;
  let tot_gol = 0;
  let tot_gol_sub = 0;
  let tot_rig_par = 0;
  let tot_ass = 0;
  let weightedFmSum = 0;
  let hasPenalties = false;

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
      if (attempted > 0) {
        hasPenalties = true;
      }
    }
  });

  const avg_fm = tot_pres > 0 && weightedFmSum > 0
    ? Math.round((weightedFmSum / tot_pres) * 100) / 100
    : mostRecent.fm;

  const teams = Array.from(new Set(records.map(r => r.team)));
  const isGoalkeeper = records.some(r => r.gol_sub > 0 || r.rig_par > 0);

  STATS_STORICHE[name] = {
    last: {
      season: mostRecent.season,
      pres: mostRecent.pres,
      mv: mostRecent.mv,
      fm: mostRecent.fm,
      gol: mostRecent.gol,
      gol_sub: mostRecent.gol_sub,
      rig: mostRecent.rig,
      rig_par: mostRecent.rig_par,
      ass: mostRecent.ass,
      team: mostRecent.team
    },
    carriera: {
      tot_pres,
      tot_gol,
      tot_gol_sub,
      tot_rig_par,
      tot_ass,
      avg_fm,
      has_penalties: hasPenalties
    },
    meta: {
      teams,
      isGoalkeeper
    }
  };
}

console.log(`Calcolate statistiche storiche per ${Object.keys(STATS_STORICHE).length} calciatori unici.`);

// Generazione del file JavaScript stats_giocatori.js
const fileContent = `/**
 * STATISTICHE STORICHE SERIE A (Ultime 6 stagioni: 2020-21 -> 2025-26)
 * Generato automaticamente da generate_stats.js
 */

const STATS_STORICHE = ${JSON.stringify(STATS_STORICHE, null, 2)};
window.STATS_STORICHE = STATS_STORICHE;

(function() {
  const TEAM_MAP_FULL_TO_3 = {
    'atalanta': 'ATA', 'bologna': 'BOL', 'cagliari': 'CAG', 'como': 'COM',
    'cremonese': 'CRE', 'empoli': 'EMP', 'fiorentina': 'FIO', 'frosinone': 'FRO',
    'genoa': 'GEN', 'inter': 'INT', 'juventus': 'JUV', 'lazio': 'LAZ',
    'lecce': 'LEC', 'milan': 'MIL', 'monza': 'MON', 'napoli': 'NAP',
    'parma': 'PAR', 'pisa': 'PIS', 'roma': 'ROM', 'salernitana': 'SAL',
    'sampdoria': 'SAM', 'sassuolo': 'SAS', 'spezia': 'SPE', 'torino': 'TOR',
    'udinese': 'UDI', 'venezia': 'VEN', 'verona': 'VER'
  };

  function normalizeText(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  // Pre-indicizzazione per ricerca normalizzata veloce
  const cleanIndex = {};
  for (const [name, data] of Object.entries(STATS_STORICHE)) {
    const clean = normalizeText(name);
    if (!cleanIndex[clean]) cleanIndex[clean] = [];
    cleanIndex[clean].push({ name, data });
  }

  /**
   * Ricerca flessibile delle statistiche storiche di un calciatore
   * @param {Object|string} player - Oggetto giocatore { nome, squadra, ruolo } o stringa del nome
   * @param {string} [teamName] - Nome della squadra (se player è stringa)
   * @param {string} [role] - Ruolo 'P', 'D', 'C', 'A' (se player è stringa)
   * @returns {Object|null} Oggetto con last e carriera, oppure null se esordiente
   */
  window.getHistoricalStats = function(player, teamName, role) {
    let name = '';
    let team = teamName || '';
    let rRole = role || '';

    if (player && typeof player === 'object') {
      name = player.nome || '';
      team = player.squadra || team;
      rRole = player.ruolo || rRole;
    } else if (typeof player === 'string') {
      name = player;
    }

    if (!name) return null;

    // 1. Corrispondenza esatta diretta
    if (STATS_STORICHE[name]) {
      return STATS_STORICHE[name];
    }

    // 2. Corrispondenza normalizzata (senza punteggiatura, spazi, accenti, minuscolo)
    const cleanName = normalizeText(name);
    if (cleanIndex[cleanName]) {
      const candidates = cleanIndex[cleanName];
      if (candidates.length === 1) {
        return candidates[0].data;
      }
      const team3 = team ? TEAM_MAP_FULL_TO_3[team.toLowerCase()] : null;
      if (team3) {
        const teamMatch = candidates.find(c => c.data.meta && c.data.meta.teams.includes(team3));
        if (teamMatch) return teamMatch.data;
      }
      return candidates[0].data;
    }

    // 3. Corrispondenza per Cognome + Squadra Reale / Ruolo / Iniziale
    const words = (name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .trim()
      .split(/\\s+/);

    const surname = words[0];
    const team3 = team ? TEAM_MAP_FULL_TO_3[team.toLowerCase()] : null;
    const isGK = rRole === 'P';

    if (surname && surname.length >= 3) {
      const candidates = [];
      for (const [sName, sData] of Object.entries(STATS_STORICHE)) {
        const sWords = sName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\\u0300-\\u036f]/g, '')
          .replace(/[^a-z0-9 ]/g, ' ')
          .trim()
          .split(/\\s+/);

        if (sWords[0] === surname) {
          // Filtro compatibilità ruolo (portiere vs movimento)
          if (sData.meta && (isGK === sData.meta.isGoalkeeper || sData.carriera.tot_pres === 0)) {
            candidates.push({ name: sName, data: sData, words: sWords });
          }
        }
      }

      if (candidates.length === 1) {
        return candidates[0].data;
      }

      if (candidates.length > 1) {
        // Se nel nome c'è un'iniziale (es. "Martinez L."), verifica coincidenza
        if (words.length > 1 && words[1].length === 1) {
          const initial = words[1];
          const initialMatch = candidates.filter(c => c.words.some((w, idx) => idx > 0 && w.startsWith(initial)));
          if (initialMatch.length === 1) return initialMatch[0].data;
        }

        // Verifica coincidenza con la squadra reale
        if (team3) {
          const teamMatch = candidates.filter(c => c.data.meta && c.data.meta.teams.includes(team3));
          if (teamMatch.length === 1) return teamMatch[0].data;
        }
      }
    }

    return null;
  };
})();
`;

const outputPath = path.join(__dirname, 'stats_giocatori.js');
fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`File generato con successo: ${outputPath}`);
console.log(`Dimensione file: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
