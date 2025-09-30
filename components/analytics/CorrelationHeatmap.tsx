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

  const getColor = (value: number): string => {
    if (value === 1.00) return '#00ff88';  // Primary (diagonal)
    if (value >= 0.80) return '#ff3366';   // Danger (high correlation)
    if (value >= 0.60) return '#ffaa00';   // Warning (moderate-high)
    if (value >= 0.40) return '#00ccff';   // Info (moderate)
    return '#374151';                       // Border (low)
  };

  const getTextColor = (value: number): string => {
    if (value >= 0.50) return '#0a0f14';  // Dark text for light backgrounds
    return '#e0e6ed';  // Light text for dark backgrounds
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
                  className="flex-1 mx-1 rounded"
                  style={{
                    backgroundColor: bgColor,
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  <span
                    className="font-mono font-bold text-sm"
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

      {/* Legend */}
      <div className="mt-4 grid grid-cols-5 gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00ff88' }}></div>
          <span className="text-text-secondary">Perfect (1.00)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff3366' }}></div>
          <span className="text-text-secondary">High (&gt;0.80)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffaa00' }}></div>
          <span className="text-text-secondary">Mod-High (0.60-0.80)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00ccff' }}></div>
          <span className="text-text-secondary">Moderate (0.40-0.60)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#374151' }}></div>
          <span className="text-text-secondary">Low (&lt;0.40)</span>
        </div>
      </div>
    </div>
  );
}