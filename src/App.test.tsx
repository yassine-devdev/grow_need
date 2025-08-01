import { render, screen } from '@testing-library/react';

// Simple test component to verify Jest setup
const TestComponent = () => <div data-testid="test-component">Testing Infrastructure Works!</div>;

describe('Testing Infrastructure', () => {
  it('Jest and React Testing Library are working', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Testing Infrastructure Works!')).toBeInTheDocument();
  });

  it('test utilities are working', () => {
    render(<TestComponent />);
    const element = screen.getByTestId('test-component');
    expect(element).toBeVisible();
  });
});
