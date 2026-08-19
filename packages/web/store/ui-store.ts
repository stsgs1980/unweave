/**
 * @file Global UI state management using Zustand.
 */

import { create } from "zustand";

/**
 * Interface for the UI store.
 * @property {boolean} isCommandPaletteOpen - Tracks if the command palette is visible.
 * @property {() => void} toggleCommandPalette - Toggles the palette visibility.
 * @property {(isOpen: boolean) => void} setCommandPaletteOpen - Sets a specific state.
 */
interface UIStore {
  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
}

/**
 * Zustand store for managing global UI state.
 */
export const useUIStore = create<UIStore>((set) => ({
  isCommandPaletteOpen: false,
  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
}));
