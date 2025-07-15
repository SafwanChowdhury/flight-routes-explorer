"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Calendar, Plus, Plane, RotateCw, Loader2 } from "lucide-react";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import ScheduleSummary from "@/components/ScheduleSummary";
import DayScheduleInfo from "@/components/DayScheduleInfo";
import {
  getSchedule,
  isScheduleValid,
  clearSchedule,
  saveSchedule,
} from "@/lib/scheduleStorage";
import { generateSchedule } from "@/lib/api";
import { GeneratedSchedule } from "@/types/schedule";
import { useToast } from "@/components/ToastProvider";
import { Switch } from "@mui/material";

export default function SchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [currentDaySchedule, setCurrentDaySchedule] = useState<any>(null);
  const [timezone, setTimezone] = useState<"utc" | "local">("utc");
  const { showToast } = useToast();
  const isUTC = timezone === "utc";
  const isLocal = timezone === "local";

  useEffect(() => {
    // Check if we have a valid schedule in storage
    const scheduleIsValid = isScheduleValid();
    setIsValid(scheduleIsValid);

    if (scheduleIsValid) {
      const cachedSchedule = getSchedule();
      if (cachedSchedule) {
        setSchedule(cachedSchedule.schedule);
      }
    }

    setLoading(false);
  }, []);

  const handleNewSchedule = () => {
    // Clear the current schedule from cache
    clearSchedule();
    // Reset the current state
    setSchedule(null);
    setIsValid(false);
    setCurrentDaySchedule(null);
    // Navigate to the new schedule page
    router.push("/schedule/new");
  };

  const handleReloadSchedule = async () => {
    if (!schedule) return;

    setReloading(true);
    try {
      // Use the same configuration as the current schedule
      const config = schedule.config;

      console.log("Reloading schedule with config:", config);

      // Generate new schedule with the same configuration
      const result = await generateSchedule(config);

      if (result.status === "success" && result.schedule) {
        try {
          // Clear the current schedule first
          clearSchedule();

          // Save the new schedule to local storage
          saveSchedule(result.schedule);

          // Update the current state
          setSchedule(result.schedule);
          setIsValid(true);
          setCurrentDaySchedule(null);

          showToast("Schedule reloaded successfully!");
        } catch (storageError) {
          console.error("Failed to save reloaded schedule:", storageError);
          showToast("Schedule reloaded but failed to save. Please try again.");
        }
      } else {
        throw new Error(result.message || "Failed to reload schedule");
      }
    } catch (err: any) {
      console.error("Error reloading schedule:", err);

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
          err.message || "An error occurred while reloading the schedule"
        );
      }
    } finally {
      setReloading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Loading schedule...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Flight Schedule
        </h1>

        <div className="flex gap-3 items-center">
          {/* Timezone Sliding Toggle */}
          <div className="flex items-center mr-2">
            <div className="relative flex w-32 h-9 bg-gray-100 dark:bg-gray-700 rounded-full shadow-inner cursor-pointer select-none transition-colors">
              {/* Sliding background */}
              <span
                className={`absolute top-0 left-0 w-1/2 h-full rounded-full transition-transform duration-300 z-0 bg-blue-600 ${
                  timezone === "utc" ? "translate-x-0" : "translate-x-full"
                }`}
                style={{ boxShadow: "0 2px 8px rgba(59,130,246,0.10)" }}
              ></span>
              {/* UTC label */}
              <button
                className={`relative z-10 flex-1 text-xs font-semibold rounded-full transition-colors duration-200 h-full flex items-center justify-center ${
                  timezone === "utc"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setTimezone("utc")}
                type="button"
              >
                UTC
              </button>
              {/* Local label */}
              <button
                className={`relative z-10 flex-1 text-xs font-semibold rounded-full transition-colors duration-200 h-full flex items-center justify-center ${
                  timezone === "local"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setTimezone("local")}
                type="button"
              >
                Local
              </button>
            </div>
          </div>
          {isValid && schedule && (
            <button
              onClick={handleReloadSchedule}
              disabled={reloading}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white rounded-md shadow-sm"
            >
              {reloading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RotateCw className="w-5 h-5 mr-2" />
              )}
              <span>{reloading ? "Reloading..." : "Reload Schedule"}</span>
            </button>
          )}

          <button
            onClick={handleNewSchedule}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span>Build New Schedule</span>
          </button>
        </div>
      </div>

      {!isValid || !schedule ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No Active Schedule
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have an active flight schedule. Create one to start
            planning your flights.
          </p>
          <button
            onClick={handleNewSchedule}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
          >
            Create Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <ScheduleSummary schedule={schedule} />
          <ScheduleCalendar
            onDayScheduleChange={setCurrentDaySchedule}
            timezone={timezone}
            setTimezone={setTimezone}
          />
          {currentDaySchedule && (
            <DayScheduleInfo
              daySchedule={currentDaySchedule}
              timezone={timezone}
            />
          )}
        </div>
      )}
    </div>
  );
}
