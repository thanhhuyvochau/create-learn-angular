import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_BASE_URL } from '../tokens';
import type {
  JobPosting,
  JobFilters,
  TalentNetworkRequest,
} from '../../models/recruitment.model';
import type { ApiListResponse, ApiSingleResponse } from '../../models/base.model';

@Injectable({ providedIn: 'root' })
export class RecruitmentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * Returns all active job postings.
   * Filters (department / location) are applied client-side after fetching all records
   * because the volume is small and the backend does not support these filter params yet.
   *
   * We request a large page size to retrieve all records in a single call.
   */
  getJobPostings(_filters?: Partial<JobFilters>): Observable<JobPosting[]> {
    return this.http
      .get<ApiListResponse<JobPosting>>(
        `${this.baseUrl}/api/job-postings/public?size=200&sort=id,asc`
      )
      .pipe(map((res) => res.data.data));
  }

  /**
   * Returns a single active job posting by id.
   */
  getJobPostingById(id: number): Observable<JobPosting | undefined> {
    return this.http
      .get<ApiSingleResponse<JobPosting>>(
        `${this.baseUrl}/api/job-postings/public/${id}`
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Subscribes an email address to the talent network.
   * No backend endpoint exists yet — this remains a no-op stub.
   */
  joinTalentNetwork(_request: TalentNetworkRequest): Observable<void> {
    return new Observable<void>((observer) => {
      observer.next(undefined);
      observer.complete();
    });
  }
}
