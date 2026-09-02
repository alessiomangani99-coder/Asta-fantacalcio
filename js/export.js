/**
 * Modulo Esportazione Dati per Asta Fantacalcio 2026/2027
 * Esportazione PDF (con jsPDF e AutoTable), CSV per Excel e Backup/Ripristino JSON.
 */

class ExportManager {
  constructor(stateManager) {
    this.state = stateManager;
  }

  /**
   * Genera ed esporta il report PDF completo di tutte le rose e del riepilogo lega
   */
  async exportPDF() {
    // Verifica presenza di jsPDF
    const jspdfModule = window.jspdf;
    if (!jspdfModule || !jspdfModule.jsPDF) {
      alert('La libreria jsPDF non è ancora caricata. Verifica la connessione internet per il CDN.');
      return false;
    }

    const { jsPDF } = jspdfModule;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const league = this.state.getLeagueConfig();
    const managers = this.state.getAllManagers();
    const slotsConfig = this.state.getSlotsConfig();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Colori tematici sportivi
    const colorPrimary = [15, 23, 42];    // Slate 900
    const colorAccent = [37, 99, 235];    // Blue 600
    const colorRoleP = [217, 119, 6];     // Amber 600
    const colorRoleD = [5, 150, 105];     // Emerald 600
    const colorRoleC = [37, 99, 235];     // Blue 600
    const colorRoleA = [220, 38, 38];     // Red 600

    // Role order per ordinamento
    const roleOrder = { P: 1, D: 2, C: 3, A: 4 };

    // PAGINA 1: Frontespizio e Riepilogo Generale Lega
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(league.name || 'Lega Fantacalcio 2026/2027', 15, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Documento Ufficiale delle Rose • Generato il ${dateFormatted}`, 15, 28);
    doc.text(`Budget Iniziale: ${league.initialBudget} cr • Slot: P:${slotsConfig.P} D:${slotsConfig.D} C:${slotsConfig.C} A:${slotsConfig.A} (Tot ${slotsConfig.total})`, 15, 34);

    let startY = 48;

    // Tabella di sintesi generale
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Quadro Generale Squadre', 15, startY);

    const summaryRows = managers.map(m => {
      const roster = m.roster || [];
      const spent = m.spent || 0;
      const remaining = league.initialBudget - spent;
      const countP = roster.filter(p => p.ruolo === 'P').length;
      const countD = roster.filter(p => p.ruolo === 'D').length;
      const countC = roster.filter(p => p.ruolo === 'C').length;
      const countA = roster.filter(p => p.ruolo === 'A').length;

      return [
        m.name,
        `${roster.length}/${slotsConfig.total}`,
        `P:${countP}/${slotsConfig.P}  D:${countD}/${slotsConfig.D}  C:${countC}/${slotsConfig.C}  A:${countA}/${slotsConfig.A}`,
        `${spent} cr`,
        `${remaining} cr`
      ];
    });

    if (doc.autoTable) {
      doc.autoTable({
        startY: startY + 4,
        head: [['Squadra / Manager', 'Slot Totali', 'Ripartizione Ruoli', 'Crediti Spesi', 'Crediti Residui']],
        body: summaryRows,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 15, right: 15 }
      });
      startY = doc.lastAutoTable.finalY + 12;
    }

    // PAGINE DETTAGLIATE PER CIASCUN MANAGER
    managers.forEach((m, idx) => {
      doc.addPage();

      // Mini Header della squadra
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rosa: ${m.name}`, 15, 14);

      const roster = m.roster || [];
      const spent = m.spent || 0;
      const remaining = league.initialBudget - spent;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.text(`Giocatori: ${roster.length}/${slotsConfig.total}  |  Spesi: ${spent} cr  |  Residui: ${remaining} cr`, 15, 20);

      // Ordina giocatori per ruolo (P, D, C, A) e poi per prezzo decrescente
      const sortedRoster = [...roster].sort((a, b) => {
        const diff = (roleOrder[a.ruolo] || 99) - (roleOrder[b.ruolo] || 99);
        if (diff !== 0) return diff;
        return (b.prezzo_acquisto || 0) - (a.prezzo_acquisto || 0);
      });

      const bodyData = sortedRoster.map((p, i) => {
        let roleName = 'Attaccante';
        if (p.ruolo === 'P') roleName = 'Portiere';
        if (p.ruolo === 'D') roleName = 'Difensore';
        if (p.ruolo === 'C') roleName = 'Centrocampista';

        return [
          (i + 1).toString(),
          p.ruolo,
          roleName,
          p.nome,
          p.squadra || '-',
          p.fascia || '-',
          `${p.prezzo_acquisto} cr`
        ];
      });

      if (sortedRoster.length === 0) {
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text('Nessun calciatore acquistato per questa squadra.', 15, 40);
      } else if (doc.autoTable) {
        doc.autoTable({
          startY: 30,
          head: [['#', 'R', 'Ruolo', 'Calciatore', 'Squadra Serie A', 'Fascia', 'Prezzo Acquisto']],
          body: bodyData,
          theme: 'grid',
          headStyles: {
            fillColor: [15, 23, 42],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
            2: { cellWidth: 32 },
            3: { cellWidth: 45, fontStyle: 'bold' },
            4: { cellWidth: 35 },
            5: { cellWidth: 30 },
            6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
          },
          bodyStyles: {
            fontSize: 8.5,
            cellPadding: 2.5
          },
          didParseCell: function(data) {
            // Colora la colonna ruolo con il colore tematico
            if (data.section === 'body' && data.column.index === 1) {
              const role = data.cell.raw;
              if (role === 'P') data.cell.styles.textColor = colorRoleP;
              if (role === 'D') data.cell.styles.textColor = colorRoleD;
              if (role === 'C') data.cell.styles.textColor = colorRoleC;
              if (role === 'A') data.cell.styles.textColor = colorRoleA;
            }
          },
          margin: { left: 15, right: 15 }
        });

        // Box riassuntivo a fondo pagina
        const finalY = doc.lastAutoTable.finalY + 8;
        if (finalY < 260) {
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(15, finalY, 180, 16, 2, 2, 'F');
          doc.setTextColor(30, 41, 59);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`Riepilogo Squadra: ${m.name}`, 20, finalY + 6);
          doc.setFont('helvetica', 'normal');
          doc.text(`Totale Speso: ${spent} cr  •  Crediti Residui: ${remaining} cr  •  Tesserati: ${roster.length}/${slotsConfig.total} giocatori`, 20, finalY + 11);
        }
      }
    });

    // Paginazione a piè di pagina
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `${league.name} • Pagina ${i} di ${totalPages}`,
        105,
        290,
        { align: 'center' }
      );
    }

    const safeTitle = (league.name || 'Asta_Fantacalcio').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${safeTitle}_Rose_Complete.pdf`);
    return true;
  }

  /**
   * Esporta le rose in formato CSV compatibile Excel (con UTF-8 BOM)
   */
  exportCSV() {
    const managers = this.state.getAllManagers();
    const roleOrder = { P: 1, D: 2, C: 3, A: 4 };

    // Intestazione CSV richiesta: Manager,Ruolo,Calciatore,Squadra,Prezzo_Acquisto
    const rows = [
      ['Manager', 'Ruolo', 'Calciatore', 'Squadra', 'Prezzo_Acquisto']
    ];

    managers.forEach(m => {
      const roster = m.roster || [];
      const sortedRoster = [...roster].sort((a, b) => {
        const diff = (roleOrder[a.ruolo] || 99) - (roleOrder[b.ruolo] || 99);
        if (diff !== 0) return diff;
        return (b.prezzo_acquisto || 0) - (a.prezzo_acquisto || 0);
      });

      sortedRoster.forEach(p => {
        rows.push([
          `"${(m.name || '').replace(/"/g, '""')}"`,
          p.ruolo || '',
          `"${(p.nome || '').replace(/"/g, '""')}"`,
          `"${(p.squadra || '').replace(/"/g, '""')}"`,
          p.prezzo_acquisto || 0
        ]);
      });
    });

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rose_fantacalcio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  /**
   * Genera e scarica il file JSON di backup completo dello stato dell'asta
   */
  exportJSONBackup() {
    const stateData = this.state.getExportState();
    const jsonString = JSON.stringify(stateData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_asta_fantacalcio_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  /**
   * Ripristina lo stato dell'asta a partire da un file JSON importato
   */
  async importJSONBackup(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Nessun file selezionato.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.league || !Array.isArray(parsed.managers)) {
            throw new Error('Formato JSON non valido: mancano le strutture league o managers.');
          }
          this.state.loadFromJSON(parsed);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Errore durante la lettura del file.'));
      reader.readAsText(file);
    });
  }
}

if (typeof window !== 'undefined') {
  window.ExportManager = ExportManager;
}
if (typeof module !== 'undefined') {
  module.exports = ExportManager;
}
