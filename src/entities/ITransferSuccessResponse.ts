import { IDbTransactionResponseDTO } from './IDbTransactionResponseDTO';

export interface ITransferSuccessResponse {
  message: string;
  transaction?: IDbTransactionResponseDTO;
}