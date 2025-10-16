/**
 * Outbound Host Allowlist Tests
 * Epic: TSE-0002 - Security Hardening and Audit Framework
 * Phase: Phase 5 - Backdoor Reconnaissance
 * Generated: {{DATE}}
 *
 * Comprehensive tests for outbound allowlist enforcement.
 *
 * USAGE: Place in infrastructure/security/__tests__/outbound-allowlist.test.ts
 * Run: npm test infrastructure/security/outbound-allowlist.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isAllowedUrl,
  assertAllowedUrl,
  getAllowedHosts,
  addAllowedHost,
  clearAllowedHosts,
} from '../outbound-allowlist';

describe('outbound-allowlist', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
    clearAllowedHosts();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    clearAllowedHosts();
  });

  describe('isAllowedUrl', () => {
    it('should allow configured base URL from environment', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
      // Re-import to pick up env changes
      jest.resetModules();
      const { isAllowedUrl: isAllowed } = require('../outbound-allowlist');

      expect(isAllowed('https://api.example.com/data')).toBe(true);
    });

    it('should block unknown hosts', () => {
      expect(isAllowedUrl('https://evil.com')).toBe(false);
    });

    it('should block invalid URLs', () => {
      expect(isAllowedUrl('not-a-url')).toBe(false);
    });

    it('should allow URL objects', () => {
      addAllowedHost('api.example.com');
      const url = new URL('https://api.example.com/path');
      expect(isAllowedUrl(url)).toBe(true);
    });

    it('should block different subdomains', () => {
      addAllowedHost('api.example.com');
      expect(isAllowedUrl('https://evil.example.com')).toBe(false);
    });

    it('should allow exact hostname match regardless of path', () => {
      addAllowedHost('api.example.com');
      expect(isAllowedUrl('https://api.example.com/')).toBe(true);
      expect(isAllowedUrl('https://api.example.com/v1/users')).toBe(true);
      expect(isAllowedUrl('https://api.example.com/admin/secret')).toBe(true);
    });

    it('should allow exact hostname match regardless of protocol', () => {
      addAllowedHost('api.example.com');
      expect(isAllowedUrl('http://api.example.com')).toBe(true);
      expect(isAllowedUrl('https://api.example.com')).toBe(true);
    });
  });

  describe('assertAllowedUrl', () => {
    it('should not throw for allowed hosts', () => {
      addAllowedHost('api.example.com');
      expect(() => assertAllowedUrl('https://api.example.com')).not.toThrow();
    });

    it('should throw for unknown hosts', () => {
      expect(() => assertAllowedUrl('https://evil.com')).toThrow(/not allowed/);
    });

    it('should include hostname in error message', () => {
      expect(() => assertAllowedUrl('https://evil.com')).toThrow(/evil.com/);
    });

    it('should include allowed hosts in error message', () => {
      addAllowedHost('api.example.com');
      addAllowedHost('cdn.example.com');

      try {
        assertAllowedUrl('https://evil.com');
        fail('Should have thrown');
      } catch (e: any) {
        expect(e.message).toContain('api.example.com');
        expect(e.message).toContain('cdn.example.com');
      }
    });

    it('should handle URL objects', () => {
      addAllowedHost('api.example.com');
      const url = new URL('https://api.example.com');
      expect(() => assertAllowedUrl(url)).not.toThrow();
    });
  });

  describe('getAllowedHosts', () => {
    it('should return empty array when no hosts configured', () => {
      const hosts = getAllowedHosts();
      expect(hosts).toEqual([]);
    });

    it('should return all configured hosts', () => {
      addAllowedHost('api.example.com');
      addAllowedHost('cdn.example.com');

      const hosts = getAllowedHosts();
      expect(hosts).toHaveLength(2);
      expect(hosts).toContain('api.example.com');
      expect(hosts).toContain('cdn.example.com');
    });
  });

  describe('addAllowedHost', () => {
    it('should add host to allowlist', () => {
      addAllowedHost('new.example.com');
      expect(isAllowedUrl('https://new.example.com')).toBe(true);
    });

    it('should not add duplicates', () => {
      addAllowedHost('api.example.com');
      addAllowedHost('api.example.com');

      const hosts = getAllowedHosts();
      expect(hosts).toHaveLength(1);
    });
  });

  describe('clearAllowedHosts', () => {
    it('should remove all hosts', () => {
      addAllowedHost('api.example.com');
      addAllowedHost('cdn.example.com');

      clearAllowedHosts();

      expect(getAllowedHosts()).toEqual([]);
      expect(isAllowedUrl('https://api.example.com')).toBe(false);
    });
  });

  describe('real-world scenarios', () => {
    it('should prevent SSRF attacks', () => {
      addAllowedHost('api.example.com');

      // Attacker tries to access internal services
      expect(() => assertAllowedUrl('http://localhost:8080')).toThrow();
      expect(() => assertAllowedUrl('http://127.0.0.1')).toThrow();
      expect(() => assertAllowedUrl('http://192.168.1.1')).toThrow();
      expect(() => assertAllowedUrl('http://internal.company.com')).toThrow();
    });

    it('should prevent data exfiltration', () => {
      addAllowedHost('api.example.com');

      // Attacker tries to exfiltrate data
      expect(() => assertAllowedUrl('https://attacker.com/collect?data=secret')).toThrow();
      expect(() => assertAllowedUrl('https://pastebin.com/upload')).toThrow();
    });

    it('should allow legitimate API calls', () => {
      addAllowedHost('api.stripe.com');
      addAllowedHost('api.github.com');

      expect(() => assertAllowedUrl('https://api.stripe.com/v1/charges')).not.toThrow();
      expect(() => assertAllowedUrl('https://api.github.com/repos/user/repo')).not.toThrow();
    });
  });
});
