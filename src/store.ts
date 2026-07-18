// zustand store: language + question history, both persisted to AsyncStorage.
// Keys are versioned (TRD): lcai-lang-v1, lcai-history-v1.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import i18n, { LANG_KEY } from "./i18n";
import { Answer } from "./engine";

export const HISTORY_KEY = "lcai-history-v1";
const HISTORY_MAX = 50; // ponytail: flat cap, prune-oldest; paginate if history ever matters more

export interface HistoryItem {
  query: string;
  source: Answer["source"];
  entryId: string | null;
  ts: number;
}

interface State {
  lang: "bn" | "en";
  history: HistoryItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggleLang: () => void;
  addHistory: (a: Answer) => void;
  clearHistory: () => void;
}

export const useStore = create<State>((set, get) => ({
  lang: "bn",
  history: [],
  hydrated: false,

  hydrate: async () => {
    let lang: "bn" | "en" = "bn";
    let history: HistoryItem[] = [];
    try {
      const [l, h] = await Promise.all([
        AsyncStorage.getItem(LANG_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);
      if (l === "en" || l === "bn") lang = l;
      if (h) {
        const parsed = JSON.parse(h);
        if (Array.isArray(parsed)) history = parsed.filter((x) => x && typeof x.query === "string");
      }
    } catch {
      // corrupted storage (H5): fall back to defaults and reset the bad key
      AsyncStorage.removeItem(HISTORY_KEY).catch(() => {});
    }
    i18n.changeLanguage(lang);
    set({ lang, history, hydrated: true });
  },

  toggleLang: () => {
    const lang = get().lang === "bn" ? "en" : "bn";
    i18n.changeLanguage(lang);
    set({ lang });
    AsyncStorage.setItem(LANG_KEY, lang).catch(() => {});
  },

  addHistory: (a) => {
    const item: HistoryItem = { query: a.query, source: a.source, entryId: a.entry?.id ?? null, ts: a.ts };
    const history = [item, ...get().history].slice(0, HISTORY_MAX);
    set({ history });
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => {});
  },

  clearHistory: () => {
    set({ history: [] });
    AsyncStorage.removeItem(HISTORY_KEY).catch(() => {});
  },
}));
