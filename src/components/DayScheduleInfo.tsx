"use client";

import { useState } from "react";
import { Info, MapPin, CheckCircle, AlertCircle, Plane } from "lucide-react";
import { DaySchedule } from "@/types/schedule";

interface DayScheduleInfoProps {
  daySchedule: DaySchedule;
  timezone?: "utc" | "local";
}

export default function DayScheduleInfo({
  daySchedule,
  timezone = "local",
}: DayScheduleInfoProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    if (timezone === "utc") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      });
    } else {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getBlockTypeColor = (blockType: string) => {
    return blockType === "simple" ? "text-green-600" : "text-blue-600";
  };

  const getBlockTypeIcon = (blockType: string) => {
    return blockType === "simple" ? CheckCircle : Plane;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Day {daySchedule.day} Schedule Details
        </h3>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm px-2 py-1 rounded"
          title={expanded ? "Hide details" : "Show details"}
        >
          {expanded ? "Hide" : "Expand"}
        </button>
      </div>

      {/* Overnight Location (always visible) */}
      <div className="flex items-center mb-3 text-sm text-gray-600 dark:text-gray-400">
        <MapPin className="w-4 h-4 mr-2" />
        <span>Overnight: {daySchedule.overnight_location}</span>
      </div>

      {expanded && (
        <>
          {/* Notes */}
          {daySchedule.notes.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                Notes:
              </h4>
              <ul className="space-y-1">
                {daySchedule.notes.map((note, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                  >
                    <span className="mr-2">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Completed Blocks */}
          {daySchedule.completed_blocks.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Completed Flight Blocks:
              </h4>
              <div className="space-y-2">
                {daySchedule.completed_blocks.map((block, index) => {
                  const BlockIcon = getBlockTypeIcon(block.block_type);
                  return (
                    <div
                      key={index}
                      className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3"
                    >
                      <div className="flex items-center mb-2">
                        <BlockIcon
                          className={`w-4 h-4 mr-2 ${getBlockTypeColor(
                            block.block_type
                          )}`}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {block.block_type === "simple"
                            ? "Simple Block"
                            : "Multi-Stop Block"}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({block.legs.length} legs)
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div>Origin: {block.origin_airport}</div>
                        <div className="mt-1">
                          Route:{" "}
                          {block.legs
                            .map(
                              (leg) =>
                                `${leg.departure_airport}→${leg.arrival_airport}`
                            )
                            .join(" → ")}
                        </div>
                        <div className="mt-1">
                          Total Duration:{" "}
                          {formatDuration(
                            block.legs.reduce(
                              (total, leg) => total + leg.duration_min,
                              0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Incomplete Block */}
          {daySchedule.incomplete_block && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                Incomplete Block:
              </h4>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    Origin: {daySchedule.incomplete_block.origin_airport}
                  </div>
                  <div className="mt-1">
                    Completed:{" "}
                    {daySchedule.incomplete_block.completed_legs.length} legs
                  </div>
                  <div className="mt-1">
                    Remaining:{" "}
                    {daySchedule.incomplete_block.remaining_route.join(" → ")}
                  </div>
                  <div className="mt-1">
                    Type:{" "}
                    {daySchedule.incomplete_block.block_type === "simple"
                      ? "Simple Block"
                      : "Multi-Stop Block"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Flight Information */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Flight Details
              </h4>
              <div className="space-y-2">
                {daySchedule.legs.map((leg, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-md p-3"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {leg.departure_airport} → {leg.arrival_airport}
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {leg.haul_type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Duration: {formatDuration(leg.duration_min)}</div>
                      <div>Departure: {formatTime(leg.departure_time)}</div>
                      <div>Arrival: {formatTime(leg.arrival_time)}</div>
                      {leg.distance_km && (
                        <div>Distance: {leg.distance_km} km</div>
                      )}
                      {leg.departure_city && leg.arrival_city && (
                        <div>
                          Route: {leg.departure_city} → {leg.arrival_city}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
