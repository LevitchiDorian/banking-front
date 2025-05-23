// src/entities/IBillPaymentRequestDTO.ts
export interface IBillPaymentRequestDTO {
  fromAccountId: number;
  providerKey: string;
  amount: number;
  currency: string;
  paymentDetails: Record<string, string>; // Similar cu Map<String, String>
  description?: string;
}