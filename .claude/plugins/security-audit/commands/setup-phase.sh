#!/bin/bash
# Security Phase Setup Command
# Epic: TSE-0002 - Security Hardening and Audit Framework
# Generated: {{DATE}}
#
# This script automates the installation of security audit phases.
#
# USAGE:
#   ./claude/plugins/security-audit/commands/setup-phase.sh --phase <phase-name>
#   ./claude/plugins/security-audit/commands/setup-phase.sh --phase all

set -e

PLUGIN_DIR=".claude/plugins/security-audit"
PROJECT_ROOT="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
PHASE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --phase)
      PHASE="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Validate phase argument
if [ -z "$PHASE" ]; then
  echo -e "${RED}Error: --phase argument required${NC}"
  echo ""
  echo "Usage: $0 --phase <phase-name>"
  echo ""
  echo "Available phases:"
  echo "  hygiene        - Phase 0: .gitignore, CODEOWNERS, Dependabot"
  echo "  sbom           - Phase 1: SBOM generation and vulnerability scanning"
  echo "  sast           - Phase 2: CodeQL and Semgrep SAST"
  echo "  secrets        - Phase 3: Gitleaks secrets scanning"
  echo "  supply-chain   - Phase 4: npm audit and OpenSSF Scorecard"
  echo "  backdoor-recon - Phase 5: Backdoor reconnaissance"
  echo "  all            - Install all phases"
  exit 1
fi

echo -e "${GREEN}=== Security Plugin Phase Setup ===${NC}"
echo "Phase: $PHASE"
echo ""

# Function to copy template with variable substitution
copy_template() {
  local src="$1"
  local dest="$2"
  local date=$(date -u +"%Y-%m-%d")

  # Simple variable substitution (basic - enhance as needed)
  sed "s/{{DATE}}/$date/g" "$src" > "$dest"
  echo -e "${GREEN}✓${NC} Created: $dest"
}

# Function to append template (for .gitignore)
append_template() {
  local src="$1"
  local dest="$2"

  if [ ! -f "$dest" ]; then
    echo -e "${YELLOW}⚠${NC} File not found: $dest, creating..."
    touch "$dest"
  fi

  echo "" >> "$dest"
  cat "$src" >> "$dest"
  echo -e "${GREEN}✓${NC} Appended to: $dest"
}

# Phase 0: Hygiene
install_hygiene() {
  echo -e "${YELLOW}Installing Phase 0: Hygiene${NC}"

  # Append .gitignore additions
  append_template "$PLUGIN_DIR/templates/configs/gitignore-additions.txt" ".gitignore"

  # Create .github directory if needed
  mkdir -p .github

  # Copy CODEOWNERS
  copy_template "$PLUGIN_DIR/templates/configs/codeowners.txt" ".github/CODEOWNERS"

  # Copy Dependabot config
  copy_template "$PLUGIN_DIR/templates/configs/dependabot.yml" ".github/dependabot.yml"

  echo -e "${GREEN}✓ Phase 0: Hygiene installed${NC}"
  echo ""
}

# Phase 1: SBOM
install_sbom() {
  echo -e "${YELLOW}Installing Phase 1: SBOM${NC}"

  mkdir -p .github/workflows
  copy_template "$PLUGIN_DIR/templates/workflows/sbom.yml" ".github/workflows/sbom.yml"
  copy_template "$PLUGIN_DIR/templates/workflows/osv.yml" ".github/workflows/osv.yml"

  echo -e "${GREEN}✓ Phase 1: SBOM installed${NC}"
  echo ""
}

# Phase 2: SAST
install_sast() {
  echo -e "${YELLOW}Installing Phase 2: SAST${NC}"

  mkdir -p .github/workflows
  copy_template "$PLUGIN_DIR/templates/workflows/codeql.yml" ".github/workflows/codeql.yml"
  copy_template "$PLUGIN_DIR/templates/workflows/semgrep.yml" ".github/workflows/semgrep.yml"

  mkdir -p .semgrep
  copy_template "$PLUGIN_DIR/templates/configs/semgrep-custom.yml" ".semgrep/custom.yml"

  echo -e "${GREEN}✓ Phase 2: SAST installed${NC}"
  echo ""
}

# Phase 3: Secrets
install_secrets() {
  echo -e "${YELLOW}Installing Phase 3: Secrets${NC}"

  mkdir -p .github/workflows
  copy_template "$PLUGIN_DIR/templates/workflows/gitleaks.yml" ".github/workflows/gitleaks.yml"
  copy_template "$PLUGIN_DIR/templates/configs/gitleaks.toml" ".gitleaks.toml"

  # Install pre-commit hook
  echo -e "${YELLOW}Installing pre-commit hook...${NC}"
  sh "$PLUGIN_DIR/commands/install-gitleaks-hook.sh"

  echo -e "${GREEN}✓ Phase 3: Secrets installed${NC}"
  echo ""
}

# Phase 4: Supply Chain
install_supply_chain() {
  echo -e "${YELLOW}Installing Phase 4: Supply Chain${NC}"

  mkdir -p .github/workflows
  copy_template "$PLUGIN_DIR/templates/workflows/npm-audit.yml" ".github/workflows/npm-audit.yml"
  copy_template "$PLUGIN_DIR/templates/workflows/scorecards.yml" ".github/workflows/scorecards.yml"

  echo -e "${GREEN}✓ Phase 4: Supply Chain installed${NC}"
  echo ""
}

# Phase 5: Backdoor Recon
install_backdoor_recon() {
  echo -e "${YELLOW}Installing Phase 5: Backdoor Recon${NC}"

  mkdir -p .github/workflows
  copy_template "$PLUGIN_DIR/templates/workflows/backdoor-recon.yml" ".github/workflows/backdoor-recon.yml"

  # Extend Semgrep rules
  if [ -f ".semgrep/custom.yml" ]; then
    echo -e "${YELLOW}Appending extended Semgrep rules to .semgrep/custom.yml...${NC}"
    echo "" >> .semgrep/custom.yml
    echo "# === Extended Rules from Phase 5 ===" >> .semgrep/custom.yml
    cat "$PLUGIN_DIR/templates/configs/semgrep-extended.yml" >> .semgrep/custom.yml
    echo -e "${GREEN}✓${NC} Extended .semgrep/custom.yml"
  else
    echo -e "${YELLOW}⚠${NC} .semgrep/custom.yml not found - run Phase 2 (SAST) first"
  fi

  # Copy outbound allowlist utility
  mkdir -p infrastructure/security/__tests__
  copy_template "$PLUGIN_DIR/templates/configs/outbound-allowlist.ts" "infrastructure/security/outbound-allowlist.ts"
  copy_template "$PLUGIN_DIR/templates/configs/outbound-allowlist.test.ts" "infrastructure/security/__tests__/outbound-allowlist.test.ts"

  echo -e "${GREEN}✓ Phase 5: Backdoor Recon installed${NC}"
  echo ""
}

# Install based on phase
case $PHASE in
  hygiene)
    install_hygiene
    ;;
  sbom)
    install_sbom
    ;;
  sast)
    install_sast
    ;;
  secrets)
    install_secrets
    ;;
  supply-chain)
    install_supply_chain
    ;;
  backdoor-recon)
    install_backdoor_recon
    ;;
  all)
    echo -e "${GREEN}Installing all security phases...${NC}"
    echo ""
    install_hygiene
    install_sbom
    install_sast
    install_secrets
    install_supply_chain
    install_backdoor_recon
    ;;
  *)
    echo -e "${RED}Unknown phase: $PHASE${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "  1. Review generated files and customize for your project"
echo "  2. Commit changes: git add . && git commit -m 'security: add Phase $PHASE'"
echo "  3. Push to GitHub to trigger workflows"
echo "  4. Check GitHub → Actions to verify workflows run successfully"
echo ""
echo "For more information, see: .claude/plugins/security-audit/README.md"
