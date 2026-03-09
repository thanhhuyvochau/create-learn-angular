import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from './base-api.service';
import { buildQueryString } from '../utils/auth.utils';
import type {
  Class,
  CreateClassRequest,
  UpdateClassRequest,
  ClassApiFilters,
  ApiListResponse,
  ApiSingleResponse,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class ClassApiService extends BaseApiService<
  Class,
  CreateClassRequest,
  UpdateClassRequest
> {
  protected readonly endpoint = '/api/classes';

  /**
   * Get all public classes with optional filters
   * Overrides base getAll to use /api/classes/public endpoint
   */
  override getAll(filters?: ClassApiFilters): Observable<ApiListResponse<Class>> {
    const qs = buildQueryString(filters);
    return this.http.get<ApiListResponse<Class>>(
      `${this.baseUrl}/api/classes/public${qs}`
    );
  }

  /**
   * Get all classes for admin view
   */
  getAllForAdmin(filters?: ClassApiFilters): Observable<ApiListResponse<Class>> {
    const qs = buildQueryString(filters);
    return this.http.get<ApiListResponse<Class>>(
      `${this.baseUrl}/api/classes/admin${qs}`
    );
  }

  /**
   * Get free classes (type=FREE by default)
   */
  getFreeClasses(type: string = 'FREE'): Observable<ApiListResponse<Class>> {
    return this.getAll({ type });
  }

  /**
   * Get a single public class by ID
   * Overrides base getById to use /api/classes/public endpoint
   */
  override getById(id: number | string): Observable<ApiSingleResponse<Class>> {
    return this.http.get<ApiSingleResponse<Class>>(
      `${this.baseUrl}/api/classes/public/${id}`
    );
  }

  /**
   * Get a single class by ID for admin view
   */
  getByIdForAdmin(id: number | string): Observable<ApiSingleResponse<Class>> {
    return this.http.get<ApiSingleResponse<Class>>(
      `${this.baseUrl}${this.endpoint}/${id}`
    );
  }
}
