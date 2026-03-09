export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiListResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}
ex
export interface ApiSingleResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface ApiFilters {
  id?: number;
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  [key: string]: string | number | boolean | undefined;
}
