import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>🕌 Islamic Jobs</h1>
          <h2>Login / لاگ ان</h2>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
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

          <button type="submit" [disabled]="loading() || loginForm.invalid" class="btn-submit">
            @if (loading()) {
              <span>Loading...</span>
            } @else {
              <span>Login / لاگ ان</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register / رجسٹر</a></p>
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
      max-width: 400px;
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
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.loading.set(false);
          if (this.authService.isEmployer()) {
            this.router.navigate(['/my-jobs']);
          } else {
            this.router.navigate(['/jobs']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'Login failed');
        }
      });
  }
}
