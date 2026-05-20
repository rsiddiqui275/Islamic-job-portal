import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="back-btn" (click)="goBack()">
      <span class="arrow">←</span>
      <span class="text">Back / واپس</span>
    </button>
  `,
  styles: [`
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: 1px solid #1a5f7a;
      color: #1a5f7a;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.2s;
      margin-bottom: 20px;
    }

    .back-btn:hover {
      background: #1a5f7a;
      color: white;
    }

    .arrow {
      font-size: 1.2rem;
    }
  `]
})
export class BackButtonComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
