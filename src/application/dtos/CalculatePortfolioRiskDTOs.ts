/**
 * Calculate Portfolio Risk Use Case DTOs
 *
 * Request and Response data transfer objects for calculating portfolio risk metrics.
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { PortfolioMetrics } from '@/domain/entities/Portfolio';

/**
 * Request to calculate portfolio risk metrics
 */
export class CalculatePortfolioRiskRequest {
  constructor(
    public readonly portfolioId: string,
    public readonly prices: Record<AssetType, number>,
    public readonly marketDrawdown: number = 0
  ) {}
}

/**
 * Response from calculating portfolio risk
 */
export class CalculatePortfolioRiskResponse {
  constructor(
    public readonly metrics: PortfolioMetrics,
    public readonly success: boolean,
    public readonly errorMessage?: string
  ) {}
}
