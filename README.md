# it-tudes.tech

The it-tudes company website: a static site built with [Astro](https://astro.build).
Plain HTML/CSS in the output (a few lines of JavaScript only on pages with an image carousel), no cookies, no third-party requests
(fonts are self-hosted), so it needs no cookie banner.

```
content/site.ts            company details and page copy in each language (email, services, about…)
content/projects/<name>/   one folder per project: en.md, es.md, it.md and its optional image
src/i18n/ui.ts             interface labels in each language (menu, buttons, headings)
src/                       layout, components, styles (src/styles/global.css holds the colours)
public/                    copied as-is (favicon, robots.txt)
deploy/, tools/            nginx block and deploy scripts (server details in tools/deploy.local.env)
Resources/logo-drafts/     logo sources (the site uses the horizontal duo-dark variant)
```

## Languages

English is served at `/`, Spanish at `/es/`, Italian at `/it/`, with a switcher in the header
that keeps you on the same page. Search engines get `hreflang` links and a multilingual sitemap.
Every page exists in every language: a project without a translation shows the English text
with a short note in the visitor's language.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321, reloads as you edit
npm run build      # writes the site to dist/
npm run check      # type-checks the site
```

`npm run dev` also shows **draft** projects (with a Draft badge); the build leaves them out.
If you rename or move project folders while `npm run dev` is running, restart it.

## Projects

Each project is a folder in `content/projects/`. The folder name becomes the address:
`ninvoices/` → `/projects/ninvoices/`, `/es/projects/ninvoices/`, …

```
content/projects/ninvoices/
  en.md            every field (required)
  es.md            Spanish text (optional)
  it.md            Italian text (optional)
  ninvoices.png    image (optional)
```

- **Add**: copy an existing folder, rename it, change the text.
- **Edit**: change the files.
- **Hide**: add `draft: true` to `en.md` (hides it in every language). **Delete**: remove the folder.

`en.md` carries all the fields:

```markdown
---
title: nInvoices                        # required
summary: One or two sentences for the list.   # required
kind: Source-available                  # small badge: Client project, Internal, Website…
year: 2026
tags: [".NET 10", "ASP.NET Core"]       # shown as #net10 #aspnetcore
image: ./ninvoices.png                  # optional, path relative to this file (case-sensitive!)
imageAlt: What the image shows
link: https://example.com               # optional: the project's website or live app -> "Visit website"
linkLabel: Visit example.com            # optional: custom text for the `link` button
repo: https://github.com/algiro/nInvoices   # optional: source code -> "View on GitHub" / "Source code"
external: false                         # true: clicking the item opens `link` directly, no detail page
color: blue                             # tile colour when there is no image: blue orange teal amber violet slate
glyph: "€ { }"                          # text on that tile (defaults to the first letters of the title)
order: 1                                # lower comes first
draft: false
---

Longer description for the detail page. Normal Markdown: **bold**, lists, links,
![screenshots](./other-image.png).
```

`es.md` and `it.md` only need the text; every field they leave out comes from `en.md`:

```markdown
---
title: nInvoices
summary: Fatture e timesheet per freelance…
kind: Source-available
imageAlt: Dashboard di nInvoices…
---

Descrizione lunga per la pagina di dettaglio.
```

For several images, use `images` instead of `image`/`imageAlt`. The project page then shows
them as a carousel (autoplay every 5 s with a pause button, swipe, arrows, dots; each opens
full size; the interval is `AUTOPLAY_MS` in `src/components/Gallery.astro`) and the first one is the
thumbnail in the list:

```yaml
images:
  - src: ./aisleScope1.png
    alt: What the first image shows
  - src: ./aisleScope2.png
    alt: What the second image shows
```

Translations give the alt texts in the same order with `imageAlts: ["…", "…"]`.

`link` and `repo` can be used together: the page then shows both buttons. The `repo` label
is picked automatically (GitHub URLs get "View on GitHub", anything else "Source code").

Images are resized and converted to WebP at build time, so drop in full-size PNG/JPG files.
Only publish screenshots made from demo data.

The build checks every file: a missing `title`, a bad URL or a wrong `color` stops it with
a message naming the file and field.

## Company details and copy

Edit `content/site.ts`. Shared in every language: contact email, `legalName` / `vatId` for
the footer (Italian company sites must show the P.IVA) and the technologies list. Per language,
under `copy.en`, `copy.es`, `copy.it`: hero text, the six services (title, text, keywords), the
four "How we work" steps, the "Why it-tudes" principles, the about text and the contact section.
Keep each list the same length in every language. Interface labels (menu, headings, buttons)
are in `src/i18n/ui.ts`. The code-style headline (`yourIdea.design().build().run();`) is in
`src/pages/[...lang]/index.astro` and stays in English in every language, like code does.

To add a language: add it to `languages` and `copy` in `content/site.ts`, to `ui` in
`src/i18n/ui.ts` and `ogLocale` in `src/i18n/utils.ts`, and to both lists in
`astro.config.mjs`. The build then creates `/<code>/` pages; translate projects when ready.

## Deploy

The site is served by an existing nginx proxy container on the server, next to other apps
that keep their own paths. Server specifics (ssh alias, hostname, paths, container, the
other apps to check) live in `tools/deploy.local.env`, which is git-ignored. Start from
`tools/deploy.local.env.example`.

```powershell
.\tools\deploy.ps1 -DryRun   # build and show what would change
.\tools\deploy.ps1           # build and publish
```

Each deploy uploads a new release to `$REMOTE_BASE/releases/<timestamp>` and switches the
`current` symlink: atomic, no restart, no sudo. The last 5 releases are kept, and the
script prints the one-line rollback command. It refuses to run if the server's hostname is
not `EXPECTED_HOST`.

### First time only

After the first `deploy.ps1`, run the one-time server setup (`deploy.ps1` prints the exact
command). It recreates the shared nginx container, a few seconds of downtime for every app
behind it, so pick a quiet moment:

```powershell
wsl bash -c 'ssh <SSH_HOST> "bash <REMOTE_SETUP>/setup-server.sh install"'
```

It backs up the proxy's compose file and nginx config, mounts the site into the proxy,
replaces the proxy's `location = / { return 30x …; }` redirect with
`deploy/it-tudes-site.nginx.conf`, validates with `nginx -t`, recreates the proxy and checks
the site plus every app in `OTHER_CHECKS`. If any check fails it restores the backup by
itself. `setup-server.sh rollback` undoes it by hand; `setup-server.sh check` just runs the
checks.

Never create site pages under a path another app on the proxy owns.
