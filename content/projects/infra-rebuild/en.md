---
title: Rebuild-from-scratch infrastructure
summary: One command rebuilds our production servers on a fresh VPS, from provisioning to TLS, backups and deploys.
kind: Internal
year: 2026
tags: ["Linux", "Docker", "Bash", "sops"]
color: teal
glyph: "$ infra"
order: 3
---

Our production servers can be recreated from nothing on any provider. A single tool checks the server, takes encrypted backups, provisions a blank machine and restores every application onto it.

- **Provider-independent.** Plain Linux, Docker and shell, with no lock-in to a hosting panel.
- **Encrypted secrets** kept in the repository with sops and age.
- **Rehearsed, not assumed.** We rebuilt a live server on a blank VPS end to end: about three minutes to bootstrap and under a minute to restore.
