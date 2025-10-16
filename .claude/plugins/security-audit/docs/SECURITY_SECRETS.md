# Secrets Scanning - Phase 3

**Epic**: TSE-0002 - Security Hardening and Audit Framework
**Phase**: Phase 3 - Secrets Scanning
**Status**: Template Ready

---

## Overview

Phase 3 implements secrets scanning using **Gitleaks** to prevent credential leaks:
- **Pre-commit hooks**: Block secrets before they reach Git history
- **CI/CD scanning**: Scan full repository history on every push
- **Custom allowlist**: Configure false positive exceptions

---

## Tool: Gitleaks

**Purpose**: Detect hardcoded credentials, API keys, tokens, and secrets
**Workflow**: `.github/workflows/gitleaks.yml`
**Configuration**: `.gitleaks.toml`
**Pre-commit Hook**: `.git/hooks/pre-commit`

**What it detects**:
- AWS credentials (access keys, secret keys)
- GitHub tokens (PAT, OAuth, App tokens)
- Private keys (RSA, SSH, PGP)
- Database connection strings
- API keys (Stripe, Coinbase, Auth0, etc.)
- Generic secrets (HIGH_ENTROPY patterns)
- Bearer tokens
- Basic auth credentials

**Detection Methods**:
- **Regex patterns**: 100+ pre-configured patterns
- **Entropy analysis**: High-entropy strings (BASE64, HEX)
- **Keyword detection**: "password", "secret", "token" near values

---

## Installation

### Automated Installation
```bash
./claude/plugins/security-audit/commands/setup-phase.sh --phase secrets
```

**What it installs**:
- `.github/workflows/gitleaks.yml` - CI/CD workflow
- `.gitleaks.toml` - Configuration with allowlist
- `.git/hooks/pre-commit` - Pre-commit hook (via install script)

### Manual Installation

#### 1. Install Gitleaks CLI (one-time)
```bash
# macOS
brew install gitleaks

# Linux
curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/master/scripts/install.sh | sh -s -- -b /usr/local/bin

# Windows (Scoop)
scoop install gitleaks

# Verify installation
gitleaks version
```

#### 2. Copy Configuration Files
```bash
# Copy workflow
mkdir -p .github/workflows
cp .claude/plugins/security-audit/templates/workflows/gitleaks.yml .github/workflows/

# Copy config
cp .claude/plugins/security-audit/templates/configs/gitleaks.toml .gitleaks.toml

# Install pre-commit hook
./.claude/plugins/security-audit/commands/install-gitleaks-hook.sh
```

#### 3. Commit and Push
```bash
git add .github/workflows/gitleaks.yml .gitleaks.toml
git commit -m "security(epic-TSE-0002-XXXX/milestone-TSE-0002.4): add secrets scanning"
git push
```

---

## Configuration: `.gitleaks.toml`

### Allowlist Structure

```toml
[allowlist]
description = "Global allowlist for false positives"

# Exclude entire paths
paths = [
  '''node_modules/''',
  '''dist/''',
  '''build/''',
  '''.next/''',
  '''coverage/''',
  '''*.lock''',
  '''package-lock.json''',
  '''yarn.lock''',
  '''pnpm-lock.yaml''',
  '''*.log''',
]

# Exclude specific regex patterns
regexes = [
  # Example placeholder values
  '''api_key_12345''',            # Test/example keys
  '''secret_placeholder''',        # Documentation placeholders
  '''EXAMPLE_TOKEN''',             # Uppercase placeholders
]

# Exclude by commit hash (use sparingly)
commits = [
  # "abc123def456",  # Commit with known false positive
]
```

### Adding Allowlist Entries

**When to allowlist**:
- ✅ Test fixtures with fake credentials
- ✅ Example configuration files with placeholders
- ✅ Public keys (not private keys!)
- ✅ Non-sensitive IDs that match patterns
- ❌ Real credentials (NEVER allowlist real secrets!)

**How to add**:
1. Identify false positive from Gitleaks output
2. Add specific regex or path to `.gitleaks.toml`
3. Test with `gitleaks detect`
4. Commit the updated `.gitleaks.toml`

**Example**:
```toml
regexes = [
  '''test_api_key_do_not_use''',  # Test fixture
  '''pk_test_[0-9a-zA-Z]{24}''',   # Stripe test keys (start with pk_test_)
]
```

---

## Pre-commit Hook

### How It Works
The pre-commit hook runs `gitleaks protect --staged` before every commit:
1. Scans only **staged files** (fast)
2. Blocks commit if secrets found
3. Shows redacted output for remediation

### Workflow
```
$ git commit -m "Add feature"
→ Running gitleaks pre-commit hook...
→ ❌ Secrets detected! Commit blocked.
→
→ Finding: generic-api-key
→ File: src/config.ts:12
→ Secret: api_key = "sk_live_REDACTED"
→
→ Actions:
→   1. Remove the secret from staged files
→   2. Add to .gitleaks.toml allowlist if false positive
→   3. Retry commit
```

### Bypassing (Use with Caution!)
If you must bypass (e.g., allowlist not working):
```bash
# Bypass hook (NOT RECOMMENDED)
git commit --no-verify -m "message"

# Better approach: Fix allowlist
vim .gitleaks.toml  # Add regex
gitleaks detect --staged --no-banner  # Verify
git commit -m "message"
```

### Uninstalling Hook
```bash
rm .git/hooks/pre-commit
```

### Reinstalling Hook
```bash
./claude/plugins/security-audit/commands/install-gitleaks-hook.sh
```

---

## CI/CD Workflow

### Workflow Trigger
- **On push to main**: Full repository scan
- **On PR to main**: Full repository scan
- **Weekly schedule**: Sunday at 03:00 UTC
- **Manual dispatch**: Via GitHub Actions UI

### What It Scans
```yaml
- name: Checkout full history
  uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Scan entire Git history
```

**Why full history?**
- Detects secrets in old commits
- Prevents reintroduction of removed secrets
- Audits historical credential leaks

### Output
- **Console logs**: Redacted findings
- **JSON report**: Uploaded as artifact (90-day retention)
- **Exit code**: Non-zero if secrets found (fails workflow)

### Workflow Behavior
```yaml
continue-on-error: false  # FAIL workflow if secrets found
```

**Result**:
- ✅ **Pass**: No secrets detected
- ❌ **Fail**: Secrets detected (blocks PR merge)

---

## Local Execution

### Scan Staged Files (Pre-commit Style)
```bash
gitleaks protect --staged --no-banner --redact --verbose --config .gitleaks.toml
```

### Scan Full Repository
```bash
gitleaks detect --no-banner --redact --config .gitleaks.toml
```

### Scan Specific Commit Range
```bash
gitleaks detect --log-opts="main..feature-branch" --config .gitleaks.toml
```

### Generate JSON Report
```bash
gitleaks detect --report-path=gitleaks-report.json --config .gitleaks.toml
```

### Test Allowlist
```bash
# Add test secret to file
echo 'secret = "sk_live_test123"' > test-secret.txt
git add test-secret.txt

# Scan staged (should detect)
gitleaks protect --staged --no-banner

# Add to allowlist
echo '  '''sk_live_test123''',' >> .gitleaks.toml

# Scan again (should pass)
gitleaks protect --staged --no-banner
```

---

## Remediation

### 1. Secret Found in Pre-commit Hook

**Step 1**: Identify the secret
```
Finding: generic-api-key
File: src/config.ts:12
Secret: api_key = "sk_live_REDACTED"
```

**Step 2**: Remove or allowlist
```bash
# Option A: Remove secret (RECOMMENDED)
vim src/config.ts  # Replace with env var
git add src/config.ts
git commit -m "fix: remove hardcoded secret"

# Option B: Allowlist if false positive
vim .gitleaks.toml  # Add regex
git commit -m "chore: allowlist false positive"
```

### 2. Secret Found in Git History

If secrets are committed to history, they must be removed:

**Option A: Rewrite Recent Commits (if not pushed)**
```bash
# Interactive rebase to edit commits
git rebase -i HEAD~5

# Edit commit, remove secret, save
git rebase --continue

# Force push (only if branch is yours)
git push --force-with-lease
```

**Option B: Use BFG Repo-Cleaner (for old commits)**
```bash
# Install BFG
brew install bfg  # macOS

# Remove secrets from history
bfg --replace-text secrets.txt  # File with "PASSWORD==>REDACTED" mappings
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (coordinate with team!)
git push --force
```

**Option C: Rotate Secret Immediately**
If secret was pushed to remote:
1. **Rotate the credential immediately** (new key, revoke old)
2. Remove from history (Option A or B)
3. Verify removal: `gitleaks detect --log-opts="--all"`
4. Update `.env` and CI secrets

---

## Handling False Positives

### Common False Positives

1. **Test fixtures**
   ```toml
   paths = ['''tests/fixtures/''']
   ```

2. **Example config files**
   ```toml
   regexes = ['''example_api_key''', '''YOUR_KEY_HERE''']
   ```

3. **High-entropy non-secrets** (e.g., base64 images)
   ```toml
   paths = ['''assets/images/''']
   ```

4. **Public keys** (not private!)
   ```toml
   regexes = ['''ssh-rsa AAAA[A-Za-z0-9+/]+''']
   ```

### Testing Allowlist
```bash
# Scan without allowlist (see all findings)
gitleaks detect --no-git --no-banner

# Scan with allowlist
gitleaks detect --config .gitleaks.toml --no-banner

# Compare counts to verify allowlist works
```

---

## Integration with CI/CD

### GitHub Actions Status Check
To enforce secrets scanning before merge:
1. Go to **Settings → Branches → Branch protection rules**
2. Enable **Require status checks to pass before merging**
3. Select **Gitleaks** from required checks

### Slack/Email Notifications
Add to `.github/workflows/gitleaks.yml`:
```yaml
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "🚨 Secrets detected in ${{ github.repository }}!",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "View logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
          }
        ]
      }
```

---

## Metrics and Reporting

### Key Metrics
- **Secrets detected**: Count per month
- **Secrets leaked to remote**: Count requiring rotation
- **Pre-commit blocks**: Count of prevented leaks
- **Mean time to rotation (MTTR)**: Time from detection to rotation

### Monthly Report
```bash
# Count findings in CI runs
gh run list --workflow=gitleaks.yml --json conclusion,createdAt | jq '[.[] | select(.conclusion == "failure")] | length'

# View recent findings
gh run view <run-id> --log | grep "Finding:"
```

---

## Compliance Mapping

| Compliance Standard | Requirement | Coverage |
|---------------------|-------------|----------|
| **SOC 2** | CC6.1 - Logical Access Controls | ✅ Pre-commit + CI |
| **PCI-DSS** | 6.5.3 - Insecure Cryptographic Storage | ✅ Detects keys |
| **NIST 800-53** | SC-12 - Cryptographic Key Management | ✅ Detects private keys |
| **GDPR** | Art. 32 - Security of Processing | ✅ Credential protection |
| **ISO 27001** | A.9.4.3 - Password Management | ✅ Detects passwords |

---

## Troubleshooting

### Pre-commit hook not running
**Solution**: Verify hook is executable
```bash
chmod +x .git/hooks/pre-commit
./.claude/plugins/security-audit/commands/install-gitleaks-hook.sh
```

### Gitleaks not found in CI
**Solution**: Workflow installs Gitleaks automatically. Check runner logs.

### Too many false positives
**Solution**: Tune `.gitleaks.toml` allowlist or use `--baseline` mode:
```bash
# Create baseline (snapshot current state)
gitleaks detect --baseline-path=.gitleaks-baseline.json

# Only detect NEW secrets
gitleaks detect --baseline-path=.gitleaks-baseline.json
```

### Secret detected in locked file (package-lock.json)
**Solution**: Allowlist lock files (already in default config):
```toml
paths = ['''package-lock.json''']
```

---

## Best Practices

1. ✅ **Use environment variables** for all secrets
2. ✅ **Never commit `.env` files** (add to `.gitignore`)
3. ✅ **Rotate secrets immediately** if leaked
4. ✅ **Test allowlist locally** before pushing
5. ✅ **Review Gitleaks logs weekly**
6. ❌ **Never bypass pre-commit hook** without justification
7. ❌ **Never commit real secrets to history** (even if deleted later)

---

## Next Steps

After Phase 3 is deployed:
1. **Install pre-commit hook** on all developer machines
2. **Rotate any detected secrets** within 24 hours
3. **Tune allowlist** to reduce false positives
4. **Monitor CI failures** weekly
5. **Proceed to Phase 4**: Supply Chain Security

---

## References

- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Gitleaks Configuration](https://github.com/gitleaks/gitleaks#configuration)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Last Updated**: 2025-10-16
**Maintained By**: Security Team
