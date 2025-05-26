// src/entities/ISwiftPaymentRequest.ts
export interface ISwiftPaymentRequest {
  fromAccountId: number;
  beneficiaryName: string;
  beneficiaryAddress: string;
  beneficiaryIban: string;
  beneficiaryBankBic: string;
  beneficiaryBankName: string;
  beneficiaryBankAddress?: string;
  amount: number;
  currency: string; // Moneda transferului
  paymentDetails: string; // Scopul plății
  charges: 'OUR' | 'BEN' | 'SHA'; // Tipul comisioanelor
  correspondentBankBic?: string;
  correspondentBankName?: string;
  correspondentBankAccount?: string;
}