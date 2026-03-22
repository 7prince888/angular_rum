import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RumService {
  private readonly SPLUNK_SCRIPT_ID = 'splunk-otel-web-script';
  private readonly SPLUNK_INIT_ID = 'splunk-rum-init';
  private readonly STORAGE_KEY = 'rum_enabled';

  private _enabled = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Restore previous toggle state from localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    this._enabled = stored === 'true';
    if (this._enabled) {
      this.inject();
    }
  }

  get enabled(): boolean {
    return this._enabled;
  }

  enable(): void {
    this._enabled = true;
    localStorage.setItem(this.STORAGE_KEY, 'true');
    this.inject();
  }

  disable(): void {
    this._enabled = false;
    localStorage.setItem(this.STORAGE_KEY, 'false');
    this.remove();
  }

  toggle(): void {
    this._enabled ? this.disable() : this.enable();
  }

  private inject(): void {
    if (this.document.getElementById(this.SPLUNK_SCRIPT_ID)) {
      return; // Already injected
    }

    // 1. Load the Splunk OTEL SDK
    const sdkScript = this.document.createElement('script');
    sdkScript.id = this.SPLUNK_SCRIPT_ID;
    sdkScript.src =
      'https://cdn.signalfx.com/o11y-gdi-rum/v2.3.0/splunk-otel-web.js';
    sdkScript.integrity =
      'sha384-IvIWluE2BNZr5w9/0lb0L+QLc9ko2NktAE8h0bJKqan6i0X9XlXGBFFJnozMjtWy';
    sdkScript.crossOrigin = 'anonymous';

    // 2. Once loaded, init SplunkRum
    sdkScript.onload = () => {
      if (this.document.getElementById(this.SPLUNK_INIT_ID)) return;

      const initScript = this.document.createElement('script');
      initScript.id = this.SPLUNK_INIT_ID;
      initScript.textContent = `
        SplunkRum.init({
          realm: "us1",
          rumAccessToken: "KrKtSmfyU4JMde0WNkAnmw",
          applicationName: "app2",
          deploymentEnvironment: "prod"
        });
      `;
      this.document.head.appendChild(initScript);
    };

    this.document.head.appendChild(sdkScript);
  }

  private remove(): void {
    const sdk = this.document.getElementById(this.SPLUNK_SCRIPT_ID);
    const init = this.document.getElementById(this.SPLUNK_INIT_ID);
    sdk?.remove();
    init?.remove();
  }
}