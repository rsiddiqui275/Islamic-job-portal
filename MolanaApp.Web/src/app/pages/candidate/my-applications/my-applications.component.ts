import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { JobApplication, ApplicationStatusLabels } from '../../../models';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent],
  template: `
    <div class="my-applications-container">
      <app-back-button></app-back-button>
      <header class="page-header">
        <h1>My Applications / میری درخواستیں</h1>
      </header>

      @if (loading()) {
        <div class="loading">Loading...</div>
      } @else if (applications().length === 0) {
        <div class="empty-state">
          <span class="icon">📨</span>
          <h2>No applications yet</h2>
          <p>Start applying for jobs</p>
          <a routerLink="/jobs" class="btn-browse">Browse Jobs</a>
        </div>
      } @else {
        <div class="applications-list">
          @for (app of applications(); track app.id) {
            <div class="application-card">
              <div class="app-header">
                <div>
                  <h3>{{ app.job?.title }}</h3>
                  <p class="org-name">{{ app.job?.organizationName }}</p>
                  <p class="location">📍 {{ app.job?.city }}</p>
                </div>
                <span [class]="'status status-' + app.status">
                  {{ getStatusLabel(app.status) }}
                </span>
              </div>
              
              <div class="app-details">
                <span>Applied: {{ app.appliedAt | date:'mediumDate' }}</span>
                @if (app.reviewedAt) {
                  <span>Reviewed: {{ app.reviewedAt | date:'mediumDate' }}</span>
                }
              </div>

              <div class="actions">
                <a [routerLink]="['/jobs', app.jobId]" class="btn-view">View Job</a>
                @if (app.status === 1) {
                  <button (click)="withdraw(app.id)" class="btn-withdraw">Withdraw / واپس لیں</button>
                }
                @if (app.status === 7) {
                  <button (click)="applyAgain(app.jobId)" class="btn-apply-again">Apply Again / دوبارہ درخواست دیں</button>
                }
                @if (app.status === 5) {
                  <span class="accepted-badge">✓ Accepted / منظور</span>
                }
                @if (app.status === 6) {
                  <span class="rejected-badge">✗ Rejected / رد</span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .my-applications-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .page-header h1 {
      color: #1a5f7a;
      margin-bottom: 30px;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 16px;
    }

    .empty-state .icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 20px;
    }

    .btn-browse {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: #1a5f7a;
      color: white;
      border-radius: 8px;
      text-decoration: none;
    }

    .application-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }

    .app-header h3 {
      color: #1a5f7a;
      margin-bottom: 5px;
    }

    .org-name {
      color: #666;
      margin-bottom: 3px;
    }

    .location {
      color: #888;
      font-size: 0.9rem;
    }

    .status {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      height: fit-content;
    }

    .status-1 { background: #fff3cd; color: #856404; }
    .status-2 { background: #cce5ff; color: #004085; }
    .status-3 { background: #d4edda; color: #155724; }
    .status-4 { background: #d1ecf1; color: #0c5460; }
    .status-5 { background: #d4edda; color: #155724; }
    .status-6 { background: #f8d7da; color: #721c24; }
    .status-7 { background: #e2e3e5; color: #383d41; }

    .app-details {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      color: #888;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .btn-view {
      padding: 8px 20px;
      background: #f0f7f9;
      color: #1a5f7a;
      border-radius: 6px;
      text-decoration: none;
    }

    .btn-withdraw {
      padding: 8px 20px;
      background: #fee;
      color: #c00;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-apply-again {
      padding: 8px 20px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-apply-again:hover {
      background: #218838;
    }

    .accepted-badge {
      color: #28a745;
      font-weight: 600;
      padding: 8px 16px;
    }

    .rejected-badge {
      color: #dc3545;
      font-weight: 600;
      padding: 8px 16px;
    }
  `]
})
export class MyApplicationsComponent implements OnInit {
  applications = signal<JobApplication[]>([]);
  loading = signal(true);

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.applicationService.getMyApplications().subscribe({
      next: (result) => {
        this.applications.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  withdraw(id: string): void {
    if (confirm('Are you sure you want to withdraw this application?')) {
      this.applicationService.withdrawApplication(id).subscribe({
        next: () => {
          this.applications.update(apps => 
            apps.map(a => a.id === id ? { ...a, status: 7 } : a)
          );
        }
      });
    }
  }

  applyAgain(jobId: string): void {
    this.applicationService.applyForJob(jobId).subscribe({
      next: () => {
        // Reload applications to show updated status
        this.loadApplications();
      },
      error: (err) => {
        alert(err.message || 'Failed to apply again');
      }
    });
  }

  getStatusLabel(status: number): string {
    return ApplicationStatusLabels[status] || 'Unknown';
  }
}
