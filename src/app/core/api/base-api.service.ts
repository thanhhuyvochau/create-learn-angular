import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../tokens';
import type { ApiListResponse, ApiSingleResponse, ApiFilters, BaseEntity } from '../../models';
import { buildQueryString } from '../utils/auth.utils';

@Injectable()
export abstract class BaseApiService<
  T extends BaseEntity,
  CreateT = Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  UpdateT = Partial<CreateT>
> {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = inject(API_BASE_URL);

  protected abstract readonly endpoint: string;

  /**
   * Get all entities with optional filters
   */
  getAll(filters?: ApiFilters): Observable<ApiListResponse<T>> {
    const qs = buildQueryString(filters);
    return this.http.get<ApiListResponse<T>>(`${this.baseUrl}${this.endpoint}${qs}`);
  }

  /**
   * Get a single entity by ID
   */
  getById(id: number | string): Observable<ApiSingleResponse<T>> {
    return this.http.get<ApiSingleResponse<T>>(`${this.baseUrl}${this.endpoint}/${id}`);
  }

  /**
   * Create a new entity
   */
  create(data: CreateT): Observable<ApiSingleResponse<T>> {
    const { body, headers } = this.serializeData(data);
    return this.http.post<ApiSingleResponse<T>>(
      `${this.baseUrl}${this.endpoint}`,
      body,
      { headers }
    );
  }

  /**
   * Update an existing entity
   */
  update(id: number | string, data: UpdateT): Observable<ApiSingleResponse<T>> {
    const { body, headers } = this.serializeData(data);
    return this.http.put<ApiSingleResponse<T>>(
      `${this.baseUrl}${this.endpoint}/${id}`,
      body,
      { headers }
    );
  }

  /**
   * Delete an entity
   */
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${this.endpoint}/${id}`);
  }

  /**
   * Serialize data for HTTP request, handling FormData for file uploads
   */
  protected serializeData(data: unknown): { body: unknown; headers?: HttpHeaders } {
    if (data instanceof FormData) {
      return { body: data };
    }

    if (!data || typeof data !== 'object') {
      return {
        body: JSON.stringify(data),
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      };
    }

    const entries = Object.entries(data as Record<string, unknown>);
    const hasBinary = entries.some(([, value]) => this.isBinaryValue(value));

    if (!hasBinary) {
      return {
        body: data,
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      };
    }

    // Convert to FormData if there are binary values
    const form = new FormData();
    for (const [key, value] of entries) {
      this.appendToFormData(form, key, value);
    }

    return { body: form };
  }

  private isBinaryValue(value: unknown): boolean {
    if (value instanceof File || value instanceof Blob) return true;
    if (Array.isArray(value)) {
      return value.some((item) => item instanceof File || item instanceof Blob);
    }
    return false;
  }

  private isFileLike(value: unknown): value is File | Blob {
    return value instanceof File || value instanceof Blob;
  }

  private normalizeValue(value: unknown): string {
    if (value == null) return '';
    if (value instanceof Date) return value.toISOString();
    switch (typeof value) {
      case 'string':
        return value;
      case 'number':
      case 'boolean':
      case 'bigint':
        return String(value);
      default:
        return JSON.stringify(value);
    }
  }

  private appendArrayToFormData(form: FormData, key: string, items: unknown[]): void {
    for (const item of items) {
      if (item == null) continue;

      if (this.isFileLike(item)) {
        form.append(key, item);
        continue;
      }

      if (Array.isArray(item)) {
        this.appendArrayToFormData(form, key, item);
        continue;
      }

      if (typeof item === 'object' && !(item instanceof Date)) {
        form.append(key, JSON.stringify(item));
        continue;
      }

      form.append(key, this.normalizeValue(item));
    }
  }

  private appendObjectToFormData(form: FormData, key: string, obj: object): void {
    if (obj instanceof Date) {
      form.append(key, obj.toISOString());
    } else {
      form.append(key, JSON.stringify(obj));
    }
  }

  private appendToFormData(form: FormData, key: string, value: unknown): void {
    if (value == null) return;

    if (this.isFileLike(value)) {
      form.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      this.appendArrayToFormData(form, key, value);
      return;
    }

    if (typeof value === 'object') {
      this.appendObjectToFormData(form, key, value);
      return;
    }

    form.append(key, this.normalizeValue(value));
  }
}
