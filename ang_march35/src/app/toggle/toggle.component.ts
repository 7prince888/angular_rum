import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RumService } from '../services/rum.service';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rum-toggle-wrapper">
      <label class="rum-toggle-label" (click)="onToggle()">
        <span class="rum-toggle-text">
          <span class="rum-toggle-title">Splunk RUM</span>
          <span class="rum-toggle-status" [class.active]="rumService.enabled">
            {{ rumService.enabled ? 'Active' : 'Inactive' }}
          </span>
        </span>

        <span class="rum-toggle-track" [class.enabled]="rumService.enabled">
          <span class="rum-toggle-thumb"></span>
        </span>
      </label>

      <span class="rum-toggle-badge" [class.on]="rumService.enabled">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="4"
            [attr.fill]="rumService.enabled ? '#22c55e' : '#6b7280'" />
        </svg>
        {{ rumService.enabled ? 'Monitoring ON' : 'Monitoring OFF' }}
      </span>
    </div>
  `,
  styles: [`
    .rum-toggle-wrapper {
      display: inline-flex;
      flex-direction: column;
      gap: 6px;
    }

    .rum-toggle-label {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      user-select: none;
      padding: 10px 14px;
      border-radius: 12px;
      background: #1e1e2e;
      border: 1px solid #2e2e4e;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .rum-toggle-label:hover {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .rum-toggle-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .rum-toggle-title {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #e2e8f0;
      text-transform: uppercase;
    }

    .rum-toggle-status {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: #6b7280;
      transition: color 0.3s ease;
    }

    .rum-toggle-status.active {
      color: #22c55e;
    }

    /* Track */
    .rum-toggle-track {
      position: relative;
      width: 44px;
      height: 24px;
      border-radius: 999px;
      background: #374151;
      border: 2px solid #4b5563;
      transition: background 0.3s ease, border-color 0.3s ease;
      flex-shrink: 0;
    }

    .rum-toggle-track.enabled {
      background: #4f46e5;
      border-color: #6366f1;
    }

    /* Thumb */
    .rum-toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #9ca3af;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                  background 0.3s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }

    .rum-toggle-track.enabled .rum-toggle-thumb {
      transform: translateX(20px);
      background: #ffffff;
    }

    /* Badge */
    .rum-toggle-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      letter-spacing: 0.04em;
      color: #6b7280;
      padding: 3px 8px 3px 6px;
      border-radius: 999px;
      background: #111827;
      border: 1px solid #1f2937;
      transition: color 0.3s ease, border-color 0.3s ease;
      width: fit-content;
    }

    .rum-toggle-badge.on {
      color: #22c55e;
      border-color: rgba(34, 197, 94, 0.3);
    }
  `]
})
export class ToggleComponent {
  constructor(public rumService: RumService) {}

  onToggle(): void {
    this.rumService.toggle();
  }
}