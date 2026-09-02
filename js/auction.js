/**
 * Auction Engine per Asta Fantacalcio 2026/2027
 * Gestione regole d'asta, calcolo Offerta Massima con Formula Crediti di Riserva,
 * controllo saturazione ruoli, assegnazione, svincolo e Undo globale.
 */

class AuctionEngine {
  constructor(stateManager) {
    this.state = stateManager;
  }

  /**
   * Calcola il conteggio dei giocatori in rosa per ruolo per un dato manager
   */
  getManagerRosterCounts(managerId) {
    const manager = this.state.getManager(managerId);
    if (!manager) return { P: 0, D: 0, C: 0, A: 0, total: 0 };

    const counts = { P: 0, D: 0, C: 0, A: 0, total: 0 };
    (manager.roster || []).forEach(p => {
      if (counts[p.ruolo] !== undefined) {
        counts[p.ruolo]++;
      }
      counts.total++;
    });
    return counts;
  }

  /**
   * Calcola gli slot liberi rimanenti (per ruolo e totale) per un dato manager
   */
  getManagerFreeSlots(managerId) {
    const slots = this.state.getSlotsConfig();
    const counts = this.getManagerRosterCounts(managerId);

    const freeP = Math.max(0, slots.P - counts.P);
    const freeD = Math.max(0, slots.D - counts.D);
    const freeC = Math.max(0, slots.C - counts.C);
    const freeA = Math.max(0, slots.A - counts.A);
    const freeTotal = freeP + freeD + freeC + freeA;

    return {
      P: freeP,
      D: freeD,
      C: freeC,
      A: freeA,
      total: freeTotal
    };
  }

  /**
   * Calcola l'Offerta Massima permessa per un dato manager in tempo reale.
   * Formula Crediti di Riserva:
   * Offerta Massima = Crediti Residui - (Slot Liberi Rimanenti - 1)
   */
  calculateMaxBid(managerId) {
    const manager = this.state.getManager(managerId);
    if (!manager) return 0;

    const freeSlots = this.getManagerFreeSlots(managerId);
    const remainingBudget = this.state.getManagerRemainingCredits(managerId);

    // Se non ci sono più slot liberi, offerta massima è 0
    if (freeSlots.total <= 0) return 0;

    // Se c'è solo 1 slot rimasto, può spendere tutti i crediti residui
    if (freeSlots.total === 1) return Math.max(0, remainingBudget);

    // Altrimenti garantisci almeno 1 credito per ciascuno dei rimanenti (freeSlots.total - 1)
    const maxBid = remainingBudget - (freeSlots.total - 1);
    return Math.max(0, maxBid);
  }

  /**
   * Valida se un manager può acquistare un determinato giocatore al prezzo specificato
   * Ritorna: { allowed: boolean, reason?: string, maxBid: number }
   */
  validateBid(managerId, player, price) {
    const manager = this.state.getManager(managerId);
    if (!manager) {
      return { allowed: false, reason: 'Manager non trovato.', maxBid: 0 };
    }

    if (!player) {
      return { allowed: false, reason: 'Nessun giocatore selezionato.', maxBid: 0 };
    }

    if (player.stato === 'acquistato') {
      return { allowed: false, reason: `${player.nome} risulta già acquistato!`, maxBid: 0 };
    }

    const freeSlots = this.getManagerFreeSlots(managerId);
    const slotsConfig = this.state.getSlotsConfig();

    // 1. Controllo Saturazione Ruolo
    if (freeSlots[player.ruolo] <= 0) {
      return {
        allowed: false,
        reason: `${manager.name} ha già saturato gli slot per il ruolo ${player.ruolo} (${slotsConfig[player.ruolo]}/${slotsConfig[player.ruolo]}).`,
        maxBid: 0
      };
    }

    // 2. Controllo Rosa Completa
    if (freeSlots.total <= 0) {
      return {
        allowed: false,
        reason: `${manager.name} ha già completato la rosa (${slotsConfig.total} giocatori).`,
        maxBid: 0
      };
    }

    // 3. Controllo Prezzo Minimo
    const numPrice = parseInt(price, 10);
    if (isNaN(numPrice) || numPrice < 1) {
      return {
        allowed: false,
        reason: 'Il prezzo deve essere un numero intero maggiore o uguale a 1.',
        maxBid: this.calculateMaxBid(managerId)
      };
    }

    // 4. Controllo Formula Crediti di Riserva (Offerta Massima)
    const maxBid = this.calculateMaxBid(managerId);
    if (numPrice > maxBid) {
      const reserveCredits = freeSlots.total - 1;
      return {
        allowed: false,
        reason: `Offerta di ${numPrice} cr non permessa! ${manager.name} può offrire al massimo ${maxBid} cr (necessari ${reserveCredits} cr di riserva per completare i restanti ${reserveCredits} slot a 1 cr ciascuno).`,
        maxBid: maxBid
      };
    }

    return { allowed: true, maxBid: maxBid };
  }

  /**
   * Esegue l'assegnazione del giocatore al manager
   */
  assignPlayer(managerId, playerId, price) {
    const player = this.state.getPlayer(playerId);
    const manager = this.state.getManager(managerId);

    const validation = this.validateBid(managerId, player, price);
    if (!validation.allowed) {
      if (typeof window !== 'undefined' && window.soundEngine) window.soundEngine.playWarning();
      return { success: false, error: validation.reason };
    }

    const numPrice = parseInt(price, 10);

    // Aggiorna Giocatore
    player.stato = 'acquistato';
    player.proprietario_id = manager.id;
    player.prezzo_acquisto = numPrice;

    // Aggiorna Manager
    manager.spent = (manager.spent || 0) + numPrice;
    if (!manager.roster) manager.roster = [];
    manager.roster.push({
      id: player.id,
      nome: player.nome,
      ruolo: player.ruolo,
      squadra: player.squadra,
      fascia: player.fascia,
      prezzo_acquisto: numPrice,
      timestamp: new Date().toISOString()
    });

    // Registra nello storico
    const historyItem = {
      id: 'act_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'ACQUISTO',
      playerId: player.id,
      playerName: player.nome,
      playerRole: player.ruolo,
      playerTeam: player.squadra,
      managerId: manager.id,
      managerName: manager.name,
      price: numPrice,
      timestamp: new Date().toISOString()
    };
    this.state.addHistoryItem(historyItem);

    // Persistenza
    this.state.save();

    // Effetto Sonoro
    if (typeof window !== 'undefined' && window.soundEngine) {
      window.soundEngine.playGavel();
      setTimeout(() => window.soundEngine.playSuccess(), 120);
    }

    return { success: true, player, manager, price: numPrice };
  }

  /**
   * Svincola un giocatore da un manager riaccreditando il 100% dei crediti
   */
  releasePlayer(playerId) {
    const player = this.state.getPlayer(playerId);
    if (!player || player.stato !== 'acquistato') {
      return { success: false, error: 'Giocatore non trovato o non acquistato.' };
    }

    const manager = this.state.getManager(player.proprietario_id);
    const refundPrice = player.prezzo_acquisto || 0;

    if (manager) {
      manager.spent = Math.max(0, (manager.spent || 0) - refundPrice);
      manager.roster = (manager.roster || []).filter(p => p.id !== player.id);
    }

    // Registra nello storico
    const historyItem = {
      id: 'act_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'SVINCOLO',
      playerId: player.id,
      playerName: player.nome,
      playerRole: player.ruolo,
      playerTeam: player.squadra,
      managerId: manager ? manager.id : null,
      managerName: manager ? manager.name : 'Sconosciuto',
      price: refundPrice,
      timestamp: new Date().toISOString()
    };
    this.state.addHistoryItem(historyItem);

    // Resetta stato giocatore
    player.stato = 'libero';
    player.proprietario_id = null;
    player.prezzo_acquisto = null;

    // Persistenza
    this.state.save();

    return {
      success: true,
      player,
      managerName: manager ? manager.name : '',
      refundPrice
    };
  }

  /**
   * Annulla l'ultima azione registrata (Global Undo)
   */
  undoLastAction() {
    const history = this.state.getHistory();
    if (!history || history.length === 0) {
      return { success: false, error: 'Nessuna azione da annullare.' };
    }

    const lastAction = history[history.length - 1];

    if (lastAction.type === 'ACQUISTO') {
      const player = this.state.getPlayer(lastAction.playerId);
      const manager = this.state.getManager(lastAction.managerId);

      if (player) {
        player.stato = 'libero';
        player.proprietario_id = null;
        player.prezzo_acquisto = null;
      }

      if (manager) {
        manager.spent = Math.max(0, (manager.spent || 0) - (lastAction.price || 0));
        manager.roster = (manager.roster || []).filter(p => p.id !== lastAction.playerId);
      }

      this.state.popHistoryItem();
      this.state.save();

      return {
        success: true,
        actionType: 'ACQUISTO',
        message: `Annullato l'acquisto di ${lastAction.playerName} da parte di ${lastAction.managerName} (${lastAction.price} cr riaccreditati).`
      };
    } else if (lastAction.type === 'SVINCOLO') {
      const player = this.state.getPlayer(lastAction.playerId);
      const manager = this.state.getManager(lastAction.managerId);

      if (player && manager) {
        player.stato = 'acquistato';
        player.proprietario_id = manager.id;
        player.prezzo_acquisto = lastAction.price;

        manager.spent = (manager.spent || 0) + lastAction.price;
        if (!manager.roster) manager.roster = [];
        manager.roster.push({
          id: player.id,
          nome: player.nome,
          ruolo: player.ruolo,
          squadra: player.squadra,
          fascia: player.fascia,
          prezzo_acquisto: lastAction.price,
          timestamp: new Date().toISOString()
        });
      }

      this.state.popHistoryItem();
      this.state.save();

      return {
        success: true,
        actionType: 'SVINCOLO',
        message: `Ripristinato ${lastAction.playerName} nella rosa di ${lastAction.managerName}.`
      };
    }

    return { success: false, error: 'Tipo di azione non riconosciuto.' };
  }
}

if (typeof window !== 'undefined') {
  window.AuctionEngine = AuctionEngine;
}
if (typeof module !== 'undefined') {
  module.exports = AuctionEngine;
}
