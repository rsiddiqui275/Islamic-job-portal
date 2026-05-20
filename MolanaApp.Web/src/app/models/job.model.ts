import { IslamicDesignation, JobType, JobStatus } from './enums.model';

export interface Job {
  id: string;
  title: string;
  description: string;
  requiredDesignation: IslamicDesignation;
  requiredDesignationName: string;
  preferredDesignations: IslamicDesignation[];
  jobType: JobType;
  status: JobStatus;
  
  minExperienceYears?: number;
  maxExperienceYears?: number;
  requiredSkills: string[];
  requiredLanguages: string[];
  
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  showSalary: boolean;
  
  city: string;
  state: string;
  country: string;
  isRemote: boolean;
  
  benefits: string[];
  accommodationProvided: boolean;
  foodProvided: boolean;
  
  postedAt: Date;
  expiresAt?: Date;
  
  viewCount: number;
  applicationCount: number;
  
  employer: EmployerSummary;
}

export interface EmployerSummary {
  id: string;
  organizationName: string;
  logoUrl?: string;
  isVerified: boolean;
  contactPhone?: string;
  contactEmail?: string;
  city?: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requiredDesignation: IslamicDesignation;
  preferredDesignations: IslamicDesignation[];
  jobType: JobType;
  
  minExperienceYears?: number;
  maxExperienceYears?: number;
  requiredSkills: string[];
  requiredLanguages: string[];
  qualificationRequirements?: string;
  
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  isSalaryNegotiable: boolean;
  showSalary: boolean;
  
  city: string;
  state: string;
  country: string;
  address?: string;
  isRemote: boolean;
  
  benefits: string[];
  accommodationProvided: boolean;
  foodProvided: boolean;
  
  expiresAt?: Date;
}

export interface JobSearchParams {
  keyword?: string;
  designation?: IslamicDesignation;
  city?: string;
  state?: string;
  country?: string;
  minSalary?: number;
  maxSalary?: number;
  jobType?: JobType;
  isRemote?: boolean;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDescending: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
