import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { CandidateProfile, EmployerProfile, DesignationLabels, IslamicDesignation, JobType, JobTypeLabels } from '../../models';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  template: `
    <div class="profile-container">
      <app-back-button></app-back-button>
      <h1>My Profile / میری پروفائل</h1>

      @if (loading()) {
        <div class="loading">Loading profile...</div>
      } @else if (authService.isCandidate() && candidateProfile()) {
        <!-- Candidate Profile Form -->
        <form (ngSubmit)="updateCandidateProfile()" class="profile-form">
          <section class="form-section">
            <h2>Basic Information / بنیادی معلومات</h2>
            
            <div class="form-row">
              <div class="form-group">
                <label>Primary Designation / اصل عہدہ</label>
                <select [(ngModel)]="candidateProfile()!.primaryDesignation" name="primaryDesignation">
                  @for (d of designations; track d.id) {
                    <option [ngValue]="d.id">{{ d.label }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Years of Experience / تجربہ</label>
                <input type="number" [(ngModel)]="candidateProfile()!.yearsOfExperience" name="yearsOfExperience" />
              </div>
            </div>

            <div class="form-group">
              <label>Madrasa Name / مدرسہ کا نام</label>
              <input type="text" [(ngModel)]="candidateProfile()!.madrasaName" name="madrasaName" />
            </div>

            <div class="form-group">
              <label>Biography / تعارف</label>
              <textarea [(ngModel)]="candidateProfile()!.biography" name="biography" rows="4"></textarea>
            </div>
          </section>

          <section class="form-section">
            <h2>Location / مقام</h2>
            <div class="form-row">
              <div class="form-group">
                <label>City / شہر</label>
                <input type="text" [(ngModel)]="candidateProfile()!.city" name="city" />
              </div>
              <div class="form-group">
                <label>State / صوبہ</label>
                <input type="text" [(ngModel)]="candidateProfile()!.state" name="state" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2>Salary Expectations / متوقع تنخواہ</h2>
            <div class="form-row">
              <div class="form-group">
                <label>Minimum (INR)</label>
                <input type="number" [(ngModel)]="candidateProfile()!.expectedSalaryMin" name="expectedSalaryMin" />
              </div>
              <div class="form-group">
                <label>Maximum (INR)</label>
                <input type="number" [(ngModel)]="candidateProfile()!.expectedSalaryMax" name="expectedSalaryMax" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2>Preferences / ترجیحات</h2>
            <div class="form-row">
              <div class="form-group">
                <label>Preferred Job Type</label>
                <select [(ngModel)]="candidateProfile()!.preferredJobType" name="preferredJobType">
                  @for (jt of jobTypes; track jt.id) {
                    <option [ngValue]="jt.id">{{ jt.label }}</option>
                  }
                </select>
              </div>
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" [(ngModel)]="candidateProfile()!.isAvailableForWork" name="isAvailableForWork" />
                  Available for Work
                </label>
                <label>
                  <input type="checkbox" [(ngModel)]="candidateProfile()!.willingToRelocate" name="willingToRelocate" />
                  Willing to Relocate
                </label>
              </div>
            </div>
          </section>

          @if (saveError()) {
            <div class="error-message">{{ saveError() }}</div>
          }
          @if (saveSuccess()) {
            <div class="success-message">{{ saveSuccess() }}</div>
          }

          <button type="submit" [disabled]="saving()" class="btn-save">
            {{ saving() ? 'Saving...' : 'Save Profile' }}
          </button>
        </form>
      } @else if (authService.isEmployer() && employerProfile()) {
        <!-- Employer Profile Form -->
        <form (ngSubmit)="updateEmployerProfile()" class="profile-form">
          <section class="form-section">
            <h2>Organization Information</h2>
            
            <div class="form-group">
              <label>Organization Name / تنظیم کا نام</label>
              <input type="text" [(ngModel)]="employerProfile()!.organizationName" name="organizationName" required />
            </div>

            <div class="form-group">
              <label>Organization Type</label>
              <select [(ngModel)]="employerProfile()!.organizationType" name="organizationType">
                <option value="Masjid">Masjid / مسجد</option>
                <option value="Madrasa">Madrasa / مدرسہ</option>
                <option value="Islamic Center">Islamic Center</option>
                <option value="Darul Ifta">Darul Ifta / دار الافتاء</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="employerProfile()!.description" name="description" rows="4"></textarea>
            </div>

            <div class="form-group">
              <label>Website</label>
              <input type="url" [(ngModel)]="employerProfile()!.website" name="website" />
            </div>
          </section>

          <section class="form-section">
            <h2>Location / مقام</h2>
            <div class="form-row">
              <div class="form-group">
                <label>City / شہر</label>
                <input type="text" [(ngModel)]="employerProfile()!.city" name="city" />
              </div>
              <div class="form-group">
                <label>State / صوبہ</label>
                <input type="text" [(ngModel)]="employerProfile()!.state" name="state" />
              </div>
            </div>
            <div class="form-group">
              <label>Full Address</label>
              <input type="text" [(ngModel)]="employerProfile()!.address" name="address" />
            </div>
          </section>

          <section class="form-section">
            <h2>Contact Information</h2>
            <div class="form-row">
              <div class="form-group">
                <label>Contact Person Name</label>
                <input type="text" [(ngModel)]="employerProfile()!.contactPersonName" name="contactPersonName" />
              </div>
              <div class="form-group">
                <label>Contact Email</label>
                <input type="email" [(ngModel)]="employerProfile()!.contactEmail" name="contactEmail" />
              </div>
              <div class="form-group">
                <label>Contact Phone</label>
                <input type="tel" [(ngModel)]="employerProfile()!.contactPhone" name="contactPhone" />
              </div>
            </div>
          </section>

          @if (saveError()) {
            <div class="error-message">{{ saveError() }}</div>
          }
          @if (saveSuccess()) {
            <div class="success-message">{{ saveSuccess() }}</div>
          }

          <button type="submit" [disabled]="saving()" class="btn-save">
            {{ saving() ? 'Saving...' : 'Save Profile' }}
          </button>
        </form>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    h1 {
      color: #1a5f7a;
      margin-bottom: 30px;
    }

    .profile-form {
      background: white;
      border-radius: 16px;
      padding: 30px;
    }

    .form-section {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px solid #eee;
    }

    .form-section:last-of-type {
      border-bottom: none;
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

    .success-message {
      background: #e8f5e9;
      color: #2d8e5f;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .btn-save {
      width: 100%;
      padding: 15px;
      background: #1a5f7a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-save:disabled {
      opacity: 0.6;
    }

    .loading {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 16px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  candidateProfile = signal<CandidateProfile | null>(null);
  employerProfile = signal<EmployerProfile | null>(null);
  loading = signal(true);
  saving = signal(false);
  saveError = signal<string | null>(null);
  saveSuccess = signal<string | null>(null);

  designations = Object.keys(DesignationLabels)
    .filter(k => !isNaN(Number(k)))
    .map(k => ({ id: Number(k), label: DesignationLabels[Number(k)] }));

  jobTypes = Object.keys(JobTypeLabels)
    .filter(k => !isNaN(Number(k)))
    .map(k => ({ id: Number(k), label: JobTypeLabels[Number(k)] }));

  constructor(
    public authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    if (this.authService.isCandidate()) {
      this.loadCandidateProfile();
    } else if (this.authService.isEmployer()) {
      this.loadEmployerProfile();
    }
  }

  loadCandidateProfile(): void {
    this.profileService.getCandidateProfile().subscribe({
      next: (profile) => {
        this.candidateProfile.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadEmployerProfile(): void {
    this.profileService.getEmployerProfile().subscribe({
      next: (profile) => {
        this.employerProfile.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  updateCandidateProfile(): void {
    const profile = this.candidateProfile();
    if (!profile) return;

    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(null);

    this.profileService.updateCandidateProfile(profile).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set('Profile updated successfully!');
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(err.message || 'Failed to update profile');
      }
    });
  }

  updateEmployerProfile(): void {
    const profile = this.employerProfile();
    if (!profile) return;

    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(null);

    this.profileService.updateEmployerProfile(profile).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set('Profile updated successfully!');
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(err.message || 'Failed to update profile');
      }
    });
  }
}
