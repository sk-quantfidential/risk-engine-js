# SBOM and Supply Chain Security - Phases 1 & 4

**Epic**: TSE-0002 - Security Hardening and Audit Framework
**Phases**: Phase 1 (SBOM) & Phase 4 (Supply Chain)
**Status**: Template Ready

---

## Overview

Supply chain security covers SBOM generation and vulnerability scanning:
- **Phase 1**: SBOM generation with Syft, vulnerability scanning with Grype, OSV-Scanner
- **Phase 4**: npm audit policy enforcement, OpenSSF Scorecard assessment

---

## Phase 1: SBOM Generation

### What is an SBOM?

A **Software Bill of Materials (SBOM)** is a comprehensive inventory of all components in your application:
- Direct dependencies (`dependencies` in package.json)
- Transitive dependencies (dependencies of dependencies)
- Version information
- License information
- Vulnerability associations

**Why SBOMs matter**:
- ✅ Visibility into your supply chain
- ✅ Rapid vulnerability triage (Log4Shell, etc.)
- ✅ License compliance
- ✅ Regulatory requirements (EO 14028, EU Cyber Resilience Act)

---

## Tools

### Syft

**Purpose**: Generate SBOM from npm project
**Workflow**: `.github/workflows/sbom.yml`
**Output Format**: SPDX JSON (industry standard)
**Retention**: 90 days

**What it captures**:
```json
{
  "name": "risk-engine-js",
  "packages": [
    {
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",
      "licenses": ["MIT"]
    }
  ]
}
```

**Installation**:
```bash
# macOS
brew install syft

# Linux
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Verify
syft version
```

**Local Usage**:
```bash
# Generate SBOM (SPDX JSON)
syft dir:. -o spdx-json=sbom.spdx.json

# Generate SBOM (human-readable table)
syft dir:. -o table

# Generate SBOM (CycloneDX format)
syft dir:. -o cyclonedx-json=sbom.cyclonedx.json
```

---

### Grype

**Purpose**: Scan SBOM for vulnerabilities
**Workflow**: `.github/workflows/sbom.yml` (runs after Syft)
**Database**: CVE, GitHub Security Advisories, OSV
**Output**: JSON + SARIF (GitHub Code Scanning integration)

**What it detects**:
- Known vulnerabilities (CVEs)
- GitHub Security Advisories (GHSA)
- Affected version ranges
- Fix versions (if available)
- Severity scores (CVSS)

**Installation**:
```bash
# macOS
brew install grype

# Linux
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# Verify
grype version
```

**Local Usage**:
```bash
# Scan SBOM
grype sbom:sbom.spdx.json -o table

# Scan directly (without SBOM)
grype dir:.

# Generate SARIF for GitHub
grype sbom:sbom.spdx.json -o sarif=grype.sarif

# Filter by severity
grype sbom:sbom.spdx.json --fail-on high
```

**Sample Output**:
```
NAME       INSTALLED  FIXED-IN  TYPE  VULNERABILITY   SEVERITY
express    4.17.1     4.17.3    npm   CVE-2022-24999  High
lodash     4.17.19    4.17.21   npm   CVE-2021-23337  High
```

---

### OSV-Scanner

**Purpose**: Scan package-lock.json for vulnerabilities using Google's OSV database
**Workflow**: `.github/workflows/osv.yml`
**Database**: OSV (aggregates CVE, GHSA, RustSec, PyPI, etc.)
**Output**: JSON report

**What it detects**:
- All vulnerabilities in OSV database
- Transitive dependency vulnerabilities
- Ecosystem-specific advisories

**Installation**:
```bash
# Using Go
go install github.com/google/osv-scanner/cmd/osv-scanner@latest

# Or download binary from GitHub releases
```

**Local Usage**:
```bash
# Scan package-lock.json
osv-scanner --lockfile=package-lock.json

# Scan entire project
osv-scanner --recursive .

# Generate JSON report
osv-scanner --lockfile=package-lock.json --json > osv-report.json
```

---

## Phase 4: Supply Chain Security

### npm audit

**Purpose**: Enforce vulnerability policy on dependencies
**Workflow**: `.github/workflows/npm-audit.yml`
**Policy**: Fail on HIGH or CRITICAL vulnerabilities in production dependencies

**What it checks**:
- Production dependencies (`dependencies`)
- Development dependencies (`devDependencies`)
- Transitive vulnerabilities
- Available fixes

**Local Usage**:
```bash
# Run audit
npm audit

# Audit production only
npm audit --production

# Audit with high severity threshold
npm audit --audit-level=high

# Generate JSON report
npm audit --json > npm-audit.json

# Fix automatically
npm audit fix

# Fix breaking changes (use with caution)
npm audit fix --force
```

**Workflow Behavior**:
```yaml
# Fail on high/critical in production
- name: Audit production dependencies
  run: npm audit --production --audit-level=high
```

**Result**:
- ✅ **Pass**: No HIGH/CRITICAL vulnerabilities
- ❌ **Fail**: HIGH/CRITICAL vulnerabilities found (blocks PR)

---

### OpenSSF Scorecard

**Purpose**: Assess repository security best practices
**Workflow**: `.github/workflows/scorecards.yml`
**Checks**: 18+ security practices
**Output**: JSON + SARIF (GitHub Code Scanning)
**Schedule**: Weekly on Wednesday at 04:00 UTC

**What it evaluates**:

| Check | Description | Score |
|-------|-------------|-------|
| **Binary-Artifacts** | Detects binary files in repo | 0-10 |
| **Branch-Protection** | Enforces branch protection rules | 0-10 |
| **CI-Tests** | Runs tests in CI | 0-10 |
| **CII-Best-Practices** | CII badge | 0-10 |
| **Code-Review** | PRs require review | 0-10 |
| **Contributors** | Multiple contributors | 0-10 |
| **Dangerous-Workflow** | Detects dangerous GH Actions | 0-10 |
| **Dependency-Update-Tool** | Uses Dependabot/Renovate | 0-10 |
| **Fuzzing** | Implements fuzzing | 0-10 |
| **License** | Has OSI-approved license | 0-10 |
| **Maintained** | Recent commits | 0-10 |
| **Pinned-Dependencies** | Pins action versions | 0-10 |
| **SAST** | Runs static analysis | 0-10 |
| **Security-Policy** | Has SECURITY.md | 0-10 |
| **Signed-Releases** | Signs releases | 0-10 |
| **Token-Permissions** | Minimal GH token perms | 0-10 |
| **Vulnerabilities** | No known vulns | 0-10 |
| **Webhooks** | Validates webhooks | 0-10 |

**Target Score**: 7.0+ (good), 9.0+ (excellent)

**Local Usage**:
```bash
# Install Scorecard CLI
go install github.com/ossf/scorecard/v4/cmd/scorecard@latest

# Run scorecard (requires GitHub token)
export GITHUB_AUTH_TOKEN=<your_token>
scorecard --repo=github.com/owner/repo

# Generate JSON report
scorecard --repo=github.com/owner/repo --format=json > scorecard.json
```

**Improving Scorecard Score**:
- **Branch-Protection**: Enable branch protection on main
- **Code-Review**: Require PR reviews
- **Dependency-Update-Tool**: This plugin adds Dependabot (Phase 0)
- **Pinned-Dependencies**: Pin GitHub Actions to commit SHA
- **SAST**: This plugin adds CodeQL/Semgrep (Phase 2)
- **Security-Policy**: Add SECURITY.md
- **Token-Permissions**: Use `permissions: read-all` in workflows

---

## Installation

### Phase 1: SBOM

**Automated**:
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase sbom
```

**Manual**:
```bash
mkdir -p .github/workflows
cp .claude/plugins/security-audit/templates/workflows/sbom.yml .github/workflows/
cp .claude/plugins/security-audit/templates/workflows/osv.yml .github/workflows/

git add .github/workflows/sbom.yml .github/workflows/osv.yml
git commit -m "security(epic-TSE-0002-XXXX/milestone-TSE-0002.2): add SBOM workflows"
git push
```

### Phase 4: Supply Chain

**Automated**:
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase supply-chain
```

**Manual**:
```bash
mkdir -p .github/workflows
cp .claude/plugins/security-audit/templates/workflows/npm-audit.yml .github/workflows/
cp .claude/plugins/security-audit/templates/workflows/scorecards.yml .github/workflows/

git add .github/workflows/npm-audit.yml .github/workflows/scorecards.yml
git commit -m "security(epic-TSE-0002-XXXX/milestone-TSE-0002.5): add supply chain workflows"
git push
```

---

## CI/CD Workflows

### SBOM Workflow (sbom.yml)

**Triggers**:
- Push to main
- PRs to main
- Weekly on Monday at 02:00 UTC
- Manual dispatch

**Steps**:
1. Install Syft
2. Generate SBOM (SPDX JSON + Table)
3. Upload SBOM as artifact (90 days)
4. Install Grype
5. Scan SBOM for vulnerabilities
6. Upload SARIF to GitHub Code Scanning
7. Continue on error (informational)

### npm Audit Workflow (npm-audit.yml)

**Triggers**:
- Push to main
- PRs to main
- Weekly on Tuesday at 02:00 UTC

**Steps**:
1. `npm ci --ignore-scripts`
2. `npm audit --json` (full report)
3. `npm audit --production --json` (production report)
4. `npm audit --production --audit-level=high` (enforcement)

**Behavior**: Fails if HIGH/CRITICAL in production dependencies

### Scorecard Workflow (scorecards.yml)

**Triggers**:
- Push to main (branch protection changes)
- Weekly on Wednesday at 04:00 UTC

**Steps**:
1. Run Scorecard with publish_results: true
2. Upload SARIF to Code Scanning
3. Upload results to Scorecard API (optional)

**Permissions**: read-all (minimal privilege)

---

## Triage and Remediation

### Vulnerability Found in SBOM Scan

**Step 1**: Review finding in GitHub Code Scanning
- Go to: **Security → Code scanning → Alerts**
- Filter by: **Tool = Grype** or **Tool = OSV-Scanner**

**Step 2**: Assess severity
- **CRITICAL**: Fix immediately (same day)
- **HIGH**: Fix within 1 week
- **MEDIUM**: Fix within 1 month
- **LOW**: Fix opportunistically

**Step 3**: Remediation options

**Option A: Update dependency**
```bash
# Check available updates
npm outdated

# Update specific package
npm update <package-name>

# Or update to specific version
npm install <package-name>@<version>

# Verify fix
grype dir:. | grep <package-name>
```

**Option B: Update transitive dependency**
```bash
# If vulnerability is in transitive dep, update parent
npm update <parent-package>

# Or use npm overrides (package.json)
{
  "overrides": {
    "vulnerable-package": "^1.2.3"
  }
}
```

**Option C: No fix available**
- Check if vulnerability applies to your usage
- Add to risk acceptance log
- Set up monitoring for fix availability
- Consider alternative package

### npm Audit Failures

**Scenario**: CI fails with "8 high vulnerabilities"

**Step 1**: Run locally
```bash
npm audit --production
```

**Step 2**: Review output
```
lodash  <=4.17.20
Severity: high
Prototype Pollution - https://github.com/advisories/GHSA-p6mc-m468-83gw
fix available via `npm audit fix`
```

**Step 3**: Apply fix
```bash
# Try automatic fix first
npm audit fix --production

# If that doesn't work, fix manually
npm install lodash@latest

# Verify
npm audit --production
```

**Step 4**: If no fix available
```bash
# Check if vulnerability is exploitable in your context
npm audit --production --json | jq '.vulnerabilities'

# Document risk acceptance
echo "Vulnerability X accepted: not exploitable in our usage" >> SECURITY_EXCEPTIONS.md
```

---

## SBOM Use Cases

### 1. Vulnerability Response (e.g., Log4Shell)

When a new critical vulnerability is announced:
```bash
# Generate current SBOM
syft dir:. -o spdx-json=current.spdx.json

# Check if vulnerable package is present
cat current.spdx.json | jq '.packages[] | select(.name == "log4j")'

# Or use Grype with CVE filter
grype sbom:current.spdx.json | grep CVE-2021-44228
```

### 2. License Compliance

Identify all licenses in use:
```bash
syft dir:. -o json | jq '.artifacts[] | {name: .name, version: .version, licenses: .licenses}'
```

### 3. Supply Chain Audit

Track dependency changes over time:
```bash
# Generate SBOMs for two versions
git checkout v1.0.0 && syft dir:. -o spdx-json=sbom-v1.spdx.json
git checkout v2.0.0 && syft dir:. -o spdx-json=sbom-v2.spdx.json

# Compare (requires SBOM diff tool)
syft diff sbom-v1.spdx.json sbom-v2.spdx.json
```

---

## Compliance Mapping

| Compliance Standard | Requirement | Coverage |
|---------------------|-------------|----------|
| **EO 14028** | SBOM for software | ✅ Syft SPDX |
| **NIST SSDF** | PS.3.2 - Dependency Tracking | ✅ SBOM + npm audit |
| **NIST 800-53** | SA-15 - Development Process | ✅ Scorecard |
| **SOC 2** | CC7.2 - System Monitoring | ✅ Grype, npm audit |
| **ISO 27001** | A.14.2.9 - System Testing | ✅ All tools |
| **EU CRA** | Annex I - SBOM requirement | ✅ Syft SPDX |

---

## Troubleshooting

### Syft fails with "permission denied"
**Solution**: Run with Docker if native fails:
```bash
docker run --rm -v $(pwd):/src anchore/syft dir:/src -o spdx-json=/src/sbom.spdx.json
```

### Grype database update fails
**Solution**: Update manually:
```bash
grype db update
```

### npm audit fails with network errors
**Solution**: Use --registry or retry:
```bash
npm audit --registry=https://registry.npmjs.org/
```

### Scorecard requires authentication
**Solution**: Add GITHUB_TOKEN secret (auto-provided in GH Actions):
```yaml
env:
  GITHUB_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Best Practices

1. ✅ **Generate SBOMs on every release**
2. ✅ **Scan SBOMs immediately after generation**
3. ✅ **Pin dependencies** to exact versions (no ^, no ~)
4. ✅ **Review transitive dependencies** quarterly
5. ✅ **Automate dependency updates** with Dependabot
6. ✅ **Monitor Scorecard score** monthly (target: 7.0+)
7. ❌ **Never ignore HIGH/CRITICAL vulnerabilities** in production

---

## Next Steps

After Phases 1 & 4 are deployed:
1. **Generate baseline SBOM** and review all dependencies
2. **Fix any HIGH/CRITICAL vulnerabilities** within 1 week
3. **Set up Scorecard tracking** (target score: 7.0+)
4. **Schedule monthly supply chain review**
5. **Proceed to Phase 5**: Backdoor Reconnaissance

---

## References

- [Syft Documentation](https://github.com/anchore/syft)
- [Grype Documentation](https://github.com/anchore/grype)
- [OSV Database](https://osv.dev/)
- [OSV-Scanner](https://github.com/google/osv-scanner)
- [OpenSSF Scorecard](https://github.com/ossf/scorecard)
- [SPDX Specification](https://spdx.dev/)
- [NIST SSDF](https://csrc.nist.gov/publications/detail/sp/800-218/final)
- [EO 14028](https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity)

---

**Last Updated**: 2025-10-16
**Maintained By**: Security Team
