import { create } from 'zustand';

export type Page = 'home' | 'medications' | 'supplements' | 'allergies' | 'preferences' | 'recipes' | 'profile';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  dietary_goals: string;
}


export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  food_interactions: string;
  notes: string;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  benefits: string;
}


export interface Allergy {
  id: string;
  name: string;
  severity: string;
  notes: string;
}

export interface DietaryPreference {
  id: string;
  preference: string;
  enabled: boolean;
}

interface AppState {
  currentPage: Page;
  setPage: (page: Page) => void;
  userName: string;
  setUserName: (name: string) => void;
  medications: Medication[];
  setMedications: (meds: Medication[]) => void;
  supplements: Supplement[];
  setSupplements: (supps: Supplement[]) => void;
  allergies: Allergy[];
  setAllergies: (allergies: Allergy[]) => void;
  preferences: DietaryPreference[];
  setPreferences: (prefs: DietaryPreference[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  setPage: (page) => set({ currentPage: page }),
  userName: 'Herbalist',
  setUserName: (name) => set({ userName: name }),
  medications: [],
  setMedications: (medications) => set({ medications }),
  supplements: [],
  setSupplements: (supplements) => set({ supplements }),
  allergies: [],
  setAllergies: (allergies) => set({ allergies }),
  preferences: [],
  setPreferences: (preferences) => set({ preferences }),
}));
