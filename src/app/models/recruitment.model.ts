import type { ApiFilters } from './base.model';

export type JobDepartment = 'Mathematics' | 'Coding' | 'Admissions' | 'All Departments';
export type JobLocation =
  | 'Remote'
  | 'San Francisco'
  | 'London'
  | 'Remote / SF'
  | 'Remote / London'
  | 'Cambridge (Hybrid)'
  | 'All Locations';

export type DepartmentBadgeVariant = 'secondary' | 'primary' | 'tertiary';

/** Enum names sent to the backend in create/update requests */
export type BadgeVariantEnum = 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
export type JobTypeEnum = 'FULL_TIME' | 'CONTRACT' | 'PART_TIME';

export interface JobResponsibility {
  icon: string;
  title: string;
  body: string;
}

export interface JobBenefit {
  icon: string;
  title: string;
  body: string;
}

export interface JobPosting {
  id: number;
  title: string;
  department: Exclude<JobDepartment, 'All Departments'>;
  location: Exclude<JobLocation, 'All Locations'>;
  badgeVariant: DepartmentBadgeVariant;
  // Detail fields (optional — only present on full job records)
  type?: string;
  description?: string[];
  responsibilities?: JobResponsibility[];
  requirements?: string[];
  benefits?: JobBenefit[];
  deadline?: string;
  recruiter?: string;
  reference?: string;
  // Backend-only field
  isActive?: boolean;
}

export interface JobFilters {
  department: JobDepartment;
  location: JobLocation;
}

export interface TalentNetworkRequest {
  email: string;
}

export interface RecruitmentBenefit {
  icon: string;
  title: string;
  description: string;
}

// ── Admin request types ───────────────────────────────────────────────────────

export interface JobResponsibilityRequest {
  icon: string;
  title: string;
  body: string;
}

export interface JobBenefitRequest {
  icon: string;
  title: string;
  body: string;
}

export interface CreateJobPostingRequest {
  title: string;
  department: string;
  location: string;
  badgeVariant: BadgeVariantEnum;
  type: JobTypeEnum;
  isActive: boolean;
  deadline?: string;
  recruiter?: string;
  reference?: string;
  description: string[];
  responsibilities: JobResponsibilityRequest[];
  requirements: string[];
  benefits: JobBenefitRequest[];
}

export interface UpdateJobPostingRequest extends Partial<CreateJobPostingRequest> {
  id: number;
}

export interface JobPostingApiFilters extends ApiFilters {
  search?: string;
}
