"""IT-Tudes logo generator (v2). Run: python gen_logo.py"""
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# Grid: cap height 44 (y 22..66), x-height 32 (y 34..66), stroke 7.5.
# Round letters overshoot 1.5 above/below (outer 32.5..67.5) so they look the same size as flat ones.
SW = 7.5


# --- mark: isometric slab + two chevron layers (30 degree slopes) ----------
def mark(c_top, c_mid, c_bot):
    return f'''<g id="mark">
    <polygon points="8,30 40,11.5 72,30 40,48.5" fill="{c_top}"/>
    <polygon points="8,36 40,54.5 72,36 72,44 40,62.5 8,44" fill="{c_mid}"/>
    <polygon points="8,50 40,68.5 72,50 72,58 40,76.5 8,58" fill="{c_bot}"/>
  </g>'''


# --- wordmark: monoline geometric letters, optically kerned ----------------
def wordmark(c_text, c_accent):
    return f'''<g id="wordmark" fill="none" stroke-width="{SW}" stroke-linecap="butt" stroke-linejoin="round">
    <g stroke="{c_text}">
      <path d="M103.75 22V66"/>
      <path d="M116 25.75H148M132 29.5V66"/>
      <path d="M170 25.75H202M186 29.5V66"/>
      <path d="M202.75 34V50A13.75 13.75 0 0 0 230.25 50V34M230.25 34V66"/>
      <circle cx="260.5" cy="50" r="13.75"/>
      <path d="M274.25 22V66"/>
      <path d="M290.75 50H318.25A13.75 13.75 0 1 0 315.03 58.84"/>
      <path d="M353.25 36.25H341.75A8 6.875 0 0 0 341.75 50H346.25A8 6.875 0 0 1 346.25 63.75H334.75"/>
    </g>
    <path d="M151 50H167" stroke="{c_accent}"/>
  </g>'''


def svg(view_box, body, title="IT-Tudes"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}" role="img" aria-label="{title}">
  <title>{title}</title>
  {body}
</svg>
'''


# (top, mid, bottom, text, hyphen) -- value gets darker/heavier towards the base
PALETTES = {
    "":              ("#60A5FA", "#2563EB", "#1E3A8A", "#0F172A", "#2563EB"),
    "-dark":         ("#BFDBFE", "#60A5FA", "#2563EB", "#F8FAFC", "#60A5FA"),
    "-mono-black":   ("#000000", "#000000", "#000000", "#000000", "#000000"),
    "-mono-white":   ("#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"),
    # two-colour: blue carries the brand, orange (complement) marks the foundation layer + hyphen
    "-duo":          ("#3B82F6", "#1E40AF", "#EA580C", "#0F172A", "#EA580C"),
    "-duo-dark":     ("#93C5FD", "#3B82F6", "#FB923C", "#F8FAFC", "#FB923C"),
}

files = {}
for suffix, (t, m, b, txt, acc) in PALETTES.items():
    files[f"it-tudes-logo-horizontal{suffix}.svg"] = svg(
        "0 0 362 88",
        mark(t, m, b) + f'\n  <g transform="translate(-4 0)">{wordmark(txt, acc)}</g>')
    files[f"it-tudes-logo-stacked{suffix}.svg"] = svg(
        "0 0 280 152",
        f'<g transform="translate(100 0)">{mark(t, m, b)}</g>\n  '
        f'<g transform="translate(-89 72)">{wordmark(txt, acc)}</g>')
    files[f"it-tudes-icon{suffix}.svg"] = svg("0 4 80 80", mark(t, m, b))

files["it-tudes-app-icon.svg"] = svg(
    "0 0 120 120",
    '<rect width="120" height="120" rx="26" fill="#1D4ED8"/>\n  '
    '<g transform="translate(20 16)">'
    + mark("rgba(255,255,255,0.5)", "rgba(255,255,255,0.75)", "#FFFFFF") + '</g>')
files["it-tudes-app-icon-duo.svg"] = svg(
    "0 0 120 120",
    '<rect width="120" height="120" rx="26" fill="#1D4ED8"/>\n  '
    '<g transform="translate(20 16)">'
    + mark("rgba(255,255,255,0.6)", "#FFFFFF", "#FB923C") + '</g>')

for name, content in files.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(content)

cells = []
for name in sorted(files):
    bg = "#0F172A" if ("-dark" in name or "white" in name) else "#FFFFFF"
    inline = content = files[name].replace("<svg ", '<svg style="height:110px;max-width:100%" ', 1)
    cells.append(f'<figure style="background:{bg}">{inline}<figcaption>{name}</figcaption></figure>')
with open(os.path.join(OUT, "preview.html"), "w", encoding="utf-8") as f:
    f.write('''<!doctype html><meta charset="utf-8"><title>IT-Tudes logo</title>
<style>body{font-family:system-ui;background:#E5E7EB;margin:24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
figure{margin:0;padding:28px 20px 12px;border-radius:12px;display:flex;flex-direction:column;align-items:center;gap:16px}
figcaption{font:12px monospace;color:#6B7280}</style>
''' + "\n".join(cells))

print("\n".join(sorted(files)))
