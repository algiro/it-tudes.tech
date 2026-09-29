import { languages, defaultLang, type Lang } from "../../content/site";
import { ui, type UiKey } from "./ui";

export const langs = Object.keys(languages) as Lang[];

export const isLang = (s: string | undefined): s is Lang => !!s && s in languages;

/** Route param for `[...lang]` pages: undefined for the default language (served at /). */
export const langParam = (lang: Lang) => (lang === defaultLang ? undefined : lang);

export const langPaths = () => langs.map((lang) => ({ params: { lang: langParam(lang) }, props: { lang } }));

export const useT = (lang: Lang) => (key: UiKey) => ui[lang][key];

/** "/projects/x/" in `lang`: unchanged for English, "/it/projects/x/" for Italian. */
export const localePath = (lang: Lang, path: string) => (lang === defaultLang ? path : `/${lang}${path}`);

/** Strips the language prefix: "/it/projects/x/" -> "/projects/x/". */
export function stripLang(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  return isLang(first) && first !== defaultLang ? "/" + rest.join("/") : pathname;
}

export const ogLocale: Record<Lang, string> = { en: "en_GB", es: "es_ES", it: "it_IT" };
