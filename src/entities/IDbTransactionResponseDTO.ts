export interface IDbTransactionResponseDTO {
  id: number; // Long devine number
  fromAccountNumber?: string | null; // Poate fi null dacă e depozit/retragere externă
  toAccountNumber?: string | null;   // Poate fi null
  amount: number; // BigDecimal devine number
  description?: string | null;
  timestamp: string; // LocalDateTime va fi un string (format ISO 8601)
  transactionType?: string | null;
}