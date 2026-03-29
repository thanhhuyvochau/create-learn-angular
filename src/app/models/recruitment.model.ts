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
