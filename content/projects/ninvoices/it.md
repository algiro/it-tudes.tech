---
title: nInvoices
summary: Fatture e timesheet per freelance che fatturano a giornata o a ore. Self-hosted, con la fattura reale visibile prima ancora di crearla.
kind: Source-available
imageAlt: Dashboard di nInvoices con importi da incassare, grafico mensile e ultime fatture (dati demo)
---

La maggior parte degli strumenti di fatturazione è pensata per chi vende prodotti. Freelance e consulenti fatturano **tempo**: i giorni lavorati per un cliente ogni mese, a volte divisi tra più progetti, con festività, mezze giornate e spese di trasferta. nInvoices è costruito attorno a questa routine mensile.

- **Il tuo mese su un calendario.** I giorni feriali partono come giornate intere e le festività sono già segnate.
- **Vedi la fattura vera prima di crearla.** L'ultimo passaggio genera il PDF e il timesheet reali; non viene salvato nulla finché non premi *Generate*.
- **Il tuo layout, la tua lingua.** Fatture e timesheet sono template HTML, con le date nella lingua di ogni cliente.
- **Self-hosted.** Clienti, tariffe e fatture restano sul tuo server.

Il backend è ASP.NET Core su .NET 10 con front end Vue 3, distribuito come immagini Docker. Il codice sorgente è pubblicato con licenza PolyForm Shield.
