export interface ApiResponse<T> {
    message: string,
    data?: T,
    error?: string,
    meta?: {
        totalCount?: number,
        page?: number,
        totalPages?: number
    }
}

export interface BulkDeleteResponse {
    deleted: string[],
    failed: { id: string, error: string }[]
}

export interface ValidationError {
    message: string;
    path: (string | number)[];
}