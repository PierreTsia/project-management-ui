import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { stringToColorHex } from '@/lib/color';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type AsyncMultiSelectOption<T> = {
  raw: T;
  value: string;
  label: string;
  disabled?: boolean;
};

export type AsyncMultiSelectProps<T> = {
  fetcher: (query?: string) => Promise<T[]>;
  mapOption: (item: T) => AsyncMultiSelectOption<T>;
  value: string[];
  onChange: (values: string[]) => void;
  label: string;
  placeholder?: string;
  maxSelected?: number;
  className?: string;
  triggerClassName?: string;
  popoverWidth?: string | number;
  keepOpenOnSelect?: boolean;
  loadingSkeleton?: React.ReactNode;
  notFoundLabel?: string;
  showOverflowCount?: number;
  disabled?: boolean;
  resolveLabel?: (id: string) => string | undefined;
};

export function AsyncMultiSelect<T>({
  fetcher,
  mapOption,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  maxSelected = 20,
  className,
  triggerClassName,
  popoverWidth = '280px',
  keepOpenOnSelect = true,
  loadingSkeleton,
  notFoundLabel,
  showOverflowCount = 3,
  disabled = false,
  resolveLabel,
}: AsyncMultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AsyncMultiSelectOption<T>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 250);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetcher(debouncedSearch);
        if (cancelled) return;
        const mapped = data.map(mapOption);
        setOptions(mapped);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fetcher, mapOption, debouncedSearch]);

  const selected = useMemo(() => new Set(value), [value]);

  const toggle = useCallback(
    (id: string) => {
      const isSelected = selected.has(id);
      if (!isSelected && value.length >= maxSelected) return;
      const next = isSelected ? value.filter(v => v !== id) : [...value, id];
      onChange(next);
      if (!keepOpenOnSelect) setOpen(false);
    },
    [selected, value, maxSelected, onChange, keepOpenOnSelect]
  );

  const clearAll = useCallback(() => onChange([]), [onChange]);

  const visibleBadges = value.slice(0, showOverflowCount);
  const overflow = value.length - visibleBadges.length;

  // moved to top-level pure function for stability and to avoid needless re-creation

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap items-center gap-2 mb-2 overflow-visible pr-1">
        {value.length === 0 ? (
          <Badge variant="secondary">All</Badge>
        ) : (
          <>
            {visibleBadges.map(id => {
              const opt = options.find(o => o.value === id);
              const resolvedText = resolveLabel?.(id);
              const text = resolvedText ?? opt?.label ?? id;
              const colorSeed = opt?.label ?? resolvedText ?? id;
              const base = colorSeed ? stringToColorHex(colorSeed) : '#888888';
              const bg = hexToRgba(base, 0.15);
              const border = hexToRgba(base, 0.35);
              return (
                <Badge
                  key={id}
                  variant="outline"
                  className="gap-1"
                  style={{
                    backgroundColor: bg,
                    borderColor: border,
                    color: base,
                  }}
                >
                  <span className="max-w-[140px] truncate" title={text}>
                    {text}
                  </span>
                  <button
                    aria-label="Remove"
                    onClick={() => toggle(id)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {overflow > 0 && <Badge variant="secondary">+{overflow}</Badge>}
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear
            </Button>
          </>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('justify-between w-full', triggerClassName)}
            disabled={disabled}
          >
            {value.length > 0 ? `${value.length} selected` : placeholder}
            <ChevronsUpDown className="opacity-50" size={10} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 sm:max-w-[360px]"
          style={{
            width: triggerRef.current?.offsetWidth || popoverWidth,
            minWidth: triggerRef.current?.offsetWidth || popoverWidth,
            maxWidth: triggerRef.current?.offsetWidth || popoverWidth,
          }}
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command shouldFilter={false} className="w-full">
            <div className="relative border-b w-full sticky top-0 bg-popover z-10">
              <CommandInput
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onValueChange={(val: string) => setSearchTerm(val)}
                className="w-full"
              />
              {loading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
            <CommandList className="w-full max-h-[70vh] sm:max-h-[260px] overflow-y-auto">
              {error && (
                <div className="p-4 text-destructive text-center">{error}</div>
              )}
              {loading && options.length === 0 && (loadingSkeleton || null)}
              {!loading && !error && options.length === 0 && (
                <CommandEmpty>{notFoundLabel ?? 'No results.'}</CommandEmpty>
              )}
              <CommandGroup className="w-full">
                {options.map(opt => {
                  const active = selected.has(opt.value);
                  const disabledOpt =
                    opt.disabled || (!active && value.length >= maxSelected);
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={() => !disabledOpt && toggle(opt.value)}
                      className={cn('w-full', disabledOpt && 'opacity-50')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 truncate" title={opt.label}>
                          {opt.label}
                        </div>
                        <Check
                          className={cn(
                            'h-3 w-3',
                            active ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <div className="sm:hidden sticky bottom-0 bg-popover border-t p-2 flex justify-end">
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
