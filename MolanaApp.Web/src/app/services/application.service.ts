import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApplication, PagedResult, ApplicationStatus } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  applyForJob(jobId: string, coverLetter?: string, expectedSalary?: number): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.apiUrl, {
      jobId,
      coverLetter,
      expectedSalary
    });
  }

  getApplication(id: string): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`);
  }

  getMyApplications(page: number = 1, pageSize: number = 20): Observable<PagedResult<JobApplication>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PagedResult<JobApplication>>(`${this.apiUrl}/my-applications`, { params });
  }

  getJobApplications(jobId: string, page: number = 1, pageSize: number = 20): Observable<PagedResult<JobApplication>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PagedResult<JobApplication>>(`${this.apiUrl}/job/${jobId}`, { params });
  }

  updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus, 
    employerNotes?: string,
    rating?: number
  ): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.apiUrl}/${applicationId}/status`, {
      status,
      employerNotes,
      rating
    });
  }

  withdrawApplication(applicationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${applicationId}/withdraw`, {});
  }

  hasApplied(jobId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${jobId}`);
  }

  getApplicationStatus(jobId: string): Observable<ApplicationStatusResponse> {
    return this.http.get<ApplicationStatusResponse>(`${this.apiUrl}/status/${jobId}`);
  }
}

export interface ApplicationStatusResponse {
  hasApplied: boolean;
  status?: number;
  statusName?: string;
  appliedAt?: string;
}
