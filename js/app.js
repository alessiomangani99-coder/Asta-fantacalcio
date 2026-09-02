/**
 * App Controller & State Manager per Asta Fantacalcio 2026/2027
 * Gestione dello stato globale, navigazione tab, filtri, eventi UI e persistenza.
 */

const STORAGE_KEY = 'ASTA_FANTACALCIO_26_27_V1';

class StateManager {
  constructor() {
    this.data = {
      league: {
        name: 'Lega Fantacalcio 2026/2027',
        initialBudget: 500,
        slots: { P: 3, D: 8, C: 8, A: 6 },
        totalSlots: 25
      },
      managers: [
        { id: 'mgr_1', name: 'FC Real Madrink', spent: 0, roster: [] },
        { id: 'mgr_2', name: 'Atletico MaNonTroppo', spent: 0, roster: [] },
        { id: 'mgr_3', name: 'Dinamo Losca', spent: 0, roster: [] },
        { id: 'mgr_4', name: 'Paris Saint-Gennar', spent: 0, roster: [] },
        { id: 'mgr_5', name: 'Borussia Dortmund', spent: 0, roster: [] },
        { id: 'mgr_6', name: 'AC Denti', spent: 0, roster: [] },
        { id: 'mgr_7', name: 'Scarsenal', spent: 0, roster: [] },
        { id: 'mgr_8', name: 'Bayer Leverduren', spent: 0, roster: [] }
      ],
      players: [],
      history: []
    };
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.league && Array.isArray(parsed.managers)) {
          this.data = parsed;
          // Migrazione automatica per Modalità Dati Segreti se necessario
          if (Array.isArray(this.data.players)) {
            this.data.players = this.data.players.map(p => {
              if (p.prezzo_massimo_imposto === undefined) {
                p.prezzo_massimo_imposto = p.prezzo_base || 1;
                p.prezzo_base = 0;
              }
              return p;
            });
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Errore lettura localStorage:', e);
    }
    return false;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Errore salvataggio localStorage:', e);
    }
  }

  resetAll(keepPlayers = true) {
    const defaultLeague = {
      name: 'Lega Fantacalcio 2026/2027',
      initialBudget: 500,
      slots: { P: 3, D: 8, C: 8, A: 6 },
      totalSlots: 25
    };

    const defaultManagers = [
      { id: 'mgr_1', name: 'FC Real Madrink', spent: 0, roster: [] },
      { id: 'mgr_2', name: 'Atletico MaNonTroppo', spent: 0, roster: [] },
      { id: 'mgr_3', name: 'Dinamo Losca', spent: 0, roster: [] },
      { id: 'mgr_4', name: 'Paris Saint-Gennar', spent: 0, roster: [] },
      { id: 'mgr_5', name: 'Borussia Dortmund', spent: 0, roster: [] },
      { id: 'mgr_6', name: 'AC Denti', spent: 0, roster: [] },
      { id: 'mgr_7', name: 'Scarsenal', spent: 0, roster: [] },
      { id: 'mgr_8', name: 'Bayer Leverduren', spent: 0, roster: [] }
    ];

    let players = this.data.players || [];
    if (keepPlayers) {
      players = players.map(p => ({
        ...p,
        stato: 'libero',
        proprietario_id: null,
        prezzo_acquisto: null
      }));
    } else {
      players = [];
    }

    this.data = {
      league: defaultLeague,
      managers: defaultManagers,
      players: players,
      history: []
    };
    this.save();
  }

  getLeagueConfig() {
    return this.data.league;
  }

  getSlotsConfig() {
    const s = this.data.league.slots || { P: 3, D: 8, C: 8, A: 6 };
    return {
      P: s.P,
      D: s.D,
      C: s.C,
      A: s.A,
      total: (s.P || 0) + (s.D || 0) + (s.C || 0) + (s.A || 0)
    };
  }

  getAllManagers() {
    return this.data.managers;
  }

  getManager(id) {
    return this.data.managers.find(m => m.id === id);
  }

  getManagerRemainingCredits(id) {
    const m = this.getManager(id);
    if (!m) return 0;
    return (this.data.league.initialBudget || 500) - (m.spent || 0);
  }

  getAllPlayers() {
    return this.data.players;
  }

  getPlayer(id) {
    return this.data.players.find(p => p.id === id);
  }

  setPlayers(players) {
    this.data.players = players;
    this.save();
  }

  getHistory() {
    return this.data.history;
  }

  addHistoryItem(item) {
    this.data.history.push(item);
  }

  popHistoryItem() {
    return this.data.history.pop();
  }

  getExportState() {
    return {
      exportTimestamp: new Date().toISOString(),
      version: '1.0',
      league: this.data.league,
      managers: this.data.managers,
      players: this.data.players,
      history: this.data.history
    };
  }

  loadFromJSON(jsonState) {
    this.data = {
      league: jsonState.league || this.data.league,
      managers: jsonState.managers || this.data.managers,
      players: jsonState.players || this.data.players,
      history: jsonState.history || []
    };
    this.save();
  }
}

// Controller Principale UI
class AppController {
  constructor() {
    this.state = new StateManager();
    this.auction = new AuctionEngine(this.state);
    this.exporter = new ExportManager(this.state);

    // Engine Calendario & Incroci Serie A 2026/2027
    this.calendarEngine = typeof CalendarEngine !== 'undefined'
      ? new CalendarEngine(window.CALENDARIO_SERIE_A, () => this.state.getAllPlayers())
      : null;
    this.calendarMode = 'focus'; // 'focus' | 'goalkeepers' | 'attackers' | 'ratings'
    this.calendarSelectedTeam = 'ALL';
    this.focusPivotTeam = 'Juventus';
    this.focusActiveTab = 'gk'; // 'gk' | 'att-pairs' | 'att-triplets'
    this.multiTeamFilter = null;
    this.antiSpyActive = true;

    // Filtri Sala d'Asta
    this.filters = {
      search: '',
      role: 'ALL',
      team: 'ALL',
      status: 'ALL', // 'ALL' | 'FREE' | 'BOUGHT'
      sort: 'prezzo-desc'
    };

    // Stato Battitore in corso
    this.currentAuctionPlayer = null;
    this.countdownInterval = null;
    this.countdownSeconds = 3;
  }

  async init() {
    const loadedFromStorage = this.state.load();

    // Se non ci sono giocatori in memoria, carica ./listone.csv oppure window.DEFAULT_PLAYERS
    if (!this.state.getAllPlayers() || this.state.getAllPlayers().length === 0) {
      let defaultPlayers = await ListoneParser.loadDefaultListone();
      if ((!defaultPlayers || defaultPlayers.length === 0) && window.DEFAULT_PLAYERS && window.DEFAULT_PLAYERS.length > 0) {
        defaultPlayers = JSON.parse(JSON.stringify(window.DEFAULT_PLAYERS));
      }
      if (defaultPlayers && defaultPlayers.length > 0) {
        this.state.setPlayers(defaultPlayers);
      }
    }

    this.bindEvents();
    this.populateTeamFilter();
    this.renderHeaderStats();
    this.renderAuctionList();
    this.renderTeamsBoard();
    this.renderHistory();
    this.renderCalendarSection();
    this.renderSettings();
  }

  bindEvents() {
    // Navigazione Tab
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Barra di Ricerca Listone
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.trim().toLowerCase();
        this.renderAuctionList();
      });
    }

    // Filtro Ruolo
    document.querySelectorAll('.role-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.role-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.role = btn.getAttribute('data-role');
        this.renderAuctionList();
      });
    });

    // Filtro Squadra
    const teamFilter = document.getElementById('team-filter');
    if (teamFilter) {
      teamFilter.addEventListener('change', (e) => {
        this.filters.team = e.target.value;
        this.renderAuctionList();
      });
    }

    // Filtro Stato
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.renderAuctionList();
      });
    }

    // Ordinamento
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.filters.sort = e.target.value;
        this.renderAuctionList();
      });
    }

    // Tasto Random Call ("Chiama a caso")
    const btnRandomCall = document.getElementById('btn-random-call');
    if (btnRandomCall) {
      btnRandomCall.addEventListener('click', () => this.callRandomPlayer());
    }

    // Tasto Undo Globale nell'header
    const btnGlobalUndo = document.getElementById('btn-global-undo');
    if (btnGlobalUndo) {
      btnGlobalUndo.addEventListener('click', () => this.handleUndo());
    }

    // Tasto Toggle Audio nell'header
    const btnToggleAudio = document.getElementById('btn-toggle-audio');
    if (btnToggleAudio) {
      btnToggleAudio.addEventListener('click', () => {
        if (window.soundEngine) {
          const isMuted = window.soundEngine.toggleMute();
          btnToggleAudio.innerHTML = isMuted ? '🔇 Muto' : '🔊 Audio ON';
          btnToggleAudio.classList.toggle('muted', isMuted);
        }
      });
    }

    // Modale Battitore: Controlli Prezzo
    const btnResetZero = document.getElementById('btn-reset-zero');
    if (btnResetZero) {
      btnResetZero.addEventListener('click', () => {
        const input = document.getElementById('bid-price-input');
        if (input) {
          input.value = 0;
          this.updateBidValidationMessage();
        }
      });
    }

    // Toggle Popover Dati Segreti Personali
    const btnSecret = document.getElementById('btn-secret-intel');
    const popoverSecret = document.getElementById('popover-secret-intel');
    if (btnSecret && popoverSecret) {
      btnSecret.addEventListener('click', (e) => {
        e.stopPropagation();
        popoverSecret.classList.toggle('hidden');
        btnSecret.classList.toggle('active', !popoverSecret.classList.contains('hidden'));
      });
    }

    const btnCloseSecret = document.getElementById('btn-close-secret-popover');
    if (btnCloseSecret && popoverSecret) {
      btnCloseSecret.addEventListener('click', (e) => {
        e.stopPropagation();
        popoverSecret.classList.add('hidden');
        if (btnSecret) btnSecret.classList.remove('active');
      });
    }

    // Toggle Anti-Spionaggio Tabella Listone
    const btnToggleSecret = document.getElementById('btn-toggle-secret-visibility');
    if (btnToggleSecret) {
      btnToggleSecret.addEventListener('click', () => {
        this.antiSpyActive = !this.antiSpyActive;
        const tableWrapper = document.querySelector('.table-responsive-wrapper');
        if (tableWrapper) {
          tableWrapper.classList.toggle('table-anti-spy-off', !this.antiSpyActive);
        }
        btnToggleSecret.textContent = this.antiSpyActive ? '🔒 Anti-Spionaggio: Attivo' : '👁️ Anti-Spionaggio: Disattivato';
        btnToggleSecret.classList.toggle('active', this.antiSpyActive);
      });
    }

    // Chiudi popover segreto su click esterno
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('popover-secret-intel');
      const btnSec = document.getElementById('btn-secret-intel');
      if (popover && !popover.classList.contains('hidden')) {
        if (!popover.contains(e.target) && (!btnSec || !btnSec.contains(e.target))) {
          popover.classList.add('hidden');
          if (btnSec) btnSec.classList.remove('active');
        }
      }
    });

    document.querySelectorAll('.btn-increment').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-val'), 10);
        const input = document.getElementById('bid-price-input');
        const current = parseInt(input.value, 10) || 0;
        input.value = Math.max(0, current + val);
        this.updateBidValidationMessage();
      });
    });

    const bidPriceInput = document.getElementById('bid-price-input');
    if (bidPriceInput) {
      bidPriceInput.addEventListener('input', () => this.updateBidValidationMessage());
    }

    const managerSelect = document.getElementById('bid-manager-select');
    if (managerSelect) {
      managerSelect.addEventListener('change', () => this.updateBidValidationMessage());
    }

    // Tasto Countdown Battitore
    const btnCountdown = document.getElementById('btn-start-countdown');
    if (btnCountdown) {
      btnCountdown.addEventListener('click', () => this.startCountdown());
    }

    // Tasto Conferma Assegnazione
    const btnConfirmBid = document.getElementById('btn-confirm-bid');
    if (btnConfirmBid) {
      btnConfirmBid.addEventListener('click', () => this.handleAssignBid());
    }

    // Tasto Chiudi Modale Battitore
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => this.closeAuctionModal());
    }

    // Drag & Drop Listone CSV
    this.setupCSVUpload();

    // Tasti Esportazione
    const btnExportPDF = document.getElementById('btn-export-pdf');
    if (btnExportPDF) {
      btnExportPDF.addEventListener('click', () => this.exporter.exportPDF());
    }

    const btnExportCSV = document.getElementById('btn-export-csv');
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', () => this.exporter.exportCSV());
    }

    const btnExportJSON = document.getElementById('btn-export-json');
    if (btnExportJSON) {
      btnExportJSON.addEventListener('click', () => this.exporter.exportJSONBackup());
    }

    const inputImportJSON = document.getElementById('input-import-json');
    if (inputImportJSON) {
      inputImportJSON.addEventListener('change', (e) => this.handleJSONImport(e));
    }

    // Salva Impostazioni Lega
    const formSettings = document.getElementById('form-league-settings');
    if (formSettings) {
      formSettings.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveLeagueSettings();
      });
    }

    // Tasto Aggiungi Manager
    const btnAddManager = document.getElementById('btn-add-manager');
    if (btnAddManager) {
      btnAddManager.addEventListener('click', () => this.handleAddManager());
    }

    // Tasto Reset Asta
    const btnResetAuction = document.getElementById('btn-reset-auction');
    if (btnResetAuction) {
      btnResetAuction.addEventListener('click', () => this.confirmResetAuction());
    }

    // Controlli Sezione Calendario
    document.querySelectorAll('.cal-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cal-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.calendarMode = btn.getAttribute('data-mode');

        const filterBar = document.getElementById('calendar-filter-bar');
        if (filterBar) {
          filterBar.style.display = (this.calendarMode === 'ratings' || this.calendarMode === 'focus') ? 'none' : 'block';
        }

        const viewFocus = document.getElementById('view-cal-focus');
        const viewGk = document.getElementById('view-cal-goalkeepers');
        const viewAtt = document.getElementById('view-cal-attackers');
        const viewRat = document.getElementById('view-cal-ratings');

        if (viewFocus) viewFocus.classList.toggle('hidden', this.calendarMode !== 'focus');
        if (viewGk) viewGk.classList.toggle('hidden', this.calendarMode !== 'goalkeepers');
        if (viewAtt) viewAtt.classList.toggle('hidden', this.calendarMode !== 'attackers');
        if (viewRat) viewRat.classList.toggle('hidden', this.calendarMode !== 'ratings');

        if (this.calendarMode === 'focus') {
          this.renderFocusSection();
        } else if (this.calendarMode === 'ratings') {
          this.renderTeamRatingsGrid();
        } else {
          this.renderCalendarTables();
        }
      });
    });

    // Sub-tab Focus Squadra (Portieri, Attaccanti Coppie, Attaccanti Tris)
    document.querySelectorAll('.focus-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.focus-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.focusActiveTab = btn.getAttribute('data-focus-tab');

        const viewGk = document.getElementById('focus-tab-view-gk');
        const viewAttPairs = document.getElementById('focus-tab-view-att-pairs');
        const viewAttTriplets = document.getElementById('focus-tab-view-att-triplets');

        if (viewGk) viewGk.classList.toggle('hidden', this.focusActiveTab !== 'gk');
        if (viewAttPairs) viewAttPairs.classList.toggle('hidden', this.focusActiveTab !== 'att-pairs');
        if (viewAttTriplets) viewAttTriplets.classList.toggle('hidden', this.focusActiveTab !== 'att-triplets');

        if (this.focusActiveTab === 'gk') this.renderFocusGkTable();
        else if (this.focusActiveTab === 'att-pairs') this.renderFocusAttPairsTable();
        else if (this.focusActiveTab === 'att-triplets') this.renderFocusAttTripletsTable();
      });
    });

    const focusSelect = document.getElementById('focus-pivot-team-select');
    if (focusSelect) {
      focusSelect.addEventListener('change', (e) => {
        this.focusPivotTeam = e.target.value;
        this.renderFocusSection();
      });
    }

    const btnModalFocus = document.getElementById('btn-modal-open-focus');
    if (btnModalFocus) {
      btnModalFocus.addEventListener('click', () => {
        if (this.currentAuctionPlayer) {
          this.openFocusTeam(this.currentAuctionPlayer.squadra);
        }
      });
    }

    const calTeamFilter = document.getElementById('calendar-team-filter');
    if (calTeamFilter) {
      calTeamFilter.addEventListener('change', (e) => {
        this.calendarSelectedTeam = e.target.value;
        this.renderCalendarTables();
      });
    }

    const btnResetRatings = document.getElementById('btn-reset-team-ratings');
    if (btnResetRatings) {
      btnResetRatings.addEventListener('click', () => {
        if (this.calendarEngine) {
          this.calendarEngine.resetRatings();
          this.renderTeamRatingsGrid();
          this.renderCalendarTables();
          this.showToast('Valutazioni squadre ripristinate ai valori predefiniti!', 'info');
        }
      });
    }

    // Scorciatoie da tastiera
    document.addEventListener('keydown', (e) => {
      // Se il popover segreto è aperto, ESC chiude prima quello
      const popover = document.getElementById('popover-secret-intel');
      if (popover && !popover.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          e.stopPropagation();
          popover.classList.add('hidden');
          const btnSec = document.getElementById('btn-secret-intel');
          if (btnSec) btnSec.classList.remove('active');
          return;
        }
      }

      const modal = document.getElementById('modal-battitore');
      if (modal && !modal.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          this.closeAuctionModal();
        } else if (e.key === 'Enter' && !e.shiftKey) {
          // Se siamo in un input diverso, conferma
          e.preventDefault();
          this.handleAssignBid();
        }
      }
    });
  }

  switchTab(tabId) {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('hidden', view.id !== `tab-${tabId}`);
    });

    // Renderizza la vista attiva
    if (tabId === 'auction') this.renderAuctionList();
    if (tabId === 'teams') this.renderTeamsBoard();
    if (tabId === 'history') this.renderHistory();
    if (tabId === 'calendar') this.renderCalendarSection();
    if (tabId === 'settings') this.renderSettings();
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">${message}</div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  populateTeamFilter() {
    const teamFilter = document.getElementById('team-filter');
    if (!teamFilter) return;

    const players = this.state.getAllPlayers();
    const teams = [...new Set(players.map(p => p.squadra))].filter(Boolean).sort();

    let optionsHtml = '<option value="ALL">Tutte le Squadre</option>';
    teams.forEach(t => {
      optionsHtml += `<option value="${t}">${t}</option>`;
    });
    teamFilter.innerHTML = optionsHtml;
  }

  renderHeaderStats() {
    const league = this.state.getLeagueConfig();
    const managers = this.state.getAllManagers();
    const players = this.state.getAllPlayers();
    const slotsConfig = this.state.getSlotsConfig();

    const titleElem = document.getElementById('header-league-title');
    if (titleElem) titleElem.textContent = league.name;

    const totalAssigned = players.filter(p => p.stato === 'acquistato').length;
    const totalSlotsLeague = managers.length * slotsConfig.total;
    const totalBudgetLeague = managers.length * (league.initialBudget || 500);
    const totalSpentLeague = managers.reduce((acc, m) => acc + (m.spent || 0), 0);

    const statAssigned = document.getElementById('stat-total-assigned');
    if (statAssigned) statAssigned.textContent = `${totalAssigned}/${totalSlotsLeague}`;

    const statBudget = document.getElementById('stat-total-budget');
    if (statBudget) statBudget.textContent = `${totalBudgetLeague - totalSpentLeague} / ${totalBudgetLeague} cr`;

    // Giocatore più pagato finora
    const boughtPlayers = players.filter(p => p.stato === 'acquistato' && p.prezzo_acquisto);
    const statTopPlayer = document.getElementById('stat-top-player');
    if (statTopPlayer) {
      if (boughtPlayers.length > 0) {
        const top = boughtPlayers.reduce((max, p) => (p.prezzo_acquisto > max.prezzo_acquisto ? p : max), boughtPlayers[0]);
        statTopPlayer.textContent = `${top.nome} (${top.prezzo_acquisto} cr)`;
      } else {
        statTopPlayer.textContent = '-';
      }
    }
  }

  getFilteredPlayers() {
    const all = this.state.getAllPlayers() || [];
    const { search, role, team, status, sort } = this.filters;

    return all.filter(p => {
      // Filtro Ruolo
      if (role !== 'ALL' && p.ruolo !== role) return false;

      // Filtro Squadra Singolo
      if (team !== 'ALL' && p.squadra !== team) return false;

      // Filtro Multi-Squadra Rapido (da Incroci Calendario)
      if (this.multiTeamFilter && this.multiTeamFilter.length > 0) {
        if (!this.multiTeamFilter.includes(p.squadra)) return false;
      }

      // Filtro Stato
      if (status === 'FREE' && p.stato !== 'libero') return false;
      if (status === 'BOUGHT' && p.stato !== 'acquistato') return false;

      // Filtro Ricerca Full-Text
      if (search) {
        const text = `${p.nome} ${p.squadra} ${p.fascia}`.toLowerCase();
        if (!text.includes(search)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sort === 'prezzo-desc') return (b.prezzo_massimo_imposto || 0) - (a.prezzo_massimo_imposto || 0);
      if (sort === 'prezzo-asc') return (a.prezzo_massimo_imposto || 0) - (b.prezzo_massimo_imposto || 0);
      if (sort === 'titolarita-desc') {
        const tA = parseInt(a.titolarita) || 0;
        const tB = parseInt(b.titolarita) || 0;
        return tB - tA;
      }
      if (sort === 'nome-asc') return a.nome.localeCompare(b.nome);
      if (sort === 'squadra-asc') return a.squadra.localeCompare(b.squadra);
      return 0;
    });
  }

  renderAuctionList() {
    const container = document.getElementById('players-table-body');
    const counterElem = document.getElementById('players-count-label');
    if (!container) return;

    // Gestione Banner Filtro Multi-Squadra
    const multiBanner = document.getElementById('active-multiteam-filter-banner');
    if (multiBanner) {
      if (this.multiTeamFilter && this.multiTeamFilter.length > 0) {
        multiBanner.classList.remove('hidden');
        multiBanner.innerHTML = `
          <span>🎯 Filtro Squadre Attivo: <strong>${this.multiTeamFilter.join(', ')}</strong></span>
          <button type="button" class="btn-clear-multiteam" onclick="window.app.clearMultiTeamFilter()" title="Rimuovi filtro squadre">✕ Rimuovi</button>
        `;
      } else {
        multiBanner.classList.add('hidden');
      }
    }

    const filtered = this.getFilteredPlayers();
    if (counterElem) {
      counterElem.textContent = `${filtered.length} calciatori trovati`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="9" class="empty-state">
            Nessun calciatore trovato con i filtri selezionati.
          </td>
        </tr>
      `;
      return;
    }

    // Genera righe HTML
    let html = '';
    filtered.forEach(player => {
      const isAcquistato = player.stato === 'acquistato';
      const owner = isAcquistato ? this.state.getManager(player.proprietario_id) : null;

      // Badge Titolarità e Integrità
      const titNum = parseInt(player.titolarita, 10) || 0;
      const intNum = parseInt(player.integrita, 10) || 0;

      const titClass = titNum >= 80 ? 'badge-stat-green' : titNum >= 50 ? 'badge-stat-orange' : 'badge-stat-red';
      const intClass = intNum >= 80 ? 'badge-stat-green' : intNum >= 50 ? 'badge-stat-orange' : 'badge-stat-red';

      html += `
        <tr class="player-row ${isAcquistato ? 'row-acquired' : ''}" data-id="${player.id}">
          <td class="col-role">
            <span class="role-pill role-${player.ruolo}">${player.ruolo}</span>
          </td>
          <td class="col-name">
            <div class="player-name-cell">
              <span class="player-name">${player.nome}</span>
              <span class="player-fascia secret-mask" title="Fascia segreta">${player.fascia || ''}</span>
            </div>
          </td>
          <td class="col-team">
            <span class="team-badge">${player.squadra}</span>
          </td>
          <td class="col-price">
            <span class="price-value" style="color: #60a5fa; font-size: 0.95rem;">0 <small>cr (base)</small></span>
          </td>
          <td class="col-secret-max">
            <span class="secret-mask price-value" title="Il tuo Prezzo Massimo Imposto">${player.prezzo_massimo_imposto || 1} <small>cr</small></span>
          </td>
          <td class="col-stat">
            <span class="secret-mask stat-badge ${intClass}" title="Integrità">${player.integrita || '-'}</span>
          </td>
          <td class="col-stat">
            <span class="secret-mask stat-badge ${titClass}" title="Titolarità">${player.titolarita || '-'}</span>
          </td>
          <td class="col-status">
            ${isAcquistato
              ? `<span class="status-badge status-acquired">
                  Acquistato da <strong>${owner ? owner.name : 'Manager'}</strong> (${player.prezzo_acquisto} cr)
                 </span>`
              : `<span class="status-badge status-free">Libero</span>`
            }
          </td>
          <td class="col-action">
            ${isAcquistato
              ? `<button class="btn-action btn-sm btn-outline-danger" onclick="window.app.handleRelease('${player.id}')">
                   Svincola
                 </button>`
              : `<button class="btn-action btn-sm btn-primary-action" onclick="window.app.openAuctionModal('${player.id}')">
                   Chiama 🔨
                 </button>`
            }
          </td>
        </tr>
      `;
    });

    container.innerHTML = html;
  }

  renderTeamsBoard() {
    const grid = document.getElementById('teams-grid');
    if (!grid) return;

    const managers = this.state.getAllManagers();
    const league = this.state.getLeagueConfig();
    const slotsConfig = this.state.getSlotsConfig();

    let html = '';
    managers.forEach(m => {
      const roster = m.roster || [];
      const spent = m.spent || 0;
      const remaining = (league.initialBudget || 500) - spent;
      const maxBid = this.auction.calculateMaxBid(m.id);
      const freeSlots = this.auction.getManagerFreeSlots(m.id);
      const counts = this.auction.getManagerRosterCounts(m.id);

      const progressPct = Math.min(100, Math.round((roster.length / slotsConfig.total) * 100));

      // Ordinamento roster
      const roleOrder = { P: 1, D: 2, C: 3, A: 4 };
      const sortedRoster = [...roster].sort((a, b) => {
        const diff = (roleOrder[a.ruolo] || 99) - (roleOrder[b.ruolo] || 99);
        if (diff !== 0) return diff;
        return (b.prezzo_acquisto || 0) - (a.prezzo_acquisto || 0);
      });

      html += `
        <div class="manager-card" id="card-${m.id}">
          <div class="manager-card-header">
            <div class="manager-info">
              <h3 class="manager-title">${m.name}</h3>
              <div class="manager-progress-text">${roster.length}/${slotsConfig.total} giocatori</div>
            </div>
            <div class="manager-max-bid">
              <span class="max-bid-label">Max Offerta:</span>
              <span class="max-bid-val">${maxBid} cr</span>
            </div>
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
          </div>

          <div class="manager-stats-row">
            <div class="stat-box">
              <span class="label">Crediti Residui</span>
              <span class="val text-success">${remaining} cr</span>
            </div>
            <div class="stat-box">
              <span class="label">Spesi</span>
              <span class="val text-muted">${spent} cr</span>
            </div>
            <div class="stat-box">
              <span class="label">Slot Liberi</span>
              <span class="val">${freeSlots.total}</span>
            </div>
          </div>

          <div class="role-slots-indicators">
            <span class="slot-pill ${counts.P >= slotsConfig.P ? 'pill-full' : ''}">
              <strong class="role-p">P:</strong> ${counts.P}/${slotsConfig.P}
            </span>
            <span class="slot-pill ${counts.D >= slotsConfig.D ? 'pill-full' : ''}">
              <strong class="role-d">D:</strong> ${counts.D}/${slotsConfig.D}
            </span>
            <span class="slot-pill ${counts.C >= slotsConfig.C ? 'pill-full' : ''}">
              <strong class="role-c">C:</strong> ${counts.C}/${slotsConfig.C}
            </span>
            <span class="slot-pill ${counts.A >= slotsConfig.A ? 'pill-full' : ''}">
              <strong class="role-a">A:</strong> ${counts.A}/${slotsConfig.A}
            </span>
          </div>

          <div class="manager-roster-section">
            <div class="roster-header">Rosa Calciatori (${roster.length})</div>
            <div class="roster-list-scroll">
              ${sortedRoster.length === 0
                ? `<div class="roster-empty">Nessun acquisto ancora effettuato.</div>`
                : sortedRoster.map(p => `
                    <div class="roster-player-item">
                      <span class="role-mini-pill role-${p.ruolo}">${p.ruolo}</span>
                      <span class="r-name">${p.nome}</span>
                      <span class="r-team">${p.squadra}</span>
                      <span class="r-price">${p.prezzo_acquisto} cr</span>
                      <button class="btn-mini-release" title="Svincola giocatore" onclick="window.app.handleRelease('${p.id}')">✕</button>
                    </div>
                  `).join('')
              }
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  renderHistory() {
    const container = document.getElementById('history-table-body');
    const badgeCount = document.getElementById('history-count-badge');
    if (!container) return;

    const history = this.state.getHistory();
    if (badgeCount) badgeCount.textContent = history.length;

    if (history.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            Nessuna chiamata effettuata finora. Inizia l'asta dalla sezione Listone!
          </td>
        </tr>
      `;
      return;
    }

    // Ordine cronologico inverso
    const reversed = [...history].reverse();
    let html = '';

    reversed.forEach((act, idx) => {
      const timeStr = act.timestamp ? new Date(act.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';
      const isAcquisto = act.type === 'ACQUISTO';

      html += `
        <tr class="${idx === 0 ? 'row-latest-history' : ''}">
          <td class="text-muted"><small>${timeStr}</small></td>
          <td>
            <span class="badge-history ${isAcquisto ? 'hist-buy' : 'hist-release'}">
              ${isAcquisto ? 'ACQUISTO' : 'SVINCOLO'}
            </span>
          </td>
          <td>
            <span class="role-pill role-${act.playerRole}">${act.playerRole}</span>
          </td>
          <td class="font-bold">${act.playerName}</td>
          <td><span class="team-badge">${act.playerTeam || '-'}</span></td>
          <td class="font-semibold ${isAcquisto ? 'text-primary' : 'text-danger'}">${act.managerName}</td>
          <td class="font-bold text-accent">${act.price} cr</td>
        </tr>
      `;
    });

    container.innerHTML = html;
  }

  renderSettings() {
    const league = this.state.getLeagueConfig();
    const slots = this.state.getSlotsConfig();
    const managers = this.state.getAllManagers();

    const nameInput = document.getElementById('setting-league-name');
    if (nameInput) nameInput.value = league.name || '';

    const budgetInput = document.getElementById('setting-initial-budget');
    if (budgetInput) budgetInput.value = league.initialBudget || 500;

    const slotP = document.getElementById('setting-slot-p');
    if (slotP) slotP.value = slots.P || 3;
    const slotD = document.getElementById('setting-slot-d');
    if (slotD) slotD.value = slots.D || 8;
    const slotC = document.getElementById('setting-slot-c');
    if (slotC) slotC.value = slots.C || 8;
    const slotA = document.getElementById('setting-slot-a');
    if (slotA) slotA.value = slots.A || 6;

    // Lista Manager
    const managersListElem = document.getElementById('settings-managers-list');
    if (managersListElem) {
      let html = '';
      managers.forEach((m, idx) => {
        html += `
          <div class="manager-setting-row" data-id="${m.id}">
            <span class="mgr-num">#${idx + 1}</span>
            <input type="text" class="input-mgr-name" value="${m.name}" data-id="${m.id}">
            <span class="mgr-roster-count text-muted">${(m.roster || []).length} giocatori</span>
            <button type="button" class="btn-remove-mgr" onclick="window.app.handleDeleteManager('${m.id}')">Rimuovi</button>
          </div>
        `;
      });
      managersListElem.innerHTML = html;
    }
  }

  // APERTURA MODALE BATTITORE
  openAuctionModal(playerId) {
    const player = this.state.getPlayer(playerId);
    if (!player) return;

    this.currentAuctionPlayer = player;

    // Popola dettagli giocatore nel modale
    const roleBadge = document.getElementById('modal-player-role');
    if (roleBadge) {
      roleBadge.textContent = player.ruolo;
      roleBadge.className = `role-pill role-${player.ruolo}`;
    }

    const nameElem = document.getElementById('modal-player-name');
    if (nameElem) nameElem.textContent = player.nome;

    const teamElem = document.getElementById('modal-player-team');
    if (teamElem) teamElem.textContent = player.squadra;

    // Popola dati segreti riservati nel popover discreto
    const secretMaxElem = document.getElementById('secret-max-price');
    if (secretMaxElem) secretMaxElem.textContent = `${player.prezzo_massimo_imposto || 1} cr`;

    const secretTitElem = document.getElementById('secret-titolarita');
    if (secretTitElem) secretTitElem.textContent = player.titolarita || '-';

    const secretIntElem = document.getElementById('secret-integrita');
    if (secretIntElem) secretIntElem.textContent = player.integrita || '-';

    const secretBudgetElem = document.getElementById('secret-budget-pct');
    if (secretBudgetElem) secretBudgetElem.textContent = player.budget_consigliato_pct || '-';

    const secretFasciaElem = document.getElementById('secret-fascia');
    if (secretFasciaElem) secretFasciaElem.textContent = player.fascia || 'Generale';

    const secretWarnElem = document.getElementById('secret-overbid-warn');
    if (secretWarnElem) secretWarnElem.classList.add('hidden');

    // Assicura che il popover segreto sia chiuso di default
    const popoverSecret = document.getElementById('popover-secret-intel');
    if (popoverSecret) popoverSecret.classList.add('hidden');
    const btnSecret = document.getElementById('btn-secret-intel');
    if (btnSecret) btnSecret.classList.remove('active');

    // Popola select manager
    const managerSelect = document.getElementById('bid-manager-select');
    if (managerSelect) {
      const managers = this.state.getAllManagers();
      const slotsConfig = this.state.getSlotsConfig();

      let optionsHtml = '<option value="">-- Seleziona il Manager Acquirente --</option>';
      managers.forEach(m => {
        const counts = this.auction.getManagerRosterCounts(m.id);
        const freeSlots = this.auction.getManagerFreeSlots(m.id);
        const maxBid = this.auction.calculateMaxBid(m.id);
        const isRoleFull = freeSlots[player.ruolo] <= 0;
        const isTeamFull = freeSlots.total <= 0;

        let statusText = '';
        if (isTeamFull) statusText = ' [ROSA PIENA]';
        else if (isRoleFull) statusText = ` [RUOLO ${player.ruolo} SATURO ${counts[player.ruolo]}/${slotsConfig[player.ruolo]}]`;
        else statusText = ` (Max: ${maxBid} cr | Residui: ${this.state.getManagerRemainingCredits(m.id)} cr)`;

        const disabledAttr = (isRoleFull || isTeamFull || maxBid < 1) ? 'disabled' : '';

        optionsHtml += `<option value="${m.id}" ${disabledAttr}>${m.name}${statusText}</option>`;
      });
      managerSelect.innerHTML = optionsHtml;
    }

    // Inizializza input prezzo a 0 (prezzo base d'asta sempre a 0 di default)
    const priceInput = document.getElementById('bid-price-input');
    if (priceInput) {
      priceInput.value = 0;
    }

    // Suggeritore Dinamico Incroci Calendario nel Battitore (per P e A)
    const recommenderBox = document.getElementById('modal-calendar-recommender');
    const recRoleName = document.getElementById('rec-role-name');
    const recContainer = document.getElementById('rec-partners-container');

    if (recommenderBox && this.calendarEngine) {
      if (player.ruolo === 'P' || player.ruolo === 'A') {
        recommenderBox.classList.remove('hidden');
        if (recRoleName) recRoleName.textContent = player.ruolo === 'P' ? 'Portieri' : 'Attaccanti';

        const partners = this.calendarEngine.getBestPartnersForTeam(player.squadra, player.ruolo, 4);
        let recHtml = '';

        partners.forEach(partner => {
          const firstPlayer = partner.players && partner.players[0] ? partner.players[0].nome : '';
          const metricTxt = player.ruolo === 'P'
            ? `Diff: ${partner.indiceMedio}`
            : `${partner.softMatchdaysCount}/38 fav.`;

          recHtml += `
            <div class="rec-partner-card">
              <div class="rec-partner-top">
                <span class="rec-partner-team">${partner.partnerTeam}</span>
                <span class="rec-partner-metric">${metricTxt}</span>
              </div>
              <div class="rec-partner-player" title="${firstPlayer || 'N.D.'}">
                ${firstPlayer ? (player.ruolo === 'P' ? '🧤 ' : '⚡ ') + firstPlayer : ''}
              </div>
            </div>
          `;
        });

        if (recContainer) recContainer.innerHTML = recHtml;
      } else {
        recommenderBox.classList.add('hidden');
      }
    }

    // Reset countdown
    this.resetCountdown();

    this.updateBidValidationMessage();

    // Mostra modale
    const modal = document.getElementById('modal-battitore');
    if (modal) modal.classList.remove('hidden');
  }

  closeAuctionModal() {
    const modal = document.getElementById('modal-battitore');
    if (modal) modal.classList.add('hidden');
    const popoverSecret = document.getElementById('popover-secret-intel');
    if (popoverSecret) popoverSecret.classList.add('hidden');
    const btnSecret = document.getElementById('btn-secret-intel');
    if (btnSecret) btnSecret.classList.remove('active');
    this.currentAuctionPlayer = null;
    this.resetCountdown();
  }

  updateBidValidationMessage() {
    const msgBox = document.getElementById('bid-validation-msg');
    const confirmBtn = document.getElementById('btn-confirm-bid');
    const managerSelect = document.getElementById('bid-manager-select');
    const priceInput = document.getElementById('bid-price-input');

    if (!msgBox || !this.currentAuctionPlayer) return;

    const managerId = managerSelect ? managerSelect.value : null;
    const price = priceInput ? parseInt(priceInput.value, 10) : 0;

    // Controllo discreto su superamento del Max Imposto personale
    const secretWarnElem = document.getElementById('secret-overbid-warn');
    if (secretWarnElem) {
      const maxTarget = this.currentAuctionPlayer.prezzo_massimo_imposto || 0;
      if (price > maxTarget && maxTarget > 0) {
        secretWarnElem.textContent = `⚠️ L'offerta di ${price} cr supera il tuo Max Imposto (${maxTarget} cr)!`;
        secretWarnElem.classList.remove('hidden');
      } else {
        secretWarnElem.classList.add('hidden');
      }
    }

    if (!managerId) {
      msgBox.className = 'validation-msg-box msg-neutral';
      msgBox.innerHTML = 'ℹ️ Seleziona un manager per verificare offerta e crediti disponibili.';
      if (confirmBtn) confirmBtn.disabled = true;
      return;
    }

    // Se l'offerta è 0, richiedi almeno 1 credito per aggiudicare
    if (price < 1) {
      msgBox.className = 'validation-msg-box msg-neutral';
      msgBox.innerHTML = 'ℹ️ Offerta corrente: <strong>0 cr</strong>. Per aggiudicare il calciatore seleziona almeno <strong>1 credito</strong>.';
      if (confirmBtn) confirmBtn.disabled = true;
      return;
    }

    const validation = this.auction.validateBid(managerId, this.currentAuctionPlayer, price);

    if (validation.allowed) {
      msgBox.className = 'validation-msg-box msg-success';
      msgBox.innerHTML = `✅ Offerta valida! Offerta massima consentita: <strong>${validation.maxBid} cr</strong>.`;
      if (confirmBtn) confirmBtn.disabled = false;
    } else {
      msgBox.className = 'validation-msg-box msg-error';
      msgBox.innerHTML = `⛔ ${validation.reason}`;
      if (confirmBtn) confirmBtn.disabled = true;
    }
  }

  startCountdown() {
    const btnCountdown = document.getElementById('btn-start-countdown');
    const countdownDisplay = document.getElementById('countdown-display');
    if (!btnCountdown || !countdownDisplay) return;

    if (this.countdownInterval) {
      this.resetCountdown();
      return;
    }

    this.countdownSeconds = 3;
    btnCountdown.textContent = '⏹ Ferma';
    countdownDisplay.classList.remove('hidden');
    countdownDisplay.textContent = this.countdownSeconds;

    if (window.soundEngine) window.soundEngine.playTick();

    this.countdownInterval = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds > 0) {
        countdownDisplay.textContent = this.countdownSeconds;
        if (window.soundEngine) window.soundEngine.playTick();
      } else {
        countdownDisplay.textContent = 'AGGIUDICATO!';
        if (window.soundEngine) window.soundEngine.playGavel();
        this.resetCountdown();
      }
    }, 1000);
  }

  resetCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    const btnCountdown = document.getElementById('btn-start-countdown');
    const countdownDisplay = document.getElementById('countdown-display');
    if (btnCountdown) btnCountdown.textContent = '⏱ 3.. 2.. 1..';
    if (countdownDisplay) countdownDisplay.classList.add('hidden');
  }

  handleAssignBid() {
    if (!this.currentAuctionPlayer) return;

    const managerSelect = document.getElementById('bid-manager-select');
    const priceInput = document.getElementById('bid-price-input');

    const managerId = managerSelect ? managerSelect.value : null;
    const price = priceInput ? parseInt(priceInput.value, 10) : 0;

    if (price < 1) {
      this.showToast('L\'offerta minima per aggiudicare un calciatore è di 1 credito.', 'warning');
      return;
    }

    const result = this.auction.assignPlayer(managerId, this.currentAuctionPlayer.id, price);

    if (result.success) {
      this.showToast(`🎉 ${result.player.nome} assegnato a ${result.manager.name} per ${result.price} cr!`, 'success');
      this.closeAuctionModal();
      this.renderHeaderStats();
      this.renderAuctionList();
      this.renderTeamsBoard();
      this.renderHistory();
    } else {
      this.showToast(`Errore: ${result.error}`, 'error');
    }
  }

  showConfirmModal(title, message, icon = '⚠️') {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal-confirm');
      const titleElem = document.getElementById('confirm-modal-title');
      const msgElem = document.getElementById('confirm-modal-message');
      const iconElem = document.getElementById('confirm-modal-icon');
      const btnOk = document.getElementById('btn-ok-confirm');
      const btnCancel = document.getElementById('btn-cancel-confirm');
      const btnClose = document.getElementById('btn-close-confirm');

      if (!modal) {
        resolve(confirm(message));
        return;
      }

      if (titleElem) titleElem.textContent = title;
      if (msgElem) msgElem.innerHTML = message.replace(/\n/g, '<br>');
      if (iconElem) iconElem.textContent = icon;

      const cleanup = (result) => {
        modal.classList.add('hidden');
        btnOk.onclick = null;
        btnCancel.onclick = null;
        if (btnClose) btnClose.onclick = null;
        resolve(result);
      };

      btnOk.onclick = () => cleanup(true);
      btnCancel.onclick = () => cleanup(false);
      if (btnClose) btnClose.onclick = () => cleanup(false);

      modal.classList.remove('hidden');
    });
  }

  async handleRelease(playerId) {
    const player = this.state.getPlayer(playerId);
    if (!player) return;

    const confirmMsg = `Vuoi davvero svincolare <strong>${player.nome}</strong> (${player.squadra})?<br>Verranno riaccreditati <strong>${player.prezzo_acquisto || 0} crediti</strong> al manager.`;
    const confirmed = await this.showConfirmModal('Conferma Svincolo', confirmMsg, '🔄');
    if (!confirmed) return;

    const result = this.auction.releasePlayer(playerId);
    if (result.success) {
      this.showToast(`Svincolato ${player.nome} (${result.refundPrice} cr riaccreditati a ${result.managerName}).`, 'info');
      this.renderHeaderStats();
      this.renderAuctionList();
      this.renderTeamsBoard();
      this.renderHistory();
    } else {
      this.showToast(`Errore: ${result.error}`, 'error');
    }
  }

  async handleUndo() {
    const history = this.state.getHistory();
    if (!history || history.length === 0) {
      this.showToast('Nessuna operazione da annullare nello storico.', 'warning');
      return;
    }

    const lastAction = history[history.length - 1];
    const confirmMsg = `Confermi di voler annullare l'ultima operazione?<br><strong>${lastAction.type}</strong>: <strong>${lastAction.playerName}</strong> ➔ <strong>${lastAction.managerName}</strong> per <strong>${lastAction.price} cr</strong>`;
    const confirmed = await this.showConfirmModal('Annulla Ultima Chiamata', confirmMsg, '↩️');
    if (!confirmed) return;

    const res = this.auction.undoLastAction();
    if (res.success) {
      this.showToast(`↩️ ${res.message}`, 'info');
      this.renderHeaderStats();
      this.renderAuctionList();
      this.renderTeamsBoard();
      this.renderHistory();
    } else {
      this.showToast(`Errore annullamento: ${res.error}`, 'error');
    }
  }

  callRandomPlayer() {
    const unassigned = this.getFilteredPlayers().filter(p => p.stato === 'libero');
    if (unassigned.length === 0) {
      this.showToast('Nessun giocatore libero trovato con i filtri attuali!', 'warning');
      return;
    }
    const randomIndex = Math.floor(Math.random() * unassigned.length);
    const chosen = unassigned[randomIndex];
    this.openAuctionModal(chosen.id);
  }

  setupCSVUpload() {
    const dropZone = document.getElementById('csv-dropzone');
    const fileInput = document.getElementById('csv-file-input');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.processCSVFile(file);
    });

    ['dragenter', 'dragover'].forEach(name => {
      dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) this.processCSVFile(file);
    });
  }

  processCSVFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const players = ListoneParser.parse(text);
        if (players && players.length > 0) {
          this.state.setPlayers(players);
          this.populateTeamFilter();
          this.renderHeaderStats();
          this.renderAuctionList();
          this.showToast(`Importati con successo ${players.length} calciatori da ${file.name}!`, 'success');
        } else {
          this.showToast('Nessun calciatore trovato nel file CSV selezionato.', 'error');
        }
      } catch (err) {
        console.error(err);
        this.showToast(`Errore nel parsing del file: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  }

  async handleJSONImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const confirmed = await this.showConfirmModal(
      'Ripristino Backup',
      'Il ripristino sovrascriverà lo stato attuale dell\'asta con quello del file di backup.<br>Sei sicuro di voler procedere?',
      '💾'
    );
    if (!confirmed) {
      event.target.value = '';
      return;
    }

    try {
      await this.exporter.importJSONBackup(file);
      this.showToast('Backup ripristinato con successo!', 'success');
      this.populateTeamFilter();
      this.renderHeaderStats();
      this.renderAuctionList();
      this.renderTeamsBoard();
      this.renderHistory();
      this.renderSettings();
    } catch (err) {
      this.showToast(`Errore importazione backup: ${err.message}`, 'error');
    }
    event.target.value = '';
  }

  saveLeagueSettings() {
    const nameInput = document.getElementById('setting-league-name');
    const budgetInput = document.getElementById('setting-initial-budget');
    const slotP = document.getElementById('setting-slot-p');
    const slotD = document.getElementById('setting-slot-d');
    const slotC = document.getElementById('setting-slot-c');
    const slotA = document.getElementById('setting-slot-a');

    const league = this.state.getLeagueConfig();
    league.name = (nameInput && nameInput.value.trim()) || league.name;
    league.initialBudget = (budgetInput && parseInt(budgetInput.value, 10)) || 500;

    league.slots = {
      P: (slotP && parseInt(slotP.value, 10)) || 3,
      D: (slotD && parseInt(slotD.value, 10)) || 8,
      C: (slotC && parseInt(slotC.value, 10)) || 8,
      A: (slotA && parseInt(slotA.value, 10)) || 6
    };
    league.totalSlots = league.slots.P + league.slots.D + league.slots.C + league.slots.A;

    // Salva nomi manager
    document.querySelectorAll('.input-mgr-name').forEach(input => {
      const id = input.getAttribute('data-id');
      const val = input.value.trim();
      const m = this.state.getManager(id);
      if (m && val) m.name = val;
    });

    this.state.save();
    this.renderHeaderStats();
    this.renderTeamsBoard();
    this.showToast('Impostazioni salvate con successo!', 'success');
  }

  handleAddManager() {
    const managers = this.state.getAllManagers();
    const newId = 'mgr_' + (Date.now());
    const newName = `Nuova Squadra ${managers.length + 1}`;

    managers.push({
      id: newId,
      name: newName,
      spent: 0,
      roster: []
    });

    this.state.save();
    this.renderSettings();
    this.renderTeamsBoard();
    this.showToast(`Aggiunta squadra: ${newName}`, 'info');
  }

  async handleDeleteManager(managerId) {
    const manager = this.state.getManager(managerId);
    if (!manager) return;

    if ((manager.roster || []).length > 0) {
      const confirmed = await this.showConfirmModal(
        'Elimina Squadra con Giocatori',
        `Attenzione: <strong>${manager.name}</strong> possiede <strong>${manager.roster.length} giocatori</strong> in rosa.<br>Eliminando la squadra i giocatori torneranno liberi nel listone. Continuare?`,
        '⚠️'
      );
      if (!confirmed) return;

      // Svincola tutti i giocatori
      [...manager.roster].forEach(p => {
        const pl = this.state.getPlayer(p.id);
        if (pl) {
          pl.stato = 'libero';
          pl.proprietario_id = null;
          pl.prezzo_acquisto = null;
        }
      });
    } else {
      const confirmed = await this.showConfirmModal('Elimina Squadra', `Vuoi eliminare la squadra <strong>${manager.name}</strong>?`, '🗑️');
      if (!confirmed) return;
    }

    this.state.data.managers = this.state.data.managers.filter(m => m.id !== managerId);
    this.state.save();
    this.renderSettings();
    this.renderTeamsBoard();
    this.renderHeaderStats();
    this.renderAuctionList();
    this.showToast(`Squadra eliminata.`, 'info');
  }

  // Filtro rapido multi-squadra dal Calcolatore Incroci
  filterListoneByTeams(teams) {
    if (!Array.isArray(teams) || teams.length === 0) return;
    this.multiTeamFilter = teams;
    this.filters.team = 'ALL';
    const teamSelect = document.getElementById('team-filter');
    if (teamSelect) teamSelect.value = 'ALL';

    this.switchTab('auction');
    this.showToast(`🎯 Listone filtrato su: ${teams.join(', ')}`, 'success');
  }

  clearMultiTeamFilter() {
    this.multiTeamFilter = null;
    this.renderAuctionList();
    this.showToast('Filtro squadre rimosso.', 'info');
  }

  openFocusTeam(teamName) {
    if (!teamName) return;
    this.focusPivotTeam = teamName;
    this.calendarMode = 'focus';

    this.closeAuctionModal();
    this.switchTab('calendar');

    document.querySelectorAll('.cal-mode-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === 'focus');
    });

    const filterBar = document.getElementById('calendar-filter-bar');
    if (filterBar) filterBar.style.display = 'none';

    document.getElementById('view-cal-focus')?.classList.remove('hidden');
    document.getElementById('view-cal-goalkeepers')?.classList.add('hidden');
    document.getElementById('view-cal-attackers')?.classList.add('hidden');
    document.getElementById('view-cal-ratings')?.classList.add('hidden');

    this.renderFocusSection();
  }

  // =========================================================================
  // SEZIONE CALENDARIO & INCROCI SQUADRE
  // =========================================================================
  renderCalendarSection() {
    if (!this.calendarEngine && typeof CalendarEngine !== 'undefined') {
      this.calendarEngine = new CalendarEngine(window.CALENDARIO_SERIE_A, () => this.state.getAllPlayers());
    }
    if (!this.calendarEngine) return;

    // Popola select squadre se vuota
    const select = document.getElementById('calendar-team-filter');
    if (select && select.options.length <= 1) {
      const teams = this.calendarEngine.getAllTeams();
      teams.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = `Solo incroci con: ${t}`;
        select.appendChild(opt);
      });
    }

    if (this.calendarMode === 'focus') {
      this.renderFocusSection();
    } else if (this.calendarMode === 'ratings') {
      this.renderTeamRatingsGrid();
    } else {
      this.renderCalendarTables();
    }
  }

  renderFocusSection() {
    if (!this.calendarEngine) return;

    const select = document.getElementById('focus-pivot-team-select');
    const teams = this.calendarEngine.getAllTeams();

    if (select && select.options.length <= 1) {
      select.innerHTML = '';
      teams.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        if (t === this.focusPivotTeam) opt.selected = true;
        select.appendChild(opt);
      });
    } else if (select) {
      select.value = this.focusPivotTeam;
    }

    // Renderizza 20 pill buttons per selezione rapida
    const pillsRow = document.getElementById('focus-quick-team-pills');
    if (pillsRow) {
      let pillsHtml = '';
      teams.forEach(t => {
        const isActive = t === this.focusPivotTeam;
        pillsHtml += `<button type="button" class="team-pill-btn ${isActive ? 'active' : ''}" data-team="${t}">${t}</button>`;
      });
      pillsRow.innerHTML = pillsHtml;

      pillsRow.querySelectorAll('.team-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.focusPivotTeam = btn.getAttribute('data-team');
          if (select) select.value = this.focusPivotTeam;
          this.renderFocusSection();
        });
      });
    }

    // Renderizza scheda riassuntiva pivot
    const summaryCard = document.getElementById('focus-pivot-summary-card');
    if (summaryCard) {
      const rating = this.calendarEngine.getTeamRating(this.focusPivotTeam);
      const tierClass = rating >= 8 ? 'rating-badge-top' : rating >= 6 ? 'rating-badge-mid' : 'rating-badge-low';
      const tierLabel = rating >= 8 ? 'TOP' : rating >= 6 ? 'MEDIA' : 'SALVEZZA';

      const gks = this.calendarEngine.getTeamKeyPlayers(this.focusPivotTeam, 'P');
      const atts = this.calendarEngine.getTeamKeyPlayers(this.focusPivotTeam, 'A');

      const gksTxt = gks.slice(0, 2).map(p => `<strong>${p.nome}</strong> <span style="color: #fbbf24; font-weight: 700;">[${p.prezzo_massimo_imposto || 1} cr]</span>`).join(', ') || 'N.D.';
      const attsTxt = atts.slice(0, 3).map(p => `<strong>${p.nome}</strong> <span style="color: #fbbf24; font-weight: 700;">[${p.prezzo_massimo_imposto || 1} cr]</span>`).join(', ') || 'N.D.';

      summaryCard.innerHTML = `
        <div class="focus-summary-left">
          <span class="focus-summary-name">${this.focusPivotTeam}</span>
          <span class="team-rating-badge ${tierClass}">${rating}/10 (${tierLabel})</span>
        </div>
        <div class="focus-summary-roster">
          <div class="focus-summary-item">
            <span class="f-lbl">Portieri Titolari ${this.focusPivotTeam}:</span>
            <span class="f-val">${gksTxt}</span>
          </div>
          <div class="focus-summary-item">
            <span class="f-lbl">Attaccanti Principali ${this.focusPivotTeam}:</span>
            <span class="f-val">${attsTxt}</span>
          </div>
        </div>
      `;
    }

    // Aggiorna etichette squadra
    ['focus-lbl-team-gk', 'focus-lbl-team-att-pairs', 'focus-lbl-team-att-triplets'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = this.focusPivotTeam;
    });

    // Mostra la sottovista corretta
    const viewGk = document.getElementById('focus-tab-view-gk');
    const viewAttPairs = document.getElementById('focus-tab-view-att-pairs');
    const viewAttTriplets = document.getElementById('focus-tab-view-att-triplets');

    if (viewGk) viewGk.classList.toggle('hidden', this.focusActiveTab !== 'gk');
    if (viewAttPairs) viewAttPairs.classList.toggle('hidden', this.focusActiveTab !== 'att-pairs');
    if (viewAttTriplets) viewAttTriplets.classList.toggle('hidden', this.focusActiveTab !== 'att-triplets');

    // Renderizza dati tabella attiva
    if (this.focusActiveTab === 'gk') {
      this.renderFocusGkTable();
    } else if (this.focusActiveTab === 'att-pairs') {
      this.renderFocusAttPairsTable();
    } else if (this.focusActiveTab === 'att-triplets') {
      this.renderFocusAttTripletsTable();
    }
  }

  renderFocusGkTable() {
    const tbody = document.getElementById('focus-gk-table-body');
    if (!tbody || !this.calendarEngine) return;

    const pairs = this.calendarEngine.getFocusTeamGoalkeepers(this.focusPivotTeam);
    let html = '';

    pairs.forEach((p, idx) => {
      const playersPartnerHtml = p.playersPartner.map(x =>
        `<span class="player-tag-price"><strong>${x.nome}</strong> (${x.titolarita || '?'}%)<span class="p-max">[${x.prezzo_massimo_imposto || 1} cr]</span></span>`
      ).join('') || 'N.D.';

      const badgeClass = p.indiceMedio <= 5.15 ? 'score-badge-green' : p.indiceMedio <= 5.35 ? 'score-badge-blue' : p.indiceMedio <= 5.55 ? 'score-badge-orange' : 'score-badge-red';
      const altPct = Math.round((p.homeAwayAlternation / 38) * 100);
      const altColor = p.homeAwayAlternation >= 34 ? '#34d399' : p.homeAwayAlternation >= 22 ? '#60a5fa' : '#94a3b8';

      html += `
        <tr class="player-row">
          <td style="font-weight: 800; color: var(--text-muted);">${idx + 1}</td>
          <td><span class="team-badge">${p.partnerTeam}</span></td>
          <td>${playersPartnerHtml}</td>
          <td><span class="score-badge ${badgeClass}">${p.indiceMedio}</span></td>
          <td>
            <span style="font-weight: 700; color: ${p.bigMatchOverlap <= 1 ? '#34d399' : p.bigMatchOverlap <= 3 ? '#fbbf24' : '#f87171'};">
              ${p.bigMatchOverlap} su 38
            </span>
          </td>
          <td>
            <span style="font-weight: 700; color: ${altColor};">${p.homeAwayAlternation}/38 (${altPct}%)</span>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn-filter-listone" onclick="window.app.filterListoneByTeams(['${this.focusPivotTeam}', '${p.partnerTeam}'])">
              🔍 Filtra nel Listone
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  renderFocusAttPairsTable() {
    const tbody = document.getElementById('focus-att-pairs-table-body');
    if (!tbody || !this.calendarEngine) return;

    const pairs = this.calendarEngine.getFocusTeamAttackersPairs(this.focusPivotTeam);
    let html = '';

    pairs.forEach((p, idx) => {
      const playersPartnerHtml = p.playersPartner.map(x =>
        `<span class="player-tag-price"><strong>${x.nome}</strong><span class="p-max">[${x.prezzo_massimo_imposto || 1} cr]</span></span>`
      ).join('') || 'N.D.';

      const pct = Math.round((p.softMatchdaysCount / 38) * 100);
      const badgeClass = p.softMatchdaysCount >= 33 ? 'score-badge-green' : p.softMatchdaysCount >= 30 ? 'score-badge-blue' : 'score-badge-orange';

      html += `
        <tr class="player-row">
          <td style="font-weight: 800; color: var(--text-muted);">${idx + 1}</td>
          <td><span class="team-badge">${p.partnerTeam}</span></td>
          <td>${playersPartnerHtml}</td>
          <td><span class="score-badge ${badgeClass}">${p.softMatchdaysCount}/38 (${pct}%)</span></td>
          <td><span style="font-weight: 700; color: #60a5fa;">${p.doubleSoftMatchdaysCount} turni</span></td>
          <td><span style="font-family: var(--font-display); font-weight: 700; color: #fbbf24;">${p.indiceOffensivo}</span></td>
          <td style="text-align: center;">
            <button type="button" class="btn-filter-listone" onclick="window.app.filterListoneByTeams(['${this.focusPivotTeam}', '${p.partnerTeam}'])">
              🔍 Filtra nel Listone
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  renderFocusAttTripletsTable() {
    const tbody = document.getElementById('focus-att-triplets-table-body');
    if (!tbody || !this.calendarEngine) return;

    const triplets = this.calendarEngine.getFocusTeamAttackersTriplets(this.focusPivotTeam);
    let html = '';

    triplets.forEach((t, idx) => {
      const playersBHtml = t.playersB.map(x =>
        `<span class="player-tag-price"><strong>${x.nome}</strong><span class="p-max">[${x.prezzo_massimo_imposto || 1} cr]</span></span>`
      ).join('') || 'N.D.';

      const playersCHtml = t.playersC.map(x =>
        `<span class="player-tag-price"><strong>${x.nome}</strong><span class="p-max">[${x.prezzo_massimo_imposto || 1} cr]</span></span>`
      ).join('') || 'N.D.';

      const badgeClass = t.softMatchdaysCount >= 36 ? 'score-badge-green' : t.softMatchdaysCount >= 33 ? 'score-badge-blue' : 'score-badge-orange';

      html += `
        <tr class="player-row">
          <td style="font-weight: 800; color: var(--text-muted);">${idx + 1}</td>
          <td>
            <span class="team-badge" style="margin-bottom: 0.2rem;">${t.teamB}</span>
            <div>${playersBHtml}</div>
          </td>
          <td>
            <span class="team-badge" style="margin-bottom: 0.2rem;">${t.teamC}</span>
            <div>${playersCHtml}</div>
          </td>
          <td>
            <span class="score-badge ${badgeClass}">${t.softMatchdaysCount}/38 (${t.coperturaPct}%)</span>
          </td>
          <td>
            <span style="font-family: var(--font-display); font-weight: 700; color: #fbbf24;">${t.indiceTris}</span>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn-filter-listone" onclick="window.app.filterListoneByTeams(['${this.focusPivotTeam}', '${t.teamB}', '${t.teamC}'])">
              🔍 Filtra nel Listone
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  renderTeamRatingsGrid() {
    const grid = document.getElementById('team-ratings-grid');
    if (!grid || !this.calendarEngine) return;

    const teams = this.calendarEngine.getAllTeams();
    let html = '';

    teams.forEach(team => {
      const rating = this.calendarEngine.getTeamRating(team);
      const tierClass = rating >= 8 ? 'rating-badge-top' : rating >= 6 ? 'rating-badge-mid' : 'rating-badge-low';
      const tierLabel = rating >= 8 ? 'TOP' : rating >= 6 ? 'MEDIA' : 'SALVEZZA';

      html += `
        <div class="team-rating-card" data-team="${team}">
          <div class="team-rating-header">
            <span class="team-rating-name">${team}</span>
            <span class="team-rating-badge ${tierClass}" id="rating-badge-${team}">${rating}/10 (${tierLabel})</span>
          </div>
          <div class="team-rating-controls">
            <input type="range" class="rating-slider" min="1" max="10" step="1" value="${rating}" data-team="${team}">
            <input type="number" class="rating-number-input" min="1" max="10" value="${rating}" data-team="${team}">
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;

    // Event listeners su slider e number input
    grid.querySelectorAll('.rating-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const team = e.target.getAttribute('data-team');
        const val = parseInt(e.target.value, 10);
        this.calendarEngine.setTeamRating(team, val);

        const numInput = grid.querySelector(`.rating-number-input[data-team="${team}"]`);
        if (numInput) numInput.value = val;

        const badge = document.getElementById(`rating-badge-${team}`);
        if (badge) {
          const tierClass = val >= 8 ? 'rating-badge-top' : val >= 6 ? 'rating-badge-mid' : 'rating-badge-low';
          const tierLabel = val >= 8 ? 'TOP' : val >= 6 ? 'MEDIA' : 'SALVEZZA';
          badge.className = `team-rating-badge ${tierClass}`;
          badge.textContent = `${val}/10 (${tierLabel})`;
        }
      });
    });

    grid.querySelectorAll('.rating-number-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const team = e.target.getAttribute('data-team');
        let val = parseInt(e.target.value, 10) || 5;
        val = Math.min(10, Math.max(1, val));
        e.target.value = val;
        this.calendarEngine.setTeamRating(team, val);

        const slider = grid.querySelector(`.rating-slider[data-team="${team}"]`);
        if (slider) slider.value = val;

        const badge = document.getElementById(`rating-badge-${team}`);
        if (badge) {
          const tierClass = val >= 8 ? 'rating-badge-top' : val >= 6 ? 'rating-badge-mid' : 'rating-badge-low';
          const tierLabel = val >= 8 ? 'TOP' : val >= 6 ? 'MEDIA' : 'SALVEZZA';
          badge.className = `team-rating-badge ${tierClass}`;
          badge.textContent = `${val}/10 (${tierLabel})`;
        }
      });
    });
  }

  renderCalendarTables() {
    if (!this.calendarEngine) return;

    const targetTeam = this.calendarSelectedTeam === 'ALL' ? null : this.calendarSelectedTeam;
    const countLabel = document.getElementById('cal-pairs-count');

    if (this.calendarMode === 'goalkeepers') {
      const tbody = document.getElementById('cal-goalkeepers-table-body');
      if (!tbody) return;

      const pairs = this.calendarEngine.getAllGoalkeeperPairs(targetTeam);
      if (countLabel) countLabel.textContent = `${pairs.length} combinazioni analizzate`;

      if (pairs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nessun incrocio trovato per i criteri selezionati.</td></tr>';
        return;
      }

      let html = '';
      pairs.forEach((p, idx) => {
        const pA = p.playersA.map(x => `<strong>${x.nome}</strong> (${x.titolarita || '?'} tit)`).join(', ') || 'N.D.';
        const pB = p.playersB.map(x => `<strong>${x.nome}</strong> (${x.titolarita || '?'} tit)`).join(', ') || 'N.D.';

        const badgeClass = p.indiceMedio <= 5.15 ? 'score-badge-green' : p.indiceMedio <= 5.35 ? 'score-badge-blue' : p.indiceMedio <= 5.55 ? 'score-badge-orange' : 'score-badge-red';
        const ratingWord = p.indiceMedio <= 5.15 ? '⭐ Top Incrocio' : p.indiceMedio <= 5.35 ? '👍 Molto Buono' : p.indiceMedio <= 5.55 ? '⚖️ Discreto' : '⚠️ Sconsigliato';

        const altPercentage = Math.round((p.homeAwayAlternation / 38) * 100);
        const altColor = p.homeAwayAlternation >= 34 ? '#34d399' : p.homeAwayAlternation >= 22 ? '#60a5fa' : '#94a3b8';

        html += `
          <tr class="player-row">
            <td style="font-weight: 800; color: var(--text-muted);">${idx + 1}</td>
            <td>
              <div class="team-badge" style="margin-bottom: 0.25rem;">${p.teamA}</div>
              <div class="sub-players-list">${pA}</div>
            </td>
            <td>
              <div class="team-badge" style="margin-bottom: 0.25rem;">${p.teamB}</div>
              <div class="sub-players-list">${pB}</div>
            </td>
            <td>
              <span class="score-badge ${badgeClass}">${p.indiceMedio}</span>
              <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 2px;">Diff. min media</div>
            </td>
            <td>
              <span style="font-weight: 700; color: ${p.bigMatchOverlap <= 1 ? '#34d399' : p.bigMatchOverlap <= 3 ? '#fbbf24' : '#f87171'};">
                ${p.bigMatchOverlap} su 38
              </span>
              <div style="font-size: 0.725rem; color: var(--text-muted);">${p.bigMatchOverlap === 0 ? 'Mai insieme contro Big' : 'giornate critiche'}</div>
            </td>
            <td>
              <span style="font-weight: 700; color: ${altColor};">
                ${p.homeAwayAlternation} / 38 (${altPercentage}%)
              </span>
              <div style="font-size: 0.725rem; color: var(--text-muted);">Incrocio Casa/Trasf.</div>
            </td>
            <td style="text-align: center;">
              <span class="score-badge ${badgeClass}" style="font-size: 0.775rem;">${ratingWord}</span>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    } else if (this.calendarMode === 'attackers') {
      const tbody = document.getElementById('cal-attackers-table-body');
      if (!tbody) return;

      const pairs = this.calendarEngine.getAllAttackerPairs(targetTeam);
      if (countLabel) countLabel.textContent = `${pairs.length} combinazioni analizzate`;

      if (pairs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nessun incrocio trovato per i criteri selezionati.</td></tr>';
        return;
      }

      let html = '';
      pairs.forEach((p, idx) => {
        const pA = p.playersA.map(x => `<strong>${x.nome}</strong>`).join(', ') || 'N.D.';
        const pB = p.playersB.map(x => `<strong>${x.nome}</strong>`).join(', ') || 'N.D.';

        const pct = Math.round((p.softMatchdaysCount / 38) * 100);
        const badgeClass = p.softMatchdaysCount >= 33 ? 'score-badge-green' : p.softMatchdaysCount >= 30 ? 'score-badge-blue' : 'score-badge-orange';
        const ratingWord = p.softMatchdaysCount >= 33 ? '🔥 Tridente d\'Oro' : p.softMatchdaysCount >= 30 ? '⚡ Ottimo Mix' : '👍 Buona Alternanza';

        html += `
          <tr class="player-row">
            <td style="font-weight: 800; color: var(--text-muted);">${idx + 1}</td>
            <td>
              <div class="team-badge" style="margin-bottom: 0.25rem;">${p.teamA}</div>
              <div class="sub-players-list">${pA}</div>
            </td>
            <td>
              <div class="team-badge" style="margin-bottom: 0.25rem;">${p.teamB}</div>
              <div class="sub-players-list">${pB}</div>
            </td>
            <td>
              <span class="score-badge ${badgeClass}">${p.softMatchdaysCount} / 38 (${pct}%)</span>
              <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 2px;">giornate con match morbido</div>
            </td>
            <td>
              <span style="font-weight: 700; color: #60a5fa;">${p.doubleSoftMatchdaysCount} giornate</span>
              <div style="font-size: 0.725rem; color: var(--text-muted);">entrambe contro difese facili</div>
            </td>
            <td>
              <span style="font-family: var(--font-display); font-weight: 700; color: #fbbf24;">${p.indiceOffensivo}</span>
              <div style="font-size: 0.725rem; color: var(--text-muted);">Indice difficoltà</div>
            </td>
            <td style="text-align: center;">
              <span class="score-badge ${badgeClass}" style="font-size: 0.775rem;">${ratingWord}</span>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    }
  }

  async confirmResetAuction() {
    const confirmed1 = await this.showConfirmModal(
      'Azzeramento Asta',
      'ATTENZIONE: Sei sicuro di voler azzerare l\'asta?<br>Tutti i crediti spesi e le rose verranno cancellati.<br>I calciatori rimarranno nel listone ma torneranno liberi.',
      '⚠️'
    );
    if (!confirmed1) return;

    const confirmed2 = await this.showConfirmModal(
      'Conferma Definitiva',
      'Confermi definitivamente il reset totale dell\'asta in corso?',
      '🚨'
    );
    if (!confirmed2) return;

    this.state.resetAll(true);
    this.renderHeaderStats();
    this.renderAuctionList();
    this.renderTeamsBoard();
    this.renderHistory();
    this.renderSettings();
    this.showToast('Asta azzerata con successo.', 'info');
  }
}

// Inizializzazione al DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
  window.app.init();
});
