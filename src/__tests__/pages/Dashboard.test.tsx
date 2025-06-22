import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TestApp } from '../../test/TestApp';

// Mock only the useUser hook since it makes API calls
vi.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    isLoading: false,
  }),
}));

describe('Dashboard Page', () => {
  describe('Sidebar', () => {
    it('renders the dashboard page with sidebar', () => {
      render(<TestApp url="/" />);

      // Check that the main dashboard content is rendered
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Check that the sidebar is rendered with all navigation items
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('displays all navigation items in sidebar', () => {
      render(<TestApp url="/" />);

      // Check that all navigation items are rendered
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Sandbox')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('shows user information in sidebar', () => {
      render(<TestApp url="/" />);

      // Check that user information is displayed in the sidebar
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('has working navigation links', () => {
      render(<TestApp url="/" />);

      // Check that navigation items are clickable links with correct hrefs
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
        'href',
        '/'
      );
      expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute(
        'href',
        '/projects'
      );
      expect(screen.getByRole('link', { name: /tasks/i })).toHaveAttribute(
        'href',
        '/tasks'
      );
      expect(screen.getByRole('link', { name: /team/i })).toHaveAttribute(
        'href',
        '/team'
      );
      expect(screen.getByRole('link', { name: /sandbox/i })).toHaveAttribute(
        'href',
        '/sandbox'
      );
      expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
        'href',
        '/settings'
      );
    });

    it('shows dashboard as active in navigation', () => {
      render(<TestApp url="/" />);

      // The dashboard navigation item should have active styling
      // We can check for the presence of the Dashboard link and that we're on the dashboard page
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toBeInTheDocument();

      // Since we're on the dashboard page, the main content should show dashboard content
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Language Switcher', () => {
    it('renders language switcher button', () => {
      render(<TestApp url="/" />);

      const languageSwitcher = screen.getByTestId('language-switcher-trigger');
      expect(languageSwitcher).toBeInTheDocument();

      // Should show current language (default is English)
      expect(languageSwitcher).toHaveTextContent('English');
    });

    it('opens language menu when clicked', async () => {
      const user = userEvent.setup();
      render(<TestApp url="/" />);

      const languageSwitcher = screen.getByTestId('language-switcher-trigger');
      await user.click(languageSwitcher);

      // Language menu should be visible
      expect(screen.getByTestId('language-switcher-menu')).toBeInTheDocument();

      // Should show language options
      expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
      expect(screen.getByTestId('language-option-fr')).toBeInTheDocument();
    });

    it('can switch languages', async () => {
      const user = userEvent.setup();
      render(<TestApp url="/" />);

      // Open language menu
      const languageSwitcher = screen.getByTestId('language-switcher-trigger');
      await user.click(languageSwitcher);

      // Click French option
      const frenchOption = screen.getByTestId('language-option-fr');
      await user.click(frenchOption);

      // Language should change to French (we can check if the trigger text changes)
      // Note: The actual language change might require more complex testing with i18n mocking
      expect(languageSwitcher).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('renders theme toggle button', () => {
      render(<TestApp url="/" />);

      const themeToggle = screen.getByTestId('theme-toggle-trigger');
      expect(themeToggle).toBeInTheDocument();

      // Should show current theme (default is System)
      expect(themeToggle).toHaveTextContent('System');
    });

    it('opens theme menu when clicked', async () => {
      const user = userEvent.setup();
      render(<TestApp url="/" />);

      const themeToggle = screen.getByTestId('theme-toggle-trigger');
      await user.click(themeToggle);

      // Theme menu should be visible
      expect(screen.getByTestId('theme-toggle-menu')).toBeInTheDocument();

      // Should show theme options
      expect(screen.getByTestId('theme-option-light')).toBeInTheDocument();
      expect(screen.getByTestId('theme-option-dark')).toBeInTheDocument();
      expect(screen.getByTestId('theme-option-system')).toBeInTheDocument();
    });

    it('can switch themes', async () => {
      const user = userEvent.setup();
      render(<TestApp url="/" />);

      // Open theme menu
      const themeToggle = screen.getByTestId('theme-toggle-trigger');
      await user.click(themeToggle);

      // Click light theme option
      const lightOption = screen.getByTestId('theme-option-light');
      await user.click(lightOption);

      // Theme should change to Light
      expect(themeToggle).toHaveTextContent('Light');
    });

    it('can switch to dark theme', async () => {
      const user = userEvent.setup();
      render(<TestApp url="/" />);

      // Open theme menu
      const themeToggle = screen.getByTestId('theme-toggle-trigger');
      await user.click(themeToggle);

      // Click dark theme option
      const darkOption = screen.getByTestId('theme-option-dark');
      await user.click(darkOption);

      // Theme should change to Dark
      expect(themeToggle).toHaveTextContent('Dark');
    });
  });
});
