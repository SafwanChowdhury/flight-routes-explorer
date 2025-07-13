"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { getCircularRoutes } from "@/lib/api";
import CircularRouteFilters from "./CircularRouteFilters";

// Define a type for circular route objects
interface CircularRoute {
  airline_id: number;
  pattern_type: string;
  route_pattern: string;
  start_airport: string;
  airports: string[];
  route_ids: number[];
  total_distance_km: number;
  total_duration_min: number;
  stops_count: number;
  segments: {
    segment_order: number;
    route_id: number;
    departure_iata: string;
    departure_name: string;
    departure_city: string;
    departure_country: string;
    arrival_iata: string;
    arrival_name: string;
    arrival_city: string;
    arrival_country: string;
    distance_km: number;
    duration_min: number;
  }[];
}

export default function CircularRoutesList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [routes, setRoutes] = useState<CircularRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<CircularRoute | null>(
    null
  );

  // Filter parameters
  const [filters, setFilters] = useState({
    airline_name: searchParams.get("airline_name") || "",
    airline_id: searchParams.get("airline_id") || "",
    start_airport: searchParams.get("start_airport") || "",
    pattern_type: searchParams.get("pattern_type") || "both",
    max_duration: searchParams.get("max_duration") || "",
    min_duration: searchParams.get("min_duration") || "",
    limit: searchParams.get("limit") || "20",
    all: searchParams.get("all") || "false",
  });

  // Duration range constants
  const MIN_DURATION = 0;
  const MAX_DURATION = 1440; // 24 hours in minutes

  // State for the dual range slider - initialize from URL params
  const [durationRange, setDurationRange] = useState<[number, number]>([
    parseInt(filters.min_duration) || MIN_DURATION,
    parseInt(filters.max_duration) || MAX_DURATION,
  ]);

  // Update duration range when filters change (e.g., from URL params)
  useEffect(() => {
    const minDuration = parseInt(filters.min_duration) || MIN_DURATION;
    const maxDuration = parseInt(filters.max_duration) || MAX_DURATION;
    setDurationRange([minDuration, maxDuration]);
  }, [filters.min_duration, filters.max_duration]);

  const loadCircularRoutes = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build parameters for the API call
      const params: any = {};

      if (filters.airline_id) {
        params.airline_id = filters.airline_id;
      } else if (filters.airline_name) {
        params.airline_name = filters.airline_name;
      } else {
        setError("Airline selection is required");
        setLoading(false);
        return;
      }

      if (filters.start_airport) {
        params.start_airport = filters.start_airport;
      }

      if (filters.pattern_type && filters.pattern_type !== "both") {
        params.pattern_type = filters.pattern_type;
      }

      // Use duration range values for filtering
      if (durationRange[1] < MAX_DURATION) {
        params.max_duration = durationRange[1].toString();
      }

      if (durationRange[0] > MIN_DURATION) {
        params.min_duration = durationRange[0].toString();
      }

      if (filters.limit) {
        params.limit = filters.limit;
      }

      if (filters.all) {
        params.all = filters.all;
      }

      const data = await getCircularRoutes(params);
      setRoutes(data.results || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load circular routes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Update filters state with current duration range
    const updatedFilters = {
      ...filters,
      min_duration: durationRange[0].toString(),
      max_duration: durationRange[1].toString(),
    };
    setFilters(updatedFilters);

    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const url = params.toString()
      ? `/circular-routes?${params.toString()}`
      : "/circular-routes";
    router.push(url, { scroll: false });

    loadCircularRoutes();
  };

  const clearFilters = () => {
    const clearedFilters = {
      airline_name: "",
      airline_id: "",
      start_airport: "",
      pattern_type: "both",
      max_duration: "",
      min_duration: "",
      limit: "20",
      all: "false",
    };
    setFilters(clearedFilters);

    setDurationRange([MIN_DURATION, MAX_DURATION]);
    router.push("/circular-routes", { scroll: false });
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

  // Format distance
  const formatDistance = (km: number) => {
    return `${km.toLocaleString()} km`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Search Circular Routes
      </h2>

      <CircularRouteFilters
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        filters={filters}
        setFilters={setFilters}
        durationRange={durationRange}
        setDurationRange={setDurationRange}
      />

      {/* Error message */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Searching for circular routes...
          </p>
        </div>
      ) : (
        <div>
          {/* Results table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Pattern Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Route Pattern
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stops
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {routes.length > 0 ? (
                    routes.map((route, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {route.pattern_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {route.route_pattern}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Start: {route.start_airport}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDuration(route.total_duration_min)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDistance(route.total_distance_km)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {route.stops_count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No circular routes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {routes.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {routes.map((route, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedRoute(route)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900 dark:text-gray-200">
                          {route.pattern_type}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDuration(route.total_duration_min)}
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="font-medium text-gray-900 dark:text-gray-200">
                          {route.route_pattern}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Start: {route.start_airport}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDistance(route.total_distance_km)}</span>
                        <span>{route.stops_count} stops</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No circular routes found.
                </div>
              )}
            </div>
          </div>

          {/* Results count */}
          {routes.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Found {routes.length} circular route
              {routes.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Route Details Popup - TODO: Create CircularRouteDetailsPopup component */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                {selectedRoute.pattern_type} Route Details
              </h3>
              <button
                onClick={() => setSelectedRoute(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Route Pattern
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedRoute.route_pattern}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-1">
                    Total Duration
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDuration(selectedRoute.total_duration_min)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-1">
                    Total Distance
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDistance(selectedRoute.total_distance_km)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-1">
                    Stops
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedRoute.stops_count}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-1">
                    Start Airport
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedRoute.start_airport}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Segments
                </h4>
                <div className="space-y-2">
                  {selectedRoute.segments.map((segment, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {segment.segment_order}.
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-200">
                        {segment.departure_iata} → {segment.arrival_iata}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({formatDuration(segment.duration_min)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
