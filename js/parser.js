/**
 * Parser Universale Listone Excel (.xlsx) e CSV per Fantacalcio 2026/2027
 * Supporta:
 *  - File Excel ufficiali Fantacalcio.it (es. Quotazioni_Fantacalcio_Stagione_2026_27.xlsx)
 *  - File CSV ufficiali Fantacalcio.it e CSV storici
 *  - Rilevamento automatico foglio ("Tutti", ignorando "Ceduti")
 *  - Rilevamento automatico riga intestazioni (header offset entro le prime 5 righe)
 *  - Mappatura intelligente colonne (R, Nome, Squadra, Qt.A / FVM)
 *  - Rimozione totale di integrità e titolarità (obsolete)
 *  - Assegnazione fascia predefinita all'import ("3ª Fascia")
 */

class ListoneParser {
  /**
   * Normalizza il ruolo in uno dei 4 codici standard: P, D, C, A
   */
  static normalizeRole(raw) {
    if (!raw) return null;
    const s = String(raw).trim().toUpperCase();
    if (s === 'P' || s.startsWith('PORT')) return 'P';
    if (s === 'D' || s.startsWith('DIF')) return 'D';
    if (s === 'C' || s.startsWith('CENT')) return 'C';
    if (s === 'A' || s.startsWith('ATT')) return 'A';

    // Gestione formati Mantre o misti (es. "Por", "Dc", "Cc", "Pc")
    if (s === 'POR') return 'P';
    if (s.includes('P') && !s.includes('C') && !s.includes('D') && !s.includes('A')) return 'P';
    if (s.includes('D')) return 'D';
    if (s.includes('C')) return 'C';
    if (s.includes('A')) return 'A';
    return null;
  }

  /**
   * Pulisce e divide una riga CSV gestendo eventuali apici
   */
  static parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    const delimiter = line.includes(';') && !line.includes(',') ? ';' : ',';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  /**
   * Parsa un workbook SheetJS (supporta sia .xlsx che .csv letti con SheetJS)
   */
  static parseWorkbook(workbook) {
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return [];
    }

    const sheetNames = workbook.SheetNames;
    let targetSheetName = null;

    // 1. Rilevamento Foglio:
    // Se il file contiene il foglio "Tutti", leggi automaticamente quello (ignorando "Ceduti")
    const tuttiSheet = sheetNames.find(s => s.trim().toLowerCase() === 'tutti');
    if (tuttiSheet) {
      targetSheetName = tuttiSheet;
    } else {
      // In alternativa leggi il primo foglio attivo che non sia "ceduti"
      const nonCeduti = sheetNames.find(s => s.trim().toLowerCase() !== 'ceduti');
      targetSheetName = nonCeduti || sheetNames[0];
    }

    const worksheet = workbook.Sheets[targetSheetName];
    if (!worksheet) return [];

    const rawRows = (typeof XLSX !== 'undefined')
      ? XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      : [];

    if (!rawRows || rawRows.length === 0) return [];

    // 2. Rilevamento Riga Colonne (Header Offset):
    // Scansiona le prime 5 righe per individuare la riga contenente le intestazioni reali
    let headerRowIdx = -1;
    const maxScan = Math.min(5, rawRows.length);

    for (let r = 0; r < maxScan; r++) {
      const row = rawRows[r];
      if (!Array.isArray(row)) continue;
      const rowTexts = row.map(cell => String(cell || '').trim().toLowerCase());

      const hasNome = rowTexts.some(c => c === 'nome' || c === 'calciatore' || c === 'giocatore' || c === 'player');
      const hasRuolo = rowTexts.some(c => c === 'r' || c === 'ruolo' || c === 'ruolo classico' || c === 'r classico');
      const hasSquadra = rowTexts.some(c => c === 'squadra' || c === 'club' || c === 'team');

      if (hasNome && (hasRuolo || hasSquadra)) {
        headerRowIdx = r;
        break;
      }
    }

    // Se non troviamo una corrispondenza esplicita nelle prime 5 righe, cerca una riga con intestazioni
    if (headerRowIdx === -1) {
      for (let r = 0; r < maxScan; r++) {
        const row = rawRows[r];
        if (Array.isArray(row) && row.some(c => String(c).trim().length > 0)) {
          headerRowIdx = r;
          break;
        }
      }
    }

    if (headerRowIdx === -1) return [];

    // 3. Mappatura Campi Esatti
    const headerRow = rawRows[headerRowIdx].map(cell => String(cell || '').trim());
    let ruoloIdx = -1;
    let nomeIdx = -1;
    let squadraIdx = -1;
    let quotazioneIdx = -1;

    for (let c = 0; c < headerRow.length; c++) {
      const h = headerRow[c].toLowerCase();

      // Ruolo: prioritario 'r', 'ruolo'
      if (ruoloIdx === -1 && (h === 'r' || h === 'ruolo' || h === 'ruolo classico' || h === 'r classico')) {
        ruoloIdx = c;
      }

      // Nome: prioritario 'nome', 'calciatore', 'giocatore'
      if (nomeIdx === -1 && (h === 'nome' || h === 'calciatore' || h === 'giocatore' || h === 'player')) {
        nomeIdx = c;
      }

      // Squadra: prioritario 'squadra', 'club', 'team'
      if (squadraIdx === -1 && (h === 'squadra' || h === 'club' || h === 'team')) {
        squadraIdx = c;
      }

      // Valore / Quotazione: Priorità a Qt.A (Quotazione Attuale) o FVM
      if (quotazioneIdx === -1 && (h === 'qt.a' || h === 'qt. a' || h === 'qt a' || h === 'qta' || h === 'qt. a m')) {
        quotazioneIdx = c;
      }
    }

    // Fallback quotazione: se non trovato Qt.A, cerca FVM, Valore o Prezzo
    if (quotazioneIdx === -1) {
      for (let c = 0; c < headerRow.length; c++) {
        const h = headerRow[c].toLowerCase();
        if (h === 'fvm' || h === 'fvm m' || h === 'quotazione' || h === 'quotazione attuale' || h === 'prezzo' || h === 'valore') {
          quotazioneIdx = c;
          break;
        }
      }
    }

    // Fallback se ruolo o nome non trovati esattamente
    if (ruoloIdx === -1) {
      ruoloIdx = headerRow.findIndex(h => /^r\b/i.test(h) || h.toLowerCase().includes('ruolo'));
    }
    if (nomeIdx === -1) {
      nomeIdx = headerRow.findIndex(h => h.toLowerCase().includes('nome'));
    }

    if (nomeIdx === -1) return [];

    // 4. Parsing Righe Calciatori
    const players = [];
    let playerCounter = 1;

    for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const nomeRaw = nomeIdx >= 0 ? String(row[nomeIdx] || '').trim() : '';
      if (!nomeRaw || nomeRaw.length < 2) continue;

      // Salta intestazioni ripetute o righe vuote
      if (nomeRaw.toUpperCase() === 'NOME' || nomeRaw.toUpperCase() === 'CALCIATORE') continue;

      const ruoloRaw = ruoloIdx >= 0 ? String(row[ruoloIdx] || '').trim() : '';
      const ruolo = this.normalizeRole(ruoloRaw);
      if (!ruolo) continue;

      const squadraRaw = squadraIdx >= 0 ? String(row[squadraIdx] || '').trim() : 'Svincolato';

      let quotazione = 1;
      if (quotazioneIdx >= 0 && row[quotazioneIdx] !== undefined && row[quotazioneIdx] !== '') {
        const rawVal = String(row[quotazioneIdx]).replace(',', '.').replace(/[^0-9.]/g, '');
        const parsedNum = parseFloat(rawVal);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          quotazione = Math.max(1, Math.round(parsedNum));
        }
      }

      const id = `p_${ruolo}_${playerCounter++}`;

      players.push({
        id: id,
        ruolo: ruolo,
        nome: nomeRaw,
        squadra: squadraRaw || 'Svincolato',
        // Quotazione e Prezzo Massimo Imposto sincronizzati con Qt.A / FVM
        quotazione: quotazione,
        prezzo_massimo_imposto: quotazione,
        prezzo_base: 0,
        // Fascia predefinita all'import: "3ª Fascia"
        fascia: '3ª Fascia',
        budget_consigliato_pct: '1%',
        stato: 'libero',
        proprietario_id: null,
        prezzo_acquisto: null
      });
    }

    return players;
  }

  /**
   * Parsa un file binario (ArrayBuffer) come Excel (.xlsx) o CSV tramite SheetJS
   */
  static parseArrayBuffer(arrayBuffer) {
    if (typeof XLSX !== 'undefined') {
      try {
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const players = this.parseWorkbook(workbook);
        if (players && players.length > 0) {
          return players;
        }
      } catch (err) {
        console.warn('Errore SheetJS su ArrayBuffer, fallback su testo:', err);
      }
    }

    // Fallback: prova decodifica testuale
    const text = new TextDecoder('utf-8').decode(arrayBuffer);
    return this.parse(text);
  }

  /**
   * Parsa un testo CSV (supporta sia il formato standard Fantacalcio sia il formato legacy con macro-sezioni)
   */
  static parse(csvText) {
    if (!csvText) return [];

    // Se SheetJS è disponibile, prova prima il parser del workbook
    if (typeof XLSX !== 'undefined') {
      try {
        const workbook = XLSX.read(csvText, { type: 'string' });
        const parsed = this.parseWorkbook(workbook);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fallback al parser CSV manuale
      }
    }

    // Rimuovi BOM se presente
    let cleanText = csvText;
    if (cleanText.charCodeAt(0) === 0xFEFF) {
      cleanText = cleanText.slice(1);
    }

    const lines = cleanText.split(/\r?\n/);
    const players = [];
    let currentRole = null;
    let playerCounter = 1;

    // Riconoscimento rapido se è un CSV con intestazioni standard nella prima riga
    const firstLine = lines[0] ? lines[0].trim() : '';
    const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
    const firstCols = firstLine.split(delimiter).map(c => c.trim().toLowerCase());

    const hasStandardHeaders = firstCols.some(c => c === 'nome' || c === 'calciatore') &&
      (firstCols.some(c => c === 'r' || c === 'ruolo') || firstCols.some(c => c === 'squadra'));

    if (hasStandardHeaders) {
      // Header offset scan manuale
      let headerIdx = 0;
      let rIdx = firstCols.findIndex(c => c === 'r' || c === 'ruolo');
      let nIdx = firstCols.findIndex(c => c === 'nome' || c === 'calciatore');
      let sIdx = firstCols.findIndex(c => c === 'squadra');
      let qIdx = firstCols.findIndex(c => c === 'qt.a' || c === 'qt. a' || c === 'qta' || c === 'fvm' || c === 'prezzo');

      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine) continue;
        const parts = this.parseCSVLine(rawLine);
        const nome = nIdx >= 0 ? parts[nIdx] : '';
        if (!nome || nome.toUpperCase() === 'NOME') continue;

        const ruolo = rIdx >= 0 ? this.normalizeRole(parts[rIdx]) : 'C';
        if (!ruolo) continue;

        const squadra = sIdx >= 0 && parts[sIdx] ? parts[sIdx] : 'Svincolato';
        const qRaw = qIdx >= 0 && parts[qIdx] ? parts[qIdx].replace(/[^0-9]/g, '') : '1';
        const quotazione = Math.max(1, parseInt(qRaw, 10) || 1);

        players.push({
          id: `p_${ruolo}_${playerCounter++}`,
          ruolo: ruolo,
          nome: nome,
          squadra: squadra,
          quotazione: quotazione,
          prezzo_massimo_imposto: quotazione,
          prezzo_base: 0,
          fascia: '3ª Fascia',
          budget_consigliato_pct: '1%',
          stato: 'libero',
          proprietario_id: null,
          prezzo_acquisto: null
        });
      }
      return players;
    }

    // Parser Legacy per macro-sezioni (PORTIERI, DIFENSORI, CENTROCAMPISTI, ATTACCANTI)
    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i].trim();
      if (!rawLine) continue;

      const upperLine = rawLine.toUpperCase();

      // Riconoscimento sezioni di ruolo
      if (!rawLine.includes(',') && !rawLine.includes(';')) {
        if (upperLine.startsWith('PORTIER')) {
          currentRole = 'P';
          continue;
        } else if (upperLine.startsWith('DIFENSOR')) {
          currentRole = 'D';
          continue;
        } else if (upperLine.startsWith('CENTROCAMPIST')) {
          currentRole = 'C';
          continue;
        } else if (upperLine.startsWith('ATTACCANT')) {
          currentRole = 'A';
          continue;
        }
      }

      // Salta intestazioni di blocco
      if (upperLine.startsWith('FASCIA') || (upperLine.includes('NOME') && upperLine.includes('PREZZO'))) {
        continue;
      }

      if (!currentRole) continue;

      const cols = this.parseCSVLine(rawLine);
      if (cols.length < 3) continue;

      // Header legacy: Fascia, Squadra, Nome, Prezzo
      const fasciaRaw = cols[0] || '3ª Fascia';
      const squadra = cols[1] || 'Svincolato';
      const nome = cols[2] || 'Sconosciuto';
      const prezzoRaw = cols[3] || '1';
      const prezzoMassimoImposto = Math.max(1, parseInt(prezzoRaw.replace(/[^0-9]/g, ''), 10) || 1);
      const budgetPct = cols[4] || '1%';

      const id = `p_${currentRole}_${playerCounter++}`;

      players.push({
        id: id,
        ruolo: currentRole,
        fascia: fasciaRaw,
        squadra: squadra,
        nome: nome,
        prezzo_base: 0,
        prezzo_massimo_imposto: prezzoMassimoImposto,
        quotazione: prezzoMassimoImposto,
        budget_consigliato_pct: budgetPct,
        stato: 'libero',
        proprietario_id: null,
        prezzo_acquisto: null
      });
    }

    return players;
  }

  /**
   * Carica automaticamente ./listone.csv
   */
  static async loadDefaultListone() {
    try {
      const response = await fetch('./listone.csv');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const text = await response.text();
      const players = this.parse(text);
      return players;
    } catch (err) {
      console.warn('Impossibile caricare ./listone.csv automaticamente:', err);
      return null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.ListoneParser = ListoneParser;
}
if (typeof module !== 'undefined') {
  module.exports = ListoneParser;
}
