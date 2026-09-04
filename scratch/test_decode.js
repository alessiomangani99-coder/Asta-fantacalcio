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

let content = fs.readFileSync('fantacalcio_2025_26.csv', 'utf-8');
content = decodeEntities(content);
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

lines.slice(0, 50).forEach((l, idx) => {
  const parts = l.split(';').map(s => s.trim().replace(/^"|"$/g, ''));
  if (l.includes('Soul') || l.includes('Laurient')) {
    console.log(`Parsed line ${idx}:`, parts[0], parts[1], parts[2], parts[3], parts[4]);
  }
});
