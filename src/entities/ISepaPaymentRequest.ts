// src/entities/ISepaPaymentRequest.ts
export interface ISepaPaymentRequest {
  fromAccountId: number;
  beneficiaryName: string;
  beneficiaryIban: string;
  beneficiaryBankBic: string;
  amount: number; // Va fi mereu în EUR
  // currency: 'EUR'; // Nu e nevoie, se subînțelege sau se setează fix "EUR" la trimitere
  paymentDetails: string;
}