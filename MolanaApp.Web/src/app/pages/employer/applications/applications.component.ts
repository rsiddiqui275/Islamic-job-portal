import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';

interface CandidateSummary {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  primaryDesignation: number;
  primaryDesignationName?: string;
  yearsOfExperience?: number;
  city?: string;
}

interface JobSummary {
  id: string;
  title: string;
  organizationName: string;
  city: string;
}

interface Application {
  id: string;
  jobId: string;
  candidateProfileId: string;
  status: number;
  statusName: string;
  coverLetter?: string;
  expectedSalary?: number;
  appliedAt: Date;
  reviewedAt?: Date;
  candidate?: CandidateSummary;
  job?: JobSummary;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-employer-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent],
  template: `
    <div class="applications-container">
      <app-back-button></app-back-button>
      <header class="page-header">
        <h1>Job Applications / درخواستیں</h1>
        <p class="subtitle">Review candidates who applied to your jobs</p>
      </header>

      @if (loading()) {
        <div class="loading">
          <span>Loading applications...</span>
        </div>
      } @else if (applications().length === 0) {
        <div class="empty-state">
          <span class="icon">📭</span>
          <h2>No applications yet / ابھی تک کوئی درخواست نہیں</h2>
          <p>When candidates apply to your jobs, they will appear here</p>
          <a routerLink="/post-job" class="btn-primary">Post a New Job</a>
        </div>
      } @else {
        <div class="applications-list">
          @for (app of applications(); track app.id) {
            <div class="application-card">
              @if (app.candidate) {
                <div class="candidate-header">
                  <div class="avatar">
                    @if (app.candidate.profileImageUrl) {
                      <img [src]="app.candidate.profileImageUrl" [alt]="app.candidate.firstName" />
                    } @else {
                      <span class="initials">{{ getInitials(app.candidate) }}</span>
                    }
                  </div>
                  <div class="candidate-info">
                    <h3>{{ app.candidate.firstName }} {{ app.candidate.lastName }}</h3>
                    @if (app.candidate.primaryDesignationName) {
                      <p class="designation">{{ app.candidate.primaryDesignationName }}</p>
                    }
                    @if (app.candidate.city) {
                      <p class="location">📍 {{ app.candidate.city }}</p>
                    }
                  </div>
                  <span [class]="'status status-' + getStatusClass(app.status)">
                    {{ app.statusName || getStatusLabel(app.status) }}
                  </span>
                </div>
              }

              @if (app.job) {
                <div class="job-applied">
                  <label>Applied for:</label>
                  <a [routerLink]="['/jobs', app.jobId]" class="job-link">{{ app.job.title }}</a>
                  <span class="org-name">at {{ app.job.organizationName }}</span>
                </div>
              }

              <div class="candidate-details">
                @if (app.candidate?.yearsOfExperience) {
                  <div class="detail">
                    <label>Experience:</label>
                    <span>{{ app.candidate.yearsOfExperience }} years</span>
                  </div>
                }
                @if (app.expectedSalary) {
                  <div class="detail">
                    <label>Expected Salary:</label>
                    <span>₹{{ app.expectedSalary | number }}</span>
                  </div>
                }
              </div>

              @if (app.coverLetter) {
                <div class="cover-letter">
                  <label>Cover Letter / تعارفی خط:</label>
                  <p>{{ app.coverLetter }}</p>
                </div>
              }

              <div class="application-footer">
                <span class="applied-date">Applied: {{ app.appliedAt | date:'mediumDate' }}</span>
                <div class="actions">
                  @if (app.status === 1) {
                    <button (click)="updateStatus(app.id, 5)" class="btn-accept">
                      ✓ Accept / قبول کریں
                    </button>
                    <button (click)="updateStatus(app.id, 6)" class="btn-reject">
                      ✗ Reject / رد کریں
                    </button>
                  } @else if (app.status === 5) {
                    <span class="status-accepted">✓ Accepted</span>
                  } @else if (app.status === 6) {
                    <span class="status-rejected">✗ Rejected</span>
                  }
                  @if (app.candidate?.phoneNumber) {
                    <a [href]="getWhatsAppLink(app.candidate!.phoneNumber!, app.candidate!.firstName, app.job?.title)" target="_blank" class="btn-message">
                      📱 WhatsApp
                    </a>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .applications-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      color: #1a5f7a;
      margin-bottom: 5px;
    }

    .subtitle {
      color: #666;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .empty-state .icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 20px;
    }

    .empty-state h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 20px;
    }

    .btn-primary {
      display: inline-block;
      background: #1a5f7a;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }

    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .application-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .candidate-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #1a5f7a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .initials {
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .candidate-info {
      flex: 1;
    }

    .candidate-info h3 {
      color: #1a5f7a;
      margin-bottom: 4px;
    }

    .designation {
      color: #2d8e5f;
      font-weight: 500;
    }

    .location {
      color: #666;
      font-size: 0.9rem;
    }

    .status {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-shortlisted {
      background: #d4edda;
      color: #155724;
    }

    .status-interviewed {
      background: #cce5ff;
      color: #004085;
    }

    .status-rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .status-accepted {
      background: #d4edda;
      color: #155724;
    }

    .status-hired {
      background: #28a745;
      color: white;
    }

    .job-applied {
      background: #f8f9fa;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .job-applied label {
      color: #666;
      font-size: 0.85rem;
    }

    .job-link {
      color: #1a5f7a;
      font-weight: 600;
      text-decoration: none;
      margin-left: 8px;
    }

    .org-name {
      color: #666;
      font-size: 0.9rem;
      margin-left: 8px;
    }

    .candidate-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .detail {
      display: flex;
      flex-direction: column;
    }

    .detail label {
      color: #666;
      font-size: 0.8rem;
      margin-bottom: 4px;
    }

    .detail a {
      color: #1a5f7a;
      text-decoration: none;
    }

    .languages {
      margin-bottom: 16px;
    }

    .languages label {
      display: block;
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      background: #e8f4f8;
      color: #1a5f7a;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
    }

    .cover-letter {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .cover-letter label {
      display: block;
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }

    .cover-letter p {
      color: #333;
      line-height: 1.6;
    }

    .application-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .applied-date {
      color: #888;
      font-size: 0.85rem;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .actions button, .actions a {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      border: none;
      font-weight: 500;
    }

    .btn-accept {
      background: #28a745;
      color: white;
    }

    .btn-reject {
      background: #dc3545;
      color: white;
    }

    .btn-message {
      background: #1a5f7a;
      color: white;
    }

    .status-accepted {
      color: #28a745;
      font-weight: 600;
    }

    .status-rejected {
      color: #dc3545;
      font-weight: 600;
    }
  `]
})
export class EmployerApplicationsComponent implements OnInit {
  applications = signal<Application[]>([]);
  loading = signal(true);

  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading.set(true);
    // Get all applications for employer's jobs
    this.http.get<PagedResult<Application>>(`${this.apiUrl}/applications/employer`)
      .subscribe({
        next: (result) => {
          this.applications.set(result.items || []);
          this.loading.set(false);
        },
        error: () => {
          this.applications.set([]);
          this.loading.set(false);
        }
      });
  }

  getInitials(candidate: CandidateSummary | undefined): string {
    if (!candidate) return '?';
    return `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`.toUpperCase() || '?';
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'pending';
      case 2: return 'reviewed';
      case 3: return 'shortlisted';
      case 4: return 'interviewed';
      case 5: return 'accepted';
      case 6: return 'rejected';
      case 7: return 'withdrawn';
      default: return 'pending';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Pending / زیر التوا';
      case 2: return 'Reviewed / جائزہ';
      case 3: return 'Shortlisted / منتخب';
      case 4: return 'Interviewed / انٹرویو';
      case 5: return 'Accepted / منظور';
      case 6: return 'Rejected / رد';
      case 7: return 'Withdrawn / واپس';
      default: return 'Unknown';
    }
  }

  updateStatus(applicationId: string, status: number): void {
    this.http.put(`${this.apiUrl}/applications/${applicationId}/status`, { status })
      .subscribe({
        next: () => {
          this.applications.update(apps => 
            apps.map(app => app.id === applicationId ? { ...app, status, statusName: this.getStatusLabel(status) } : app)
          );
        },
        error: (err) => {
          console.error('Failed to update status', err);
        }
      });
  }

  getWhatsAppLink(phone: string, candidateName: string, jobTitle?: string): string {
    // Format phone number (remove spaces, add country code if needed)
    let formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone; // Default to India
    }
    formattedPhone = formattedPhone.replace('+', '');
    
    const message = jobTitle 
      ? `Assalamu Alaikum ${candidateName}, regarding your application for "${jobTitle}" position...`
      : `Assalamu Alaikum ${candidateName}, regarding your job application...`;
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }
}
