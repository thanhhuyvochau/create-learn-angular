import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from './base-api.service';
import type {
  News,
  CreateNewsRequest,
  UpdateNewsRequest,
  ApiListResponse,
  ApiSingleResponse,
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
  getAllNews(): Observable<ApiListResponse<News>> {
    return this.http.get<ApiListResponse<News>>(
      `${this.baseUrl}/api/news/admin`
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
