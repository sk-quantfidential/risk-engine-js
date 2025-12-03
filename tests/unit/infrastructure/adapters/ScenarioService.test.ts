/**
 * ScenarioService Tests - Infrastructure Layer
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ScenarioService, ScenarioParameters } from '@/infrastructure/adapters/ScenarioService';
import { AssetType } from '@/domain/value-objects/CryptoAsset';

describe('ScenarioService', () => {
  let service: ScenarioService;

  beforeEach(() => {
    service = new ScenarioService();
  });

  describe('scenario definitions', () => {
    it('should initialize 5 predefined scenarios', () => {
      const allScenarios = service.getAllScenarios();
      expect(allScenarios).toHaveLength(5);
    });

    it('should have bull-market scenario', () => {
      const scenario = service.getScenario('bull-market');
      expect(scenario).toBeDefined();
      expect(scenario!.name).toBe('Bull Market Rally');
      expect(scenario!.marketDrawdown).toBe(0);
      expect(scenario!.pdMultiplier).toBe(0.5);
    });

    it('should have covid-crash scenario', () => {
      const scenario = service.getScenario('covid-crash');
      expect(scenario).toBeDefined();
      expect(scenario!.name).toBe('2020 COVID Crash');
      expect(scenario!.marketDrawdown).toBe(0.5);
      expect(scenario!.volatilityMultiplier).toBe(3.0);
    });

    it('should have luna-collapse scenario', () => {
      const scenario = service.getScenario('luna-collapse');
      expect(scenario).toBeDefined();
      expect(scenario!.name).toBe('2022 Luna/FTX Collapse');
      expect(scenario!.marketDrawdown).toBe(0.65);
      expect(scenario!.pdMultiplier).toBe(4.0);
    });

    it('should have stable-growth scenario', () => {
      const scenario = service.getScenario('stable-growth');
      expect(scenario).toBeDefined();
      expect(scenario!.name).toBe('Stable Growth');
      expect(scenario!.marketDrawdown).toBe(0);
      expect(scenario!.volatilityMultiplier).toBe(1.0);
    });

    it('should have high-volatility scenario', () => {
      const scenario = service.getScenario('high-volatility');
      expect(scenario).toBeDefined();
      expect(scenario!.name).toBe('High Volatility Regime');
      expect(scenario!.marketDrawdown).toBe(0.15);
      expect(scenario!.volatilityMultiplier).toBe(2.0);
    });
  });

  describe('getScenarioIds', () => {
    it('should return all scenario IDs', () => {
      const ids = service.getScenarioIds();
      expect(ids).toHaveLength(5);
      expect(ids).toContain('bull-market');
      expect(ids).toContain('covid-crash');
      expect(ids).toContain('luna-collapse');
      expect(ids).toContain('stable-growth');
      expect(ids).toContain('high-volatility');
    });
  });

  describe('getScenario', () => {
    it('should return undefined for unknown scenario', () => {
      const scenario = service.getScenario('unknown-scenario');
      expect(scenario).toBeUndefined();
    });

    it('should return scenario for valid ID', () => {
      const scenario = service.getScenario('bull-market');
      expect(scenario).toBeDefined();
      expect(scenario!.name).toBe('Bull Market Rally');
    });
  });

  describe('applyScenarioPrices', () => {
    it('should apply bull market shocks correctly', () => {
      const currentPrices = {
        [AssetType.BTC]: 100000,
        [AssetType.ETH]: 4000,
        [AssetType.SOL]: 200,
      };

      const scenario = service.getScenario('bull-market')!;
      const stressedPrices = service.applyScenarioPrices(currentPrices, scenario);

      expect(stressedPrices[AssetType.BTC]).toBe(150000); // +50%
      expect(stressedPrices[AssetType.ETH]).toBe(6400);   // +60%
      expect(stressedPrices[AssetType.SOL]).toBe(360);    // +80%
    });

    it('should apply COVID crash shocks correctly', () => {
      const currentPrices = {
        [AssetType.BTC]: 100000,
        [AssetType.ETH]: 4000,
        [AssetType.SOL]: 200,
      };

      const scenario = service.getScenario('covid-crash')!;
      const stressedPrices = service.applyScenarioPrices(currentPrices, scenario);

      expect(stressedPrices[AssetType.BTC]).toBe(50000);  // -50%
      expect(stressedPrices[AssetType.ETH]).toBe(1800);   // -55%
      expect(stressedPrices[AssetType.SOL]).toBe(80);     // -60%
    });

    it('should not modify original prices', () => {
      const currentPrices = {
        [AssetType.BTC]: 100000,
        [AssetType.ETH]: 4000,
        [AssetType.SOL]: 200,
      };

      const scenario = service.getScenario('bull-market')!;
      service.applyScenarioPrices(currentPrices, scenario);

      expect(currentPrices[AssetType.BTC]).toBe(100000);
      expect(currentPrices[AssetType.ETH]).toBe(4000);
      expect(currentPrices[AssetType.SOL]).toBe(200);
    });
  });

  describe('calculateStressedPD', () => {
    it('should apply scenario multiplier only for zero drawdown', () => {
      const basePD = 0.01; // 1%
      const scenario = service.getScenario('stable-growth')!;
      const leverage = 2.0;

      const stressedPD = service.calculateStressedPD(basePD, scenario, leverage);

      // With marketDrawdown = 0, only pdMultiplier applies
      expect(stressedPD).toBe(0.01); // 1% × 1.0
    });

    it('should apply wrong-way risk with leverage', () => {
      const basePD = 0.01; // 1%
      const scenario = service.getScenario('covid-crash')!; // marketDrawdown = 0.5
      const leverage = 2.0;

      const stressedPD = service.calculateStressedPD(basePD, scenario, leverage);

      // PD = 0.01 × 3.0 × (1 + 0.5 × 2.0) = 0.03 × 2.0 = 0.06
      expect(stressedPD).toBe(0.06);
    });

    it('should cap stressed PD at 1.0', () => {
      const basePD = 0.5; // 50%
      const scenario = service.getScenario('luna-collapse')!;
      const leverage = 10.0;

      const stressedPD = service.calculateStressedPD(basePD, scenario, leverage);

      expect(stressedPD).toBe(1.0); // Capped at 100%
    });

    it('should handle zero leverage', () => {
      const basePD = 0.01;
      const scenario = service.getScenario('covid-crash')!;
      const leverage = 0;

      const stressedPD = service.calculateStressedPD(basePD, scenario, leverage);

      // PD = 0.01 × 3.0 × (1 + 0.5 × 0) = 0.03
      expect(stressedPD).toBe(0.03);
    });
  });

  describe('calculateStressedLGD', () => {
    it('should apply LGD multiplier', () => {
      const baseLGD = 0.40; // 40% LGD
      const scenario = service.getScenario('stable-growth')!;

      const stressedLGD = service.calculateStressedLGD(baseLGD, scenario);

      expect(stressedLGD).toBe(0.40); // 40% × 1.0
    });

    it('should increase LGD in stress scenarios', () => {
      const baseLGD = 0.40;
      const scenario = service.getScenario('covid-crash')!;

      const stressedLGD = service.calculateStressedLGD(baseLGD, scenario);

      expect(stressedLGD).toBe(0.80); // 40% × 2.0
    });

    it('should cap stressed LGD at 1.0', () => {
      const baseLGD = 0.60;
      const scenario = service.getScenario('luna-collapse')!; // lgdMultiplier = 2.5

      const stressedLGD = service.calculateStressedLGD(baseLGD, scenario);

      expect(stressedLGD).toBe(1.0); // Capped at 100%
    });
  });

  describe('generatePDCurve', () => {
    it('should generate PD curve over default horizons', () => {
      const basePD = 0.01; // 1% annual
      const leverage = 2.0;
      const scenario = service.getScenario('stable-growth')!;

      const curve = service.generatePDCurve(basePD, leverage, scenario);

      expect(curve).toHaveLength(10); // [1, 3, 5, 7, 14, 30, 60, 90, 180, 365]
      expect(curve[0].days).toBe(1);
      expect(curve[9].days).toBe(365);
    });

    it('should filter horizons beyond maxDays', () => {
      const basePD = 0.01;
      const leverage = 2.0;
      const scenario = service.getScenario('stable-growth')!;

      const curve = service.generatePDCurve(basePD, leverage, scenario, 30);

      expect(curve).toHaveLength(6); // [1, 3, 5, 7, 14, 30]
      expect(curve[curve.length - 1].days).toBe(30);
    });

    it('should scale PD by time factor', () => {
      const basePD = 0.365; // 36.5% annual
      const leverage = 0;
      const scenario = service.getScenario('stable-growth')!;

      const curve = service.generatePDCurve(basePD, leverage, scenario);

      // Find 1-day PD
      const day1 = curve.find(c => c.days === 1)!;
      expect(day1.pd).toBeCloseTo(0.001, 5); // 36.5% × (1/365) = 0.1%

      // Find 365-day PD
      const day365 = curve.find(c => c.days === 365)!;
      expect(day365.pd).toBe(0.365); // 36.5% × 1.0
    });

    it('should apply stress multipliers to curve', () => {
      const basePD = 0.01;
      const leverage = 2.0;
      const scenario = service.getScenario('covid-crash')!; // pdMultiplier = 3.0, marketDrawdown = 0.5

      const curve = service.generatePDCurve(basePD, leverage, scenario);

      // Stressed annual PD = 0.01 × 3.0 × (1 + 0.5 × 2.0) = 0.06
      const day365 = curve.find(c => c.days === 365)!;
      expect(day365.pd).toBeCloseTo(0.06, 5);
    });
  });

  describe('compareScenarios', () => {
    it('should compare multiple scenarios', () => {
      const comparison = service.compareScenarios(['bull-market', 'covid-crash']);

      expect(comparison.scenarios).toHaveLength(2);
      expect(comparison.scenarios[0].name).toBe('Bull Market Rally');
      expect(comparison.scenarios[1].name).toBe('2020 COVID Crash');
    });

    it('should calculate average metrics', () => {
      const comparison = service.compareScenarios(['stable-growth', 'covid-crash']);

      // stable-growth: drawdown=0, pdMult=1.0, volMult=1.0
      // covid-crash: drawdown=0.5, pdMult=3.0, volMult=3.0
      expect(comparison.metrics.avgDrawdown).toBe(0.25); // (0 + 0.5) / 2
      expect(comparison.metrics.avgPDMultiplier).toBe(2.0); // (1.0 + 3.0) / 2
      expect(comparison.metrics.avgVolatilityMultiplier).toBe(2.0); // (1.0 + 3.0) / 2
    });

    it('should filter out unknown scenarios', () => {
      const comparison = service.compareScenarios(['bull-market', 'unknown-scenario']);

      expect(comparison.scenarios).toHaveLength(1);
      expect(comparison.scenarios[0].name).toBe('Bull Market Rally');
    });

    it('should handle empty scenario list', () => {
      const comparison = service.compareScenarios([]);

      expect(comparison.scenarios).toHaveLength(0);
      expect(comparison.metrics.avgDrawdown).toBeNaN();
    });
  });

  describe('createCustomScenario', () => {
    it('should add custom scenario', () => {
      const customScenario: ScenarioParameters = {
        name: 'Custom Test',
        description: 'Test scenario',
        timeframe: '2025',
        marketDrawdown: 0.3,
        volatilityMultiplier: 1.5,
        assetShocks: {
          [AssetType.BTC]: 1.2,
          [AssetType.ETH]: 1.1,
          [AssetType.SOL]: 1.0,
        },
        correlationOverrides: {
          BTC_ETH: 0.8,
          BTC_SOL: 0.6,
          ETH_SOL: 0.7,
        },
        pdMultiplier: 1.5,
        lgdMultiplier: 1.2,
        tCopulaDOF: 4,
        defaultCorrelation: 0.35,
        liquidationSlippageMultiplier: 1.3,
        cureProbability: 0.6,
      };

      service.createCustomScenario('custom-test', customScenario);

      const retrieved = service.getScenario('custom-test');
      expect(retrieved).toBeDefined();
      expect(retrieved!.name).toBe('Custom Test');
      expect(retrieved!.marketDrawdown).toBe(0.3);
    });

    it('should allow overwriting existing scenarios', () => {
      const allBefore = service.getAllScenarios();
      const countBefore = allBefore.length;

      // Overwrite bull-market
      const customScenario: ScenarioParameters = {
        name: 'Modified Bull Market',
        description: 'Modified',
        timeframe: '2025',
        marketDrawdown: 0.1,
        volatilityMultiplier: 0.8,
        assetShocks: {
          [AssetType.BTC]: 1.3,
          [AssetType.ETH]: 1.4,
          [AssetType.SOL]: 1.5,
        },
        correlationOverrides: {
          BTC_ETH: 0.85,
          BTC_SOL: 0.70,
          ETH_SOL: 0.78,
        },
        pdMultiplier: 0.6,
        lgdMultiplier: 0.8,
        tCopulaDOF: 7,
        defaultCorrelation: 0.2,
        liquidationSlippageMultiplier: 0.9,
        cureProbability: 0.8,
      };

      service.createCustomScenario('bull-market', customScenario);

      const allAfter = service.getAllScenarios();
      expect(allAfter).toHaveLength(countBefore); // Same count

      const modified = service.getScenario('bull-market');
      expect(modified!.name).toBe('Modified Bull Market');
    });
  });

  describe('scenario parameter validation', () => {
    it('should have valid correlation matrices', () => {
      const allScenarios = service.getAllScenarios();

      allScenarios.forEach(scenario => {
        expect(scenario.correlationOverrides.BTC_ETH).toBeGreaterThanOrEqual(0);
        expect(scenario.correlationOverrides.BTC_ETH).toBeLessThanOrEqual(1);
        expect(scenario.correlationOverrides.BTC_SOL).toBeGreaterThanOrEqual(0);
        expect(scenario.correlationOverrides.BTC_SOL).toBeLessThanOrEqual(1);
        expect(scenario.correlationOverrides.ETH_SOL).toBeGreaterThanOrEqual(0);
        expect(scenario.correlationOverrides.ETH_SOL).toBeLessThanOrEqual(1);
      });
    });

    it('should have valid asset shocks', () => {
      const allScenarios = service.getAllScenarios();

      allScenarios.forEach(scenario => {
        expect(scenario.assetShocks[AssetType.BTC]).toBeGreaterThan(0);
        expect(scenario.assetShocks[AssetType.ETH]).toBeGreaterThan(0);
        expect(scenario.assetShocks[AssetType.SOL]).toBeGreaterThan(0);
      });
    });

    it('should have valid probability parameters', () => {
      const allScenarios = service.getAllScenarios();

      allScenarios.forEach(scenario => {
        expect(scenario.marketDrawdown).toBeGreaterThanOrEqual(0);
        expect(scenario.marketDrawdown).toBeLessThanOrEqual(1);
        expect(scenario.defaultCorrelation).toBeGreaterThanOrEqual(0);
        expect(scenario.defaultCorrelation).toBeLessThanOrEqual(1);
        expect(scenario.cureProbability).toBeGreaterThanOrEqual(0);
        expect(scenario.cureProbability).toBeLessThanOrEqual(1);
      });
    });

    it('should have positive multipliers', () => {
      const allScenarios = service.getAllScenarios();

      allScenarios.forEach(scenario => {
        expect(scenario.volatilityMultiplier).toBeGreaterThan(0);
        expect(scenario.pdMultiplier).toBeGreaterThan(0);
        expect(scenario.lgdMultiplier).toBeGreaterThan(0);
        expect(scenario.liquidationSlippageMultiplier).toBeGreaterThan(0);
        expect(scenario.tCopulaDOF).toBeGreaterThan(0);
      });
    });
  });
});
