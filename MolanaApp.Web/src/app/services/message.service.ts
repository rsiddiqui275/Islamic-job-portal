import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Conversation } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  sendMessage(receiverId: string, content: string, jobId?: string): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, {
      receiverId,
      content,
      jobId
    });
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getConversation(otherUserId: string, page: number = 1, pageSize: number = 50): Observable<Message[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<Message[]>(`${this.apiUrl}/conversation/${otherUserId}`, { params });
  }

  markAsRead(messageId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${messageId}/read`, {});
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }
}
