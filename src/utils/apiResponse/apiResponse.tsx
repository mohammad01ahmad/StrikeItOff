// Detailed sub-errors for UI form validation mapping
export interface ValidationError {
  field: string;
  reason: string;
}

export interface SuccessResponse<T = undefined> {
  status: 'success';
  message: string;
  code: number;
  data?: T;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  code: number;
  errors?: ValidationError[]; // Added for form validations
}

// Discriminated Union Type for clean front-end handling
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function successResponse<T>(message: string, data?: T, code = 200): SuccessResponse<T> {
  return {
    status: 'success',
    message,
    code,
    ...(data !== undefined && { data })
  };
}

export function errorResponse(message: string, code = 400, errors?: ValidationError[]): ErrorResponse {
  return {
    status: 'error',
    message,
    code,
    ...(errors !== undefined && { errors })
  };
}
