const fs = require('fs');

const content = fs.readFileSync('calendario_serie_a_2026_2027.csv', 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

function norm(t) {
  let s = t.trim();
  if (s.toLowerCase() === 'como') return 'Como';
  if (s === 'AC Milan') return 'Milan';
  if (s === 'AS Roma') return 'Roma';
  return s;
}

const matches = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length < 4) continue;
  matches.push({
    matchday: parseInt(parts[1].trim(), 10),
    date: parts[0].trim(),
    home: norm(parts[2]),
    away: norm(parts[3])
  });
}

const fileHeader = `/**
 * Calendario Ufficiale Serie A 2026/2027 (380 partite, 38 giornate)
 * Normalizzato per Asta Fantacalcio 2026/2027
 */

const CALENDARIO_SERIE_A = ${JSON.stringify(matches, null, 2)};

if (typeof window !== 'undefined') {
  window.CALENDARIO_SERIE_A = CALENDARIO_SERIE_A;
}
if (typeof module !== 'undefined') {
  module.exports = CALENDARIO_SERIE_A;
}
`;

fs.writeFileSync('calendario.js', fileHeader, 'utf8');
console.log('calendario.js created with', matches.length, 'matches');
