#!/bin/bash
# Install Gitleaks Pre-commit Hook
# Epic: TSE-0002 - Security Hardening and Audit Framework
# Phase: Phase 3 - Secrets Scanning
# Generated: {{DATE}}
#
# This script installs the pre-commit hook for all developers.
# Run: sh .claude/plugins/security-audit/commands/install-gitleaks-hook.sh

set -e

HOOK_FILE=".git/hooks/pre-commit"
PLUGIN_DIR=".claude/plugins/security-audit"

echo "Installing Gitleaks pre-commit hook..."

# Check if .git exists
if [ ! -d ".git" ]; then
  echo "❌ Not a git repository"
  exit 1
fi

# Backup existing hook
if [ -f "$HOOK_FILE" ]; then
  echo "⚠️  Existing pre-commit hook found, backing up..."
  cp "$HOOK_FILE" "$HOOK_FILE.backup.$(date +%s)"
fi

# Copy hook from plugin
if [ -f "$PLUGIN_DIR/hooks/pre-commit.sh" ]; then
  cp "$PLUGIN_DIR/hooks/pre-commit.sh" "$HOOK_FILE"
  chmod +x "$HOOK_FILE"
  echo "✅ Pre-commit hook installed at $HOOK_FILE"
else
  echo "❌ Hook template not found at $PLUGIN_DIR/hooks/pre-commit.sh"
  exit 1
fi

echo ""
echo "Test it:"
echo "  1. Stage a file: git add ."
echo "  2. Try commit: git commit -m 'test'"
echo "  3. Hook should run automatically"
echo ""
echo "To bypass hook (NOT RECOMMENDED):"
echo "  git commit --no-verify"
