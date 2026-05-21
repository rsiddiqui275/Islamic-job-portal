import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly isCandidate = computed(() => {
    const role = this.currentUserSignal()?.role as any;
    return role === 1 || role === 'Candidate' || role === UserRole.Candidate;
  });
  readonly isEmployer = computed(() => {
    const role = this.currentUserSignal()?.role as any;
    return role === 2 || role === 'Employer' || role === UserRole.Employer;
  });
  readonly isAdmin = computed(() => {
    const role = this.currentUserSignal()?.role as any;
    return role === 3 || role === 'Admin' || role === UserRole.Admin;
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('molanaapp_token');
    const userJson = localStorage.getItem('molanaapp_user');
    
    if (token && userJson) {
      this.tokenSignal.set(token);
      this.currentUserSignal.set(JSON.parse(userJson));
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('molanaapp_token');
    localStorage.removeItem('molanaapp_user');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('molanaapp_token', response.token);
    localStorage.setItem('molanaapp_user', JSON.stringify(response.user));
    this.tokenSignal.set(response.token);
    this.currentUserSignal.set(response.user);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
