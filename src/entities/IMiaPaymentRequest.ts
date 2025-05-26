// src/entities/IMiaPaymentRequest.ts
// VERSIUNE NOUĂ CU AJUSTĂRI
export interface IMiaPaymentRequest {
  fromAccountId: number;
  beneficiaryPhoneNumber: string; // Modificat din beneficiaryIdentifier, nume eliminat
  amount: number;
  currency: 'LEI'; // Forțăm LEI aici sau validăm în formular
  description?: string;
}