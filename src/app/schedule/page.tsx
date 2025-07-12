"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Calendar, Plus, Plane } from "lucide-react";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import ScheduleSummary from "@/components/ScheduleSummary";
import { getSchedule, isScheduleValid } from "@/lib/scheduleStorage";
import { GeneratedSchedule } from "@/types/schedule";

export default function SchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

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
    router.push("/schedule/new");
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

        <button
          onClick={handleNewSchedule}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span>Build New Schedule</span>
        </button>
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
          <ScheduleCalendar />
        </div>
      )}
    </div>
  );
}
