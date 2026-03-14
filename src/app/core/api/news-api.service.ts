import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from './base-api.service';
import { buildQueryString } from '../utils/auth.utils';
import type {
  News,
  CreateNewsRequest,
  UpdateNewsRequest,
  ApiListResponse,
  ApiSingleResponse,
  ApiFilters,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class NewsApiService extends BaseApiService<
  News,
  CreateNewsRequest,
  UpdateNewsRequest
> {
  protected readonly endpoint = '/api/news';

  /**
   * Get all news for admin view
   */
  getAllNews(filters?: ApiFilters): Observable<ApiListResponse<News>> {
    const qs = buildQueryString(filters);
    return this.http.get<ApiListResponse<News>>(
      `${this.baseUrl}/api/news/admin${qs}`
    );
  }

  /**
   * Get all public news
   */
  getAllPublic(): Observable<ApiListResponse<News>> {
    return this.http.get<ApiListResponse<News>>(
      `${this.baseUrl}/api/news/public`
    );
  }

  /**
   * Get a single public news item by ID
   * Overrides base getById to use /api/news/public endpoint
   */
  override getById(id: number | string): Observable<ApiSingleResponse<News>> {
    return this.http.get<ApiSingleResponse<News>>(
      `${this.baseUrl}/api/news/public/${id}`
    );
  }

  /**
   * Get a single news item by ID for admin view
   */
  getByIdForAdmin(id: number | string): Observable<ApiSingleResponse<News>> {
    return this.http.get<ApiSingleResponse<News>>(
      `${this.baseUrl}${this.endpoint}/${id}`
    );
  }
}
