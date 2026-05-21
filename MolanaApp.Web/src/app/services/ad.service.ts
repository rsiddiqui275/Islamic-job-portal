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
  // Demo ads - in production, fetch from API
  private ads = signal<Advertisement[]>([
    {
      id: '1',
      title: 'Islamic Book Store',
      imageUrl: 'https://placehold.co/728x90/1a5f7a/white?text=Islamic+Books+%7C+Shop+Now',
      targetUrl: 'https://example.com/books',
      placement: 'header',
      isActive: true
    },
    {
      id: '2',
      title: 'Halal Jobs Training',
      imageUrl: 'https://placehold.co/300x250/2d8e5f/white?text=Get+Certified%0AHalal+Training',
      targetUrl: 'https://example.com/training',
      placement: 'sidebar',
      isActive: true
    },
    {
      id: '3',
      title: 'Madrasa Hiring',
      imageUrl: 'https://placehold.co/728x90/e8b923/1a5f7a?text=Top+Madrasas+Are+Hiring+%7C+Apply+Now',
      targetUrl: 'https://example.com/madrasa',
      placement: 'job-list',
      isActive: true
    },
    {
      id: '4',
      title: 'Islamic Finance Course',
      imageUrl: 'https://placehold.co/320x50/1a5f7a/white?text=Learn+Islamic+Finance',
      targetUrl: 'https://example.com/finance',
      placement: 'footer',
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
