---
title: Soul Food Café
summary: Website and QR-code menu for a restaurant in Spain, moved off WordPress to a fast static site on our own hosting.
kind: Website
year: 2026
tags: ["Static site", "Nginx", "Let's Encrypt"]
link: https://soulfoodcafe.es
linkLabel: Visit soulfoodcafe.es
color: amber
glyph: "</>"
order: 4
---

The café's WordPress site was replaced by a hand-built static site: same pages and addresses, no database, and pages that load instantly on a phone.

- The QR code on every table keeps working and leads straight to the menu.
- Hosted on our infrastructure next to the café's ordering app, with automatic certificate renewal.
- Each deploy is atomic and can be rolled back in one step.
