import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>🕌 Islamic Jobs</h1>
          <h2>Register / رجسٹر</h2>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="role-selector">
            <button 
              type="button" 
              [class.active]="role === UserRole.Candidate"
              (click)="role = UserRole.Candidate"
            >
              <span class="icon">👤</span>
              <span>Candidate / امیدوار</span>
            </button>
            <button 
              type="button" 
              [class.active]="role === UserRole.Employer"
              (click)="role = UserRole.Employer"
            >
              <span class="icon">🏛️</span>
              <span>Employer / آجر</span>
            </button>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name / پہلا نام</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                [(ngModel)]="firstName"
                required
                placeholder="Ahmed"
              />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name / آخری نام</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                [(ngModel)]="lastName"
                required
                placeholder="Khan"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email / ای میل</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              placeholder="your@email.com"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone / فون</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              [(ngModel)]="phone"
              required
              placeholder="+92 300 1234567"
            />
          </div>

          <div class="form-group">
            <label for="password">Password / پاس ورڈ</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              placeholder="••••••••"
            />
          </div>

          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          <button type="submit" [disabled]="loading() || registerForm.invalid" class="btn-submit">
            @if (loading()) {
              <span>Loading...</span>
            } @else {
              <span>Register / رجسٹر</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Login / لاگ ان</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a5f7a 0%, #2d8e5f 100%);
      padding: 20px;
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .auth-header h1 {
      color: #1a5f7a;
      margin-bottom: 10px;
    }

    .auth-header h2 {
      color: #666;
      font-weight: 400;
    }

    .role-selector {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
    }

    .role-selector button {
      flex: 1;
      padding: 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .role-selector button.active {
      border-color: #1a5f7a;
      background: #f0f7f9;
    }

    .role-selector button .icon {
      font-size: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 15px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #1a5f7a;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }

    .btn-submit {
      width: 100%;
      padding: 15px;
      background: #1a5f7a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #145368;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }

    .auth-footer a {
      color: #1a5f7a;
      font-weight: 600;
      text-decoration: none;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .register-container {
        padding: 15px;
        align-items: flex-start;
        padding-top: 20px;
      }

      .register-card {
        padding: 25px 20px;
        max-width: 100%;
        border-radius: 16px;
      }

      .auth-header h1 {
        font-size: 1.5rem;
      }

      .name-row {
        flex-direction: column;
        gap: 0;
      }

      .role-selector {
        flex-direction: column;
        gap: 10px;
      }

      .role-option {
        padding: 12px;
      }

      .form-group input {
        padding: 14px 12px;
        font-size: 16px; /* Prevents zoom on iOS */
      }

      .btn-submit {
        padding: 16px;
        font-size: 1rem;
      }
    }
  `]
})
export class RegisterComponent {
  UserRole = UserRole;
  
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  role = UserRole.Candidate;
  
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phone,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.loading.set(false);
        if (this.role === UserRole.Employer) {
          this.router.navigate(['/profile']);
        } else {
          this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Registration failed');
      }
    });
  }
}
