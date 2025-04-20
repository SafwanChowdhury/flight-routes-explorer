"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Info,
  Save,
  Clock,
  Plane,
  Globe,
  Flag,
  RotateCw,
  Loader2,
  Settings,
} from "lucide-react";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import { getAirlines, generateSchedule } from "@/lib/api";
import { ScheduleConfig } from "@/types/schedule";
import { saveSchedule } from "@/lib/scheduleStorage";

export default function NewSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [airlines, setAirlines] = useState<any[]>([]);

  // Initialize form state
  const [formData, setFormData] = useState<ScheduleConfig>({
    airline_id: 0,
    airline_name: "",
    start_airport: "",
    days: 3,
    haul_preferences: {
      short: true,
      medium: true,
      long: true,
    },
    haul_weighting: {
      short: 0.5,
      medium: 0.3,
      long: 0.2,
    },
    prefer_single_leg_day_ratio: 0.4,
    operating_hours: {
      start: "06:00",
      end: "23:00",
    },
    turnaround_time_minutes: 45,
    preferred_countries: [],
    preferred_regions: [],
    minimum_rest_hours_between_long_haul: 8,
    repetition_mode: false,
  });

  // Load airlines data
  useEffect(() => {
    const loadAirlines = async () => {
      setLoading(true);
      try {
        const data = await getAirlines();
        setAirlines(data.airlines || []);
      } catch (err) {
        console.error("Failed to load airlines:", err);
        setError("Failed to load airlines. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAirlines();
  }, []);

  // Make sure we always have at least one haul type selected
  useEffect(() => {
    const isAnyHaulTypeSelected =
      formData.haul_preferences.short ||
      formData.haul_preferences.medium ||
      formData.haul_preferences.long;

    if (!isAnyHaulTypeSelected) {
      // If none are selected, default to short-haul
      setFormData((prev) => ({
        ...prev,
        haul_preferences: {
          ...prev.haul_preferences,
          short: true,
        },
      }));
    }
  }, [
    formData.haul_preferences.short,
    formData.haul_preferences.medium,
    formData.haul_preferences.long,
  ]);

  // Handle form field changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === "repetition_mode" && type === "checkbox") {
      // Handle the repetition mode checkbox directly
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        repetition_mode: checkbox.checked,
      }));
    } else if (
      name === "days" ||
      name === "turnaround_time_minutes" ||
      name === "minimum_rest_hours_between_long_haul"
    ) {
      // Handle numeric fields
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value),
      }));
    } else if (name === "preferred_countries" || name === "preferred_regions") {
      // Handle comma-separated lists
      const values = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      setFormData((prev) => ({
        ...prev,
        [name]: values,
      }));
    } else if (name.startsWith("haul_preferences.")) {
      // Handle haul preferences checkboxes properly
      const haulType = name.split(".")[1];
      const checkbox = e.target as HTMLInputElement;

      setFormData((prev) => ({
        ...prev,
        haul_preferences: {
          ...prev.haul_preferences,
          [haulType]: checkbox.checked,
        },
      }));
    } else if (name.startsWith("haul_weighting.")) {
      // Handle haul weightings
      const haulType = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        haul_weighting: {
          ...prev.haul_weighting,
          [haulType]: parseFloat(value),
        },
      }));
    } else if (name.startsWith("operating_hours.")) {
      // Handle operating hours
      const timeType = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        operating_hours: {
          ...prev.operating_hours,
          [timeType]: value,
        },
      }));
    } else {
      // Handle all other fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle airline selection
  const handleAirlineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = e.target.selectedIndex;
    const selectedAirline = airlines[selectedIndex - 1]; // -1 because of the default "Select airline" option

    if (selectedAirline) {
      setFormData((prev) => ({
        ...prev,
        airline_id: selectedAirline.id,
        airline_name: selectedAirline.name,
        airline_iata: selectedAirline.iata,
      }));
    }
  };

  // Handle airport selection
  const handleAirportSelect = (result: any) => {
    setFormData((prev) => ({
      ...prev,
      start_airport: result.iata,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.airline_id) {
        throw new Error("Please select an airline");
      }

      if (!formData.start_airport) {
        throw new Error("Please select a start airport");
      }

      if (formData.days < 1 || formData.days > 30) {
        throw new Error("Days must be between 1 and 30");
      }

      if (
        !formData.haul_preferences.short &&
        !formData.haul_preferences.medium &&
        !formData.haul_preferences.long
      ) {
        throw new Error("At least one haul type must be enabled");
      }

      // Prepare the request payload
      // Create a clean copy to avoid sending any unwanted properties
      const requestPayload = {
        airline_id: formData.airline_id,
        airline_name: formData.airline_name,
        airline_iata: formData.airline_iata,
        start_airport: formData.start_airport,
        days: formData.days,
        haul_preferences: {
          short: formData.haul_preferences.short,
          medium: formData.haul_preferences.medium,
          long: formData.haul_preferences.long,
        },
        haul_weighting: {
          short: formData.haul_weighting.short,
          medium: formData.haul_weighting.medium,
          long: formData.haul_weighting.long,
        },
        prefer_single_leg_day_ratio: formData.prefer_single_leg_day_ratio,
        operating_hours: {
          start: formData.operating_hours.start,
          end: formData.operating_hours.end,
        },
        turnaround_time_minutes: formData.turnaround_time_minutes,
        preferred_countries: formData.preferred_countries,
        preferred_regions: formData.preferred_regions,
        minimum_rest_hours_between_long_haul:
          formData.minimum_rest_hours_between_long_haul,
        repetition_mode: formData.repetition_mode,
      };

      console.log("Sending schedule request:", requestPayload);

      // Generate schedule with clean payload
      const result = await generateSchedule(requestPayload);

      if (result.status === "success" && result.schedule) {
        // Save the schedule to local storage
        saveSchedule(result.schedule);

        // Navigate back to schedule page
        router.push("/schedule");
      } else {
        throw new Error(result.message || "Failed to generate schedule");
      }
    } catch (err: any) {
      console.error("Error generating schedule:", err);
      setError(
        err.message || "An error occurred while generating the schedule"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Link
            href="/schedule"
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          Build New Schedule
        </h1>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Plane className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="airline"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Airline
              </label>
              <select
                id="airline"
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={handleAirlineChange}
                disabled={loading}
              >
                <option value="">Select airline</option>
                {airlines.map((airline) => (
                  <option key={airline.id} value={airline.id}>
                    {airline.name} ({airline.iata || "N/A"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="start_airport"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Start Airport
              </label>
              <SearchInput
                value={formData.start_airport}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, start_airport: value }))
                }
                placeholder="Search airport..."
                onSelect={handleAirportSelect}
              />
            </div>

            <div>
              <label
                htmlFor="days"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Schedule Duration (Days)
              </label>
              <input
                type="number"
                id="days"
                name="days"
                min="1"
                max="30"
                value={formData.days}
                onChange={handleInputChange}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Flight Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Flight Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Haul Types
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="haul_preferences.short"
                    name="haul_preferences.short"
                    checked={formData.haul_preferences.short}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="haul_preferences.short"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Short-haul (0.5-3 hours)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="haul_preferences.medium"
                    name="haul_preferences.medium"
                    checked={formData.haul_preferences.medium}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="haul_preferences.medium"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Medium-haul (3-6 hours)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="haul_preferences.long"
                    name="haul_preferences.long"
                    checked={formData.haul_preferences.long}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="haul_preferences.long"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Long-haul (6+ hours)
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Haul Weighting
              </label>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="haul_weighting.short"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Short-haul: {formData.haul_weighting.short.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    id="haul_weighting.short"
                    name="haul_weighting.short"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.haul_weighting.short}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="haul_weighting.medium"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Medium-haul: {formData.haul_weighting.medium.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    id="haul_weighting.medium"
                    name="haul_weighting.medium"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.haul_weighting.medium}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="haul_weighting.long"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Long-haul: {formData.haul_weighting.long.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    id="haul_weighting.long"
                    name="haul_weighting.long"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.haul_weighting.long}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="operating_hours.start"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Operating Hours Start
              </label>
              <input
                type="time"
                id="operating_hours.start"
                name="operating_hours.start"
                value={formData.operating_hours.start}
                onChange={handleInputChange}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="operating_hours.end"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Operating Hours End
              </label>
              <input
                type="time"
                id="operating_hours.end"
                name="operating_hours.end"
                value={formData.operating_hours.end}
                onChange={handleInputChange}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="turnaround_time_minutes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Turnaround Time (Minutes)
              </label>
              <input
                type="number"
                id="turnaround_time_minutes"
                name="turnaround_time_minutes"
                min="30"
                max="180"
                value={formData.turnaround_time_minutes}
                onChange={handleInputChange}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum time needed between consecutive flights (30-180 minutes)
              </p>
            </div>

            <div>
              <label
                htmlFor="minimum_rest_hours_between_long_haul"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Minimum Rest Between Long-haul (Hours)
              </label>
              <input
                type="number"
                id="minimum_rest_hours_between_long_haul"
                name="minimum_rest_hours_between_long_haul"
                min="6"
                max="24"
                value={formData.minimum_rest_hours_between_long_haul}
                onChange={handleInputChange}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Destinations Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Destination Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="preferred_countries"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Preferred Countries
              </label>
              <input
                type="text"
                id="preferred_countries"
                name="preferred_countries"
                value={formData.preferred_countries.join(", ")}
                onChange={handleInputChange}
                placeholder="e.g. France, Italy, Spain"
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Comma-separated list of countries to favor in route selection
              </p>
            </div>

            <div>
              <label
                htmlFor="preferred_regions"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Preferred Regions
              </label>
              <input
                type="text"
                id="preferred_regions"
                name="preferred_regions"
                value={formData.preferred_regions.join(", ")}
                onChange={handleInputChange}
                placeholder="e.g. EU, AS, NA"
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Comma-separated list of region codes (EU=Europe, AS=Asia, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Advanced Options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="prefer_single_leg_day_ratio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Single Destination Day Ratio:{" "}
                {formData.prefer_single_leg_day_ratio.toFixed(1)}
              </label>
              <input
                type="range"
                id="prefer_single_leg_day_ratio"
                name="prefer_single_leg_day_ratio"
                min="0"
                max="1"
                step="0.1"
                value={formData.prefer_single_leg_day_ratio}
                onChange={handleInputChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Higher values favor single-destination days over
                multi-destination days
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="repetition_mode"
                name="repetition_mode"
                checked={formData.repetition_mode}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
              <label
                htmlFor="repetition_mode"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Repetition Mode
              </label>
              <div className="ml-2 text-gray-500 dark:text-gray-400 cursor-help group relative">
                <Info className="h-4 w-4" />
                <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-100 dark:bg-gray-700 text-xs rounded shadow-lg -left-20 top-6">
                  When enabled, the generator selects a single destination for
                  each day and repeats trips to that destination. Useful for
                  training or familiarization flights.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/schedule"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Generate Schedule
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
