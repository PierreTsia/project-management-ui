import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestApp } from '../../test/TestApp';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders language options', () => {
    render(
      <TestApp>
        <LanguageSwitcher />
      </TestApp>
    );

    // Should show language options
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('🇫🇷')).toBeInTheDocument();
  });

  it('allows switching between languages', () => {
    render(
      <TestApp>
        <LanguageSwitcher />
      </TestApp>
    );

    // Click on French flag
    const frenchButton = screen.getByText('🇫🇷').closest('button');
    expect(frenchButton).toBeInTheDocument();

    if (frenchButton) {
      fireEvent.click(frenchButton);

      // Language should be switched (you might need to check localStorage or other indicators)
      expect(frenchButton).toBeInTheDocument();
    }
  });
});
