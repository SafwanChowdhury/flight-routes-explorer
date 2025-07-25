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
import { useToast } from "@/components/ToastProvider";
import Slider from "@mui/material/Slider";

export default function NewSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    prefer_single_leg_day_ratio: 0.5,
    operating_hours: {
      start: "06:00",
      end: "23:00",
    },
    minimum_rest_hours_between_long_haul: 8,
    repetition_mode: false,
  });

  const { showToast } = useToast();

  // Load airlines data
  useEffect(() => {
    const loadAirlines = async () => {
      setLoading(true);
      try {
        const data = await getAirlines();
        if (data.airlines && data.airlines.length > 0) {
          setAirlines(data.airlines);
        } else {
          showToast("No airlines available. Please try again later.");
        }
      } catch (err: any) {
        console.error("Failed to load airlines:", err);
        if (err.response?.status === 404) {
          showToast("Airlines service not available. Please try again later.");
        } else if (err.code === "NETWORK_ERROR") {
          showToast(
            "Network error. Please check your connection and try again."
          );
        } else {
          showToast("Failed to load airlines. Please try again.");
        }
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

  // Normalize haul weighting to ensure they sum to 1.0 and only include enabled haul types
  useEffect(() => {
    const { short, medium, long } = formData.haul_weighting;
    const {
      short: shortEnabled,
      medium: mediumEnabled,
      long: longEnabled,
    } = formData.haul_preferences;

    if (shortEnabled || mediumEnabled || longEnabled) {
      let total = 0;
      if (shortEnabled) total += short;
      if (mediumEnabled) total += medium;
      if (longEnabled) total += long;

      if (total !== 1.0 && total > 0) {
        const newShort = shortEnabled ? short / total : 0;
        const newMedium = mediumEnabled ? medium / total : 0;
        const newLong = longEnabled ? long / total : 0;

        // Only update if values actually changed
        if (
          Math.abs(newShort - short) > 1e-6 ||
          Math.abs(newMedium - medium) > 1e-6 ||
          Math.abs(newLong - long) > 1e-6
        ) {
          setFormData((prev: ScheduleConfig) => ({
            ...prev,
            haul_weighting: {
              short: newShort,
              medium: newMedium,
              long: newLong,
            },
          }));
        }
      }
    }
  }, [
    formData.haul_weighting.short,
    formData.haul_weighting.medium,
    formData.haul_weighting.long,
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
      name === "minimum_rest_hours_between_long_haul"
    ) {
      // Handle numeric fields
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value),
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
    } else if (name === "prefer_single_leg_day_ratio") {
      // Handle single leg day ratio as a number
      setFormData((prev) => ({
        ...prev,
        prefer_single_leg_day_ratio: parseFloat(value),
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

  // Handlers for MUI Sliders (haul weighting)
  const handleShortHaulSlider = (_: Event, value: number | number[]) => {
    setFormData((prev) => ({
      ...prev,
      haul_weighting: {
        ...prev.haul_weighting,
        short: value as number,
      },
    }));
  };
  const handleMediumHaulSlider = (_: Event, value: number | number[]) => {
    setFormData((prev) => ({
      ...prev,
      haul_weighting: {
        ...prev.haul_weighting,
        medium: value as number,
      },
    }));
  };
  const handleLongHaulSlider = (_: Event, value: number | number[]) => {
    setFormData((prev) => ({
      ...prev,
      haul_weighting: {
        ...prev.haul_weighting,
        long: value as number,
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Basic validation
      if (!formData.airline_id || formData.airline_id === 0) {
        throw new Error("Please select an airline");
      }

      if (!formData.airline_name) {
        throw new Error("Please select a valid airline");
      }

      if (!formData.start_airport) {
        throw new Error("Please select a start airport");
      }

      // Validate airport format (should be 3-letter IATA code)
      if (!/^[A-Z]{3}$/.test(formData.start_airport)) {
        throw new Error("Please select a valid airport (3-letter IATA code)");
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

      // Validate operating hours
      const startTime = new Date(
        `2000-01-01T${formData.operating_hours.start}`
      );
      const endTime = new Date(`2000-01-01T${formData.operating_hours.end}`);
      if (endTime <= startTime) {
        throw new Error("Operating hours end time must be after start time");
      }

      // Validate minimum rest hours
      if (
        formData.minimum_rest_hours_between_long_haul < 6 ||
        formData.minimum_rest_hours_between_long_haul > 24
      ) {
        throw new Error("Minimum rest hours must be between 6 and 24 hours");
      }

      // Validate single leg day ratio
      if (
        formData.prefer_single_leg_day_ratio < 0 ||
        formData.prefer_single_leg_day_ratio > 1
      ) {
        throw new Error("Single leg day ratio must be between 0 and 1");
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
        minimum_rest_hours_between_long_haul:
          formData.minimum_rest_hours_between_long_haul,
        repetition_mode: formData.repetition_mode,
      };

      console.log("Sending schedule request:", requestPayload);

      // Generate schedule with clean payload
      const result = await generateSchedule(requestPayload);

      if (result.status === "success" && result.schedule) {
        try {
          // Save the schedule to local storage
          saveSchedule(result.schedule);

          // Navigate back to schedule page
          router.push("/schedule");
        } catch (storageError) {
          console.error("Failed to save schedule:", storageError);
          showToast(
            "Schedule generated successfully but failed to save. Please try again."
          );
        }
      } else {
        throw new Error(result.message || "Failed to generate schedule");
      }
    } catch (err: any) {
      console.error("Error generating schedule:", err);

      // Handle specific API errors
      if (err.response?.status === 400) {
        showToast(
          err.response.data?.message ||
            "Invalid configuration. Please check your settings."
        );
      } else if (err.response?.status === 404) {
        showToast("Airline not found. Please select a different airline.");
      } else if (err.response?.status === 500) {
        showToast("Server error. Please try again later.");
      } else if (err.code === "NETWORK_ERROR") {
        showToast("Network error. Please check your connection and try again.");
      } else {
        showToast(
          err.message || "An error occurred while generating the schedule"
        );
      }
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

          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            <span></span>
          </div>

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
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={formData.haul_weighting.short}
                    onChange={handleShortHaulSlider}
                    sx={{
                      height: 10,
                      color: "#3b82f6",
                      "& .MuiSlider-rail": {
                        color: "#e5e7eb",
                        opacity: 1,
                        height: 10,
                        borderRadius: 4,
                      },
                      "& .MuiSlider-track": {
                        color: "#3b82f6",
                        height: 10,
                        borderRadius: 4,
                      },
                      "& .MuiSlider-thumb": {
                        width: 16,
                        height: 16,
                        backgroundColor: "white",
                        border: "2px solid #3b82f6",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(59,130,246,0.2)",
                        },
                        "&:focus, &.Mui-active": {
                          boxShadow: "0 0 0 4px rgba(59,130,246,0.15)",
                        },
                      },
                      "@media (prefers-color-scheme: dark)": {
                        color: "#3b82f6",
                        "& .MuiSlider-rail": {
                          color: "#4b5563",
                        },
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#1f2937",
                          border: "2px solid #3b82f6",
                        },
                      },
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="haul_weighting.medium"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Medium-haul: {formData.haul_weighting.medium.toFixed(1)}
                  </label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={formData.haul_weighting.medium}
                    onChange={handleMediumHaulSlider}
                    sx={{
                      height: 10,
                      color: "#3b82f6",
                      "& .MuiSlider-rail": {
                        color: "#e5e7eb",
                        opacity: 1,
                        height: 10,
                        borderRadius: 4,
                      },
                      "& .MuiSlider-track": {
                        color: "#3b82f6",
                        height: 10,
                        borderRadius: 4,
                      },
                      "& .MuiSlider-thumb": {
                        width: 16,
                        height: 16,
                        backgroundColor: "white",
                        border: "2px solid #3b82f6",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(59,130,246,0.2)",
                        },
                        "&:focus, &.Mui-active": {
                          boxShadow: "0 0 0 4px rgba(59,130,246,0.15)",
                        },
                      },
                      "@media (prefers-color-scheme: dark)": {
                        color: "#3b82f6",
                        "& .MuiSlider-rail": {
                          color: "#4b5563",
                        },
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#1f2937",
                          border: "2px solid #3b82f6",
                        },
                      },
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="haul_weighting.long"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Long-haul: {formData.haul_weighting.long.toFixed(1)}
                  </label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={formData.haul_weighting.long}
                    onChange={handleLongHaulSlider}
                    sx={{
                      height: 10,
                      color: "#3b82f6",
                      "& .MuiSlider-rail": {
                        color: "#e5e7eb",
                        opacity: 1,
                        height: 10,
                        borderRadius: 4,
                      },
                      "& .MuiSlider-track": {
                        color: "#3b82f6",
                        height: 10,
                        borderRadius: 4,
                      },
                      "& .MuiSlider-thumb": {
                        width: 16,
                        height: 16,
                        backgroundColor: "white",
                        border: "2px solid #3b82f6",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(59,130,246,0.2)",
                        },
                        "&:focus, &.Mui-active": {
                          boxShadow: "0 0 0 4px rgba(59,130,246,0.15)",
                        },
                      },
                      "@media (prefers-color-scheme: dark)": {
                        color: "#3b82f6",
                        "& .MuiSlider-rail": {
                          color: "#4b5563",
                        },
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#1f2937",
                          border: "2px solid #3b82f6",
                        },
                      },
                    }}
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
                {Number(formData.prefer_single_leg_day_ratio || 0).toFixed(1)}
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
            disabled={submitting || loading}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Schedule...
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
