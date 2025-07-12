"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, RefreshCw, Clock } from "lucide-react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import SearchInput from "./SearchInput";
import AirlineSearchInput from "./AirlineSearchInput";

interface RouteFiltersProps {
  onApplyFilters: () => void;
  onClearFilters: () => void;
  filters: {
    airline_name: string;
    departure_iata: string;
    arrival_iata: string;
    departure_country: string;
    arrival_country: string;
    max_duration: string;
    min_duration: string;
    exclude_base_airport: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      airline_name: string;
      departure_iata: string;
      arrival_iata: string;
      departure_country: string;
      arrival_country: string;
      max_duration: string;
      min_duration: string;
      exclude_base_airport: string;
    }>
  >;
  durationRange: [number, number];
  setDurationRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  biDirectionalMessage: string | null;
  excludeBaseAirportMessage: string | null;
}

// Duration range constants
const MIN_DURATION = 0;
const MAX_DURATION = 1440; // 24 hours in minutes

export default function RouteFilters({
  onApplyFilters,
  onClearFilters,
  filters,
  setFilters,
  durationRange,
  setDurationRange,
  biDirectionalMessage,
  excludeBaseAirportMessage,
}: RouteFiltersProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDurationRangeChange = (value: [number, number]) => {
    setDurationRange(value);
  };

  const handleAirportSelect =
    (field: "departure_iata" | "arrival_iata") => (result: any) => {
      setFilters((prev) => ({ ...prev, [field]: result.iata }));
    };

  const handleAirlineSelect = (result: any) => {
    setFilters((prev) => ({ ...prev, airline_name: result.name }));
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div>
      {/* Bi-directional filter message */}
      {biDirectionalMessage && (
        <div className="p-4 mb-4 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md flex justify-between items-center">
          <span>{biDirectionalMessage}</span>
          <button
            onClick={onClearFilters}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Exclude base airport filter message */}
      {excludeBaseAirportMessage && (
        <div className="p-4 mb-4 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-md flex justify-between items-center">
          <span>{excludeBaseAirportMessage}</span>
          <button
            onClick={onClearFilters}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Airline
            </label>
            <AirlineSearchInput
              value={filters.airline_name}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, airline_name: value }))
              }
              placeholder="Search airline..."
              onSelect={handleAirlineSelect}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From
            </label>
            <div className="flex items-center space-x-2">
              <SearchInput
                value={filters.departure_iata}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, departure_iata: value }))
                }
                placeholder="Search airport or city..."
                onSelect={handleAirportSelect("departure_iata")}
              />
              {filters.airline_name && filters.departure_iata && (
                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={filters.exclude_base_airport === "true"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        exclude_base_airport: e.target.checked ? "true" : "",
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-xs">Exclude as base</span>
                </label>
              )}
            </div>
            {filters.airline_name && filters.departure_iata && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Check to exclude routes that start or end at{" "}
                {filters.departure_iata} for {filters.airline_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To
            </label>
            <SearchInput
              value={filters.arrival_iata}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, arrival_iata: value }))
              }
              placeholder="Search airport or city..."
              onSelect={handleAirportSelect("arrival_iata")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Country
            </label>
            <input
              type="text"
              name="departure_country"
              value={filters.departure_country}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. United Kingdom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Country
            </label>
            <input
              type="text"
              name="arrival_country"
              value={filters.arrival_country}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. United States"
            />
          </div>
        </div>

        {/* Duration Range Slider and Inputs */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Flight Duration Range
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            {/* Text inputs for duration */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Duration ({formatDuration(durationRange[0])})
                </label>
                <input
                  type="number"
                  name="min_duration"
                  value={durationRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (
                      !isNaN(value) &&
                      value >= MIN_DURATION &&
                      value <= durationRange[1]
                    ) {
                      handleDurationRangeChange([value, durationRange[1]]);
                    }
                  }}
                  className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Minutes"
                  min={MIN_DURATION}
                  max={durationRange[1]}
                />
              </div>

              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Duration ({formatDuration(durationRange[1])})
                </label>
                <input
                  type="number"
                  name="max_duration"
                  value={durationRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (
                      !isNaN(value) &&
                      value <= MAX_DURATION &&
                      value >= durationRange[0]
                    ) {
                      handleDurationRangeChange([durationRange[0], value]);
                    }
                  }}
                  className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Minutes"
                  min={durationRange[0]}
                  max={MAX_DURATION}
                />
              </div>
            </div>

            {/* Range Slider Component */}
            <div className="py-2">
              <RangeSlider
                min={MIN_DURATION}
                max={MAX_DURATION}
                step={5}
                value={durationRange}
                onInput={handleDurationRangeChange}
                className="custom-range-slider"
              />
            </div>

            {/* Duration markers */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
              <span>18h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Custom CSS for the range slider */}
      <style jsx global>{`
        .custom-range-slider .range-slider {
          height: 6px;
          background: #e5e7eb;
          border-radius: 4px;
        }

        .dark .custom-range-slider .range-slider {
          background: #4b5563;
        }

        .custom-range-slider .range-slider__range {
          background: #3b82f6;
          border-radius: 4px;
        }

        .custom-range-slider .range-slider__thumb {
          background: white;
          border: 2px solid #3b82f6;
          width: 16px;
          height: 16px;
        }

        .dark .custom-range-slider .range-slider__thumb {
          background: #1f2937;
        }

        .custom-range-slider .range-slider__thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
