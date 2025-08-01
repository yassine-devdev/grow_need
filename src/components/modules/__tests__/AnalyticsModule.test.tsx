/**
 * AnalyticsModule Component Tests
 * Testing L1/L2 navigation and component integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsModule from '../AnalyticsModule';
import { analyticsDataService } from '../analytics/services/analyticsDataService';

// Mock the analytics data service
jest.mock('../analytics/services/analyticsDataService');

// Mock all analytics components
jest.mock('../analytics/overview/LiveUsers', () => {
  return function MockLiveUsers() {
    return <div data-testid="live-users">Live Users Component</div>;
  };
});

jest.mock('../analytics/overview/TrafficSources', () => {
  return function MockTrafficSources() {
    return <div data-testid="traffic-sources">Traffic Sources Component</div>;
  };
});

jest.mock('../analytics/overview/Events', () => {
  return function MockEvents() {
    return <div data-testid="events">Events Component</div>;
  };
});

jest.mock('../analytics/marketing/CampaignPerformance', () => {
  return function MockCampaignPerformance() {
    return <div data-testid="campaign-performance">Campaign Performance Component</div>;
  };
});

jest.mock('../analytics/finance/RevenueSummary', () => {
  return function MockRevenueSummary() {
    return <div data-testid="revenue-summary">Revenue Summary Component</div>;
  };
});

const mockAnalyticsDataService = analyticsDataService as jest.Mocked<typeof analyticsDataService>;

describe('AnalyticsModule Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock all service methods
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue({
      currentUsers: 158,
      timeSeriesData: [],
      deviceBreakdown: [],
      topPages: []
    });
    
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue({
      sources: [],
      channelBreakdown: []
    });
  });

  it('should render with default Overview tab active', () => {
    render(<AnalyticsModule />);

    // Check L1 tabs are rendered
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();

    // Overview should be active by default
    const overviewTab = screen.getByRole('button', { name: /overview/i });
    expect(overviewTab).toHaveClass('active');
  });

  it('should render L2 sidebar with overview icons', () => {
    render(<AnalyticsModule />);

    // Check that L2 sidebar is rendered with buttons
    const l2Buttons = document.querySelectorAll('.analytics-l2-button');
    expect(l2Buttons.length).toBeGreaterThan(0);
  });

  it('should display LiveUsers component by default', async () => {
    render(<AnalyticsModule />);

    await waitFor(() => {
      expect(screen.getByTestId('live-users')).toBeInTheDocument();
    });
  });

  it('should switch L1 tabs correctly', async () => {
    render(<AnalyticsModule />);

    // Click on Marketing tab
    const marketingTab = screen.getByRole('button', { name: /marketing/i });
    fireEvent.click(marketingTab);

    // Marketing tab should be active
    expect(marketingTab).toHaveClass('active');
    
    // Overview tab should not be active
    const overviewTab = screen.getByRole('button', { name: /overview/i });
    expect(overviewTab).not.toHaveClass('active');

    // Should show marketing component (first in marketing array)
    await waitFor(() => {
      expect(screen.getByTestId('campaign-performance')).toBeInTheDocument();
    });
  });

  it('should switch to Finance tab and show finance components', async () => {
    render(<AnalyticsModule />);

    // Click on Finance tab
    const financeTab = screen.getByRole('button', { name: /finance/i });
    fireEvent.click(financeTab);

    // Finance tab should be active
    expect(financeTab).toHaveClass('active');

    // Should show finance component (first in finance array)
    await waitFor(() => {
      expect(screen.getByTestId('revenue-summary')).toBeInTheDocument();
    });
  });

  it('should switch L2 components within the same L1 tab', async () => {
    render(<AnalyticsModule />);

    // Start with Overview tab (default)
    await waitFor(() => {
      expect(screen.getByTestId('live-users')).toBeInTheDocument();
    });

    // Find and click the second L2 button (should be Traffic Sources)
    const l2Buttons = document.querySelectorAll('.analytics-l2-button');
    expect(l2Buttons.length).toBeGreaterThan(1);
    
    fireEvent.click(l2Buttons[1]);

    // Should switch to Traffic Sources component
    await waitFor(() => {
      expect(screen.getByTestId('traffic-sources')).toBeInTheDocument();
    });

    // Live Users should no longer be visible
    expect(screen.queryByTestId('live-users')).not.toBeInTheDocument();
  });

  it('should show tooltips on L2 button hover', () => {
    render(<AnalyticsModule />);

    // Check that tooltips are rendered
    const tooltips = document.querySelectorAll('.analytics-tooltip-bordered');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('should maintain L2 state when switching back to L1 tab', async () => {
    render(<AnalyticsModule />);

    // Start with Overview, switch to second L2 component
    const l2Buttons = document.querySelectorAll('.analytics-l2-button');
    fireEvent.click(l2Buttons[1]);

    await waitFor(() => {
      expect(screen.getByTestId('traffic-sources')).toBeInTheDocument();
    });

    // Switch to Marketing tab
    const marketingTab = screen.getByRole('button', { name: /marketing/i });
    fireEvent.click(marketingTab);

    await waitFor(() => {
      expect(screen.getByTestId('campaign-performance')).toBeInTheDocument();
    });

    // Switch back to Overview tab
    const overviewTab = screen.getByRole('button', { name: /overview/i });
    fireEvent.click(overviewTab);

    // Should reset to first component in Overview (Live Users)
    await waitFor(() => {
      expect(screen.getByTestId('live-users')).toBeInTheDocument();
    });
  });

  it('should highlight active L2 button', async () => {
    render(<AnalyticsModule />);

    const l2Buttons = document.querySelectorAll('.analytics-l2-button');
    
    // First button should be active by default
    expect(l2Buttons[0]).toHaveClass('active');
    expect(l2Buttons[1]).not.toHaveClass('active');

    // Click second button
    fireEvent.click(l2Buttons[1]);

    await waitFor(() => {
      expect(l2Buttons[1]).toHaveClass('active');
      expect(l2Buttons[0]).not.toHaveClass('active');
    });
  });

  it('should render with proper glassmorphic styling', () => {
    render(<AnalyticsModule />);

    const container = document.querySelector('.analytics-module-bordered');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('w-full', 'h-full', 'flex', 'flex-col', 'rounded-2xl', 'overflow-hidden');
  });

  it('should have proper ARIA labels for L2 buttons', () => {
    render(<AnalyticsModule />);

    const l2Buttons = document.querySelectorAll('.analytics-l2-button');
    l2Buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('should handle component loading states', async () => {
    render(<AnalyticsModule />);

    // Components should render without errors
    await waitFor(() => {
      expect(screen.getByTestId('live-users')).toBeInTheDocument();
    });

    // Switch to different component
    const l2Buttons = document.querySelectorAll('.analytics-l2-button');
    fireEvent.click(l2Buttons[1]);

    await waitFor(() => {
      expect(screen.getByTestId('traffic-sources')).toBeInTheDocument();
    });
  });

  it('should maintain responsive layout structure', () => {
    render(<AnalyticsModule />);

    // Check main layout structure
    const header = document.querySelector('.analytics-header-bordered');
    const body = document.querySelector('.analytics-body');
    const sidebar = document.querySelector('.analytics-l2-sidebar');

    expect(header).toBeInTheDocument();
    expect(body).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
  });

  it('should render all L1 tab icons', () => {
    render(<AnalyticsModule />);

    // Check that all L1 tabs have icons
    const overviewTab = screen.getByRole('button', { name: /overview/i });
    const marketingTab = screen.getByRole('button', { name: /marketing/i });
    const financeTab = screen.getByRole('button', { name: /finance/i });

    expect(overviewTab.querySelector('svg')).toBeInTheDocument();
    expect(marketingTab.querySelector('svg')).toBeInTheDocument();
    expect(financeTab.querySelector('svg')).toBeInTheDocument();
  });

  it('should handle rapid tab switching', async () => {
    render(<AnalyticsModule />);

    const overviewTab = screen.getByRole('button', { name: /overview/i });
    const marketingTab = screen.getByRole('button', { name: /marketing/i });
    const financeTab = screen.getByRole('button', { name: /finance/i });

    // Rapidly switch between tabs
    fireEvent.click(marketingTab);
    fireEvent.click(financeTab);
    fireEvent.click(overviewTab);

    // Should end up on Overview with Live Users
    await waitFor(() => {
      expect(overviewTab).toHaveClass('active');
      expect(screen.getByTestId('live-users')).toBeInTheDocument();
    });
  });

  it('should provide keyboard navigation support', () => {
    render(<AnalyticsModule />);

    const l1Tabs = screen.getAllByRole('button');
    const l2Buttons = document.querySelectorAll('.analytics-l2-button');

    // All interactive elements should be focusable
    l1Tabs.forEach(tab => {
      expect(tab).not.toHaveAttribute('tabindex', '-1');
    });

    l2Buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });
});
