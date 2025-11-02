# Crypto Loan Risk Engine

**World-class crypto loan portfolio risk management and portfolio optimization platform**

![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![Status](https://img.shields.io/badge/status-MVP%20Complete-success)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)

---

## 🎯 Overview

The **Crypto Loan Risk Engine** is a sophisticated risk management system for crypto-collateralized loan portfolios. Built with Next.js 15, TypeScript, and Clean Architecture principles, it provides institutional-grade risk analytics with real-time monitoring, scenario stress testing, and portfolio optimization.

### Key Features

- **Real-Time Risk Monitoring** - Live price updates with instant portfolio recalculation
- **Advanced Risk Metrics** - VaR/CVaR, Expected Loss, Sharpe/Sortino ratios, margin event probabilities
- **Scenario Stress Testing** - 5 realistic market scenarios (COVID, Luna/FTX, Bull Market, etc.)
- **Monte Carlo Simulation** - 1000-trial portfolio loss simulation with t-copula for tail dependence
- **Interactive Analytics** - Correlation heatmaps, LTV timelines, PD curves, optimization recommendations
- **Real Market Data** - Coinbase API integration for 4 years of hourly OHLCV data
- **Professional UI** - Dark sci-fi theme with British Racing Green accents

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Build for Production

```bash
# Type check
npm run type-check

# Build
npm run build

# Start production server
npm start
```

---

## 📊 Dashboard Pages

### 1. **Portfolio Overview** (`/dashboard`)
- Real-time asset prices (BTC/ETH/SOL) with live updates
- Portfolio risk metrics: Total exposure, aggregate LTV, expected loss, VaR/CVaR
- Loan table with margin status, collateral values, roll dates
- Concentration risk visualization (HHI, asset allocation)

### 2. **Drawdown & LTV Analysis** (`/dashboard/drawdown`)
- 6-month LTV timeline charts per loan
- Margin bands visualization (warn/call/liquidation thresholds)
- Margin event probabilities (3d, 5d horizons)
- Excess collateral metrics
- Loan selector grid

### 3. **Correlation Analysis** (`/dashboard/correlations`)
- Historical correlation heatmap (BTC, ETH, SOL, DEFAULT)
- Interactive correlation sliders with real-time VaR impact
- Wrong-way risk modeling
- Elegant gradient color scheme

### 4. **Scenario Lab** (`/dashboard/scenarios`)
- 5 realistic market scenarios comparison
- PD curves across time horizons (1d to 365d)
- Stressed price calculations
- Expected loss by scenario
- Multi-scenario overlay charts

### 5. **Event Calendar** (`/dashboard/calendar`)
- Monthly calendar view
- Loan roll date tracking
- Interest payment dates
- Upcoming events list

### 6. **Historical Simulation** (`/dashboard/history`)
- 90-day portfolio backtest
- Aggregate LTV timeline
- Expected loss evolution
- Max drawdown analysis

### 7. **Portfolio Optimization** (`/dashboard/optimization`)
- Marginal risk contribution analysis
- Revenue per unit risk calculations
- Optimization recommendations
- Diversification metrics
- Capital efficiency analysis

---

## 🔌 Data Integration

### Coinbase API

**Fetch real market data** - Click "📡 COINBASE API" button to automatically download:
- 4 years of hourly OHLCV data for BTC, ETH, SOL
- ~35,000 candles per asset (~105,000 total)
- Takes ~2-3 minutes with progress tracking
- No authentication required (public API)

### CSV Import

**Upload your own data** - Click "IMPORT CSV" button:
- Format: `timestamp,open,high,low,close,volume`
- Supports any timeframe and length
- Automatic current price detection from last candle

### CSV Export

**Download sample data** - Click "EXPORT CSV" button:
- Generates 3 CSV files (BTC, ETH, SOL)
- Shows expected format for imports
- Based on synthetic or imported real data

---

## 🎯 Key Metrics

### Portfolio Metrics
- **Total Exposure**: Sum of all loan principals
- **Aggregate LTV**: Portfolio-weighted average LTV
- **Expected Loss**: Sum of individual loan expected losses
- **VaR (95%, 99%)**: Value at Risk at two confidence levels
- **CVaR (95%, 99%)**: Conditional Value at Risk (Expected Shortfall)
- **Sharpe Ratio**: Risk-adjusted return metric
- **Sortino Ratio**: Downside risk-adjusted return

### Loan Metrics
- **LTV**: Loan-to-Value ratio (Principal / Collateral Value)
- **Margin Status**: healthy, warning, call, liquidation
- **Expected Loss**: EAD × PD × LGD
- **Excess Collateral**: Buffer above liquidation threshold
- **Margin Event Probability**: P(margin call) and P(liquidation) in N days

### Concentration Metrics
- **HHI**: Herfindahl-Hirschman Index (portfolio concentration)
- **Asset Allocation**: Exposure by collateral asset type
- **Max Single Exposure**: Largest loan as % of portfolio

---

## 📁 Project Structure

```
risk-engine-js/
├── app/                          # Next.js App Router
│   ├── dashboard/                # Dashboard pages
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── common/                   # Shared components
│   ├── portfolio/                # Portfolio components
│   └── analytics/                # Analytics components
│
├── domain/
│   ├── entities/                 # Domain entities
│   └── value-objects/            # Value objects
│
├── infrastructure/
│   ├── adapters/                 # External adapters
│   └── persistence/              # Data persistence
│
├── CLAUDE.md                     # Architecture documentation
├── TODO.md                       # Progress tracker
└── README.md                     # This file
```

---

## 📚 Documentation

- **CLAUDE.md** - Comprehensive architecture and technical documentation
- **TODO.md** - Project progress tracker and roadmap
- **README.md** - This file (user guide and quick reference)

---

## 🚦 Known Limitations

1. **Portfolio Size**: Optimized for ~100 loans (may lag with larger portfolios)
2. **Mobile**: Dashboard optimized for desktop (1920x1080+)
3. **Monte Carlo**: 1000 trials for speed (production typically uses 10,000+)

---

## 🔮 Future Enhancements

- Enhanced analytics (loss distributions, tail risk analysis)
- External service integration (gRPC, WebSocket)
- Advanced features (loan creation, custom scenarios, multi-portfolio)

---

## 👨‍💻 Credits

**Project**: Quantfidential Trading Ecosystem
**Component**: Cor Prime Risk Engine (risk-engine-js)
**Architecture**: Clean Architecture, Domain-Driven Design
**Lead Developer**: Claude (Anthropic)
**Version**: 1.0.0
**Status**: MVP Complete - Production Ready

---

**Last Updated**: 2025-09-30