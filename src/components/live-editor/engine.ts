// Live editor: types snippets from content/editor/ forever, like a person would.
//
// Snippet files are plain code with correction markers:
//   ⟨wrong|right⟩          types "wrong", notices, deletes it, types "right"
//   ⟨wrong|right|later⟩    types "wrong", carries on for a couple of lines, then goes
//                          back, fixes it, and returns to where it was
// (either side may be empty: ⟨|await |later⟩ = forgot an `await`, added later)

import { lineHtml, langOf, langInfo, type Lang } from "./highlight";

type Segment =
  | { kind: "text"; text: string }
  | { kind: "fix"; wrong: string; right: string; later: boolean };

export interface Snippet { file: string; lang: Lang; segments: Segment[]; text: string }

const MARK = /⟨([^|⟩]*)\|([^|⟩]*)(\|later)?⟩/g;

export function parseSnippet(file: string, raw: string): Snippet {
  const src = raw.replace(/\r\n/g, "\n").replace(/\s+$/, "") + "\n";
  const segments: Segment[] = [];
  let last = 0;
  for (const m of src.matchAll(MARK)) {
    if (m.index! > last) segments.push({ kind: "text", text: src.slice(last, m.index) });
    segments.push({ kind: "fix", wrong: m[1], right: m[2], later: !!m[3] });
    last = m.index! + m[0].length;
  }
  if (last < src.length) segments.push({ kind: "text", text: src.slice(last) });
  return { file: file.split("/").pop()!, lang: langOf(file), segments, text: src.replace(MARK, "$2") };
}

// ------------------------------------------------------------------ timing
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const chance = (p: number) => Math.random() < p;

interface Pending { line: number; col: number; wrong: string; right: string; typedAt: number }

export class LiveEditor {
  private lines: string[] = [""];
  private l = 0;
  private c = 0;
  private lang: Lang = "csharp";
  private rows: HTMLElement[] = [];
  private running = false;
  private resume: (() => void) | null = null;
  private members: string[];
  private tabs: { file: string; lang: Lang }[] = [];
  private readonly lh: number;

  constructor(private root: HTMLElement, private snippets: Snippet[]) {
    this.lh = parseFloat(getComputedStyle(root).getPropertyValue("--ed-lh")) || 20;
    // Autocomplete suggestions come from the members used across all snippets.
    const set = new Set<string>();
    for (const s of snippets) for (const m of s.text.matchAll(/\.([A-Z]\w{3,})/g)) set.add(m[1]);
    this.members = [...set];
  }

  private $<T extends HTMLElement>(sel: string) { return this.root.querySelector(sel) as T; }

  // ---------------------------------------------------------------- pause/resume
  setRunning(on: boolean) {
    this.running = on;
    if (on && this.resume) { const r = this.resume; this.resume = null; r(); }
  }
  private async sleep(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
    while (!this.running) await new Promise<void>((r) => (this.resume = r));
  }

  // ---------------------------------------------------------------- rendering
  private renderLine(i: number) {
    const row = this.rows[i];
    row.querySelector(".code")!.innerHTML = lineHtml(this.lines[i], this.lang, i === this.l ? this.c : undefined);
    row.classList.toggle("cur", i === this.l);
  }
  private addRow(at: number) {
    const row = document.createElement("div");
    row.className = "ln";
    row.innerHTML = '<span class="no"></span><span class="code"></span>';
    const body = this.$(".ed-lines");
    body.insertBefore(row, this.rows[at] ?? null);
    this.rows.splice(at, 0, row);
    for (let i = at; i < this.rows.length; i++) (this.rows[i].firstChild as HTMLElement).textContent = String(i + 1);
  }
  private status() {
    this.$(".ed-pos").textContent = `Ln ${this.l + 1}, Col ${this.c + 1}`;
  }
  /** Pixels kept free under the cursor's line: the autocomplete list (at most 128px plus
   *  its gap) always fits, so the view never has to move when it opens. The CSS pads
   *  .ed-content at least this much, so the space also exists at the end of the file. */
  private static readonly RESERVE = 140;

  private follow() {
    const view = this.$(".ed-view");
    const row = this.rows[this.l];
    const bottom = row.offsetTop + this.lh + LiveEditor.RESERVE;
    if (bottom > view.scrollTop + view.clientHeight) view.scrollTop = bottom - view.clientHeight;
    else if (row.offsetTop < view.scrollTop + this.lh) view.scrollTop = Math.max(0, row.offsetTop - 2 * this.lh);
    const caret = this.rows[this.l].querySelector(".caret") as HTMLElement | null;
    if (caret) {
      const x = caret.offsetLeft;
      if (x > view.scrollLeft + view.clientWidth - 40) view.scrollLeft = x - view.clientWidth + 80;
      else if (x < view.scrollLeft + 40) view.scrollLeft = Math.max(0, x - 80);
    }
  }
  private moveTo(l: number, c: number) {
    const old = this.l;
    this.l = l; this.c = c;
    this.renderLine(old);
    if (old !== l) this.renderLine(l);
    this.status(); this.follow();
  }

  // ---------------------------------------------------------------- editing
  private insert(text: string) {
    const s = this.lines[this.l];
    this.lines[this.l] = s.slice(0, this.c) + text + s.slice(this.c);
    this.c += text.length;
    this.renderLine(this.l); this.status(); this.follow();
  }
  private backspace() {
    const s = this.lines[this.l];
    this.lines[this.l] = s.slice(0, this.c - 1) + s.slice(this.c);
    this.c--;
    this.renderLine(this.l); this.status();
  }
  private newline(indent: string) {
    const s = this.lines[this.l];
    this.lines[this.l] = s.slice(0, this.c);
    this.lines.splice(this.l + 1, 0, indent + s.slice(this.c));
    this.addRow(this.l + 1);
    const prev = this.l;
    this.l++; this.c = indent.length;
    this.renderLine(prev); this.renderLine(this.l); this.status(); this.follow();
  }

  // ---------------------------------------------------------------- typing
  private delayFor(ch: string, prev: string) {
    let d = /\w/.test(ch) && /\w/.test(prev) ? rnd(26, 70) : rnd(45, 110);
    if (ch === " ") d = rnd(20, 60);
    if (/[;{}),]/.test(prev)) d += rnd(60, 200);
    return d;
  }

  private async typeText(text: string, onNewline?: () => Promise<void>) {
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === "\n") {
        let j = i + 1;
        while (text[j] === " " || text[j] === "\t") j++;
        await this.sleep(rnd(120, 380) + (chance(0.05) ? rnd(700, 1600) : 0));
        this.newline(text.slice(i + 1, j));   // the editor indents for you
        i = j - 1;
        if (onNewline) await onNewline();
        continue;
      }
      // Now and then the autocomplete finishes a member name after a dot.
      const word = /^[A-Z]\w{4,}/.exec(text.slice(i));
      if (word && this.lines[this.l][this.c - 1] === "." && chance(0.35)) {
        await this.complete(word[0]);
        i += word[0].length - 1;
        continue;
      }
      await this.sleep(this.delayFor(ch, text[i - 1] ?? ""));
      this.insert(ch);
    }
  }

  private async complete(word: string) {
    const typed = Math.min(word.length - 2, 1 + Math.floor(Math.random() * 3));
    for (const ch of word.slice(0, typed)) { await this.sleep(rnd(50, 110)); this.insert(ch); }
    const prefix = word.slice(0, typed);
    const others = this.members
      .filter((m) => m !== word && m.startsWith(prefix[0]))
      .sort(() => Math.random() - 0.5).slice(0, 4);
    const items = [...new Set([word, ...others])].sort();
    const popup = this.$(".ed-popup");
    popup.innerHTML = items.map((m) =>
      `<div class="ac${m === word ? " sel" : ""}"><span class="ac-i">${/Async$|^(Add|Get|Set|With|To|Map|Use|Create|Write|Read|Send|Try)/.test(m) ? "ƒ" : "◇"}</span>${m}</div>`).join("");
    const caret = this.rows[this.l].querySelector(".caret") as HTMLElement;
    popup.style.left = `${caret.offsetLeft}px`;
    popup.style.top = `${this.rows[this.l].offsetTop + this.lh}px`;
    popup.hidden = false;
    // Make sure the whole list is in view: scroll down if its bottom would be cut off.
    const view = this.$(".ed-view");
    const bottom = popup.offsetTop + popup.offsetHeight + 8;
    if (bottom > view.scrollTop + view.clientHeight) view.scrollTop = bottom - view.clientHeight;
    await this.sleep(rnd(350, 750));
    popup.hidden = true;
    this.insert(word.slice(typed));
    await this.sleep(rnd(80, 160));
  }

  private async erase(n: number) {
    for (let k = 0; k < n; k++) { await this.sleep(rnd(35, 70)); this.backspace(); }
  }

  private async fixLater(p: Pending) {
    const back = { l: this.l, c: this.c };
    await this.sleep(rnd(500, 1100));
    this.moveTo(p.line, p.col + p.wrong.length);
    await this.sleep(rnd(300, 600));
    await this.erase(p.wrong.length);
    await this.typeText(p.right);
    await this.sleep(rnd(300, 600));
    this.moveTo(back.l, back.c);
  }

  private async play(s: Snippet) {
    const pending: Pending[] = [];
    const settle = async (force = false) => {
      for (const p of [...pending]) {
        if (force || this.l - p.typedAt >= 2) {
          pending.splice(pending.indexOf(p), 1);
          await this.fixLater(p);
        }
      }
    };
    for (const seg of s.segments) {
      if (seg.kind === "text") { await this.typeText(seg.text, () => settle()); continue; }
      if (seg.later) {
        const at = { line: this.l, col: this.c };
        await this.typeText(seg.wrong);
        pending.push({ ...at, wrong: seg.wrong, right: seg.right, typedAt: this.l });
      } else {
        await this.typeText(seg.wrong);
        await this.sleep(rnd(350, 850));
        await this.erase(seg.wrong.length);
        await this.sleep(rnd(120, 300));
        await this.typeText(seg.right);
      }
    }
    await settle(true);
  }

  // ---------------------------------------------------------------- files
  private open(s: Snippet) {
    this.lang = s.lang;
    this.lines = [""]; this.l = 0; this.c = 0; this.rows = [];
    this.$(".ed-lines").innerHTML = "";
    this.addRow(0); this.renderLine(0);
    const view = this.$(".ed-view"); view.scrollTop = 0; view.scrollLeft = 0;
    this.tabs = [...this.tabs.filter((t) => t.file !== s.file), { file: s.file, lang: s.lang }].slice(-3);
    this.$(".ed-tabs").innerHTML = this.tabs.map((t) =>
      `<span class="tab${t.file === s.file ? " on" : ""}"><span class="badge b-${t.lang}">${langInfo[t.lang].badge}</span>${t.file}${t.file === s.file ? '<span class="dirty">●</span>' : ""}</span>`).join("");
    this.$(".ed-lang").textContent = langInfo[s.lang].name;
    this.$(".ed-indent").textContent = langInfo[s.lang].indent;
    this.status();
  }
  private async save() {
    await this.sleep(rnd(500, 900));
    this.$(".tab.on .dirty")?.remove();
    const msg = this.$(".ed-msg");
    msg.textContent = "✓ Saved";
    await this.sleep(1500);
    msg.textContent = "";
  }

  private deck(): Snippet[] {
    const d = [...this.snippets].sort(() => Math.random() - 0.5);
    // Mostly C#: never two non-C# files in a row
    for (let i = 1; i < d.length; i++) {
      if (d[i].lang !== "csharp" && d[i - 1].lang !== "csharp") {
        const j = d.findIndex((s, k) => k > i && s.lang === "csharp");
        if (j > 0) [d[i], d[j]] = [d[j], d[i]];
      }
    }
    return d;
  }

  async start(first?: string) {
    let deck = this.deck();
    const f = deck.findIndex((s) => s.file === first);
    if (f > 0) deck.unshift(...deck.splice(f, 1));
    for (;;) {
      for (const s of deck) {
        this.open(s);
        await this.sleep(rnd(600, 1200));
        await this.play(s);
        await this.save();
        await this.sleep(rnd(1500, 2800));
      }
      deck = this.deck();
    }
  }
}
