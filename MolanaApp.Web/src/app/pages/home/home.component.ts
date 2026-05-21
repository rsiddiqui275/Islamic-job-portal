import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DesignationLabels, IslamicDesignation } from '../../models';
import { AdBannerComponent } from '../../components/ad-banner/ad-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, AdBannerComponent],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>🕌 Islamic Jobs</h1>
          <h2>Islamic Job Portal</h2>
          <p class="tagline">مولانا، مفتی، مؤذن، امام اور دیگر اسلامی عہدوں کے لیے نوکریاں تلاش کریں</p>
          <p class="tagline-en">Find Jobs for Molana, Mufti, Muajjin, Imam & Islamic Designations</p>
          
          <div class="cta-buttons">
            <a routerLink="/jobs" class="btn btn-primary">Browse Jobs</a>
            @if (!authService.isAuthenticated()) {
              <a routerLink="/register" class="btn btn-secondary">Join Now</a>
            }
          </div>
        </div>
      </section>

      <!-- Header Ad Banner -->
      <app-ad-banner placement="header"></app-ad-banner>

      <!-- Designations Section -->
      <section class="designations">
        <h2>Featured Designations</h2>
        <div class="designation-grid">
          @for (designation of featuredDesignations; track designation.id) {
            <a [routerLink]="['/jobs']" [queryParams]="{designation: designation.id}" class="designation-card">
              <span class="icon">{{ designation.icon }}</span>
              <span class="name">{{ designation.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <h2>Why Choose Islamic Jobs?</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <span class="icon">📍</span>
            <h3>Location Based</h3>
            <p>Find jobs near your city or anywhere in the world</p>
          </div>
          <div class="feature-card">
            <span class="icon">💰</span>
            <h3>Salary Transparency</h3>
            <p>Clear salary information for every job posting</p>
          </div>
          <div class="feature-card">
            <span class="icon">✅</span>
            <h3>Verified Employers</h3>
            <p>All mosques and madrasas are verified</p>
          </div>
          <div class="feature-card">
            <span class="icon">💬</span>
            <h3>Direct Messaging</h3>
            <p>Communicate directly with employers</p>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats">
        <div class="stat">
          <span class="number">500+</span>
          <span class="label">Active Jobs</span>
        </div>
        <div class="stat">
          <span class="number">1000+</span>
          <span class="label">Registered Candidates</span>
        </div>
        <div class="stat">
          <span class="number">200+</span>
          <span class="label">Verified Organizations</span>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
    }

    .hero {
      background: linear-gradient(135deg, #1a5f7a 0%, #2d8e5f 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
    }

    .hero h1 {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .hero h2 {
      font-size: 1.5rem;
      font-weight: 300;
      margin-bottom: 20px;
    }

    .tagline {
      font-size: 1.3rem;
      margin-bottom: 10px;
      font-family: 'Noto Nastaliq Urdu', serif;
    }

    .tagline-en {
      font-size: 1rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .btn-primary {
      background: white;
      color: #1a5f7a;
    }

    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .designations, .features {
      padding: 60px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .designations h2, .features h2 {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 40px;
      color: #1a5f7a;
    }

    .designation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }

    .designation-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      text-decoration: none;
      color: #333;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .designation-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .designation-card .icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .designation-card .name {
      font-weight: 600;
      text-align: center;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .feature-card {
      padding: 30px;
      background: #f8f9fa;
      border-radius: 12px;
      text-align: center;
    }

    .feature-card .icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 15px;
    }

    .feature-card h3 {
      color: #1a5f7a;
      margin-bottom: 10px;
    }

    .stats {
      background: #1a5f7a;
      color: white;
      padding: 60px 20px;
      display: flex;
      justify-content: center;
      gap: 80px;
      flex-wrap: wrap;
    }

    .stat {
      text-align: center;
    }

    .stat .number {
      font-size: 3rem;
      font-weight: 700;
      display: block;
    }

    .stat .label {
      font-size: 1rem;
      opacity: 0.9;
    }
  `]
})
export class HomeComponent {
  featuredDesignations = [
    { id: IslamicDesignation.Molana, name: 'مولانا (Molana)', icon: '📿' },
    { id: IslamicDesignation.Mufti, name: 'مفتی (Mufti)', icon: '⚖️' },
    { id: IslamicDesignation.Imam, name: 'امام (Imam)', icon: '🕌' },
    { id: IslamicDesignation.Muajjin, name: 'مؤذن (Muajjin)', icon: '📣' },
    { id: IslamicDesignation.Qari, name: 'قاری (Qari)', icon: '📖' },
    { id: IslamicDesignation.Hafiz, name: 'حافظ (Hafiz)', icon: '🤲' }
  ];

  constructor(public authService: AuthService) {}
}
