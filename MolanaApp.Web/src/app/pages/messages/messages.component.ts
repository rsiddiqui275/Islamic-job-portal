import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  template: `
    <div class="messages-container">
      <app-back-button></app-back-button>
      <h1>Messages / پیغامات</h1>
      <div class="coming-soon">
        <span class="icon">💬</span>
        <h2>Messaging Feature Coming Soon</h2>
        <p>پیغام رسانی کی سہولت جلد آ رہی ہے</p>
      </div>
    </div>
  `,
  styles: [`
    .messages-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    h1 {
      color: #1a5f7a;
      margin-bottom: 30px;
    }

    .coming-soon {
      background: white;
      border-radius: 16px;
      padding: 60px;
      text-align: center;
    }

    .coming-soon .icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 20px;
    }

    .coming-soon h2 {
      color: #1a5f7a;
      margin-bottom: 10px;
    }

    .coming-soon p {
      color: #666;
    }
  `]
})
export class MessagesComponent {}
