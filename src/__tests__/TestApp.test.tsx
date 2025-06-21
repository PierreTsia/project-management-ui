import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestApp } from '../test/TestApp';
import { LoadingSpinner } from '../components/LoadingStates';
import { Button } from '../components/ui/button';

describe('TestApp', () => {
  it('renders children with all providers (component-level testing)', () => {
    render(
      <TestApp>
        <div data-testid="test-component">
          <LoadingSpinner />
          <Button>Test Button</Button>
        </div>
      </TestApp>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders dashboard page when no URL is provided', () => {
    render(<TestApp />);

    // Should render the layout with dashboard - check for the main heading
    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument();
  });

  it('renders specific page when URL is provided', () => {
    render(<TestApp url="?projects" />);

    // Should render the projects page - check for the breadcrumb text
    expect(
      screen.getByText('Projects', { selector: 'span' })
    ).toBeInTheDocument();
  });

  it('handles custom router entries', () => {
    render(
      <TestApp initialEntries={['/projects', '/dashboard']} initialIndex={0}>
        <div>Custom Route Test</div>
      </TestApp>
    );

    expect(screen.getByText('Custom Route Test')).toBeInTheDocument();
  });
});
