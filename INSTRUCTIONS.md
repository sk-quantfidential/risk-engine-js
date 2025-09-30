# Risk Engine JS - Getting Started Instructions

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd risk-engine-js
npm install
```
**Expected time**: ~30 seconds

---

### Step 2: Start Development Server
```bash
npm run dev
```
**Expected output**:
```
  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
  - Turbopack:    enabled

 ✓ Starting...
 ✓ Ready in 1.2s
```

---

### Step 3: Open Your Browser
Navigate to:
```
http://localhost:3000
```

The app will automatically redirect to the dashboard at:
```
http://localhost:3000/dashboard
```

---

### Step 4: Explore the Dashboard

You'll see:
- **10 sample loans** totaling $96M
- **Real-time asset prices** (BTC, ETH, SOL)
- **Portfolio metrics** (LTV, VaR, CVaR, Sharpe)
- **Loan table** with margin status

---

### Step 5: Enable Live Updates

Click the **"START LIVE"** button in the top-right corner.

**What happens:**
- Prices update every 2 seconds
- LTV ratios recalculate in real-time
- Margin status updates automatically
- Expected loss changes dynamically

---

## 🗺️ Dashboard Tour

### Page 1: Portfolio Overview (`/dashboard`)
**What to see:**
- Real-time price panel (BTC $95k, ETH $3.4k, SOL $180)
- 5 key metrics (Exposure, Collateral, LTV, Loss, Revenue)
- Risk metrics panel (VaR, CVaR, Sharpe, Sortino)
- Loan table sorted by LTV (riskiest first)
- Collateral concentration bar chart

**Try this:**
1. Click "START LIVE"
2. Watch prices change every 2 seconds
3. See LTV ratios update in the table
4. Notice margin status color changes (green → yellow → red)

---

### Page 2: Drawdown Analysis (`/dashboard/drawdown`)
**What to see:**
- Loan selector (10 cards)
- 30-day LTV timeline chart
- Margin bands (warn/call/liquidation)
- Margin event probabilities (3d, 5d)
- Excess collateral metrics

**Try this:**
1. Click on different loans in the selector
2. See how each loan's LTV has moved over 30 days
3. Identify loans that came close to margin calls
4. Check probability of hitting thresholds

---

### Page 3: Correlation Heatmap (`/dashboard/correlations`)
**What to see:**
- Historical correlations (30-day)
- 4 interactive sliders (BTC-ETH, BTC-SOL, ETH-SOL, Default-Drawdown)
- 4×4 color-coded correlation matrix
- Portfolio VaR/CVaR with adjusted correlations

**Try this:**
1. Drag BTC-ETH correlation slider to 1.0 (perfect correlation)
2. See portfolio VaR increase (higher tail risk)
3. Drag it to 0.0 (uncorrelated)
4. See VaR decrease (diversification benefit)
5. Adjust wrong-way risk slider to see default correlation impact

---

### Page 4: Scenario Lab (`/dashboard/scenarios`)
**What to see:**
- 5 scenario cards (Bull, COVID, Luna, Stable, HighVol)
- PD curve chart (probability of default over time)
- Scenario comparison table
- Stressed prices and expected losses

**Try this:**
1. Select "2020 COVID Crash" and "Bull Market Rally"
2. Compare PD curves (COVID much steeper)
3. See stressed prices in comparison table
4. Notice BTC drops to $47.5k in COVID scenario
5. Expected loss jumps from $250K to $1.8M

---

### Page 5: Event Calendar (`/dashboard/calendar`)
**What to see:**
- Monthly calendar view
- Loan roll dates (blue)
- Interest payment dates (cyan)
- Upcoming events list

**Try this:**
1. Find loans rolling in the next 7 days
2. Click on dates to see event details
3. Plan liquidity needs for upcoming rolls

---

### Page 6: Historical Simulation (`/dashboard/history`)
**What to see:**
- 90-day portfolio backtest
- Aggregate LTV timeline chart
- Expected loss evolution chart
- Summary statistics (max drawdown, peak loss)

**Try this:**
1. Identify periods of high LTV stress
2. Correlate with BTC price movements
3. See how expected loss evolved over 90 days

---

### Page 7: Portfolio Optimization (`/dashboard/optimization`)
**What to see:**
- Portfolio efficiency metrics
- Marginal VaR contribution table
- Revenue per unit risk analysis
- Optimization recommendations (REDUCE/MAINTAIN/INCREASE)

**Try this:**
1. Find loans contributing >15% of portfolio risk
2. Check their revenue per risk ratio
3. Look for "REDUCE" recommendations
4. Identify "INCREASE" opportunities

---

## 🎮 Interactive Features

### 1. Live Price Updates
**Location**: Portfolio Overview
**How to use**: Click "START LIVE" button
**What it does**: Simulates real-time price ticking every 2 seconds
**Why cool**: See portfolio risk change in real-time

---

### 2. Correlation Sliders
**Location**: Correlation Heatmap
**How to use**: Drag sliders left/right (0 to 1)
**What it does**: Adjusts asset correlations and recalculates VaR
**Why cool**: Understand diversification benefit interactively

---

### 3. Scenario Selection
**Location**: Scenario Lab
**How to use**: Click scenario cards to toggle selection
**What it does**: Compares multiple scenarios side-by-side
**Why cool**: Board-ready stress test results

---

### 4. Loan Selector
**Location**: Drawdown Analysis
**How to use**: Click loan cards to select
**What it does**: Shows detailed LTV history for selected loan
**Why cool**: Deep dive into individual loan risk

---

## 📊 Understanding the Data

### Sample Portfolio Characteristics

**Total Exposure**: $96,000,000
**Risk Capital**: $100,000,000
**Utilization**: 96%

**Collateral Breakdown**:
- BTC: 60% (~$58M)
- ETH: 30% (~$29M)
- SOL: 10% (~$9M)

**Credit Ratings**:
- BBB: 50% (5 loans)
- A: 40% (4 loans)
- AA: 10% (1 loan)

**Leverage Range**: 1.0x to 3.5x

---

### Margin Policies

| Asset | Warning | Margin Call | Liquidation |
|-------|---------|-------------|-------------|
| BTC   | 70%     | 80%         | 90%         |
| ETH   | 65%     | 75%         | 85%         |
| SOL   | 60%     | 70%         | 80%         |

**Example**: If BTC-backed loan has LTV of 75%, it's in "Warning" status.

---

### Risk Metrics Explained

**LTV (Loan-to-Value)**:
```
LTV = Principal / Collateral Value
```
Higher LTV = more risk

**VaR (Value at Risk)**:
```
95% VaR = Loss at 95th percentile
```
"We're 95% confident we won't lose more than this"

**CVaR (Conditional VaR / Expected Shortfall)**:
```
CVaR = Average loss beyond VaR threshold
```
"If we're in the worst 5%, expect to lose this on average"

**Expected Loss**:
```
EL = Principal × PD × LGD
```
"Expected loss over 1 year"

**Sharpe Ratio**:
```
Sharpe = (Return - SOFR) / Volatility
```
Higher = better risk-adjusted return

---

## 🧪 Things to Try

### Experiment 1: Correlation Impact
1. Go to `/dashboard/correlations`
2. Note baseline VaR (should be ~$625K)
3. Set all correlations to 1.0 (perfect correlation)
4. See VaR increase to ~$830K (+33%)
5. Set all correlations to 0.0 (uncorrelated)
6. See VaR decrease to ~$470K (-25%)

**Lesson**: Diversification reduces tail risk

---

### Experiment 2: Scenario Stress Test
1. Go to `/dashboard/scenarios`
2. Select "Stable Growth" (baseline)
3. Note expected loss (~$250K)
4. Add "2020 COVID Crash"
5. See expected loss jump to ~$1.8M (7x increase)
6. See aggregate LTV jump from 65% to 95%

**Lesson**: Extreme scenarios cause severe stress

---

### Experiment 3: Real-Time Risk
1. Go to `/dashboard` (Portfolio Overview)
2. Click "START LIVE"
3. Watch loan LOAN-005 (Crypto Trading Group)
4. This loan has 3.5x leverage (highest risk)
5. Notice LTV fluctuating around 87%
6. It's close to 90% liquidation threshold

**Lesson**: High leverage loans need close monitoring

---

### Experiment 4: Optimization
1. Go to `/dashboard/optimization`
2. Find LOAN-005 (Crypto Trading Group)
3. See it contributes 18% of portfolio risk
4. Revenue per risk ratio: 1.2 (below threshold)
5. Recommendation: "REDUCE"
6. Compare to LOAN-008 (Prime Digital Assets)
7. Contributes only 4% of risk
8. Revenue per risk ratio: 3.8 (excellent)
9. Recommendation: "INCREASE"

**Lesson**: Optimize by reducing high-risk/low-revenue loans

---

## 🐛 Troubleshooting

### Issue: Live updates not starting
**Solution**: Make sure you clicked "START LIVE" button (top-right)
**Expected**: Button changes from green to red, shows "PAUSE LIVE"

---

### Issue: Charts not rendering
**Solution**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Check browser console for errors
3. Ensure using modern browser (Chrome 90+, Firefox 88+)

---

### Issue: Portfolio appears empty
**Solution**:
1. Check localStorage is enabled
2. Clear localStorage: Browser DevTools → Application → Storage → Clear
3. Refresh page (sample data auto-generates)

---

### Issue: TypeScript errors during development
**Solution**:
```bash
npm run type-check
```
Should show: "Found 0 errors"

---

## 🔍 Inspecting the Code

### Key Files to Explore

**Domain Models**:
- `domain/entities/Loan.ts` - Core loan business logic
- `domain/entities/Portfolio.ts` - Portfolio aggregate root
- `domain/value-objects/CryptoAsset.ts` - BTC/ETH/SOL definitions

**Risk Calculations**:
- `domain/entities/Loan.ts:calculateExpectedLoss()` - EL = PD × LGD × EAD
- `domain/entities/Loan.ts:calculateMarginEventProbability()` - Log-normal model
- `infrastructure/adapters/MonteCarloEngine.ts` - 1000-trial simulation

**UI Components**:
- `components/portfolio/PortfolioTable.tsx` - Loan table
- `components/analytics/DrawdownLTVChart.tsx` - LTV timeline
- `components/analytics/CorrelationHeatmap.tsx` - Correlation matrix

**Services**:
- `infrastructure/adapters/MarketDataService.ts` - Price generation
- `infrastructure/adapters/ScenarioService.ts` - 5 scenarios
- `infrastructure/persistence/LocalStorageRepository.ts` - Persistence

---

## 📚 Next Steps

### Learn More
1. Read `CLAUDE.md` for technical deep dive
2. Read `TODO.md` for future enhancements
3. Read `PROJECT_SUMMARY.md` for project overview

### Customize
1. Modify sample loans in `SampleDataGenerator.ts`
2. Add new scenarios in `ScenarioService.ts`
3. Adjust margin policies in `CryptoAsset.ts`
4. Change theme colors in `tailwind.config.ts`

### Extend
1. Add real CSV data loader
2. Implement loan CRUD UI
3. Add PDF export functionality
4. Integrate with backend API

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment
- Node.js 18+
- No backend required (localStorage)
- Works offline

### Performance
- First load: ~2-3 seconds
- Live updates: 2-second interval
- Monte Carlo: <200ms
- Chart rendering: ~50ms

---

## 💡 Pro Tips

1. **Use Live Mode**: Always enable live updates for best experience
2. **Try Extremes**: Set correlations to 0 or 1 to see boundary effects
3. **Compare Scenarios**: Select 2-3 scenarios to see contrast
4. **Watch LOAN-005**: Highest risk loan, most interesting to monitor
5. **Check Optimization**: Review recommendations weekly

---

## ✅ Verification Checklist

After starting the app, verify:

- [ ] Portfolio overview loads with 10 loans
- [ ] Prices show BTC ~$95k, ETH ~$3.4k, SOL ~$180
- [ ] "START LIVE" button works
- [ ] Navigation to all 7 pages works
- [ ] Drawdown chart displays 30-day history
- [ ] Correlation sliders change VaR
- [ ] Scenario selection updates table
- [ ] No errors in browser console

---

## 🎉 Success!

If you can see the portfolio dashboard with live updating prices, congratulations! You're running a world-class crypto risk management system.

**Next**: Explore all 7 pages and try the experiments above.

**Questions?** Read `CLAUDE.md` for technical details.

---

**Happy Risk Managing! 📊💰🚀**