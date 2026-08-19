import { create } from "zustand";

interface UIStore {
  isCommandPaletteOpen: boolean;
  isWizardOpen: boolean; // NEW
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  setWizardOpen: (isOpen: boolean) => void; // NEW
}

export const useUIStore = create<UIStore>((set) => ({
  isCommandPaletteOpen: false,
  isWizardOpen: false,
  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  setWizardOpen: (isOpen) => set({ isWizardOpen: isOpen }),
}));
