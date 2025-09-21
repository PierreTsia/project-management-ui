import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQueryParamHelper } from '../useQueryParamHelper';

// Mock useSearchParams
const mockSetSearchParams = vi.fn();
let mockSearchParams: URLSearchParams;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useQueryParamHelper', () => {
  const defaultConfig = {
    mapping: {
      query: 'query' as const,
      status: 'status' as const,
      page: 'page' as const,
    },
    defaultValues: {
      page: 1,
      limit: 10,
      query: '',
      status: '',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('should return default values when no URL parameters', () => {
    const { result } = renderHook(() => useQueryParamHelper(defaultConfig), {
      wrapper: TestWrapper,
    });

    expect(result.current.filters).toEqual({
      page: 1,
      limit: 10,
      query: '',
      status: '',
    });
    expect(result.current.hasUrlParams).toBe(false);
  });

  it('should extract values from URL parameters', () => {
    mockSearchParams.set('query', 'test');
    mockSearchParams.set('status', 'ACTIVE');

    const { result } = renderHook(() => useQueryParamHelper(defaultConfig), {
      wrapper: TestWrapper,
    });

    expect(result.current.filters).toEqual({
      page: 1,
      limit: 10,
      query: 'test',
      status: 'ACTIVE',
    });
    expect(result.current.hasUrlParams).toBe(true);
  });

  it('should update URL parameters when updateFilters is called', () => {
    const { result } = renderHook(() => useQueryParamHelper(defaultConfig), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.updateFilters({ query: 'new search' });
    });

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining({
        get: expect.any(Function),
        set: expect.any(Function),
        delete: expect.any(Function),
      })
    );
  });

  it('should clear all filters when clearFilters is called', () => {
    mockSearchParams.set('query', 'test');
    mockSearchParams.set('status', 'ACTIVE');

    const { result } = renderHook(() => useQueryParamHelper(defaultConfig), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('should update page when updatePage is called', () => {
    const { result } = renderHook(() => useQueryParamHelper(defaultConfig), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.updatePage(2);
    });

    expect(mockSetSearchParams).toHaveBeenCalled();
  });
});
