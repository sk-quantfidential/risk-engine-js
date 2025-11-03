/**
 * Outbound Host Allowlist Utility
 * Epic: TSE-0002 - Security Hardening and Audit Framework
 * Phase: Phase 5 - Backdoor Reconnaissance
 * Generated: {{DATE}}
 *
 * Centralized enforcement of approved external hosts.
 * Prevents unauthorized external API calls and data exfiltration.
 *
 * USAGE:
 *   import { assertAllowedUrl, isAllowedUrl } from '@/infrastructure/security/outbound-allowlist';
 *
 *   // Enforce allowlist before external call
 *   assertAllowedUrl(url);  // Throws if not allowed
 *   await fetch(url);
 *
 *   // Or check without throwing
 *   if (isAllowedUrl(url)) {
 *     await fetch(url);
 *   }
 */

// Build allowlist from environment variables
const allowedHosts = new Set<string>();

// Add base URLs from environment
if (typeof process !== 'undefined' && process.env) {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_API_BASE_URL);
      allowedHosts.add(url.hostname);
    } catch (e) {
      console.warn('Invalid NEXT_PUBLIC_API_BASE_URL:', e);
    }
  }

  if (process.env.API_BASE_URL) {
    try {
      const url = new URL(process.env.API_BASE_URL);
      allowedHosts.add(url.hostname);
    } catch (e) {
      console.warn('Invalid API_BASE_URL:', e);
    }
  }
}

// Add known safe domains (configure these for your project)
const knownSafeDomains: string[] = [
  // Example: Add your approved external APIs
  // 'api.example.com',
  // 'cdn.example.com',
  // 'auth.example.com',
];
knownSafeDomains.forEach(host => allowedHosts.add(host));

/**
 * Check if URL is allowed
 * @param url - Full URL or hostname
 * @returns true if allowed, false otherwise
 */
export function isAllowedUrl(url: string | URL): boolean {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    return allowedHosts.has(urlObj.hostname);
  } catch {
    return false;  // Invalid URL
  }
}

/**
 * Assert URL is allowed, throw if not
 * @param url - Full URL or hostname
 * @throws Error if URL not allowed
 */
export function assertAllowedUrl(url: string | URL): void {
  if (!isAllowedUrl(url)) {
    const hostname = typeof url === 'string'
      ? (() => { try { return new URL(url).hostname; } catch { return url; } })()
      : url.hostname;

    throw new Error(
      `Outbound call to ${hostname} is not allowed. ` +
      `Allowed hosts: ${Array.from(allowedHosts).join(', ') || 'none configured'}`
    );
  }
}

/**
 * Get all allowed hosts (for logging/debugging)
 * @returns Array of allowed hostnames
 */
export function getAllowedHosts(): string[] {
  return Array.from(allowedHosts);
}

/**
 * Add a host to the allowlist at runtime (use sparingly)
 * @param hostname - Hostname to add
 */
export function addAllowedHost(hostname: string): void {
  allowedHosts.add(hostname);
}

/**
 * Clear all allowed hosts (for testing)
 */
export function clearAllowedHosts(): void {
  allowedHosts.clear();
}
