import { render, screen } from '@testing-library/react';
import StatCard from '../../../components/ui/StatCard';

// Mock icon component for testing
const MockIcon = ({ className }: { className?: string }) => (
  <div data-testid="mock-icon" className={className}>Icon</div>
);

describe('StatCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: '1,234',
    icon: MockIcon,
    trend: '+12.5%',
    trendColor: 'text-green-500'
  };

  it('renders all props correctly', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('applies correct CSS classes to elements', () => {
    render(<StatCard {...defaultProps} />);
    
    // Check title styling
    const title = screen.getByText('Test Metric');
    expect(title).toHaveClass('stat-card-title');
    expect(title).toHaveClass('text-gray-300');
    
    // Check value styling
    const value = screen.getByText('1,234');
    expect(value).toHaveClass('font-orbitron');
    expect(value).toHaveClass('font-bold');
    expect(value).toHaveClass('text-white');
    expect(value).toHaveClass('stat-card-value');
    
    // Check trend color
    const trend = screen.getByText('+12.5%');
    expect(trend).toHaveClass('text-green-500');
  });

  it('applies icon styling correctly', () => {
    render(<StatCard {...defaultProps} />);
    
    const icon = screen.getByTestId('mock-icon');
    expect(icon).toHaveClass('stat-card-icon');
  });

  it('handles different trend colors', () => {
    const { rerender } = render(
      <StatCard {...defaultProps} trend="-5.2%" trendColor="text-red-500" />
    );
    
    expect(screen.getByText('-5.2%')).toHaveClass('text-red-500');
    
    rerender(
      <StatCard {...defaultProps} trend="0%" trendColor="text-gray-400" />
    );
    
    expect(screen.getByText('0%')).toHaveClass('text-gray-400');
  });

  it('handles long titles gracefully', () => {
    render(
      <StatCard 
        {...defaultProps} 
        title="Very Long Title That Might Wrap To Multiple Lines"
      />
    );
    
    expect(screen.getByText('Very Long Title That Might Wrap To Multiple Lines')).toBeInTheDocument();
  });

  it('handles large values correctly', () => {
    render(
      <StatCard 
        {...defaultProps} 
        value="999,999,999"
      />
    );
    
    expect(screen.getByText('999,999,999')).toBeInTheDocument();
  });

  it('handles empty trend gracefully', () => {
    render(
      <StatCard 
        {...defaultProps} 
        trend=""
        trendColor="text-gray-400"
      />
    );
    
    // Should still render the trend element even if empty
    const trendElement = screen.getByText('', { selector: 'p' });
    expect(trendElement).toHaveClass('text-gray-400');
  });

  it('applies glassmorphic container styles', () => {
    const { container } = render(<StatCard {...defaultProps} />);

    const statCard = container.firstChild as HTMLElement;
    expect(statCard).toHaveClass('stat-card-bordered');
    expect(statCard).toHaveClass('bg-white/5');
    expect(statCard).toHaveClass('backdrop-blur-2xl');
    expect(statCard).toHaveClass('rounded-3xl');
  });

  it('has proper hover effects', () => {
    const { container } = render(<StatCard {...defaultProps} />);

    const statCard = container.firstChild as HTMLElement;
    expect(statCard).toHaveClass('hover:bg-white/10');
    expect(statCard).toHaveClass('transition-all');
    expect(statCard).toHaveClass('duration-300');
  });

  it('maintains proper layout structure', () => {
    const { container } = render(<StatCard {...defaultProps} />);

    const statCard = container.firstChild as HTMLElement;
    expect(statCard).toHaveClass('flex');
    expect(statCard).toHaveClass('flex-col');
    expect(statCard).toHaveClass('justify-between');
  });
});
