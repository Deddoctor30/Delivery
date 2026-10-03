"use client";

import * as React from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface SearchSuggestion {
  label: string;
}

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onValueChange,
  onSubmit,
  placeholder = "Найти товар…",
  suggestions,
  onSelect,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : localValue;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);

  const hasSuggestions = Array.isArray(suggestions) && suggestions.length > 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    if (!isControlled) setLocalValue(next);
    onChange?.(next);
    onValueChange?.(next);
    if (hasSuggestions) setOpen(true);
  }

  function handleClear() {
    if (!isControlled) setLocalValue("");
    onChange?.("");
    onValueChange?.("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.(currentValue);
      setOpen(false);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleSelect(suggestion: SearchSuggestion) {
    if (!isControlled) setLocalValue(suggestion.label);
    onChange?.(suggestion.label);
    onValueChange?.(suggestion.label);
    onSelect?.(suggestion);
    setOpen(false);
  }

  // Close dropdown on outside click
  React.useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const showDropdown = open && hasSuggestions;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search field — 44px tall, pill-shaped, card background */}
      <div
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-full border border-border bg-card px-3.5",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => hasSuggestions && currentValue === "" && setOpen(true)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          aria-label={placeholder}
          autoComplete="off"
        />
        {currentValue && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Очистить поиск"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-lg border border-border bg-popover p-2 shadow-lg"
        >
          <div className="px-2.5 py-1.5">
            <span className="font-caption text-[11px] font-medium text-muted-foreground">
              Популярные запросы
            </span>
          </div>
          {suggestions!.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(suggestion)}
              className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <TrendingUp
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                {suggestion.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
