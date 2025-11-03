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
      expect(screen.getByText('CORRELATION MATRIX HEATMAP')).toBeInTheDocument();
    });

    it('should render all asset labels', () => {
      render(<CorrelationHeatmap {...mockProps} />);

      // Asset labels appear multiple times (row and column headers)
      expect(screen.getAllByText('BTC').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('ETH').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('SOL').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('DEFAULT').length).toBeGreaterThanOrEqual(2);
    });

    it('should render correlation values', () => {
      render(<CorrelationHeatmap {...mockProps} />);

      // Correlation values appear twice in symmetric matrix (e.g., BTC-ETH and ETH-BTC)
      expect(screen.getAllByText('0.82').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('0.68').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('0.75').length).toBeGreaterThanOrEqual(1);
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

      // Value appears twice in symmetric matrix
      expect(screen.getAllByText('0.95').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle low correlations', () => {
      const lowCorr = { ...mockProps, btcSolCorr: 0.25 };
      render(<CorrelationHeatmap {...lowCorr} />);

      // Value appears twice in symmetric matrix
      expect(screen.getAllByText('0.25').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle negative correlations', () => {
      const negCorr = { ...mockProps, defaultCorr: -0.15 };
      render(<CorrelationHeatmap {...negCorr} />);

      // Value appears twice in symmetric matrix
      expect(screen.getAllByText('-0.15').length).toBeGreaterThanOrEqual(1);
    });
  });
});
