import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, CreateJobRequest, JobSearchParams, PagedResult } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  searchJobs(params: JobSearchParams): Observable<PagedResult<Job>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString())
      .set('sortBy', params.sortBy)
      .set('sortDescending', params.sortDescending.toString());

    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params.designation) {
      httpParams = httpParams.set('designation', params.designation.toString());
    }
    if (params.city) {
      httpParams = httpParams.set('city', params.city);
    }
    if (params.state) {
      httpParams = httpParams.set('state', params.state);
    }
    if (params.minSalary) {
      httpParams = httpParams.set('minSalary', params.minSalary.toString());
    }
    if (params.maxSalary) {
      httpParams = httpParams.set('maxSalary', params.maxSalary.toString());
    }
    if (params.jobType) {
      httpParams = httpParams.set('jobType', params.jobType.toString());
    }
    if (params.isRemote !== undefined) {
      httpParams = httpParams.set('isRemote', params.isRemote.toString());
    }

    return this.http.get<PagedResult<Job>>(this.apiUrl, { params: httpParams });
  }

  getJob(id: string): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  createJob(job: CreateJobRequest): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  updateJob(id: string, job: CreateJobRequest): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/my-jobs`);
  }
}
