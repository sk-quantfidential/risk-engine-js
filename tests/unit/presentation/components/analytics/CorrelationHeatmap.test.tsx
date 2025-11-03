/**
 * CorrelationHeatmap Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { CorrelationHeatmap } from '@/presentation/components/analytics/CorrelationHeatmap';

describe('CorrelationHeatmap', () => {
  const mockProps = {
    btcEthCorr: 0.82,
    btcSolCorr: 0.68,
    ethSolCorr: 0.75,
    defaultCorr: 0.45,
  };

  describe('rendering', () => {
    it('should render component header', () => {
      render(<CorrelationHeatmap {...mockProps} />);
      expect(screen.getByText(/CORRELATION/i)).toBeInTheDocument();
    });

    it('should render all asset labels', () => {
      render(<CorrelationHeatmap {...mockProps} />);

      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('SOL')).toBeInTheDocument();
      expect(screen.getByText('DEFAULT')).toBeInTheDocument();
    });

    it('should render correlation values', () => {
      render(<CorrelationHeatmap {...mockProps} />);

      expect(screen.getByText('0.82')).toBeInTheDocument();
      expect(screen.getByText('0.68')).toBeInTheDocument();
      expect(screen.getByText('0.75')).toBeInTheDocument();
    });

    it('should render diagonal values as 1.00', () => {
      render(<CorrelationHeatmap {...mockProps} />);

      const perfectCorrs = screen.getAllByText('1.00');
      expect(perfectCorrs.length).toBeGreaterThanOrEqual(4); // Diagonal elements
    });
  });

  describe('correlation display', () => {
    it('should handle high correlations', () => {
      const highCorr = { ...mockProps, btcEthCorr: 0.95 };
      render(<CorrelationHeatmap {...highCorr} />);

      expect(screen.getByText('0.95')).toBeInTheDocument();
    });

    it('should handle low correlations', () => {
      const lowCorr = { ...mockProps, btcSolCorr: 0.25 };
      render(<CorrelationHeatmap {...lowCorr} />);

      expect(screen.getByText('0.25')).toBeInTheDocument();
    });

    it('should handle negative correlations', () => {
      const negCorr = { ...mockProps, defaultCorr: -0.15 };
      render(<CorrelationHeatmap {...negCorr} />);

      expect(screen.getByText('-0.15')).toBeInTheDocument();
    });
  });
});
