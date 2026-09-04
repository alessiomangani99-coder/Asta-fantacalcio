const vm = require('vm');
const fs = require('fs');

const code = fs.readFileSync('stats_giocatori.js', 'utf-8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

console.log('window.STATS_STORICHE defined:', !!sandbox.window.STATS_STORICHE);
console.log('window.getHistoricalStats defined:', typeof sandbox.window.getHistoricalStats === 'function');

const malen = sandbox.window.getHistoricalStats({ nome: 'Malen', squadra: 'Roma', ruolo: 'A' });
console.log('Malen:', malen);

const lautaro = sandbox.window.getHistoricalStats({ nome: 'Martinez L.', squadra: 'Inter', ruolo: 'A' });
console.log('Martinez L.:', lautaro);

const svilar = sandbox.window.getHistoricalStats({ nome: 'Svilar', squadra: 'Roma', ruolo: 'P' });
console.log('Svilar:', svilar);

const grabara = sandbox.window.getHistoricalStats({ nome: 'Grabara', squadra: 'Juventus', ruolo: 'P' });
console.log('Grabara (Esordiente):', grabara);

const thuram = sandbox.window.getHistoricalStats({ nome: 'Thuram', squadra: 'Inter', ruolo: 'A' });
console.log('Thuram:', thuram ? thuram.last : null);
