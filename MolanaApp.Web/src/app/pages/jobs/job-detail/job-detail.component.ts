import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { ApplicationService, ApplicationStatusResponse } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { Job, JobTypeLabels } from '../../../models';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BackButtonComponent],
  template: `
    <div class="job-detail-container">
      <app-back-button></app-back-button>
      @if (loading()) {
        <div class="loading">Loading job details...</div>
      } @else if (job()) {
        <div class="job-content">
          <!-- Header -->
          <header class="job-header">
            <div class="employer-info">
              @if (job()!.employer.logoUrl) {
                <img [src]="job()!.employer.logoUrl" [alt]="job()!.employer.organizationName" class="logo" />
              } @else {
                <div class="logo-placeholder">🕌</div>
              }
              <div>
                <h1>{{ job()!.title }}</h1>
                <p class="employer-name">
                  {{ job()!.employer.organizationName }}
                  @if (job()!.employer.isVerified) {
                    <span class="verified">✓ Verified</span>
                  }
                </p>
              </div>
            </div>
            <span class="designation-badge">{{ job()!.requiredDesignationName }}</span>
          </header>

          <!-- Quick Info -->
          <div class="quick-info">
            <div class="info-item">
              <span class="icon">📍</span>
              <span>{{ job()!.city }}, {{ job()!.state }}</span>
            </div>
            @if (job()!.showSalary && job()!.salaryMin) {
              <div class="info-item">
                <span class="icon">💰</span>
                <span>INR {{ job()!.salaryMin | number }} - {{ job()!.salaryMax | number }}</span>
              </div>
            }
            <div class="info-item">
              <span class="icon">💼</span>
              <span>{{ getJobTypeLabel(job()!.jobType) }}</span>
            </div>
            @if (job()!.isRemote) {
              <div class="info-item">
                <span class="icon">🌐</span>
                <span>Remote Available</span>
              </div>
            }
          </div>

          <!-- Description -->
          <section class="section">
            <h2>Job Description / نوکری کی تفصیل</h2>
            <div class="description">{{ job()!.description }}</div>
          </section>

          <!-- Requirements -->
          <section class="section">
            <h2>Requirements / ضروریات</h2>
            <ul>
              @if (job()!.minExperienceYears) {
                <li>Experience: {{ job()!.minExperienceYears }} - {{ job()!.maxExperienceYears }} years</li>
              }
              @if (job()!.requiredLanguages.length > 0) {
                <li>Languages: {{ job()!.requiredLanguages.join(', ') }}</li>
              }
              @if (job()!.requiredSkills.length > 0) {
                <li>Skills: {{ job()!.requiredSkills.join(', ') }}</li>
              }
            </ul>
          </section>

          <!-- Benefits -->
          @if (job()!.benefits.length > 0 || job()!.accommodationProvided || job()!.foodProvided) {
            <section class="section">
              <h2>Benefits / فوائد</h2>
              <div class="benefits">
                @if (job()!.accommodationProvided) {
                  <span class="benefit">🏠 رہائش فراہم (Accommodation)</span>
                }
                @if (job()!.foodProvided) {
                  <span class="benefit">🍽️ کھانا فراہم (Food)</span>
                }
                @for (benefit of job()!.benefits; track benefit) {
                  <span class="benefit">✅ {{ benefit }}</span>
                }
              </div>
            </section>
          }

          <!-- Contact Information -->
          <section class="section contact-section">
            <h2>Contact Information / رابطہ</h2>
            <div class="contact-info">
              <div class="contact-item">
                <span class="icon">🏢</span>
                <span>{{ job()!.employer.organizationName }}</span>
              </div>
              @if (job()!.employer.contactPhone) {
                <div class="contact-item">
                  <span class="icon">📞</span>
                  <a [href]="'tel:' + job()!.employer.contactPhone">{{ job()!.employer.contactPhone }}</a>
                </div>
              }
              @if (job()!.employer.contactEmail) {
                <div class="contact-item">
                  <span class="icon">📧</span>
                  <a [href]="'mailto:' + job()!.employer.contactEmail">{{ job()!.employer.contactEmail }}</a>
                </div>
              }
              <div class="contact-item">
                <span class="icon">📍</span>
                <span>{{ job()!.city }}, {{ job()!.state }}</span>
              </div>
            </div>
          </section>

          <!-- Apply Section -->
          <section class="apply-section">
            @if (applySuccess()) {
              <div class="success-message">
                ✅ {{ applySuccess() }}
              </div>
            } @else if (!authService.isAuthenticated()) {
              <p class="login-prompt">
                <a routerLink="/login">Login</a> or <a routerLink="/register">Register</a> to apply for this job
              </p>
            } @else if (authService.isEmployer()) {
              <p class="info-text">You are logged in as an employer</p>
            } @else if (hasApplied()) {
              <div class="application-status-card">
                @if (applicationStatus()?.status === 1) {
                  <div class="status-badge status-pending">
                    ⏳ Pending / زیر غور
                  </div>
                  <p class="status-message">Your application is under review / آپ کی درخواست زیر غور ہے</p>
                } @else if (applicationStatus()?.status === 5) {
                  <div class="status-badge status-accepted">
                    ✓ Accepted / منظور
                  </div>
                  <p class="status-message">Congratulations! Your application has been accepted / مبارک ہو! آپ کی درخواست منظور ہو گئی</p>
                } @else if (applicationStatus()?.status === 6) {
                  <div class="status-badge status-rejected">
                    ✗ Rejected / رد
                  </div>
                  <p class="status-message">Unfortunately, your application was not selected / بدقسمتی سے، آپ کی درخواست منتخب نہیں ہوئی</p>
                } @else if (applicationStatus()?.status === 2) {
                  <div class="status-badge status-reviewed">
                    👁️ Reviewed / جائزہ لیا گیا
                  </div>
                  <p class="status-message">Your application has been reviewed / آپ کی درخواست کا جائزہ لیا گیا ہے</p>
                } @else if (applicationStatus()?.status === 3) {
                  <div class="status-badge status-shortlisted">
                    ⭐ Shortlisted / شارٹ لسٹ
                  </div>
                  <p class="status-message">You've been shortlisted! / آپ شارٹ لسٹ ہو گئے ہیں!</p>
                } @else if (applicationStatus()?.status === 4) {
                  <div class="status-badge status-interviewed">
                    🎤 Interviewed / انٹرویو ہوا
                  </div>
                  <p class="status-message">Your interview has been completed / آپ کا انٹرویو مکمل ہو گیا</p>
                } @else {
                  <div class="status-badge status-applied">
                    ✅ Applied / درخواست دی گئی
                  </div>
                  <p class="status-message">You have applied for this job / آپ نے اس نوکری کے لیے درخواست دی ہے</p>
                }
                @if (applicationStatus()?.appliedAt) {
                  <p class="applied-date">Applied on: {{ applicationStatus()!.appliedAt | date:'mediumDate' }}</p>
                }
              </div>
            } @else {
              <button (click)="showApplyForm.set(true)" class="btn-apply" *ngIf="!showApplyForm()">
                Apply Now / ابھی درخواست دیں
              </button>

              @if (showApplyForm()) {
                <div class="apply-form">
                  <h3>Apply for this Job</h3>
                  <div class="form-group">
                    <label>Cover Letter (Optional)</label>
                    <textarea 
                      [(ngModel)]="coverLetter" 
                      rows="4" 
                      placeholder="Tell the employer why you're a good fit..."
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label>Expected Salary (Optional)</label>
                    <input 
                      type="number" 
                      [(ngModel)]="expectedSalary" 
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div class="form-actions">
                    <button (click)="showApplyForm.set(false)" class="btn-cancel">Cancel</button>
                    <button (click)="apply()" [disabled]="applying()" class="btn-submit">
                      {{ applying() ? 'Submitting...' : 'Submit Application' }}
                    </button>
                  </div>
                </div>
              }
            }

            @if (applyError()) {
              <div class="error-message">{{ applyError() }}</div>
            }
          </section>
        </div>
      } @else {
        <div class="not-found">Job not found</div>
      }
    </div>
  `,
  styles: [`
    .job-detail-container {
      min-height: 100vh;
      background: #f5f5f5;
      padding: 20px;
    }

    .job-content {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-bottom: 25px;
      border-bottom: 1px solid #eee;
    }

    .employer-info {
      display: flex;
      gap: 20px;
    }

    .logo, .logo-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: cover;
    }

    .logo-placeholder {
      background: #f0f7f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
    }

    h1 {
      font-size: 1.5rem;
      color: #1a5f7a;
      margin-bottom: 8px;
    }

    .employer-name {
      color: #666;
    }

    .verified {
      color: #2d8e5f;
      font-weight: 600;
      margin-left: 10px;
    }

    .designation-badge {
      background: #f0f7f9;
      color: #1a5f7a;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
    }

    .quick-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-item .icon {
      font-size: 1.2rem;
    }

    .section {
      margin-bottom: 30px;
    }

    .section h2 {
      color: #1a5f7a;
      margin-bottom: 15px;
      font-size: 1.2rem;
    }

    .description {
      line-height: 1.8;
      white-space: pre-wrap;
    }

    ul {
      padding-left: 20px;
    }

    ul li {
      margin-bottom: 10px;
      line-height: 1.6;
    }

    .benefits {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .benefit {
      background: #e8f5e9;
      color: #2d8e5f;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .apply-section {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid #eee;
    }

    .btn-apply {
      width: 100%;
      padding: 18px;
      background: #1a5f7a;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-apply:hover {
      background: #145368;
    }

    .applied-badge {
      background: #e8f5e9;
      color: #2d8e5f;
      padding: 18px;
      border-radius: 12px;
      text-align: center;
      font-weight: 600;
    }

    .application-status-card {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 12px;
      text-align: center;
    }

    .status-badge {
      display: inline-block;
      padding: 10px 24px;
      border-radius: 25px;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .status-pending { background: #fff3cd; color: #856404; }
    .status-accepted { background: #d4edda; color: #155724; }
    .status-rejected { background: #f8d7da; color: #721c24; }
    .status-reviewed { background: #cce5ff; color: #004085; }
    .status-shortlisted { background: #d4edda; color: #155724; }
    .status-interviewed { background: #d1ecf1; color: #0c5460; }
    .status-applied { background: #e8f5e9; color: #2d8e5f; }

    .status-message {
      color: #666;
      margin: 10px 0;
    }

    .applied-date {
      color: #888;
      font-size: 0.9rem;
      margin-top: 10px;
    }

    .login-prompt, .info-text {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .login-prompt a {
      color: #1a5f7a;
      font-weight: 600;
    }

    .apply-form {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 12px;
    }

    .apply-form h3 {
      margin-bottom: 20px;
      color: #1a5f7a;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .form-group textarea,
    .form-group input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .btn-cancel {
      padding: 12px 25px;
      background: #f0f0f0;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .btn-submit {
      padding: 12px 25px;
      background: #1a5f7a;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .btn-submit:disabled {
      opacity: 0.6;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
      text-align: center;
    }

    .success-message {
      background: #e8f5e9;
      color: #2d8e5f;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
      text-align: center;
    }

    .loading, .not-found {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 60px;
      text-align: center;
    }

    .contact-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .contact-item .icon {
      font-size: 1.3rem;
    }

    .contact-item a {
      color: #1a5f7a;
      text-decoration: none;
      font-weight: 500;
    }

    .contact-item a:hover {
      text-decoration: underline;
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job = signal<Job | null>(null);
  loading = signal(true);
  hasApplied = signal(false);
  applicationStatus = signal<ApplicationStatusResponse | null>(null);
  showApplyForm = signal(false);
  applying = signal(false);
  applyError = signal<string | null>(null);
  applySuccess = signal<string | null>(null);

  coverLetter = '';
  expectedSalary: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadJob(id);
    }
  }

  loadJob(id: string): void {
    this.loading.set(true);
    this.jobService.getJob(id).subscribe({
      next: (job) => {
        this.job.set(job);
        this.loading.set(false);
        if (this.authService.isCandidate()) {
          this.checkIfApplied(id);
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  checkIfApplied(jobId: string): void {
    this.applicationService.getApplicationStatus(jobId).subscribe({
      next: (status) => {
        this.applicationStatus.set(status);
        this.hasApplied.set(status.hasApplied);
      }
    });
  }

  apply(): void {
    const job = this.job();
    if (!job) return;

    this.applying.set(true);
    this.applyError.set(null);
    this.applySuccess.set(null);

    this.applicationService.applyForJob(
      job.id, 
      this.coverLetter || undefined, 
      this.expectedSalary || undefined
    ).subscribe({
      next: () => {
        this.applying.set(false);
        this.hasApplied.set(true);
        this.showApplyForm.set(false);
        this.applySuccess.set('Application submitted successfully! The employer has been notified. / درخواست کامیابی سے جمع ہو گئی! آجر کو مطلع کر دیا گیا');
        // Refresh application status
        this.checkIfApplied(job.id);
      },
      error: (err) => {
        this.applying.set(false);
        this.applyError.set(err.message || 'Failed to submit application');
      }
    });
  }

  getJobTypeLabel(type: number): string {
    return JobTypeLabels[type] || 'Unknown';
  }
}
