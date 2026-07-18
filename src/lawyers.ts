// DEMO DATA — fictitious lawyer profiles for the prototype (gate B3).
// Never present these as real. Real lawyer onboarding is a HALT item.

export interface Lawyer {
  id: string;
  name_bn: string;
  name_en: string;
  specialty: "traffic" | "family" | "land";
  city_bn: string;
  city_en: string;
  years: number;
  fee: number; // BDT, consultation (demo figure)
}

export const LAWYERS: Lawyer[] = [
  { id: "lw1", name_bn: "অ্যাড. ফারহানা রহমান (ডেমো)", name_en: "Adv. Farhana Rahman (DEMO)", specialty: "family", city_bn: "ঢাকা", city_en: "Dhaka", years: 12, fee: 500 },
  { id: "lw2", name_bn: "অ্যাড. মাহমুদ হাসান (ডেমো)", name_en: "Adv. Mahmud Hasan (DEMO)", specialty: "traffic", city_bn: "ঢাকা", city_en: "Dhaka", years: 8, fee: 400 },
  { id: "lw3", name_bn: "অ্যাড. শামীমা আক্তার (ডেমো)", name_en: "Adv. Shamima Akter (DEMO)", specialty: "land", city_bn: "চট্টগ্রাম", city_en: "Chattogram", years: 15, fee: 600 },
  { id: "lw4", name_bn: "অ্যাড. রফিকুল ইসলাম (ডেমো)", name_en: "Adv. Rafiqul Islam (DEMO)", specialty: "land", city_bn: "রাজশাহী", city_en: "Rajshahi", years: 10, fee: 450 },
];
