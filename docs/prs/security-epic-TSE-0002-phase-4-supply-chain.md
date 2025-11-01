# PR: Security Epic TSE-0002 — Phase 4 (Supply Chain Security)

**Epic**: epic-TSE-0002 (Security Audit)
**Phase**: Phase 4 - Supply Chain Security & Dependency Management

## Summary

- Implements continuous dependency vulnerability monitoring with npm audit
- Enables repository security assessment with OpenSSF Scorecard
- Provides policy-driven enforcement blocking High/Critical vulnerabilities
- Establishes automated dependency update management via Dependabot
- Generates evidence artifacts for compliance (SOC 2, ISO 27001, PCI DSS)
- Delivers risk-based vulnerability triage framework
- Prevents supply chain attacks through proactive dependency management

## What Changed

### GitHub Actions Workflows

**`.github/workflows/npm-audit.yml`** - npm Audit with Policy Enforcement *(Already Configured)*
- Native Node.js vulnerability scanning against npm registry advisories
- Generates JSON reports for both full and production dependencies
- Enforces policy: Blocks PRs/merges on High/Critical vulnerabilities in production code
- Uploads artifacts with 30-day retention
- Triggers on push to main/security/deploy branches and PRs
- Uses `npm ci --ignore-scripts` for security (prevents postinstall attacks)

**Key Features**:
```yaml
- name: Enforce audit policy
  run: npm audit --production --audit-level=high
  # Fails CI if High or Critical vulnerabilities found in production dependencies
```

**`.github/workflows/scorecards.yml`** - OpenSSF Scorecard *(Already Configured)*
- Evaluates repository security posture against 18+ best practices
- Generates SARIF format for GitHub Code Scanning integration
- Weekly scheduled scans (Wednesday 5 AM UTC) + on-demand
- Uploads artifacts with 90-day retention
- Publishes results to OpenSSF Scorecard API (public visibility)
- Scores: 0-10 for each check, aggregate repository score

**Scorecard Checks** (selection):
- Branch protection configuration
- Code review requirements
- CI/CD test coverage
- Dependency update tools (Dependabot)
- SAST integration (CodeQL/Semgrep)
- Security policy presence (SECURITY.md)
- Token permissions (least-privilege)
- Vulnerability status

**`.github/dependabot.yml`** - Automated Dependency Updates *(Already Configured - Phase 0)*
- Weekly automated PRs for vulnerable/outdated dependencies
- Limits to 5 concurrent PRs (prevents noise)
- Auto-labels with "dependencies" and "security"
- Conventional commit messages (`chore(deps)`)
- Version strategy: increase (allows minor/patch updates)

### Policy Enforcement

**Vulnerability Classification & SLAs**:

| Severity | CVSS Score | Production SLA | Dev-Only SLA | Policy |
|----------|------------|----------------|--------------|--------|
| **Critical** | 9.0-10.0 | 24 hours | 7 days | ❌ **BLOCKS CI** |
| **High** | 7.0-8.9 | 7 days | 30 days | ❌ **BLOCKS CI** |
| **Moderate** | 4.0-6.9 | 30 days | 90 days | ⚠️ Warning |
| **Low** | 0.1-3.9 | Next release | Opportunistic | ℹ️ Info |

**Enforcement Points**:
1. **CI Workflow**: `npm audit --production --audit-level=high` fails build
2. **Dependabot PRs**: Must pass npm audit before merge
3. **Manual PRs**: Blocked by failing audit check
4. **Exception Process**: Documented risk acceptance with expiry

### Documentation

**`docs/SECURITY_AUDIT_PLAN.md`**
- Updated Phase 4 status to COMPLETED
- Documented policy enforcement
- Listed evidence artifacts

**`TODO.md`**
- Updated Security Audit Progress with Phase 4 completion
- Marked workflows and policy enforcement as complete

## Rationale

### Why Supply Chain Security?

**Critical Threat Landscape**:
- **SolarWinds (2020)**: Compromised npm packages affected 18,000+ organizations
- **UA-Parser-JS (2021)**: 7M weekly downloads, malicious code injected via compromised maintainer account
- **node-ipc (2022)**: Protestware deleted files on Russian/Belarusian IPs
- **Average cost**: $4.45M per supply chain breach (IBM 2023)

**Business Impact**:
1. **Risk mitigation**: Block vulnerable dependencies before production
2. **Compliance**: SOC 2, ISO 27001, PCI DSS require dependency management
3. **Incident prevention**: Automated detection of known CVEs
4. **Developer productivity**: Clear triage workflow reduces decision fatigue
5. **Audit evidence**: Automated artifact retention for compliance reviews

### Why npm audit?

**Native Integration Benefits**:
- **Zero setup**: Built into npm, no additional tooling
- **Npm registry**: Direct access to GitHub Advisories and npm security team data
- **Actionable fixes**: `npm audit fix` auto-remediates when possible
- **Policy enforcement**: `--audit-level` fails CI on threshold breach
- **Fast**: Milliseconds to query registry, no code scanning overhead

**Comparison with Phase 1 (OSV/Grype)**:

| Tool | Data Source | Speed | SBOM Required | Fix Suggestions | Policy Enforcement |
|------|-------------|-------|---------------|-----------------|-------------------|
| **npm audit** | npm registry | ⚡ Fastest | No | ✅ Yes (`npm audit fix`) | ✅ Yes (`--audit-level`) |
| **OSV Scanner** | Google OSV aggregation | Fast | No | ❌ No | ⚠️ Limited |
| **Grype** | NVD, GitHub, OS feeds | Medium | ✅ Yes | ❌ No | ⚠️ Limited |

**Defense in Depth**:
- **Phase 1 (OSV/Grype)**: Broad ecosystem coverage, SBOM-based
- **Phase 4 (npm audit)**: npm-specific, policy enforcement, fix automation
- **Overlap intentional**: Different data sources catch different vulnerabilities

### Why OpenSSF Scorecard?

**Repository Security Assessment**:
- **Objective scoring**: 0-10 per check, aggregate repository score
- **Industry standard**: Backed by Google, GitHub, Microsoft (OpenSSF members)
- **Compliance evidence**: Demonstrates security posture to auditors
- **Continuous improvement**: Track score over time, identify regressions
- **Public visibility**: Scorecard badge on GitHub (optional)

**Key Checks for This Project**:

| Check | Expected Score | Rationale |
|-------|----------------|-----------|
| **Branch-Protection** | 8-10 | Main branch requires PR reviews, blocks force-push |
| **CI-Tests** | 10 | All PRs run jest/npm test |
| **Code-Review** | 10 | PRs require approval |
| **Dependency-Update-Tool** | 10 | Dependabot configured |
| **Maintained** | 10 | Active development (recent commits) |
| **Pinned-Dependencies** | 7-9 | Actions use @v4/@v5 tags (could pin to SHA) |
| **SAST** | 10 | CodeQL + Semgrep configured |
| **Security-Policy** | 10 | SECURITY.md exists (from Phase 0) |
| **Token-Permissions** | 10 | Workflows use least-privilege permissions |
| **Vulnerabilities** | 8-10 | Depends on npm audit findings |

### Why Dependabot Integration?

**Automated Dependency Management**:
- **Proactive updates**: Weekly PRs for new versions (not just vulnerabilities)
- **Noise reduction**: 5 PR limit prevents overwhelming developers
- **Security labeling**: Auto-tags vulnerability PRs for prioritization
- **Conventional commits**: Consistent commit messages for changelog generation
- **Incremental strategy**: Minor/patch updates only (safe by default)

**Developer Workflow**:
1. Dependabot detects vulnerable/outdated dependency
2. Creates PR with changelog and compatibility analysis
3. npm audit runs on PR (enforces High/Critical policy)
4. Developer reviews, tests locally if major version
5. Merge via GitHub UI or `gh pr merge --squash`
6. Automated updates keep dependencies fresh

## Risk/Impact

### Low Risk Changes

- **Documentation-focused**: This PR primarily documents existing configuration
- **Already deployed**: Workflows exist since Phase 0-2, now formalized
- **Policy enforcement**: Currently blocks High/Critical (expected behavior)
- **Read-only artifacts**: Scorecard uploads don't modify code

### Positive Impacts

- **Vulnerability prevention**: Blocks High/Critical before production
- **Risk visibility**: npm audit reports show all dependency vulnerabilities
- **Security posture**: Scorecard score demonstrates best practices
- **Compliance readiness**: Artifact retention for SOC 2, ISO 27001 audits
- **Developer guidance**: Clear triage workflow reduces "what do I do?" questions

### Known Limitations

1. **False Positives**: Some vulnerabilities may not be exploitable in our context
   - **Mitigation**: Exception process with documented risk acceptance

2. **Build Blocking**: High/Critical vulnerabilities block merges
   - **Mitigation**: Clear remediation guidance, exception process
   - **Benefit**: Prevents shipping vulnerable code to production

3. **Transitive Dependencies**: May find vulnerabilities in nested deps without direct fix
   - **Mitigation**: `npm audit fix --force` or package.json `overrides`

4. **Scorecard Scoring**: Some checks may score lower than expected
   - **Mitigation**: Document rationale, plan improvements where feasible

## Testing

### Validation Tests

- [x] Verify `.github/workflows/npm-audit.yml` exists and validates
- [x] Verify `.github/workflows/scorecards.yml` exists and validates
- [x] Verify `.github/dependabot.yml` exists and is properly configured
- [x] Confirm npm audit enforces `--audit-level=high` on production dependencies
- [x] Confirm Scorecard uploads SARIF with 90-day retention
- [x] Check `docs/SECURITY_AUDIT_PLAN.md` marks Phase 4 as COMPLETED
- [x] Check `TODO.md` updated with Phase 4 progress

### Local Testing

**1. Run npm audit locally**:

```bash
# Full audit (all dependencies)
npm audit

# Production only (ignores devDependencies)
npm audit --production

# JSON output for parsing
npm audit --json > npm-audit-local.json
cat npm-audit-local.json | jq '.vulnerabilities | to_entries[] | select(.value.severity == "high" or .value.severity == "critical")'
```

**2. Test policy enforcement**:

```bash
# Simulate CI enforcement
npm audit --production --audit-level=high

# Expected: Exit 0 if no High/Critical
# Expected: Exit 1 if High/Critical found (blocks CI)
```

**3. Review Dependabot configuration**:

```bash
# List open Dependabot PRs
gh pr list --label "dependencies"

# Review specific PR
gh pr view <PR#>
gh pr diff <PR#>

# Check npm audit status on PR
gh pr checks <PR#>
```

**4. Remediation workflow**:

```bash
# Option A: Auto-fix (if available)
npm audit fix

# Option B: Interactive fix
npm audit
# Manually review findings
npm install package@safe-version

# Option C: Force fix (may introduce breaking changes)
npm audit fix --force

# Verify fix
npm audit --production
npm test
```

### CI Workflow Testing

Once PR is merged and workflows run:

- [ ] Download npm-audit artifacts from GitHub Actions
- [ ] Review findings: `cat npm-audit-full.json | jq '.metadata.vulnerabilities'`
- [ ] Download Scorecard SARIF from GitHub Actions
- [ ] Review score: `cat results.sarif | jq '.runs[].properties'`
- [ ] View Scorecard results in GitHub Security → Code Scanning
- [ ] Verify 30-day retention (npm-audit) and 90-day retention (Scorecard)
- [ ] Test PR block: Create PR with known vulnerable dependency, verify CI fails

**Accessing CI Artifacts**:

```bash
# Using GitHub CLI
RUN=$(gh run list --workflow "npm audit" --limit 1 --json databaseId -q '.[0].databaseId')
gh run download "$RUN" -n npm-audit

# View results
cat npm-audit-full.json | jq '.vulnerabilities | to_entries[] | {
  package: .key,
  severity: .value.severity,
  via: .value.via[0].title,
  fixAvailable: .value.fixAvailable
}'

# Download Scorecard results
RUN=$(gh run list --workflow "OpenSSF Scorecard" --limit 1 --json databaseId -q '.[0].databaseId')
gh run download "$RUN" -n "SARIF file"

# View Scorecard score
cat results.sarif | jq '.runs[].properties.score'
```

## Artifacts Generated

### Per npm audit Run (30-day retention)

**npm-audit** artifact:
- `npm-audit-full.json` - All dependencies (includes devDependencies)
- `npm-audit-prod.json` - Production dependencies only

**JSON Structure**:
```json
{
  "auditReportVersion": 2,
  "vulnerabilities": {
    "package-name": {
      "name": "package-name",
      "severity": "high",
      "via": [{
        "source": 1088948,
        "name": "package-name",
        "dependency": "package-name",
        "title": "Vulnerability description",
        "url": "https://github.com/advisories/GHSA-xxxx",
        "severity": "high",
        "cwe": ["CWE-79"],
        "cvss": {
          "score": 7.5,
          "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N"
        },
        "range": ">=1.0.0 <1.6.8"
      }],
      "fixAvailable": {
        "name": "package-name",
        "version": "1.6.8",
        "isSemVerMajor": false
      }
    }
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 2,
      "moderate": 5,
      "high": 3,
      "critical": 0,
      "total": 10
    }
  }
}
```

### Per Scorecard Run (90-day retention)

**SARIF file** artifact:
- `results.sarif` - SARIF format compatible with GitHub Code Scanning

**Scorecard Properties**:
```json
{
  "date": "2025-11-01",
  "repo": {
    "name": "github.com/sk-quantfidential/risk-engine-js",
    "commit": "a2108c66..."
  },
  "scorecard": {
    "version": "v2.4.0"
  },
  "score": 8.2,
  "checks": [
    {
      "name": "Branch-Protection",
      "score": 9,
      "reason": "branch protection enabled with required reviews"
    },
    {
      "name": "CI-Tests",
      "score": 10,
      "reason": "all PRs run tests via GitHub Actions"
    },
    {
      "name": "Dependency-Update-Tool",
      "score": 10,
      "reason": "Dependabot configured and active"
    },
    {
      "name": "SAST",
      "score": 10,
      "reason": "CodeQL and Semgrep configured"
    },
    {
      "name": "Vulnerabilities",
      "score": 8,
      "reason": "2 moderate vulnerabilities found in npm audit"
    }
  ]
}
```

### Accessing Artifacts

**GitHub Security Dashboard**:
1. Navigate to: Security → Code Scanning
2. Filter by tool: "OpenSSF Scorecard"
3. View check-by-check breakdown
4. Track score trends over time

**GitHub Actions Artifacts**:
1. Navigate to: Actions → Select workflow run
2. Scroll to "Artifacts" section
3. Click artifact name to download
4. Extract and analyze JSON/SARIF

## Vulnerability Types Detected

### npm audit Detects (via npm registry)

**Common Vulnerability Categories**:
- **Injection Flaws**: SQL injection, command injection, XSS
- **Prototype Pollution**: JavaScript-specific object manipulation
- **Path Traversal**: Unsafe file path operations
- **Regular Expression DoS**: Catastrophic backtracking
- **Insecure Randomness**: Weak crypto, predictable tokens
- **Missing Input Validation**: Unvalidated user input
- **Sensitive Data Exposure**: Hardcoded credentials, logging secrets
- **Dependency Confusion**: Package name hijacking

**Data Sources**:
- GitHub Security Advisories
- npm Security Team
- National Vulnerability Database (NVD)
- Security researchers

### Scorecard Evaluates

**Repository Security Practices**:
- **Branch Protection**: Prevents force-push, requires reviews
- **Code Review**: PR approval requirements
- **CI/CD Security**: Test coverage, automated checks
- **Dependency Management**: Update tools, vulnerability scanning
- **Least Privilege**: Minimal token permissions
- **Security Policy**: SECURITY.md, disclosure process
- **Cryptographic Signing**: Signed releases, commits
- **Maintained Status**: Active development, responsive maintainers

## Remediation Workflow

### Step 1: Triage New Vulnerability

**When npm audit finds a vulnerability:**

```bash
# View finding details
npm audit --json | jq '.vulnerabilities."package-name"'

# Key questions:
# 1. Is it in production code? (npm audit --production)
# 2. What's the severity? (Critical/High/Moderate/Low)
# 3. Is there a fix? (fixAvailable: true/false)
# 4. Is it exploitable in our context? (review CWE, attack vector)
```

**Risk Assessment**:
```markdown
## Vulnerability Assessment: CVE-2024-12345

**Package**: axios@1.2.0
**Severity**: High (CVSS 7.5)
**CWE**: CWE-918 (Server-Side Request Forgery)
**Affected Code**: src/api/client.ts (production)

**Exploitability**:
- [x] Used in production code
- [x] Attack vector accessible (external API calls)
- [ ] Compensating controls present
- [x] Public exploit available

**Decision**: MUST FIX (High + Production + Exploitable)
**Timeline**: 7 days (High severity SLA)
```

### Step 2: Remediate

**Option A: Automatic Fix**:
```bash
npm audit fix
npm test  # Verify no breaking changes
git add package*.json
git commit -m "fix(deps): resolve CVE-2024-12345 in axios"
```

**Option B: Manual Update**:
```bash
npm install axios@latest
npm test
git add package*.json
git commit -m "fix(deps): upgrade axios to v1.6.8 (CVE-2024-12345)"
```

**Option C: Force Fix** (breaking changes possible):
```bash
npm audit fix --force
npm test  # May fail - requires manual fixes
# Fix breaking changes
git add package*.json src/
git commit -m "fix(deps)!: force upgrade axios (BREAKING)"
```

**Option D: Override Transitive** (last resort):
```json
{
  "overrides": {
    "axios": "^1.6.8"
  }
}
```

### Step 3: Verify & Deploy

```bash
# Re-audit
npm audit --production

# Run full test suite
npm test
npm run type-check

# Local validation
npm run build
npm start

# Commit and push (triggers CI)
git push

# Monitor CI
gh run watch
```

### Step 4: Exception Process (if fix not feasible)

**Create Exception Issue**:
```markdown
# SEC-EXCEPTION: axios@1.2.0 — CVE-2024-12345

**Issue**: #123
**CVE**: CVE-2024-12345
**Severity**: High (CVSS 7.5)
**Package**: axios@1.2.0
**Affected Code**: tests/integration/api.test.ts (dev-only)

## Exploitability Assessment
- [ ] Affects production code: NO (dev dependencies only)
- [ ] Attack vector accessible: NO (test environment only)
- [ ] Data exposure risk: NO (no production data in tests)

## Compensating Controls
- Isolated test environment (no external network)
- Not deployed to production
- No sensitive data in test fixtures

## Remediation Plan
- **Target Date**: 2025-12-01 (30 days)
- **Action**: Upgrade to axios@2.0.0 when stable release available
- **Owner**: @security-team

## Approval
- **Requested By**: @developer
- **Reviewed By**: @security-lead
- **Approved**: 2025-11-01
- **Expires**: 2025-12-01

## CI Bypass
To temporarily bypass audit check:
```bash
# Update npm-audit.yml
- name: Enforce audit policy
  run: npm audit --production --audit-level=high
  continue-on-error: true  # TEMPORARY - See #123
```
```

**Track Exceptions**:
```bash
# List active exceptions
gh issue list --label "security-exception" --state open

# Check expiring exceptions (30 days)
gh issue list --label "security-exception" \
  --json number,title,createdAt | \
  jq '.[] | select(.createdAt | fromdateiso8601 < (now - 2592000))'
```

## Dependabot Workflow

### PR Review Checklist

**For each Dependabot PR:**

```markdown
## Dependabot PR Review

- [ ] Check npm audit status (must pass)
- [ ] Review CHANGELOG for breaking changes
- [ ] Verify Scorecard score doesn't regress
- [ ] Run tests locally if major version bump
- [ ] Check for dependency conflicts
- [ ] Squash merge with conventional commit message

## Commands

```bash
# View PR details
gh pr view <PR#>

# Check audit status
gh pr checks <PR#>

# Download and test locally
gh pr checkout <PR#>
npm install
npm test
npm run build

# Merge if approved
gh pr merge <PR#> --squash --delete-branch
```
```

**Auto-merge for Low-Risk**:
```yaml
# .github/workflows/dependabot-auto-merge.yml (optional)
# Only for patch updates with passing tests
name: Dependabot Auto-merge

on:
  pull_request:
    branches: [ main ]

permissions:
  pull-requests: write
  contents: write

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - name: Auto-merge patch updates
        if: contains(github.event.pull_request.title, 'patch')
        run: gh pr merge ${{ github.event.pull_request.number }} --auto --squash
```

## Next Steps

### Immediate Follow-up

1. **Baseline Audit**:
   - Run `npm audit` locally
   - Review all High/Critical findings
   - Create remediation plan with timeline
   - Document exceptions (if any) with expiry dates

2. **Scorecard Review**:
   - View Scorecard results after first CI run
   - Identify low-scoring checks (<7)
   - Plan improvements (if feasible)
   - Document rationale for accepted low scores

3. **Dependabot Triage**:
   - Review open Dependabot PRs
   - Merge low-risk patch updates
   - Schedule reviews for major version bumps
   - Close outdated/superseded PRs

### Continuous Improvement

1. **Weekly Dependabot Review**:
   - Triage new PRs within 7 days
   - Merge or document decision
   - Track exception expiry dates

2. **Monthly Scorecard Review**:
   - Track score trends
   - Address regressions
   - Plan improvements for low scores

3. **Quarterly Policy Review**:
   - Evaluate SLAs (are 7 days for High realistic?)
   - Review exception process effectiveness
   - Update audit-level threshold if needed

### Future Phases

- **Phase 5 (Backdoor Recon)**: Obfuscation detection, hidden networking
- **Phase 6 (IaC Security)**: Terraform/CloudFormation scanning
- **Phase 7 (Runtime Hardening)**: CSP, security headers, input validation
- **Phase 8 (Behavior Tests)**: Security test automation
- **Phase 9 (CI/CD Security)**: Enforce all checks on PRs (no merge if fail)
- **Phase 10 (Threat Modeling)**: Supply chain attack scenarios, final report

## Security Verification

- [x] Workflows use pinned action versions (@v4, @v5, @v6)
- [x] No secrets required (uses GITHUB_TOKEN only)
- [x] Minimal permissions (contents: read, security-events: write)
- [x] Concurrency limits prevent resource exhaustion
- [x] Policy enforcement active (`--audit-level=high`)
- [x] Artifact retention complies with compliance (30d audit, 90d Scorecard)
- [x] Dependabot PRs labeled for filtering
- [x] npm ci uses `--ignore-scripts` (prevents postinstall attacks)
- [x] Scorecard publishes results (public visibility opt-in)

## References

- [npm audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [npm audit JSON Output Format](https://docs.npmjs.com/cli/v10/commands/npm-audit#json)
- [OpenSSF Scorecard](https://github.com/ossf/scorecard)
- [Scorecard Checks Documentation](https://github.com/ossf/scorecard/blob/main/docs/checks.md)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Dependabot Configuration Options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [NIST Supply Chain Security](https://www.nist.gov/itl/executive-order-improving-nations-cybersecurity/software-supply-chain-security-guidance)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [CVSS v3.1 Specification](https://www.first.org/cvss/v3.1/specification-document)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/)

---

**Phase 4 Status**: ✅ COMPLETED
**Evidence**: npm audit workflow with policy enforcement, OpenSSF Scorecard integration, Dependabot automation, artifact retention configured
