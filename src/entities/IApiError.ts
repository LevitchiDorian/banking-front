export interface IApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}