import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { Job, JobStatus } from '../../../models';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent],
  template: `
    <div class="my-jobs-container">
      <app-back-button></app-back-button>
      <header class="page-header">
        <h1>My Job Postings / میری نوکریاں</h1>
        <a routerLink="/post-job" class="btn-post">+ Post New Job</a>
      </header>

      @if (loading()) {
        <div class="loading">Loading...</div>
      } @else if (jobs().length === 0) {
        <div class="empty-state">
          <span class="icon">📋</span>
          <h2>No jobs posted yet</h2>
          <p>Start by posting your first job</p>
          <a routerLink="/post-job" class="btn-post">Post a Job</a>
        </div>
      } @else {
        <div class="jobs-grid">
          @for (job of jobs(); track job.id) {
            <div class="job-card">
              <div class="job-header">
                <h3>{{ job.title }}</h3>
                <span [class]="'status status-' + getStatusClass(job.status)">
                  {{ getStatusLabel(job.status) }}
                </span>
              </div>
              <p class="designation">{{ job.requiredDesignationName }}</p>
              <p class="location">📍 {{ job.city }}, {{ job.country }}</p>
              
              <div class="stats">
                <span>👁️ {{ job.viewCount }} views</span>
                <span>📨 {{ job.applicationCount }} applications</span>
              </div>

              <div class="actions">
                <a [routerLink]="['/jobs', job.id]" class="btn-view">View</a>
                <button (click)="deleteJob(job.id)" class="btn-delete">Delete</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .my-jobs-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .page-header h1 {
      color: #1a5f7a;
    }

    .btn-post {
      background: #1a5f7a;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
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

    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .job-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .job-header h3 {
      color: #1a5f7a;
    }

    .status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
    }

    .status-active {
      background: #e8f5e9;
      color: #2d8e5f;
    }

    .status-closed {
      background: #fee;
      color: #c00;
    }

    .status-draft {
      background: #f0f0f0;
      color: #666;
    }

    .designation {
      color: #666;
      margin-bottom: 5px;
    }

    .location {
      color: #888;
      margin-bottom: 15px;
    }

    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      color: #666;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .btn-view {
      flex: 1;
      padding: 10px;
      background: #f0f7f9;
      color: #1a5f7a;
      text-align: center;
      border-radius: 6px;
      text-decoration: none;
    }

    .btn-delete {
      padding: 10px 20px;
      background: #fee;
      color: #c00;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class MyJobsComponent implements OnInit {
  jobs = signal<Job[]>([]);
  loading = signal(true);

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getMyJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  deleteJob(id: string): void {
    if (confirm('Are you sure you want to delete this job?')) {
      this.jobService.deleteJob(id).subscribe({
        next: () => {
          this.jobs.update(jobs => jobs.filter(j => j.id !== id));
        }
      });
    }
  }

  getStatusLabel(status: JobStatus): string {
    const labels: { [key: number]: string } = {
      1: 'Draft',
      2: 'Active',
      3: 'Closed',
      4: 'Expired'
    };
    return labels[status] || 'Unknown';
  }

  getStatusClass(status: JobStatus): string {
    const classes: { [key: number]: string } = {
      1: 'draft',
      2: 'active',
      3: 'closed',
      4: 'closed'
    };
    return classes[status] || 'draft';
  }
}
