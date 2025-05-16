export interface IOwnAccountTransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}