export interface IDomesticBankTransferRequest {
  fromAccountId: number;
  toIban: string;
  beneficiaryName: string;
  beneficiaryBankName: string;
  amount: number;
  currency: string;
  description: string;
}