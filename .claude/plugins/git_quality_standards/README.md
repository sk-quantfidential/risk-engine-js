# Git Quality Standards Plugin

Portable git workflow standards and automation scripts for the Cor Prime Risk Engine.

## Overview

This plugin provides git workflow automation and quality validation:
- Branch naming validation
- PR documentation requirements
- Pre-push validation hooks
- Automated PR creation
- Repository structure validation

## Scripts

### validate-all.sh
Runs comprehensive validation checks on the repository:
- Required files validation
- PR documentation validation
- Markdown linting
- GitHub Actions configuration
- Repository structure

**Usage**:
```bash
./scripts/validate-all.sh
```

### create-pr.sh
Automates GitHub PR creation with proper formatting:
- Validates branch naming convention
- Finds PR documentation in `docs/prs/`
- Generates conventional commit title format
- Creates PR with documentation as body

**Usage**:
```bash
./scripts/create-pr.sh
```

### pre-push-hook.sh
Git pre-push hook that validates before allowing push:
- Validates branch name
- Checks PR documentation exists
- Runs validation suite
- Checks TODO.md updates

**Install**:
```bash
cp .claude/plugins/git_quality_standards/scripts/pre-push-hook.sh .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

### install-git-hooks-enhanced.sh
Enhanced installer for git hooks and configurations.

**Usage**:
```bash
./.claude/plugins/git_quality_standards/scripts/install-git-hooks-enhanced.sh -y -y -y
```

## Branch Naming Convention

```
type/epic-TSE-9999-milestone-description

Valid types: feature, fix, docs, style, refactor, test, chore, ci
```

**Examples**:
- `feature/epic-TSE-0001-auth-implement-jwt-tokens`
- `fix/epic-TSE-0042-ui-fix-button-alignment`
- `chore/epic-TSE-0001-foundation-add-claude-configuration`

## PR Title Format

Conventional commit format:
```
type(epic-TSE-9999): description

Examples:
  feat(epic-TSE-0001): add user authentication
  fix(epic-TSE-0042): resolve timeout errors
  chore(epic-TSE-0001): add Claude configuration
```

## Required Files

The validation script checks for:
- `README.md`
- `TODO.md`
- `CONTRIBUTING.md`
- `.gitignore`
- `.validation_exceptions`

## PR Documentation

PR documentation must be created in `docs/prs/` matching the branch:
- Pattern: `docs/prs/{type}-epic-TSE-9999-*.md`
- Or: `docs/prs/{branch-name}.md`

**Required sections**:
- `## Summary`
- `## Testing` or `## Quality Assurance`
- `## What Changed`

## Validation Exceptions

Configure excluded files/patterns in `.validation_exceptions`:
```
node_modules/**
.next/**
build/**
dist/**
```

## GitHub Actions Integration

Workflows required for branch protection:
- `.github/workflows/pr-checks.yml` - Validates PR titles and branch names
- `.github/workflows/validation.yml` - Runs repository validation

## Related Skills

This plugin implements standards from:
- `~/.claude/skills/foundations/git_quality_standards/`
- `~/.claude/skills/foundations/git_workflow_checklist/`

---

**Version**: 1.0.0
**Last Updated**: 2025-01-21
**Component**: risk-engine-js (Cor Prime Risk Engine)
