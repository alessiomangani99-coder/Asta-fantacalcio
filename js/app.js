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
      history: [],
      budgetPlan: {
        userManagerId: 'mgr_1',
        compensationRole: 'A',
        tesorettoTarget: 'A',
        roles: {
          P: { pct: 8, targetCredits: 40 },
          D: { pct: 12, targetCredits: 60 },
          C: { pct: 28, targetCredits: 140 },
          A: { pct: 52, targetCredits: 260 }
        }
      }
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
          // Inizializzazione o migrazione Budget Plan per Reparto se assente
          const initialBudget = this.data.league?.initialBudget || 500;
          if (!this.data.budgetPlan || !this.data.budgetPlan.roles) {
            this.data.budgetPlan = {
              userManagerId: this.data.managers[0]?.id || 'mgr_1',
              compensationRole: 'A',
              tesorettoTarget: 'A',
              roles: {
                P: { pct: 8, targetCredits: Math.round(initialBudget * 0.08) },
                D: { pct: 12, targetCredits: Math.round(initialBudget * 0.12) },
                C: { pct: 28, targetCredits: Math.round(initialBudget * 0.28) },
                A: { pct: 52, targetCredits: Math.round(initialBudget * 0.52) }
              }
            };
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

  resetAuction() {
    // Mantieni in memoria tutti i calciatori attualmente presenti (inclusi CSV o inseriti a mano)
    if (Array.isArray(this.data.players)) {
      this.data.players = this.data.players.map(p => ({
        ...p,
        stato: 'libero',
        proprietario_id: null,
        proprietario: null,
        prezzo_acquisto: null,
        costo: null
      }));
    }

    // Svuota lo storico delle chiamate
    this.data.history = [];

    // Ripristina i crediti e le rose di tutti i manager
    if (Array.isArray(this.data.managers)) {
      this.data.managers.forEach(m => {
        m.spent = 0;
        m.roster = [];
        m.squad = [];
      });
    }

    // Salva il nuovo stato su localStorage
    this.save();
  }

  restoreDefaultListone(defaultPlayers) {
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

    const players = (defaultPlayers || []).map(p => ({
      ...p,
      stato: 'libero',
      proprietario_id: null,
      proprietario: null,
      prezzo_acquisto: null,
      costo: null
    }));

    this.data.players = players;
    this.data.history = [];

    if (Array.isArray(this.data.managers) && this.data.managers.length > 0) {
      this.data.managers.forEach(m => {
        m.spent = 0;
        m.roster = [];
        m.squad = [];
      });
    } else {
      this.data.managers = defaultManagers;
    }

    if (!this.data.league) {
      this.data.league = defaultLeague;
    }

    this.save();
  }

  resetAll(keepPlayers = true) {
    if (keepPlayers) {
      this.resetAuction();
    } else {
      this.data.players = [];
      this.resetAuction();
    }
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

  getBudgetPlan() {
    if (!this.data.budgetPlan) {
      const initialBudget = this.data.league?.initialBudget || 500;
      this.data.budgetPlan = {
        userManagerId: this.data.managers[0]?.id || 'mgr_1',
        compensationRole: 'A',
        tesorettoTarget: 'A',
        roles: {
          P: { pct: 8, targetCredits: Math.round(initialBudget * 0.08) },
          D: { pct: 12, targetCredits: Math.round(initialBudget * 0.12) },
          C: { pct: 28, targetCredits: Math.round(initialBudget * 0.28) },
          A: { pct: 52, targetCredits: Math.round(initialBudget * 0.52) }
        }
      };
    }
    return this.data.budgetPlan;
  }

  setBudgetPlan(plan) {
    this.data.budgetPlan = plan;
    this.save();
  }

  getUserManagerId() {
    return this.getBudgetPlan().userManagerId || (this.data.managers[0]?.id || 'mgr_1');
  }

  setUserManagerId(id) {
    const plan = this.getBudgetPlan();
    plan.userManagerId = id;
    this.save();
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
    this.calendarActiveTab = 'goalkeepers'; // 'goalkeepers' | 'attackers' | 'ratings'
    this.calPivotTeam = 'Juventus';
    this.attActiveSubtab = 'pairs'; // 'pairs' | 'triplets'
    this.multiTeamFilter = null;
    this.antiSpyActive = true;
    this.tierGuideActiveRole = 'P';

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

    // Modulo Tattico Campetto Manuale (persiste su localStorage)
    this.tacticalFormation = '4-3-3';
    try {
      this.tacticalFormation = localStorage.getItem('fanta_tactical_formation') || '4-3-3';
    } catch (e) {}

    // Stato Modale Estrazione Casuale (Random per Ruolo e Fascia)
    this.randomPickerRole = 'ALL';
    this.randomPickerTiers = new Set(['all']);
    this.lastExtractedPlayer = null;
    this.isRouletteSpinning = false;
    this.rouletteIntervalId = null;

    // Stato Timer Manuale Battitore
    this.auctionTimer = {
      presetSeconds: 8,
      remainingMs: 8000,
      isRunning: false,
      isPaused: false,
      intervalId: null,
      lastTickSecond: null,
      lastTimestamp: null,
      muted: false
    };

    // Filtro Ruolo nel Tabellone Squadre e Rose
    this.teamsBoardRoleFilter = 'ALL';

    // Canale Broadcast & Sincronizzazione Schermo Pubblico TV (Offline Dual Screen)
    this.syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('fanta_asta_sync') : null;
    if (this.syncChannel) {
      this.syncChannel.onmessage = (e) => this.handleSyncMessage(e.data);
    }
    window.addEventListener('storage', (e) => {
      if (e.key === 'fanta_asta_tv_sync_req' && e.newValue) {
        this.sendFullStateSyncToTv();
      }
    });
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
    this.renderDeptBudgetWidget();
    this.renderBudgetPlanSettings();

    // Sincronizzazione Firebase Realtime Database
    this.initFirebaseSync();
    this.syncManagersToFirebase();
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

    // Tasto Random Call ("Chiama a sorte tra i liberi")
    const btnRandomCall = document.getElementById('btn-random-call');
    if (btnRandomCall) {
      btnRandomCall.addEventListener('click', () => this.openRandomPickerModal());
    }

    // Tasto Undo Globale nell'header
    const btnGlobalUndo = document.getElementById('btn-global-undo');
    if (btnGlobalUndo) {
      btnGlobalUndo.addEventListener('click', () => this.handleUndo());
    }

    // Tasto Schermo TV Pubblico nell'header
    const btnOpenTv = document.getElementById('btn-open-tv');
    if (btnOpenTv) {
      btnOpenTv.addEventListener('click', () => {
        window.open('tv.html', 'FantaAstaTV', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
      });
    }

    // Filtro Ruolo nel Tabellone Squadre e Rose
    document.querySelectorAll('.btn-teams-role').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-teams-role').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.teamsBoardRoleFilter = btn.getAttribute('data-team-role') || 'ALL';
        this.renderTeamsBoard();
      });
    });

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
          this.syncCurrentBidToFirebase();
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
        if (val > 0) {
          this.onBidIncremented();
        }
        this.syncCurrentBidToFirebase();
      });
    });

    const bidPriceInput = document.getElementById('bid-price-input');
    if (bidPriceInput) {
      bidPriceInput.addEventListener('input', () => {
        this.updateBidValidationMessage();
        this.syncCurrentBidToFirebase();
      });
    }

    const managerSelect = document.getElementById('bid-manager-select');
    if (managerSelect) {
      managerSelect.addEventListener('change', () => {
        this.updateBidValidationMessage();
        this.syncCurrentBidToFirebase();
      });
    }

    // Selettore Modulo Tattico Manuale
    document.querySelectorAll('.btn-formation').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = btn.getAttribute('data-formation');
        if (!form) return;
        this.tacticalFormation = form;
        try {
          localStorage.setItem('fanta_tactical_formation', form);
        } catch (e) {}
        document.querySelectorAll('.btn-formation').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-formation') === form);
        });
        this.renderTacticalPitch();
      });
    });

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

    // Tasto Reset Asta (Nuova Sessione)
    const btnResetAuction = document.getElementById('btn-reset-auction');
    if (btnResetAuction) {
      btnResetAuction.addEventListener('click', () => this.confirmResetAuction());
    }

    // Tasto Ripristina Listone Originale di Fabbrica
    const btnRestoreListone = document.getElementById('btn-restore-default-listone');
    if (btnRestoreListone) {
      btnRestoreListone.addEventListener('click', () => this.confirmRestoreDefaultListone());
    }

    // Toggle Comprimi/Espandi Widget Target Budget Reparti
    const btnToggleDept = document.getElementById('btn-toggle-dept-widget');
    const deptWidgetBar = document.getElementById('dept-budget-widget-bar');
    if (btnToggleDept && deptWidgetBar) {
      btnToggleDept.addEventListener('click', () => {
        deptWidgetBar.classList.toggle('is-collapsed');
        btnToggleDept.textContent = deptWidgetBar.classList.contains('is-collapsed') ? '▾' : '▴';
      });
    }

    // Cambio Squadra di Riferimento nel Widget Superiore
    const deptWidgetMgrSelect = document.getElementById('dept-widget-manager-select');
    if (deptWidgetMgrSelect) {
      deptWidgetMgrSelect.addEventListener('change', (e) => {
        this.state.setUserManagerId(e.target.value);
        this.renderDeptBudgetWidget();
        this.renderBudgetPlanSettings();
      });
    }

    // Cambio Squadra di Riferimento nella Schermata Impostazioni
    const settingBudgetMgrSelect = document.getElementById('setting-budget-user-manager');
    if (settingBudgetMgrSelect) {
      settingBudgetMgrSelect.addEventListener('change', (e) => {
        this.state.setUserManagerId(e.target.value);
        this.renderDeptBudgetWidget();
        this.renderBudgetPlanSettings();
      });
    }

    // Salva Form Piano Target Budget
    const formBudgetPlan = document.getElementById('form-budget-plan');
    if (formBudgetPlan) {
      formBudgetPlan.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveBudgetPlanSettings();
      });
    }

    // Preset Rapidi Piano Target Budget
    document.querySelectorAll('.btn-preset-budget').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.applyBudgetPreset(preset);
      });
    });

    // Tasto "Annulla Chiamata (Nessun Acquisto)" nel modale
    const btnCancelCall = document.getElementById('btn-cancel-call');
    if (btnCancelCall) {
      btnCancelCall.addEventListener('click', () => {
        if (this.currentAuctionPlayer) {
          const playerName = this.currentAuctionPlayer.nome;
          this.closeAuctionModal();
          this.showToast(`Chiamata per ${playerName} annullata. Il calciatore resta svincolato/libero.`, 'info');
        } else {
          this.closeAuctionModal();
        }
      });
    }

    // Controlli Sezione Calendario: 3 Tab Principali
    document.querySelectorAll('.cal-nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-cal-tab');
        this.switchCalendarTab(tab);
      });
    });

    // Sub-tab Attaccanti (Migliori Coppie vs Migliori Tris)
    document.querySelectorAll('.att-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subtab = btn.getAttribute('data-att-subtab');
        this.switchAttSubtab(subtab);
      });
    });

    // Selezione Squadra Pivot Portieri
    const gkSelect = document.getElementById('cal-gk-pivot-select');
    if (gkSelect) {
      gkSelect.addEventListener('change', (e) => {
        this.setCalendarPivotTeam(e.target.value);
      });
    }

    // Selezione Squadra Pivot Attaccanti
    const attSelect = document.getElementById('cal-att-pivot-select');
    if (attSelect) {
      attSelect.addEventListener('change', (e) => {
        this.setCalendarPivotTeam(e.target.value);
      });
    }

    // Tasto Ripristina Valutazioni Squadre (Rating 1-10)
    const btnResetRatings = document.getElementById('btn-reset-team-ratings');
    if (btnResetRatings) {
      btnResetRatings.addEventListener('click', () => {
        if (this.calendarEngine) {
          this.calendarEngine.resetRatings();
          this.renderTeamRatingsGrid();
          if (this.calendarActiveTab === 'goalkeepers') this.renderCalendarGkTab();
          if (this.calendarActiveTab === 'attackers') this.renderCalendarAttTab();
          this.showToast('Valutazioni squadre ripristinate ai valori predefiniti!', 'info');
        }
      });
    }

    // Tasto "Vai a Incroci" all'interno del Popover Dati Segreti del Battitore
    const btnModalFocus = document.getElementById('btn-modal-open-focus');
    if (btnModalFocus) {
      btnModalFocus.addEventListener('click', () => {
        if (this.currentAuctionPlayer) {
          const role = this.currentAuctionPlayer.ruolo;
          const team = this.currentAuctionPlayer.squadra;
          this.closeAuctionModal();
          this.switchTab('calendar');
          this.switchCalendarTab(role === 'P' ? 'goalkeepers' : 'attackers', team);
        }
      });
    }

    // Apertura Guida Chiamate Rapide per Fascia
    const btnOpenTierGuide = document.getElementById('btn-open-fast-tier-guide');
    if (btnOpenTierGuide) {
      btnOpenTierGuide.addEventListener('click', () => {
        this.openTierGuideModal();
      });
    }

    // Selettore Ruoli nel Modale Guida Chiamate
    document.querySelectorAll('.tier-role-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-tier-role');
        this.switchTierGuideRole(role);
      });
    });

    // Chiusura Modale Guida Chiamate
    const btnCloseTierGuide = document.getElementById('btn-close-tier-guide');
    if (btnCloseTierGuide) {
      btnCloseTierGuide.addEventListener('click', () => {
        this.closeTierGuideModal();
      });
    }

    const btnFooterCloseTierGuide = document.getElementById('btn-footer-close-tier-guide');
    if (btnFooterCloseTierGuide) {
      btnFooterCloseTierGuide.addEventListener('click', () => {
        this.closeTierGuideModal();
      });
    }

    // Eventi Modale Chiama a Sorte tra i Liberi (Random per Ruolo e Fascia)
    const btnCloseRandomPicker = document.getElementById('btn-close-random-picker');
    if (btnCloseRandomPicker) {
      btnCloseRandomPicker.addEventListener('click', () => this.closeRandomPickerModal());
    }
    const btnCloseRandomFooter = document.getElementById('btn-close-random-footer');
    if (btnCloseRandomFooter) {
      btnCloseRandomFooter.addEventListener('click', () => this.closeRandomPickerModal());
    }

    document.querySelectorAll('.btn-random-role').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-random-role');
        this.setRandomRole(role);
      });
    });

    document.querySelectorAll('.btn-random-tier').forEach(btn => {
      btn.addEventListener('click', () => {
        const tier = btn.getAttribute('data-tier-key');
        this.toggleRandomTier(tier);
      });
    });

    const btnExecuteDraw = document.getElementById('btn-execute-draw');
    if (btnExecuteDraw) {
      btnExecuteDraw.addEventListener('click', () => this.drawRandomPlayer());
    }

    const btnStartAuctionInstant = document.getElementById('btn-start-auction-instant');
    if (btnStartAuctionInstant) {
      btnStartAuctionInstant.addEventListener('click', () => this.startAuctionFromRandom());
    }

    // Eventi Timer Manuale Battitore
    document.querySelectorAll('.btn-timer-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = parseInt(btn.getAttribute('data-preset'), 10);
        if (sec) this.setTimerPreset(sec);
      });
    });

    const btnTimerStartPause = document.getElementById('btn-timer-start-pause');
    if (btnTimerStartPause) {
      btnTimerStartPause.addEventListener('click', () => this.toggleAuctionTimer());
    }

    const btnTimerReset = document.getElementById('btn-timer-reset');
    if (btnTimerReset) {
      btnTimerReset.addEventListener('click', () => this.resetAuctionTimer());
    }

    const btnTimerMute = document.getElementById('btn-timer-mute');
    if (btnTimerMute) {
      btnTimerMute.addEventListener('click', () => this.toggleTimerMute());
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

      // Se il modale Chiama a Sorte è aperto, ESC lo chiude
      const modalRandom = document.getElementById('modal-random-picker');
      if (modalRandom && !modalRandom.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          this.closeRandomPickerModal();
          return;
        }
      }

      // Se il modale Guida Chiamate è aperto, ESC lo chiude
      const modalTierGuide = document.getElementById('modal-tier-guide');
      if (modalTierGuide && !modalTierGuide.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          this.closeTierGuideModal();
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
        } else if (e.key === 't' || e.key === 'T' || e.code === 'Space') {
          // Scorciatoia Timer d'Asta: T o Spazio (se non si sta digitando in campi di testo)
          const isTyping = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable);
          if (!isTyping) {
            e.preventDefault();
            this.toggleAuctionTimer();
          }
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
    if (tabId === 'auction') {
      this.renderAuctionList();
      this.renderDeptBudgetWidget();
    }
    if (tabId === 'teams') {
      this.renderTeamsBoard();
      this.renderDeptBudgetWidget();
    }
    if (tabId === 'history') this.renderHistory();
    if (tabId === 'calendar') this.renderCalendarSection();
    if (tabId === 'settings') {
      this.renderSettings();
      this.renderBudgetPlanSettings();
    }
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

      // Badge Tattici Riservati (Rigorista, Modificatore) con protezione Anti-Spionaggio
      const histStats = window.getHistoricalStats ? window.getHistoricalStats(player) : null;
      let badgeRigoristaHtml = '';
      let badgeModificatoreHtml = '';

      if (histStats) {
        const hasPenaltyInLast = histStats.last.rig && histStats.last.rig !== '0/0' && !histStats.last.rig.startsWith('0/');
        if (hasPenaltyInLast || histStats.carriera.has_penalties) {
          badgeRigoristaHtml = `<span class="secret-mask tactical-mini-badge badge-penalty" title="Rigorista Certificato">🎯 Rigorista</span>`;
        }
        if (histStats.last.mv >= 6.15 && histStats.last.pres > 0) {
          badgeModificatoreHtml = `<span class="secret-mask tactical-mini-badge badge-modifier" title="Ottimo da Modificatore (MV ${histStats.last.mv.toFixed(2)})">🛡️ Modificatore</span>`;
        }
      }

      html += `
        <tr class="player-row ${isAcquistato ? 'row-acquired' : ''}" data-id="${player.id}">
          <td class="col-role">
            <span class="role-pill role-${player.ruolo}">${player.ruolo}</span>
          </td>
          <td class="col-name">
            <div class="player-name-cell">
              <span class="player-name">${player.nome}</span>
              <span class="player-fascia secret-mask" title="Fascia segreta">${player.fascia || ''}</span>
              ${badgeRigoristaHtml}
              ${badgeModificatoreHtml}
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

      // Filtro per Ruolo nel Tabellone Rose
      const activeFilter = this.teamsBoardRoleFilter || 'ALL';
      const displayRoster = activeFilter === 'ALL'
        ? sortedRoster
        : sortedRoster.filter(p => p.ruolo === activeFilter);

      const roleLabels = { P: 'Portieri', D: 'Difensori', C: 'Centrocampisti', A: 'Attaccanti' };
      const roleTargetSlots = slotsConfig[activeFilter] || counts[activeFilter] || 0;
      const rosterHeaderText = activeFilter === 'ALL'
        ? `Rosa Calciatori (${roster.length}/${slotsConfig.total})`
        : `Rosa ${roleLabels[activeFilter] || activeFilter} (${displayRoster.length}/${roleTargetSlots})`;
      const emptyRosterText = activeFilter === 'ALL'
        ? 'Nessun acquisto ancora effettuato.'
        : `Nessun ${roleLabels[activeFilter] ? roleLabels[activeFilter].toLowerCase() : 'calciatore'} in rosa.`;

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
            <div class="roster-header">${rosterHeaderText}</div>
            <div class="roster-list-scroll">
              ${displayRoster.length === 0
                ? `<div class="roster-empty">${emptyRosterText}</div>`
                : displayRoster.map(p => `
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

    this.renderBudgetPlanSettings();
  }

  // APERTURA MODALE BATTITORE
  openAuctionModal(playerId) {
    const player = this.state.getPlayer(playerId);
    if (!player) return;

    this.currentAuctionPlayer = player;

    // Popola dettagli giocatore nel modale (Header e Colonna Centrale)
    const roleBadge = document.getElementById('modal-player-role');
    if (roleBadge) {
      roleBadge.textContent = player.ruolo;
      roleBadge.className = `role-pill role-${player.ruolo}`;
    }

    const nameElem = document.getElementById('modal-player-name');
    if (nameElem) nameElem.textContent = player.nome;

    const teamElem = document.getElementById('modal-player-team');
    if (teamElem) teamElem.textContent = player.squadra;

    const roleBadgeCenter = document.getElementById('modal-player-role-center');
    if (roleBadgeCenter) {
      roleBadgeCenter.textContent = player.ruolo;
      roleBadgeCenter.className = `role-pill role-${player.ruolo}`;
    }

    const nameElemCenter = document.getElementById('modal-player-name-center');
    if (nameElemCenter) nameElemCenter.textContent = player.nome;

    const teamElemCenter = document.getElementById('modal-player-team-center');
    if (teamElemCenter) teamElemCenter.textContent = player.squadra;

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

    // Popola Rendimento Reale Certificato (Dati Storici Serie A)
    this.populateHistoricalStatsSecret(player);

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
      let defaultManagerId = '';

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

        // Pre-seleziona il primo manager idoneo all'acquisto
        if (!defaultManagerId && !isRoleFull && !isTeamFull && maxBid >= 1) {
          defaultManagerId = m.id;
        }

        optionsHtml += `<option value="${m.id}" ${disabledAttr}>${m.name}${statusText}</option>`;
      });
      managerSelect.innerHTML = optionsHtml;

      // Auto-selezione primo manager idoneo
      if (defaultManagerId) {
        managerSelect.value = defaultManagerId;
      }
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

    this.updateBidValidationMessage();
    this.renderTacticalPitch();

    // Inizializza il timer d'asta sul preset predefinito (8s) e fermo (avvio solo manuale)
    this.resetAuctionTimer(8);

    // Mostra modale Control Room
    const modal = document.getElementById('modal-battitore');
    if (modal) modal.classList.remove('hidden');

    // Notifica Schermo TV Pubblico dell'apertura asta
    const selectedManager = managerSelect && managerSelect.value ? this.state.getManager(managerSelect.value) : null;
    this.broadcastSync('AUCTION_START', {
      player: {
        id: player.id,
        nome: player.nome,
        ruolo: player.ruolo,
        squadra: player.squadra
      },
      currentBid: 0,
      manager: selectedManager ? { id: selectedManager.id, name: selectedManager.name } : null,
      timer: {
        presetSeconds: this.auctionTimer.presetSeconds,
        remainingMs: this.auctionTimer.remainingMs,
        isRunning: false,
        isPaused: false
      }
    });

    // Sincronizzazione Firebase Realtime Database (/fanta_live/current)
    if (window.fantaDb) {
      window.fantaDb.ref('fanta_live/current').set({
        active: true,
        player: player.nome,
        role: player.ruolo,
        team: player.squadra,
        currentBid: 0,
        highestBidder: "Nessuno",
        timestamp: Date.now()
      });
    }
  }

  closeAuctionModal() {
    this.resetAuctionTimer();
    const modal = document.getElementById('modal-battitore');
    if (modal) modal.classList.add('hidden');
    const popoverSecret = document.getElementById('popover-secret-intel');
    if (popoverSecret) popoverSecret.classList.add('hidden');
    const btnSecret = document.getElementById('btn-secret-intel');
    if (btnSecret) btnSecret.classList.remove('active');
    this.currentAuctionPlayer = null;

    // Notifica Schermo TV Pubblico della chiusura asta
    this.broadcastSync('AUCTION_CLOSE', {
      managers: this.getCleanManagersForTv(),
      league: this.state.getLeagueConfig(),
      slotsConfig: this.state.getSlotsConfig()
    });

    // Sincronizzazione Firebase Realtime Database
    if (window.fantaDb) {
      window.fantaDb.ref('fanta_live/current').set({
        active: false,
        timestamp: Date.now()
      });
    }
  }

  updateBidValidationMessage() {
    const confirmBtn = document.getElementById('btn-confirm-bid');
    const priceInput = document.getElementById('bid-price-input');

    // Il pulsante deve rimanere SEMPRE cliccabile (gestirà gli alert in handleAssignBid)
    if (confirmBtn) confirmBtn.disabled = false;

    if (!this.currentAuctionPlayer) return;

    const price = priceInput ? (parseInt(priceInput.value, 10) || 0) : 0;

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

    // Aggiorna indicatore contestuale Target Budget di Reparto nei dati segreti
    this.updateSecretDeptBudget(this.currentAuctionPlayer, price);

    // Aggiorna dinamicamente il pannello "Live Radar Partecipanti" e il "Campetto Tattico"
    this.renderLiveRadar();
    this.renderTacticalPitch();

    // Notifica Schermo TV Pubblico della nuova offerta / manager
    const managerSelect = document.getElementById('bid-manager-select');
    const selectedManager = managerSelect && managerSelect.value ? this.state.getManager(managerSelect.value) : null;
    this.broadcastSync('BID_UPDATE', {
      currentBid: price,
      manager: selectedManager ? { id: selectedManager.id, name: selectedManager.name } : null
    });
  }

  // =========================================================================
  // LIVE RADAR PARTECIPANTI (CREDITI IN TEMPO REALE & CLICK-TO-SELECT)
  // =========================================================================
  renderLiveRadar() {
    const grid = document.getElementById('live-radar-grid');
    const roleIndicator = document.getElementById('live-radar-role-indicator');
    const summaryIndicator = document.getElementById('live-radar-summary');
    const managerSelect = document.getElementById('bid-manager-select');
    const priceInput = document.getElementById('bid-price-input');

    if (!grid || !this.currentAuctionPlayer) return;

    const player = this.currentAuctionPlayer;
    const currentPrice = priceInput ? (parseInt(priceInput.value, 10) || 0) : 0;
    const selectedManagerId = managerSelect ? managerSelect.value : '';
    const userManagerId = this.state.getUserManagerId();

    if (roleIndicator) {
      roleIndicator.textContent = `Ruolo ${player.ruolo}`;
      roleIndicator.className = `live-radar-role-badge role-pill role-${player.ruolo}`;
    }

    const managers = this.state.getAllManagers();
    const slotsConfig = this.state.getSlotsConfig();
    let inRaceCount = 0;

    let html = '';

    managers.forEach(m => {
      const counts = this.auction.getManagerRosterCounts(m.id);
      const freeSlots = this.auction.getManagerFreeSlots(m.id);
      const remainingCredits = this.state.getManagerRemainingCredits(m.id);
      const maxBid = this.auction.calculateMaxBid(m.id);

      const isRoleFull = freeSlots[player.ruolo] <= 0;
      const isTeamFull = freeSlots.total <= 0;
      const isMyTeam = (m.id === userManagerId);

      // Determinazione dello stato rispetto all'offerta corrente
      let statusClass = '';
      let badgeHtml = '';
      let isClickable = false;

      // Soglia richiesta per rilanciare: se l'offerta è 0, serve poter spendere almeno 1 credito
      const requiredBid = Math.max(1, currentPrice);

      if (isTeamFull || isRoleFull) {
        // STATO 3: Slot Pieni (Disabilitato / Grigio scuro)
        statusClass = 'status-full';
        badgeHtml = `<span class="radar-badge">${isTeamFull ? 'ROSA PIENA' : 'RUOLO PIENO'}</span>`;
        isClickable = false;
      } else if (maxBid < requiredBid) {
        // STATO 2: Manager Fuori Budget (Opacità al 40%, Testo Rosso/Grigio)
        statusClass = 'status-out';
        badgeHtml = `<span class="radar-badge">OUT BUDGET (${maxBid} cr)</span>`;
        isClickable = false;
      } else {
        // STATO 1: Manager Attivo / In Gara (Bordo o Badge Verde)
        statusClass = 'status-active';
        badgeHtml = `<span class="radar-badge">🟢 IN GARA</span>`;
        isClickable = true;
        inRaceCount++;
      }

      const isSelected = (m.id === selectedManagerId);
      const selectedClass = isSelected ? 'is-selected' : '';

      html += `
        <div class="radar-opponent-card ${statusClass} ${selectedClass}" 
             data-manager-id="${m.id}" 
             data-clickable="${isClickable}"
             tabindex="0"
             role="button"
             aria-pressed="${isSelected}"
             title="${m.name}: Residui ${remainingCredits} cr, Max Offerta ${maxBid} cr. Clicca per selezionare.">
          <div class="radar-opponent-top">
            <div class="radar-opponent-name-box">
              <span class="radar-opponent-name">${m.name}</span>
              ${isMyTeam ? '<span class="radar-my-team-tag">TU</span>' : ''}
            </div>
            ${badgeHtml}
          </div>
          <div class="radar-opponent-finances">
            <span class="radar-val-res">Residui: <strong>${remainingCredits}</strong> cr</span>
            <span class="radar-val-max">Offerta Max: <strong>${maxBid}</strong> cr</span>
          </div>
          <div class="radar-slots-row">
            <span class="role-slot-pill ${player.ruolo === 'P' ? 'active-role-highlight' : ''} ${counts.P >= slotsConfig.P ? 'slot-full' : ''}">P: ${counts.P}/${slotsConfig.P}</span>
            <span class="role-slot-pill ${player.ruolo === 'D' ? 'active-role-highlight' : ''} ${counts.D >= slotsConfig.D ? 'slot-full' : ''}">D: ${counts.D}/${slotsConfig.D}</span>
            <span class="role-slot-pill ${player.ruolo === 'C' ? 'active-role-highlight' : ''} ${counts.C >= slotsConfig.C ? 'slot-full' : ''}">C: ${counts.C}/${slotsConfig.C}</span>
            <span class="role-slot-pill ${player.ruolo === 'A' ? 'active-role-highlight' : ''} ${counts.A >= slotsConfig.A ? 'slot-full' : ''}">A: ${counts.A}/${slotsConfig.A}</span>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;

    if (summaryIndicator) {
      summaryIndicator.textContent = `In corsa: ${inRaceCount}/${managers.length}`;
      summaryIndicator.style.color = inRaceCount > 0 ? '#10b981' : '#f87171';
    }

    // Click-to-Select listener su ciascuna card del Radar Avversari
    grid.querySelectorAll('.radar-opponent-card').forEach(card => {
      const handleSelect = () => {
        const isClickable = card.getAttribute('data-clickable') === 'true';
        const managerId = card.getAttribute('data-manager-id');
        if (!managerId) return;

        if (isClickable) {
          if (managerSelect) {
            managerSelect.value = managerId;
            this.updateBidValidationMessage();
            this.syncCurrentBidToFirebase();
          }
        } else {
          // Feedback se il manager non è idoneo
          const isFull = card.classList.contains('status-full');
          const isOut = card.classList.contains('status-out');
          if (isFull) {
            this.showToast('⚠️ Questo manager ha già esaurito gli slot per questo ruolo o ha la rosa piena!', 'warning');
          } else if (isOut) {
            this.showToast('⚠️ Questo manager non può rilanciare (Offerta Max inferiore al prezzo corrente)!', 'warning');
          }
        }
      };

      card.addEventListener('click', handleSelect);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });
    });
  }

  // =========================================================================
  // CAMPETTO TATTICO MANUALE & MIA SQUADRA (COLONNA DESTRA CONTROL ROOM)
  // =========================================================================
  renderTacticalPitch() {
    const pitch = document.getElementById('tactical-pitch');
    if (!pitch) return;

    // Formazioni supportate: 3-4-3, 4-3-3, 4-4-2, 3-5-2
    const formationsMap = {
      '3-4-3': { P: 1, D: 3, C: 4, A: 3 },
      '4-3-3': { P: 1, D: 4, C: 3, A: 3 },
      '4-4-2': { P: 1, D: 4, C: 4, A: 2 },
      '3-5-2': { P: 1, D: 3, C: 5, A: 2 }
    };

    const formationConfig = formationsMap[this.tacticalFormation] || formationsMap['4-3-3'];

    // Aggiorna stato attivo dei bottoni modulo (comportamento rigorosamente manuale)
    document.querySelectorAll('.btn-formation').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-formation') === this.tacticalFormation);
    });

    // Identifica la squadra dell'utente
    const userMgrId = this.state.getUserManagerId();
    const userMgr = this.state.getManager(userMgrId) || (this.state.getAllManagers() ? this.state.getAllManagers()[0] : null);

    const teamBadge = document.getElementById('tactical-team-name');
    if (teamBadge && userMgr) {
      teamBadge.textContent = userMgr.name;
    }

    // 1. Riepilogo Finanziario Personale
    const userRemaining = userMgr ? this.state.getManagerRemainingCredits(userMgr.id) : 0;
    const userRoster = userMgr ? (userMgr.roster || []) : [];
    const slotsConfig = this.state.getSlotsConfig();

    const currentRole = this.currentAuctionPlayer ? this.currentAuctionPlayer.ruolo : 'P';
    const budgetPlan = this.state.getBudgetPlan();
    const roleTarget = budgetPlan?.roles?.[currentRole]?.targetCredits || 0;
    const roleSpent = userRoster.filter(p => p.ruolo === currentRole).reduce((acc, p) => acc + (p.prezzo_acquisto || 0), 0);
    const roleRemPlanned = Math.max(0, roleTarget - roleSpent);

    const credElem = document.getElementById('tactical-user-credits');
    if (credElem) credElem.textContent = `${userRemaining} cr`;

    const slotsElem = document.getElementById('tactical-user-slots');
    if (slotsElem) slotsElem.textContent = `${userRoster.length}/${slotsConfig.total}`;

    const roleTagElem = document.getElementById('tactical-current-role');
    if (roleTagElem) roleTagElem.textContent = currentRole;

    const remBudgetElem = document.getElementById('tactical-role-rem-budget');
    if (remBudgetElem) remBudgetElem.textContent = `${roleRemPlanned} cr rimasti`;

    // 2. Ripartizione Titolari e Panchina
    const playersByRole = {
      P: userRoster.filter(p => p.ruolo === 'P'),
      D: userRoster.filter(p => p.ruolo === 'D'),
      C: userRoster.filter(p => p.ruolo === 'C'),
      A: userRoster.filter(p => p.ruolo === 'A')
    };

    const starters = {
      P: playersByRole.P.slice(0, formationConfig.P),
      D: playersByRole.D.slice(0, formationConfig.D),
      C: playersByRole.C.slice(0, formationConfig.C),
      A: playersByRole.A.slice(0, formationConfig.A)
    };

    const bench = [
      ...playersByRole.P.slice(formationConfig.P),
      ...playersByRole.D.slice(formationConfig.D),
      ...playersByRole.C.slice(formationConfig.C),
      ...playersByRole.A.slice(formationConfig.A)
    ];

    // Helper per renderizzare una linea del campetto
    const renderLine = (containerId, role, requiredCount, currentStarters) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      let lineHtml = '';
      for (let i = 0; i < requiredCount; i++) {
        const player = currentStarters[i];
        if (player) {
          lineHtml += `
            <div class="pitch-slot occupied" title="${player.nome} (${player.squadra || '-'}): ${player.prezzo_acquisto} cr">
              <div class="pitch-badge-circle role-${role}">${role}</div>
              <span class="pitch-player-name">${player.nome}</span>
              <span class="pitch-player-price">${player.prezzo_acquisto} cr</span>
            </div>
          `;
        } else {
          lineHtml += `
            <div class="pitch-slot free" title="Posto da titolare libero per il ruolo ${role}">
              <span class="pitch-free-text">+ ${role} Libero</span>
            </div>
          `;
        }
      }
      container.innerHTML = lineHtml;
    };

    // Disposizione: A in alto, C, D, P in basso
    renderLine('pitch-line-A', 'A', formationConfig.A, starters.A);
    renderLine('pitch-line-C', 'C', formationConfig.C, starters.C);
    renderLine('pitch-line-D', 'D', formationConfig.D, starters.D);
    renderLine('pitch-line-P', 'P', formationConfig.P, starters.P);

    // 3. Panchina (Esuberi Titolari)
    const benchContainer = document.getElementById('tactical-bench-list');
    const benchCountElem = document.getElementById('tactical-bench-count');
    if (benchCountElem) benchCountElem.textContent = bench.length;

    if (benchContainer) {
      if (bench.length === 0) {
        benchContainer.innerHTML = `<span class="bench-empty-msg">Nessun panchinaro (tutti i tuoi giocatori sono negli 11 titolari o rosa ancora da completare).</span>`;
      } else {
        let benchHtml = '';
        bench.forEach(p => {
          benchHtml += `
            <div class="bench-player-chip" title="${p.nome} (${p.squadra || '-'}) - Pagato ${p.prezzo_acquisto} cr">
              <span class="role-pill role-${p.ruolo} bench-role-tag">${p.ruolo}</span>
              <span style="font-weight:600;">${p.nome}</span>
              <span class="bench-price">(${p.prezzo_acquisto} cr)</span>
            </div>
          `;
        });
        benchContainer.innerHTML = benchHtml;
      }
    }
  }

  // POPOLA BLOCCO RENDIMENTO REALE CERTIFICATO (DATI SEGRETI)
  populateHistoricalStatsSecret(player) {
    const badgesContainer = document.getElementById('secret-stats-badges');
    const contentContainer = document.getElementById('secret-stats-content');
    if (!badgesContainer || !contentContainer) return;

    badgesContainer.innerHTML = '';
    contentContainer.innerHTML = '';

    const histStats = window.getHistoricalStats ? window.getHistoricalStats(player) : null;

    if (!histStats || (histStats.carriera.tot_pres === 0 && histStats.last.pres === 0)) {
      // Caso Calciatore Nuovo / Esordiente
      contentContainer.innerHTML = `
        <div class="stats-rookie-box">
          <span class="rookie-icon">🌟</span>
          <span class="rookie-text">Esordiente in Serie A / Nessuno storico precedente</span>
        </div>
      `;
      return;
    }

    const { last, carriera } = histStats;
    const isGK = player.ruolo === 'P' || (last.gol_sub > 0 || last.rig_par > 0);

    // 1. Badge Tattici in Header Popover
    let badgesHtml = '';
    const hasPenaltyInLast = last.rig && last.rig !== '0/0' && !last.rig.startsWith('0/');
    if (hasPenaltyInLast || carriera.has_penalties) {
      badgesHtml += `<span class="tactical-mini-badge badge-penalty" title="Rigorista con almeno 1 rigore calciato">🎯 Rigorista</span>`;
    }
    if (last.mv >= 6.15 && last.pres > 0) {
      badgesHtml += `<span class="tactical-mini-badge badge-modifier" title="Media Voto pura >= 6.15">🛡️ Ottimo da Modificatore</span>`;
    }
    badgesContainer.innerHTML = badgesHtml;

    // 2. Sezione Ultima Stagione
    const seasonLabel = last.season || '2025-26';
    const mvStr = last.mv ? last.mv.toFixed(2) : '-';
    const fmStr = last.fm ? last.fm.toFixed(2) : '-';

    let subPillsHtml = '';
    if (isGK) {
      subPillsHtml = `
        <div class="stats-pills-row stats-sub-pills">
          <div class="stat-pill stat-pill-sm">
            <span class="stat-pill-label">Gol Subiti:</span>
            <strong class="stat-pill-val" style="color: #f87171;">${last.gol_sub}</strong>
          </div>
          <div class="stat-pill stat-pill-sm">
            <span class="stat-pill-label">Rigori Parati:</span>
            <strong class="stat-pill-val" style="color: #60a5fa;">${last.rig_par}</strong>
          </div>
        </div>
      `;
    } else {
      const pills = [];
      if (last.gol > 0) {
        pills.push(`
          <div class="stat-pill stat-pill-sm">
            <span class="stat-pill-label">Gol:</span>
            <strong class="stat-pill-val" style="color: #34d399;">${last.gol}</strong>
          </div>
        `);
      }
      if (last.ass > 0) {
        pills.push(`
          <div class="stat-pill stat-pill-sm">
            <span class="stat-pill-label">Assist:</span>
            <strong class="stat-pill-val" style="color: #38bdf8;">${last.ass}</strong>
          </div>
        `);
      }
      if (last.rig && last.rig !== '0/0' && !last.rig.startsWith('0/')) {
        pills.push(`
          <div class="stat-pill stat-pill-sm">
            <span class="stat-pill-label">Rigori:</span>
            <strong class="stat-pill-val" style="color: #fbbf24;">${last.rig}</strong>
          </div>
        `);
      }

      if (pills.length > 0) {
        subPillsHtml = `<div class="stats-pills-row stats-sub-pills">${pills.join('')}</div>`;
      }
    }

    // 3. Trend Storico / Carriera
    const avgFmStr = carriera.avg_fm ? carriera.avg_fm.toFixed(2) : fmStr;

    contentContainer.innerHTML = `
      <div class="stats-season-section">
        <div class="stats-season-title">
          <span>Ultima Stagione (<strong>${seasonLabel}</strong>)</span>
          ${last.team ? `<span style="font-size: 0.675rem; color: #64748b;">${last.team}</span>` : ''}
        </div>
        <div class="stats-pills-row">
          <div class="stat-pill">
            <span class="stat-pill-label">Presenze</span>
            <strong class="stat-pill-val">${last.pres}</strong>
          </div>
          <div class="stat-pill">
            <span class="stat-pill-label">MV Pura</span>
            <strong class="stat-pill-val val-mv">${mvStr}</strong>
            <small>(pura)</small>
          </div>
          <div class="stat-pill">
            <span class="stat-pill-label">Fantamedia</span>
            <strong class="stat-pill-val val-fm">${fmStr}</strong>
            <small>(con bonus)</small>
          </div>
        </div>
        ${subPillsHtml}
      </div>

      <div class="stats-career-section">
        <div class="stats-career-title">Trend Storico / Carriera Serie A</div>
        <div class="stats-career-line">
          Presenze Totali: <strong>${carriera.tot_pres}</strong> &nbsp;|&nbsp; Fantamedia Media: <strong>${avgFmStr}</strong>
          ${!isGK && carriera.tot_gol > 0 ? `&nbsp;|&nbsp; Gol: <strong>${carriera.tot_gol}</strong>` : ''}
          ${isGK && carriera.tot_gol_sub > 0 ? `&nbsp;|&nbsp; Subiti: <strong>${carriera.tot_gol_sub}</strong>` : ''}
        </div>
      </div>
    `;
  }

  handleAssignBid() {
    if (!this.currentAuctionPlayer) return;

    const managerSelect = document.getElementById('bid-manager-select');
    const priceInput = document.getElementById('bid-price-input');

    const managerId = managerSelect ? managerSelect.value : null;
    const price = priceInput ? parseInt(priceInput.value, 10) : 0;

    // 1. Controllo se il Manager è selezionato: se manca, bordo rosso lampeggiante + alert
    if (!managerId) {
      if (managerSelect) {
        managerSelect.classList.remove('field-error-flash');
        void managerSelect.offsetWidth; // trigger reflow
        managerSelect.classList.add('field-error-flash');
        managerSelect.focus();
        setTimeout(() => managerSelect.classList.remove('field-error-flash'), 1600);
      }
      this.showToast('⚠️ Seleziona prima a quale Manager assegnare il calciatore!', 'warning');
      return;
    }

    // 2. Controllo se il prezzo è valido (almeno 1 credito)
    if (price < 1) {
      if (priceInput) {
        priceInput.classList.remove('field-error-flash');
        void priceInput.offsetWidth;
        priceInput.classList.add('field-error-flash');
        priceInput.focus();
        setTimeout(() => priceInput.classList.remove('field-error-flash'), 1600);
      }
      this.showToast('⚠️ Inserisci un\'offerta valida (almeno 1 credito) per aggiudicare il calciatore.', 'warning');
      return;
    }

    // 3. Validazione regole asta (budget, crediti di riserva, slot pieni)
    const validation = this.auction.validateBid(managerId, this.currentAuctionPlayer, price);
    if (!validation.allowed) {
      this.showToast(`⛔ Assegnazione bloccata: ${validation.reason}`, 'error');
      return;
    }

    const result = this.auction.assignPlayer(managerId, this.currentAuctionPlayer.id, price);

    if (result.success) {
      this.showToast(`🎉 ${result.player.nome} assegnato a ${result.manager.name} per ${result.price} cr!`, 'success');
      
      // Notifica Schermo TV Pubblico dell'assegnazione
      this.broadcastSync('AUCTION_SOLD', {
        player: {
          id: result.player.id,
          nome: result.player.nome,
          ruolo: result.player.ruolo,
          squadra: result.player.squadra
        },
        manager: {
          id: result.manager.id,
          name: result.manager.name
        },
        price: result.price,
        managers: this.getCleanManagersForTv(),
        league: this.state.getLeagueConfig(),
        slotsConfig: this.state.getSlotsConfig()
      });

      this.closeAuctionModal();
      this.syncManagersToFirebase();
      this.renderHeaderStats();
      this.renderAuctionList();
      this.renderTeamsBoard();
      this.renderHistory();
      this.renderTierGuideModal();
      this.renderDeptBudgetWidget();
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
      this.broadcastSync('ROSTER_UPDATE', {
        managers: this.getCleanManagersForTv(),
        league: this.state.getLeagueConfig(),
        slotsConfig: this.state.getSlotsConfig()
      });
      this.syncManagersToFirebase();
      this.renderHeaderStats();
      this.renderAuctionList();
      this.renderTeamsBoard();
      this.renderHistory();
      this.renderTierGuideModal();
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
      this.broadcastSync('ROSTER_UPDATE', {
        managers: this.getCleanManagersForTv(),
        league: this.state.getLeagueConfig(),
        slotsConfig: this.state.getSlotsConfig()
      });
      this.syncManagersToFirebase();
      this.renderHeaderStats();
      this.renderAuctionList();
      this.renderTeamsBoard();
      this.renderHistory();
      this.renderTierGuideModal();
      this.renderDeptBudgetWidget();
    } else {
      this.showToast(`Errore annullamento: ${res.error}`, 'error');
    }
  }

  callRandomPlayer() {
    this.openRandomPickerModal();
  }

  // =========================================================================
  // MODALE CHIAMA A SORTE TRA I LIBERI (ESTRAZIONE CASUALE PER RUOLO E FASCIA)
  // =========================================================================
  openRandomPickerModal() {
    const modal = document.getElementById('modal-random-picker');
    if (!modal) return;

    // Se nella tabella principale c'è un filtro ruolo attivo, sincronizzalo per comodità
    if (this.filters.role && this.filters.role !== 'ALL') {
      this.randomPickerRole = this.filters.role;
    }

    this.updateRandomRoleButtons();
    this.updateRandomTierPills();
    this.updateRandomAvailableCounter();

    const card = document.getElementById('random-single-card');
    const ribbon = document.getElementById('random-slot-status-ribbon');
    const statusText = document.getElementById('random-slot-status-text');
    const btnInstant = document.getElementById('btn-start-auction-instant');

    if (this.lastExtractedPlayer && (!this.lastExtractedPlayer.proprietario_id && this.lastExtractedPlayer.stato !== 'acquistato')) {
      this.showExtractedPlayerResult(this.lastExtractedPlayer, false);
    } else {
      if (card) {
        card.classList.remove('is-shuffling', 'is-won');
      }
      if (ribbon) {
        ribbon.className = 'random-slot-status-ribbon';
      }
      if (statusText) {
        statusText.textContent = '🎲 PRONTO PER L\'ESTRAZIONE';
      }

      let roleIcon = '🎲';
      let roleLetter = 'ALL';
      if (this.randomPickerRole === 'P') { roleIcon = '🧤'; roleLetter = 'P'; }
      else if (this.randomPickerRole === 'D') { roleIcon = '🛡️'; roleLetter = 'D'; }
      else if (this.randomPickerRole === 'C') { roleIcon = '⚙️'; roleLetter = 'C'; }
      else if (this.randomPickerRole === 'A') { roleIcon = '⚡'; roleLetter = 'A'; }

      const rolePill = document.getElementById('random-slot-role-pill');
      if (rolePill) {
        rolePill.textContent = roleIcon;
        rolePill.className = `role-pill role-${roleLetter}`;
      }

      const nameElem = document.getElementById('random-slot-player-name');
      if (nameElem) {
        nameElem.textContent = '-- Premi Estrai Calciatore --';
      }

      const teamElem = document.getElementById('random-slot-team');
      if (teamElem) teamElem.textContent = 'Tutte le Squadre';

      const fasciaElem = document.getElementById('random-slot-fascia');
      if (fasciaElem) fasciaElem.textContent = 'Qualsiasi Fascia';

      const extraElem = document.getElementById('random-slot-extra');
      if (extraElem) extraElem.classList.add('hidden');

      if (btnInstant) btnInstant.disabled = true;
    }

    modal.classList.remove('hidden');
  }

  closeRandomPickerModal() {
    if (this.isRouletteSpinning && this.rouletteIntervalId) {
      clearInterval(this.rouletteIntervalId);
      this.rouletteIntervalId = null;
      this.isRouletteSpinning = false;
      const btnDraw = document.getElementById('btn-execute-draw');
      if (btnDraw) btnDraw.disabled = false;
    }
    const modal = document.getElementById('modal-random-picker');
    if (modal) modal.classList.add('hidden');
  }

  setRandomRole(role) {
    if (!role) return;
    this.randomPickerRole = role;
    this.updateRandomRoleButtons();
    this.updateRandomAvailableCounter();

    // Se non c'è un giocatore estratto valido per il nuovo ruolo, resetta la card
    if (!this.lastExtractedPlayer || (this.randomPickerRole !== 'ALL' && String(this.lastExtractedPlayer.ruolo).toUpperCase() !== this.randomPickerRole)) {
      const card = document.getElementById('random-single-card');
      const ribbon = document.getElementById('random-slot-status-ribbon');
      const statusText = document.getElementById('random-slot-status-text');
      const btnInstant = document.getElementById('btn-start-auction-instant');

      if (card) card.classList.remove('is-shuffling', 'is-won');
      if (ribbon) ribbon.className = 'random-slot-status-ribbon';
      if (statusText) statusText.textContent = '🎲 PRONTO PER L\'ESTRAZIONE';

      let roleIcon = '🎲';
      let roleLetter = 'ALL';
      if (this.randomPickerRole === 'P') { roleIcon = '🧤'; roleLetter = 'P'; }
      else if (this.randomPickerRole === 'D') { roleIcon = '🛡️'; roleLetter = 'D'; }
      else if (this.randomPickerRole === 'C') { roleIcon = '⚙️'; roleLetter = 'C'; }
      else if (this.randomPickerRole === 'A') { roleIcon = '⚡'; roleLetter = 'A'; }

      const rolePill = document.getElementById('random-slot-role-pill');
      if (rolePill) {
        rolePill.textContent = roleIcon;
        rolePill.className = `role-pill role-${roleLetter}`;
      }

      const nameElem = document.getElementById('random-slot-player-name');
      if (nameElem) nameElem.textContent = '-- Premi Estrai Calciatore --';

      const teamElem = document.getElementById('random-slot-team');
      if (teamElem) teamElem.textContent = 'Tutte le Squadre';

      const fasciaElem = document.getElementById('random-slot-fascia');
      if (fasciaElem) fasciaElem.textContent = 'Qualsiasi Fascia';

      const extraElem = document.getElementById('random-slot-extra');
      if (extraElem) extraElem.classList.add('hidden');

      if (btnInstant) btnInstant.disabled = true;
    }
  }

  updateRandomRoleButtons() {
    document.querySelectorAll('.btn-random-role').forEach(btn => {
      const r = btn.getAttribute('data-random-role');
      btn.classList.toggle('active', r === this.randomPickerRole);
    });

    // Aggiorna etichetta del tasto centrale
    const btnDraw = document.getElementById('btn-execute-draw');
    if (btnDraw) {
      let roleLabel = 'Calciatore';
      if (this.randomPickerRole === 'P') roleLabel = 'Portiere';
      else if (this.randomPickerRole === 'D') roleLabel = 'Difensore';
      else if (this.randomPickerRole === 'C') roleLabel = 'Centrocampista';
      else if (this.randomPickerRole === 'A') roleLabel = 'Attaccante';
      btnDraw.innerHTML = `🎲 Estrai ${roleLabel} a Sorte`;
    }
  }

  toggleRandomTier(tierKey) {
    if (!tierKey) return;
    if (tierKey === 'all') {
      this.randomPickerTiers = new Set(['all']);
    } else {
      this.randomPickerTiers.delete('all');
      if (this.randomPickerTiers.has(tierKey)) {
        this.randomPickerTiers.delete(tierKey);
        if (this.randomPickerTiers.size === 0) {
          this.randomPickerTiers.add('all');
        }
      } else {
        this.randomPickerTiers.add(tierKey);
      }
    }
    this.updateRandomTierPills();
    this.updateRandomAvailableCounter();
  }

  updateRandomTierPills() {
    document.querySelectorAll('.btn-random-tier').forEach(btn => {
      const k = btn.getAttribute('data-tier-key');
      btn.classList.toggle('active', this.randomPickerTiers.has(k));
    });
  }

  getRandomEligiblePlayers() {
    const all = this.state.getAllPlayers();
    return all.filter(p => {
      // Solo giocatori liberi
      const isFree = (!p.proprietario_id && p.stato !== 'acquistato');
      if (!isFree) return false;

      // Filtro Ruolo
      if (this.randomPickerRole && this.randomPickerRole !== 'ALL') {
        if (String(p.ruolo || '').toUpperCase() !== this.randomPickerRole) {
          return false;
        }
      }

      // Filtro Fascia
      if (this.randomPickerTiers && !this.randomPickerTiers.has('all')) {
        const info = this.getCanonicalTierInfo(p.fascia);
        if (!this.randomPickerTiers.has(info.key)) {
          return false;
        }
      }

      return true;
    });
  }

  updateRandomAvailableCounter() {
    const pool = this.getRandomEligiblePlayers();
    const countVal = document.getElementById('random-pool-count-val');
    const labelElem = document.getElementById('random-pool-count-label');
    const btnDraw = document.getElementById('btn-execute-draw');

    let roleText = 'Calciatori';
    if (this.randomPickerRole === 'P') roleText = 'Portieri';
    else if (this.randomPickerRole === 'D') roleText = 'Difensori';
    else if (this.randomPickerRole === 'C') roleText = 'Centrocampisti';
    else if (this.randomPickerRole === 'A') roleText = 'Attaccanti';

    if (labelElem) {
      labelElem.innerHTML = `${roleText} liberi disponibili: <strong id="random-pool-count-val">${pool.length}</strong>`;
    } else if (countVal) {
      countVal.textContent = pool.length;
    }

    if (btnDraw) {
      btnDraw.disabled = pool.length === 0;
      if (pool.length === 0) {
        btnDraw.title = 'Nessun calciatore disponibile con i filtri selezionati';
      } else {
        btnDraw.title = 'Clicca per estrarre a sorte con animazione suspense';
      }
    }
  }

  drawRandomPlayer() {
    if (this.isRouletteSpinning) return;

    const pool = this.getRandomEligiblePlayers();
    if (pool.length === 0) {
      this.showToast('Nessun calciatore libero disponibile per i filtri selezionati!', 'warning');
      return;
    }

    this.isRouletteSpinning = true;

    // Disabilita tasti durante lo spin
    const btnDraw = document.getElementById('btn-execute-draw');
    const btnInstant = document.getElementById('btn-start-auction-instant');
    if (btnDraw) btnDraw.disabled = true;
    if (btnInstant) btnInstant.disabled = true;

    const card = document.getElementById('random-single-card');
    const ribbon = document.getElementById('random-slot-status-ribbon');
    const statusText = document.getElementById('random-slot-status-text');

    if (card) {
      card.classList.remove('is-won');
      card.classList.add('is-shuffling');
    }
    if (ribbon) {
      ribbon.className = 'random-slot-status-ribbon is-spinning';
    }
    if (statusText) {
      statusText.textContent = '⚡ ESTRAZIONE IN CORSO...';
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    let ticks = 0;
    const maxTicks = 16; // ~1 secondo a 60ms

    this.rouletteIntervalId = setInterval(() => {
      ticks++;
      const randomCandidate = pool[Math.floor(Math.random() * pool.length)];

      const nameElem = document.getElementById('random-slot-player-name');
      const teamElem = document.getElementById('random-slot-team');
      const roleElem = document.getElementById('random-slot-role-pill');
      const fasciaElem = document.getElementById('random-slot-fascia');
      const extraElem = document.getElementById('random-slot-extra');

      if (nameElem) nameElem.textContent = randomCandidate.nome;
      if (teamElem) teamElem.textContent = randomCandidate.squadra;
      if (fasciaElem) fasciaElem.textContent = randomCandidate.fascia || 'Generale';
      if (roleElem) {
        roleElem.textContent = randomCandidate.ruolo;
        roleElem.className = `role-pill role-${randomCandidate.ruolo}`;
      }
      if (extraElem) extraElem.classList.add('hidden');

      if (window.soundEngine) {
        window.soundEngine.playTick();
      }

      if (ticks >= maxTicks) {
        clearInterval(this.rouletteIntervalId);
        this.rouletteIntervalId = null;
        this.isRouletteSpinning = false;

        this.showExtractedPlayerResult(chosen, true);

        if (btnDraw) {
          btnDraw.disabled = false;
          let roleLabel = 'Calciatore';
          if (this.randomPickerRole === 'P') roleLabel = 'Portiere';
          else if (this.randomPickerRole === 'D') roleLabel = 'Difensore';
          else if (this.randomPickerRole === 'C') roleLabel = 'Centrocampista';
          else if (this.randomPickerRole === 'A') roleLabel = 'Attaccante';
          btnDraw.innerHTML = `🎲 Estrai un Altro ${roleLabel}`;
        }
      }
    }, 60);
  }

  showExtractedPlayerResult(player, playAudio = true) {
    this.lastExtractedPlayer = player;

    const card = document.getElementById('random-single-card');
    const ribbon = document.getElementById('random-slot-status-ribbon');
    const statusText = document.getElementById('random-slot-status-text');

    if (card) {
      card.classList.remove('is-shuffling');
      card.classList.add('is-won');
    }
    if (ribbon) {
      ribbon.className = 'random-slot-status-ribbon is-extracted';
    }
    if (statusText) {
      statusText.textContent = '⭐ CALCIATORE ESTRATTO A SORTE';
    }

    const rolePill = document.getElementById('random-slot-role-pill');
    if (rolePill) {
      rolePill.textContent = player.ruolo;
      rolePill.className = `role-pill role-${player.ruolo}`;
    }

    const nameElem = document.getElementById('random-slot-player-name');
    if (nameElem) nameElem.textContent = player.nome;

    const teamElem = document.getElementById('random-slot-team');
    if (teamElem) teamElem.textContent = player.squadra;

    const fasciaElem = document.getElementById('random-slot-fascia');
    if (fasciaElem) fasciaElem.textContent = player.fascia || 'Generale';

    const extraElem = document.getElementById('random-slot-extra');
    if (extraElem) {
      if (player.prezzo_massimo_imposto) {
        extraElem.textContent = `Max: ${player.prezzo_massimo_imposto} cr`;
        extraElem.classList.remove('hidden');
      } else {
        extraElem.classList.add('hidden');
      }
    }

    const btnInstant = document.getElementById('btn-start-auction-instant');
    if (btnInstant) btnInstant.disabled = false;

    if (playAudio && window.soundEngine) {
      window.soundEngine.playSuccess();
    }
  }

  startAuctionFromRandom() {
    if (!this.lastExtractedPlayer) return;
    const playerId = this.lastExtractedPlayer.id;
    this.closeRandomPickerModal();
    this.openAuctionModal(playerId);
  }

  // =========================================================================
  // TIMER MANUALE BATTITORE D'ASTA
  // =========================================================================
  setTimerPreset(seconds) {
    this.auctionTimer.presetSeconds = seconds;
    document.querySelectorAll('.btn-timer-preset').forEach(b => {
      b.classList.toggle('active', parseInt(b.getAttribute('data-preset'), 10) === seconds);
    });
    this.resetAuctionTimer(seconds);
  }

  toggleAuctionTimer() {
    if (this.auctionTimer.isRunning) {
      this.pauseAuctionTimer();
    } else {
      this.startAuctionTimer();
    }
  }

  startAuctionTimer() {
    if (this.auctionTimer.isRunning) return;

    if (this.auctionTimer.remainingMs <= 0) {
      this.auctionTimer.remainingMs = this.auctionTimer.presetSeconds * 1000;
    }

    this.auctionTimer.isRunning = true;
    this.auctionTimer.isPaused = false;
    this.auctionTimer.lastTickSecond = Math.ceil(this.auctionTimer.remainingMs / 1000);
    this.auctionTimer.lastTimestamp = performance.now();

    const iconElem = document.getElementById('btn-timer-icon');
    const labelElem = document.getElementById('btn-timer-label');
    const btnMain = document.getElementById('btn-timer-start-pause');
    const statusBadge = document.getElementById('auction-timer-status');
    const bannerExpired = document.getElementById('auction-timer-expired-banner');

    if (iconElem) iconElem.textContent = '⏸';
    if (labelElem) labelElem.textContent = 'Pausa';
    if (btnMain) btnMain.classList.add('is-running');
    if (bannerExpired) bannerExpired.classList.add('hidden');

    if (statusBadge) {
      statusBadge.textContent = 'IN CORSO';
      statusBadge.className = 'auction-timer-status-badge status-running';
    }

    if (this.auctionTimer.intervalId) clearInterval(this.auctionTimer.intervalId);

    // Notifica Schermo TV Pubblico dell'avvio timer
    this.broadcastSync('TIMER_START', {
      remainingMs: this.auctionTimer.remainingMs,
      presetSeconds: this.auctionTimer.presetSeconds
    });

    this.auctionTimer.intervalId = setInterval(() => {
      const now = performance.now();
      const delta = now - this.auctionTimer.lastTimestamp;
      this.auctionTimer.lastTimestamp = now;

      this.auctionTimer.remainingMs = Math.max(0, this.auctionTimer.remainingMs - delta);

      // Beep per gli ultimi 3 secondi su passaggio di secondo
      const currentSec = Math.ceil(this.auctionTimer.remainingMs / 1000);
      if (currentSec !== this.auctionTimer.lastTickSecond) {
        this.auctionTimer.lastTickSecond = currentSec;
        if (currentSec === 3 || currentSec === 2 || currentSec === 1) {
          if (!this.auctionTimer.muted && window.soundEngine) {
            window.soundEngine.playTimerBeep(currentSec);
          }
        }
        // Sincronizzazione Schermo TV ad ogni passaggio di secondo
        this.broadcastSync('TIMER_TICK', {
          remainingMs: this.auctionTimer.remainingMs,
          presetSeconds: this.auctionTimer.presetSeconds
        });
      }

      this.renderAuctionTimer();

      if (this.auctionTimer.remainingMs <= 0) {
        this.onAuctionTimerExpired();
      }
    }, 50);
  }

  pauseAuctionTimer() {
    if (!this.auctionTimer.isRunning) return;

    if (this.auctionTimer.intervalId) {
      clearInterval(this.auctionTimer.intervalId);
      this.auctionTimer.intervalId = null;
    }

    this.auctionTimer.isRunning = false;
    this.auctionTimer.isPaused = true;

    // Notifica Schermo TV Pubblico della pausa timer
    this.broadcastSync('TIMER_PAUSE', {
      remainingMs: this.auctionTimer.remainingMs,
      presetSeconds: this.auctionTimer.presetSeconds
    });

    const iconElem = document.getElementById('btn-timer-icon');
    const labelElem = document.getElementById('btn-timer-label');
    const btnMain = document.getElementById('btn-timer-start-pause');
    const statusBadge = document.getElementById('auction-timer-status');

    if (iconElem) iconElem.textContent = '▶';
    if (labelElem) labelElem.textContent = 'Riprendi';
    if (btnMain) btnMain.classList.remove('is-running');

    if (statusBadge) {
      statusBadge.textContent = 'IN PAUSA';
      statusBadge.className = 'auction-timer-status-badge status-paused';
    }
  }

  resetAuctionTimer(targetSec = null) {
    if (this.auctionTimer.intervalId) {
      clearInterval(this.auctionTimer.intervalId);
      this.auctionTimer.intervalId = null;
    }

    this.auctionTimer.isRunning = false;
    this.auctionTimer.isPaused = false;

    if (targetSec !== null) {
      this.auctionTimer.presetSeconds = targetSec;
      document.querySelectorAll('.btn-timer-preset').forEach(b => {
        b.classList.toggle('active', parseInt(b.getAttribute('data-preset'), 10) === targetSec);
      });
    }

    this.auctionTimer.remainingMs = this.auctionTimer.presetSeconds * 1000;
    this.auctionTimer.lastTickSecond = null;

    // Notifica Schermo TV Pubblico del reset timer
    this.broadcastSync('TIMER_RESET', {
      remainingMs: this.auctionTimer.remainingMs,
      presetSeconds: this.auctionTimer.presetSeconds
    });

    const iconElem = document.getElementById('btn-timer-icon');
    const labelElem = document.getElementById('btn-timer-label');
    const btnMain = document.getElementById('btn-timer-start-pause');
    const statusBadge = document.getElementById('auction-timer-status');
    const bannerExpired = document.getElementById('auction-timer-expired-banner');

    if (iconElem) iconElem.textContent = '▶';
    if (labelElem) labelElem.textContent = 'Avvia Timer';
    if (btnMain) btnMain.classList.remove('is-running');
    if (bannerExpired) bannerExpired.classList.add('hidden');

    if (statusBadge) {
      statusBadge.textContent = 'PRONTO';
      statusBadge.className = 'auction-timer-status-badge status-idle';
    }

    this.renderAuctionTimer();
  }

  onAuctionTimerExpired() {
    if (this.auctionTimer.intervalId) {
      clearInterval(this.auctionTimer.intervalId);
      this.auctionTimer.intervalId = null;
    }

    this.auctionTimer.isRunning = false;
    this.auctionTimer.isPaused = false;
    this.auctionTimer.remainingMs = 0;

    // Notifica Schermo TV Pubblico della scadenza timer (Aggiudicato!)
    this.broadcastSync('TIMER_EXPIRED', {
      remainingMs: 0,
      presetSeconds: this.auctionTimer.presetSeconds
    });

    const iconElem = document.getElementById('btn-timer-icon');
    const labelElem = document.getElementById('btn-timer-label');
    const btnMain = document.getElementById('btn-timer-start-pause');
    const bannerExpired = document.getElementById('auction-timer-expired-banner');

    if (iconElem) iconElem.textContent = '↺';
    if (labelElem) labelElem.textContent = 'Reset';
    if (btnMain) btnMain.classList.remove('is-running');
    if (bannerExpired) bannerExpired.classList.remove('hidden');

    if (!this.auctionTimer.muted && window.soundEngine) {
      window.soundEngine.playTimerExpired();
    }

    this.renderAuctionTimer();
  }

  renderAuctionTimer() {
    const sec = Math.ceil(this.auctionTimer.remainingMs / 1000);
    const digitsElem = document.getElementById('auction-timer-val');
    const barElem = document.getElementById('auction-timer-bar');
    const statusBadge = document.getElementById('auction-timer-status');

    if (digitsElem) {
      digitsElem.textContent = String(sec).padStart(2, '0') + 's';
    }

    const totalMs = this.auctionTimer.presetSeconds * 1000;
    const pct = Math.max(0, Math.min(100, (this.auctionTimer.remainingMs / totalMs) * 100));

    if (barElem) {
      barElem.style.width = pct + '%';
    }

    // Gestione colori dinamici in base ai secondi rimasti
    if (sec > 3) {
      if (barElem) barElem.className = 'auction-timer-bar bar-green';
      if (digitsElem) digitsElem.className = 'auction-timer-val';
      if (statusBadge && this.auctionTimer.isRunning) {
        statusBadge.textContent = 'IN CORSO';
        statusBadge.className = 'auction-timer-status-badge status-running';
      }
    } else if (sec === 3 || sec === 2) {
      if (barElem) barElem.className = 'auction-timer-bar bar-yellow';
      if (digitsElem) digitsElem.className = 'auction-timer-val val-yellow';
      if (statusBadge && this.auctionTimer.isRunning) {
        statusBadge.textContent = 'ULTIMI SECONDI!';
        statusBadge.className = 'auction-timer-status-badge status-warning';
      }
    } else {
      // <= 1 secondo e 0s
      if (barElem) barElem.className = 'auction-timer-bar bar-red';
      if (digitsElem) digitsElem.className = 'auction-timer-val val-red';
      if (statusBadge) {
        statusBadge.textContent = 'AGGIUDICATO!';
        statusBadge.className = 'auction-timer-status-badge status-expired';
      }
    }
  }

  toggleTimerMute() {
    this.auctionTimer.muted = !this.auctionTimer.muted;
    const btn = document.getElementById('btn-timer-mute');
    if (btn) {
      btn.textContent = this.auctionTimer.muted ? '🔇' : '🔊';
      btn.classList.toggle('muted', this.auctionTimer.muted);
      btn.title = this.auctionTimer.muted ? 'Attiva audio timer' : 'Disattiva audio timer';
    }
  }

  onBidIncremented() {
    // Sui rilanci (+1, +5, +10, +20): interrompe il timer e reimposta sul default 8s
    this.resetAuctionTimer(8);
  }

  // =========================================================================
  // METODI SINCRONIZZAZIONE SCHERMO TV PUBBLICO (DUAL SCREEN OFFLINE)
  // =========================================================================
  broadcastSync(type, payload = {}) {
    const message = {
      type,
      payload,
      timestamp: Date.now()
    };

    if (this.syncChannel) {
      try {
        this.syncChannel.postMessage(message);
      } catch (e) {
        console.warn('BroadcastChannel sync error:', e);
      }
    }

    try {
      localStorage.setItem('fanta_asta_tv_sync', JSON.stringify(message));
    } catch (e) {
      console.warn('localStorage TV sync error:', e);
    }
  }

  handleSyncMessage(msg) {
    if (!msg || !msg.type) return;
    if (msg.type === 'REQUEST_SYNC') {
      this.sendFullStateSyncToTv();
    }
  }

  getCleanManagersForTv() {
    const managers = this.state.getAllManagers();
    const league = this.state.getLeagueConfig();
    const slotsConfig = this.state.getSlotsConfig();
    return managers.map(m => {
      const roster = (m.roster || []).map(p => ({
        id: p.id,
        nome: p.nome,
        ruolo: p.ruolo,
        squadra: p.squadra,
        prezzo_acquisto: p.prezzo_acquisto
      }));
      const spent = m.spent || 0;
      const remaining = (league.initialBudget || 500) - spent;
      const maxBid = this.auction.calculateMaxBid(m.id);
      const freeSlots = this.auction.getManagerFreeSlots(m.id);
      const counts = this.auction.getManagerRosterCounts(m.id);
      return {
        id: m.id,
        name: m.name,
        spent,
        remaining,
        maxBid,
        totalSlots: slotsConfig.total,
        roster,
        counts,
        freeSlots
      };
    });
  }

  sendFullStateSyncToTv() {
    const isAuctionActive = !!this.currentAuctionPlayer;
    const managerSelect = document.getElementById('bid-manager-select');
    const priceInput = document.getElementById('bid-price-input');

    const selectedManager = managerSelect && managerSelect.value ? this.state.getManager(managerSelect.value) : null;
    const currentPrice = priceInput ? (parseInt(priceInput.value, 10) || 0) : 0;

    this.broadcastSync('STATE_SYNC', {
      league: this.state.getLeagueConfig(),
      slotsConfig: this.state.getSlotsConfig(),
      managers: this.getCleanManagersForTv(),
      auction: isAuctionActive ? {
        player: {
          id: this.currentAuctionPlayer.id,
          nome: this.currentAuctionPlayer.nome,
          ruolo: this.currentAuctionPlayer.ruolo,
          squadra: this.currentAuctionPlayer.squadra
        },
        currentBid: currentPrice,
        manager: selectedManager ? { id: selectedManager.id, name: selectedManager.name } : null,
        timer: {
          presetSeconds: this.auctionTimer.presetSeconds,
          remainingMs: this.auctionTimer.remainingMs,
          isRunning: this.auctionTimer.isRunning,
          isPaused: this.auctionTimer.isPaused
        }
      } : null
    });
  }

  // =========================================================================
  // METODI SINCRONIZZAZIONE FIREBASE REALTIME DATABASE (REGIA, TV E MOBILE)
  // =========================================================================
  syncManagersToFirebase() {
    if (!window.fantaDb) return;
    try {
      const cleanManagers = this.getCleanManagersForTv();
      window.fantaDb.ref('fanta_live/managers').set(cleanManagers);
    } catch (e) {
      console.warn('Firebase sync managers error:', e);
    }
  }

  syncCurrentBidToFirebase() {
    if (!window.fantaDb || !this.currentAuctionPlayer || this.isUpdatingFromFirebase) return;
    try {
      const priceInput = document.getElementById('bid-price-input');
      const managerSelect = document.getElementById('bid-manager-select');
      const price = priceInput ? (parseInt(priceInput.value, 10) || 0) : 0;
      const selectedMgr = managerSelect && managerSelect.value ? this.state.getManager(managerSelect.value) : null;

      window.fantaDb.ref('fanta_live/current').update({
        currentBid: price,
        highestBidder: selectedMgr ? selectedMgr.name : "Nessuno",
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('Errore aggiornamento Firebase current bid:', e);
    }
  }

  initFirebaseSync() {
    if (!window.fantaDb) return;

    this.isUpdatingFromFirebase = false;

    // Ascolta aggiornamenti dell'asta corrente (rilanci dai telefoni o altre istanze)
    window.fantaDb.ref('fanta_live/current').on('value', (snapshot) => {
      const cur = snapshot.val();
      if (!cur) return;

      // Se l'asta è attiva e abbiamo il modale aperto per quel calciatore
      if (cur.active && this.currentAuctionPlayer) {
        this.isUpdatingFromFirebase = true;
        try {
          const priceInput = document.getElementById('bid-price-input');
          const managerSelect = document.getElementById('bid-manager-select');
          let changed = false;

          // 1. Aggiorna prezzo battuto in tempo reale
          if (priceInput && parseInt(priceInput.value, 10) !== (cur.currentBid || 0)) {
            priceInput.value = cur.currentBid || 0;
            changed = true;
          }

          // 2. Seleziona in automatico highestBidder come Manager Acquirente nel menu e nel Radar
          if (managerSelect && cur.highestBidder && cur.highestBidder !== 'Nessuno') {
            const managers = this.state.getAllManagers();
            const targetMgr = managers.find(m => m.name.trim().toLowerCase() === cur.highestBidder.trim().toLowerCase());
            if (targetMgr && managerSelect.value !== targetMgr.id) {
              managerSelect.value = targetMgr.id;
              changed = true;
            }
          }

          if (changed) {
            this.updateBidValidationMessage();
            if (window.soundEngine && cur.currentBid > 0) {
              window.soundEngine.playCoin();
            }
          }
        } finally {
          this.isUpdatingFromFirebase = false;
        }
      }
    });
  }

  // =========================================================================
  // GUIDA CHIAMATE RAPIDE PER FASCIA
  // =========================================================================
  openTierGuideModal(role = null) {
    if (role) {
      this.tierGuideActiveRole = role;
    }
    const modal = document.getElementById('modal-tier-guide');
    if (!modal) return;

    this.updateTierGuideRoleTabs();
    this.renderTierGuideModal();
    modal.classList.remove('hidden');
  }

  closeTierGuideModal() {
    const modal = document.getElementById('modal-tier-guide');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  switchTierGuideRole(role) {
    if (!role) return;
    this.tierGuideActiveRole = role;
    this.updateTierGuideRoleTabs();
    this.renderTierGuideModal();
  }

  updateTierGuideRoleTabs() {
    document.querySelectorAll('.tier-role-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tier-role') === this.tierGuideActiveRole);
    });
  }

  getCanonicalTierInfo(fasciaRaw) {
    const f = String(fasciaRaw || '').trim().toLowerCase();
    if (f.includes('semi-top') || f.includes('semitop')) return { key: 'semi-top', order: 2, label: 'Semi-Top' };
    if (f.includes('top')) return { key: 'top', order: 1, label: 'Top' };
    if (f.includes('terza') || f === 'terza') return { key: 'terza', order: 3, label: 'Terza Fascia' };
    if (f.includes('quarta') || f === 'quarta') return { key: 'quarta', order: 4, label: 'Quarta Fascia' };
    if (f.includes('scomm')) return { key: 'scommesse', order: 5, label: 'Scommesse' };
    return { key: 'altri', order: 6, label: 'Altri' };
  }

  renderTierGuideModal() {
    const container = document.getElementById('tier-guide-grid');
    if (!container) return;

    const allPlayers = this.state.getAllPlayers();
    const rolePlayers = allPlayers.filter(p => String(p.ruolo || '').toUpperCase() === this.tierGuideActiveRole);

    // Mappa con ordine standard delle fasce
    const tiersMap = new Map();
    const defaultTierOrder = [
      { key: 'top', order: 1, label: 'Top' },
      { key: 'semi-top', order: 2, label: 'Semi-Top' },
      { key: 'terza', order: 3, label: 'Terza Fascia' },
      { key: 'quarta', order: 4, label: 'Quarta Fascia' },
      { key: 'scommesse', order: 5, label: 'Scommesse' },
      { key: 'altri', order: 6, label: 'Altri' }
    ];

    defaultTierOrder.forEach(t => {
      tiersMap.set(t.key, { ...t, players: [] });
    });

    rolePlayers.forEach(p => {
      const info = this.getCanonicalTierInfo(p.fascia);
      let tierObj = tiersMap.get(info.key);
      if (!tierObj) {
        tierObj = { key: info.key, order: info.order, label: info.label, players: [] };
        tiersMap.set(info.key, tierObj);
      }
      tierObj.players.push(p);
    });

    let html = '';
    tiersMap.forEach(tier => {
      if (tier.players.length === 0) return;

      // Ordina i calciatori: prima i liberi, poi per titolarità / alfabetico
      tier.players.sort((a, b) => {
        const aBought = (a.stato === 'acquistato' || Boolean(a.proprietario_id)) ? 1 : 0;
        const bBought = (b.stato === 'acquistato' || Boolean(b.proprietario_id)) ? 1 : 0;
        if (aBought !== bBought) return aBought - bBought;
        return (b.titolarita || 0) - (a.titolarita || 0) || a.nome.localeCompare(b.nome);
      });

      const totalCount = tier.players.length;
      const freeCount = tier.players.filter(p => p.stato !== 'acquistato' && !p.proprietario_id).length;
      const badgeClass = freeCount === 0 ? 'tier-col-badge all-bought' : 'tier-col-badge';

      let chipsHtml = '';
      tier.players.forEach(p => {
        const isBought = p.stato === 'acquistato' || Boolean(p.proprietario_id);
        if (isBought) {
          chipsHtml += `
            <div class="tier-player-chip is-bought" title="${p.nome} (${p.squadra}) - Già acquistato">
              <span class="tier-p-name">${p.nome}</span>
              <span class="tier-p-team">(${p.squadra})</span>
            </div>
          `;
        } else {
          chipsHtml += `
            <div class="tier-player-chip" data-player-id="${p.id}" title="Clicca per chiamare all'asta ${p.nome} (${p.squadra})">
              <span class="tier-p-name">${p.nome}</span>
              <span class="tier-p-team">(${p.squadra})</span>
            </div>
          `;
        }
      });

      html += `
        <div class="tier-col-card">
          <div class="tier-col-header">
            <span class="tier-col-title">${tier.label}</span>
            <span class="${badgeClass}">${freeCount}/${totalCount} liberi</span>
          </div>
          <div class="tier-players-list">
            ${chipsHtml}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Click-to-Bid Istantaneo sui chip dei calciatori liberi
    container.querySelectorAll('.tier-player-chip:not(.is-bought)').forEach(chip => {
      chip.addEventListener('click', () => {
        const playerId = chip.getAttribute('data-player-id');
        if (playerId) {
          this.selectPlayerFromTierGuide(playerId);
        }
      });
    });
  }

  selectPlayerFromTierGuide(playerId) {
    this.closeTierGuideModal();
    this.openAuctionModal(playerId);
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
    this.syncManagersToFirebase();
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
    this.syncManagersToFirebase();
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
    this.syncManagersToFirebase();
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

  // =========================================================================
  // SEZIONE CALENDARIO & INCROCI SQUADRE (3 TAB PRINCIPALI)
  // =========================================================================
  switchCalendarTab(tabName, pivotTeam = null) {
    if (!tabName) return;
    this.calendarActiveTab = tabName;
    if (pivotTeam) {
      this.calPivotTeam = pivotTeam;
    }

    // Switch tab buttons
    document.querySelectorAll('.cal-nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cal-tab') === tabName);
    });

    // Switch viste (display: block al tab attivo, display: none agli altri)
    const viewGk = document.getElementById('cal-view-goalkeepers');
    const viewAtt = document.getElementById('cal-view-attackers');
    const viewRat = document.getElementById('cal-view-ratings');

    if (viewGk) viewGk.style.display = tabName === 'goalkeepers' ? 'block' : 'none';
    if (viewAtt) viewAtt.style.display = tabName === 'attackers' ? 'block' : 'none';
    if (viewRat) viewRat.style.display = tabName === 'ratings' ? 'block' : 'none';

    this.renderCalendarSection();
  }

  setCalendarPivotTeam(teamName) {
    if (!teamName) return;
    this.calPivotTeam = teamName;

    // Sincronizza i select
    const gkSelect = document.getElementById('cal-gk-pivot-select');
    const attSelect = document.getElementById('cal-att-pivot-select');
    if (gkSelect) gkSelect.value = teamName;
    if (attSelect) attSelect.value = teamName;

    this.renderCalendarSection();
  }

  switchAttSubtab(subtabName) {
    this.attActiveSubtab = subtabName || 'pairs';

    document.querySelectorAll('.att-subtab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-att-subtab') === this.attActiveSubtab);
    });

    const subviewPairs = document.getElementById('cal-att-subview-pairs');
    const subviewTriplets = document.getElementById('cal-att-subview-triplets');

    if (subviewPairs) subviewPairs.style.display = this.attActiveSubtab === 'pairs' ? 'block' : 'none';
    if (subviewTriplets) subviewTriplets.style.display = this.attActiveSubtab === 'triplets' ? 'block' : 'none';

    if (this.attActiveSubtab === 'pairs') {
      this.renderCalendarAttPairs();
    } else {
      this.renderCalendarAttTriplets();
    }
  }

  renderCalendarSection() {
    if (!this.calendarEngine && typeof CalendarEngine !== 'undefined') {
      this.calendarEngine = new CalendarEngine(window.CALENDARIO_SERIE_A, () => this.state.getAllPlayers());
    }
    if (!this.calendarEngine) return;

    if (this.calendarActiveTab === 'goalkeepers') {
      this.renderCalendarGkTab();
    } else if (this.calendarActiveTab === 'attackers') {
      this.renderCalendarAttTab();
    } else if (this.calendarActiveTab === 'ratings') {
      this.renderTeamRatingsGrid();
    }
  }

  renderCalendarGkTab() {
    if (!this.calendarEngine) return;
    const teams = this.calendarEngine.getAllTeams();

    // Select Pivot Portieri
    const select = document.getElementById('cal-gk-pivot-select');
    if (select && select.options.length <= 1) {
      select.innerHTML = '';
      teams.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        if (t === this.calPivotTeam) opt.selected = true;
        select.appendChild(opt);
      });
    } else if (select) {
      select.value = this.calPivotTeam;
    }

    // Pills Squadre Portieri
    const pillsRow = document.getElementById('cal-gk-quick-pills');
    if (pillsRow) {
      let pillsHtml = '';
      teams.forEach(t => {
        const isActive = t === this.calPivotTeam;
        pillsHtml += `<button type="button" class="team-pill-btn ${isActive ? 'active' : ''}" data-team="${t}">${t}</button>`;
      });
      pillsRow.innerHTML = pillsHtml;

      pillsRow.querySelectorAll('.team-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.setCalendarPivotTeam(btn.getAttribute('data-team'));
        });
      });
    }

    // Scheda Riassuntiva Pivot Portieri
    const summaryCard = document.getElementById('cal-gk-pivot-summary');
    if (summaryCard) {
      const rating = this.calendarEngine.getTeamRating(this.calPivotTeam);
      const tierClass = rating >= 8 ? 'rating-badge-top' : rating >= 6 ? 'rating-badge-mid' : 'rating-badge-low';
      const tierLabel = rating >= 8 ? 'TOP' : rating >= 6 ? 'MEDIA' : 'SALVEZZA';

      const gks = this.calendarEngine.getTeamKeyPlayers(this.calPivotTeam, 'P');
      const gksTxt = gks.slice(0, 2).map(p =>
        `<strong>${p.nome}</strong> (${p.titolarita || '?'}%) <span style="color: #fbbf24; font-weight: 700;">[${p.prezzo_massimo_imposto || 1} cr]</span>`
      ).join(', ') || 'N.D.';

      summaryCard.innerHTML = `
        <div class="focus-summary-left">
          <span class="focus-summary-name">${this.calPivotTeam}</span>
          <span class="team-rating-badge ${tierClass}">${rating}/10 (${tierLabel})</span>
        </div>
        <div class="focus-summary-roster">
          <div class="focus-summary-item">
            <span class="f-lbl">🧤 Portieri Titolari ${this.calPivotTeam}:</span>
            <span class="f-val">${gksTxt}</span>
          </div>
        </div>
      `;
    }

    // Label squadra
    const labelTeam = document.getElementById('cal-lbl-gk-team');
    if (labelTeam) labelTeam.textContent = this.calPivotTeam;

    // Tabella 19 Coppie Portieri
    const tbody = document.getElementById('cal-gk-table-body');
    if (!tbody) return;

    const pairs = this.calendarEngine.getFocusTeamGoalkeepers(this.calPivotTeam);
    let html = '';

    pairs.forEach((p, idx) => {
      const playersPartnerHtml = (p.playersPartner || []).map(x =>
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
            <button type="button" class="btn-filter-listone" onclick="window.app.filterListoneByTeams(['${this.calPivotTeam}', '${p.partnerTeam}'])">
              🔍 Filtra nel Listone
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  renderCalendarAttTab() {
    if (!this.calendarEngine) return;
    const teams = this.calendarEngine.getAllTeams();

    // Select Pivot Attaccanti
    const select = document.getElementById('cal-att-pivot-select');
    if (select && select.options.length <= 1) {
      select.innerHTML = '';
      teams.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        if (t === this.calPivotTeam) opt.selected = true;
        select.appendChild(opt);
      });
    } else if (select) {
      select.value = this.calPivotTeam;
    }

    // Pills Squadre Attaccanti
    const pillsRow = document.getElementById('cal-att-quick-pills');
    if (pillsRow) {
      let pillsHtml = '';
      teams.forEach(t => {
        const isActive = t === this.calPivotTeam;
        pillsHtml += `<button type="button" class="team-pill-btn ${isActive ? 'active' : ''}" data-team="${t}">${t}</button>`;
      });
      pillsRow.innerHTML = pillsHtml;

      pillsRow.querySelectorAll('.team-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.setCalendarPivotTeam(btn.getAttribute('data-team'));
        });
      });
    }

    // Scheda Riassuntiva Pivot Attaccanti (SOLO RUOLO A)
    const summaryCard = document.getElementById('cal-att-pivot-summary');
    if (summaryCard) {
      const rating = this.calendarEngine.getTeamRating(this.calPivotTeam);
      const tierClass = rating >= 8 ? 'rating-badge-top' : rating >= 6 ? 'rating-badge-mid' : 'rating-badge-low';
      const tierLabel = rating >= 8 ? 'TOP' : rating >= 6 ? 'MEDIA' : 'SALVEZZA';

      // Filtro TASSATIVO ruolo A
      const atts = this.calendarEngine.getTeamKeyPlayers(this.calPivotTeam, 'A');
      const attsTxt = atts.slice(0, 3).map(p =>
        `<strong>${p.nome}</strong> (${p.titolarita || '?'}%) <span style="color: #fbbf24; font-weight: 700;">[${p.prezzo_massimo_imposto || 1} cr]</span>`
      ).join(', ') || 'N.D.';

      summaryCard.innerHTML = `
        <div class="focus-summary-left">
          <span class="focus-summary-name">${this.calPivotTeam}</span>
          <span class="team-rating-badge ${tierClass}">${rating}/10 (${tierLabel})</span>
        </div>
        <div class="focus-summary-roster">
          <div class="focus-summary-item">
            <span class="f-lbl">⚽ Attaccanti Principali ${this.calPivotTeam}:</span>
            <span class="f-val">${attsTxt}</span>
          </div>
        </div>
      `;
    }

    // Label squadra
    ['cal-lbl-att-pairs-team', 'cal-lbl-att-triplets-team'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = this.calPivotTeam;
    });

    // Subtab switch
    this.switchAttSubtab(this.attActiveSubtab);
  }

  renderCalendarAttPairs() {
    const tbody = document.getElementById('cal-att-pairs-table-body');
    if (!tbody || !this.calendarEngine) return;

    const pairs = this.calendarEngine.getFocusTeamAttackersPairs(this.calPivotTeam);
    let html = '';

    pairs.forEach((p, idx) => {
      // FIX BUG ATTACCANTI: Filtro tassativo ruolo A (Attaccanti), nessun portiere permesso
      const validAtts = (p.playersPartner || []).filter(pl => String(pl.ruolo || '').toUpperCase() === 'A');
      const playersPartnerHtml = validAtts.slice(0, 3).map(x =>
        `<span class="player-tag-price"><strong>${x.nome}</strong> (${x.titolarita || '?'}%)<span class="p-max">[${x.prezzo_massimo_imposto || 1} cr]</span></span>`
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
            <button type="button" class="btn-filter-listone" onclick="window.app.filterListoneByTeams(['${this.calPivotTeam}', '${p.partnerTeam}'])">
              🔍 Filtra nel Listone
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  renderCalendarAttTriplets() {
    const tbody = document.getElementById('cal-att-triplets-table-body');
    if (!tbody || !this.calendarEngine) return;

    const triplets = this.calendarEngine.getFocusTeamAttackersTriplets(this.calPivotTeam);
    let html = '';

    triplets.forEach((t, idx) => {
      // FIX BUG ATTACCANTI: Solo ed esclusivamente attaccanti ruolo A
      const validB = (t.playersB || []).filter(pl => String(pl.ruolo || '').toUpperCase() === 'A');
      const validC = (t.playersC || []).filter(pl => String(pl.ruolo || '').toUpperCase() === 'A');

      const playersBHtml = validB.slice(0, 3).map(x =>
        `<span class="player-tag-price"><strong>${x.nome}</strong> (${x.titolarita || '?'}%)<span class="p-max">[${x.prezzo_massimo_imposto || 1} cr]</span></span>`
      ).join('') || 'N.D.';

      const playersCHtml = validC.slice(0, 3).map(x =>
        `<span class="player-tag-price"><strong>${x.nome}</strong> (${x.titolarita || '?'}%)<span class="p-max">[${x.prezzo_massimo_imposto || 1} cr]</span></span>`
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
            <button type="button" class="btn-filter-listone" onclick="window.app.filterListoneByTeams(['${this.calPivotTeam}', '${t.teamB}', '${t.teamC}'])">
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
            <div class="team-rating-stepper">
              <button type="button" class="btn-step btn-step-down" data-team="${team}" title="Diminuisci rating">-</button>
              <input type="number" class="rating-number-input" min="1" max="10" value="${rating}" data-team="${team}">
              <button type="button" class="btn-step btn-step-up" data-team="${team}" title="Aumenta rating">+</button>
            </div>
            <input type="range" class="rating-slider" min="1" max="10" step="1" value="${rating}" data-team="${team}">
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;

    const updateTeamRatingUI = (team, val) => {
      val = Math.min(10, Math.max(1, parseInt(val, 10) || 5));
      this.calendarEngine.setTeamRating(team, val);

      const numInput = grid.querySelector(`.rating-number-input[data-team="${team}"]`);
      if (numInput) numInput.value = val;

      const slider = grid.querySelector(`.rating-slider[data-team="${team}"]`);
      if (slider) slider.value = val;

      const badge = document.getElementById(`rating-badge-${team}`);
      if (badge) {
        const tierClass = val >= 8 ? 'rating-badge-top' : val >= 6 ? 'rating-badge-mid' : 'rating-badge-low';
        const tierLabel = val >= 8 ? 'TOP' : val >= 6 ? 'MEDIA' : 'SALVEZZA';
        badge.className = `team-rating-badge ${tierClass}`;
        badge.textContent = `${val}/10 (${tierLabel})`;
      }
    };

    // Stepper buttons
    grid.querySelectorAll('.btn-step-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const team = btn.getAttribute('data-team');
        const cur = this.calendarEngine.getTeamRating(team);
        updateTeamRatingUI(team, cur - 1);
      });
    });

    grid.querySelectorAll('.btn-step-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const team = btn.getAttribute('data-team');
        const cur = this.calendarEngine.getTeamRating(team);
        updateTeamRatingUI(team, cur + 1);
      });
    });

    // Slider
    grid.querySelectorAll('.rating-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const team = e.target.getAttribute('data-team');
        updateTeamRatingUI(team, e.target.value);
      });
    });

    // Direct number input
    grid.querySelectorAll('.rating-number-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const team = e.target.getAttribute('data-team');
        updateTeamRatingUI(team, e.target.value);
      });
    });
  }

  // =========================================================================
  // TARGET BUDGET PER REPARTO CON RIBILANCIAMENTO DINAMICO
  // =========================================================================
  calculateDeptBudgetStats(managerId) {
    const m = this.state.getManager(managerId) || this.state.getAllManagers()[0];
    if (!m) return null;

    const league = this.state.getLeagueConfig();
    const slotsConfig = this.state.getSlotsConfig();
    const budgetPlan = this.state.getBudgetPlan();
    const initialBudget = league.initialBudget || 500;

    const roles = ['P', 'D', 'C', 'A'];
    const roleNames = { P: 'Portieri', D: 'Difensori', C: 'Centrocampisti', A: 'Attaccanti' };
    const roleIcons = { P: '🧤', D: '🛡️', C: '⚙️', A: '⚡' };

    const roleStats = {};
    let totalTarget = 0;
    let totalSpent = m.spent || 0;
    const availableTesoretto = [];
    const activeDeficits = [];

    roles.forEach(r => {
      const planRole = (budgetPlan.roles && budgetPlan.roles[r]) || { pct: 25, targetCredits: Math.round(initialBudget * 0.25) };
      const targetCredits = planRole.targetCredits !== undefined ? planRole.targetCredits : Math.round(initialBudget * (planRole.pct / 100));
      totalTarget += targetCredits;

      const totalSlots = slotsConfig[r] || 0;
      const rosterPlayers = (m.roster || []).filter(p => p.ruolo === r);
      const boughtSlots = rosterPlayers.length;
      const freeSlots = Math.max(0, totalSlots - boughtSlots);
      const spentCredits = rosterPlayers.reduce((acc, p) => acc + (p.prezzo_acquisto || 0), 0);
      const remCredits = targetCredits - spentCredits;

      // Delta Economico (Attivo / Passivo)
      let delta = 0;
      if (freeSlots === 0) {
        // Reparto completato: differenza secca tra budget target e spesa effettiva
        delta = targetCredits - spentCredits;
      } else if (boughtSlots > 0 && totalSlots > 0) {
        // Reparto in corso: spesa teorica proporzionale per gli slot già presi meno spesa reale
        const expectedForBought = (targetCredits / totalSlots) * boughtSlots;
        delta = Math.round(expectedForBought - spentCredits);
      }

      // Spesa Media Residua per Slot Libero
      const avgRemainingPerSlot = freeSlots > 0 ? Math.max(0, Math.round((remCredits / freeSlots) * 10) / 10) : 0;

      // Stati di completezza, sforamento e tesoretto
      const isComplete = (freeSlots === 0);
      const isOverBudget = (remCredits < freeSlots || spentCredits > targetCredits);
      const isDeficit = (remCredits < 0);

      if (isComplete && remCredits > 0) {
        availableTesoretto.push({
          role: r,
          roleName: roleNames[r],
          amount: remCredits
        });
      }

      if (isOverBudget) {
        activeDeficits.push({
          role: r,
          roleName: roleNames[r],
          amount: Math.max(0, spentCredits - targetCredits, freeSlots - remCredits)
        });
      }

      roleStats[r] = {
        role: r,
        roleName: roleNames[r],
        roleIcon: roleIcons[r],
        targetPct: planRole.pct,
        targetCredits,
        totalSlots,
        boughtSlots,
        freeSlots,
        spentCredits,
        remCredits,
        delta,
        avgRemainingPerSlot,
        isComplete,
        isOverBudget,
        isDeficit
      };
    });

    return {
      manager: m,
      totalTarget,
      totalSpent,
      roles: roleStats,
      availableTesoretto,
      activeDeficits,
      compensationRole: budgetPlan.compensationRole || 'A',
      tesorettoTarget: budgetPlan.tesorettoTarget || 'A'
    };
  }

  renderDeptBudgetWidget() {
    const widgetBar = document.getElementById('dept-budget-widget-bar');
    if (!widgetBar) return;

    const userManagerId = this.state.getUserManagerId();
    const stats = this.calculateDeptBudgetStats(userManagerId);
    if (!stats) return;

    // Popola select manager nel widget
    const mgrSelect = document.getElementById('dept-widget-manager-select');
    if (mgrSelect) {
      const managers = this.state.getAllManagers();
      let optHtml = '';
      managers.forEach(m => {
        const isSel = (m.id === userManagerId) ? 'selected' : '';
        optHtml += `<option value="${m.id}" ${isSel}>${m.name}</option>`;
      });
      mgrSelect.innerHTML = optHtml;
    }

    // Aggiorna totale spesi e target
    const totalSpentElem = document.getElementById('dept-widget-total-spent');
    const totalTargetElem = document.getElementById('dept-widget-total-target');
    if (totalSpentElem) totalSpentElem.textContent = stats.totalSpent;
    if (totalTargetElem) totalTargetElem.textContent = stats.totalTarget;

    // Gestione Banner Dinamico: Tesoretto & Allarme Sforamento
    const alertContainer = document.getElementById('dept-widget-alert-container');
    if (alertContainer) {
      let alertHtml = '';

      // 1. Tesoretto disponibile
      if (stats.availableTesoretto.length > 0) {
        stats.availableTesoretto.forEach(t => {
          const targetRole = stats.tesorettoTarget || 'A';
          const targetRoleName = targetRole === 'A' ? 'Attaccanti' : 'Centrocampisti';
          alertHtml += `
            <div class="dept-alert-banner banner-tesoretto">
              <span>💰 <strong>Tesoretto generato in ${t.roleName}</strong>: +${t.amount} cr disponibili. Vuoi spostarli automaticamente sul budget dell'${targetRoleName}?</span>
              <button type="button" class="btn-banner-action" onclick="window.app.transferTesoretto('${t.role}', '${targetRole}', ${t.amount})">
                ⚡ Sposta +${t.amount} cr su ${targetRoleName}
              </button>
            </div>
          `;
        });
      }

      // 2. Allarme Sforamento / Deficit
      if (stats.activeDeficits.length > 0) {
        stats.activeDeficits.forEach(d => {
          const compRole = stats.compensationRole || 'A';
          const compRoleName = compRole === 'A' ? 'Attacco' : 'Centrocampo';
          alertHtml += `
            <div class="dept-alert-banner banner-deficit">
              <span>⚠️ <strong>Allarme Sforamento ${d.roleName}</strong>: -${d.amount} cr. Compensati attingendo dal budget di ${compRoleName} per garantire 1 cr a slot.</span>
              <button type="button" class="btn-banner-action" onclick="window.app.rebalanceDeficit('${d.role}', '${compRole}', ${d.amount})">
                🔄 Ribilancia Deficit
              </button>
            </div>
          `;
        });
      }

      if (alertHtml) {
        alertContainer.innerHTML = alertHtml;
        alertContainer.classList.remove('hidden');
      } else {
        alertContainer.innerHTML = '';
        alertContainer.classList.add('hidden');
      }
    }

    // Renderizza le 4 Card dei Reparti
    const cardsGrid = document.getElementById('dept-widget-cards-grid');
    if (cardsGrid) {
      let gridHtml = '';
      const roles = ['P', 'D', 'C', 'A'];

      roles.forEach(r => {
        const item = stats.roles[r];
        const progressPct = item.targetCredits > 0
          ? Math.min(100, Math.round((item.spentCredits / item.targetCredits) * 100))
          : 0;

        let deltaClass = 'delta-even';
        let deltaText = 'In Target';
        if (item.delta > 0) {
          deltaClass = 'delta-saved';
          deltaText = `+${item.delta} cr (Risparmiati)`;
        } else if (item.delta < 0) {
          deltaClass = 'delta-over';
          deltaText = `${item.delta} cr (Over-budget)`;
        }

        const isOver = item.isOverBudget;
        const fillClass = isOver ? 'over-budget' : '';

        const avgSlotText = item.isComplete
          ? 'Reparto Completo'
          : `${item.avgRemainingPerSlot} cr / slot`;

        gridHtml += `
          <div class="dept-role-card role-${r.toLowerCase()}" title="${item.roleName}: spesi ${item.spentCredits} cr su ${item.targetCredits} cr allocati (${item.targetPct}%)">
            <div class="dept-role-top">
              <span class="dept-role-name">${item.roleIcon} ${r} (${item.roleName})</span>
              <span class="dept-role-delta ${deltaClass}">${deltaText}</span>
            </div>

            <div class="dept-progress-wrap">
              <div class="dept-progress-track">
                <div class="dept-progress-fill ${fillClass}" style="width: ${progressPct}%"></div>
              </div>
              <div class="dept-progress-labels">
                <span class="dept-spent-txt">Spesi: <strong>${item.spentCredits}</strong> / ${item.targetCredits} cr</span>
                <span class="dept-slots-txt">${item.boughtSlots}/${item.totalSlots} slot</span>
              </div>
            </div>

            <div class="dept-avg-slot-box ${item.isComplete ? 'is-complete' : ''}">
              <span>Spesa Media Residua:</span>
              <span class="avg-val">${avgSlotText}</span>
            </div>
          </div>
        `;
      });

      cardsGrid.innerHTML = gridHtml;
    }
  }

  renderBudgetPlanSettings() {
    const card = document.getElementById('settings-card-budget-plan');
    if (!card) return;

    const league = this.state.getLeagueConfig();
    const initialBudget = league.initialBudget || 500;
    const plan = this.state.getBudgetPlan();
    const userManagerId = this.state.getUserManagerId();

    // Popola select squadra di riferimento
    const mgrSelect = document.getElementById('setting-budget-user-manager');
    if (mgrSelect) {
      const managers = this.state.getAllManagers();
      let optHtml = '';
      managers.forEach(m => {
        const isSel = (m.id === userManagerId) ? 'selected' : '';
        optHtml += `<option value="${m.id}" ${isSel}>${m.name}</option>`;
      });
      mgrSelect.innerHTML = optHtml;
    }

    // Popola destinazioni ribilanciamento
    const tesorettoSelect = document.getElementById('setting-tesoretto-target');
    if (tesorettoSelect) tesorettoSelect.value = plan.tesorettoTarget || 'A';
    const deficitSelect = document.getElementById('setting-deficit-source');
    if (deficitSelect) deficitSelect.value = plan.compensationRole || 'A';

    // Popola campi ruoli P, D, C, A
    const roles = ['P', 'D', 'C', 'A'];
    roles.forEach(r => {
      const roleData = (plan.roles && plan.roles[r]) || { pct: 25, targetCredits: Math.round(initialBudget * 0.25) };
      const pctInput = document.getElementById(`plan-pct-${r}`);
      const crInput = document.getElementById(`plan-cr-${r}`);
      const crDisplay = document.getElementById(`plan-cr-display-${r}`);

      const targetCr = roleData.targetCredits !== undefined ? roleData.targetCredits : Math.round(initialBudget * (roleData.pct / 100));

      if (pctInput) pctInput.value = roleData.pct;
      if (crInput) crInput.value = targetCr;
      if (crDisplay) crDisplay.textContent = `${targetCr} cr`;
    });

    this.attachBudgetPlanInputListeners();
    this.updateBudgetPlanValidationUI();
  }

  attachBudgetPlanInputListeners() {
    const roles = ['P', 'D', 'C', 'A'];
    const league = this.state.getLeagueConfig();
    const initialBudget = league.initialBudget || 500;

    roles.forEach(r => {
      const pctInput = document.getElementById(`plan-pct-${r}`);
      const crInput = document.getElementById(`plan-cr-${r}`);
      const crDisplay = document.getElementById(`plan-cr-display-${r}`);

      if (pctInput && !pctInput.dataset.listenerAttached) {
        pctInput.dataset.listenerAttached = 'true';
        pctInput.addEventListener('input', () => {
          const pctVal = parseFloat(pctInput.value) || 0;
          const calculatedCr = Math.round(initialBudget * (pctVal / 100));
          if (crInput) crInput.value = calculatedCr;
          if (crDisplay) crDisplay.textContent = `${calculatedCr} cr`;
          this.updateBudgetPlanValidationUI();
        });
      }

      if (crInput && !crInput.dataset.listenerAttached) {
        crInput.dataset.listenerAttached = 'true';
        crInput.addEventListener('input', () => {
          const crVal = parseFloat(crInput.value) || 0;
          const calculatedPct = Math.round((crVal / initialBudget) * 100);
          if (pctInput) pctInput.value = calculatedPct;
          if (crDisplay) crDisplay.textContent = `${crVal} cr`;
          this.updateBudgetPlanValidationUI();
        });
      }
    });
  }

  updateBudgetPlanValidationUI() {
    const roles = ['P', 'D', 'C', 'A'];
    let totalPct = 0;
    let totalCr = 0;

    roles.forEach(r => {
      const pctInput = document.getElementById(`plan-pct-${r}`);
      const crInput = document.getElementById(`plan-cr-${r}`);
      totalPct += parseFloat(pctInput ? pctInput.value : 0) || 0;
      totalCr += parseFloat(crInput ? crInput.value : 0) || 0;
    });

    const league = this.state.getLeagueConfig();
    const initialBudget = league.initialBudget || 500;

    const bar = document.getElementById('plan-validation-bar');
    const msg = document.getElementById('plan-validation-msg');
    const totalPctElem = document.getElementById('plan-total-pct');
    const totalCrElem = document.getElementById('plan-total-cr');
    const statusBadge = document.getElementById('budget-plan-status-badge');

    if (totalPctElem) totalPctElem.textContent = `${totalPct}%`;
    if (totalCrElem) totalCrElem.textContent = `${totalCr}`;

    const isBalanced = (Math.round(totalPct) === 100) || (totalCr === initialBudget);

    if (isBalanced) {
      if (bar) { bar.className = 'plan-validation-bar valid'; }
      if (msg) { msg.textContent = '✅ Bilanciato al 100%'; }
      if (statusBadge) {
        statusBadge.className = 'badge-plan-status valid';
        statusBadge.textContent = 'Bilanciato (100%) ✅';
      }
    } else {
      const diffPct = Math.round(100 - totalPct);
      const diffCr = initialBudget - totalCr;
      const isUnder = totalPct < 100;

      if (bar) { bar.className = 'plan-validation-bar invalid'; }
      if (msg) {
        msg.textContent = isUnder
          ? `⚠️ Mancano ${Math.abs(diffPct)}% (${Math.abs(diffCr)} cr per raggiungere ${initialBudget} cr)`
          : `⛔ Sforamento di ${Math.abs(diffPct)}% (${Math.abs(diffCr)} cr oltre ${initialBudget} cr)`;
      }
      if (statusBadge) {
        statusBadge.className = 'badge-plan-status invalid';
        statusBadge.textContent = isUnder ? `Mancano ${Math.abs(diffPct)}% ⚠️` : `Sforamento ${Math.abs(diffPct)}% ⛔`;
      }
    }
  }

  applyBudgetPreset(preset) {
    const league = this.state.getLeagueConfig();
    const initialBudget = league.initialBudget || 500;

    let presets = {
      'standard': { P: 8, D: 12, C: 28, A: 52 },
      'heavy-attack': { P: 7, D: 10, C: 23, A: 60 },
      'balanced': { P: 10, D: 15, C: 30, A: 45 }
    };

    const selPreset = presets[preset] || presets.standard;

    ['P', 'D', 'C', 'A'].forEach(r => {
      const pct = selPreset[r];
      const cr = Math.round(initialBudget * (pct / 100));

      const pctInput = document.getElementById(`plan-pct-${r}`);
      const crInput = document.getElementById(`plan-cr-${r}`);
      const crDisplay = document.getElementById(`plan-cr-display-${r}`);

      if (pctInput) pctInput.value = pct;
      if (crInput) crInput.value = cr;
      if (crDisplay) crDisplay.textContent = `${cr} cr`;
    });

    this.updateBudgetPlanValidationUI();
    this.showToast(`Applicato preset: ${preset}`, 'info');
  }

  saveBudgetPlanSettings() {
    const league = this.state.getLeagueConfig();
    const initialBudget = league.initialBudget || 500;

    const userMgrSelect = document.getElementById('setting-budget-user-manager');
    const userManagerId = (userMgrSelect && userMgrSelect.value) || this.state.getUserManagerId();

    const tesorettoSelect = document.getElementById('setting-tesoretto-target');
    const tesorettoTarget = (tesorettoSelect && tesorettoSelect.value) || 'A';

    const deficitSelect = document.getElementById('setting-deficit-source');
    const compensationRole = (deficitSelect && deficitSelect.value) || 'A';

    const newRoles = {};
    let totalPct = 0;

    ['P', 'D', 'C', 'A'].forEach(r => {
      const pctInput = document.getElementById(`plan-pct-${r}`);
      const crInput = document.getElementById(`plan-cr-${r}`);

      const pct = parseFloat(pctInput ? pctInput.value : 0) || 0;
      const cr = parseInt(crInput ? crInput.value : 0, 10) || Math.round(initialBudget * (pct / 100));

      totalPct += pct;
      newRoles[r] = { pct, targetCredits: cr };
    });

    const plan = {
      userManagerId,
      tesorettoTarget,
      compensationRole,
      roles: newRoles
    };

    this.state.setBudgetPlan(plan);
    this.renderDeptBudgetWidget();
    this.renderBudgetPlanSettings();

    if (Math.round(totalPct) !== 100) {
      this.showToast(`⚠️ Attenzione: la somma delle percentuali è ${totalPct}%, ma il piano è stato salvato.`, 'warning');
    } else {
      this.showToast('🎉 Piano Target Budget per Reparto salvato con successo!', 'success');
    }
  }

  transferTesoretto(fromRole, toRole, amount) {
    if (!amount || amount <= 0) return;

    const plan = this.state.getBudgetPlan();
    if (!plan || !plan.roles) return;

    const league = this.state.getLeagueConfig();
    const initialBudget = league.initialBudget || 500;

    const fromTarget = plan.roles[fromRole].targetCredits || Math.round(initialBudget * (plan.roles[fromRole].pct / 100));
    const toTarget = plan.roles[toRole].targetCredits || Math.round(initialBudget * (plan.roles[toRole].pct / 100));

    // Trasferimento crediti
    plan.roles[fromRole].targetCredits = Math.max(0, fromTarget - amount);
    plan.roles[fromRole].pct = Math.round((plan.roles[fromRole].targetCredits / initialBudget) * 100);

    plan.roles[toRole].targetCredits = toTarget + amount;
    plan.roles[toRole].pct = Math.round((plan.roles[toRole].targetCredits / initialBudget) * 100);

    this.state.setBudgetPlan(plan);
    this.renderDeptBudgetWidget();
    this.renderBudgetPlanSettings();

    const roleNames = { P: 'Portieri', D: 'Difensori', C: 'Centrocampisti', A: 'Attaccanti' };
    this.showToast(`🎉 Tesoretto trasferito! +${amount} cr spostati da ${roleNames[fromRole]} a ${roleNames[toRole]}!`, 'success');
    if (window.soundEngine) window.soundEngine.playSuccess();
  }

  rebalanceDeficit(deficitRole, compensationRole, amount) {
    if (!amount || amount <= 0) return;

    const plan = this.state.getBudgetPlan();
    if (!plan || !plan.roles) return;

    const league = this.state.getLeagueConfig();
    const initialBudget = league.initialBudget || 500;

    const compTarget = plan.roles[compensationRole].targetCredits || Math.round(initialBudget * (plan.roles[compensationRole].pct / 100));
    const defTarget = plan.roles[deficitRole].targetCredits || Math.round(initialBudget * (plan.roles[deficitRole].pct / 100));

    // Trasferimento crediti da compensationRole a deficitRole
    const actualTransfer = Math.min(compTarget - 1, amount);
    plan.roles[compensationRole].targetCredits = Math.max(1, compTarget - actualTransfer);
    plan.roles[compensationRole].pct = Math.round((plan.roles[compensationRole].targetCredits / initialBudget) * 100);

    plan.roles[deficitRole].targetCredits = defTarget + actualTransfer;
    plan.roles[deficitRole].pct = Math.round((plan.roles[deficitRole].targetCredits / initialBudget) * 100);

    this.state.setBudgetPlan(plan);
    this.renderDeptBudgetWidget();
    this.renderBudgetPlanSettings();

    const roleNames = { P: 'Portieri', D: 'Difensori', C: 'Centrocampisti', A: 'Attaccanti' };
    this.showToast(`🔄 Deficit ribilanciato: attinti ${actualTransfer} cr da ${roleNames[compensationRole]} per coprire ${roleNames[deficitRole]}!`, 'info');
  }

  updateSecretDeptBudget(player, currentPrice) {
    const box = document.getElementById('secret-dept-budget-box');
    if (!box || !player) return;

    const userManagerId = this.state.getUserManagerId();
    const stats = this.calculateDeptBudgetStats(userManagerId);
    if (!stats || !stats.roles || !stats.roles[player.ruolo]) return;

    const roleStat = stats.roles[player.ruolo];
    const roleIndicator = document.getElementById('secret-dept-role');
    const remElem = document.getElementById('secret-dept-rem');
    const targetElem = document.getElementById('secret-dept-target');
    const maxBidElem = document.getElementById('secret-dept-max-bid');
    const overWarnElem = document.getElementById('secret-dept-overbudget-warn');

    if (roleIndicator) roleIndicator.textContent = player.ruolo;
    if (remElem) remElem.textContent = roleStat.remCredits;
    if (targetElem) targetElem.textContent = roleStat.targetCredits;

    // Calcolo max consigliato su questo slot per restare a target:
    // Deve lasciare almeno 1 credito per ciascuno dei rimanenti (freeSlots - 1)
    let maxAdvised = 0;
    if (roleStat.freeSlots > 1) {
      maxAdvised = Math.max(0, roleStat.remCredits - (roleStat.freeSlots - 1));
    } else if (roleStat.freeSlots === 1) {
      maxAdvised = Math.max(0, roleStat.remCredits);
    }

    if (maxBidElem) maxBidElem.textContent = `${maxAdvised} cr`;

    if (overWarnElem) {
      if (currentPrice > maxAdvised && maxAdvised > 0) {
        overWarnElem.textContent = `⚠️ L'offerta di ${currentPrice} cr supera il max consigliato per restare a target (${maxAdvised} cr)!`;
        overWarnElem.classList.remove('hidden');
      } else if (roleStat.remCredits <= 0) {
        overWarnElem.textContent = `⚠️ Budget target per ${roleStat.roleName} già esaurito o in deficit!`;
        overWarnElem.classList.remove('hidden');
      } else {
        overWarnElem.classList.add('hidden');
      }
    }
  }

  async confirmResetAuction() {
    const confirmed = await this.showConfirmModal(
      'Azzera Asta (Nuova Sessione)',
      'ATTENZIONE: Sei sicuro di voler azzerare l\'asta per una nuova sessione?<br><br>• I crediti spesi e le rose di tutti i manager verranno azzerati.<br>• Lo storico delle chiamate verrà svuotato.<br>• <strong>Tutti i calciatori attualmente presenti (inclusi quelli caricati dall\'ultimo CSV o aggiunti a mano) verranno MANTENUTI</strong> e torneranno liberi.',
      '⚠️'
    );
    if (!confirmed) return;

    this.currentAuctionPlayer = null;
    this.state.resetAuction();
    this.syncManagersToFirebase();
    this.renderHeaderStats();
    this.renderAuctionList();
    this.renderTeamsBoard();
    this.renderHistory();
    this.renderSettings();
    this.renderDeptBudgetWidget();
    this.renderBudgetPlanSettings();
    this.renderTierGuideModal();
    if (typeof this.renderCalendarSection === 'function') {
      this.renderCalendarSection();
    }
    this.showToast('Asta azzerata con successo per una nuova sessione. Listone calciatori preservato!', 'info');
  }

  async confirmRestoreDefaultListone() {
    const confirmed = await this.showConfirmModal(
      'Ripristina Listone Originale',
      'ATTENZIONE: Questa operazione eliminerà il listone attuale!<br><br>• <strong>Tutti i calciatori caricati da file CSV o modificati a mano verranno ELIMINATI DEFINITIVAMENTE</strong>.<br>• Verrà ricaricato il listone iniziale di fabbrica.<br>• I crediti spesi, le rose e lo storico dell\'asta verranno azzerati.<br><br>Confermi di voler procedere?',
      '🚨'
    );
    if (!confirmed) return;

    let defaultPlayers = await ListoneParser.loadDefaultListone();
    if ((!defaultPlayers || defaultPlayers.length === 0) && window.DEFAULT_PLAYERS && window.DEFAULT_PLAYERS.length > 0) {
      defaultPlayers = JSON.parse(JSON.stringify(window.DEFAULT_PLAYERS));
    }

    if (!defaultPlayers || defaultPlayers.length === 0) {
      this.showToast('Errore: impossibile caricare il listone originale di fabbrica.', 'error');
      return;
    }

    this.currentAuctionPlayer = null;
    this.state.restoreDefaultListone(defaultPlayers);
    this.syncManagersToFirebase();

    this.populateTeamFilter();
    this.renderHeaderStats();
    this.renderAuctionList();
    this.renderTeamsBoard();
    this.renderHistory();
    this.renderSettings();
    this.renderDeptBudgetWidget();
    this.renderBudgetPlanSettings();
    this.renderTierGuideModal();
    if (typeof this.renderCalendarSection === 'function') {
      this.renderCalendarSection();
    }
    this.showToast(`Listone originale ripristinato con successo (${defaultPlayers.length} calciatori).`, 'success');
  }
}

// Inizializzazione al DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
  window.app.init();
});
