/**
 * Parser del Listone CSV per Fantacalcio 2026/2027
 * Gestisce sezioni (PORTIERI, DIFENSORI, CENTROCAMPISTI, ATTACCANTI),
 * UTF-8 con o senza BOM, caratteri accentati e formati differenti.
 */

class ListoneParser {
  /**
   * Pulisce e divide una riga CSV gestendo eventuali apici
   */
  static parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
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
   * Parsa l'intero testo CSV e restituisce l'array strutturato dei giocatori
   */
  static parse(csvText) {
    if (!csvText) return [];

    // Rimuovi BOM se presente
    let cleanText = csvText;
    if (cleanText.charCodeAt(0) === 0xFEFF) {
      cleanText = cleanText.slice(1);
    }

    const lines = cleanText.split(/\r?\n/);
    const players = [];
    let currentRole = null;
    let playerCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i].trim();
      if (!rawLine) continue;

      const upperLine = rawLine.toUpperCase();

      // Riconoscimento sezioni di ruolo (solo su righe singole senza virgole)
      if (!rawLine.includes(',')) {
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

      // Salta intestazioni di blocco (es. Fascia,Squadra,Nome...)
      if (upperLine.startsWith('FASCIA') || (upperLine.includes('NOME') && upperLine.includes('PREZZO'))) {
        continue;
      }

      // Se non abbiamo ancora trovato un ruolo, ignora
      if (!currentRole) continue;

      // Parsing riga giocatore
      const cols = this.parseCSVLine(rawLine);
      if (cols.length < 3) continue;

      // Header: Fascia, Squadra, Nome, Prezzo, Budget_%, Integr., Titol.
      const fascia = cols[0] || 'Altro';
      const squadra = cols[1] || 'Svincolato';
      const nome = cols[2] || 'Sconosciuto';
      const prezzoRaw = cols[3] || '1';
      const prezzoMassimoImposto = Math.max(1, parseInt(prezzoRaw.replace(/[^0-9]/g, ''), 10) || 1);
      const budgetPct = cols[4] || '1%';
      const integrita = cols[5] || '100%';
      const titolarita = cols[6] || '100%';

      const id = `p_${currentRole}_${playerCounter++}`;

      players.push({
        id: id,
        ruolo: currentRole,
        fascia: fascia,
        squadra: squadra,
        nome: nome,
        prezzo_base: 0, // Prezzo base d'asta sempre a 0 crediti
        prezzo_massimo_imposto: prezzoMassimoImposto, // Budget target personale (segreto)
        budget_consigliato_pct: budgetPct,
        integrita: integrita,
        titolarita: titolarita,
        stato: 'libero',
        proprietario_id: null,
        prezzo_acquisto: null
      });
    }

    return players;
  }

  /**
   * Tenta il caricamento automatico da ./listone.csv
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
