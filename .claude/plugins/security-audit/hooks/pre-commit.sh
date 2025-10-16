#!/usr/bin/env sh
# Pre-commit hook for Gitleaks secrets scanning
# To bypass (NOT RECOMMENDED): git commit --no-verify

echo "🔒 Scanning for secrets..."

# Check if gitleaks is installed
if ! command -v gitleaks &> /dev/null; then
  echo "⚠️  Gitleaks not installed. Skipping scan."
  echo "   Install: https://github.com/gitleaks/gitleaks#install"
  echo "   Or skip check: git commit --no-verify"
  exit 0  # Don't block if not installed
fi

# Scan staged files only (fast)
gitleaks protect \
  --staged \
  --no-banner \
  --redact \
  --verbose \
  --config .gitleaks.toml

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Secrets detected! Commit blocked."
  echo ""
  echo "Actions:"
  echo "  1. Remove the secret from staged files"
  echo "  2. Add to .gitignore if it's a config file"
  echo "  3. Add to .gitleaks.toml allowlist if false positive"
  echo "  4. Skip check (NOT RECOMMENDED): git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ No secrets detected"
exit 0
