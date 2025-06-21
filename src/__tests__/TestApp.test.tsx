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

  it('renders navigation menu', () => {
    render(<TestApp />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Team' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders header with theme toggle and language switcher', () => {
    render(<TestApp />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '🇺🇸' })).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(<TestApp />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders breadcrumb on non-home pages', () => {
    render(<TestApp url="?projects" />);

    // Should render breadcrumb on projects page
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(
      screen.getByText('Projects', { selector: 'span' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-home')).toBeInTheDocument();
  });
});
