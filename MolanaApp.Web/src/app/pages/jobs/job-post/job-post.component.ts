import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { CreateJobRequest, IslamicDesignation, JobType, DesignationLabels, JobTypeLabels } from '../../../models';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';

@Component({
  selector: 'app-job-post',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="job-post-container">
      <app-back-button></app-back-button>
      <h1>Post a Job / نوکری پوسٹ کریں</h1>

      <form (ngSubmit)="onSubmit()" #jobForm="ngForm" class="job-form">
        <section class="form-section">
          <h2>Job Details / نوکری کی تفصیلات</h2>
          
          <div class="form-group">
            <label>Job Title / عنوان *</label>
            <input 
              type="text" 
              [(ngModel)]="job.title" 
              name="title" 
              required 
              placeholder="e.g. Imam for Friday Prayers"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Required Designation / مطلوبہ عہدہ *</label>
              <select [(ngModel)]="job.requiredDesignation" name="requiredDesignation" required>
                @for (d of designations; track d.id) {
                  <option [ngValue]="d.id">{{ d.label }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Job Type / نوکری کی قسم *</label>
              <select [(ngModel)]="job.jobType" name="jobType" required>
                @for (jt of jobTypes; track jt.id) {
                  <option [ngValue]="jt.id">{{ jt.label }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Job Description / تفصیل *</label>
            <textarea 
              [(ngModel)]="job.description" 
              name="description" 
              required 
              rows="6"
              placeholder="Describe the role, responsibilities, and requirements..."
            ></textarea>
          </div>
        </section>

        <section class="form-section">
          <h2>Requirements / ضروریات</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label>Min Experience (Years)</label>
              <input type="number" [(ngModel)]="job.minExperienceYears" name="minExperienceYears" min="0" />
            </div>
            <div class="form-group">
              <label>Max Experience (Years)</label>
              <input type="number" [(ngModel)]="job.maxExperienceYears" name="maxExperienceYears" min="0" />
            </div>
          </div>

          <div class="form-group">
            <label>Required Languages (comma separated)</label>
            <input 
              type="text" 
              [(ngModel)]="languagesInput" 
              name="languages"
              placeholder="e.g. Urdu, Arabic, English"
            />
          </div>
        </section>

        <section class="form-section">
          <h2>Location / مقام</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label>City / شہر *</label>
              <input type="text" [(ngModel)]="job.city" name="city" required />
            </div>
            <div class="form-group">
              <label>State / صوبہ *</label>
              <input type="text" [(ngModel)]="job.state" name="state" required />
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="job.isRemote" name="isRemote" />
              Remote work available
            </label>
          </div>
        </section>

        <section class="form-section">
          <h2>Salary / تنخواہ</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label>Minimum Salary</label>
              <input type="number" [(ngModel)]="job.salaryMin" name="salaryMin" />
            </div>
            <div class="form-group">
              <label>Maximum Salary</label>
              <input type="number" [(ngModel)]="job.salaryMax" name="salaryMax" />
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="job.showSalary" name="showSalary" />
              Show salary to candidates
            </label>
            <label>
              <input type="checkbox" [(ngModel)]="job.isSalaryNegotiable" name="isSalaryNegotiable" />
              Salary is negotiable
            </label>
          </div>
        </section>

        <section class="form-section">
          <h2>Benefits / فوائد</h2>
          
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="job.accommodationProvided" name="accommodationProvided" />
              🏠 Accommodation Provided / رہائش فراہم
            </label>
            <label>
              <input type="checkbox" [(ngModel)]="job.foodProvided" name="foodProvided" />
              🍽️ Food Provided / کھانا فراہم
            </label>
          </div>
        </section>

        @if (error()) {
          <div class="error-message">{{ error() }}</div>
        }

        <button type="submit" [disabled]="loading() || jobForm.invalid" class="btn-submit">
          {{ loading() ? 'Posting...' : 'Post Job / نوکری پوسٹ کریں' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .job-post-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    h1 {
      color: #1a5f7a;
      margin-bottom: 30px;
    }

    .job-form {
      background: white;
      border-radius: 16px;
      padding: 30px;
    }

    .form-section {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px solid #eee;
    }

    .form-section h2 {
      color: #1a5f7a;
      font-size: 1.2rem;
      margin-bottom: 20px;
    }

    .form-row {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .form-row .form-group {
      flex: 1;
      min-width: 200px;
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

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-weight: normal;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .btn-submit {
      width: 100%;
      padding: 18px;
      background: #1a5f7a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-submit:disabled {
      opacity: 0.6;
    }
  `]
})
export class JobPostComponent {
  job: CreateJobRequest = {
    title: '',
    description: '',
    requiredDesignation: IslamicDesignation.Molana,
    preferredDesignations: [],
    jobType: JobType.FullTime,
    requiredSkills: [],
    requiredLanguages: ['Urdu', 'Arabic'],
    city: '',
    state: '',
    country: '',
    salaryCurrency: 'INR',
    isSalaryNegotiable: false,
    showSalary: true,
    isRemote: false,
    benefits: [],
    accommodationProvided: false,
    foodProvided: false
  };

  languagesInput = 'Urdu, Arabic';
  loading = signal(false);
  error = signal<string | null>(null);

  designations = Object.keys(DesignationLabels)
    .filter(k => !isNaN(Number(k)))
    .map(k => ({ id: Number(k), label: DesignationLabels[Number(k)] }));

  jobTypes = Object.keys(JobTypeLabels)
    .filter(k => !isNaN(Number(k)))
    .map(k => ({ id: Number(k), label: JobTypeLabels[Number(k)] }));

  constructor(
    private jobService: JobService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    // Parse languages
    this.job.requiredLanguages = this.languagesInput
      .split(',')
      .map(l => l.trim())
      .filter(l => l);

    this.jobService.createJob(this.job).subscribe({
      next: (createdJob) => {
        this.loading.set(false);
        this.router.navigate(['/jobs', createdJob.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to create job');
      }
    });
  }
}
