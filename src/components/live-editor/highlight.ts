// Tiny line-by-line syntax highlighter for the live editor. Stateless per line, so
// snippets avoid block comments and multi-line strings. Used at build time (the
// still version) and in the browser (while typing), so it must stay dependency-free.

export type Lang = "csharp" | "ts" | "sql" | "docker" | "yaml";

/** k keyword · y type · f function · s string · n number · m comment · p property/key · x special */
export type Kind = "k" | "y" | "f" | "s" | "n" | "m" | "p" | "x";
export interface Token { text: string; kind?: Kind }

const words = (s: string) => new Set(s.split(/\s+/));

const CS_KW = words(`abstract and as async await base bool break byte case catch char checked class
  const continue decimal default delegate do double else enum event explicit extern false file finally
  fixed float for foreach get global goto if implicit in init int interface internal is lock long
  nameof namespace new not null object operator or out override params partial private protected
  public readonly record ref required return sbyte scoped sealed set short sizeof stackalloc static
  string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using value var
  virtual void volatile when where while with yield`);

const TS_KW = words(`as async await break case catch class const continue default delete do else
  export extends false finally for from function if import in instanceof interface let new null of
  return satisfies switch this throw true try type typeof undefined var void while yield string number
  boolean unknown any never readonly keyof`);

const SQL_KW = words(`select from where and or not join left right inner outer full on group by order
  having limit offset as with insert into values update set delete create table index view distinct
  union all case when then else end is null in exists between like interval asc desc over partition
  current_date true false`);

const DOCKER_KW = words("FROM RUN COPY WORKDIR USER EXPOSE ENTRYPOINT CMD ENV ARG LABEL VOLUME HEALTHCHECK AS");

// One regex per language; the first group that matches decides the token.
const CS = /(\/\/.*)|(\$?@?"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b0x[0-9a-fA-F_]+\b|\b\d[\d_]*(?:\.\d+)?[mMfFdDlLuU]?\b)|(#\w+)|([A-Za-z_]\w*)|(\s+)|(.)/g;
const TS = /(\/\/.*)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|(\b\d[\d_]*(?:\.\d+)?\b)|(@\w+)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;
const SQL = /(--.*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|(::\w+)|([A-Za-z_]\w*)|(\s+)|(.)/g;

function generic(line: string, re: RegExp, keyword: (w: string) => boolean, pascalTypes: boolean): Token[] {
  const out: Token[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const [all, comment, str, num, special, ident] = m;
    if (comment) out.push({ text: all, kind: "m" });
    else if (str) out.push({ text: all, kind: "s" });
    else if (num) out.push({ text: all, kind: "n" });
    else if (special) out.push({ text: all, kind: "x" });
    else if (ident) {
      const rest = line.slice(re.lastIndex);
      const prev = line.slice(0, m.index).trimEnd().slice(-1);
      const call = /^\s*(<[\w<>, ?[\]]*>)?\s*\(/.test(rest);
      const afterNew = /\bnew\s*$/.test(line.slice(0, m.index));
      if (keyword(ident)) out.push({ text: all, kind: "k" });
      else if (call && !afterNew) out.push({ text: all, kind: "f" });
      else if (pascalTypes && /^[A-Z]/.test(ident) && prev !== ".") out.push({ text: all, kind: "y" });
      else out.push({ text: all });
    } else out.push({ text: all });
  }
  return out;
}

function docker(line: string): Token[] {
  if (/^\s*#/.test(line)) return [{ text: line, kind: "m" }];
  const out: Token[] = [];
  const re = /("(?:[^"\\]|\\.)*"?)|(\$\{?\w+\}?)|(\b\d+(?:\.\d+)*\b)|([A-Za-z_][\w.-]*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null; let first = true;
  while ((m = re.exec(line))) {
    const [all, str, variable, num, word] = m;
    if (str) out.push({ text: all, kind: "s" });
    else if (variable) out.push({ text: all, kind: "p" });
    else if (num) out.push({ text: all, kind: "n" });
    else if (word && (first || all === "AS") && DOCKER_KW.has(all)) out.push({ text: all, kind: "k" });
    else out.push({ text: all });
    if (!/^\s+$/.test(all)) first = false;
  }
  return out;
}

function yaml(line: string): Token[] {
  const out: Token[] = [];
  const key = /^(\s*(?:-\s+)?)([\w.$-]+)(:)(?=\s|$)/.exec(line);
  let rest = line;
  if (key) {
    out.push({ text: key[1] }, { text: key[2], kind: "p" }, { text: key[3] });
    rest = line.slice(key[0].length);
  } else {
    const dash = /^(\s*-\s+)/.exec(line);
    if (dash) { out.push({ text: dash[1] }); rest = line.slice(dash[0].length); }
  }
  const re = /(\s#.*|^#.*)|(\$\{\{[^}]*\}?\}?)|("(?:[^"\\]|\\.)*"?|'[^']*'?)|(\b(?:true|false|null)\b)|(\b\d+(?:\.\d+)*\b)|([^\s$"'#]+|\s+|.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest))) {
    const [all, comment, expr, str, bool, num] = m;
    if (comment) out.push({ text: all, kind: "m" });
    else if (expr) out.push({ text: all, kind: "x" });
    else if (str) out.push({ text: all, kind: "s" });
    else if (bool) out.push({ text: all, kind: "k" });
    else if (num) out.push({ text: all, kind: "n" });
    else out.push({ text: all });
  }
  return out;
}

export function highlight(line: string, lang: Lang): Token[] {
  switch (lang) {
    case "csharp": return generic(line, CS, (w) => CS_KW.has(w), true);
    case "ts": return generic(line, TS, (w) => TS_KW.has(w), true);
    case "sql": return generic(line, SQL, (w) => SQL_KW.has(w.toLowerCase()), false);
    case "docker": return docker(line);
    case "yaml": return yaml(line);
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** HTML for one line; when `caret` is a column, a caret element is placed there. */
export function lineHtml(line: string, lang: Lang, caret?: number): string {
  let html = "";
  let pos = 0;
  const put = (text: string, kind?: Kind) => {
    if (text) html += kind ? `<span class="t${kind}">${esc(text)}</span>` : esc(text);
  };
  for (const tok of highlight(line, lang)) {
    const end = pos + tok.text.length;
    if (caret !== undefined && caret >= pos && caret < end) {
      put(tok.text.slice(0, caret - pos), tok.kind);
      html += '<span class="caret"></span>';
      put(tok.text.slice(caret - pos), tok.kind);
    } else put(tok.text, tok.kind);
    pos = end;
  }
  if (caret !== undefined && caret >= pos) html += '<span class="caret"></span>';
  return html;
}

export function langOf(file: string): Lang {
  if (/\.cs$/i.test(file)) return "csharp";
  if (/\.tsx?$/i.test(file)) return "ts";
  if (/\.sql$/i.test(file)) return "sql";
  if (/\.ya?ml$/i.test(file)) return "yaml";
  if (/dockerfile/i.test(file)) return "docker";
  return "csharp";
}

export const langInfo: Record<Lang, { name: string; indent: string; badge: string }> = {
  csharp: { name: "C#", indent: "Spaces: 4", badge: "C#" },
  ts: { name: "TypeScript", indent: "Spaces: 2", badge: "TS" },
  sql: { name: "PostgreSQL", indent: "Spaces: 4", badge: "SQL" },
  docker: { name: "Dockerfile", indent: "Spaces: 4", badge: "DK" },
  yaml: { name: "YAML", indent: "Spaces: 2", badge: "YML" },
};
