// src/constants/billers.ts
export interface BillerField {
  name: string; // Numele câmpului (va fi cheia în paymentDetails)
  label: string; // Eticheta afișată în UI
  type: 'text' | 'number' | 'month' | 'tel'; // Tipul inputului HTML
  required?: boolean;
  placeholder?: string;
  pattern?: string; // Pentru validare HTML5, ex: regex pentru numere de telefon
  minLength?: number;
  maxLength?: number;
}

export interface Biller {
  key: string; // Identificator unic pentru backend (ex: 'MOLDTELECOM_INTERNET')
  name: string; // Nume afișat utilizatorului (ex: 'Moldtelecom - Internet Fix')
  fields: BillerField[];
  defaultAmount?: number; // Suma implicită (dacă e cazul)
}

export const BILLERS: Biller[] = [
  {
    key: 'MOLDTELECOM_INTERNET_FIX',
    name: 'Moldtelecom - Internet Fix',
    fields: [
      { name: 'contractNumber', label: 'Număr Contract / Telefon Fix', type: 'text', required: true, placeholder: 'Ex: 022123456 sau 234567' },
    ],
  },
  {
    key: 'MOLDTELECOM_TV',
    name: 'Moldtelecom - Televiziune Digitală',
    fields: [
      { name: 'accountNumber', label: 'Număr Cont TV', type: 'text', required: true, placeholder: 'Ex: 7xxxxxxxx' },
    ],
  },
  {
    key: 'STARNET_FIBRA',
    name: 'Starnet - Internet Fibră',
    fields: [
      { name: 'subscriberId', label: 'ID Abonat Starnet', type: 'text', required: true, placeholder: 'Ex: S0123456' },
    ],
  },
  {
    key: 'APA_CANAL_CHISINAU',
    name: 'Apă Canal Chișinău',
    fields: [
      { name: 'consumerCode', label: 'Cod Consumator (din factură)', type: 'text', required: true, placeholder: 'Ex: 1234567890' },
      // Poți adăuga câmp pentru numărul facturii dacă dorești, dar nu e mereu necesar pentru plată
      // { name: 'invoiceNumber', label: 'Număr Factură (opțional)', type: 'text', placeholder: 'Ex: AC2024...' },
    ],
  },
  // Adaugă alți furnizori aici
  // Exemplu pentru un furnizor generic
  {
    key: 'OTHER_UTILITY',
    name: 'Altă Utilitate (Generic)',
    fields: [
      { name: 'clientId', label: 'ID Client', type: 'text', required: true },
      { name: 'invoiceDetails', label: 'Detalii Factură', type: 'text', required: false },
    ]
  }
];