import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface AsyncSelectProps<T> {
  /** Async function to fetch options */
  fetcher: (query?: string) => Promise<T[]>;
  /** Preload all data ahead of time */
  preload?: boolean;
  /** Function to filter options */
  filterFn?: (option: T, query: string) => boolean;
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode;
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string;
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode;
  /** Custom not found message */
  notFound?: React.ReactNode;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Label for the select field */
  label: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Custom width for the popover */
  width?: string | number;
  /** Custom class names */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
}

export function AsyncSelect<T>({
  fetcher,
  preload,
  filterFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  label,
  placeholder = 'Select...',
  value,
  onChange,
  disabled = false,
  width = '200px',
  className,
  triggerClassName,
  noResultsMessage,
  clearable = true,
}: AsyncSelectProps<T>) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, preload ? 0 : 300);
  const [originalOptions, setOriginalOptions] = useState<T[]>([]);
  const hasLoadedInitialData = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Memoize the filter function to avoid dependency issues
  const filterOptions = useCallback(
    (options: T[], query: string) => {
      if (!query) return options;
      return options.filter(option =>
        filterFn ? filterFn(option, query) : true
      );
    },
    [filterFn]
  );

  useEffect(() => {
    setMounted(true);
    setSelectedValue(value);
  }, [value]);

  // Initialize selectedOption when options are loaded and value exists
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => getOptionValue(opt) === value);
      if (option) {
        setSelectedOption(option);
      }
    }
  }, [value, options, getOptionValue]);

  // Single effect for fetching options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        if (preload) {
          // For preload mode, check if we have data and filter it
          if (hasLoadedInitialData.current) {
            // Filter existing data
            const filtered = filterOptions(
              originalOptions,
              debouncedSearchTerm
            );
            setOptions(filtered);
          } else {
            // Load initial data
            const data = await fetcher(debouncedSearchTerm);
            setOriginalOptions(data);
            setOptions(data);
            hasLoadedInitialData.current = true;
          }
        } else {
          // Fetch new data for each search
          const data = await fetcher(debouncedSearchTerm);
          setOptions(data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch options'
        );
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchOptions();
    }
  }, [
    fetcher,
    debouncedSearchTerm,
    mounted,
    preload,
    filterOptions,
    originalOptions,
  ]);

  const handleSelect = useCallback(
    (currentValue: string) => {
      const newValue =
        clearable && currentValue === selectedValue ? '' : currentValue;
      setSelectedValue(newValue);
      setSelectedOption(
        options.find(option => getOptionValue(option) === newValue) || null
      );
      onChange(newValue);
      setOpen(false);
    },
    [selectedValue, onChange, clearable, options, getOptionValue]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between w-full',
            disabled && 'opacity-50 cursor-not-allowed',
            triggerClassName
          )}
          style={{ width: width }}
          disabled={disabled}
        >
          {selectedOption ? getDisplayValue(selectedOption) : placeholder}
          <ChevronsUpDown className="opacity-50" size={10} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', className)}
        style={{
          width: triggerRef.current?.offsetWidth || width,
          minWidth: triggerRef.current?.offsetWidth || width,
          maxWidth: triggerRef.current?.offsetWidth || width,
        }}
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command shouldFilter={false} className="w-full">
          <div className="relative border-b w-full">
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={(value: string) => {
                setSearchTerm(value);
              }}
              className="w-full"
            />
            {loading && options.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          <CommandList className="w-full max-h-[200px] overflow-y-auto">
            {error && (
              <div className="p-4 text-destructive text-center">{error}</div>
            )}
            {loading &&
              options.length === 0 &&
              (loadingSkeleton || <DefaultLoadingSkeleton />)}
            {!loading &&
              !error &&
              options.length === 0 &&
              (notFound || (
                <CommandEmpty>
                  {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
                </CommandEmpty>
              ))}
            <CommandGroup className="w-full">
              {options.map(option => (
                <CommandItem
                  key={getOptionValue(option)}
                  value={getOptionValue(option)}
                  onSelect={handleSelect}
                  className="w-full"
                >
                  {renderOption(option)}
                  <Check
                    className={cn(
                      'ml-auto h-3 w-3',
                      selectedValue === getOptionValue(option)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map(i => (
        <CommandItem key={i} disabled>
          <div className="flex items-center gap-2 w-full">
            <div className="h-6 w-6 rounded-full animate-pulse bg-muted" />
            <div className="flex flex-col flex-1 gap-1">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-3 w-16 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
