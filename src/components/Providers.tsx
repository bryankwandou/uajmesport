"use client";
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { DEFAULT_LOCALE, DICTS, dirFor, isLocale, type Dict, type Locale } from "@/lib/i18n";

type Theme = "dark" | "light";

type Ctx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
};

const AppCtx = createContext<Ctx | null>(null);

export const THEME_KEY = "uajmesport.theme";
export const LOCALE_KEY = "uajmesport.locale";

/* Runs before paint so the stored theme is applied without a flash. Values are
   validated against a fixed allow-list, never interpolated into markup. */
export const noFlashScript = `(function(){try{
var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});
if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}
document.documentElement.dataset.theme=t;
var l=localStorage.getItem(${JSON.stringify(LOCALE_KEY)});
var ok=${JSON.stringify(["id","en","zh","ja","ko","es","fr","de","pt","ar"])};
if(ok.indexOf(l)===-1){l=${JSON.stringify(DEFAULT_LOCALE)};}
document.documentElement.lang=l;
document.documentElement.dir=(l==="ar")?"rtl":"ltr";
}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Adopt whatever the pre-paint script already resolved.
  useEffect(() => {
    const el = document.documentElement;
    const t = el.dataset.theme;
    if (t === "light" || t === "dark") setThemeState(t);
    const l = el.lang;
    if (l && isLocale(l)) setLocaleState(l);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    const apply = () => {
      setThemeState(next);
      document.documentElement.dataset.theme = next;
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A view transition cross-fades the swap. Plain CSS transitions cannot be
    // used here: body colours read from :root custom properties do not repaint.
    const startVT = (
      document as Document & { startViewTransition?: (cb: () => void) => unknown }
    ).startViewTransition;
    if (typeof startVT === "function" && !reduced) startVT.call(document, apply);
    else apply();

    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable, in-memory state still applies */
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    const el = document.documentElement;
    el.lang = next;
    el.dir = dirFor(next);
    try {
      localStorage.setItem(LOCALE_KEY, next);
    } catch {
      /* storage unavailable, in-memory state still applies */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ theme, setTheme, locale, setLocale, t: DICTS[locale] }),
    [theme, setTheme, locale, setLocale],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside Providers");
  return ctx;
}
