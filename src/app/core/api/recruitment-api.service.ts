import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseApiService } from './base-api.service';
import { buildQueryString } from '../utils/auth.utils';
import type {
  JobPosting,
  JobFilters,
  TalentNetworkRequest,
  CreateJobPostingRequest,
  UpdateJobPostingRequest,
  JobPostingApiFilters,
  BadgeVariantEnum,
} from '../../models/recruitment.model';
import type { ApiListResponse, ApiSingleResponse } from '../../models/base.model';

/** Maps backend response display value back to the enum name needed by the form. */
const BADGE_DISPLAY_TO_ENUM: Record<string, BadgeVariantEnum> = {
  primary: 'PRIMARY',
  secondary: 'SECONDARY',
  tertiary: 'TERTIARY',
};

/** Maps backend response display value back to the JobType enum name needed by the form. */
const TYPE_DISPLAY_TO_ENUM: Record<string, string> = {
  'Full-time': 'FULL_TIME',
  Contract: 'CONTRACT',
  'Part-time': 'PART_TIME',
};

@Injectable({ providedIn: 'root' })
export class RecruitmentApiService extends BaseApiService<
  JobPosting,
  CreateJobPostingRequest,
  UpdateJobPostingRequest
> {
  protected readonly endpoint = '/api/job-postings';

  // ── Public-facing read methods (hit /public sub-path) ────────────────────

  /**
   * Fetches all active job postings from the public endpoint.
   * Filters (department / location) are applied client-side after fetching
   * all records because the volume is small.
   */
  getJobPostings(_filters?: Partial<JobFilters>): Observable<JobPosting[]> {
    return this.http
      .get<ApiListResponse<JobPosting>>(
        `${this.baseUrl}${this.endpoint}/public?size=200&sort=id,asc`
      )
      .pipe(map((res) => res.data.data));
  }

  /**
   * Fetches a single active job posting by id from the public endpoint.
   */
  getJobPostingById(id: number): Observable<JobPosting | undefined> {
    return this.http
      .get<ApiSingleResponse<JobPosting>>(
        `${this.baseUrl}${this.endpoint}/public/${id}`
      )
      .pipe(map((res) => res.data));
  }

  // ── Admin read methods ────────────────────────────────────────────────────

  /**
   * Fetches all job postings for the admin view (includes inactive).
   * Returns data with badgeVariant and type normalized to enum names
   * so that mat-select form controls work correctly.
   */
  getAllAdmin(filters?: JobPostingApiFilters): Observable<ApiListResponse<JobPosting>> {
    const qs = buildQueryString(filters);
    return this.http
      .get<ApiListResponse<JobPosting>>(
        `${this.baseUrl}${this.endpoint}/admin${qs}`
      )
      .pipe(
        map((res) => ({
          ...res,
          data: {
            ...res.data,
            data: res.data.data.map((j) => this.normalizeForForm(j)),
          },
        }))
      );
  }

  /**
   * Fetches a single job posting by id for the admin edit form.
   * Returns data with badgeVariant and type normalized to enum names.
   */
  getByIdForAdmin(id: number | string): Observable<ApiSingleResponse<JobPosting>> {
    return this.http
      .get<ApiSingleResponse<JobPosting>>(
        `${this.baseUrl}${this.endpoint}/${id}`
      )
      .pipe(map((res) => ({ ...res, data: this.normalizeForForm(res.data) })));
  }

  // ── Stub ──────────────────────────────────────────────────────────────────

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

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Converts response display values back to enum names for use in form controls.
   *   "primary"   → "PRIMARY"
   *   "Full-time" → "FULL_TIME"
   */
  private normalizeForForm(job: JobPosting): JobPosting {
    return {
      ...job,
      badgeVariant: (BADGE_DISPLAY_TO_ENUM[job.badgeVariant as string] ??
        job.badgeVariant) as JobPosting['badgeVariant'],
      type: TYPE_DISPLAY_TO_ENUM[job.type as string] ?? job.type,
    };
  }
}
