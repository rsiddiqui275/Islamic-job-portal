import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { Job, JobSearchParams, PagedResult, IslamicDesignation, JobType, DesignationLabels, JobTypeLabels } from '../../../models';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="job-list-container">
      <!-- Search Header -->
      <div class="search-header">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchParams.keyword"
            placeholder="Search jobs... / نوکری تلاش کریں"
            (keyup.enter)="search()"
          />
          <button (click)="search()" class="btn-search">🔍</button>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- Filters Sidebar -->
        <aside class="filters">
          <h3>Filters / فلٹر</h3>
          
          <div class="filter-group">
            <label>Designation / عہدہ</label>
            <select [(ngModel)]="searchParams.designation" (change)="search()">
              <option [ngValue]="undefined">All / سب</option>
              @for (d of designations; track d.id) {
                <option [ngValue]="d.id">{{ d.label }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label>Job Type / نوکری کی قسم</label>
            <select [(ngModel)]="searchParams.jobType" (change)="search()">
              <option [ngValue]="undefined">All / سب</option>
              @for (jt of jobTypes; track jt.id) {
                <option [ngValue]="jt.id">{{ jt.label }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label>City / شہر</label>
            <input 
              type="text" 
              [(ngModel)]="searchParams.city" 
              placeholder="e.g. Karachi"
              (keyup.enter)="search()"
            />
          </div>

          <div class="filter-group">
            <label>
              <input type="checkbox" [(ngModel)]="searchParams.isRemote" (change)="search()" />
              Remote Only / صرف آن لائن
            </label>
          </div>

          <button (click)="clearFilters()" class="btn-clear">Clear Filters</button>
        </aside>

        <!-- Job List -->
        <main class="job-list">
          @if (loading()) {
            <div class="loading">Loading jobs... / نوکریاں لوڈ ہو رہی ہیں</div>
          } @else if (jobs().length === 0) {
            <div class="no-results">
              <span class="icon">📋</span>
              <p>No jobs found / کوئی نوکری نہیں ملی</p>
            </div>
          } @else {
            <div class="results-header">
              <span>{{ result()?.totalCount }} jobs found</span>
            </div>

            @for (job of jobs(); track job.id) {
              <a [routerLink]="['/jobs', job.id]" class="job-card">
                <div class="job-header">
                  <div class="employer-info">
                    @if (job.employer.logoUrl) {
                      <img [src]="job.employer.logoUrl" [alt]="job.employer.organizationName" class="logo" />
                    } @else {
                      <div class="logo-placeholder">🕌</div>
                    }
                    <div>
                      <h3 class="job-title">{{ job.title }}</h3>
                      <p class="employer-name">
                        {{ job.employer.organizationName }}
                        @if (job.employer.isVerified) {
                          <span class="verified">✓</span>
                        }
                      </p>
                    </div>
                  </div>
                  <span class="designation-badge">{{ job.requiredDesignationName }}</span>
                </div>

                <p class="job-description">{{ job.description | slice:0:150 }}{{ job.description.length > 150 ? '...' : '' }}</p>

                <div class="job-details">
                  <span class="detail">📍 {{ job.city }}, {{ job.country }}</span>
                  @if (job.showSalary && job.salaryMin) {
                    <span class="detail">💰 INR {{ job.salaryMin | number }} - {{ job.salaryMax | number }}</span>
                  }
                  <span class="detail">💼 {{ getJobTypeLabel(job.jobType) }}</span>
                  @if (job.accommodationProvided) {
                    <span class="detail perk">🏠 Accommodation</span>
                  }
                  @if (job.foodProvided) {
                    <span class="detail perk">🍽️ Food</span>
                  }
                </div>

                <div class="job-footer">
                  <span class="posted">Posted {{ job.postedAt | date:'mediumDate' }}</span>
                  <span class="stats">👁️ {{ job.viewCount }} | 📨 {{ job.applicationCount }}</span>
                </div>
              </a>
            }

            <!-- Pagination -->
            @if (result() && result()!.totalPages > 1) {
              <div class="pagination">
                <button 
                  (click)="goToPage(searchParams.page - 1)" 
                  [disabled]="searchParams.page === 1"
                >Previous</button>
                <span>Page {{ searchParams.page }} of {{ result()?.totalPages }}</span>
                <button 
                  (click)="goToPage(searchParams.page + 1)" 
                  [disabled]="searchParams.page >= (result()?.totalPages || 1)"
                >Next</button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .job-list-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .search-header {
      background: linear-gradient(135deg, #1a5f7a 0%, #2d8e5f 100%);
      padding: 30px 20px;
    }

    .search-box {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      gap: 10px;
    }

    .search-box input {
      flex: 1;
      padding: 15px 20px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
    }

    .btn-search {
      padding: 15px 25px;
      background: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .content-wrapper {
      display: flex;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      gap: 20px;
    }

    .filters {
      width: 280px;
      background: white;
      border-radius: 12px;
      padding: 20px;
      height: fit-content;
      position: sticky;
      top: 20px;
    }

    .filters h3 {
      margin-bottom: 20px;
      color: #1a5f7a;
    }

    .filter-group {
      margin-bottom: 20px;
    }

    .filter-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .filter-group input[type="text"],
    .filter-group select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }

    .filter-group input[type="checkbox"] {
      margin-right: 8px;
    }

    .btn-clear {
      width: 100%;
      padding: 10px;
      background: #f0f0f0;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .job-list {
      flex: 1;
    }

    .loading, .no-results {
      background: white;
      border-radius: 12px;
      padding: 60px;
      text-align: center;
    }

    .no-results .icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 20px;
    }

    .results-header {
      margin-bottom: 15px;
      color: #666;
    }

    .job-card {
      display: block;
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 0.2s, transform 0.2s;
    }

    .job-card:hover {
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .employer-info {
      display: flex;
      gap: 15px;
    }

    .logo, .logo-placeholder {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      object-fit: cover;
    }

    .logo-placeholder {
      background: #f0f7f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .job-title {
      font-size: 1.1rem;
      margin-bottom: 4px;
      color: #1a5f7a;
    }

    .employer-name {
      color: #666;
      font-size: 0.9rem;
    }

    .verified {
      color: #2d8e5f;
      font-weight: bold;
    }

    .designation-badge {
      background: #f0f7f9;
      color: #1a5f7a;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .job-description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .job-details {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 15px;
    }

    .detail {
      font-size: 0.9rem;
      color: #555;
    }

    .perk {
      color: #2d8e5f;
      font-weight: 500;
    }

    .job-footer {
      display: flex;
      justify-content: space-between;
      color: #999;
      font-size: 0.85rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 30px;
    }

    .pagination button {
      padding: 10px 20px;
      background: #1a5f7a;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .pagination button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .content-wrapper {
        flex-direction: column;
      }

      .filters {
        width: 100%;
        position: static;
      }
    }
  `]
})
export class JobListComponent implements OnInit {
  jobs = signal<Job[]>([]);
  result = signal<PagedResult<Job> | null>(null);
  loading = signal(false);

  searchParams: JobSearchParams = {
    page: 1,
    pageSize: 10,
    sortBy: 'PostedAt',
    sortDescending: true
  };

  designations = Object.keys(DesignationLabels)
    .filter(k => !isNaN(Number(k)))
    .map(k => ({ id: Number(k), label: DesignationLabels[Number(k)] }));

  jobTypes = Object.keys(JobTypeLabels)
    .filter(k => !isNaN(Number(k)))
    .map(k => ({ id: Number(k), label: JobTypeLabels[Number(k)] }));

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['designation']) {
        this.searchParams.designation = Number(params['designation']);
      }
      this.search();
    });
  }

  search(): void {
    this.loading.set(true);
    this.jobService.searchJobs(this.searchParams).subscribe({
      next: (result) => {
        this.result.set(result);
        this.jobs.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.searchParams = {
      page: 1,
      pageSize: 10,
      sortBy: 'PostedAt',
      sortDescending: true
    };
    this.search();
  }

  goToPage(page: number): void {
    this.searchParams.page = page;
    this.search();
  }

  getJobTypeLabel(type: JobType): string {
    return JobTypeLabels[type] || 'Unknown';
  }
}
