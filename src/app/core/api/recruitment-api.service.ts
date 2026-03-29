import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import type { JobPosting, JobFilters, TalentNetworkRequest } from '../../models/recruitment.model';

const MOCK_JOB_POSTINGS: JobPosting[] = [
  {
    id: 1,
    title: 'Senior Algorithmic Instructor',
    department: 'Mathematics',
    location: 'Remote / SF',
    badgeVariant: 'secondary',
  },
  {
    id: 2,
    title: 'Full Stack Developer (LMS)',
    department: 'Coding',
    location: 'Remote / London',
    badgeVariant: 'primary',
  },
  {
    id: 3,
    title: 'Student Success Lead',
    department: 'Admissions',
    location: 'Remote',
    badgeVariant: 'tertiary',
  },
  {
    id: 4,
    title: 'Curriculum Designer (Python)',
    department: 'Coding',
    location: 'Remote',
    badgeVariant: 'primary',
  },
  {
    id: 5,
    title: 'Academic Research Fellow',
    department: 'Mathematics',
    location: 'San Francisco',
    badgeVariant: 'secondary',
  },
   {
    id: 6,
    title: 'Academic Research Fellow',
    department: 'Mathematics',
    location: 'San Francisco',
    badgeVariant: 'secondary',
  },
   {
    id: 7,
    title: 'Academic Research Fellow',
    department: 'Mathematics',
    location: 'San Francisco',
    badgeVariant: 'secondary',
  },
   {
    id: 8,
    title: 'Academic Research Fellow',
    department: 'Mathematics',
    location: 'San Francisco',
    badgeVariant: 'secondary',
  },
   {
    id: 9,
    title: 'Academic Research Fellow',
    department: 'Mathematics',
    location: 'San Francisco',
    badgeVariant: 'secondary',
  },
   {
    id: 10,
    title: 'Academic Research Fellow',
    department: 'Mathematics',
    location: 'San Francisco',
    badgeVariant: 'secondary',
  },
   {
    id: 11,
    title: 'Academic Research Fellow',
    department: 'Mathematics',
    location: 'San Francisco',
    badgeVariant: 'secondary',
  },
];

@Injectable({ providedIn: 'root' })
export class RecruitmentApiService {
  /**
   * Returns all job postings, optionally filtered by department and/or location.
   * Currently backed by mock data — replace the body with an HttpClient call when the API is ready.
   */
  getJobPostings(filters?: Partial<JobFilters>): Observable<JobPosting[]> {
    let result = [...MOCK_JOB_POSTINGS];

    if (filters?.department && filters.department !== 'All Departments') {
      result = result.filter((job) => job.department === filters.department);
    }

    if (filters?.location && filters.location !== 'All Locations') {
      result = result.filter((job) => job.location === filters.location);
    }

    // Simulate a small network delay so loading states are exercised in the UI
    return of(result).pipe(delay(300));
  }

  /**
   * Subscribes an email address to the talent network.
   * Currently a no-op stub — replace with a real HTTP POST when the API is ready.
   */
  joinTalentNetwork(_request: TalentNetworkRequest): Observable<void> {
    return of(undefined).pipe(delay(500));
  }
}
