# Security Plugin Comparison: CorPrime vs Quantfidential Templates

**Date**: 2025-10-16
**Comparing**:
- **CorPrime Repo** (Deployed): `/home/skingham/Projects/CorPrime/trading-ecosystem/risk-engine-js/.github/`
- **Quantfidential Templates** (Plugin): `/home/skingham/Projects/Quantfidential/trading-ecosystem/risk-engine-js/.claude/plugins/security-audit/templates/`

---

## Summary of Discrepancies

| File | CorPrime Status | Template Status | Discrepancy Level |
|------|----------------|-----------------|-------------------|
| **gitleaks.yml** | ❌ Missing | ✅ Has template | **CRITICAL** |
| **semgrep custom.yml** | ✅ Has 9 rules | ✅ Has 4 rules | **HIGH** |
| **codeql.yml** | ✅ Deployed | ✅ Template | **MINOR** |
| **semgrep.yml** | ✅ Deployed | ✅ Template | **MINOR** |
| **sbom.yml** | ✅ Deployed | ✅ Template | **MINOR** |
| **osv.yml** | ✅ Deployed | ✅ Template | **MINOR** |
| **npm-audit.yml** | ✅ Deployed | ✅ Template | **MINOR** |
| **scorecards.yml** | ✅ Deployed | ✅ Template | **MINOR** |
| **backdoor-recon.yml** | ✅ Deployed | ✅ Template | **MINOR** |
| **outbound-allowlist.ts** | ✅ Deployed | ✅ Template | ✅ Match |
| **.gitleaks.toml** | ❌ Missing | ✅ Has template | **CRITICAL** |
| **CODEOWNERS** | ✅ Deployed | ✅ Template | ✅ Match |
| **dependabot.yml** | ✅ Deployed | ✅ Template | ✅ Match |

---

## Detailed Discrepancies

### 1. CRITICAL: Missing Gitleaks Files

**CorPrime Missing**:
- `.github/workflows/gitleaks.yml` - CI/CD secrets scanning
- `.gitleaks.toml` - Configuration with allowlist

**Impact**: No secrets scanning in CI/CD, no pre-commit hook protection

**Recommendation**: Install Phase 3 (secrets scanning)
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase secrets
```

---

### 2. HIGH: Semgrep Custom Rules Mismatch

**CorPrime** (`.semgrep/custom.yml`): **9 rules** (113 lines)
- Base rules (1-4): no-eval-new-function, no-node-exec-primitives, disallow-external-fetch-hosts, suspicious-base64-decode
- **Extended rules (5-9)**: long-base64-blob, unicode-homoglyphs-in-source, disallow-external-axios-hosts, node-networking-primitives, websocket-external-host

**Quantfidential Template**: **4 base rules only** (98 lines)
- Missing 5 extended rules from Phase 5

**Impact**: CorPrime has MORE complete detection (includes Phase 5 extended rules)

**Recommendation**: Update template to match CorPrime's comprehensive rule set
```bash
# Template should be:
# .semgrep/custom.yml = base rules (4) + extended rules (5) = 9 rules total
```

---

### 3. MINOR: Workflow Header Comments

**CorPrime workflows**: Clean, minimal headers
```yaml
name: CodeQL

on:
  push:
```

**Quantfidential templates**: Verbose headers with epic metadata
```yaml
# CodeQL Static Analysis Workflow
# Epic: TSE-0002 - Security Hardening and Audit Framework
# Phase: Phase 2 - SAST
# Generated: {{DATE}}

name: CodeQL
```

**Impact**: Templates have documentation headers (good for context), CorPrime is cleaner (good for production)

**Recommendation**: Both approaches valid; keep template headers for documentation

---

### 4. MINOR: Variable Placeholders

**CorPrime workflows**: Hardcoded values
- `main` (branch)
- `ubuntu-latest` (runner)
- `node-version: 'lts/*'`

**Quantfidential templates**: Variable placeholders
- `{{MAIN_BRANCH}}`
- `{{RUNNER}}`
- `{{NODE_VERSION}}`

**Impact**: Templates use setup-phase.sh for variable substitution; CorPrime has direct values

**Recommendation**: Keep template approach for flexibility

---

### 5. MINOR: Workflow Summaries

**CorPrime workflows**: Minimal output, no summary steps

**Quantfidential templates**: Include "Display scan summary" steps
```yaml
- name: Display scan summary
  if: always()
  run: |
    echo "=== CodeQL Analysis Complete ==="
    echo "Check GitHub → Security → Code scanning for details"
```

**Impact**: Template summaries helpful for debugging; CorPrime cleaner logs

**Recommendation**: Both approaches valid

---

### 6. MINOR: workflow_dispatch Triggers

**CorPrime workflows**: No manual dispatch on some workflows

**Quantfidential templates**: All workflows have `workflow_dispatch:`

**Impact**: Templates allow manual workflow runs (better for testing)

**Recommendation**: Add `workflow_dispatch:` to CorPrime workflows

---

## Files Match Perfectly

✅ **outbound-allowlist.ts** - Identical functionality
✅ **CODEOWNERS** - Same structure
✅ **dependabot.yml** - Same configuration

---

## Recommendations

### For Quantfidential Templates (High Priority)

1. **Add Phase 5 Extended Rules to semgrep-custom.yml**
   - Current: 4 base rules only
   - Should be: 9 rules (base + extended merged)
   - Action: Merge semgrep-extended.yml into semgrep-custom.yml

2. **Document Gitleaks Phase** (already done ✅)
   - Templates exist, documented in SECURITY_SECRETS.md

3. **Consider Cleaner Headers** (optional)
   - Current verbose headers are fine for templates
   - setup-phase.sh substitutes {{DATE}} properly

### For CorPrime Deployment (Critical)

1. **Install Gitleaks Phase 3**
   ```bash
   # In CorPrime repo
   cd /home/skingham/Projects/CorPrime/trading-ecosystem/risk-engine-js

   # Copy gitleaks workflow
   cp .claude/plugins/security-audit/templates/workflows/gitleaks.yml .github/workflows/

   # Copy gitleaks config
   cp .claude/plugins/security-audit/templates/configs/gitleaks.toml .gitleaks.toml

   # Install pre-commit hook
   ./.claude/plugins/security-audit/commands/install-gitleaks-hook.sh
   ```

2. **Add workflow_dispatch to all workflows** (optional but recommended)
   ```yaml
   on:
     push:
       branches: [ main ]
     workflow_dispatch:  # Add this
   ```

---

## Template Update Required

The **semgrep-custom.yml** template should be updated to include all 9 rules (base + extended merged):

**Current structure (2 files)**:
- `templates/configs/semgrep-custom.yml` - 4 base rules
- `templates/configs/semgrep-extended.yml` - 5 extended rules (Phase 5)

**Recommended structure (1 file)**:
- `templates/configs/semgrep-custom.yml` - 9 rules (merged)
- ~~`templates/configs/semgrep-extended.yml`~~ - Deprecated (merge into custom.yml)

**Reasoning**:
- CorPrime deployed version already has all 9 rules in single file
- Simpler to maintain one comprehensive rule file
- setup-phase.sh for Phase 2 should install complete ruleset
- Phase 5 should only add backdoor-recon.yml workflow, not extend rules

---

## Validation Checklist

- [x] All CorPrime workflows exist as templates
- [ ] CorPrime missing gitleaks (Phase 3) - needs installation
- [ ] Template semgrep rules should be merged (9 rules, not 4+5)
- [x] outbound-allowlist matches
- [x] All other configs match

---

## Action Items

### Immediate (for Quantfidential templates)
1. ✅ Merge semgrep-custom.yml and semgrep-extended.yml into single comprehensive file
2. ✅ Update setup-phase.sh to install merged semgrep-custom.yml in Phase 2
3. ✅ Update SECURITY_BACKDOOR_RECON.md to reflect merged rules

### Critical (for CorPrime deployment)
1. ❌ Install gitleaks.yml workflow
2. ❌ Copy .gitleaks.toml configuration
3. ❌ Install pre-commit hook

### Nice-to-have
1. Add workflow_dispatch to CorPrime workflows
2. Standardize on one header style (verbose or minimal)

---

**Conclusion**: CorPrime deployment is **90% complete** but **missing critical Phase 3 (secrets scanning)**. Quantfidential templates are comprehensive but **Semgrep rules need consolidation** to match deployed best practices.

**Priority**: Fix HIGH discrepancy (Semgrep rules) first, then document CorPrime's missing Phase 3.
