---
title: Infrastruttura ricostruibile da zero
summary: Un solo comando ricostruisce i nostri server di produzione su un VPS nuovo, dal provisioning a TLS, backup e deploy.
kind: Interno
---

I nostri server di produzione si possono ricreare da zero presso qualsiasi provider. Un unico strumento controlla il server, esegue backup cifrati, prepara una macchina vuota e vi ripristina tutte le applicazioni.

- **Indipendente dal provider.** Linux, Docker e shell, senza vincoli a un pannello di hosting.
- **Segreti cifrati** nel repository con sops e age.
- **Provato, non ipotizzato.** Abbiamo ricostruito un server di produzione su un VPS vuoto dall'inizio alla fine: circa tre minuti di bootstrap e meno di un minuto di ripristino.
