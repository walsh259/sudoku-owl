import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  // Display settings
  nightMode: boolean;
  highlightRelated: boolean;
  highlightSameNumber: boolean;
  showErrors: boolean;
  hapticFeedback: boolean;
  soundEnabled: boolean;

  // Actions
  toggleNightMode: () => void;
  setHighlightRelated: (value: boolean) => void;
  setHighlightSameNumber: (value: boolean) => void;
  setShowErrors: (value: boolean) => void;
  setHapticFeedback: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default settings
      nightMode: false,
      highlightRelated: true,
      highlightSameNumber: true,
      showErrors: true,
      hapticFeedback: true,
      soundEnabled: true,

      // Actions
      toggleNightMode: () => set((state) => ({ nightMode: !state.nightMode })),
      setHighlightRelated: (value) => set({ highlightRelated: value }),
      setHighlightSameNumber: (value) => set({ highlightSameNumber: value }),
      setShowErrors: (value) => set({ showErrors: value }),
      setHapticFeedback: (value) => set({ hapticFeedback: value }),
      setSoundEnabled: (value) => set({ soundEnabled: value }),
    }),
    {
      name: 'sudoku-owl-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
