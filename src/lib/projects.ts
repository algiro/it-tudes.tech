import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import { defaultLang, type Lang } from "../../content/site";
import { isLang } from "../i18n/utils";

type Entry = CollectionEntry<"projects">;
type Color = NonNullable<Entry["data"]["color"]>;

export interface GalleryImage { src: ImageMetadata; alt: string }

export interface Project {
  slug: string;
  /** Language the text is in: the requested one, or English when there is no translation. */
  lang: Lang;
  translated: boolean;
  /** Entry whose Markdown body is shown on the detail page. */
  body: Entry;
  /** `image` or `images`, normalised; the first one is the thumbnail. Empty when there are none. */
  gallery: GalleryImage[];
  data: Omit<Entry["data"], "tags" | "external" | "color" | "order" | "draft"> & {
    tags: string[];
    external: boolean;
    color: Color;
    order: number;
    draft: boolean;
  };
}

/** "ninvoices/it" -> ["ninvoices", "it"] */
function split(entry: Entry): [string, string] {
  const i = entry.id.lastIndexOf("/");
  return [entry.id.slice(0, i), entry.id.slice(i + 1)];
}

/**
 * Projects in `lang`, by `order` then title. Each field comes from the translation when it
 * sets it, otherwise from en.md. Drafts show up only in `npm run dev`.
 */
export async function getProjects(lang: Lang): Promise<Project[]> {
  const bySlug = new Map<string, Partial<Record<Lang, Entry>>>();
  for (const entry of await getCollection("projects")) {
    const [slug, fileLang] = split(entry);
    if (!isLang(fileLang)) {
      console.warn(`[projects] ignoring ${entry.id}.md: name it en.md, es.md or it.md`);
      continue;
    }
    bySlug.set(slug, { ...bySlug.get(slug), [fileLang]: entry });
  }

  const projects: Project[] = [];
  for (const [slug, files] of bySlug) {
    const base = files[defaultLang] ?? Object.values(files)[0]!;
    const local = files[lang];
    const merged = { ...base.data, ...definedOnly(local?.data) };
    const data = {
      ...merged,
      tags: merged.tags ?? [],
      external: merged.external ?? false,
      color: merged.color ?? "blue",
      order: merged.order ?? 100,
      draft: merged.draft ?? false,
    };
    if (data.draft && !import.meta.env.DEV) continue;
    const body = local?.body?.trim() ? local : base;
    const gallery = data.images?.length
      ? data.images.map((img, i) => ({ src: img.src, alt: data.imageAlts?.[i] ?? img.alt ?? "" }))
      : data.image ? [{ src: data.image, alt: data.imageAlt ?? "" }] : [];
    projects.push({ slug, lang: local ? lang : split(base)[1] as Lang, translated: !!local, body, gallery, data });
  }
  return projects.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

function definedOnly<T extends object>(obj: T | undefined): Partial<T> {
  return obj ? (Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>) : {};
}

/** Where a project item leads: its own page, or straight to `link` when `external: true`. */
export function projectHref(p: Project, pagePath: (path: string) => string): string {
  return p.data.external && p.data.link ? p.data.link : pagePath(`/projects/${p.slug}/`);
}

export const tileColors: Record<Color, [string, string]> = {
  blue: ["#1E3A8A", "#3B82F6"],
  orange: ["#0F172A", "#EA580C"],
  teal: ["#134E4A", "#14B8A6"],
  amber: ["#7C2D12", "#F59E0B"],
  violet: ["#3B0764", "#8B5CF6"],
  slate: ["#1E293B", "#64748B"],
};

/** Label key for a repository link: GitHub gets its name, anything else is "Source code". */
export const repoLabelKey = (url: string) =>
  new URL(url).hostname.replace(/^www\./, "") === "github.com" ? "project.github" as const : "project.source" as const;

/** "ASP.NET Core" -> "#aspnetcore" */
export const hashtag = (t: string) => "#" + t.toLowerCase().replace(/[^a-z0-9+#]/g, "");
