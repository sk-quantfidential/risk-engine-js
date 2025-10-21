# Contributing to Cor Prime Risk Engine

Thank you for your interest in contributing to the Cor Prime Risk Engine!

## Development Workflow

### 1. Branch Naming Convention

Follow the epic naming convention:

```
type/epic-TSE-9999-milestone-description

Examples:
  feature/epic-TSE-0001-auth-implement-jwt-tokens
  fix/epic-TSE-0042-ui-fix-button-alignment
  chore/epic-TSE-0001-foundation-add-configuration
```

Valid types: `feature`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

### 2. Making Changes

```bash
# Create feature branch
git checkout -b feature/epic-TSE-XXXX-milestone-description

# Make changes
# ... code, test, iterate ...

# Run validation before committing
./scripts/validate-all.sh

# Commit with conventional commit format
git commit -m "feat(epic-TSE-XXXX): add feature description"
```

### 3. Pull Request Process

#### Option A: Using create-pr.sh (Recommended)

```bash
# Create PR documentation
mkdir -p docs/prs
# Copy and fill in template

# Create PR automatically
./scripts/create-pr.sh
```

#### Option B: Manual PR Creation

1. Create PR documentation in `docs/prs/`
2. Push your branch: `git push origin <branch-name>`
3. Open PR on GitHub
4. Ensure CI checks pass

### 4. Code Standards

#### TypeScript
- Strict mode enabled
- Explicit types at module boundaries
- Use `@/...` path alias for imports
- 2-space indentation
- No trailing whitespace

#### Architecture
- Follow Clean Architecture layers:
  - Domain: Pure business logic
  - Application: Use cases, ports
  - Infrastructure: Adapters, external services
  - Presentation: Next.js pages, components

#### Testing
- Write tests for domain logic
- Use Jest for unit and integration tests
- Run tests before committing: `npm test`

#### Styling
- Use Tailwind CSS exclusively
- Follow dark theme color scheme
- Maintain accessibility standards

### 5. Commit Messages

Follow conventional commit format:

```
type(epic-XXX-9999): description

Examples:
  feat(epic-TSE-0001): add user authentication
  fix(epic-TSE-0042): resolve timeout errors
  docs(epic-TSE-0001): update README
  chore(epic-TSE-0001): update dependencies
```

### 6. Pre-Commit Checklist

- [ ] Code follows TypeScript standards
- [ ] Tests pass: `npm test`
- [ ] Type check passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Validation passes: `./scripts/validate-all.sh`
- [ ] PR documentation created in `docs/prs/`
- [ ] Commit message follows conventional format

### 7. Security

- Never commit secrets or API keys
- Pre-commit hooks run Gitleaks scanning
- Review security audit results
- Report security issues privately

### 8. Getting Help

- Read `CLAUDE.md` for component overview
- Read `AGENTS.md` for architecture details
- Check existing PR documentation in `docs/prs/`
- Review test files for examples

## Questions?

For questions or discussions, open an issue or reach out to the maintainers.

---

**Last Updated**: 2025-01-21
