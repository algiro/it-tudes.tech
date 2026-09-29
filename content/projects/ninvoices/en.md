---
title: nInvoices
summary: Invoices and timesheets for freelancers who bill by the day or the hour. Self-hosted, with the real invoice previewed before it exists.
kind: Source-available
year: 2026
tags: [".NET 10", "ASP.NET Core", "Vue 3", "Docker"]
image: ./ninvoices.png
imageAlt: nInvoices dashboard with outstanding totals, a monthly chart and recent invoices (demo data)
repo: https://github.com/algiro/nInvoices
color: blue
glyph: "€ { }"
order: 1
---

Most invoicing tools are built for shops that sell products. Freelancers and consultants invoice **time**: days worked for a client each month, sometimes split across projects, with public holidays, half days and travel expenses along the way. nInvoices is built around that monthly routine.

- **Your month on a calendar.** Weekdays start as full days and public holidays are already marked.
- **See the real invoice before it's created.** The last step renders the actual PDF and timesheet; nothing is saved until you press *Generate*.
- **Your layout, your language.** Invoices and timesheets are HTML templates, with dates in each client's language.
- **Self-hosted.** Clients, rates and invoices stay on your own server.

The backend is ASP.NET Core on .NET 10 with a Vue 3 front end, shipped as Docker images. The source is published under the PolyForm Shield licence.
