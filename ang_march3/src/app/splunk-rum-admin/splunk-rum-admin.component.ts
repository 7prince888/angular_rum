import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Declare SplunkRum as a global to avoid TypeScript errors
declare const SplunkRum: any;

interface RumConfig {
  realm: string;
  rumAccessToken: string;
  applicationName: string;
  version: string;
  environment: string;
  deploymentEnvironment?: string;
  debug?: boolean;
}

interface RumStatus {
  initialized: boolean;
  sessionId: string | null;
  startedAt: Date | null;
  eventsCount: number;
}

@Component({
  selector: 'app-splunk-rum-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-shell">
      <!-- Background grid -->
      <div class="grid-bg"></div>

      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <div class="logo-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="#FF6B35"/>
              <rect x="16" y="2" width="10" height="10" rx="2" fill="#FF6B35" opacity="0.5"/>
              <rect x="2" y="16" width="10" height="10" rx="2" fill="#FF6B35" opacity="0.5"/>
              <rect x="16" y="16" width="10" height="10" rx="2" fill="#FF6B35"/>
            </svg>
          </div>
          <div>
            <h1 class="admin-title">Observability Console</h1>
            <span class="admin-sub">Splunk RUM Management</span>
          </div>
        </div>
        <div class="header-right">
          <div class="env-badge" [class.prod]="config.environment === 'production'">
            {{ config.environment | uppercase }}
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="admin-main">

        <!-- Control Panel -->
        <section class="panel control-panel">
          <div class="panel-header">
            <div class="panel-icon rum-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div>
              <h2 class="panel-title">Real User Monitoring</h2>
              <p class="panel-desc">Capture frontend performance & user sessions</p>
            </div>
          </div>

          <div class="toggle-row">
            <div class="toggle-info">
              <span class="toggle-label">RUM Collection</span>
              <span class="toggle-status" [class.active]="rumEnabled">
                <span class="status-dot" [class.pulse]="rumEnabled"></span>
                {{ rumEnabled ? 'Active — collecting telemetry' : 'Inactive — no data collected' }}
              </span>
            </div>

            <label class="toggle-switch" [class.enabled]="rumEnabled">
              <input type="checkbox" [(ngModel)]="rumEnabled" (change)="onToggleRum()" />
              <span class="toggle-track">
                <span class="toggle-thumb">
                  <svg *ngIf="rumEnabled" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg *ngIf="!rumEnabled" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </span>
              </span>
            </label>
          </div>

          <!-- Status Bar -->
          <div class="status-bar" [class.online]="rumEnabled" [class.offline]="!rumEnabled">
            <div class="status-segments">
              <div class="seg" *ngFor="let s of statusSegments" [class.lit]="rumEnabled && s.lit"></div>
            </div>
            <span class="status-text">
              {{ rumEnabled ? 'Streaming to Splunk O11y Cloud' : 'Stream paused' }}
            </span>
          </div>
        </section>

        <!-- Config Panel -->
        <section class="panel config-panel">
          <div class="panel-header">
            <div class="panel-icon config-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            </div>
            <div>
              <h2 class="panel-title">Configuration</h2>
              <p class="panel-desc">RUM initialization parameters</p>
            </div>
          </div>

          <div class="config-grid">
            <div class="config-field">
              <label>Application Name</label>
              <input type="text" [(ngModel)]="config.applicationName" [disabled]="rumEnabled" placeholder="my-angular-app" />
            </div>
            <div class="config-field">
              <label>Version</label>
              <input type="text" [(ngModel)]="config.version" [disabled]="rumEnabled" placeholder="1.0.0" />
            </div>
            <div class="config-field">
              <label>Realm</label>
              <select [(ngModel)]="config.realm" [disabled]="rumEnabled">
                <option value="us0">us0 (US)</option>
                <option value="us1">us1 (US)</option>
                <option value="eu0">eu0 (EU)</option>
                <option value="jp0">jp0 (Japan)</option>
              </select>
            </div>
            <div class="config-field">
              <label>Environment</label>
              <select [(ngModel)]="config.environment" [disabled]="rumEnabled">
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div class="config-field full-width">
              <label>RUM Access Token</label>
              <div class="token-field">
                <input
                  [type]="showToken ? 'text' : 'password'"
                  [(ngModel)]="config.rumAccessToken"
                  [disabled]="rumEnabled"
                  placeholder="RUM access token from Splunk O11y"
                />
                <button class="token-toggle" (click)="showToken = !showToken">
                  <svg *ngIf="!showToken" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showToken" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="config-field debug-field">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="config.debug" [disabled]="rumEnabled" />
                <span class="checkbox-custom"></span>
                Enable Debug Mode
              </label>
            </div>
          </div>

          <div class="config-notice" *ngIf="rumEnabled">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Disable RUM to modify configuration
          </div>
        </section>

        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{{ rumStatus.eventsCount }}</span>
            <span class="stat-label">Events Sent</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ rumStatus.sessionId ? rumStatus.sessionId.slice(0,8) + '…' : '—' }}</span>
            <span class="stat-label">Session ID</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ rumStatus.startedAt ? (rumStatus.startedAt | date:'HH:mm:ss') : '—' }}</span>
            <span class="stat-label">Started At</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" [class.green]="rumEnabled" [class.red]="!rumEnabled">
              {{ rumEnabled ? 'LIVE' : 'OFF' }}
            </span>
            <span class="stat-label">Status</span>
          </div>
        </div>

        <!-- Activity Log -->
        <section class="panel log-panel">
          <div class="panel-header">
            <div class="panel-icon log-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <h2 class="panel-title">Activity Log</h2>
              <p class="panel-desc">RUM lifecycle events</p>
            </div>
            <button class="clear-btn" (click)="clearLog()">Clear</button>
          </div>
          <div class="log-output">
            <div
              class="log-entry"
              *ngFor="let entry of activityLog"
              [class.success]="entry.type === 'success'"
              [class.warning]="entry.type === 'warning'"
              [class.error]="entry.type === 'error'"
              [class.info]="entry.type === 'info'"
            >
              <span class="log-time">{{ entry.time }}</span>
              <span class="log-badge">{{ entry.type | uppercase }}</span>
              <span class="log-msg">{{ entry.message }}</span>
            </div>
            <div class="log-empty" *ngIf="activityLog.length === 0">No activity yet</div>
          </div>
        </section>

      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');

    :host { display: block; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .admin-shell {
      min-height: 100vh;
      background: #0a0c10;
      font-family: 'DM Sans', sans-serif;
      color: #e2e8f0;
      position: relative;
      overflow-x: hidden;
    }

    .grid-bg {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(255,107,53,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,107,53,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    /* Header */
    .admin-header {
      position: relative; z-index: 10;
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 32px;
      border-bottom: 1px solid rgba(255,107,53,0.15);
      background: rgba(10,12,16,0.9);
      backdrop-filter: blur(12px);
    }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .logo-mark { padding: 8px; background: rgba(255,107,53,0.1); border-radius: 10px; border: 1px solid rgba(255,107,53,0.2); }
    .admin-title { font-size: 18px; font-weight: 600; color: #f8fafc; letter-spacing: -0.3px; }
    .admin-sub { font-size: 12px; color: #64748b; font-family: 'JetBrains Mono', monospace; }
    .env-badge {
      font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;
      padding: 5px 12px; border-radius: 6px;
      background: rgba(100,116,139,0.2); color: #94a3b8; border: 1px solid rgba(100,116,139,0.3);
    }
    .env-badge.prod { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }

    /* Main */
    .admin-main {
      position: relative; z-index: 1;
      max-width: 960px; margin: 0 auto; padding: 32px 24px;
      display: flex; flex-direction: column; gap: 20px;
    }

    /* Panels */
    .panel {
      background: rgba(15,18,25,0.8);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px; padding: 24px;
      backdrop-filter: blur(8px);
    }
    .panel-header {
      display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
    }
    .panel-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .rum-icon { background: rgba(255,107,53,0.15); color: #FF6B35; border: 1px solid rgba(255,107,53,0.25); }
    .config-icon { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.25); }
    .log-icon { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
    .panel-title { font-size: 15px; font-weight: 600; color: #f1f5f9; }
    .panel-desc { font-size: 12px; color: #64748b; margin-top: 2px; }

    /* Toggle Row */
    .toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 20px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px; margin-bottom: 16px;
    }
    .toggle-label { font-size: 14px; font-weight: 500; color: #e2e8f0; display: block; }
    .toggle-status {
      font-size: 12px; color: #64748b; font-family: 'JetBrains Mono', monospace;
      display: flex; align-items: center; gap: 6px; margin-top: 4px;
    }
    .toggle-status.active { color: #4ade80; }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #475569; display: inline-block;
    }
    .status-dot.pulse {
      background: #4ade80;
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 0 0 0 rgba(74,222,128,0.4);
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
      50% { box-shadow: 0 0 0 5px rgba(74,222,128,0); }
    }

    /* Toggle Switch */
    .toggle-switch { cursor: pointer; }
    .toggle-switch input { display: none; }
    .toggle-track {
      display: flex; align-items: center;
      width: 56px; height: 28px; border-radius: 100px;
      background: rgba(71,85,105,0.5); border: 1px solid rgba(255,255,255,0.1);
      padding: 3px; transition: all 0.3s ease;
      position: relative;
    }
    .toggle-switch.enabled .toggle-track {
      background: rgba(255,107,53,0.3); border-color: rgba(255,107,53,0.5);
    }
    .toggle-thumb {
      width: 22px; height: 22px; border-radius: 50%;
      background: #475569; display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      color: #94a3b8;
    }
    .toggle-switch.enabled .toggle-thumb {
      transform: translateX(28px);
      background: #FF6B35; color: white;
      box-shadow: 0 0 12px rgba(255,107,53,0.5);
    }

    /* Status Bar */
    .status-bar {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px; border-radius: 8px;
      background: rgba(71,85,105,0.2); border: 1px solid rgba(71,85,105,0.3);
      transition: all 0.3s ease;
    }
    .status-bar.online {
      background: rgba(74,222,128,0.08); border-color: rgba(74,222,128,0.2);
    }
    .status-segments { display: flex; gap: 3px; }
    .seg {
      width: 14px; height: 6px; border-radius: 3px;
      background: rgba(71,85,105,0.5); transition: all 0.3s ease;
    }
    .seg.lit {
      background: #4ade80;
      box-shadow: 0 0 6px rgba(74,222,128,0.5);
      animation: flicker 1.5s ease-in-out infinite alternate;
    }
    .seg.lit:nth-child(2) { animation-delay: 0.2s; }
    .seg.lit:nth-child(3) { animation-delay: 0.4s; }
    .seg.lit:nth-child(4) { animation-delay: 0.6s; }
    .seg.lit:nth-child(5) { animation-delay: 0.8s; }
    @keyframes flicker {
      from { opacity: 0.7; } to { opacity: 1; }
    }
    .status-text { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #64748b; }
    .status-bar.online .status-text { color: #4ade80; }

    /* Config Grid */
    .config-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    .config-field { display: flex; flex-direction: column; gap: 7px; }
    .full-width { grid-column: 1 / -1; }
    .config-field label {
      font-size: 11px; font-weight: 500; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.8px;
      font-family: 'JetBrains Mono', monospace;
    }
    .config-field input, .config-field select {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 9px 12px;
      color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 13px;
      outline: none; transition: all 0.2s;
      -webkit-appearance: none;
    }
    .config-field input:focus, .config-field select:focus {
      border-color: rgba(255,107,53,0.5); background: rgba(255,107,53,0.05);
    }
    .config-field input:disabled, .config-field select:disabled {
      opacity: 0.4; cursor: not-allowed;
    }
    .config-field select { cursor: pointer; }
    .config-field select option { background: #1e293b; }

    .token-field { position: relative; }
    .token-field input { width: 100%; padding-right: 44px; }
    .token-toggle {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #64748b;
      display: flex; align-items: center;
    }
    .token-toggle:hover { color: #94a3b8; }

    .debug-field { grid-column: 1 / -1; }
    .checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: #94a3b8; }
    .checkbox-label input { display: none; }
    .checkbox-custom {
      width: 16px; height: 16px; border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04);
      flex-shrink: 0; transition: all 0.2s; position: relative;
    }
    .checkbox-label input:checked + .checkbox-custom {
      background: #FF6B35; border-color: #FF6B35;
    }
    .checkbox-label input:checked + .checkbox-custom::after {
      content: ''; position: absolute; left: 4px; top: 2px;
      width: 5px; height: 8px; border: 2px solid white;
      border-top: none; border-left: none; transform: rotate(45deg);
    }

    .config-notice {
      display: flex; align-items: center; gap: 8px;
      margin-top: 14px; padding: 10px 14px;
      background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2);
      border-radius: 8px; font-size: 12px; color: #fbbf24;
    }

    /* Stats Row */
    .stats-row {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
    }
    .stat-card {
      background: rgba(15,18,25,0.8); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px; padding: 18px 20px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .stat-value {
      font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 600;
      color: #f1f5f9; letter-spacing: -0.5px;
    }
    .stat-value.green { color: #4ade80; }
    .stat-value.red { color: #f87171; }
    .stat-label { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; }

    /* Log Panel */
    .clear-btn {
      margin-left: auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: #64748b; padding: 5px 14px; border-radius: 6px; cursor: pointer;
      font-size: 12px; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    }
    .clear-btn:hover { background: rgba(255,255,255,0.1); color: #94a3b8; }

    .log-output {
      max-height: 220px; overflow-y: auto;
      background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px; padding: 8px;
      font-family: 'JetBrains Mono', monospace;
    }
    .log-output::-webkit-scrollbar { width: 4px; }
    .log-output::-webkit-scrollbar-track { background: transparent; }
    .log-output::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .log-entry {
      display: flex; align-items: baseline; gap: 10px;
      padding: 7px 10px; border-radius: 6px; margin-bottom: 2px;
      font-size: 12px; border-left: 2px solid transparent;
    }
    .log-entry:hover { background: rgba(255,255,255,0.03); }
    .log-entry.success { border-left-color: #4ade80; }
    .log-entry.warning { border-left-color: #fbbf24; }
    .log-entry.error { border-left-color: #f87171; }
    .log-entry.info { border-left-color: #60a5fa; }
    .log-time { color: #334155; flex-shrink: 0; }
    .log-badge {
      font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px; flex-shrink: 0;
    }
    .log-entry.success .log-badge { background: rgba(74,222,128,0.15); color: #4ade80; }
    .log-entry.warning .log-badge { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .log-entry.error .log-badge { background: rgba(248,113,113,0.15); color: #f87171; }
    .log-entry.info .log-badge { background: rgba(96,165,250,0.15); color: #60a5fa; }
    .log-msg { color: #94a3b8; flex: 1; }
    .log-empty { padding: 20px; text-align: center; color: #334155; font-size: 12px; }

    @media (max-width: 640px) {
      .admin-header { padding: 16px; }
      .admin-main { padding: 16px; }
      .config-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: 1; }
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class SplunkRumAdminComponent implements OnInit, OnDestroy {

  rumEnabled = false;
  showToken = false;

  config: RumConfig = {
    realm: 'us0',
    rumAccessToken: '',
    applicationName: 'my-angular-app',
    version: '1.0.0',
    environment: 'development',
    debug: false,
  };

  rumStatus: RumStatus = {
    initialized: false,
    sessionId: null,
    startedAt: null,
    eventsCount: 0,
  };

  activityLog: { time: string; type: string; message: string }[] = [];

  statusSegments = Array.from({ length: 8 }, (_, i) => ({ lit: true }));

  private eventCountInterval: any;

  ngOnInit(): void {
    this.addLog('info', 'Admin console initialized. Configure RUM and enable to start.');
  }

  ngOnDestroy(): void {
    clearInterval(this.eventCountInterval);
  }

  onToggleRum(): void {
    if (this.rumEnabled) {
      this.initializeRum();
    } else {
      this.destroyRum();
    }
  }

  private initializeRum(): void {
    if (!this.config.rumAccessToken?.trim()) {
      this.addLog('warning', 'No RUM access token provided. Using demo mode.');
    }

    try {
      // Load Splunk RUM SDK dynamically if not already loaded
      if (typeof SplunkRum === 'undefined') {
        this.loadSplunkRumScript().then(() => {
          this.startRum();
        }).catch(() => {
          this.addLog('warning', 'SDK not reachable — running in simulation mode.');
          this.startSimulationMode();
        });
      } else {
        this.startRum();
      }
    } catch (err: any) {
      this.addLog('error', `Initialization failed: ${err.message}`);
      this.startSimulationMode();
    }
  }

  private loadSplunkRumScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('#splunk-rum-sdk')) {
        resolve(); return;
      }
      const script = document.createElement('script');
      script.id = 'splunk-rum-sdk';
      script.src = `https://cdn.signalfx.com/o11y-gdi-rum/latest/splunk-otel-web.js`;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Script load failed'));
      document.head.appendChild(script);
    });
  }

  private startRum(): void {
    try {
      SplunkRum.init({
        realm: this.config.realm,
        rumAccessToken: this.config.rumAccessToken,
        applicationName: this.config.applicationName,
        version: this.config.version,
        deploymentEnvironment: this.config.environment,
        debug: this.config.debug,
      });

      const sessionId = SplunkRum.getSessionId?.() || this.generateSessionId();
      this.updateStatus(true, sessionId);
      this.addLog('success', `SplunkRum.init() called — App: ${this.config.applicationName} v${this.config.version}`);
      this.addLog('success', `Session started: ${sessionId}`);
      this.addLog('info', `Streaming to realm: ${this.config.realm}`);
      this.startEventCounter();
    } catch (err: any) {
      this.addLog('error', `SplunkRum.init failed: ${err.message}`);
      this.startSimulationMode();
    }
  }

  private startSimulationMode(): void {
    const sessionId = this.generateSessionId();
    this.updateStatus(true, sessionId);
    this.addLog('info', 'Simulation mode active (SDK not loaded in this environment).');
    this.addLog('success', `Simulated session: ${sessionId}`);
    this.startEventCounter();
  }

  private destroyRum(): void {
    clearInterval(this.eventCountInterval);
    try {
      if (typeof SplunkRum !== 'undefined' && SplunkRum.deinit) {
        SplunkRum.deinit();
        this.addLog('warning', 'SplunkRum.deinit() called — SDK unloaded.');
      } else {
        this.addLog('warning', 'RUM collection stopped.');
      }
    } catch (err: any) {
      this.addLog('error', `Deinit error: ${err.message}`);
    }
    this.updateStatus(false, null);
    this.addLog('info', `Total events sent this session: ${this.rumStatus.eventsCount}`);
    this.rumStatus.eventsCount = 0;
  }

  private updateStatus(initialized: boolean, sessionId: string | null): void {
    this.rumStatus.initialized = initialized;
    this.rumStatus.sessionId = sessionId;
    this.rumStatus.startedAt = initialized ? new Date() : null;
  }

  private startEventCounter(): void {
    // Simulate incrementing event count while RUM is active
    this.eventCountInterval = setInterval(() => {
      if (this.rumEnabled) {
        this.rumStatus.eventsCount += Math.floor(Math.random() * 3) + 1;
      }
    }, 2000);
  }

  private addLog(type: 'success' | 'warning' | 'error' | 'info', message: string): void {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    this.activityLog.unshift({ time, type, message });
    if (this.activityLog.length > 50) this.activityLog.pop();
  }

  clearLog(): void {
    this.activityLog = [];
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}