import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CandidateProfile, EmployerProfile, IslamicDesignation } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/profiles`;

  constructor(private http: HttpClient) {}

  // Candidate Profile
  getCandidateProfile(): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${this.apiUrl}/candidate`);
  }

  updateCandidateProfile(profile: Partial<CandidateProfile>): Observable<CandidateProfile> {
    return this.http.put<CandidateProfile>(`${this.apiUrl}/candidate`, profile);
  }

  getCandidateProfileById(id: string): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${this.apiUrl}/candidate/${id}`);
  }

  // Employer Profile
  getEmployerProfile(): Observable<EmployerProfile> {
    return this.http.get<EmployerProfile>(`${this.apiUrl}/employer`);
  }

  updateEmployerProfile(profile: Partial<EmployerProfile>): Observable<EmployerProfile> {
    return this.http.put<EmployerProfile>(`${this.apiUrl}/employer`, profile);
  }

  getEmployerProfileById(id: string): Observable<EmployerProfile> {
    return this.http.get<EmployerProfile>(`${this.apiUrl}/employer/${id}`);
  }

  // Search Candidates (for employers)
  searchCandidates(
    designation?: IslamicDesignation,
    city?: string,
    minExperience?: number,
    page: number = 1,
    pageSize: number = 20
  ): Observable<CandidateProfile[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (designation) {
      params = params.set('designation', designation.toString());
    }
    if (city) {
      params = params.set('city', city);
    }
    if (minExperience) {
      params = params.set('minExperience', minExperience.toString());
    }

    return this.http.get<CandidateProfile[]>(`${this.apiUrl}/candidates/search`, { params });
  }
}
