export interface IIntrabankTransferRequest {
  fromAccountId: number;
  toIban: string;
  beneficiaryName: string;
  amount: number;
  currency: string;
  description?: string;
}