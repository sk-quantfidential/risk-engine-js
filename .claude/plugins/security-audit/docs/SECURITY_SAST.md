# SAST (Static Application Security Testing) - Phase 2

**Epic**: TSE-0002 - Security Hardening and Audit Framework
**Phase**: Phase 2 - SAST
**Status**: Template Ready

---

## Overview

Phase 2 implements Static Application Security Testing (SAST) using two complementary tools:
- **CodeQL**: Semantic analysis that understands code structure and data flow
- **Semgrep**: Fast pattern-based analysis with custom rule support

Both tools integrate with GitHub Code Scanning and produce SARIF results.

---

## Tools

### CodeQL

**Purpose**: Deep semantic analysis for JavaScript/TypeScript
**Workflow**: `.github/workflows/codeql.yml`
**Query Suite**: `security-and-quality`
**Schedule**: Weekly on Monday at 04:00 UTC
**Triggers**: Push to main, PRs to main, manual dispatch

**What it detects**:
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Command injection
- Path traversal
- Insecure randomness
- Authentication bypasses
- Information disclosure
- Data flow issues (taint analysis)

**Configuration**:
```yaml
languages: ['javascript']
queries: security-and-quality
paths-ignore:
  - '**/node_modules/**'
  - '**/dist/**'
  - '**/__tests__/**'
  - '**/test/**'
  - '*.config.js'
  - '*.config.ts'
```

**SARIF Output**: Uploaded to GitHub Code Scanning
**Retention**: 90 days

---

### Semgrep

**Purpose**: Fast pattern-based security scanning with custom rules
**Workflow**: `.github/workflows/semgrep.yml`
**Rulesets**:
- `p/ci`: CI/CD-optimized high-confidence rules
- `p/javascript`: JavaScript/TypeScript security patterns
- `p/owasp-top-ten`: OWASP Top 10 vulnerabilities
- `.semgrep/custom.yml`: Project-specific custom rules

**Schedule**: Push to main, PRs to main, weekly on Tuesday at 03:00 UTC

**Custom Rules** (`.semgrep/custom.yml`):

1. **no-eval-new-function** (ERROR)
   - Detects: `eval()`, `new Function()`, `Function()`
   - Severity: ERROR
   - Why: Code execution vectors, potential RCE

2. **no-node-exec-primitives** (WARNING)
   - Detects: `child_process.exec()`, `child_process.execSync()`
   - Severity: WARNING
   - Why: Command injection risk

3. **disallow-external-fetch-hosts** (WARNING)
   - Detects: `fetch()` calls without allowlist enforcement
   - Severity: WARNING
   - Why: SSRF prevention, data exfiltration control

4. **suspicious-base64-decode** (INFO)
   - Detects: Base64 decode operations
   - Severity: INFO
   - Why: Potential obfuscation marker

**SARIF Output**: Uploaded to GitHub Code Scanning
**Retention**: 90 days

---

## Installation

### Automated Installation
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase sast
```

**What it installs**:
- `.github/workflows/codeql.yml`
- `.github/workflows/semgrep.yml`
- `.semgrep/custom.yml`

### Manual Installation
```bash
# Create directories
mkdir -p .github/workflows .semgrep

# Copy templates
cp .claude/plugins/security-audit/templates/workflows/codeql.yml .github/workflows/
cp .claude/plugins/security-audit/templates/workflows/semgrep.yml .github/workflows/
cp .claude/plugins/security-audit/templates/configs/semgrep-custom.yml .semgrep/custom.yml

# Commit
git add .github/workflows/codeql.yml .github/workflows/semgrep.yml .semgrep/custom.yml
git commit -m "security(epic-TSE-0002-XXXX/milestone-TSE-0002.3): add SAST workflows"
git push
```

---

## Local Execution

### CodeQL (requires CLI installation)
```bash
# Install CodeQL CLI (one-time)
# Download from https://github.com/github/codeql-cli-binaries/releases

# Run analysis
codeql database create codedb --language=javascript
codeql database analyze codedb javascript-security-and-quality.qls --format=sarif-latest --output=codeql.sarif
```

### Semgrep (lightweight, recommended for local)
```bash
# Install Semgrep
npm install -g semgrep

# Run analysis
semgrep --config .semgrep/custom.yml --config p/javascript --error

# Generate SARIF
semgrep --config .semgrep/custom.yml --sarif -o semgrep.sarif

# Run specific rule
semgrep --config .semgrep/custom.yml --include="no-eval-new-function"
```

---

## GitHub Code Scanning Integration

Both tools upload results to **GitHub Code Scanning**:
- Navigate to: **Security → Code scanning → Alerts**
- Filter by tool: `CodeQL` or `Semgrep`
- View findings by severity: `Error`, `Warning`, `Note`

**Workflow Behavior**:
- ✅ **Pass**: No ERROR-level findings
- ⚠️ **Warning**: WARNING-level findings (does not block PR)
- ❌ **Fail**: ERROR-level findings (blocks PR merge if required)

**Configuration**:
```yaml
# Continue on error (informational mode)
continue-on-error: true

# Or enforce (blocking mode)
continue-on-error: false
```

---

## Triage and Remediation

### 1. Review Findings in GitHub
- Go to: **Security → Code scanning**
- Sort by severity: `Error` → `Warning` → `Note`
- Click on finding for details

### 2. Assess Severity
- **ERROR**: Must fix before merge
- **WARNING**: Fix in sprint backlog
- **NOTE/INFO**: Monitor, may be false positive

### 3. Remediation Strategies

**For eval/new Function**:
- Replace with safe alternatives (JSON.parse, template literals)
- If unavoidable, add Semgrep inline suppression:
  ```javascript
  // nosemgrep: no-eval-new-function
  eval(trustedInput); // JUSTIFICATION: trusted admin input only
  ```

**For command injection**:
- Use `child_process.execFile()` instead of `exec()`
- Validate and sanitize all inputs
- Use parameterized commands

**For external fetch**:
- Wrap with `assertAllowedUrl()` from `infrastructure/security/outbound-allowlist.ts`
- Add approved host to allowlist

### 4. False Positives
If a finding is a false positive:
```javascript
// nosemgrep: rule-id
// Justification: Explain why this is safe
```

Or suppress in `.semgrep/custom.yml`:
```yaml
rules:
  - id: rule-id
    paths:
      exclude:
        - "**/safe-file.ts"
```

---

## Extending Custom Rules

To add a new Semgrep rule to `.semgrep/custom.yml`:

```yaml
rules:
  - id: your-rule-id
    message: "Description of vulnerability"
    severity: ERROR  # or WARNING, INFO
    languages: [javascript, typescript]
    pattern: |
      some.dangerous.pattern($ARG)
    metadata:
      cwe: "CWE-XXX"
      owasp: "A03:2021"
      references:
        - "https://example.com/docs"
```

**Testing new rules**:
```bash
# Test on specific file
semgrep --config .semgrep/custom.yml path/to/file.ts

# Dry run on full codebase
semgrep --config .semgrep/custom.yml --dry-run
```

---

## CI/CD Integration

### Workflow Status
Check workflow runs:
```bash
gh run list --workflow=codeql.yml
gh run list --workflow=semgrep.yml
```

### View logs
```bash
gh run view <run-id>
gh run view <run-id> --log
```

### Required Status Checks
To enforce SAST before merge, add to **Branch Protection Rules**:
- `CodeQL` (required)
- `Semgrep` (required)

---

## Metrics and Reporting

### Key Metrics
- **Total findings**: ERROR + WARNING + INFO
- **New findings**: Introduced since last scan
- **Mean time to remediation (MTTR)**: Time from detection to fix
- **False positive rate**: Suppressed / Total findings

### Monthly Report
```bash
# Export findings (requires GitHub CLI with Code Scanning extension)
gh api repos/:owner/:repo/code-scanning/alerts --paginate -q '.[] | {rule_id: .rule.id, severity: .rule.severity, state: .state}'

# Count by severity
gh api repos/:owner/:repo/code-scanning/alerts --paginate | jq 'group_by(.rule.severity) | map({severity: .[0].rule.severity, count: length})'
```

---

## Compliance Mapping

| Compliance Standard | Requirement | Coverage |
|---------------------|-------------|----------|
| **OWASP Top 10** | A03:2021 - Injection | ✅ CodeQL, Semgrep |
| **OWASP Top 10** | A07:2021 - Identification/Auth | ✅ CodeQL |
| **NIST 800-53** | SA-11 - Developer Security Testing | ✅ Both |
| **SOC 2** | CC7.1 - System Monitoring | ✅ Both |
| **PCI-DSS** | 6.5 - Secure Coding | ✅ Both |

---

## Troubleshooting

### CodeQL workflow fails with "Out of memory"
**Solution**: Increase runner memory or reduce scope:
```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  with:
    ram: 4096  # Increase from default
```

### Semgrep finds too many false positives
**Solution**: Tune rules or add suppressions:
```bash
# Test rule precision
semgrep --config .semgrep/custom.yml --test

# Add path exclusions
paths:
  exclude:
    - "**/generated/**"
```

### CodeQL doesn't detect known vulnerability
**Solution**: CodeQL requires specific patterns. Add Semgrep custom rule:
```yaml
rules:
  - id: detect-specific-vuln
    pattern: vulnerable.pattern()
```

---

## Next Steps

After Phase 2 is deployed:
1. **Monitor GitHub Code Scanning** for 1 week
2. **Triage ERROR findings** within 48 hours
3. **Review WARNING findings** weekly
4. **Tune custom rules** based on false positive rate
5. **Proceed to Phase 3**: Secrets Scanning

---

## References

- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Semgrep Documentation](https://semgrep.dev/docs/)
- [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [SARIF Format Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
- [OWASP Top 10 2021](https://owasp.org/Top10/)

---

**Last Updated**: 2025-10-16
**Maintained By**: Security Team
