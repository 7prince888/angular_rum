import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { RumService } from './rum.service';

describe('RumService', () => {
  let service: RumService;
  let document: Document;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RumService);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    // Clean up injected scripts between tests
    document.getElementById('splunk-otel-web-script')?.remove();
    document.getElementById('splunk-rum-init')?.remove();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start disabled when no stored preference', () => {
    expect(service.enabled).toBeFalse();
  });

  it('should enable RUM and inject script into <head>', () => {
    service.enable();
    expect(service.enabled).toBeTrue();
    expect(document.getElementById('splunk-otel-web-script')).toBeTruthy();
  });

  it('should disable RUM and remove scripts from <head>', () => {
    service.enable();
    service.disable();
    expect(service.enabled).toBeFalse();
    expect(document.getElementById('splunk-otel-web-script')).toBeNull();
  });

  it('should toggle state correctly', () => {
    expect(service.enabled).toBeFalse();
    service.toggle();
    expect(service.enabled).toBeTrue();
    service.toggle();
    expect(service.enabled).toBeFalse();
  });

  it('should persist enabled state to localStorage', () => {
    service.enable();
    expect(localStorage.getItem('rum_enabled')).toBe('true');
  });

  it('should restore enabled state from localStorage on init', () => {
    localStorage.setItem('rum_enabled', 'true');
    const freshService = new RumService(document);
    expect(freshService.enabled).toBeTrue();
  });

  it('should not inject duplicate scripts on multiple enable() calls', () => {
    service.enable();
    service.enable();
    const scripts = document.querySelectorAll('#splunk-otel-web-script');
    expect(scripts.length).toBe(1);
  });
});