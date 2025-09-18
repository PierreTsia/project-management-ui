import { render, screen, fireEvent } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { GlobalInviteModal } from '../GlobalInviteModal';
import { TestWrapper } from '@/test/TestWrapper';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(<TestWrapper>{ui}</TestWrapper>);
};

vi.mock('@/hooks/useProjects', () => ({
  useAddContributor: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useProjects: () => ({
    data: {
      projects: [
        {
          id: 'project-1',
          name: 'Test Project 1',
          description: 'A test project',
          status: 'ACTIVE',
          ownerId: 'user-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'project-2',
          name: 'Test Project 2',
          description: 'Another test project',
          status: 'ACTIVE',
          ownerId: 'user-2',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ],
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
};

describe('GlobalInviteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    expect(screen.getByText('Invite User')).toBeInTheDocument();
    expect(
      screen.getByText('Add a new contributor to one of your projects.')
    ).toBeInTheDocument();
  });

  it('does not render modal when closed', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Invite User')).not.toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    expect(screen.getByLabelText('Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('renders project options', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    const projectSelect = screen.getByLabelText('Project');
    fireEvent.click(projectSelect);

    // Check that both projects appear (using getAllByText since they appear in both option and dropdown)
    expect(screen.getAllByText('Test Project 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Project 2').length).toBeGreaterThan(0);
  });

  it('renders role options', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    const roleSelect = screen.getByLabelText('Role');
    fireEvent.click(roleSelect);

    // Check that all role options appear (using getAllByText since they appear in both option and dropdown)
    expect(screen.getAllByText('Read').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Write').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
  });

  it('calls onClose when cancel button is clicked', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders modal overlay', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  it('has form elements for validation', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /invite/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('handles email input changes', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('renders with projects when available', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    // Should render the project select with options
    const projectSelect = screen.getByLabelText('Project');
    expect(projectSelect).toBeInTheDocument();

    // Should show the first project as selected by default (using getAllByText since it appears in both visible and hidden elements)
    expect(screen.getAllByText('Test Project 1').length).toBeGreaterThan(0);
  });

  it('renders submit button', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /invite/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('renders role select with options', () => {
    renderWithProviders(<GlobalInviteModal {...defaultProps} />);

    const roleSelect = screen.getByLabelText('Role');
    expect(roleSelect).toBeInTheDocument();

    // Click to open the role options
    fireEvent.click(roleSelect);

    // Should show role options (using getAllByText since they appear in both option and dropdown)
    expect(screen.getAllByText('Read').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Write').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
  });
});
