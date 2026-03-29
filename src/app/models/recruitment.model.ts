export type JobDepartment = 'Mathematics' | 'Coding' | 'Admissions' | 'All Departments';
export type JobLocation = 'Remote' | 'San Francisco' | 'London' | 'Remote / SF' | 'Remote / London' | 'All Locations';

export type DepartmentBadgeVariant = 'secondary' | 'primary' | 'tertiary';

export interface JobPosting {
  id: number;
  title: string;
  department: Exclude<JobDepartment, 'All Departments'>;
  location: Exclude<JobLocation, 'All Locations'>;
  badgeVariant: DepartmentBadgeVariant;
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
