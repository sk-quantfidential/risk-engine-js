# Security Audit Plugin for risk-engine-js

**Version**: 1.0.0
**Epic**: TSE-0002 - Security Hardening and Audit Framework
**Component**: risk-engine-js (Node.js/TypeScript)
**Created**: 2025-10-16

---

## Overview

This plugin implements a comprehensive 5-phase security audit framework for the `risk-engine-js` component, providing CISO-grade security controls for Node.js/TypeScript projects.

### What This Plugin Does

Automates the implementation of industry-standard security controls across 6 phases:

- **Phase 0 (Hygiene)**: Baseline security with .gitignore, CODEOWNERS, Dependabot
- **Phase 1 (SBOM)**: Software Bill of Materials generation and vulnerability scanning
- **Phase 2 (SAST)**: Static Application Security Testing with CodeQL and Semgrep
- **Phase 3 (Secrets)**: Secrets detection with Gitleaks and pre-commit hooks
- **Phase 4 (Supply Chain)**: npm audit policy enforcement and OpenSSF Scorecard
- **Phase 5 (Backdoor Recon)**: Advanced obfuscation detection and allowlist enforcement

### Evidence Generated

- **90-day artifacts**: SBOMs, secrets scans, scorecards, reconnaissance reports
- **30-day artifacts**: Vulnerability scans, SAST results
- **Continuous monitoring**: GitHub Actions workflows for all security checks
- **Audit trail**: All findings tracked with timestamps and severity

---

## Quick Start

### Prerequisites

- Node.js LTS (18.x or 20.x)
- npm (comes with Node.js)
- GitHub Actions enabled on repository
- GitHub Teams configured: `@Corprime/security`, `@Corprime/maintainers`

### Installation Options

#### Option 1: Full Security Suite (Recommended)

Implement all 6 phases for complete security coverage:

```bash
# Run from risk-engine-js root
./claude/plugins/security-audit/commands/setup-phase.sh --phase all
```

#### Option 2: Phase-by-Phase Installation

Implement phases incrementally (recommended for existing projects):

```bash
# Phase 0: Hygiene (start here)
./.claude/plugins/security-audit/commands/setup-phase.sh --phase hygiene

# Phase 1: SBOM
./.claude/plugins/security-audit/commands/setup-phase.sh --phase sbom

# Phase 2: SAST
./.claude/plugins/security-audit/commands/setup-phase.sh --phase sast

# Phase 3: Secrets
./.claude/plugins/security-audit/commands/setup-phase.sh --phase secrets

# Phase 4: Supply Chain
./.claude/plugins/security-audit/commands/setup-phase.sh --phase supply-chain

# Phase 5: Backdoor Recon
./.claude/plugins/security-audit/commands/setup-phase.sh --phase backdoor-recon
```

#### Option 3: Manual Installation

Copy templates manually from `.claude/plugins/security-audit/templates/` to project root.

---

## Phase Descriptions

### Phase 0: Hygiene Controls (TSE-0002.1)

**Milestone**: TSE-0002.1
**Goal**: Establish baseline security hygiene

**What Gets Implemented**:
- Enhanced `.gitignore` for secrets prevention
- `.github/CODEOWNERS` for security review requirements
- `.github/dependabot.yml` for automated dependency updates

**Files Created**:
```
.gitignore (enhanced with security patterns)
.github/CODEOWNERS
.github/dependabot.yml
```

**Validation**:
```bash
# Check ignored files
git status --ignored | grep -E '\.(env|log|pem)'

# Verify CODEOWNERS syntax
gh api repos/Corprime/risk-engine-js/codeowners/errors
```

**Time to Implement**: ~30 minutes
**Impact**: Prevention of secret leaks, mandatory security reviews

---

### Phase 1: SBOM & Vulnerability Scanning (TSE-0002.2)

**Milestone**: TSE-0002.2
**Goal**: Generate reproducible Software Bill of Materials and scan for vulnerabilities

**What Gets Implemented**:
- Syft SBOM generation (SPDX format)
- Grype vulnerability scanning
- OSV dependency scanning
- npm scripts for local execution

**Files Created**:
```
.github/workflows/sbom.yml
.github/workflows/osv.yml
package.json (scripts: sbom:syft, scan:grype, scan:osv)
```

**Artifacts Generated** (CI):
```
sbom-artifacts/sbom.spdx.json (90-day retention)
sbom-artifacts/sbom.spdx.sha256
grype-results/grype.json
grype-results/grype.sarif
osv-results/osv.results.json (30-day retention)
```

**Local Usage**:
```bash
# Generate SBOM
npm run sbom:syft

# Scan SBOM with Grype
npm run scan:grype

# Scan with OSV
npm run scan:osv
```

**Time to Implement**: ~1 hour
**Impact**: Auditable dependency inventory, CVE detection

---

### Phase 2: SAST (TSE-0002.3)

**Milestone**: TSE-0002.3
**Goal**: Continuous static code analysis for security vulnerabilities

**What Gets Implemented**:
- CodeQL (GitHub's semantic analysis)
- Semgrep (fast pattern matching)
- Custom Semgrep rules for project-specific security policies
- SARIF upload to GitHub Code Scanning

**Files Created**:
```
.github/workflows/codeql.yml
.github/workflows/semgrep.yml
.semgrep/custom.yml
package.json (scripts: sast:semgrep, sast:quick)
```

**Custom Rules**:
- `no-eval-new-function`: Block dynamic code execution
- `no-node-exec-primitives`: Prevent child_process/vm usage
- `disallow-external-fetch-hosts`: Enforce outbound allowlist
- `suspicious-base64-decode`: Flag potential obfuscation

**Local Usage**:
```bash
# Run Semgrep with all rules
npm run sast:semgrep

# Quick scan (custom rules only)
npm run sast:quick
```

**Viewing Results**:
Navigate to: `GitHub → Security → Code scanning`

**Time to Implement**: ~2 hours
**Impact**: SQL injection, XSS, command injection detection

---

### Phase 3: Secrets Scanning (TSE-0002.4)

**Milestone**: TSE-0002.4
**Goal**: Prevent credentials from entering Git history

**What Gets Implemented**:
- Gitleaks CI workflow (full history scan)
- Pre-commit hook (staged files only)
- `.gitleaks.toml` configuration with allowlist
- Automatic hook installation for all developers

**Files Created**:
```
.github/workflows/gitleaks.yml
.gitleaks.toml
scripts/install-gitleaks-hook.sh
.git/hooks/pre-commit (via install script)
package.json (scripts: secrets:scan, secrets:staged, postinstall)
```

**Local Usage**:
```bash
# Scan full Git history
npm run secrets:scan

# Scan staged files (pre-commit)
npm run secrets:staged

# Install pre-commit hook
sh scripts/install-gitleaks-hook.sh
```

**What Gets Scanned**:
- AWS access keys
- GitHub tokens
- API keys
- Private keys (RSA, SSH, PGP)
- Database connection strings
- OAuth tokens
- JWT tokens
- 100+ more patterns

**Time to Implement**: ~1.5 hours
**Impact**: Prevention of credential leaks, historical audit

---

### Phase 4: Supply Chain Security (TSE-0002.5)

**Milestone**: TSE-0002.5
**Goal**: Policy-driven dependency vulnerability management

**What Gets Implemented**:
- npm audit with `--audit-level=high` enforcement
- OpenSSF Scorecard (18+ security best practices)
- Automated policy enforcement (blocks High/Critical vulnerabilities)

**Files Created**:
```
.github/workflows/npm-audit.yml
.github/workflows/scorecards.yml
```

**Policy Enforcement**:
```yaml
Audit Level: high
Fail on High: true
Fail on Critical: true
Production: Enforced separately
Development: Monitored (informational)
```

**Local Usage**:
```bash
# Full dependency audit
npm audit

# Production dependencies only
npm audit --production

# Check for specific severity
npm audit --audit-level=high
```

**Scorecard Checks** (selection):
- Branch protection
- CI tests
- Code review requirements
- Dependency update tool (Dependabot)
- SAST configuration
- Security policy (SECURITY.md)
- Token permissions (least-privilege)
- Vulnerability status

**Time to Implement**: ~1 hour
**Impact**: Blocks vulnerable dependency merges, validates repository security

---

### Phase 5: Backdoor Reconnaissance (TSE-0002.6)

**Milestone**: TSE-0002.6
**Goal**: Deep inspection for obfuscated code and hidden threats

**What Gets Implemented**:
- Extended Semgrep rules (obfuscation detection)
- Grep-based reconnaissance workflow
- Outbound host allowlist utility with tests

**Files Created**:
```
.github/workflows/backdoor-recon.yml
.semgrep/custom.yml (extended with Phase 5 rules)
infrastructure/security/outbound-allowlist.ts
infrastructure/security/__tests__/outbound-allowlist.test.ts
```

**Extended Detection Rules**:
- `long-base64-blob`: Suspicious long base64 strings
- `unicode-homoglyphs-in-source`: Non-ASCII characters (homoglyph attacks)
- `disallow-external-axios-hosts`: Axios calls to external hosts
- `node-networking-primitives`: Low-level networking (http, https, net, dgram)
- `websocket-external-host`: WebSocket connections to external hosts

**Reconnaissance Patterns**:
```bash
Obfuscation Markers:
  - while(!![]): Obfuscated control flow
  - Function(): Dynamic function creation
  - eval(): Dynamic code execution
  - atob()/Buffer.from(...,'base64'): Base64 decoding
  - [A-Za-z0-9+/]{80,}: Long base64 strings

Hidden Networking:
  - require('http|https|net|dgram'): Low-level sockets
  - new WebSocket(): External connections
  - fetch() with hardcoded URLs
```

**Outbound Allowlist Usage**:
```typescript
import { assertAllowedUrl } from '@/infrastructure/security/outbound-allowlist';

// Enforce allowlist before external calls
async function fetchData(url: string) {
  assertAllowedUrl(url);  // Throws if not allowed
  const response = await fetch(url);
  return response.json();
}
```

**Local Usage**:
```bash
# Test allowlist utility
npm test infrastructure/security/outbound-allowlist.test.ts

# Run reconnaissance locally
# (Extract grep commands from .github/workflows/backdoor-recon.yml)
```

**Time to Implement**: ~2 hours
**Impact**: Supply chain attack detection, obfuscation flagging

---

## Workflow Integration

### Epic Branching Strategy

All phases follow the Trading Ecosystem workflow (epic-based branching):

```
Epic: epic-TSE-0002 (Security Hardening and Audit Framework)
  ├── feature/TSE-0002.1a-gitignore-security-patterns
  ├── feature/TSE-0002.1b-codeowners-security-review
  ├── feature/TSE-0002.1c-dependabot-automated-updates
  ├── feature/TSE-0002.2a-sbom-syft-grype
  ├── feature/TSE-0002.2b-osv-dependency-scan
  ├── feature/TSE-0002.3a-codeql-static-analysis
  ├── feature/TSE-0002.3b-semgrep-custom-rules
  ├── feature/TSE-0002.4a-gitleaks-secrets-scan
  ├── feature/TSE-0002.4b-gitleaks-precommit-hook
  ├── feature/TSE-0002.5a-npm-audit-policy
  ├── feature/TSE-0002.5b-openssf-scorecard
  ├── feature/TSE-0002.6a-semgrep-backdoor-detection
  ├── feature/TSE-0002.6b-grep-recon-workflow
  └── feature/TSE-0002.6c-outbound-allowlist-enforcement
```

### Commit Message Pattern

```bash
security(TSE-0002/hygiene): enhance .gitignore for secrets prevention
security(TSE-0002/sbom): add SBOM generation and vulnerability scanning
security(TSE-0002/sast): add CodeQL static analysis
security(TSE-0002/secrets): add Gitleaks secrets scanning
security(TSE-0002/supply-chain): add npm audit with policy enforcement
security(TSE-0002/backdoor): extend Semgrep for obfuscation detection
```

---

## Automation Commands

### Setup Commands

```bash
# Install specific phase
./.claude/plugins/security-audit/commands/setup-phase.sh --phase <phase-name>

# Install all phases
./.claude/plugins/security-audit/commands/setup-phase.sh --phase all

# Install git hooks only
./.claude/plugins/security-audit/commands/setup-hooks.sh

# Run full local audit
./.claude/plugins/security-audit/commands/run-full-audit.sh
```

### Available Phases

- `hygiene`: Phase 0 (.gitignore, CODEOWNERS, Dependabot)
- `sbom`: Phase 1 (SBOM generation, vulnerability scanning)
- `sast`: Phase 2 (CodeQL, Semgrep)
- `secrets`: Phase 3 (Gitleaks, pre-commit hooks)
- `supply-chain`: Phase 4 (npm audit, Scorecard)
- `backdoor-recon`: Phase 5 (Obfuscation detection, allowlist)
- `all`: All phases

---

## Compliance & Evidence

### Standards Covered

- **OWASP Top 10**: Injection, broken auth, sensitive data exposure, XXE, broken access control, security misconfiguration, XSS, insecure deserialization, vulnerable components, insufficient logging
- **NIST Supply Chain**: EO 14028 compliance (SBOM generation, vulnerability management)
- **SOC 2**: Security controls documentation, audit trail, access controls
- **ISO 27001**: Information security management, risk assessment, continuous monitoring

### Evidence Retention

| Artifact Type | Retention | Location |
|---------------|-----------|----------|
| SBOM | 90 days | `sbom-artifacts/sbom.spdx.json` |
| Vulnerability Scans | 30 days | `grype-results/*.json`, `osv-results/*.json` |
| Secrets Scans | 90 days | `gitleaks-report/gitleaks.json` |
| SAST Results | 30 days | `codeql-sarif/*.sarif`, `semgrep-sarif/*.sarif` |
| Scorecard | 90 days | `scorecards-sarif/results.sarif` |
| Recon Reports | 90 days | `backdoor-recon/backdoor-recon.txt` |

### Downloading Artifacts

**Via GitHub UI**:
1. Navigate to: GitHub → Actions → Select workflow run
2. Scroll to "Artifacts" section
3. Click artifact name to download

**Via GitHub CLI**:
```bash
# Download latest SBOM
RUN=$(gh run list --workflow "SBOM Build & Grype Scan" --limit 1 --json databaseId -q '.[0].databaseId')
gh run download "$RUN" -n sbom-artifacts

# Download Grype results
gh run download "$RUN" -n grype-results

# Download secrets scan
RUN=$(gh run list --workflow "Gitleaks Secrets Scan" --limit 1 --json databaseId -q '.[0].databaseId')
gh run download "$RUN" -n gitleaks-report
```

---

## Troubleshooting

### Common Issues

**Issue**: Gitleaks blocks commit with false positive
**Solution**: Add to `.gitleaks.toml` allowlist:
```toml
[allowlist]
  regexes = [
    '''test_[a-zA-Z0-9]{32}  # Test tokens'''
  ]
```

**Issue**: npm audit fails with Medium severity vulnerabilities
**Solution**: Phase 4 enforces `--audit-level=high`. Medium/Low are informational. Create exceptions for High/Critical that can't be fixed.

**Issue**: Semgrep flags legitimate base64 in tests
**Solution**: Add to `.semgrep/custom.yml`:
```yaml
paths:
  exclude:
    - "**/__tests__/**"
    - "*.test.ts"
```

**Issue**: CodeQL workflow timeout
**Solution**: Increase timeout in `.github/workflows/codeql.yml`:
```yaml
timeout-minutes: 30  # Increase from 20
```

---

## Documentation

### Security Documentation

After plugin installation, comprehensive security docs are available:

- `docs/SECURITY_SAST.md`: SAST phase documentation
- `docs/SECURITY_SECRETS.md`: Secrets scanning guide
- `docs/SECURITY_SBOM.md`: SBOM and supply chain policies
- `docs/SECURITY_BACKDOOR_RECON.md`: Phase 5 triage guide

### PR Templates

PR documentation templates for each phase:

- `docs/prs/security-epic-TSE-0002-phase-0-hygiene.md`
- `docs/prs/security-epic-TSE-0002-phase-1-inventory-and-sbom.md`
- `docs/prs/security-epic-TSE-0002-phase-2-sast.md`
- `docs/prs/security-epic-TSE-0002-phase-3-secrets-and-history.md`
- `docs/prs/security-epic-TSE-0002-phase-4-supply-chain-scan.md`
- `docs/prs/security-epic-TSE-0002-phase-5-obfuscation-backdoor-recon.md`

---

## Roadmap

**Completed**:
- ✅ Plugin foundation and metadata
- ✅ All 6 phase templates created
- ✅ Automation commands implemented
- ✅ Comprehensive documentation

**In Progress**:
- ⏳ Phase 0: Hygiene controls implementation
- ⏳ Phase 1: SBOM generation implementation
- ⏳ Phase 2: SAST implementation
- ⏳ Phase 3: Secrets scanning implementation
- ⏳ Phase 4: Supply chain security implementation
- ⏳ Phase 5: Backdoor reconnaissance implementation

**Planned**:
- Phase 6: Runtime security (RASP, WAF)
- Phase 7: Container security (Docker scanning)
- Phase 8: Infrastructure as Code security (Terraform scanning)

---

## Support

**Questions or Issues?**
- File an issue in the `risk-engine-js` repository
- Tag: `@Corprime/security`
- Label: `security`, `plugin`

**Contributing**:
- Follow the Trading Ecosystem workflow (.claude_workflow.md)
- All security changes require security team review
- Comprehensive tests required for Phase 5 allowlist utility

---

## License

Proprietary - Quantfidential Trading Ecosystem
© 2025 Quantfidential. All rights reserved.
