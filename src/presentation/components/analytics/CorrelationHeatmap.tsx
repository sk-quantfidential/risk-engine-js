import React from 'react';

interface CorrelationHeatmapProps {
  btcEthCorr: number;
  btcSolCorr: number;
  ethSolCorr: number;
  defaultCorr: number;
}

export function CorrelationHeatmap({ btcEthCorr, btcSolCorr, ethSolCorr, defaultCorr }: CorrelationHeatmapProps) {
  const assets = ['BTC', 'ETH', 'SOL', 'DEFAULT'];

  // Build correlation matrix
  const matrix = [
    [1.00, btcEthCorr, btcSolCorr, defaultCorr],
    [btcEthCorr, 1.00, ethSolCorr, defaultCorr],
    [btcSolCorr, ethSolCorr, 1.00, defaultCorr],
    [defaultCorr, defaultCorr, defaultCorr, 1.00],
  ];

  // Elegant gradient-based color scheme
  const getColor = (value: number): string => {
    if (value === 1.00) return '#00b85c';  // British Racing Green (diagonal)

    // Smooth gradient from low (blue-teal) to high (amber-coral)
    if (value >= 0.85) return '#e07856';   // Warm coral
    if (value >= 0.70) return '#f4a261';   // Warm amber
    if (value >= 0.55) return '#9fb8ad';   // Sage green
    if (value >= 0.40) return '#6ba3b8';   // Steel blue
    if (value >= 0.25) return '#4e7d8f';   // Deep teal
    return '#3a4a5a';                       // Charcoal (low)
  };

  const getTextColor = (value: number): string => {
    if (value >= 0.60 || value === 1.00) return '#1a1d23';  // Dark text for bright colors
    return '#e8ecf0';  // Light text for dark colors
  };

  return (
    <div className="panel">
      <h2 className="panel-header">CORRELATION MATRIX HEATMAP</h2>

      <div className="bg-background-tertiary rounded p-6">
        {/* Asset labels (top) */}
        <div className="flex items-center mb-2">
          <div className="w-24"></div>
          {assets.map(asset => (
            <div key={asset} className="flex-1 text-center text-sm font-mono font-bold text-text-secondary">
              {asset}
            </div>
          ))}
        </div>

        {/* Matrix rows */}
        {assets.map((rowAsset, rowIdx) => (
          <div key={rowAsset} className="flex items-center mb-2">
            {/* Row label */}
            <div className="w-24 text-right pr-4 text-sm font-mono font-bold text-text-secondary">
              {rowAsset}
            </div>

            {/* Matrix cells */}
            {assets.map((colAsset, colIdx) => {
              const value = matrix[rowIdx][colIdx];
              const bgColor = getColor(value);
              const textColor = getTextColor(value);

              return (
                <div
                  key={`${rowAsset}-${colAsset}`}
                  className="flex-1 mx-1 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: bgColor,
                    padding: '14px',
                    textAlign: 'center',
                    boxShadow: rowIdx === colIdx ? '0 0 12px rgba(0, 184, 92, 0.3)' : 'none',
                  }}
                >
                  <span
                    className="font-mono font-bold text-base"
                    style={{ color: textColor }}
                  >
                    {value.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Elegant Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <span className="text-xs font-mono text-text-muted mr-2">LOW</span>
          <div className="w-8 h-6 rounded" style={{ backgroundColor: '#3a4a5a' }}></div>
          <div className="w-8 h-6 rounded" style={{ backgroundColor: '#4e7d8f' }}></div>
          <div className="w-8 h-6 rounded" style={{ backgroundColor: '#6ba3b8' }}></div>
          <div className="w-8 h-6 rounded" style={{ backgroundColor: '#9fb8ad' }}></div>
          <div className="w-8 h-6 rounded" style={{ backgroundColor: '#f4a261' }}></div>
          <div className="w-8 h-6 rounded" style={{ backgroundColor: '#e07856' }}></div>
          <span className="text-xs font-mono text-text-muted ml-2">HIGH</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: '#00b85c', boxShadow: '0 0 10px rgba(0, 184, 92, 0.4)' }}></div>
          <span className="text-xs font-mono text-text-secondary">Perfect Correlation</span>
        </div>
      </div>
    </div>
  );
}