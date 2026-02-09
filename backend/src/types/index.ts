// Global API Response Type
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Custom Error Type
export interface CustomError {
  statusCode: number;
  message: string;
}
