import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <header class="main-header">
      <nav class="nav-container">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🕌</span>
          <span class="logo-text">Islamic Jobs</span>
        </a>

        <button class="mobile-menu-btn" (click)="toggleMenu()">
          {{ menuOpen ? '✕' : '☰' }}
        </button>

        <div class="nav-links" [class.open]="menuOpen">
          @if (!auth.isEmployer()) {
            <a routerLink="/jobs" routerLinkActive="active" (click)="closeMenu()">Jobs / نوکریاں</a>
          }
          
          @if (auth.isAuthenticated()) {
            @if (auth.isEmployer()) {
              <a routerLink="/my-jobs" routerLinkActive="active" (click)="closeMenu()">My Jobs</a>
              <a routerLink="/post-job" routerLinkActive="active" (click)="closeMenu()">Post Job</a>
              <a routerLink="/applications" routerLinkActive="active" (click)="closeMenu()">Applications</a>
            }
            @if (auth.isCandidate()) {
              <a routerLink="/my-applications" routerLinkActive="active" (click)="closeMenu()">My Applications</a>
            }
            <a routerLink="/profile" routerLinkActive="active" (click)="closeMenu()">Profile</a>
            <button (click)="logout()" class="btn-logout">Logout</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active" (click)="closeMenu()">Login</a>
            <a routerLink="/register" class="btn-register" (click)="closeMenu()">Register</a>
          }
        </div>
      </nav>
    </header>

    <main class="main-content">
      <router-outlet />
    </main>

    <footer class="main-footer">
      <div class="footer-content">
        <p>© 2024 Islamic Jobs</p>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-header {
      background: linear-gradient(135deg, #1a5f7a 0%, #134b5f 100%);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-links a {
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background: rgba(255,255,255,0.15);
      color: white;
    }

    .btn-register {
      background: #e8b923 !important;
      color: #1a5f7a !important;
      font-weight: 600 !important;
    }

    .btn-logout {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.5);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
    }

    .btn-logout:hover {
      background: rgba(255,255,255,0.1);
    }

    .mobile-menu-btn {
      display: none;
      background: transparent;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 8px;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .nav-container {
        padding: 12px 15px;
      }

      .logo-text {
        font-size: 1.2rem;
      }

      .logo-icon {
        font-size: 1.5rem;
      }

      .mobile-menu-btn {
        display: block;
      }

      .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1a5f7a;
        flex-direction: column;
        padding: 15px;
        gap: 5px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      }

      .nav-links.open {
        display: flex;
      }

      .nav-links a {
        padding: 12px 15px;
        border-radius: 8px;
        text-align: center;
      }

      .btn-logout {
        width: 100%;
        padding: 12px;
        margin-top: 10px;
      }
    }

    .main-content {
      flex: 1;
      background: #f5f7f9;
    }

    .main-footer {
      background: #1a5f7a;
      color: rgba(255,255,255,0.8);
      text-align: center;
      padding: 15px;
      font-size: 0.9rem;
    }

    .footer-content p {
      margin: 5px 0;
    }
  `]
})
export class App {
  menuOpen = false;

  constructor(public auth: AuthService) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }
}
