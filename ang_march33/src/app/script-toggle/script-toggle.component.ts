import { Component, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-script-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="toggle-card" [class.active]="isEnabled">

      <div class="header">
        <div class="meta">
          <span class="label">External Script</span>
          <span class="script-src">{{ scriptSrc }}</span>
        </div>

        <div class="toggle-wrap">
          <label class="toggle" [attr.aria-label]="'Script is ' + (isEnabled ? 'enabled' : 'disabled')">
            <input type="checkbox" [(ngModel)]="isEnabled" (ngModelChange)="onToggle($event)" />
            <span class="slider"></span>
          </label>
          <span class="state-label" [class.on]="isEnabled">
            {{ isEnabled ? 'ON' : 'OFF' }}
          </span>
        </div>
      </div>

      <div class="status" [class.active]="isEnabled">
        <span class="dot"></span>
        <span>{{ isEnabled ? 'Script injected into &lt;head&gt;' : 'Script removed from &lt;head&gt;' }}</span>
      </div>

      <div class="log">
        <div *ngFor="let entry of logs" class="log-entry" [class]="entry.type">
          <span class="time">{{ entry.time }}</span>
          <span class="msg">{{ entry.msg }}</span>
        </div>
        <div *ngIf="logs.length === 0" class="empty">No activity yet.</div>
      </div>

    </div>
  `,
  styles: [`
    .toggle-card {
      background: #13151a;
      border: 1px solid #1f2229;
      border-radius: 14px;
      padding: 1.5rem;
      max-width: 420px;
      font-family: 'JetBrains Mono', monospace;
      transition: border-color .4s, box-shadow .4s;
    }
    .toggle-card.active {
      border-color: #00e5a0;
      box-shadow: 0 0 32px rgba(0,229,160,.15);
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .meta .label { display: block; font-size: .6rem; color: #6b7280; text-transform: uppercase; letter-spacing: .1em; margin-bottom: .25rem; }
    .meta .script-src { font-size: .75rem; color: #a5f3c4; word-break: break-all; }
    .toggle-wrap { display: flex; flex-direction: column; align-items: center; gap: .3rem; flex-shrink: 0; margin-left: 1rem; }
    .toggle { position: relative; width: 52px; height: 28px; cursor: pointer; }
    .toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .slider { position: absolute; inset: 0; background: #1a1d24; border: 1.5px solid #2a2d35; border-radius: 28px; transition: .3s; }
    .slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 4px; top: 50%; transform: translateY(-50%); background: #4b5063; border-radius: 50%; transition: transform .3s cubic-bezier(.34,1.56,.64,1), background .3s; }
    .toggle input:checked + .slider { background: rgba(0,229,160,.12); border-color: #00e5a0; box-shadow: 0 0 10px rgba(0,229,160,.3); }
    .toggle input:checked + .slider::before { transform: translateX(24px) translateY(-50%); background: #00e5a0; }
    .state-label { font-size: .6rem; font-weight: 700; letter-spacing: .1em; color: #6b7280; transition: color .3s; }
    .state-label.on { color: #00e5a0; }
    .status { display: flex; align-items: center; gap: .5rem; padding: .5rem .8rem; border-radius: 7px; font-size: .68rem; background: rgba(255,79,106,.07); border: 1px solid rgba(255,79,106,.2); color: #ff4f6a; margin-bottom: 1rem; transition: .4s; }
    .status.active { background: rgba(0,229,160,.07); border-color: rgba(0,229,160,.2); color: #00e5a0; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .status.active .dot { animation: pulse 1.8s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
    .log { font-size: .65rem; line-height: 1.9; max-height: 120px; overflow-y: auto; }
    .log-entry { display: flex; gap: .6rem; }
    .time { color: #3a3d4a; flex-shrink: 0; }
    .log-entry.success .msg { color: #00e5a0; }
    .log-entry.warn    .msg { color: #fbbf24; }
    .log-entry.info    .msg { color: #60a5fa; }
    .empty { color: #3a3d4a; }
  `]
})
export class ScriptToggleComponent implements OnDestroy {

  // ── Configure your script here ──────────────────────────────────────────
  scriptSrc = 'https://example.com/analytics.min.js';
  scriptId  = 'dynamic-analytics-script';
  // ────────────────────────────────────────────────────────────────────────

  isEnabled = false;
  logs: { time: string; msg: string; type: string }[] = [];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  onToggle(enabled: boolean): void {
    enabled ? this.injectScript() : this.removeScript();
  }

  private injectScript(): void {
    // Guard: don't inject twice
    if (this.document.getElementById(this.scriptId)) {
      this.addLog('Script already present in <head>.', 'warn');
      return;
    }

    const script = this.document.createElement('script');
    script.id    = this.scriptId;
    script.src   = this.scriptSrc;
    script.async = true;

    script.onload  = () => this.addLog('Script loaded successfully ✓', 'success');
    script.onerror = () => this.addLog('Script failed to load ✗', 'warn');

    this.document.head.appendChild(script);
    this.addLog(`Injecting script into <head>…`, 'info');
  }

  private removeScript(): void {
    const existing = this.document.getElementById(this.scriptId);
    if (existing) {
      existing.remove();
      this.addLog('Script removed from <head>.', 'warn');
    } else {
      this.addLog('No script found to remove.', 'info');
    }
  }

  private addLog(msg: string, type: string): void {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.logs.unshift({ time, msg, type });
    if (this.logs.length > 20) this.logs.pop(); // cap log length
  }

  ngOnDestroy(): void {
    // Clean up on component destruction
    this.removeScript();
  }
}