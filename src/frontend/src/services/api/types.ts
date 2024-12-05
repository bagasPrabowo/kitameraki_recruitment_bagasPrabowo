export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string,
  meta?: {
      totalCount?: number,
      page?: number,
      totalPages?: number
  }
}

export interface ErrorResponse {
  message: string;
  code?: string;
  status: number;
  error?: string,
}


export interface BulkDeleteResponse {
  deleted: string[],
  failed: { id: string, error: string }[]
}

export interface ValidationError {
  message: string;
  path: (string | number)[];
}