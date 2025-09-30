# Risk Engine JS - Crypto Loan Portfolio Risk Management

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Status](https://img.shields.io/badge/status-MVP%20Complete-brightgreen)
![License](https://img.shields.io/badge/license-Proprietary-red)

A world-class crypto loan risk management web application for managing sophisticated credit prime brokerage operations. Built with Next.js 15, TypeScript, and Clean Architecture principles.

---

## 🎯 Features

### Real-Time Risk Monitoring
- **Live Price Updates**: BTC, ETH, SOL prices tick every 2 seconds
- **Dynamic LTV Calculation**: Real-time loan-to-value ratios
- **Margin Status Indicators**: Healthy → Warning → Margin Call → Liquidation
- **Expected Loss Tracking**: Real-time portfolio risk metrics

### Advanced Analytics
- **VaR/CVaR Calculations**: 95% and 99% confidence intervals
- **Monte Carlo Simulation**: 1,000 trial portfolio loss simulation
- **Scenario Stress Testing**: 5 realistic market scenarios
- **Correlation Analysis**: Interactive BTC/ETH/SOL correlation heatmaps
- **Wrong-Way Risk Modeling**: Default probability increases with market stress

### Portfolio Management
- **10 Sample Loans**: $96M total exposure with BBB/A/AA ratings
- **Collateral Types**: BTC, ETH, SOL with asset-specific margin policies
- **Event Calendar**: Track loan rolls and interest payments
- **Optimization Tools**: Marginal VaR analysis and recommendations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Navigate to project directory
cd risk-engine-js

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access the Application

Open your browser to:
```
http://localhost:3000
```

The app will automatically redirect to the dashboard.

---

## 📊 Dashboard Navigation

### 1. **Portfolio Overview** (`/dashboard`)
- Real-time portfolio metrics
- Asset prices with live updates
- Loan table with margin status
- VaR, CVaR, Sharpe, Sortino ratios
- Concentration risk visualization

**Key Actions:**
- Click **"START LIVE"** to enable real-time price ticking
- View loans sorted by LTV (riskiest first)

---

### 2. **Drawdown Analysis** (`/dashboard/drawdown`)
- 30-day LTV timeline for each loan
- Margin band visualization (warn/call/liquidation)
- Probability of margin call (3d, 5d horizons)
- Probability of liquidation
- Excess collateral metrics

**Key Actions:**
- Select any loan to see its LTV history
- Identify historical near-misses

---

### 3. **Correlation Heatmap** (`/dashboard/correlations`)
- Historical 30-day correlations (BTC-ETH, BTC-SOL, ETH-SOL)
- Interactive sliders to adjust correlations
- Wrong-way risk correlation slider (default-to-drawdown)
- Dynamic VaR/CVaR recalculation
- Color-coded correlation matrix

**Key Actions:**
- Drag correlation sliders to see portfolio impact
- Higher correlations → Higher tail risk

---

### 4. **Scenario Lab** (`/dashboard/scenarios`)
- 5 Realistic Scenarios:
  - Bull Market Rally (2023 Q1)
  - 2020 COVID Crash
  - 2022 Luna/FTX Collapse
  - Stable Growth (Baseline)
  - High Volatility Regime
- PD curve visualization across time horizons
- Scenario comparison matrix
- Stressed prices and expected losses

**Key Actions:**
- Select multiple scenarios to compare
- View PD evolution (1d to 365d)
- Analyze wrong-way risk amplification

---

### 5. **Event Calendar** (`/dashboard/calendar`)
- Monthly calendar view
- Loan roll dates
- Interest payment dates
- Upcoming events list

**Key Actions:**
- Track loan maturity dates
- Plan liquidity needs

---

### 6. **Historical Simulation** (`/dashboard/history`)
- 90-day portfolio backtest
- Aggregate LTV timeline
- Expected loss evolution
- Max drawdown analysis
- Summary statistics

**Key Actions:**
- Identify historical stress periods
- Validate margin policies

---

### 7. **Portfolio Optimization** (`/dashboard/optimization`)
- Marginal VaR contribution per loan
- Revenue per unit risk analysis
- Optimization recommendations (REDUCE/MAINTAIN/INCREASE)
- Diversification metrics
- Capital efficiency analysis

**Key Actions:**
- Identify over/under-contributing loans
- Optimize portfolio composition

---

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (app/, components/)                  │
├─────────────────────────────────────────┤
│         Application Layer               │
│    (use cases, DTOs)                    │
├─────────────────────────────────────────┤
│           Domain Layer                  │
│    (entities, value objects)            │
├─────────────────────────────────────────┤
│       Infrastructure Layer              │
│    (adapters, repositories)             │
└─────────────────────────────────────────┘
```

### Domain Models

- **Loan**: Core entity with LTV, PD, LGD, margin calculations
- **Portfolio**: Aggregate root with VaR, CVaR, optimization
- **CryptoAsset**: BTC/ETH/SOL with margin policies
- **CreditRating**: BBB/A/AA with base PDs
- **Money**: USD value object

### Key Services

- **MarketDataService**: 3-year synthetic price history with correlations
- **ScenarioService**: 5 realistic stress scenarios
- **MonteCarloEngine**: 1000-trial simulation with t-copula
- **LocalStorageRepository**: Browser persistence

---

## 📈 Risk Calculations

### Value at Risk (VaR)
```
VaR[95%] = 95th percentile of simulated loss distribution
```

### Conditional VaR (CVaR / Expected Shortfall)
```
CVaR[95%] = mean(losses | loss > VaR[95%])
```

### Expected Loss
```
EL = EAD × PD × LGD
where PD_stressed = PD_base × (1 + drawdown × leverage × 2)
```

### Margin Event Probability
```
Uses log-normal price distribution:
P(margin call) = Φ(-z) where z = ln(drop) / (vol × √days)
```

### Sharpe Ratio
```
Sharpe = (Return - SOFR) / Volatility
```

---

## 🎨 Design System

### War-Room Military Theme

**Color Palette:**
- Background: `#0a0f14` (Deep tactical black)
- Primary: `#00ff88` (Neon green)
- Danger: `#ff3366` (Alert red)
- Warning: `#ffaa00` (Caution orange)
- Info: `#00ccff` (Intel blue)

**Typography:**
- Headings: JetBrains Mono (monospace)
- Body: Inter (sans-serif)

**Components:**
- `.panel`: Card-style container
- `.metric-card`: Key metric display
- `.btn-primary`: Primary action button
- `.status-indicator`: Animated status dot

---

## 🧪 Sample Portfolio

### Loan Characteristics
- **Number of Loans**: 10
- **Total Exposure**: $96,000,000
- **Risk Capital**: $100,000,000
- **Utilization**: 96%

### Credit Ratings
- BBB: 50% (5 loans, $48M)
- A: 40% (4 loans, $38M)
- AA: 10% (1 loan, $10M)

### Collateral Breakdown
- BTC: 60% (~$58M)
- ETH: 30% (~$29M)
- SOL: 10% (~$9M)

### Margin Policies
| Asset | Warn | Call | Liquidation |
|-------|------|------|-------------|
| BTC   | 70%  | 80%  | 90%         |
| ETH   | 65%  | 75%  | 85%         |
| SOL   | 60%  | 70%  | 80%         |

---

## 📚 Documentation

- **CLAUDE.md**: Comprehensive technical documentation (600+ lines)
- **TODO.md**: Progress tracker and future roadmap
- **README.md**: This file

---

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Charts**: Recharts 3.2
- **Dates**: date-fns 4.1
- **State**: React Context API
- **Persistence**: Browser localStorage

---

## 📦 Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

---

## 🎯 Future Enhancements

### High Priority
- [ ] Real CSV data integration (replace synthetic data)
- [ ] Loan CRUD UI (add/edit/delete)
- [ ] PDF/Excel export functionality
- [ ] Enhanced Monte Carlo (10,000 trials)

### Medium Priority
- [ ] Loss distribution histogram
- [ ] Custom scenario builder
- [ ] Backtesting framework
- [ ] WebSocket real-time feeds

### Low Priority (Post-MVP)
- [ ] Multi-portfolio management
- [ ] User authentication
- [ ] Real-time alerts
- [ ] Mobile app

---

## 🤝 Contributing

This is a proprietary component of the Quantfidential Trading Ecosystem.

---

## 📄 License

Proprietary - Quantfidential Trading Ecosystem

---

## 🙏 Acknowledgments

Built with Claude (Anthropic) using:
- Clean Architecture principles
- Domain-Driven Design
- SOLID principles
- Financial risk modeling best practices

---

## 🐛 Troubleshooting

### Issue: Live updates not working
**Solution**: Click the "START LIVE" button on the portfolio overview page

### Issue: Charts not rendering
**Solution**: Ensure you're using a modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Issue: Portfolio data lost
**Solution**: Data is stored in localStorage. Clearing browser data will reset the portfolio.

### Issue: Monte Carlo simulation slow
**Solution**: This is expected for 1000 trials. Future versions will use Web Workers.

---

## 📞 Support

For questions or issues, please refer to:
- **Technical Documentation**: `./CLAUDE.md`
- **Progress Tracker**: `./TODO.md`
- **Architecture Overview**: See "Architecture" section above

---

**Version**: 1.0.0 MVP
**Last Updated**: 2025-09-30
**Status**: Production-Ready Proof of Concept

**🚀 Ready to deploy!**