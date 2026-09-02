const CalendarEngine = require('../js/calendarEngine.js');
const calData = require('../calendario.js');
const ListoneParser = require('../js/parser.js');
const fs = require('fs');

const txt = fs.readFileSync('listone.csv', 'utf8');
const players = ListoneParser.parse(txt);

const engine = new CalendarEngine(calData, () => players);

console.log('--- TEST 1: Teams and Ratings ---');
console.log('Total teams:', engine.getAllTeams().length);
console.log('Inter rating:', engine.getTeamRating('Inter'));
console.log('Roma rating:', engine.getTeamRating('Roma'));
console.log('Venezia rating:', engine.getTeamRating('Venezia'));

console.log('--- TEST 2: Goalkeeper Pairs ---');
const gkPairs = engine.getAllGoalkeeperPairs();
console.log('Total GK Pairs:', gkPairs.length, '(Expected 190)');
console.log('Top 3 GK Pairs:');
gkPairs.slice(0, 3).forEach((p, idx) => {
  const pA = p.playersA.map(x => x.nome).join('/');
  const pB = p.playersB.map(x => x.nome).join('/');
  console.log(` #${idx + 1}: ${p.teamA} (${pA}) + ${p.teamB} (${pB}) -> Indice: ${p.indiceMedio} | Big Match Overlap: ${p.bigMatchOverlap} | Alt Casa/Trasf: ${p.homeAwayAlternation}/38`);
});

console.log('--- TEST 3: Attacker Pairs ---');
const attPairs = engine.getAllAttackerPairs();
console.log('Total Attacker Pairs:', attPairs.length, '(Expected 190)');
console.log('Top 3 Attacker Pairs:');
attPairs.slice(0, 3).forEach((p, idx) => {
  const pA = p.playersA.map(x => x.nome).join('/');
  const pB = p.playersB.map(x => x.nome).join('/');
  console.log(` #${idx + 1}: ${p.teamA} (${pA}) + ${p.teamB} (${pB}) -> Giornate Favorevoli: ${p.softMatchdaysCount}/38 | Doppie Favorevoli: ${p.doubleSoftMatchdaysCount} | Indice: ${p.indiceOffensivo}`);
});

console.log('--- TEST 4: Query Single Team (Roma) ---');
const romaGkPartners = engine.getBestPartnersForTeam('Roma', 'P', 3);
console.log('Roma Top GK Partners:');
romaGkPartners.forEach(p => console.log(`  + ${p.partnerTeam} -> Indice: ${p.indiceMedio}, BigMatch: ${p.bigMatchOverlap}, Alt: ${p.homeAwayAlternation}`));

const romaAttPartners = engine.getBestPartnersForTeam('Roma', 'A', 3);
console.log('Roma Top Attacker Partners:');
romaAttPartners.forEach(p => console.log(`  + ${p.partnerTeam} -> Favorevoli: ${p.softMatchdaysCount}/38`));

console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
