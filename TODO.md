# Risk Engine JS - TODO & Progress Tracker

## Project Status: ✅ MVP COMPLETE

**Last Updated**: 2025-11-04
**Version**: 1.0.0
**Status**: Production-ready MVP with all core features implemented
**Current Branch**: `refactor/epic-TSE-0004-clean-architecture`
**Ready For**: Pull Request Review

---

## 🔒 Security Audit Progress

### Epic TSE-0002: Comprehensive Security Audit

**Phase 0: Hygiene** ✅ COMPLETED
- [x] Enhanced .gitignore for secrets/cache/logs
- [x] CODEOWNERS configuration
- [x] Dependabot for automated dependency updates
- [x] Security audit plan documented

**Phase 1: Inventory & SBOM** ✅ COMPLETED
- [x] SBOM generation workflow (Syft → SPDX format)
- [x] Vulnerability scanning (Grype + OSV-Scanner)
- [x] Artifact retention (90 days SBOM/Grype, 30 days OSV)
- [x] Local development scripts (sbom:syft, scan:grype, scan:osv)
- [x] Cryptographic checksums for SBOM integrity
- [x] CI workflows: `.github/workflows/sbom.yml`, `.github/workflows/osv.yml`
- [x] PR documentation: `docs/prs/security-epic-TSE-0002-phase-1-inventory-and-sbom.md`

**Phase 2: SAST** ✅ COMPLETED
- [x] CodeQL workflow configured (`.github/workflows/codeql.yml`)
- [x] Semgrep workflow configured (`.github/workflows/semgrep.yml`)
- [x] Custom Semgrep rules (`.semgrep/custom.yml` - 4 base rules)
- [x] CodeQL query suite: `security-and-quality` (200+ security rules)
- [x] Semgrep rulesets: `p/ci`, `p/javascript`, `p/owasp-top-ten`
- [x] SARIF artifact uploads (30-day retention)
- [x] Weekly scheduled CodeQL scans (Monday 6 AM UTC)
- [x] PR documentation: `docs/prs/security-epic-TSE-0002-phase-2-sast.md`

**Phase 3: Secrets & History** ✅ COMPLETED
- [x] Gitleaks workflow configured (`.github/workflows/gitleaks.yml`)
- [x] Gitleaks configuration (`.gitleaks.toml` with baseline allowlist)
- [x] Pre-commit hook installation script (`scripts/install-gitleaks-hook.sh`)
- [x] Package.json scripts (`secrets:scan`, `secrets:staged`, `secrets:install-hook`)
- [x] PR documentation: `docs/prs/security-epic-TSE-0002-phase-3-secrets.md`

**Phase 4: Supply Chain (SCA)** ✅ COMPLETED
- [x] npm-audit workflow configured (`.github/workflows/npm-audit.yml`)
- [x] Scorecard workflow configured (`.github/workflows/scorecards.yml`)
- [x] Dependabot configuration (`.github/dependabot.yml` from Phase 0)
- [x] Supply chain policy enforcement (`--audit-level=high` blocks High/Critical)
- [x] PR documentation: `docs/prs/security-epic-TSE-0002-phase-4-supply-chain.md`

**Phase 5: Backdoor Recon** ✅ COMPLETED
- [x] Backdoor recon workflow configured (`.github/workflows/backdoor-recon.yml`)
- [x] Grep reconnaissance patterns (obfuscation markers, hidden networking)
- [x] Semgrep extended rules 5-9 in `.semgrep/custom.yml` (Phase 2)
- [x] Weekly scheduled scans (Thursday 7 AM UTC)
- [x] PR documentation: `docs/prs/security-epic-TSE-0002-phase-5-backdoor-recon.md`

**Phases 6-10**: Planned (IaC, Runtime Hardening, Behavior Tests, CI/CD Security, Threat Modeling)

**Evidence Artifacts Available**:
- SBOM artifacts with checksums (90-day retention)
- Grype vulnerability scan results (JSON + SARIF)
- OSV scanner results
- CodeQL SARIF results (30-day retention)
- Semgrep SARIF results (30-day retention)

---

## 🏗️ Clean Architecture Refactoring

### Epic TSE-0004: Clean Architecture Ports & Boundaries

**Status**: 🚧 IN PROGRESS
**Branch**: `refactor/epic-TSE-0004-clean-architecture-ports`
**Started**: 2025-11-04

**Goal**: Fix architectural boundary violations and implement proper ports & adapters pattern throughout the codebase.

**Phase 1: Foundation Ports** 🚧 IN PROGRESS
- [x] Phase 1.1: Separate LoadDemoPortfolioUseCase for demo data
  - Created LoadDemoPortfolioUseCase with explicit Infrastructure dependency
  - Fixed Application → Infrastructure violation in LoadPortfolioUseCase
  - Added comprehensive tests (10 new tests, all passing)
  - Updated MarketDataProvider to orchestrate both use cases
- [x] Phase 1.2: Extend IMarketDataProvider with missing analytics methods
  - Added `calculateHistoricalCorrelation(asset1, asset2, windowHours)` to port
  - Added `getHistoryWindow(asset, windowHours)` to port
  - Extended `getMaxDrawdown(asset, windowHours?)` with optional parameter
  - Updated MarketDataService to implement new port methods
  - Fixed presentation layer to use port methods (correlations/page, history/page, DrawdownLTVChart)
- [x] Phase 1.3: Hide Infrastructure from MarketDataProvider context
  - Changed context interface to expose `marketDataProvider: IMarketDataProvider` (not concrete MarketDataService)
  - Changed context interface to expose `portfolioRepository: IPortfolioRepository` (not concrete LocalStorageRepository)
  - Updated CSVExporter to accept IMarketDataProvider and use `getPriceHistory()` (port method)
  - Updated AssetPricePanel props and usage to accept IMarketDataProvider
  - Updated DrawdownLTVChart props and usage to accept IMarketDataProvider
  - Updated all dashboard pages (page.tsx, drawdown, correlations, history) to use new property names
- [ ] Phase 1.4: Update Presentation to use port methods via context
  - Audit all presentation components for Infrastructure leaks
  - Replace direct Infrastructure calls with port method calls
  - Add architectural boundary tests

**Phase 2: Risk & Scenario Ports** 📋 PLANNED
- [ ] Phase 2.1: Create IRiskEngine port
- [ ] Phase 2.2: Wrap MonteCarloEngine as CpuRiskEngine adapter
- [ ] Phase 2.3: Create IScenarioService port
- [ ] Phase 2.4: Make ScenarioService implement IScenarioService
- [ ] Phase 2.5: Add use-cases for risk operations
- [ ] Phase 2.6: Update Presentation to use new risk use-cases

**Documentation**:
- PR documentation: `docs/prs/refactor-epic-TSE-0004-clean-architecture.md` (1200+ lines)

---

## ✅ Completed Features

### Phase 1: Foundation & Architecture ✅
- [x] Next.js 15 project initialization with TypeScript
- [x] Tailwind CSS war-room military theme
- [x] Clean Architecture structure (domain/application/infrastructure)
- [x] Domain models: Loan, Portfolio, CryptoAsset, CreditRating, Money
- [x] Value objects with business logic encapsulation
- [x] LocalStorage persistence layer
- [x] Sample data generator (10 loans, $96M portfolio)

### Phase 2: Market Data & Simulations ✅
- [x] MarketDataService with 3-year synthetic price history
- [x] Correlated price generation (BTC/ETH/SOL)
- [x] Historical correlation calculations
- [x] Historical volatility calculations
- [x] Max drawdown calculations
- [x] Real-time price ticking simulation (SSE-style)
- [x] MarketDataProvider context for app-wide state

### Phase 3: Risk Calculation Engine ✅
- [x] VaR/CVaR calculations (95%, 99%)
- [x] Probability of Default (PD) modeling
- [x] Loss Given Default (LGD) with slippage
- [x] Expected Loss calculations
- [x] Sharpe and Sortino ratio calculations
- [x] Margin event probability calculations (1d, 3d, 5d, 30d)
- [x] Wrong-way risk modeling
- [x] Concentration risk metrics (HHI, asset allocation)

### Phase 4: Monte Carlo Engine ✅
- [x] 1000-trial portfolio loss simulation
- [x] Correlated asset price paths
- [x] t-Copula for correlated defaults
- [x] Scenario-based stress testing
- [x] Loss distribution statistics
- [x] Price path visualization

### Phase 5: Scenario Analysis ✅
- [x] ScenarioService with 5 realistic scenarios:
  - Bull Market Rally (2023 Q1)
  - 2020 COVID Crash
  - 2022 Luna/FTX Collapse
  - Stable Growth (Baseline)
  - High Volatility Regime
- [x] Scenario parameter definitions (PD multipliers, correlations, volatility)
- [x] Stressed price calculations
- [x] Scenario comparison matrix
- [x] PD curve generation across time horizons

### Phase 6: User Interface Components ✅

#### Portfolio Dashboard ✅
- [x] Navigation with 7 pages
- [x] Real-time asset prices (BTC/ETH/SOL)
- [x] Live price updates toggle
- [x] Portfolio overview metrics
- [x] Loan table with LTV and margin status
- [x] Risk metrics panel (VaR, CVaR, Sharpe, Sortino)
- [x] Concentration risk visualization

#### Drawdown/LTV Analysis ✅
- [x] Loan selector grid
- [x] 30-day LTV timeline chart
- [x] Margin band visualization (warn/call/liquidation)
- [x] Margin event probability display (3d/5d)
- [x] Excess collateral metrics
- [x] Real-time margin status indicators

#### Correlation Heatmap ✅
- [x] Historical correlation calculations (30-day)
- [x] Interactive correlation sliders (BTC-ETH, BTC-SOL, ETH-SOL)
- [x] Wrong-way risk correlation slider
- [x] Color-coded heatmap matrix
- [x] Dynamic portfolio risk recalculation
- [x] Impact analysis on VaR/CVaR

#### Scenario Lab ✅
- [x] Scenario selector with 5 scenarios
- [x] PD curve visualization across time horizons
- [x] Scenario comparison matrix
- [x] Stressed prices display
- [x] Expected loss by scenario
- [x] Wrong-way risk explanation
- [x] Multi-scenario overlay charts

#### Event Calendar ✅
- [x] Monthly calendar view
- [x] Loan roll date tracking
- [x] Interest payment dates
- [x] Upcoming events list
- [x] Event type color coding

#### Historical Simulation ✅
- [x] 90-day portfolio backtest
- [x] Aggregate LTV timeline
- [x] Expected loss evolution
- [x] Max drawdown analysis
- [x] Summary statistics

#### Portfolio Optimization ✅
- [x] Marginal risk contribution analysis
- [x] Revenue per unit risk calculations
- [x] Optimization recommendations
- [x] Diversification metrics
- [x] Capital efficiency analysis
- [x] Asset allocation suggestions

---

## 🚀 Future Enhancements (Post-MVP)

### Phase 7: Enhanced Analytics
- [ ] Full Monte Carlo results visualization
- [ ] Loss distribution histograms
- [ ] Drawdown distribution charts
- [ ] Tail risk analysis (EVT)
- [ ] Backtesting framework with P&L attribution

### Phase 8: Data Integration ✅
- [x] Coinbase API importer (4 years hourly OHLCV)
- [x] CSV import/export functionality
- [x] Real-time price data from Coinbase
- [x] Automatic current price detection from latest candle
- [x] Progress tracking for API imports
- [ ] Historical SOFR rate integration
- [ ] Real-time WebSocket price feeds
- [ ] Database persistence (PostgreSQL)

### Phase 9: Advanced Features ✅ (Partially)
- [x] Loan editing UI with validation
- [x] Price editing UI for manual adjustments
- [x] Professional sci-fi theme with British Racing Green
- [x] Enhanced correlation heatmap with gradients
- [ ] Loan creation UI (add new loans)
- [ ] Custom scenario builder
- [ ] Stress test scenario library expansion
- [ ] Multi-portfolio management
- [ ] User authentication and permissions
- [ ] Export to PDF/Excel reports

### Phase 10: External Service Integration
- [ ] gRPC integration with trading ecosystem
- [ ] Risk-monitor-py service communication
- [ ] Audit-correlator event logging
- [ ] Market-data-simulator integration
- [ ] Real-time risk alerts via WebSocket

### Phase 11: Performance & Scale
- [ ] Web Workers for heavy calculations
- [ ] Memoization of expensive computations
- [ ] Virtualized tables for large portfolios
- [ ] Caching layer (Redis)
- [ ] Performance benchmarking

---

## 📋 Known Limitations & Technical Debt

1. **Monte Carlo Engine**: t-CDF approximation is simplified; consider numerical integration
2. **Correlation Structure**: Uses simple Cholesky decomposition; could enhance with DCC-GARCH
3. **Wrong-Way Risk**: Piecewise linear model; consider regime-switching models
4. **VaR Calculations**: Current implementation is parametric; add historical and Monte Carlo VaR
5. **Performance**: Large portfolios (>100 loans) may need optimization
6. **Mobile Responsiveness**: Dashboard optimized for desktop; mobile needs enhancement

---

## 🎯 Testing Checklist

### Manual Testing ✅
- [x] Navigate all 7 dashboard pages
- [x] Toggle live price updates
- [x] Adjust correlation sliders
- [x] Compare multiple scenarios
- [x] Verify margin status calculations
- [x] Check localStorage persistence
- [x] Test with browser devtools (no console errors)

### Phase 3: Comprehensive Automated Testing ✅ COMPLETED
**Status**: 564 tests passing out of 564 total (100% pass rate)
**Completion Date**: 2025-11-04

#### Domain Layer Tests ✅ (198 tests passing)
- [x] Loan entity tests (margin calculations, expected loss, metrics)
- [x] Portfolio entity tests (aggregation, risk contributions)
- [x] CryptoAsset value object tests
- [x] CreditRating value object tests
- [x] Money value object tests

#### Application Layer Tests ✅ (52 tests passing)
- [x] LoadPortfolio use case tests
- [x] SaveLoan use case tests
- [x] DeleteLoan use case tests
- [x] CalculateRiskMetrics use case tests
- [x] Port interface mocking

#### Infrastructure Layer Tests ✅ (137 tests passing)
- [x] LocalStorageRepository tests
- [x] MarketDataService tests (price generation, correlations)
- [x] ScenarioService tests
- [x] MonteCarloEngine tests
- [x] SampleDataGenerator tests

#### Presentation Layer Tests ✅ (177 tests passing)
**All Components Passing** ✅:
- [x] MetricCard component (28 tests)
- [x] MarketDataProvider context (23 tests)
- [x] PriceEditModal component
- [x] CoinbaseImportModal component
- [x] CSVImportModal component
- [x] RiskMetricsPanel (15 tests) - HHI assertion fixes
- [x] CorrelationHeatmap (7 tests) - Symmetric matrix fixes
- [x] ScenarioComparison (6 tests) - CreditRating and assertion fixes
- [x] PDCurveChart (6 tests) - Portfolio entity integration
- [x] DrawdownLTVChart (4 tests) - MarketDataService props
- [x] PortfolioTable (15 tests) - Date formatting and data structure fixes
- [x] LoanEditModal (9 tests) - Form validation and CreditRating fixes
- [x] Navigation (21 tests) - Timer cleanup with act() wrapper
- [x] AssetPricePanel (26 tests) - CSVExporter pragmatic approach

**Testing Infrastructure**:
- [x] Jest 30.1.3 with TypeScript support
- [x] React Testing Library
- [x] Test coverage reporting
- [x] Module path aliasing (@/ imports)
- [x] Console error suppression for expected errors

### Future Testing
- [ ] E2E tests with Playwright
- [ ] Performance tests (Monte Carlo benchmarks)
- [ ] Visual regression tests
- [ ] Load testing for large portfolios

---

## 📚 Documentation Status

- [x] CLAUDE.md - Comprehensive architecture documentation
- [x] TODO.md - This file
- [x] Inline code comments for complex logic
- [ ] API documentation (future)
- [ ] User guide / walkthrough
- [ ] Deployment guide

---

## 🎓 Learning & Reference

### Key Concepts Implemented
- Clean Architecture (Domain-Driven Design)
- SOLID principles
- Value Objects and Entities
- Monte Carlo simulation with variance reduction
- Copula modeling (t-copula for tail dependence)
- Credit risk modeling (PD, LGD, EAD)
- Market risk modeling (VaR, CVaR, MPoR)
- Wrong-way risk
- Stress testing and scenario analysis

### Financial Modeling References
- Basel III capital requirements
- Credit risk modeling (Merton, CreditMetrics)
- Copula methods for credit portfolio risk
- Crypto loan margin frameworks

---

## 🏁 Next Steps to Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000

# Start live price updates from dashboard
Click "START LIVE" button
```

---

**Project Owner**: Quantfidential Trading Ecosystem
**Lead Developer**: Claude (Anthropic)
**Technology Stack**: Next.js 15, TypeScript, Tailwind CSS, Recharts