/**
 * Calendar Analysis & Alternation Engine per Serie A 2026/2027
 * Calcolo difficoltà ponderata, alternanza portieri e complementarietà attaccanti.
 */

class CalendarEngine {
  constructor(calendarData, playersProvider) {
    this.calendar = calendarData || (typeof window !== 'undefined' ? window.CALENDARIO_SERIE_A : []);
    this.getPlayers = playersProvider || (() => (typeof window !== 'undefined' && window.app ? window.app.state.getAllPlayers() : []));

    // Rating di default della forza delle 20 squadre (1 = debole, 10 = fortissima)
    this.defaultRatings = {
      'Inter': 9,
      'Juventus': 8,
      'Milan': 8,
      'Napoli': 8,
      'Atalanta': 8,
      'Roma': 7,
      'Lazio': 7,
      'Fiorentina': 7,
      'Bologna': 7,
      'Torino': 6,
      'Como': 6,
      'Udinese': 5,
      'Genoa': 5,
      'Parma': 5,
      'Cagliari': 5,
      'Sassuolo': 5,
      'Lecce': 5,
      'Monza': 5,
      'Venezia': 4,
      'Frosinone': 4
    };

    this.ratings = { ...this.defaultRatings };
    this.loadRatings();

    // Cache degli incontri indicizzati per squadra e giornata
    this._indexedSchedule = null;
    this._reindexSchedule();
  }

  loadRatings() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('ASTA_FC_TEAM_RATINGS');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.ratings = { ...this.defaultRatings, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Errore lettura rating squadre da localStorage:', e);
    }
  }

  saveRatings() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ASTA_FC_TEAM_RATINGS', JSON.stringify(this.ratings));
      }
    } catch (e) {
      console.warn('Errore salvataggio rating squadre:', e);
    }
  }

  resetRatings() {
    this.ratings = { ...this.defaultRatings };
    this.saveRatings();
  }

  getTeamRating(team) {
    return this.ratings[team] !== undefined ? this.ratings[team] : 5;
  }

  setTeamRating(team, val) {
    const num = Math.min(10, Math.max(1, parseInt(val, 10) || 5));
    this.ratings[team] = num;
    this.saveRatings();
  }

  getAllTeams() {
    return Object.keys(this.defaultRatings).sort();
  }

  _reindexSchedule() {
    // schedule[team][matchday] = { opponent, isHome, date }
    this._indexedSchedule = {};
    const teams = this.getAllTeams();
    teams.forEach(t => {
      this._indexedSchedule[t] = {};
    });

    (this.calendar || []).forEach(m => {
      if (this._indexedSchedule[m.home]) {
        this._indexedSchedule[m.home][m.matchday] = {
          opponent: m.away,
          isHome: true,
          date: m.date
        };
      }
      if (this._indexedSchedule[m.away]) {
        this._indexedSchedule[m.away][m.matchday] = {
          opponent: m.home,
          isHome: false,
          date: m.date
        };
      }
    });
  }

  /**
   * Calcola la difficoltà ponderata di una partita per la squadra X alla giornata g
   * Difficoltà = Rating Avversario + (+0.5 se in trasferta, -0.5 se in casa)
   */
  getMatchDifficulty(team, matchday) {
    const fixture = this._indexedSchedule[team] ? this._indexedSchedule[team][matchday] : null;
    if (!fixture) return 5.0;

    const oppRating = this.getTeamRating(fixture.opponent);
    const homeFactor = fixture.isHome ? -0.5 : +0.5;
    const diff = oppRating + homeFactor;
    return {
      opponent: fixture.opponent,
      isHome: fixture.isHome,
      oppRating: oppRating,
      difficulty: diff
    };
  }

  /**
   * Recupera i calciatori di riferimento dal listone per una data squadra e ruolo
   */
  getTeamKeyPlayers(team, role) {
    const all = typeof this.getPlayers === 'function' ? this.getPlayers() : [];
    const targetRole = String(role || '').trim().toUpperCase();
    return all.filter(p => p.squadra === team && String(p.ruolo || '').trim().toUpperCase() === targetRole)
      .sort((a, b) => {
        const titA = parseInt(a.titolarita, 10) || 0;
        const titB = parseInt(b.titolarita, 10) || 0;
        if (titB !== titA) return titB - titA;
        return (b.prezzo_massimo_imposto || 0) - (a.prezzo_massimo_imposto || 0);
      });
  }

  /**
   * Analizza l'Alternanza Portieri tra due squadre (A, B) su tutte le 38 giornate
   */
  analyzeGoalkeeperPair(teamA, teamB) {
    let totalBestDiff = 0;
    let bigMatchOverlap = 0; // Entrambe affrontano avversari con Rating >= 8
    let homeAwayAlternation = 0; // Una in casa e l'altra in trasferta
    const matchdayDetails = [];

    for (let g = 1; g <= 38; g++) {
      const matchA = this.getMatchDifficulty(teamA, g);
      const matchB = this.getMatchDifficulty(teamB, g);

      const bestDiff = Math.min(matchA.difficulty, matchB.difficulty);
      totalBestDiff += bestDiff;

      const isBigMatchA = matchA.oppRating >= 8;
      const isBigMatchB = matchB.oppRating >= 8;
      if (isBigMatchA && isBigMatchB) {
        bigMatchOverlap++;
      }

      if (matchA.isHome !== matchB.isHome) {
        homeAwayAlternation++;
      }

      matchdayDetails.push({
        matchday: g,
        matchA,
        matchB,
        bestChoice: matchA.difficulty <= matchB.difficulty ? teamA : teamB,
        bestDiff
      });
    }

    const indiceMedio = parseFloat((totalBestDiff / 38).toFixed(2));
    const playersA = this.getTeamKeyPlayers(teamA, 'P');
    const playersB = this.getTeamKeyPlayers(teamB, 'P');

    return {
      teamA,
      teamB,
      indiceMedio,
      bigMatchOverlap,
      homeAwayAlternation,
      playersA: playersA.slice(0, 2),
      playersB: playersB.slice(0, 2),
      matchdayDetails
    };
  }

  /**
   * Analizza l'Alternanza Attaccanti tra due squadre (A, B) su tutte le 38 giornate
   * Obiettivo: massimizzare le giornate con almeno 1 partita favorevole
   * Partita favorevole: avversario rating <= 5 oppure in casa con avversario <= 6
   */
  analyzeAttackerPair(teamA, teamB) {
    let softMatchdaysCount = 0; // Almeno 1 partita morbida
    let doubleSoftMatchdaysCount = 0; // Entrambe con partita morbida
    let totalBestDiff = 0;
    const matchdayDetails = [];

    for (let g = 1; g <= 38; g++) {
      const matchA = this.getMatchDifficulty(teamA, g);
      const matchB = this.getMatchDifficulty(teamB, g);

      const isSoftA = matchA.oppRating <= 5 || (matchA.isHome && matchA.oppRating <= 6);
      const isSoftB = matchB.oppRating <= 5 || (matchB.isHome && matchB.oppRating <= 6);

      if (isSoftA || isSoftB) {
        softMatchdaysCount++;
      }
      if (isSoftA && isSoftB) {
        doubleSoftMatchdaysCount++;
      }

      const bestDiff = Math.min(matchA.difficulty, matchB.difficulty);
      totalBestDiff += bestDiff;

      matchdayDetails.push({
        matchday: g,
        matchA,
        matchB,
        isSoftA,
        isSoftB
      });
    }

    const indiceOffensivo = parseFloat((totalBestDiff / 38).toFixed(2));
    const playersA = this.getTeamKeyPlayers(teamA, 'A');
    const playersB = this.getTeamKeyPlayers(teamB, 'A');

    return {
      teamA,
      teamB,
      softMatchdaysCount,
      doubleSoftMatchdaysCount,
      indiceOffensivo,
      playersA: playersA.slice(0, 3),
      playersB: playersB.slice(0, 3),
      matchdayDetails
    };
  }

  /**
   * Restituisce la classifica di tutte le 190 coppie per i Portieri (ordinata per indice medio crescente)
   */
  getAllGoalkeeperPairs(targetTeam = null) {
    const teams = this.getAllTeams();
    const pairs = [];

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const tA = teams[i];
        const tB = teams[j];

        if (targetTeam && tA !== targetTeam && tB !== targetTeam) {
          continue;
        }

        pairs.push(this.analyzeGoalkeeperPair(tA, tB));
      }
    }

    return pairs.sort((a, b) => {
      if (a.indiceMedio !== b.indiceMedio) return a.indiceMedio - b.indiceMedio;
      if (a.bigMatchOverlap !== b.bigMatchOverlap) return a.bigMatchOverlap - b.bigMatchOverlap;
      return b.homeAwayAlternation - a.homeAwayAlternation;
    });
  }

  /**
   * Restituisce la classifica di tutte le 190 coppie per gli Attaccanti (ordinata per giornate favorevoli decrescente)
   */
  getAllAttackerPairs(targetTeam = null) {
    const teams = this.getAllTeams();
    const pairs = [];

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const tA = teams[i];
        const tB = teams[j];

        if (targetTeam && tA !== targetTeam && tB !== targetTeam) {
          continue;
        }

        pairs.push(this.analyzeAttackerPair(tA, tB));
      }
    }

    return pairs.sort((a, b) => {
      if (b.softMatchdaysCount !== a.softMatchdaysCount) return b.softMatchdaysCount - a.softMatchdaysCount;
      if (b.doubleSoftMatchdaysCount !== a.doubleSoftMatchdaysCount) return b.doubleSoftMatchdaysCount - a.doubleSoftMatchdaysCount;
      return a.indiceOffensivo - b.indiceOffensivo;
    });
  }

  /**
   * Suggeritore dinamico: trova le migliori squadre partner per una specifica squadra
   */
  getBestPartnersForTeam(team, role = 'P', limit = 4) {
    if (!team) return [];

    if (role === 'P') {
      const pairs = this.getAllGoalkeeperPairs(team);
      return pairs.slice(0, limit).map(p => {
        const partnerTeam = p.teamA === team ? p.teamB : p.teamA;
        const partnerPlayers = p.teamA === team ? p.playersB : p.playersA;
        return {
          partnerTeam,
          role: 'P',
          indiceMedio: p.indiceMedio,
          bigMatchOverlap: p.bigMatchOverlap,
          homeAwayAlternation: p.homeAwayAlternation,
          players: partnerPlayers
        };
      });
    } else if (role === 'A') {
      const pairs = this.getAllAttackerPairs(team);
      return pairs.slice(0, limit).map(p => {
        const partnerTeam = p.teamA === team ? p.teamB : p.teamA;
        const partnerPlayers = p.teamA === team ? p.playersB : p.playersA;
        return {
          partnerTeam,
          role: 'A',
          softMatchdaysCount: p.softMatchdaysCount,
          doubleSoftMatchdaysCount: p.doubleSoftMatchdaysCount,
          indiceOffensivo: p.indiceOffensivo,
          players: partnerPlayers
        };
      });
    }
    return [];
  }

  /**
   * FOCUS SQUADRA: Calcola tutte le 19 combinazioni di Portieri per una specifica squadra pivot
   */
  getFocusTeamGoalkeepers(pivotTeam) {
    if (!pivotTeam) return [];
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
  }

  /**
   * FOCUS SQUADRA: Calcola tutte le 19 combinazioni di Coppie Attaccanti per una specifica squadra pivot
   */
  getFocusTeamAttackersPairs(pivotTeam) {
    if (!pivotTeam) return [];
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
  }

  /**
   * FOCUS SQUADRA: Calcola tutti i 171 Tris di Attaccanti (pivotTeam + B + C)
   * Formula: MinDiff su 38 giornate e Copertura match favorevoli garantiti
   */
  getFocusTeamAttackersTriplets(pivotTeam) {
    if (!pivotTeam) return [];
    const allTeams = this.getAllTeams();
    const otherTeams = allTeams.filter(t => t !== pivotTeam);

    // Pre-indicizzazione vettoriale delle 38 giornate per tutte le squadre
    const fixtureCache = {};
    allTeams.forEach(t => {
      fixtureCache[t] = [];
      for (let g = 1; g <= 38; g++) {
        const match = this.getMatchDifficulty(t, g);
        fixtureCache[t][g] = {
          diff: match.difficulty,
          isSoft: match.oppRating <= 5 || (match.isHome && match.oppRating <= 6)
        };
      }
    });

    const attackerCache = {};
    allTeams.forEach(t => {
      attackerCache[t] = this.getTeamKeyPlayers(t, 'A').slice(0, 3);
    });

    const preA = fixtureCache[pivotTeam];
    const triplets = [];

    for (let i = 0; i < otherTeams.length; i++) {
      const tB = otherTeams[i];
      const preB = fixtureCache[tB];

      for (let j = i + 1; j < otherTeams.length; j++) {
        const tC = otherTeams[j];
        const preC = fixtureCache[tC];

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
          playersB: attackerCache[tB],
          playersC: attackerCache[tC]
        });
      }
    }

    return triplets.sort((a, b) => {
      if (b.softMatchdaysCount !== a.softMatchdaysCount) return b.softMatchdaysCount - a.softMatchdaysCount;
      return a.indiceTris - b.indiceTris;
    });
  }
}

if (typeof window !== 'undefined') {
  window.CalendarEngine = CalendarEngine;
}
if (typeof module !== 'undefined') {
  module.exports = CalendarEngine;
}
