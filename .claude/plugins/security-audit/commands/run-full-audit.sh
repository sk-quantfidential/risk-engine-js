#!/bin/bash
# Run Full Security Audit
# Epic: TSE-0002 - Security Hardening and Audit Framework
# Generated: {{DATE}}
#
# This script runs all security scans locally and generates a combined report.
#
# USAGE: ./claude/plugins/security-audit/commands/run-full-audit.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REPORT_DIR="security-audit-reports"
TIMESTAMP=$(date -u +"%Y%m%d-%H%M%S")
REPORT_FILE="$REPORT_DIR/full-audit-$TIMESTAMP.txt"

echo -e "${BLUE}=== Risk Engine JS - Full Security Audit ===${NC}"
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "Report will be saved to: $REPORT_FILE"
echo ""

# Create report directory
mkdir -p "$REPORT_DIR"

# Initialize report
{
  echo "=========================================="
  echo "Risk Engine JS - Full Security Audit"
  echo "=========================================="
  echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  echo "Git Branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
  echo "Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
  echo ""
} > "$REPORT_FILE"

# Function to run check and append to report
run_check() {
  local name="$1"
  local command="$2"
  local skip_on_error="${3:-false}"

  echo -e "${YELLOW}Running: $name${NC}"
  {
    echo "=========================================="
    echo "$name"
    echo "=========================================="
    echo "Started: $(date -u +"%H:%M:%S UTC")"
    echo ""
  } >> "$REPORT_FILE"

  if eval "$command" >> "$REPORT_FILE" 2>&1; then
    echo -e "${GREEN}✓${NC} $name - PASSED"
    echo "Status: PASSED" >> "$REPORT_FILE"
  else
    if [ "$skip_on_error" = "true" ]; then
      echo -e "${YELLOW}⚠${NC} $name - WARNINGS (continuing)"
      echo "Status: WARNINGS" >> "$REPORT_FILE"
    else
      echo -e "${RED}✗${NC} $name - FAILED"
      echo "Status: FAILED" >> "$REPORT_FILE"
    fi
  fi

  echo "" >> "$REPORT_FILE"
}

# Check 1: Git Status
run_check "Git Status" "git status --short" true

# Check 2: Secrets Scan (Gitleaks)
if command -v gitleaks &> /dev/null; then
  run_check "Secrets Scan (Gitleaks)" "gitleaks detect --no-banner --redact --config .gitleaks.toml" true
else
  echo -e "${YELLOW}⚠${NC} Gitleaks not installed - skipping secrets scan"
  echo "Secrets Scan: SKIPPED (gitleaks not installed)" >> "$REPORT_FILE"
fi

# Check 3: SAST (Semgrep)
if command -v semgrep &> /dev/null; then
  run_check "SAST (Semgrep)" "semgrep --config .semgrep/custom.yml --error" true
else
  echo -e "${YELLOW}⚠${NC} Semgrep not installed - skipping SAST"
  echo "SAST: SKIPPED (semgrep not installed)" >> "$REPORT_FILE"
fi

# Check 4: Dependency Audit (npm)
run_check "Dependency Audit (npm)" "npm audit" true

# Check 5: Production Dependency Audit
run_check "Production Dependency Audit (npm)" "npm audit --production" true

# Check 6: SBOM Generation (if Syft available)
if command -v syft &> /dev/null; then
  run_check "SBOM Generation (Syft)" "syft dir:. -o table" true
else
  echo -e "${YELLOW}⚠${NC} Syft not installed - skipping SBOM generation"
  echo "SBOM: SKIPPED (syft not installed)" >> "$REPORT_FILE"
fi

# Check 7: Vulnerability Scan (if Grype available)
if command -v grype &> /dev/null && [ -f "sbom.spdx.json" ]; then
  run_check "Vulnerability Scan (Grype)" "grype sbom:sbom.spdx.json -o table" true
elif command -v grype &> /dev/null; then
  echo -e "${YELLOW}⚠${NC} No SBOM found - run 'npm run sbom:syft' first"
  echo "Grype: SKIPPED (no SBOM)" >> "$REPORT_FILE"
else
  echo -e "${YELLOW}⚠${NC} Grype not installed - skipping vulnerability scan"
  echo "Grype: SKIPPED (grype not installed)" >> "$REPORT_FILE"
fi

# Check 8: Backdoor Reconnaissance (grep)
echo -e "${YELLOW}Running: Backdoor Reconnaissance${NC}"
{
  echo "=========================================="
  echo "Backdoor Reconnaissance (grep)"
  echo "=========================================="
  echo "Started: $(date -u +"%H:%M:%S UTC")"
  echo ""

  echo "== Obfuscation Markers =="
  rg -n "while\(!!\[\]\)|\bFunction\(|\beval\(|atob\(|Buffer\.from.*base64" --type js --type ts || echo "None found"
  echo ""

  echo "== Hidden Networking =="
  rg -n 'require\(.(http|https|net|dgram).\)|new\s+WebSocket\(' --type js --type ts || echo "None found"
  echo ""

  echo "Status: COMPLETED"
} >> "$REPORT_FILE"
echo -e "${GREEN}✓${NC} Backdoor Reconnaissance - COMPLETED"

# Summary
echo ""
echo -e "${BLUE}=== Audit Complete ===${NC}"
echo ""
{
  echo "=========================================="
  echo "AUDIT SUMMARY"
  echo "=========================================="
  echo "Completed: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  echo ""
  echo "Report saved to: $REPORT_FILE"
  echo ""
  echo "Review the report and address any FAILED or WARNING items."
  echo "For detailed CI/CD results, check GitHub Actions workflows."
} >> "$REPORT_FILE"

echo -e "${GREEN}✓ Full audit report saved to:${NC} $REPORT_FILE"
echo ""
echo "Next steps:"
echo "  1. Review the report: cat $REPORT_FILE"
echo "  2. Address any FAILED or WARNING items"
echo "  3. For CI/CD results: gh run list"
echo "  4. For historical trends: ls -lh $REPORT_DIR/"
