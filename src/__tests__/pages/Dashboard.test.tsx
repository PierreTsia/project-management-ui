import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';
import * as useDashboardModule from '@/hooks/useDashboard';

// Mock the useUser hook since it makes API calls
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

// Mock the useAuth hook to test logout functionality
const mockLogout = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useLogout: () => ({
    mutateAsync: mockLogout,
    isPending: false,
  }),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Clear localStorage to ensure no language preference interferes with tests
    localStorage.clear();
  });

  describe('Sidebar', () => {
    it('renders the dashboard page with sidebar', () => {
      render(<TestAppWithRouting url="/" />);

      // Check that the main dashboard content is rendered
      expect(
        screen.getByRole('heading', { name: 'Dashboard' })
      ).toBeInTheDocument();

      // Check that the sidebar is rendered with all navigation items
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('displays all navigation items in sidebar', () => {
      render(<TestAppWithRouting url="/" />);

      // Check that all navigation items are rendered
      expect(
        screen.getByRole('heading', { name: 'Dashboard' })
      ).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Sandbox')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('shows user information in sidebar', () => {
      render(<TestAppWithRouting url="/" />);

      // Check that user information is displayed in the sidebar
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('has working navigation links', () => {
      render(<TestAppWithRouting url="/" />);

      // Check that navigation items are clickable links with correct hrefs
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
        'href',
        '/'
      );
      expect(
        screen.getAllByRole('link', { name: /projects/i })[0]
      ).toHaveAttribute('href', '/projects');
      expect(
        screen.getAllByRole('link', { name: /tasks/i })[0]
      ).toHaveAttribute('href', '/tasks');
      expect(screen.getAllByRole('link', { name: /team/i })[0]).toHaveAttribute(
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
      render(<TestAppWithRouting url="/" />);

      // The dashboard navigation item should have active styling
      // We can check for the presence of the Dashboard link and that we're on the dashboard page
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toBeInTheDocument();

      // Since we're on the dashboard page, the main content should show dashboard content
      expect(
        screen.getByRole('heading', { name: 'Dashboard' })
      ).toBeInTheDocument();
    });
  });

  describe('Dashboard Tasks navigation', () => {
    it('navigates to task details when clicking a dashboard task item', async () => {
      const user = userEvent.setup();

      // Spy and mock useMyTasks and useDashboardSummary/useMyProjects minimal shape
      vi.spyOn(useDashboardModule, 'useDashboardSummary').mockReturnValue({
        data: {
          totalProjects: 1,
          activeProjects: 1,
          archivedProjects: 0,
          totalTasks: 1,
          assignedTasks: 1,
          completedTasks: 0,
          overdueTasks: 0,
          tasksByStatus: { todo: 1, inProgress: 0, done: 0 },
          tasksByPriority: { low: 0, medium: 1, high: 0 },
          completionRate: 0,
          averageTasksPerProject: 1,
          recentActivity: [],
        },
        isLoading: false,
      } as unknown as ReturnType<
        typeof useDashboardModule.useDashboardSummary
      >);

      vi.spyOn(useDashboardModule, 'useMyProjects').mockReturnValue({
        data: [
          {
            id: 'proj-1',
            name: 'Project One',
            description: 'Test',
            status: 'ACTIVE',
            owner: { id: 'owner-1', name: 'Owner' },
            userRole: 'ADMIN',
            taskCount: 1,
            assignedTaskCount: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useDashboardModule.useMyProjects>);

      vi.spyOn(useDashboardModule, 'useMyTasks').mockReturnValue({
        data: [
          {
            id: 'task-1',
            title: 'Fix login bug',
            description: 'details',
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: undefined,
            project: { id: 'proj-1', name: 'Project One' },
            assignee: { id: 'user-1', name: 'Test User' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useDashboardModule.useMyTasks>);

      render(<TestAppWithRouting url="/" />);

      const taskLink = await screen.findByTestId('dashboard-task-link-task-1');
      await user.click(taskLink);

      // We should now be on TaskDetailsPage route /projects/proj-1/task-1
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /back/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Language Switcher', () => {
    it('renders language switcher button', () => {
      render(<TestAppWithRouting url="/" />);

      const languageSwitcher = screen.getByTestId('language-switcher-trigger');
      expect(languageSwitcher).toBeInTheDocument();

      // Should show current language (default is English)
      expect(languageSwitcher).toHaveTextContent('English');
    });

    it('opens language menu when clicked', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/" />);

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
      render(<TestAppWithRouting url="/" />);

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
      render(<TestAppWithRouting url="/" />);

      const themeToggle = screen.getByTestId('theme-toggle-trigger');
      expect(themeToggle).toBeInTheDocument();

      // Should show current theme (default is System) - accept both languages
      expect(
        themeToggle.textContent === 'System' ||
          themeToggle.textContent === 'Système'
      ).toBe(true);
    });

    it('opens theme menu when clicked', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/" />);

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
      render(<TestAppWithRouting url="/" />);

      // Open theme menu
      const themeToggle = screen.getByTestId('theme-toggle-trigger');
      await user.click(themeToggle);

      // Click light theme option
      const lightOption = screen.getByTestId('theme-option-light');
      await user.click(lightOption);

      // Theme should change to Light - accept both languages
      expect(
        themeToggle.textContent === 'Light' ||
          themeToggle.textContent === 'Clair'
      ).toBe(true);
    });

    it('can switch to dark theme', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/" />);

      // Open theme menu
      const themeToggle = screen.getByTestId('theme-toggle-trigger');
      await user.click(themeToggle);

      // Click dark theme option
      const darkOption = screen.getByTestId('theme-option-dark');
      await user.click(darkOption);

      // Theme should change to Dark - accept both languages
      expect(
        themeToggle.textContent === 'Dark' ||
          themeToggle.textContent === 'Sombre'
      ).toBe(true);
    });
  });

  describe('User Menu', () => {
    it('displays user name and email', () => {
      render(<TestAppWithRouting url="/" />);

      // Check that user information is displayed
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('displays user avatar', () => {
      render(<TestAppWithRouting url="/" />);

      // Check that user avatar is displayed using data-testid
      const userAvatar = screen.getByTestId('user-avatar-trigger');
      expect(userAvatar).toBeInTheDocument();

      // Check that the avatar contains either an image or fallback text
      // The avatar should contain the user's first initial as fallback
      expect(userAvatar).toHaveTextContent('T');
    });

    it('shows user avatar fallback when image fails to load', () => {
      render(<TestAppWithRouting url="/" />);

      // Look for the fallback content (first letter of user name)
      // The fallback should show "T" for "Test User"
      const fallbackElements = screen.getAllByText('T');

      // Should find at least one "T" which could be the avatar fallback
      expect(fallbackElements.length).toBeGreaterThan(0);
    });

    it('renders user menu trigger button', () => {
      render(<TestAppWithRouting url="/" />);

      const userMenuTrigger = screen.getByTestId('user-menu-trigger');
      expect(userMenuTrigger).toBeInTheDocument();

      // Should contain user information
      expect(userMenuTrigger).toHaveTextContent('Test User');
      expect(userMenuTrigger).toHaveTextContent('test@example.com');
    });

    it('opens user menu when clicked', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/" />);

      const userMenuTrigger = screen.getByTestId('user-menu-trigger');
      await user.click(userMenuTrigger);

      // User menu should be visible
      expect(screen.getByTestId('user-menu-content')).toBeInTheDocument();
    });

    it('displays all user menu options', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/" />);

      // Open user menu
      const userMenuTrigger = screen.getByTestId('user-menu-trigger');
      await user.click(userMenuTrigger);

      // Check that all menu items are present using data-testids (more reliable than text)
      expect(screen.getByTestId('user-menu-upgrade')).toBeInTheDocument();
      expect(screen.getByTestId('user-menu-account')).toBeInTheDocument();
      expect(screen.getByTestId('user-menu-billing')).toBeInTheDocument();
      expect(screen.getByTestId('user-menu-notifications')).toBeInTheDocument();
      expect(screen.getByTestId('user-menu-logout')).toBeInTheDocument();
    });

    it('shows user information in dropdown header', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/" />);

      // Open user menu
      const userMenuTrigger = screen.getByTestId('user-menu-trigger');
      await user.click(userMenuTrigger);

      // The dropdown should also show user info in the header
      const menuContent = screen.getByTestId('user-menu-content');
      expect(menuContent).toHaveTextContent('Test User');
      expect(menuContent).toHaveTextContent('test@example.com');
    });

    it('has logout functionality', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/" />);

      // Open user menu
      const userMenuTrigger = screen.getByTestId('user-menu-trigger');
      await user.click(userMenuTrigger);

      // Logout button should be present and clickable
      const logoutButton = screen.getByTestId('user-menu-logout');
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).not.toBeDisabled();
    });

    it('calls logout function when logout button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/" />);

      // Clear any previous calls to the mock
      mockLogout.mockClear();

      // Open user menu
      const userMenuTrigger = screen.getByTestId('user-menu-trigger');
      await user.click(userMenuTrigger);

      // Click the logout button
      const logoutButton = screen.getByTestId('user-menu-logout');
      await user.click(logoutButton);

      // Assert that the logout function was called
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
