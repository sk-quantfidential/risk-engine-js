import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'healthy' | 'warning' | 'critical';
  subtitle?: string;
}

export function MetricCard({ label, value, trend, trendValue, status, subtitle }: MetricCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-primary';
    if (trend === 'down') return 'text-danger';
    return 'text-text-secondary';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '▲';
    if (trend === 'down') return '▼';
    return '●';
  };

  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="metric-label">{label}</div>
          <div className={`metric-value ${status === 'warning' ? 'text-warning' : status === 'critical' ? 'text-danger' : 'text-text-primary'}`}>
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-text-muted font-mono mt-1">{subtitle}</div>
          )}
        </div>
        {trend && trendValue && (
          <div className={`text-sm font-mono font-bold ${getTrendColor()}`}>
            <span className="mr-1">{getTrendIcon()}</span>
            {trendValue}
          </div>
        )}
      </div>
      {status && (
        <div className="mt-2 flex items-center space-x-2">
          <span className={`status-indicator status-${status}`}></span>
          <span className="text-xs font-mono text-text-muted uppercase">{status}</span>
        </div>
      )}
    </div>
  );
}