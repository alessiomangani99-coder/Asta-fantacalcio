/**
 * Calendario Ufficiale Serie A 2026/2027 (380 partite, 38 giornate)
 * Normalizzato per Asta Fantacalcio 2026/2027
 */

const CALENDARIO_SERIE_A = [
  {
    "matchday": 1,
    "date": "2026-08-22",
    "home": "Udinese",
    "away": "Como"
  },
  {
    "matchday": 1,
    "date": "2026-08-22",
    "home": "Inter",
    "away": "Monza"
  },
  {
    "matchday": 1,
    "date": "2026-08-22",
    "home": "Genoa",
    "away": "Napoli"
  },
  {
    "matchday": 1,
    "date": "2026-08-22",
    "home": "Parma",
    "away": "Cagliari"
  },
  {
    "matchday": 1,
    "date": "2026-08-23",
    "home": "Frosinone",
    "away": "Juventus"
  },
  {
    "matchday": 1,
    "date": "2026-08-23",
    "home": "Venezia",
    "away": "Lecce"
  },
  {
    "matchday": 1,
    "date": "2026-08-23",
    "home": "Atalanta",
    "away": "Sassuolo"
  },
  {
    "matchday": 1,
    "date": "2026-08-23",
    "home": "Torino",
    "away": "Milan"
  },
  {
    "matchday": 1,
    "date": "2026-08-24",
    "home": "Bologna",
    "away": "Lazio"
  },
  {
    "matchday": 1,
    "date": "2026-08-24",
    "home": "Roma",
    "away": "Fiorentina"
  },
  {
    "matchday": 2,
    "date": "2026-08-28",
    "home": "Milan",
    "away": "Venezia"
  },
  {
    "matchday": 2,
    "date": "2026-08-29",
    "home": "Sassuolo",
    "away": "Torino"
  },
  {
    "matchday": 2,
    "date": "2026-08-29",
    "home": "Fiorentina",
    "away": "Frosinone"
  },
  {
    "matchday": 2,
    "date": "2026-08-29",
    "home": "Monza",
    "away": "Udinese"
  },
  {
    "matchday": 2,
    "date": "2026-08-29",
    "home": "Juventus",
    "away": "Parma"
  },
  {
    "matchday": 2,
    "date": "2026-08-30",
    "home": "Napoli",
    "away": "Como"
  },
  {
    "matchday": 2,
    "date": "2026-08-30",
    "home": "Lazio",
    "away": "Genoa"
  },
  {
    "matchday": 2,
    "date": "2026-08-30",
    "home": "Cagliari",
    "away": "Inter"
  },
  {
    "matchday": 2,
    "date": "2026-08-31",
    "home": "Lecce",
    "away": "Roma"
  },
  {
    "matchday": 2,
    "date": "2026-08-31",
    "home": "Atalanta",
    "away": "Bologna"
  },
  {
    "matchday": 3,
    "date": "2026-09-04",
    "home": "Genoa",
    "away": "Como"
  },
  {
    "matchday": 3,
    "date": "2026-09-05",
    "home": "Fiorentina",
    "away": "Torino"
  },
  {
    "matchday": 3,
    "date": "2026-09-05",
    "home": "Inter",
    "away": "Napoli"
  },
  {
    "matchday": 3,
    "date": "2026-09-05",
    "home": "Roma",
    "away": "Atalanta"
  },
  {
    "matchday": 3,
    "date": "2026-09-06",
    "home": "Frosinone",
    "away": "Venezia"
  },
  {
    "matchday": 3,
    "date": "2026-09-06",
    "home": "Parma",
    "away": "Monza"
  },
  {
    "matchday": 3,
    "date": "2026-09-06",
    "home": "Bologna",
    "away": "Sassuolo"
  },
  {
    "matchday": 3,
    "date": "2026-09-06",
    "home": "Juventus",
    "away": "Milan"
  },
  {
    "matchday": 3,
    "date": "2026-09-07",
    "home": "Cagliari",
    "away": "Lecce"
  },
  {
    "matchday": 3,
    "date": "2026-09-07",
    "home": "Udinese",
    "away": "Lazio"
  },
  {
    "matchday": 4,
    "date": "2026-09-11",
    "home": "Venezia",
    "away": "Fiorentina"
  },
  {
    "matchday": 4,
    "date": "2026-09-12",
    "home": "Genoa",
    "away": "Frosinone"
  },
  {
    "matchday": 4,
    "date": "2026-09-12",
    "home": "Sassuolo",
    "away": "Juventus"
  },
  {
    "matchday": 4,
    "date": "2026-09-12",
    "home": "Atalanta",
    "away": "Cagliari"
  },
  {
    "matchday": 4,
    "date": "2026-09-13",
    "home": "Torino",
    "away": "Roma"
  },
  {
    "matchday": 4,
    "date": "2026-09-13",
    "home": "Lecce",
    "away": "Monza"
  },
  {
    "matchday": 4,
    "date": "2026-09-13",
    "home": "Como",
    "away": "Parma"
  },
  {
    "matchday": 4,
    "date": "2026-09-13",
    "home": "Napoli",
    "away": "Bologna"
  },
  {
    "matchday": 4,
    "date": "2026-09-13",
    "home": "Lazio",
    "away": "Milan"
  },
  {
    "matchday": 4,
    "date": "2026-09-14",
    "home": "Inter",
    "away": "Udinese"
  },
  {
    "matchday": 5,
    "date": "2026-09-18",
    "home": "Monza",
    "away": "Sassuolo"
  },
  {
    "matchday": 5,
    "date": "2026-09-19",
    "home": "Udinese",
    "away": "Cagliari"
  },
  {
    "matchday": 5,
    "date": "2026-09-19",
    "home": "Bologna",
    "away": "Torino"
  },
  {
    "matchday": 5,
    "date": "2026-09-19",
    "home": "Roma",
    "away": "Inter"
  },
  {
    "matchday": 5,
    "date": "2026-09-19",
    "home": "Venezia",
    "away": "Lazio"
  },
  {
    "matchday": 5,
    "date": "2026-09-20",
    "home": "Fiorentina",
    "away": "Napoli"
  },
  {
    "matchday": 5,
    "date": "2026-09-20",
    "home": "Frosinone",
    "away": "Como"
  },
  {
    "matchday": 5,
    "date": "2026-09-20",
    "home": "Parma",
    "away": "Genoa"
  },
  {
    "matchday": 5,
    "date": "2026-09-20",
    "home": "Juventus",
    "away": "Atalanta"
  },
  {
    "matchday": 5,
    "date": "2026-09-20",
    "home": "Milan",
    "away": "Lecce"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Lazio",
    "away": "Monza"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Sassuolo",
    "away": "Milan"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Cagliari",
    "away": "Juventus"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Napoli",
    "away": "Frosinone"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Genoa",
    "away": "Fiorentina"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Atalanta",
    "away": "Venezia"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Torino",
    "away": "Udinese"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Inter",
    "away": "Parma"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Lecce",
    "away": "Bologna"
  },
  {
    "matchday": 6,
    "date": "2026-10-11",
    "home": "Como",
    "away": "Roma"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Milan",
    "away": "Atalanta"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Udinese",
    "away": "Lecce"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Juventus",
    "away": "Lazio"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Roma",
    "away": "Genoa"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Bologna",
    "away": "Inter"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Fiorentina",
    "away": "Como"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Frosinone",
    "away": "Sassuolo"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Venezia",
    "away": "Napoli"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Parma",
    "away": "Torino"
  },
  {
    "matchday": 7,
    "date": "2026-10-18",
    "home": "Monza",
    "away": "Cagliari"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Lazio",
    "away": "Parma"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Cagliari",
    "away": "Bologna"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Napoli",
    "away": "Roma"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Udinese",
    "away": "Milan"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Genoa",
    "away": "Venezia"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Atalanta",
    "away": "Frosinone"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Torino",
    "away": "Monza"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Inter",
    "away": "Fiorentina"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Lecce",
    "away": "Juventus"
  },
  {
    "matchday": 8,
    "date": "2026-10-25",
    "home": "Como",
    "away": "Sassuolo"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Sassuolo",
    "away": "Lazio"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Milan",
    "away": "Bologna"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Genoa",
    "away": "Juventus"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Roma",
    "away": "Cagliari"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Fiorentina",
    "away": "Atalanta"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Torino",
    "away": "Como"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Frosinone",
    "away": "Lecce"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Venezia",
    "away": "Inter"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Parma",
    "away": "Udinese"
  },
  {
    "matchday": 9,
    "date": "2026-10-28",
    "home": "Monza",
    "away": "Napoli"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Lazio",
    "away": "Cagliari"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Sassuolo",
    "away": "Fiorentina"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Milan",
    "away": "Inter"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Udinese",
    "away": "Roma"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Juventus",
    "away": "Napoli"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Atalanta",
    "away": "Parma"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Bologna",
    "away": "Monza"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Frosinone",
    "away": "Torino"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Lecce",
    "away": "Genoa"
  },
  {
    "matchday": 10,
    "date": "2026-11-01",
    "home": "Como",
    "away": "Venezia"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Cagliari",
    "away": "Frosinone"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Napoli",
    "away": "Lazio"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Genoa",
    "away": "Milan"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Roma",
    "away": "Sassuolo"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Fiorentina",
    "away": "Juventus"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Torino",
    "away": "Lecce"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Inter",
    "away": "Como"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Venezia",
    "away": "Udinese"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Parma",
    "away": "Bologna"
  },
  {
    "matchday": 11,
    "date": "2026-11-08",
    "home": "Monza",
    "away": "Atalanta"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Lazio",
    "away": "Lecce"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Sassuolo",
    "away": "Genoa"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Milan",
    "away": "Frosinone"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Napoli",
    "away": "Torino"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Juventus",
    "away": "Venezia"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Atalanta",
    "away": "Inter"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Bologna",
    "away": "Udinese"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Parma",
    "away": "Roma"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Como",
    "away": "Cagliari"
  },
  {
    "matchday": 12,
    "date": "2026-11-22",
    "home": "Monza",
    "away": "Fiorentina"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Sassuolo",
    "away": "Napoli"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Cagliari",
    "away": "Milan"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Udinese",
    "away": "Fiorentina"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Roma",
    "away": "Monza"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Torino",
    "away": "Lazio"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Inter",
    "away": "Genoa"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Frosinone",
    "away": "Parma"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Venezia",
    "away": "Bologna"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Lecce",
    "away": "Atalanta"
  },
  {
    "matchday": 13,
    "date": "2026-11-29",
    "home": "Como",
    "away": "Juventus"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Lazio",
    "away": "Atalanta"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Milan",
    "away": "Parma"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Napoli",
    "away": "Lecce"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Genoa",
    "away": "Torino"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Juventus",
    "away": "Udinese"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Bologna",
    "away": "Roma"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Fiorentina",
    "away": "Cagliari"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Frosinone",
    "away": "Inter"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Venezia",
    "away": "Sassuolo"
  },
  {
    "matchday": 14,
    "date": "2026-12-06",
    "home": "Monza",
    "away": "Como"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Lazio",
    "away": "Roma"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Cagliari",
    "away": "Venezia"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Napoli",
    "away": "Milan"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Udinese",
    "away": "Frosinone"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Juventus",
    "away": "Monza"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Atalanta",
    "away": "Genoa"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Inter",
    "away": "Torino"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Parma",
    "away": "Fiorentina"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Lecce",
    "away": "Sassuolo"
  },
  {
    "matchday": 15,
    "date": "2026-12-13",
    "home": "Como",
    "away": "Bologna"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Sassuolo",
    "away": "Parma"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Milan",
    "away": "Como"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Genoa",
    "away": "Udinese"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Roma",
    "away": "Juventus"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Atalanta",
    "away": "Napoli"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Fiorentina",
    "away": "Bologna"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Torino",
    "away": "Cagliari"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Frosinone",
    "away": "Lazio"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Venezia",
    "away": "Monza"
  },
  {
    "matchday": 16,
    "date": "2026-12-20",
    "home": "Lecce",
    "away": "Inter"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Cagliari",
    "away": "Genoa"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Udinese",
    "away": "Atalanta"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Roma",
    "away": "Frosinone"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Bologna",
    "away": "Juventus"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Fiorentina",
    "away": "Lazio"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Torino",
    "away": "Venezia"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Inter",
    "away": "Sassuolo"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Parma",
    "away": "Napoli"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Como",
    "away": "Lecce"
  },
  {
    "matchday": 17,
    "date": "2027-01-03",
    "home": "Monza",
    "away": "Milan"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Lazio",
    "away": "Inter"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Sassuolo",
    "away": "Udinese"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Milan",
    "away": "Fiorentina"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Napoli",
    "away": "Cagliari"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Genoa",
    "away": "Monza"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Juventus",
    "away": "Torino"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Atalanta",
    "away": "Como"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Frosinone",
    "away": "Bologna"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Venezia",
    "away": "Roma"
  },
  {
    "matchday": 18,
    "date": "2027-01-06",
    "home": "Lecce",
    "away": "Parma"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Cagliari",
    "away": "Sassuolo"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Udinese",
    "away": "Napoli"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Roma",
    "away": "Milan"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Bologna",
    "away": "Genoa"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Fiorentina",
    "away": "Lecce"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Torino",
    "away": "Atalanta"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Inter",
    "away": "Juventus"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Parma",
    "away": "Venezia"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Como",
    "away": "Lazio"
  },
  {
    "matchday": 19,
    "date": "2027-01-10",
    "home": "Monza",
    "away": "Frosinone"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Lazio",
    "away": "Bologna"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Sassuolo",
    "away": "Monza"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Milan",
    "away": "Torino"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Cagliari",
    "away": "Como"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Napoli",
    "away": "Fiorentina"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Juventus",
    "away": "Genoa"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Atalanta",
    "away": "Roma"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Venezia",
    "away": "Frosinone"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Parma",
    "away": "Inter"
  },
  {
    "matchday": 20,
    "date": "2027-01-17",
    "home": "Lecce",
    "away": "Udinese"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Genoa",
    "away": "Parma"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Juventus",
    "away": "Cagliari"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Roma",
    "away": "Udinese"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Bologna",
    "away": "Atalanta"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Fiorentina",
    "away": "Sassuolo"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Inter",
    "away": "Venezia"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Frosinone",
    "away": "Milan"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Lecce",
    "away": "Torino"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Como",
    "away": "Napoli"
  },
  {
    "matchday": 21,
    "date": "2027-01-24",
    "home": "Monza",
    "away": "Lazio"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Lazio",
    "away": "Venezia"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Sassuolo",
    "away": "Como"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Milan",
    "away": "Juventus"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Cagliari",
    "away": "Parma"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Napoli",
    "away": "Inter"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Udinese",
    "away": "Bologna"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Genoa",
    "away": "Lecce"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Atalanta",
    "away": "Fiorentina"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Torino",
    "away": "Frosinone"
  },
  {
    "matchday": 22,
    "date": "2027-01-31",
    "home": "Monza",
    "away": "Roma"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Juventus",
    "away": "Sassuolo"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Roma",
    "away": "Torino"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Atalanta",
    "away": "Lazio"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Bologna",
    "away": "Milan"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Fiorentina",
    "away": "Udinese"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Inter",
    "away": "Cagliari"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Venezia",
    "away": "Genoa"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Parma",
    "away": "Frosinone"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Lecce",
    "away": "Napoli"
  },
  {
    "matchday": 23,
    "date": "2027-02-07",
    "home": "Como",
    "away": "Monza"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Cagliari",
    "away": "Lazio"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Napoli",
    "away": "Juventus"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Udinese",
    "away": "Venezia"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Genoa",
    "away": "Atalanta"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Roma",
    "away": "Parma"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Bologna",
    "away": "Como"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Torino",
    "away": "Sassuolo"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Inter",
    "away": "Milan"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Frosinone",
    "away": "Fiorentina"
  },
  {
    "matchday": 24,
    "date": "2027-02-14",
    "home": "Monza",
    "away": "Lecce"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Lazio",
    "away": "Napoli"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Sassuolo",
    "away": "Roma"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Milan",
    "away": "Genoa"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Udinese",
    "away": "Parma"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Juventus",
    "away": "Bologna"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Atalanta",
    "away": "Monza"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Fiorentina",
    "away": "Inter"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Venezia",
    "away": "Cagliari"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Lecce",
    "away": "Frosinone"
  },
  {
    "matchday": 25,
    "date": "2027-02-21",
    "home": "Como",
    "away": "Torino"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Cagliari",
    "away": "Udinese"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Genoa",
    "away": "Lazio"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Roma",
    "away": "Venezia"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Bologna",
    "away": "Lecce"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Torino",
    "away": "Fiorentina"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Inter",
    "away": "Atalanta"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Frosinone",
    "away": "Napoli"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Parma",
    "away": "Sassuolo"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Como",
    "away": "Milan"
  },
  {
    "matchday": 26,
    "date": "2027-02-28",
    "home": "Monza",
    "away": "Juventus"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Lazio",
    "away": "Frosinone"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Sassuolo",
    "away": "Bologna"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Milan",
    "away": "Cagliari"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Napoli",
    "away": "Parma"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Udinese",
    "away": "Inter"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Juventus",
    "away": "Roma"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Atalanta",
    "away": "Torino"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Fiorentina",
    "away": "Venezia"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Lecce",
    "away": "Como"
  },
  {
    "matchday": 27,
    "date": "2027-03-07",
    "home": "Monza",
    "away": "Genoa"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Lazio",
    "away": "Juventus"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Milan",
    "away": "Sassuolo"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Cagliari",
    "away": "Fiorentina"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Genoa",
    "away": "Roma"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Bologna",
    "away": "Napoli"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Torino",
    "away": "Inter"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Frosinone",
    "away": "Monza"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Venezia",
    "away": "Atalanta"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Parma",
    "away": "Lecce"
  },
  {
    "matchday": 28,
    "date": "2027-03-14",
    "home": "Como",
    "away": "Udinese"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Sassuolo",
    "away": "Cagliari"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Napoli",
    "away": "Venezia"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Udinese",
    "away": "Torino"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Juventus",
    "away": "Como"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Roma",
    "away": "Lecce"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Atalanta",
    "away": "Milan"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Fiorentina",
    "away": "Genoa"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Inter",
    "away": "Frosinone"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Parma",
    "away": "Lazio"
  },
  {
    "matchday": 29,
    "date": "2027-03-21",
    "home": "Monza",
    "away": "Bologna"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Sassuolo",
    "away": "Atalanta"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Milan",
    "away": "Monza"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Cagliari",
    "away": "Napoli"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Genoa",
    "away": "Inter"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Roma",
    "away": "Bologna"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Torino",
    "away": "Juventus"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Frosinone",
    "away": "Udinese"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Venezia",
    "away": "Parma"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Lecce",
    "away": "Lazio"
  },
  {
    "matchday": 30,
    "date": "2027-04-04",
    "home": "Como",
    "away": "Fiorentina"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Lazio",
    "away": "Torino"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Cagliari",
    "away": "Atalanta"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Napoli",
    "away": "Sassuolo"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Udinese",
    "away": "Monza"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Juventus",
    "away": "Lecce"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Bologna",
    "away": "Venezia"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Fiorentina",
    "away": "Milan"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Inter",
    "away": "Roma"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Frosinone",
    "away": "Genoa"
  },
  {
    "matchday": 31,
    "date": "2027-04-11",
    "home": "Parma",
    "away": "Como"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Sassuolo",
    "away": "Lecce"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Milan",
    "away": "Napoli"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Roma",
    "away": "Lazio"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Atalanta",
    "away": "Udinese"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Bologna",
    "away": "Cagliari"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Fiorentina",
    "away": "Parma"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Torino",
    "away": "Genoa"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Venezia",
    "away": "Juventus"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Como",
    "away": "Frosinone"
  },
  {
    "matchday": 32,
    "date": "2027-04-18",
    "home": "Monza",
    "away": "Inter"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Lazio",
    "away": "Como"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Cagliari",
    "away": "Monza"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Napoli",
    "away": "Udinese"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Genoa",
    "away": "Sassuolo"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Juventus",
    "away": "Fiorentina"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Inter",
    "away": "Bologna"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Frosinone",
    "away": "Roma"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Venezia",
    "away": "Torino"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Parma",
    "away": "Atalanta"
  },
  {
    "matchday": 33,
    "date": "2027-04-25",
    "home": "Lecce",
    "away": "Milan"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Sassuolo",
    "away": "Frosinone"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Milan",
    "away": "Lazio"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Udinese",
    "away": "Genoa"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Roma",
    "away": "Napoli"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Atalanta",
    "away": "Juventus"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Bologna",
    "away": "Fiorentina"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Torino",
    "away": "Parma"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Lecce",
    "away": "Cagliari"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Como",
    "away": "Inter"
  },
  {
    "matchday": 34,
    "date": "2027-05-02",
    "home": "Monza",
    "away": "Venezia"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Lazio",
    "away": "Sassuolo"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Napoli",
    "away": "Monza"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Udinese",
    "away": "Juventus"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Genoa",
    "away": "Cagliari"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Fiorentina",
    "away": "Roma"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Torino",
    "away": "Bologna"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Inter",
    "away": "Lecce"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Frosinone",
    "away": "Atalanta"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Venezia",
    "away": "Como"
  },
  {
    "matchday": 35,
    "date": "2027-05-09",
    "home": "Parma",
    "away": "Milan"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Lazio",
    "away": "Udinese"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Sassuolo",
    "away": "Venezia"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Milan",
    "away": "Roma"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Cagliari",
    "away": "Torino"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Napoli",
    "away": "Genoa"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Juventus",
    "away": "Inter"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Bologna",
    "away": "Frosinone"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Lecce",
    "away": "Fiorentina"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Como",
    "away": "Atalanta"
  },
  {
    "matchday": 36,
    "date": "2027-05-16",
    "home": "Monza",
    "away": "Parma"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Udinese",
    "away": "Sassuolo"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Genoa",
    "away": "Bologna"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Roma",
    "away": "Como"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Atalanta",
    "away": "Lecce"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Fiorentina",
    "away": "Monza"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Torino",
    "away": "Napoli"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Inter",
    "away": "Lazio"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Frosinone",
    "away": "Cagliari"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Venezia",
    "away": "Milan"
  },
  {
    "matchday": 37,
    "date": "2027-05-23",
    "home": "Parma",
    "away": "Juventus"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Lazio",
    "away": "Fiorentina"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Sassuolo",
    "away": "Inter"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Milan",
    "away": "Udinese"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Cagliari",
    "away": "Roma"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Napoli",
    "away": "Atalanta"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Juventus",
    "away": "Frosinone"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Bologna",
    "away": "Parma"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Lecce",
    "away": "Venezia"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Como",
    "away": "Genoa"
  },
  {
    "matchday": 38,
    "date": "2027-05-30",
    "home": "Monza",
    "away": "Torino"
  }
];

if (typeof window !== 'undefined') {
  window.CALENDARIO_SERIE_A = CALENDARIO_SERIE_A;
}
if (typeof module !== 'undefined') {
  module.exports = CALENDARIO_SERIE_A;
}
