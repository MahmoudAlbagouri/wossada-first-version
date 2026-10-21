/** Envelope of every successful API response. */
export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

/** Envelope of every failed API response. */
export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  /** Field → messages, present on validation errors. */
  errors?: Record<string, string[]>;
  error: string;
  path: string;
  timestamp: string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export type Id = string;
export type IsoDate = string;
export type LanguageCode = 'ar' | 'en';

/** Normalized error thrown by `$api` so UI code never digs into fetch internals. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string[]> = {},
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Lets Nuxt's `createError()` keep the HTTP status (404 pages, etc.). */
  get statusCode(): number {
    return this.status;
  }

  /** First message for a field, handy for form inputs. */
  field(name: string): string | undefined {
    return this.fieldErrors[name]?.[0];
  }
}
