/**
 * MetricCard Tests - Presentation Layer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { MetricCard } from '@/presentation/components/common/MetricCard';

describe('MetricCard', () => {
  describe('basic rendering', () => {
    it('should render label and value', () => {
      render(<MetricCard label="Test Metric" value="$1,000" />);

      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
    });

    it('should render numeric value', () => {
      render(<MetricCard label="Count" value={42} />);

      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render subtitle when provided', () => {
      render(<MetricCard label="Metric" value="100" subtitle="Additional info" />);

      expect(screen.getByText('Additional info')).toBeInTheDocument();
    });

    it('should not render subtitle when not provided', () => {
      render(<MetricCard label="Metric" value="100" />);

      expect(screen.queryByText(/Additional/)).not.toBeInTheDocument();
    });
  });

  describe('trend indicators', () => {
    it('should render upward trend with arrow', () => {
      render(<MetricCard label="Price" value="$100" trend="up" trendValue="+5%" />);

      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.getByText('+5%')).toBeInTheDocument();
    });

    it('should render downward trend with arrow', () => {
      render(<MetricCard label="Price" value="$100" trend="down" trendValue="-3%" />);

      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.getByText('-3%')).toBeInTheDocument();
    });

    it('should render neutral trend with circle', () => {
      render(<MetricCard label="Price" value="$100" trend="neutral" trendValue="0%" />);

      expect(screen.getByText('●')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should not render trend when trend prop missing', () => {
      render(<MetricCard label="Price" value="$100" trendValue="+5%" />);

      expect(screen.queryByText('▲')).not.toBeInTheDocument();
      expect(screen.queryByText('+5%')).not.toBeInTheDocument();
    });

    it('should not render trend when trendValue missing', () => {
      render(<MetricCard label="Price" value="$100" trend="up" />);

      expect(screen.queryByText('▲')).not.toBeInTheDocument();
    });
  });

  describe('status indicators', () => {
    it('should render healthy status', () => {
      render(<MetricCard label="System" value="OK" status="healthy" />);

      expect(screen.getByText('healthy')).toBeInTheDocument();
    });

    it('should render warning status', () => {
      render(<MetricCard label="System" value="Alert" status="warning" />);

      expect(screen.getByText('warning')).toBeInTheDocument();
    });

    it('should render critical status', () => {
      render(<MetricCard label="System" value="Error" status="critical" />);

      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    it('should not render status when not provided', () => {
      render(<MetricCard label="System" value="OK" />);

      expect(screen.queryByText('healthy')).not.toBeInTheDocument();
      expect(screen.queryByText('warning')).not.toBeInTheDocument();
      expect(screen.queryByText('critical')).not.toBeInTheDocument();
    });
  });

  describe('value styling based on status', () => {
    it('should apply default text color when no status', () => {
      const { container } = render(<MetricCard label="Metric" value="100" />);
      const valueElement = screen.getByText('100');

      expect(valueElement).toHaveClass('metric-value');
      expect(valueElement).not.toHaveClass('text-warning');
      expect(valueElement).not.toHaveClass('text-danger');
    });

    it('should apply warning color when status is warning', () => {
      render(<MetricCard label="Metric" value="100" status="warning" />);
      const valueElement = screen.getByText('100');

      expect(valueElement).toHaveClass('text-warning');
    });

    it('should apply danger color when status is critical', () => {
      render(<MetricCard label="Metric" value="100" status="critical" />);
      const valueElement = screen.getByText('100');

      expect(valueElement).toHaveClass('text-danger');
    });

    it('should apply default color when status is healthy', () => {
      render(<MetricCard label="Metric" value="100" status="healthy" />);
      const valueElement = screen.getByText('100');

      expect(valueElement).toHaveClass('text-text-primary');
    });
  });

  describe('trend color styling', () => {
    it('should apply primary color for upward trend', () => {
      const { container } = render(<MetricCard label="Price" value="$100" trend="up" trendValue="+5%" />);
      const trendValue = screen.getByText('+5%');

      // The trend value and arrow are in a div with the color class
      const trendContainer = trendValue.closest('div.text-primary');
      expect(trendContainer).toBeInTheDocument();
    });

    it('should apply danger color for downward trend', () => {
      const { container } = render(<MetricCard label="Price" value="$100" trend="down" trendValue="-5%" />);
      const trendValue = screen.getByText('-5%');

      const trendContainer = trendValue.closest('div.text-danger');
      expect(trendContainer).toBeInTheDocument();
    });

    it('should apply secondary color for neutral trend', () => {
      const { container } = render(<MetricCard label="Price" value="$100" trend="neutral" trendValue="0%" />);
      const trendValue = screen.getByText('0%');

      const trendContainer = trendValue.closest('div.text-text-secondary');
      expect(trendContainer).toBeInTheDocument();
    });
  });

  describe('complex scenarios', () => {
    it('should render all props together', () => {
      render(
        <MetricCard
          label="Portfolio Value"
          value="$1,234,567"
          trend="up"
          trendValue="+12.5%"
          status="healthy"
          subtitle="Last updated: 2 min ago"
        />
      );

      expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
      expect(screen.getByText('$1,234,567')).toBeInTheDocument();
      expect(screen.getByText('▲')).toBeInTheDocument();
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('healthy')).toBeInTheDocument();
      expect(screen.getByText('Last updated: 2 min ago')).toBeInTheDocument();
    });

    it('should handle long metric labels', () => {
      render(<MetricCard label="Very Long Metric Label That Should Wrap" value="100" />);

      expect(screen.getByText('Very Long Metric Label That Should Wrap')).toBeInTheDocument();
    });

    it('should handle large numeric values', () => {
      render(<MetricCard label="Large Number" value={1234567890} />);

      expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(<MetricCard label="Empty" value="" />);

      expect(screen.getByText('Empty')).toBeInTheDocument();
      // Value element should still exist but be empty
      const metricCard = screen.getByText('Empty').closest('.metric-card');
      expect(metricCard).toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('should apply metric-card class', () => {
      const { container } = render(<MetricCard label="Test" value="100" />);
      const card = container.querySelector('.metric-card');

      expect(card).toBeInTheDocument();
    });

    it('should apply metric-label class to label', () => {
      render(<MetricCard label="Test Label" value="100" />);
      const label = screen.getByText('Test Label');

      expect(label).toHaveClass('metric-label');
    });

    it('should apply metric-value class to value', () => {
      render(<MetricCard label="Test" value="100" />);
      const value = screen.getByText('100');

      expect(value).toHaveClass('metric-value');
    });

    it('should apply status indicator classes', () => {
      const { container } = render(<MetricCard label="Test" value="100" status="healthy" />);
      const indicator = container.querySelector('.status-indicator');

      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('status-healthy');
    });
  });
});
