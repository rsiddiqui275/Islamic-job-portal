import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  
  readonly unreadCount = signal(0);
  readonly notifications = signal<Notification[]>([]);

  constructor(private http: HttpClient) {}

  loadNotifications(): void {
    this.http.get<Notification[]>(this.apiUrl).subscribe({
      next: (notifications) => this.notifications.set(notifications),
      error: () => this.notifications.set([])
    });
  }

  loadUnreadCount(): void {
    this.http.get<number>(`${this.apiUrl}/unread-count`).subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => this.unreadCount.set(0)
    });
  }

  markAsRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(notifications => 
          notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update(notifications => 
          notifications.map(n => ({ ...n, isRead: true }))
        );
        this.unreadCount.set(0);
      })
    );
  }

  parseData(data: string | undefined): any {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
