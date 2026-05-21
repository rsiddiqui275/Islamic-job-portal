import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdService, Advertisement } from '../../services/ad.service';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (ads.length > 0) {
      <div class="ad-container" [class]="'ad-' + placement">
        @for (ad of ads; track ad.id) {
          <a 
            [href]="ad.targetUrl" 
            target="_blank" 
            rel="noopener sponsored"
            class="ad-link"
            (click)="onAdClick(ad)"
          >
            <img [src]="ad.imageUrl" [alt]="ad.title" class="ad-image" loading="lazy">
            <span class="ad-label">Ad</span>
          </a>
        }
      </div>
    }
  `,
  styles: [`
    .ad-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 15px 0;
      position: relative;
    }

    .ad-link {
      position: relative;
      display: block;
      text-decoration: none;
      transition: transform 0.2s;
    }

    .ad-link:hover {
      transform: scale(1.02);
    }

    .ad-image {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
    }

    .ad-label {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(0,0,0,0.6);
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
    }

    /* Header banner - full width */
    .ad-header {
      background: linear-gradient(135deg, #f0f7f9 0%, #e8f4e8 100%);
    }

    .ad-header .ad-image {
      max-height: 90px;
    }

    /* Sidebar ad */
    .ad-sidebar {
      flex-direction: column;
      max-width: 300px;
      margin: 0 auto 15px;
    }

    .ad-sidebar .ad-image {
      max-height: 250px;
    }

    /* Job list inline ad */
    .ad-job-list {
      background: linear-gradient(135deg, #fff9e6 0%, #fffaf0 100%);
      border: 1px dashed #e8b923;
    }

    .ad-job-list .ad-image {
      max-height: 90px;
    }

    /* Footer ad */
    .ad-footer {
      background: #1a5f7a;
      padding: 8px;
    }

    .ad-footer .ad-image {
      max-height: 50px;
    }

    .ad-footer .ad-label {
      background: rgba(255,255,255,0.3);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .ad-container {
        padding: 8px;
        margin: 10px 0;
      }

      .ad-header .ad-image,
      .ad-job-list .ad-image {
        max-height: 60px;
      }

      .ad-sidebar {
        max-width: 100%;
      }

      .ad-sidebar .ad-image {
        max-height: 150px;
        max-width: 250px;
      }

      .ad-footer .ad-image {
        max-height: 40px;
      }

      .ad-label {
        font-size: 8px;
        padding: 1px 4px;
      }
    }
  `]
})
export class AdBannerComponent implements OnInit {
  @Input() placement: 'header' | 'sidebar' | 'job-list' | 'footer' = 'header';
  ads: Advertisement[] = [];

  constructor(private adService: AdService) {}

  ngOnInit(): void {
    this.ads = this.adService.getAdsByPlacement(this.placement);
    // Track impressions
    this.ads.forEach(ad => this.adService.trackImpression(ad.id));
  }

  onAdClick(ad: Advertisement): void {
    this.adService.trackClick(ad.id);
  }
}
