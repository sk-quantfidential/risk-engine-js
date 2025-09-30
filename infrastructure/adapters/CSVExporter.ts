/**
 * CSV Exporter Utility
 * Exports synthetic price data to CSV format for reference
 */

import { AssetType } from '@/domain/value-objects/CryptoAsset';
import { MarketDataService, PriceBar } from './MarketDataService';

export class CSVExporter {
  static exportToCSV(asset: AssetType, history: PriceBar[]): string {
    // CSV Header
    const header = 'timestamp,open,high,low,close,volume\n';

    // CSV Rows
    const rows = history.map(bar => {
      const timestamp = bar.timestamp.toISOString();
      return `${timestamp},${bar.open},${bar.high},${bar.low},${bar.close},${bar.volume}`;
    }).join('\n');

    return header + rows;
  }

  static downloadCSV(asset: AssetType, csv: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${asset}_price_history.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportAllAssets(marketDataService: MarketDataService): void {
    for (const asset of Object.values(AssetType)) {
      const history = marketDataService.getHistory(asset);
      const csv = this.exportToCSV(asset, history);
      this.downloadCSV(asset, csv);
    }
  }
}
