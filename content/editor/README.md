# Live editor snippets

Every file in this folder (except this README) is typed, forever and in random
order, by the live editor on the home page (`src/components/LiveEditor.astro`).
Mostly C#; never two non-C# files in a row.

- **Add a snippet:** drop a file here. The extension sets the highlighting:
  `.cs`, `.ts`, `.sql`, `.yml`/`.yaml`, or `.Dockerfile` (e.g. `Billing.Api.Dockerfile`; a file named just `Dockerfile` breaks `npm run dev`).
- **Remove one:** delete the file.
- The file name is the editor tab name, so name it like the real file would be.

## Corrections

Mark a fix the "coder" makes while typing:

| Marker | What happens |
|---|---|
| `⟨wrong\|right⟩` | types `wrong`, pauses, deletes it, types `right` |
| `⟨wrong\|right\|later⟩` | types `wrong`, carries on for two lines, goes back to fix it, returns |

Either side may be empty: `⟨\|await \|later⟩` is a forgotten `await` added afterwards.
Copy the `⟨` `⟩` characters from an existing file.

## Keep in mind

- Code only, no client code or anything confidential: this is public.
- One-line comments (`//`, `///`, `--`, `#`) only, no block comments or strings
  spanning lines (the highlighter works line by line).
- Lines under ~85 characters read best; around 15–35 lines per file.
- Visitors who prefer reduced motion see `OrderEndpoints.cs` still, fully written.
