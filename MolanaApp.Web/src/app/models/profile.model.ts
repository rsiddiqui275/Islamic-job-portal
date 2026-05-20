import { IslamicDesignation, JobType, ApplicationStatus } from './enums.model';
import { JobStatus } from './enums.model';

export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  
  primaryDesignation: IslamicDesignation;
  primaryDesignationName: string;
  additionalDesignations: IslamicDesignation[];
  madrasaName?: string;
  yearsOfExperience?: number;
  biography?: string;
  
  city: string;
  state: string;
  country: string;
  
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  salaryCurrency?: string;
  
  languages: string[];
  skills: string[];
  
  isAvailableForWork: boolean;
  preferredJobType: JobType;
  willingToRelocate: boolean;
}

export interface EmployerProfile {
  id: string;
  userId: string;
  
  organizationName: string;
  organizationType: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  
  city: string;
  state: string;
  country: string;
  address?: string;
  
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  isVerified: boolean;
  totalJobs: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateProfileId: string;
  
  status: ApplicationStatus;
  statusName: string;
  coverLetter?: string;
  expectedSalary?: number;
  
  appliedAt: Date;
  reviewedAt?: Date;
  
  candidate?: CandidateSummary;
  job?: JobSummary;
}

export interface CandidateSummary {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  primaryDesignation: IslamicDesignation;
  primaryDesignationName: string;
  yearsOfExperience?: number;
  city: string;
}

export interface JobSummary {
  id: string;
  title: string;
  organizationName: string;
  city: string;
  status: JobStatus;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  jobId?: string;
  
  content: string;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
  
  sender: UserSummary;
  receiver: UserSummary;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export interface Conversation {
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}
