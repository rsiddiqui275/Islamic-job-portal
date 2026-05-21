import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalEmployers: number;
  totalCandidates: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
}

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

interface CommissionSettings {
  placementCommission: number;
  featuredListingFee: number;
  urgentHiringFee: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <header class="admin-header">
        <h1>🔐 Admin Dashboard</h1>
        <p>Manage subscriptions, ads, and commissions</p>
      </header>

      <!-- Stats Cards -->
      <section class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">👥</span>
          <div class="stat-info">
            <h3>{{ stats().totalUsers }}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💼</span>
          <div class="stat-info">
            <h3>{{ stats().totalJobs }}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📝</span>
          <div class="stat-info">
            <h3>{{ stats().totalApplications }}</h3>
            <p>Applications</p>
          </div>
        </div>
        <div class="stat-card highlight">
          <span class="stat-icon">💰</span>
          <div class="stat-info">
            <h3>₹{{ stats().monthlyRevenue | number }}</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <div class="tabs">
        <button [class.active]="activeTab === 'subscriptions'" (click)="activeTab = 'subscriptions'">
          📋 Subscription Plans
        </button>
        <button [class.active]="activeTab === 'ads'" (click)="activeTab = 'ads'">
          📢 Advertisements
        </button>
        <button [class.active]="activeTab === 'commission'" (click)="activeTab = 'commission'">
          💵 Commission Settings
        </button>
      </div>

      <!-- Subscription Plans Tab -->
      @if (activeTab === 'subscriptions') {
        <section class="tab-content">
          <div class="section-header">
            <h2>Subscription Plans</h2>
            <button class="btn-primary" (click)="showAddPlan = true">+ Add Plan</button>
          </div>

          @if (showAddPlan) {
            <div class="form-card">
              <h3>{{ editingPlan ? 'Edit Plan' : 'Add New Plan' }}</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Plan Name</label>
                  <input [(ngModel)]="newPlan.name" placeholder="e.g., Employer Pro">
                </div>
                <div class="form-group">
                  <label>Price (₹/month)</label>
                  <input type="number" [(ngModel)]="newPlan.price" placeholder="999">
                </div>
                <div class="form-group">
                  <label>Duration</label>
                  <select [(ngModel)]="newPlan.duration">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Features (one per line)</label>
                  <textarea [(ngModel)]="planFeatures" rows="4" placeholder="Unlimited job posts&#10;Featured listings&#10;Analytics dashboard"></textarea>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-secondary" (click)="cancelPlanEdit()">Cancel</button>
                <button class="btn-primary" (click)="savePlan()">Save Plan</button>
              </div>
            </div>
          }

          <div class="plans-grid">
            @for (plan of subscriptionPlans(); track plan.id) {
              <div class="plan-card" [class.inactive]="!plan.isActive">
                <div class="plan-header">
                  <h3>{{ plan.name }}</h3>
                  <span class="plan-price">₹{{ plan.price }}/{{ plan.duration }}</span>
                </div>
                <ul class="plan-features">
                  @for (feature of plan.features; track feature) {
                    <li>✓ {{ feature }}</li>
                  }
                </ul>
                <div class="plan-actions">
                  <button (click)="editPlan(plan)">Edit</button>
                  <button (click)="togglePlanStatus(plan)">
                    {{ plan.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Advertisements Tab -->
      @if (activeTab === 'ads') {
        <section class="tab-content">
          <div class="section-header">
            <h2>Banner Advertisements</h2>
            <button class="btn-primary" (click)="showAddAd = true">+ Add Advertisement</button>
          </div>

          @if (showAddAd) {
            <div class="form-card">
              <h3>{{ editingAd ? 'Edit Advertisement' : 'Add New Advertisement' }}</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Title</label>
                  <input [(ngModel)]="newAd.title" placeholder="Ad title">
                </div>
                <div class="form-group">
                  <label>Placement</label>
                  <select [(ngModel)]="newAd.placement">
                    <option value="header">Header Banner</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="job-list">Job List Page</option>
                    <option value="footer">Footer</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Image URL</label>
                  <input [(ngModel)]="newAd.imageUrl" placeholder="https://...">
                </div>
                <div class="form-group">
                  <label>Target URL</label>
                  <input [(ngModel)]="newAd.targetUrl" placeholder="https://...">
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-secondary" (click)="cancelAdEdit()">Cancel</button>
                <button class="btn-primary" (click)="saveAd()">Save Advertisement</button>
              </div>
            </div>
          }

          <div class="ads-list">
            @for (ad of advertisements(); track ad.id) {
              <div class="ad-card" [class.inactive]="!ad.isActive">
                <div class="ad-preview">
                  @if (ad.imageUrl) {
                    <img [src]="ad.imageUrl" [alt]="ad.title">
                  } @else {
                    <div class="ad-placeholder">No Image</div>
                  }
                </div>
                <div class="ad-info">
                  <h4>{{ ad.title }}</h4>
                  <p class="ad-placement">📍 {{ ad.placement }}</p>
                  <div class="ad-stats">
                    <span>👁️ {{ ad.impressions | number }} views</span>
                    <span>👆 {{ ad.clicks | number }} clicks</span>
                    <span>📊 {{ ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0 }}% CTR</span>
                  </div>
                </div>
                <div class="ad-actions">
                  <button (click)="editAd(ad)">Edit</button>
                  <button (click)="toggleAdStatus(ad)">
                    {{ ad.isActive ? 'Pause' : 'Resume' }}
                  </button>
                  <button class="btn-danger" (click)="deleteAd(ad)">Delete</button>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Commission Settings Tab -->
      @if (activeTab === 'commission') {
        <section class="tab-content">
          <div class="section-header">
            <h2>Commission & Fee Settings</h2>
          </div>

          <div class="form-card">
            <div class="form-grid">
              <div class="form-group">
                <label>Placement Commission (%)</label>
                <p class="form-hint">Charged on successful job placements (first month salary)</p>
                <input type="number" [(ngModel)]="commission.placementCommission" min="0" max="100">
              </div>
              <div class="form-group">
                <label>Featured Listing Fee (₹)</label>
                <p class="form-hint">One-time fee for featured job listings</p>
                <input type="number" [(ngModel)]="commission.featuredListingFee" min="0">
              </div>
              <div class="form-group">
                <label>Urgent Hiring Fee (₹)</label>
                <p class="form-hint">Fee for urgent/priority job listings</p>
                <input type="number" [(ngModel)]="commission.urgentHiringFee" min="0">
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-primary" (click)="saveCommissionSettings()">Save Settings</button>
            </div>
          </div>

          <div class="commission-info">
            <h3>💡 Revenue Model Summary</h3>
            <ul>
              <li><strong>Placement Commission:</strong> {{ commission.placementCommission }}% of first month salary for successful placements</li>
              <li><strong>Featured Listing:</strong> ₹{{ commission.featuredListingFee | number }} per job</li>
              <li><strong>Urgent Hiring:</strong> ₹{{ commission.urgentHiringFee | number }} per job</li>
            </ul>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .admin-header {
      margin-bottom: 30px;
    }

    .admin-header h1 {
      color: #1a5f7a;
      font-size: 2rem;
      margin-bottom: 5px;
    }

    .admin-header p {
      color: #666;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .stat-card.highlight {
      background: linear-gradient(135deg, #1a5f7a, #2d8e5f);
      color: white;
    }

    .stat-card.highlight .stat-info p {
      color: rgba(255,255,255,0.8);
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-info h3 {
      font-size: 1.8rem;
      margin-bottom: 2px;
    }

    .stat-info p {
      color: #666;
      font-size: 0.9rem;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }

    .tabs button {
      padding: 12px 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 1rem;
      color: #666;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .tabs button:hover {
      background: #f0f7f9;
    }

    .tabs button.active {
      background: #1a5f7a;
      color: white;
    }

    .tab-content {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      color: #1a5f7a;
    }

    .btn-primary {
      background: #1a5f7a;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .form-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .form-card h3 {
      margin-bottom: 15px;
      color: #333;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }

    .form-hint {
      font-size: 0.8rem;
      color: #888;
      margin-bottom: 8px;
    }

    .form-group input, .form-group select, .form-group textarea {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 15px;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .plan-card {
      border: 2px solid #eee;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s;
    }

    .plan-card:hover {
      border-color: #1a5f7a;
    }

    .plan-card.inactive {
      opacity: 0.6;
      background: #f8f8f8;
    }

    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .plan-header h3 {
      color: #1a5f7a;
    }

    .plan-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2d8e5f;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin-bottom: 15px;
    }

    .plan-features li {
      padding: 5px 0;
      color: #555;
    }

    .plan-actions {
      display: flex;
      gap: 10px;
    }

    .plan-actions button {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .ads-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .ad-card {
      display: flex;
      gap: 20px;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 8px;
      align-items: center;
    }

    .ad-card.inactive {
      opacity: 0.6;
      background: #f8f8f8;
    }

    .ad-preview {
      width: 120px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      background: #eee;
    }

    .ad-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ad-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 0.8rem;
    }

    .ad-info {
      flex: 1;
    }

    .ad-info h4 {
      margin-bottom: 5px;
      color: #333;
    }

    .ad-placement {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .ad-stats {
      display: flex;
      gap: 15px;
      font-size: 0.85rem;
      color: #888;
    }

    .ad-actions {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .ad-actions button {
      padding: 6px 12px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .commission-info {
      margin-top: 20px;
      background: #f0f7f9;
      border-radius: 8px;
      padding: 20px;
    }

    .commission-info h3 {
      color: #1a5f7a;
      margin-bottom: 15px;
    }

    .commission-info ul {
      list-style: none;
      padding: 0;
    }

    .commission-info li {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .commission-info li:last-child {
      border-bottom: none;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .admin-container {
        padding: 15px 10px;
      }

      .admin-header h1 {
        font-size: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .stat-card {
        padding: 15px;
        flex-direction: column;
        text-align: center;
      }

      .stat-icon {
        font-size: 2rem;
      }

      .stat-info h3 {
        font-size: 1.3rem;
      }

      .tabs {
        flex-wrap: wrap;
      }

      .tabs button {
        flex: 1;
        min-width: 100px;
        padding: 10px 15px;
        font-size: 0.85rem;
      }

      .tab-content {
        padding: 15px;
      }

      .section-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .plans-grid {
        grid-template-columns: 1fr;
      }

      .ad-card {
        flex-direction: column;
        text-align: center;
      }

      .ad-preview {
        width: 100%;
        height: 120px;
      }

      .ad-stats {
        justify-content: center;
        flex-wrap: wrap;
      }

      .ad-actions {
        flex-direction: row;
        width: 100%;
      }

      .ad-actions button {
        flex: 1;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'subscriptions';
  showAddPlan = false;
  showAddAd = false;
  editingPlan: SubscriptionPlan | null = null;
  editingAd: Advertisement | null = null;
  planFeatures = '';

  stats = signal<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalEmployers: 0,
    totalCandidates: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0
  });

  subscriptionPlans = signal<SubscriptionPlan[]>([
    {
      id: '1',
      name: 'Employer Basic',
      price: 999,
      duration: 'monthly',
      features: ['5 job posts/month', 'Basic analytics', 'Email support'],
      isActive: true
    },
    {
      id: '2',
      name: 'Employer Pro',
      price: 2499,
      duration: 'monthly',
      features: ['Unlimited job posts', 'Featured listings', 'Advanced analytics', 'Priority support', 'WhatsApp integration'],
      isActive: true
    },
    {
      id: '3',
      name: 'Madrasa/Mosque',
      price: 499,
      duration: 'monthly',
      features: ['3 job posts/month', 'Basic analytics', 'Special discounts'],
      isActive: true
    }
  ]);

  advertisements = signal<Advertisement[]>([
    {
      id: '1',
      title: 'Islamic Book Store Ad',
      imageUrl: '',
      targetUrl: 'https://example.com',
      placement: 'sidebar',
      isActive: true,
      impressions: 5420,
      clicks: 234
    }
  ]);

  newPlan: Partial<SubscriptionPlan> = {
    name: '',
    price: 0,
    duration: 'monthly',
    features: [],
    isActive: true
  };

  newAd: Partial<Advertisement> = {
    title: '',
    imageUrl: '',
    targetUrl: '',
    placement: 'header',
    isActive: true
  };

  commission: CommissionSettings = {
    placementCommission: 5,
    featuredListingFee: 499,
    urgentHiringFee: 999
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // In production, fetch from API
    this.stats.set({
      totalUsers: 156,
      totalJobs: 48,
      totalApplications: 234,
      totalEmployers: 32,
      totalCandidates: 124,
      activeSubscriptions: 18,
      monthlyRevenue: 45980
    });
  }

  savePlan(): void {
    if (!this.newPlan.name || !this.newPlan.price) return;

    const features = this.planFeatures.split('\n').filter(f => f.trim());
    const plan: SubscriptionPlan = {
      id: this.editingPlan?.id || Date.now().toString(),
      name: this.newPlan.name!,
      price: this.newPlan.price!,
      duration: this.newPlan.duration || 'monthly',
      features,
      isActive: true
    };

    if (this.editingPlan) {
      const plans = this.subscriptionPlans().map(p => p.id === plan.id ? plan : p);
      this.subscriptionPlans.set(plans);
    } else {
      this.subscriptionPlans.update(plans => [...plans, plan]);
    }

    this.cancelPlanEdit();
    alert('Plan saved successfully!');
  }

  editPlan(plan: SubscriptionPlan): void {
    this.editingPlan = plan;
    this.newPlan = { ...plan };
    this.planFeatures = plan.features.join('\n');
    this.showAddPlan = true;
  }

  cancelPlanEdit(): void {
    this.showAddPlan = false;
    this.editingPlan = null;
    this.newPlan = { name: '', price: 0, duration: 'monthly', features: [], isActive: true };
    this.planFeatures = '';
  }

  togglePlanStatus(plan: SubscriptionPlan): void {
    const plans = this.subscriptionPlans().map(p => 
      p.id === plan.id ? { ...p, isActive: !p.isActive } : p
    );
    this.subscriptionPlans.set(plans);
  }

  saveAd(): void {
    if (!this.newAd.title) return;

    const ad: Advertisement = {
      id: this.editingAd?.id || Date.now().toString(),
      title: this.newAd.title!,
      imageUrl: this.newAd.imageUrl || '',
      targetUrl: this.newAd.targetUrl || '',
      placement: this.newAd.placement || 'header',
      isActive: true,
      impressions: this.editingAd?.impressions || 0,
      clicks: this.editingAd?.clicks || 0
    };

    if (this.editingAd) {
      const ads = this.advertisements().map(a => a.id === ad.id ? ad : a);
      this.advertisements.set(ads);
    } else {
      this.advertisements.update(ads => [...ads, ad]);
    }

    this.cancelAdEdit();
    alert('Advertisement saved successfully!');
  }

  editAd(ad: Advertisement): void {
    this.editingAd = ad;
    this.newAd = { ...ad };
    this.showAddAd = true;
  }

  cancelAdEdit(): void {
    this.showAddAd = false;
    this.editingAd = null;
    this.newAd = { title: '', imageUrl: '', targetUrl: '', placement: 'header', isActive: true };
  }

  toggleAdStatus(ad: Advertisement): void {
    const ads = this.advertisements().map(a => 
      a.id === ad.id ? { ...a, isActive: !a.isActive } : a
    );
    this.advertisements.set(ads);
  }

  deleteAd(ad: Advertisement): void {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      const ads = this.advertisements().filter(a => a.id !== ad.id);
      this.advertisements.set(ads);
    }
  }

  saveCommissionSettings(): void {
    // In production, save to API
    alert('Commission settings saved successfully!');
  }
}
