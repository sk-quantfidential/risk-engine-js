# Security Audit Plugin - Documentation Overview

**Epic**: TSE-0002 - Security Hardening and Audit Framework
**Plugin ID**: risk-engine-js-security-audit
**Version**: 1.0.0
**Last Updated**: 2025-10-16

---

## Overview

This security audit plugin implements a **6-phase progressive security hardening framework** for the Risk Engine JS project, following industry best practices and compliance standards.

**Security Philosophy**:
- **Defense in Depth**: Multiple overlapping security controls
- **Shift Left**: Detect issues early in development
- **Automation**: CI/CD integration for continuous monitoring
- **Transparency**: All findings visible in GitHub Code Scanning

---

## Phase Summary

| Phase | Focus | Tools | Status |
|-------|-------|-------|--------|
| **Phase 0** | Hygiene | .gitignore, CODEOWNERS, Dependabot | ✅ Template |
| **Phase 1** | SBOM | Syft, Grype, OSV-Scanner | ✅ Template |
| **Phase 2** | SAST | CodeQL, Semgrep | ✅ Template |
| **Phase 3** | Secrets | Gitleaks | ✅ Template |
| **Phase 4** | Supply Chain | npm audit, Scorecard | ✅ Template |
| **Phase 5** | Backdoor Recon | Extended Semgrep, grep, allowlist | ✅ Template |

---

## Quick Start

### 1. Install All Phases (Recommended)
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase all
```

### 2. Install Specific Phase
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase <phase-name>

# Available phases:
# hygiene, sbom, sast, secrets, supply-chain, backdoor-recon
```

### 3. Run Local Security Audit
```bash
./claude/plugins/security-audit/commands/run-full-audit.sh
```

### 4. Review Generated Report
```bash
cat security-audit-reports/full-audit-<timestamp>.txt
```

---

## Phase Guides

### Phase 0: Hygiene
**Purpose**: Basic security hygiene and process controls
**Documentation**: README.md (Installation section)
**What it installs**:
- `.gitignore` security patterns
- `.github/CODEOWNERS` for security reviews
- `.github/dependabot.yml` for automated updates

**Next Steps**: Review CODEOWNERS team assignments

---

### Phase 1: SBOM Generation
**Purpose**: Software Bill of Materials and vulnerability scanning
**Documentation**: [SECURITY_SBOM.md](./SECURITY_SBOM.md)
**What it installs**:
- `.github/workflows/sbom.yml` - Syft + Grype
- `.github/workflows/osv.yml` - OSV-Scanner

**Key Workflows**:
- Generate SBOM (SPDX format)
- Scan for known vulnerabilities
- Upload to GitHub Code Scanning

**Next Steps**: Review SBOM, triage vulnerabilities

---

### Phase 2: SAST (Static Application Security Testing)
**Purpose**: Semantic and pattern-based code analysis
**Documentation**: [SECURITY_SAST.md](./SECURITY_SAST.md)
**What it installs**:
- `.github/workflows/codeql.yml` - CodeQL semantic analysis
- `.github/workflows/semgrep.yml` - Semgrep pattern analysis
- `.semgrep/custom.yml` - Custom security rules

**Key Workflows**:
- CodeQL: Deep data flow analysis
- Semgrep: Fast pattern matching + custom rules

**Next Steps**: Triage ERROR findings, tune custom rules

---

### Phase 3: Secrets Scanning
**Purpose**: Prevent credential leaks
**Documentation**: [SECURITY_SECRETS.md](./SECURITY_SECRETS.md)
**What it installs**:
- `.github/workflows/gitleaks.yml` - Full history scan
- `.gitleaks.toml` - Configuration with allowlist
- `.git/hooks/pre-commit` - Pre-commit hook

**Key Workflows**:
- Pre-commit: Block secrets before commit
- CI/CD: Scan full Git history
- Allowlist: Configure false positives

**Next Steps**: Install pre-commit hook, rotate any detected secrets

---

### Phase 4: Supply Chain Security
**Purpose**: Dependency vulnerability and repository security assessment
**Documentation**: [SECURITY_SBOM.md](./SECURITY_SBOM.md) (Phase 4 section)
**What it installs**:
- `.github/workflows/npm-audit.yml` - npm audit policy
- `.github/workflows/scorecards.yml` - OpenSSF Scorecard

**Key Workflows**:
- npm audit: Enforce HIGH/CRITICAL threshold
- Scorecard: 18+ repository security checks

**Next Steps**: Fix HIGH/CRITICAL vulnerabilities, improve Scorecard score

---

### Phase 5: Backdoor Reconnaissance
**Purpose**: Detect malicious code and supply chain attacks
**Documentation**: [SECURITY_BACKDOOR_RECON.md](./SECURITY_BACKDOOR_RECON.md)
**What it installs**:
- `.github/workflows/backdoor-recon.yml` - Grep recon
- `.semgrep/custom.yml` - Extended rules (appends to Phase 2)
- `infrastructure/security/outbound-allowlist.ts` - Runtime enforcement
- `infrastructure/security/__tests__/outbound-allowlist.test.ts` - Tests

**Key Workflows**:
- Detect obfuscation (eval, base64, unicode)
- Detect hidden networking (WebSocket, fetch)
- Runtime allowlist enforcement

**Next Steps**: Triage findings, configure outbound allowlist

---

## Security Findings Workflow

### 1. Where to Find Findings

**GitHub Code Scanning** (Primary):
- Navigate to: **Security → Code scanning → Alerts**
- Filter by tool: CodeQL, Semgrep, Grype, Scorecard
- Filter by severity: Error, Warning, Note

**Workflow Logs** (Secondary):
- Go to: **Actions → Select workflow → View logs**
- Review console output for findings

**Artifacts** (Reports):
- Go to: **Actions → Select workflow → Artifacts**
- Download JSON/SARIF reports for offline analysis

---

### 2. Triage Process

**Step 1: Classify by Severity**
- **ERROR/CRITICAL**: Fix immediately (same day)
- **WARNING/HIGH**: Fix within 1 week
- **NOTE/MEDIUM**: Fix within 1 month
- **INFO/LOW**: Fix opportunistically

**Step 2: Assess Impact**
- Is this exploitable in our context?
- What data/systems are at risk?
- Is there an available fix?

**Step 3: Remediate**
- **Fix**: Update dependency, patch code, remove vulnerability
- **Suppress**: Add to allowlist with justification (false positives only)
- **Accept Risk**: Document in SECURITY_EXCEPTIONS.md (no fix available)

---

### 3. Remediation Strategies

#### For SAST Findings (CodeQL, Semgrep):
```javascript
// Option 1: Fix the code
// Before: eval(userInput)
// After:  JSON.parse(userInput)

// Option 2: Suppress false positive
// nosemgrep: rule-id
const legitUseCase = ...;
```

#### For Dependency Vulnerabilities (Grype, npm audit):
```bash
# Option 1: Update dependency
npm update <package-name>

# Option 2: Use overrides (transitive deps)
# package.json:
{
  "overrides": {
    "vulnerable-package": "^1.2.3"
  }
}

# Option 3: Accept risk if no fix available
# Document in SECURITY_EXCEPTIONS.md
```

#### For Secrets (Gitleaks):
```bash
# Option 1: Remove secret
# Replace with environment variable

# Option 2: Allowlist false positive
# .gitleaks.toml:
regexes = [
  '''test_api_key_placeholder''',
]

# Option 3: Rotate if leaked
# If pushed to remote, rotate credential immediately
```

---

## Local Development Workflow

### Daily Development
```bash
# Before commit: Gitleaks pre-commit hook runs automatically
git commit -m "feat: add feature"
# → Hook scans staged files, blocks if secrets found

# Manual pre-commit scan
gitleaks protect --staged --no-banner
```

### Before PR
```bash
# Run full local audit
./claude/plugins/security-audit/commands/run-full-audit.sh

# Review report
cat security-audit-reports/full-audit-*.txt

# Fix any HIGH/CRITICAL findings before pushing
```

### Weekly Review
```bash
# Check workflow status
gh run list --workflow=semgrep.yml --limit 5
gh run list --workflow=gitleaks.yml --limit 5

# Review Code Scanning alerts
gh api repos/:owner/:repo/code-scanning/alerts --jq '.[] | select(.state == "open")'
```

---

## CI/CD Integration

### Workflow Schedule

| Workflow | Trigger | Schedule | Enforcement |
|----------|---------|----------|-------------|
| **SBOM** | Push, PR, Schedule | Mon 02:00 UTC | Informational |
| **OSV** | Push, PR, Schedule | Mon 02:30 UTC | Informational |
| **CodeQL** | Push, PR, Schedule | Mon 04:00 UTC | Informational |
| **Semgrep** | Push, PR, Schedule | Tue 03:00 UTC | Informational |
| **Gitleaks** | Push, PR, Schedule | Sun 03:00 UTC | **Blocking** |
| **npm audit** | Push, PR, Schedule | Tue 02:00 UTC | **Blocking** |
| **Scorecard** | Push, Schedule | Wed 04:00 UTC | Informational |
| **Backdoor** | Push, PR, Schedule | Thu 04:00 UTC | Informational |

**Enforcement Modes**:
- **Informational** (`continue-on-error: true`): Findings logged, does not block PR
- **Blocking** (`continue-on-error: false`): Fails workflow, blocks PR merge

**Recommendation**: Start with informational mode, switch to blocking after baseline cleanup.

---

### Branch Protection

To enforce security checks before merge:
1. Go to **Settings → Branches → Branch protection rules**
2. Enable **Require status checks to pass before merging**
3. Select required checks:
   - ✅ `Gitleaks` (REQUIRED)
   - ✅ `npm-audit / audit-production` (REQUIRED)
   - ⚠️ `CodeQL` (RECOMMENDED)
   - ⚠️ `Semgrep` (RECOMMENDED)

---

## Compliance Mapping

| Standard | Requirement | Phases Covering |
|----------|-------------|-----------------|
| **OWASP Top 10** | A03: Injection | Phase 2 (SAST) |
| **OWASP Top 10** | A06: Vulnerable Components | Phase 1, 4 (SBOM, npm audit) |
| **NIST SSDF** | PO.3.2: Dependency Tracking | Phase 1 (SBOM) |
| **NIST SSDF** | PW.7.1: Code Review | Phase 2 (SAST) |
| **NIST 800-53** | SA-11: Developer Security Testing | All phases |
| **NIST 800-161** | Supply Chain Risk Management | Phase 4, 5 |
| **SOC 2** | CC7.1: System Monitoring | All phases |
| **SOC 2** | CC7.2: Threat Detection | Phase 5 (Backdoor) |
| **ISO 27001** | A.14.2.5: Secure Development | All phases |
| **PCI-DSS** | 6.5: Secure Coding | Phase 2 (SAST) |
| **EO 14028** | SBOM Requirement | Phase 1 (Syft SPDX) |
| **EU CRA** | Annex I: SBOM | Phase 1 (Syft SPDX) |

---

## Metrics Dashboard

### Key Metrics to Track

**Vulnerability Metrics**:
- Total open vulnerabilities (by severity)
- New vulnerabilities introduced (per sprint)
- Mean time to remediation (MTTR)
- Vulnerability density (per 1000 LOC)

**Process Metrics**:
- Pre-commit hook block rate
- False positive rate (suppressions / total findings)
- Security workflow success rate
- Scorecard score trend

**Supply Chain Metrics**:
- Direct dependency count
- Transitive dependency count
- Outdated dependency count
- High-risk package count (Scorecard < 5.0)

---

### Monthly Report Template

```bash
# 1. Vulnerability Summary
gh api repos/:owner/:repo/code-scanning/alerts --jq 'group_by(.rule.severity) | map({severity: .[0].rule.severity, count: length})'

# 2. Workflow Status
gh run list --workflow=semgrep.yml --created "$(date -d '30 days ago' +%Y-%m-%d).." --json conclusion | jq 'group_by(.conclusion) | map({conclusion: .[0].conclusion, count: length})'

# 3. Secret Leaks Prevented
gh run list --workflow=gitleaks.yml --status failure --created "$(date -d '30 days ago' +%Y-%m-%d).." | wc -l

# 4. Dependency Health
npm outdated | wc -l  # Outdated count

# 5. Scorecard Score
# View in GitHub Code Scanning or Scorecard API
```

---

## Troubleshooting

### Common Issues

**Issue**: Gitleaks pre-commit hook not running
**Solution**: Reinstall hook
```bash
./claude/plugins/security-audit/commands/install-gitleaks-hook.sh
chmod +x .git/hooks/pre-commit
```

**Issue**: Semgrep finds too many false positives
**Solution**: Tune rules in `.semgrep/custom.yml`
```yaml
paths:
  exclude:
    - "**/test/**"
    - "**/build/**"
```

**Issue**: npm audit fails with unfixable vulnerabilities
**Solution**: Use overrides or document risk acceptance
```json
{
  "overrides": {
    "vulnerable-package": "^safe-version"
  }
}
```

**Issue**: Scorecard score is low
**Solution**: Implement missing controls
- Enable branch protection
- Add SECURITY.md
- Pin GitHub Actions to commit SHA

---

## Security Contact

**For security vulnerabilities**:
- Email: security@quantfidential.com
- Issue Tracker: [GitHub Security Advisories](https://github.com/owner/repo/security/advisories)

**For false positives or configuration help**:
- Team: @security-team (GitHub)
- Slack: #security-alerts

---

## References

### Tool Documentation
- [CodeQL](https://codeql.github.com/docs/)
- [Semgrep](https://semgrep.dev/docs/)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [Syft](https://github.com/anchore/syft)
- [Grype](https://github.com/anchore/grype)
- [OSV-Scanner](https://github.com/google/osv-scanner)
- [OpenSSF Scorecard](https://github.com/ossf/scorecard)

### Standards and Guidelines
- [OWASP Top 10](https://owasp.org/Top10/)
- [NIST SSDF](https://csrc.nist.gov/publications/detail/sp/800-218/final)
- [NIST 800-161r1](https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final)
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)

### Phase-Specific Documentation
- [Phase 1 & 4: SBOM and Supply Chain](./SECURITY_SBOM.md)
- [Phase 2: SAST](./SECURITY_SAST.md)
- [Phase 3: Secrets Scanning](./SECURITY_SECRETS.md)
- [Phase 5: Backdoor Reconnaissance](./SECURITY_BACKDOOR_RECON.md)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-16
**Maintained By**: Security Team
**Review Cycle**: Quarterly
