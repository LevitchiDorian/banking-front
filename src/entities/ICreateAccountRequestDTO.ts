export interface ICreateAccountRequestDTO {
  accountTypeName: string;
  initialDeposit: number; // În frontend, BigDecimal este de obicei gestionat ca number
  currency?: string;
}