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
            <div class="ad-content">
              <img [src]="ad.imageUrl" [alt]="ad.title" class="ad-image" loading="lazy">
            </div>
            <span class="ad-label">Sponsored</span>
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
      padding: 12px 15px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      margin: 15px 10px;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .ad-link {
      position: relative;
      display: block;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
      width: 100%;
      max-width: 728px;
    }

    .ad-link:hover {
      transform: scale(1.01);
    }

    .ad-content {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .ad-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
      display: block;
      object-fit: contain;
    }

    .ad-label {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.7);
      color: white;
      font-size: 9px;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    /* Header banner */
    .ad-header {
      background: linear-gradient(135deg, #e8f4f8 0%, #d4e9d4 100%);
      border: 1px solid #c8e0c8;
    }

    .ad-header .ad-image {
      max-height: 90px;
    }

    /* Sidebar ad */
    .ad-sidebar {
      flex-direction: column;
      max-width: 320px;
      margin: 15px auto;
      padding: 15px;
    }

    .ad-sidebar .ad-link {
      max-width: 300px;
    }

    .ad-sidebar .ad-image {
      max-height: 250px;
    }

    /* Job list inline ad */
    .ad-job-list {
      background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
      border: 2px dashed #e8b923;
      margin: 20px 0;
    }

    .ad-job-list .ad-image {
      max-height: 90px;
    }

    /* Footer ad */
    .ad-footer {
      background: linear-gradient(135deg, #1a5f7a 0%, #134b5f 100%);
      padding: 10px 15px;
      margin: 0;
      border-radius: 0;
    }

    .ad-footer .ad-image {
      max-height: 50px;
    }

    .ad-footer .ad-label {
      background: rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.9);
    }

    /* ========== MOBILE RESPONSIVE ========== */
    @media (max-width: 768px) {
      .ad-container {
        padding: 10px;
        margin: 10px 5px;
        border-radius: 8px;
      }

      .ad-link {
        max-width: 100%;
      }

      .ad-header {
        padding: 8px;
      }

      .ad-header .ad-image {
        max-height: 70px;
      }

      .ad-sidebar {
        max-width: 100%;
        padding: 10px;
      }

      .ad-sidebar .ad-link {
        max-width: 100%;
      }

      .ad-sidebar .ad-image {
        max-height: 180px;
        max-width: 280px;
        margin: 0 auto;
      }

      .ad-job-list {
        margin: 15px 0;
        padding: 10px;
      }

      .ad-job-list .ad-image {
        max-height: 60px;
      }

      .ad-footer {
        padding: 8px 10px;
      }

      .ad-footer .ad-image {
        max-height: 40px;
      }

      .ad-label {
        font-size: 8px;
        padding: 2px 6px;
        top: 5px;
        right: 5px;
      }
    }

    /* Extra small phones */
    @media (max-width: 400px) {
      .ad-container {
        padding: 8px;
        margin: 8px 3px;
      }

      .ad-header .ad-image {
        max-height: 55px;
      }

      .ad-sidebar .ad-image {
        max-height: 150px;
        max-width: 240px;
      }

      .ad-job-list .ad-image {
        max-height: 50px;
      }

      .ad-footer .ad-image {
        max-height: 35px;
      }

      .ad-label {
        font-size: 7px;
        padding: 2px 4px;
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
