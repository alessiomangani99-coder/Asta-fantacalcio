const CalendarEngine = require('../js/calendarEngine.js');
const calData = require('../calendario.js');
const ListoneParser = require('../js/parser.js');
const fs = require('fs');

const txt = fs.readFileSync('listone.csv', 'utf8');
const players = ListoneParser.parse(txt);

const engine = new CalendarEngine(calData, () => players);

// Prototype the 3 focus methods
CalendarEngine.prototype.getFocusTeamGoalkeepers = function(pivotTeam) {
  const otherTeams = this.getAllTeams().filter(t => t !== pivotTeam);
  const results = [];
  otherTeams.forEach(tB => {
    const pair = this.analyzeGoalkeeperPair(pivotTeam, tB);
    results.push({
      pivotTeam,
      partnerTeam: tB,
      indiceMedio: pair.indiceMedio,
      bigMatchOverlap: pair.bigMatchOverlap,
      homeAwayAlternation: pair.homeAwayAlternation,
      playersPivot: pair.playersA,
      playersPartner: pair.playersB
    });
  });
  return results.sort((a, b) => {
    if (a.indiceMedio !== b.indiceMedio) return a.indiceMedio - b.indiceMedio;
    if (a.bigMatchOverlap !== b.bigMatchOverlap) return a.bigMatchOverlap - b.bigMatchOverlap;
    return b.homeAwayAlternation - a.homeAwayAlternation;
  });
};

CalendarEngine.prototype.getFocusTeamAttackersPairs = function(pivotTeam) {
  const otherTeams = this.getAllTeams().filter(t => t !== pivotTeam);
  const results = [];
  otherTeams.forEach(tB => {
    const pair = this.analyzeAttackerPair(pivotTeam, tB);
    results.push({
      pivotTeam,
      partnerTeam: tB,
      softMatchdaysCount: pair.softMatchdaysCount,
      doubleSoftMatchdaysCount: pair.doubleSoftMatchdaysCount,
      indiceOffensivo: pair.indiceOffensivo,
      playersPivot: pair.playersA,
      playersPartner: pair.playersB
    });
  });
  return results.sort((a, b) => {
    if (b.softMatchdaysCount !== a.softMatchdaysCount) return b.softMatchdaysCount - a.softMatchdaysCount;
    if (b.doubleSoftMatchdaysCount !== a.doubleSoftMatchdaysCount) return b.doubleSoftMatchdaysCount - a.doubleSoftMatchdaysCount;
    return a.indiceOffensivo - b.indiceOffensivo;
  });
};

CalendarEngine.prototype.getFocusTeamAttackersTriplets = function(pivotTeam) {
  const allTeams = this.getAllTeams();
  const otherTeams = allTeams.filter(t => t !== pivotTeam);

  // Pre-calculate 38 fixture data for pivot team and all other teams
  const teamFixtureCache = {};
  allTeams.forEach(t => {
    teamFixtureCache[t] = [];
    for (let g = 1; g <= 38; g++) {
      const match = this.getMatchDifficulty(t, g);
      teamFixtureCache[t][g] = {
        diff: match.difficulty,
        isSoft: match.oppRating <= 5 || (match.isHome && match.oppRating <= 6)
      };
    }
  });

  const teamAttackersCache = {};
  allTeams.forEach(t => {
    teamAttackersCache[t] = this.getTeamKeyPlayers(t, 'A').slice(0, 2);
  });

  const preA = teamFixtureCache[pivotTeam];
  const triplets = [];

  for (let i = 0; i < otherTeams.length; i++) {
    const tB = otherTeams[i];
    const preB = teamFixtureCache[tB];

    for (let j = i + 1; j < otherTeams.length; j++) {
      const tC = otherTeams[j];
      const preC = teamFixtureCache[tC];

      let totalMinDiff = 0;
      let softCount = 0;

      for (let g = 1; g <= 38; g++) {
        const minD = Math.min(preA[g].diff, preB[g].diff, preC[g].diff);
        totalMinDiff += minD;

        if (preA[g].isSoft || preB[g].isSoft || preC[g].isSoft) {
          softCount++;
        }
      }

      triplets.push({
        pivotTeam,
        teamB: tB,
        teamC: tC,
        softMatchdaysCount: softCount,
        coperturaPct: Math.round((softCount / 38) * 100),
        indiceTris: parseFloat((totalMinDiff / 38).toFixed(2)),
        playersB: teamAttackersCache[tB],
        playersC: teamAttackersCache[tC]
      });
    }
  }

  return triplets.sort((a, b) => {
    if (b.softMatchdaysCount !== a.softMatchdaysCount) return b.softMatchdaysCount - a.softMatchdaysCount;
    return a.indiceTris - b.indiceTris;
  });
};

console.time('Focus calculations for Juventus');
const jvGk = engine.getFocusTeamGoalkeepers('Juventus');
const jvAttPairs = engine.getFocusTeamAttackersPairs('Juventus');
const jvAttTriplets = engine.getFocusTeamAttackersTriplets('Juventus');
console.timeEnd('Focus calculations for Juventus');

console.log('GK Pairs count:', jvGk.length, 'Top 1:', jvGk[0].partnerTeam, 'Indice:', jvGk[0].indiceMedio);
console.log('Attacker Pairs count:', jvAttPairs.length, 'Top 1:', jvAttPairs[0].partnerTeam, 'Fav:', jvAttPairs[0].softMatchdaysCount);
console.log('Attacker Triplets count:', jvAttTriplets.length, 'Top 1:', jvAttTriplets[0].teamB + ' + ' + jvAttTriplets[0].teamC, 'Fav:', jvAttTriplets[0].softMatchdaysCount + '/38 (' + jvAttTriplets[0].coperturaPct + '%)', 'Indice:', jvAttTriplets[0].indiceTris);
