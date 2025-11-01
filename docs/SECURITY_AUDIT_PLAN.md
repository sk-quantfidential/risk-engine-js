# Security Audit Plan (CISO-Ready)

Objective: Provide evidence-based assurance that this codebase has no backdoors/obfuscated channels, no injection/payload vectors, and no exploitable elevated processes. Deliver reproducible artifacts and controls mapping.

## Phase 0 — Hygiene (this branch)
- Improve .gitignore for env files, caches, logs.
- Add CODEOWNERS and Dependabot to baseline supply-chain hygiene.
- Lock installs via `npm ci` in CI.
Status: COMPLETED

## Phase 1 — Inventory + SBOM
- Generate SBOM: `syft dir:. -o json > sbom.json`; scan: `grype sbom:sbom.json`.
- Artifact integrity: store checksums.
Status: COMPLETED
Evidence:
- CI workflows `.github/workflows/sbom.yml`, `.github/workflows/osv.yml` added.
- Artifacts: SBOM + checksum + Grype + OSV reports uploaded per run.

## Phase 2 — SAST
- CodeQL (JS/TS) + Semgrep (security suite + custom rules for: eval/new Function/child_process/vm, obfuscation markers, outbound host allowlist).
- ESLint security rules.
Status: COMPLETED
Evidence:
- CI workflows `.github/workflows/codeql.yml`, `.github/workflows/semgrep.yml` added.
- Custom Semgrep rules in `.semgrep/custom.yml` (4 base rules: no-eval-new-function, no-node-exec-primitives, disallow-external-fetch-hosts, suspicious-base64-decode).
- CodeQL query suite: `security-and-quality` (200+ rules).
- Semgrep rulesets: `p/ci`, `p/javascript`, `p/owasp-top-ten`.
- Artifacts: CodeQL + Semgrep SARIF results uploaded per run (30-day retention).
- Weekly scheduled CodeQL scans (Monday 6 AM UTC).

## Phase 3 — Secrets + History
- Gitleaks full history + staged; add pre-commit hook to block future leaks.
Status: COMPLETED
Evidence:
- CI workflow `.github/workflows/gitleaks.yml` configured (full history scan, 90-day retention).
- Configuration `.gitleaks.toml` with baseline allowlist (node_modules, build artifacts, test files).
- Pre-commit hook installer: `scripts/install-gitleaks-hook.sh` (auto-backup, graceful handling).
- Package.json scripts: `secrets:scan`, `secrets:staged`, `secrets:install-hook`.
- PR documentation: `docs/prs/security-epic-TSE-0002-phase-3-secrets.md`.

## Phase 4 — Supply Chain (SCA)
- OSV-Scanner + npm audit + Dependabot PRs.
Status: COMPLETED
Evidence:
- CI workflow `.github/workflows/npm-audit.yml` with policy enforcement (`--audit-level=high`).
- CI workflow `.github/workflows/scorecards.yml` (OpenSSF Scorecard, weekly scans).
- Dependabot configuration `.github/dependabot.yml` (weekly updates, security labels).
- Artifacts: npm-audit results (30-day retention), Scorecard SARIF (90-day retention).
- PR documentation: `docs/prs/security-epic-TSE-0002-phase-4-supply-chain.md`.

## Phase 5 — Obfuscation/Backdoor Recon
- Grep-based and Semgrep rules to flag: base64 blobs + exec chains, unicode homoglyphs, hidden networking, non-allowlisted fetch/URL usage.
- Centralize outbound host allowlist.
Status: COMPLETED
Evidence:
- CI workflow `.github/workflows/backdoor-recon.yml` (grep reconnaissance, weekly Thursday scans).
- Semgrep extended rules 5-9 in `.semgrep/custom.yml` (long-base64-blob, unicode-homoglyphs, external-axios/websocket, networking-primitives).
- Base rules 1-4 (Phase 2) + Extended rules 5-9 (Phase 5) = 9 total Semgrep rules.
- Patterns: obfuscation markers (eval, Function, base64), hidden networking (http/net/ws).
- PR documentation: `docs/prs/security-epic-TSE-0002-phase-5-backdoor-recon.md`.

## Phase 6 — IaC/Cloud
- Checkov/tfsec on Terraform: CF Access policies strict, no wildcards, reasonable sessions.

## Phase 7 — Runtime Hardening
- Security headers (CSP/HSTS/XCTO/Referrer/Permissions/XFO) via Next config/middleware.
- Forbid dangerouslySetInnerHTML; input validation on handlers (Zod).

## Phase 8 — Behavior Security Tests
- Header assertions; fuzz form inputs; error handling (no stack traces).

## Phase 9 — CI/CD & Repo Security
- Require passing CodeQL/Semgrep/Gitleaks/OSV on PR.
- Branch protection + CODEOWNERS + dependency review.

## Phase 10 — Threat Modeling + Report
- STRIDE on data flows; OWASP ASVS/Top-10 mapping; final report with evidence and residual risk.

## Deliverables
- SBOM + scans, SAST reports, secrets scans, SCA, IaC scans, header configs, tests, CI workflows, and final audit report.
