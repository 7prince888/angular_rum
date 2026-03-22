import { Component, OnDestroy, Inject, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface LogEntry {
  time: string;
  msg: string;
  type: 'success' | 'warn' | 'info' | 'error';
}

interface SplunkRumConfig {
  version: string;
  realm: string;
  rumAccessToken: string;
  applicationName: string;
  deploymentEnvironment: string;
}

@Component({
  selector: 'app-splunk-rum-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" [class.active]="isEnabled()">

      <!-- Header -->
      <div class="card-header">
        <div class="brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8631a" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          <div>
            <div class="brand-name">Splunk RUM</div>
            <div class="brand-sub">Real User Monitoring</div>
          </div>
        </div>

        <div class="toggle-wrap">
          <label class="toggle" aria-label="Toggle Splunk RUM">
            <input type="checkbox" [ngModel]="isEnabled()" (ngModelChange)="onToggle($event)" />
            <span class="knob"></span>
          </label>
          <span class="toggle-state" [class.on]="isEnabled()">{{ isEnabled() ? 'ON' : 'OFF' }}</span>
        </div>
      </div>

      <!-- Status pill -->
      <div class="status-pill" [class.active]="isEnabled()">
        <span class="pulse-dot"></span>
        <span>{{ isEnabled() ? 'Scripts active in &lt;head&gt;' : 'Scripts not loaded' }}</span>
      </div>

      <!-- Config fields -->
      <div class="config-grid">
        <div class="field">
          <label>Version</label>
          <input [(ngModel)]="config.version" [disabled]="isEnabled()" placeholder="0.18.0" />
        </div>
        <div class="field">
          <label>Realm</label>
          <input [(ngModel)]="config.realm" [disabled]="isEnabled()" placeholder="us1" />
        </div>
        <div class="field full">
          <label>RUM Access Token</label>
          <input [(ngModel)]="config.rumAccessToken" [disabled]="isEnabled()" placeholder="your-token" />
        </div>
        <div class="field">
          <label>Application Name</label>
          <input [(ngModel)]="config.applicationName" [disabled]="isEnabled()" placeholder="my-web-app" />
        </div>
        <div class="field">
          <label>Environment</label>
          <input [(ngModel)]="config.deploymentEnvironment" [disabled]="isEnabled()" placeholder="production" />
        </div>
      </div>

      <!-- Generated script preview -->
      <div class="code-preview">
        <div class="code-header">
          <span>Generated &lt;head&gt; injection</span>
          <span class="copy-btn" (click)="copyCode()">{{ copied ? '✓ Copied' : 'Copy' }}</span>
        </div>
        <pre class="code-body"><code [innerHTML]="highlightedCode()"></code></pre>
      </div>

      <!-- Log -->
      <div class="log-panel">
        <div class="log-header">Activity Log</div>
        <div class="log-body">
          <div *ngFor="let e of logs" class="log-row {{ e.type }}">
            <span class="ts">{{ e.time }}</span>
            <span class="lm">{{ e.msg }}</span>
          </div>
          <div *ngIf="logs.length === 0" class="log-empty">No activity yet.</div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap');

    :host { display: block; font-family: 'Inter', sans-serif; }

    .card {
      background: #111318;
      border: 1px solid #23262f;
      border-radius: 16px;
      padding: 1.5rem;
      max-width: 560px;
      color: #e2e4ea;
      transition: border-color .4s, box-shadow .4s;
    }
    .card.active {
      border-color: #e8631a;
      box-shadow: 0 0 40px rgba(232,99,26,.12);
    }

    /* Header */
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.1rem; }
    .brand { display: flex; align-items: center; gap: .65rem; }
    .brand-name { font-size: .9rem; font-weight: 700; color: #fff; }
    .brand-sub { font-size: .62rem; color: #6b7280; margin-top: 1px; font-family: 'JetBrains Mono', monospace; }

    /* Toggle */
    .toggle-wrap { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
    .toggle { position: relative; width: 50px; height: 26px; cursor: pointer; }
    .toggle input { opacity: 0; position: absolute; width: 0; height: 0; }
    .knob {
      position: absolute; inset: 0;
      background: #1e2029; border: 1.5px solid #2e3140; border-radius: 26px;
      transition: .3s;
    }
    .knob::before {
      content: ''; position: absolute;
      width: 17px; height: 17px; left: 3px; top: 50%;
      transform: translateY(-50%);
      background: #4b5063; border-radius: 50%;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1), background .3s;
    }
    .toggle input:checked + .knob { background: rgba(232,99,26,.15); border-color: #e8631a; box-shadow: 0 0 10px rgba(232,99,26,.35); }
    .toggle input:checked + .knob::before { transform: translateX(24px) translateY(-50%); background: #e8631a; }
    .toggle-state { font-family: 'JetBrains Mono', monospace; font-size: .58rem; font-weight: 600; letter-spacing: .1em; color: #4b5063; transition: color .3s; }
    .toggle-state.on { color: #e8631a; }

    /* Status */
    .status-pill {
      display: flex; align-items: center; gap: .5rem;
      padding: .45rem .85rem; border-radius: 8px; font-size: .68rem;
      background: rgba(100,100,120,.08); border: 1px solid #23262f;
      color: #6b7280; margin-bottom: 1.2rem;
      font-family: 'JetBrains Mono', monospace;
      transition: .4s;
    }
    .status-pill.active { background: rgba(232,99,26,.08); border-color: rgba(232,99,26,.25); color: #e8631a; }
    .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .status-pill.active .pulse-dot { animation: blink 1.6s ease-in-out infinite; }
    @keyframes blink { 0%,100%{opacity:1}50%{opacity:.25} }

    /* Config grid */
    .config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; margin-bottom: 1.2rem; }
    .field { display: flex; flex-direction: column; gap: .3rem; }
    .field.full { grid-column: 1 / -1; }
    .field label { font-size: .6rem; color: #6b7280; text-transform: uppercase; letter-spacing: .09em; }
    .field input {
      background: #0d0e12; border: 1px solid #23262f; border-radius: 7px;
      color: #c9ccd6; font-family: 'JetBrains Mono', monospace; font-size: .7rem;
      padding: .45rem .65rem; outline: none; transition: border-color .2s;
    }
    .field input:focus { border-color: #e8631a; }
    .field input:disabled { opacity: .4; cursor: not-allowed; }

    /* Code preview */
    .code-preview { margin-bottom: 1.1rem; border-radius: 10px; overflow: hidden; border: 1px solid #1e2029; }
    .code-header {
      display: flex; justify-content: space-between; align-items: center;
      background: #0d0e12; padding: .5rem .9rem;
      font-size: .62rem; color: #6b7280; font-family: 'JetBrains Mono', monospace;
      border-bottom: 1px solid #1e2029;
    }
    .copy-btn { cursor: pointer; color: #e8631a; transition: opacity .2s; user-select: none; }
    .copy-btn:hover { opacity: .7; }
    .code-body { background: #090a0d; padding: .9rem 1rem; margin: 0; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: .67rem; line-height: 1.8; color: #8891a4; }
    .kw  { color: #c792ea; }
    .str { color: #c3e88d; }
    .fn  { color: #82aaff; }
    .at  { color: #ffcb6b; }
    .cm  { color: #374151; font-style: italic; }
    .tag { color: #89ddff; }
    .val { color: #f78c6c; }

    /* Log */
    .log-panel { border-top: 1px solid #1a1d25; padding-top: 1rem; }
    .log-header { font-size: .62rem; color: #4b5063; text-transform: uppercase; letter-spacing: .1em; margin-bottom: .5rem; font-family: 'JetBrains Mono', monospace; }
    .log-body { font-family: 'JetBrains Mono', monospace; font-size: .65rem; line-height: 1.9; max-height: 100px; overflow-y: auto; }
    .log-row { display: flex; gap: .6rem; }
    .ts { color: #2e3140; flex-shrink: 0; }
    .log-row.success .lm { color: #4ade80; }
    .log-row.warn    .lm { color: #fbbf24; }
    .log-row.info    .lm { color: #60a5fa; }
    .log-row.error   .lm { color: #f87171; }
    .log-empty { color: #2e3140; }
  `]
})
export class SplunkRumToggleComponent implements OnDestroy {

  // ── Script element IDs (used to find & remove them) ──────────────────────
  private readonly SDK_SCRIPT_ID  = 'splunk-otel-web-sdk';
  private readonly INIT_SCRIPT_ID = 'splunk-otel-web-init';
  // ─────────────────────────────────────────────────────────────────────────

  isEnabled = signal(false);
  copied = false;
  logs: LogEntry[] = [];

  config: SplunkRumConfig = {
    version: '0.18.0',
    realm: 'us1',
    rumAccessToken: 'QhwpaLHNQIBNg-F4ZgveFg',
    applicationName: 'my-web-app',
    deploymentEnvironment: 'production'
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  // ── Computed highlighted code preview ────────────────────────────────────
  highlightedCode = computed(() => {
    const c = this.config;
    const cdnUrl = `https://cdn.signalfx.com/o11y-gdi-rum/${c.version}/splunk-otel-web.js`;
    return [
      `<span class="cm">&lt;!-- 1. Load Splunk OTel SDK --&gt;</span>`,
      `<span class="tag">&lt;script</span> <span class="at">src</span>=<span class="str">"${cdnUrl}"</span>`,
      `        <span class="at">crossorigin</span>=<span class="str">"anonymous"</span><span class="tag">&gt;&lt;/script&gt;</span>`,
      ``,
      `<span class="cm">&lt;!-- 2. Initialise RUM --&gt;</span>`,
      `<span class="tag">&lt;script&gt;</span>`,
      `  <span class="fn">SplunkRum</span>.<span class="fn">init</span>({`,
      `    <span class="at">realm</span>:                 <span class="str">"${c.realm}"</span>,`,
      `    <span class="at">rumAccessToken</span>:        <span class="str">"${c.rumAccessToken}"</span>,`,
      `    <span class="at">applicationName</span>:       <span class="str">"${c.applicationName}"</span>,`,
      `    <span class="at">deploymentEnvironment</span>: <span class="str">"${c.deploymentEnvironment}"</span>`,
      `  });`,
      `<span class="tag">&lt;/script&gt;</span>`,
    ].join('\n');
  });

  // ── Toggle handler ────────────────────────────────────────────────────────
  onToggle(enabled: boolean): void {
    this.isEnabled.set(enabled);
    enabled ? this.injectScripts() : this.removeScripts();
  }

  // ── Inject both script tags into <head> ───────────────────────────────────
  private injectScripts(): void {
    // Guard: already injected
    if (this.document.getElementById(this.SDK_SCRIPT_ID)) {
      this.log('Scripts already present in <head>.', 'warn');
      return;
    }

    const cdnUrl = `https://cdn.signalfx.com/o11y-gdi-rum/${this.config.version}/splunk-otel-web.js`;

    // 1. SDK loader <script src="..." crossorigin="anonymous">
    const sdkScript = this.document.createElement('script');
    sdkScript.id          = this.SDK_SCRIPT_ID;
    sdkScript.src         = cdnUrl;
    sdkScript.crossOrigin = 'anonymous';
    sdkScript.async       = false; // must load before init script runs

    sdkScript.onload = () => {
      this.log('SDK script loaded ✓ — running SplunkRum.init()', 'success');
      // Append init script AFTER sdk is confirmed loaded
      this.document.head.appendChild(initScript);
      this.log('SplunkRum.init() injected ✓', 'success');
    };

    sdkScript.onerror = () => {
      this.log('SDK script failed to load ✗  (check version / network)', 'error');
      this.isEnabled.set(false);
    };

    // 2. Inline init <script> — built from live config
    const initScript = this.document.createElement('script');
    initScript.id        = this.INIT_SCRIPT_ID;
    initScript.textContent = `
      SplunkRum.init({
        realm: ${JSON.stringify(this.config.realm)},
        rumAccessToken: ${JSON.stringify(this.config.rumAccessToken)},
        applicationName: ${JSON.stringify(this.config.applicationName)},
        deploymentEnvironment: ${JSON.stringify(this.config.deploymentEnvironment)}
      });
    `;

    this.document.head.appendChild(sdkScript);
    this.log(`Injecting SDK → ${cdnUrl}`, 'info');
  }

  // ── Remove both script tags from <head> ───────────────────────────────────
  private removeScripts(): void {
    let removed = 0;
    [this.SDK_SCRIPT_ID, this.INIT_SCRIPT_ID].forEach(id => {
      const el = this.document.getElementById(id);
      if (el) { el.remove(); removed++; }
    });
    this.log(removed > 0 ? `Removed ${removed} script(s) from <head>.` : 'No scripts to remove.', 'warn');
  }

  // ── Copy raw code to clipboard ────────────────────────────────────────────
  copyCode(): void {
    const c = this.config;
    const raw = `<script src="https://cdn.signalfx.com/o11y-gdi-rum/${c.version}/splunk-otel-web.js" crossorigin="anonymous"><\/script>\n<script>\n  SplunkRum.init({\n    realm: "${c.realm}",\n    rumAccessToken: "${c.rumAccessToken}",\n    applicationName: "${c.applicationName}",\n    deploymentEnvironment: "${c.deploymentEnvironment}"\n  });\n<\/script>`;
    navigator.clipboard.writeText(raw).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  private log(msg: string, type: LogEntry['type']): void {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.logs.unshift({ time, msg, type });
    if (this.logs.length > 30) this.logs.pop();
  }

  ngOnDestroy(): void {
    this.removeScripts();
  }
}