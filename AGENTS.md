# Charting App (Next.js) — Agents Guide

## Purpose
- Next.js/TypeScript frontend for charting; consumes REST (MVP) and later gRPC/GraphQL as available.

## Install & Run
- Install: `npm install` (or `pnpm i`)
- Dev: `npm run dev`
- Build: `npm run build` / `npm run start`

## API Client Generation
- Preferred: consume OpenAPI generated from schemas for REST clients.
- Alternative: gRPC-web once gateway support is available.
- Keep generated clients out of VCS when possible; document generation steps.

## Proto Submodule
- Location: `proto/` (git submodule to `protobuf-schemas`).
- Update flow: bump submodule to a schema tag/commit, then regenerate clients.

## Env & Secrets
- Use `.env.local` for development; never commit secrets.
- Document required variables (e.g., `NEXT_PUBLIC_API_BASE_URL`).

## PRs & Quality
- Conventional commits; one logical change per PR.
- Lint/format: `npm run lint` / `npm run format`.
- Add/maintain unit/integration tests for components and API hooks.

