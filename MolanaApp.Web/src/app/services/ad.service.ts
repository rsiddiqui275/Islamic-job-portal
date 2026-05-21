import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: 'header' | 'sidebar' | 'job-list' | 'footer' | 'popup';
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdService {
  // ⚠️ DEMO ADS - Remove for production
  private ads = signal<Advertisement[]>([
    {
      id: '1',
      title: 'Islamic Books & Quran',
      imageUrl: 'https://placehold.co/728x90/1a5f7a/ffffff?text=📚+Islamic+Books+%26+Quran+Store+|+Shop+Now+🛒',
      targetUrl: '#',
      placement: 'header',
      isActive: true
    },
    {
      id: '2',
      title: 'Halal Career Training',
      imageUrl: 'https://placehold.co/300x250/2d8e5f/ffffff?text=🎓+Halal+Career%0ATraining+Center%0A%0AGet+Certified+Today!',
      targetUrl: '#',
      placement: 'sidebar',
      isActive: true
    },
    {
      id: '3',
      title: 'Top Madrasas Hiring',
      imageUrl: 'https://placehold.co/728x90/e8b923/1a5f7a?text=🕌+Top+Madrasas+Are+Hiring!+|+Apply+Now+➡️',
      targetUrl: '#',
      placement: 'job-list',
      isActive: true
    },
    {
      id: '4',
      title: 'Islamic Finance Course',
      imageUrl: 'https://placehold.co/728x50/134b5f/ffffff?text=💰+Learn+Islamic+Finance+|+Free+Course+Available',
      targetUrl: '#',
      placement: 'footer',
      isActive: true
    },
    {
      id: '5',
      title: 'Umrah Packages',
      imageUrl: 'https://placehold.co/728x90/8B4513/ffffff?text=🕋+Special+Umrah+Packages+|+Book+Now+✈️',
      targetUrl: '#',
      placement: 'job-list',
      isActive: true
    }
  ]);

  constructor(private http: HttpClient) {}

  getAdsByPlacement(placement: string): Advertisement[] {
    return this.ads().filter(ad => ad.placement === placement && ad.isActive);
  }

  getAllActiveAds(): Advertisement[] {
    return this.ads().filter(ad => ad.isActive);
  }

  trackImpression(adId: string): void {
    // In production, send to API
    console.log(`Ad impression tracked: ${adId}`);
  }

  trackClick(adId: string): void {
    // In production, send to API
    console.log(`Ad click tracked: ${adId}`);
  }
}
