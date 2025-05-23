// src/constants/accountTypes.ts
export interface AccountTypeOption {
  value: string; // Acesta va fi trimis la backend (ex: "STANDARD_CHECKING")
  label: string; // Acesta va fi afișat utilizatorului (ex: "Cont Curent Standard")
}

export const ACCOUNT_TYPES_FOR_CREATION: AccountTypeOption[] = [
  { value: 'STANDARD_CHECKING', label: 'Cont Curent Standard' },
  { value: 'STANDARD_SAVINGS', label: 'Cont de Economii Standard' },
  { value: 'PREMIUM_CHECKING', label: 'Cont Curent Premium' },
  { value: 'PREMIUM_SAVINGS', label: 'Cont de Economii Premium' },
  // Adaugă alte tipuri dacă sunt definite în backend și vrei să le permiți
];