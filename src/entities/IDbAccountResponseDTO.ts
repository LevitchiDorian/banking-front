export interface IDbAccountResponseDTO {
  id: number; // Long devine number
  accountNumber: string;
  userName: string;
  accountTypeName: string;
  balance: number; // BigDecimal devine number
  currency: string;
  insuranceBenefit?: number; // BigDecimal devine number
  hasPremiumBenefits?: boolean;
  openedDate: string; // LocalDateTime va fi un string (format ISO 8601)
  
}