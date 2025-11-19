import { create } from "zustand";

interface SearchOpenState {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useSearchOpen = create<SearchOpenState>((set) => ({
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
}));