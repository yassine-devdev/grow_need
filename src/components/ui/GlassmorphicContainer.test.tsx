import { render, screen } from '@testing-library/react';
import GlassmorphicContainer from '../../../components/ui/GlassmorphicContainer';

describe('GlassmorphicContainer', () => {
  it('renders children correctly', () => {
    render(
      <GlassmorphicContainer>
        <div data-testid="child-content">Test Content</div>
      </GlassmorphicContainer>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default glassmorphic styles', () => {
    render(
      <GlassmorphicContainer>
        <div>Content</div>
      </GlassmorphicContainer>
    );
    
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('bg-white/10');
    expect(container).toHaveClass('backdrop-blur-2xl');
  });

  it('applies custom className when provided', () => {
    render(
      <GlassmorphicContainer className="custom-class p-4">
        <div>Content</div>
      </GlassmorphicContainer>
    );
    
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveClass('p-4');
    expect(container).toHaveClass('bg-white/10'); // Still has default classes
    expect(container).toHaveClass('backdrop-blur-2xl');
  });

  it('handles empty className gracefully', () => {
    render(
      <GlassmorphicContainer className="">
        <div>Content</div>
      </GlassmorphicContainer>
    );
    
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('bg-white/10');
    expect(container).toHaveClass('backdrop-blur-2xl');
  });

  it('renders multiple children correctly', () => {
    render(
      <GlassmorphicContainer>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
        <span data-testid="child-3">Third Child</span>
      </GlassmorphicContainer>
    );
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('renders with complex nested content', () => {
    render(
      <GlassmorphicContainer className="test-container">
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </GlassmorphicContainer>
    );
    
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
