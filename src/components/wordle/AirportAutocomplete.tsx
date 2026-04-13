'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Airport } from '@/types/wordle';

interface Props {
  airportCache: Map<string, Airport>;
  value: string | null;
  onChange: (iata: string | null) => void;
  placeholder: string;
  excludeIata?: string | null;
}

function searchAirports(
  cache: Map<string, Airport>,
  query: string,
  exclude: string | null | undefined,
): Airport[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const iataMatches: Airport[] = [];
  const cityMatches: Airport[] = [];
  const countryMatches: Airport[] = [];

  for (const airport of cache.values()) {
    if (airport.iata === exclude) continue;

    if (airport.iata.toLowerCase().startsWith(q)) {
      iataMatches.push(airport);
    } else if (
      airport.city_name?.toLowerCase().includes(q) ||
      airport.name?.toLowerCase().includes(q)
    ) {
      cityMatches.push(airport);
    } else if (airport.country?.toLowerCase().includes(q)) {
      countryMatches.push(airport);
    }
  }

  return [...iataMatches, ...cityMatches, ...countryMatches];
}

export default function AirportAutocomplete({
  airportCache,
  value,
  onChange,
  placeholder,
  excludeIata,
}: Props) {
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input text when value is set externally (e.g. restored from storage)
  useEffect(() => {
    if (value && airportCache.size > 0) {
      const airport = airportCache.get(value);
      if (airport) {
        setInputText(`${airport.city_name} (${airport.iata})`);
      }
    }
  }, [value, airportCache]);

  const selectAirport = useCallback(
    (airport: Airport) => {
      setInputText(`${airport.city_name} (${airport.iata})`);
      setSuggestions([]);
      setShowDropdown(false);
      setActiveIdx(-1);
      onChange(airport.iata);
    },
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (!text) {
      onChange(null);
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const results = searchAirports(airportCache, text, excludeIata);
    setSuggestions(results);
    setShowDropdown(results.length > 0);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectAirport(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 relative min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        autoComplete="off"
        spellCheck={false}
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {suggestions.map((airport, idx) => (
            <button
              key={airport.iata}
              onMouseDown={(e) => {
                e.preventDefault();
                selectAirport(airport);
              }}
              className={`w-full text-left px-3 py-2.5 transition ${
                idx === activeIdx
                  ? 'bg-blue-50 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${idx > 0 ? 'border-t dark:border-gray-700' : ''}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-sm text-blue-600 dark:text-blue-400 flex-shrink-0">
                  {airport.iata}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {airport.city_name}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {airport.name} &middot; {airport.country}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
