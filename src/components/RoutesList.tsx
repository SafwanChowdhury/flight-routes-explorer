"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getRoutes, getAirlineRoutesExcludeBase } from "@/lib/api";
import RouteFilters from "./RouteFilters";
import RouteDetailsPopup from "./RouteDetailsPopup";
import { useToast } from "@/components/ToastProvider";

// Define a type for route objects
interface Route {
  route_id: number;
  departure_iata: string;
  departure_city: string;
  departure_country: string;
  arrival_iata: string;
  arrival_city: string;
  arrival_country: string;
  distance_km: number;
  duration_min: number;
  airline_iata: string;
  airline_name: string;
  [key: string]: any;
}

export default function RoutesList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    total: 0,
  });

  // Special parameters for bi-directional filtering
  const airport_iata = searchParams.get("airport_iata");
  const country = searchParams.get("country");
  const auto_apply = searchParams.get("auto_apply");

  // Duration range constants
  const MIN_DURATION = 0;
  const MAX_DURATION = 1440; // 24 hours in minutes

  // Regular filter parameters
  const [filters, setFilters] = useState({
    airline_name: searchParams.get("airline_name") || "",
    departure_iata: airport_iata || searchParams.get("departure_iata") || "",
    arrival_iata: searchParams.get("arrival_iata") || "",
    departure_country: country || searchParams.get("departure_country") || "",
    arrival_country: searchParams.get("arrival_country") || "",
    max_duration: searchParams.get("max_duration") || MAX_DURATION.toString(),
    min_duration: searchParams.get("min_duration") || MIN_DURATION.toString(),
    exclude_base_airport: searchParams.get("exclude_base_airport") || "",
  });

  // State for the dual range slider
  const [durationRange, setDurationRange] = useState<[number, number]>([
    parseInt(filters.min_duration) || MIN_DURATION,
    parseInt(filters.max_duration) || MAX_DURATION,
  ]);

  // Flag to track if we're doing a bi-directional query
  const [biDirectionalMode, setBiDirectionalMode] = useState({
    airport: !!airport_iata,
    country: !!country,
  });

  // Initialize and use any URL parameters
  useEffect(() => {
    if (searchParams.toString()) {
      setDurationRange([
        parseInt(filters.min_duration) || MIN_DURATION,
        parseInt(filters.max_duration) || MAX_DURATION,
      ]);

      if (auto_apply === "true") {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("auto_apply");
        router.replace(`/?${newParams.toString()}`, { scroll: false });

        if (biDirectionalMode.airport || biDirectionalMode.country) {
          loadRoutesWithParams();
        } else {
          loadRoutes();
        }
      } else {
        setLoading(false);
      }
    } else {
      loadRoutes();
    }
  }, []);

  // When pagination changes
  useEffect(() => {
    if (routes.length > 0) {
      if (biDirectionalMode.airport || biDirectionalMode.country) {
        loadRoutesWithParams();
      } else {
        loadRoutes();
      }
    }
  }, [pagination.offset, pagination.limit]);

  const loadRoutesWithParams = async () => {
    setLoading(true);

    try {
      let allRoutes: Route[] = [];

      // Handle bi-directional airport filter
      if (biDirectionalMode.airport) {
        const departureParams = {
          departure_iata: airport_iata,
          limit: 100,
          offset: 0,
        };

        const departureData = await getRoutes(departureParams);

        const arrivalParams = {
          arrival_iata: airport_iata,
          limit: 100,
          offset: 0,
        };

        const arrivalData = await getRoutes(arrivalParams);

        allRoutes = [...departureData.routes, ...arrivalData.routes];
        allRoutes = allRoutes.filter(
          (route, index, self) =>
            index === self.findIndex((r) => r.route_id === route.route_id)
        );
      }
      // Handle bi-directional country filter
      else if (biDirectionalMode.country) {
        const departureParams = {
          departure_country: country,
          limit: 100,
          offset: 0,
        };

        const departureData = await getRoutes(departureParams);

        const arrivalParams = {
          arrival_country: country,
          limit: 100,
          offset: 0,
        };

        const arrivalData = await getRoutes(arrivalParams);

        allRoutes = [...departureData.routes, ...arrivalData.routes];
        allRoutes = allRoutes.filter(
          (route, index, self) =>
            index === self.findIndex((r) => r.route_id === route.route_id)
        );
      }

      // Apply airline filter if present
      if (filters.airline_name) {
        allRoutes = allRoutes.filter((route) =>
          route.airline_name
            .toLowerCase()
            .includes(filters.airline_name.toLowerCase())
        );
      }

      // Apply duration filters
      allRoutes = allRoutes.filter(
        (route) =>
          route.duration_min >= durationRange[0] &&
          route.duration_min <= durationRange[1]
      );

      // Apply pagination to the combined results
      const paginatedRoutes = allRoutes.slice(
        pagination.offset,
        pagination.offset + pagination.limit
      );

      setRoutes(paginatedRoutes);
      setPagination((prev) => ({
        ...prev,
        total: allRoutes.length,
      }));
    } catch (err) {
      showToast("Failed to load routes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    setLoading(true);

    try {
      // Check if we should use the exclude base airport endpoint
      if (
        filters.airline_name &&
        filters.departure_iata &&
        filters.exclude_base_airport === "true"
      ) {
        const params = {
          limit: pagination.limit,
          offset: pagination.offset,
        };

        const data = await getAirlineRoutesExcludeBase(
          filters.airline_name,
          filters.departure_iata, // Use departure airport as base airport
          params
        );

        setRoutes(data.routes);
        setPagination((prev) => ({
          ...prev,
          total: data.total || data.routes.length,
        }));
        return;
      }

      const params = Object.fromEntries(
        Object.entries({
          ...filters,
          min_duration: durationRange[0].toString(),
          max_duration: durationRange[1].toString(),
          limit: pagination.limit,
          offset: pagination.offset,
        }).filter(([_, v]) => v !== "")
      );

      const data = await getRoutes(params);
      setRoutes(data.routes);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (err) {
      showToast("Failed to load routes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, offset: 0 }));

    setBiDirectionalMode({
      airport: false,
      country: false,
    });

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    params.set("min_duration", durationRange[0].toString());
    params.set("max_duration", durationRange[1].toString());

    const url = params.toString() ? `/?${params.toString()}` : "/";
    router.push(url, { scroll: false });

    loadRoutes();
  };

  const clearFilters = () => {
    setFilters({
      airline_name: "",
      departure_iata: "",
      arrival_iata: "",
      departure_country: "",
      arrival_country: "",
      max_duration: MAX_DURATION.toString(),
      min_duration: MIN_DURATION.toString(),
      exclude_base_airport: "",
    });

    setDurationRange([MIN_DURATION, MAX_DURATION]);

    setBiDirectionalMode({
      airport: false,
      country: false,
    });

    router.push("/", { scroll: false });

    setTimeout(loadRoutes, 0);
  };

  // Calculate display message for bidirectional mode
  const getBiDirectionalMessage = () => {
    if (biDirectionalMode.airport && airport_iata) {
      return `Showing all routes for airport: ${airport_iata} (as origin or destination)`;
    } else if (biDirectionalMode.country && country) {
      return `Showing all routes for country: ${country} (as origin or destination)`;
    }
    return null;
  };

  // Calculate display message for exclude base airport mode
  const getExcludeBaseAirportMessage = () => {
    if (
      filters.airline_name &&
      filters.departure_iata &&
      filters.exclude_base_airport === "true"
    ) {
      return `Showing ${filters.airline_name} routes excluding ${filters.departure_iata} as base airport`;
    }
    return null;
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
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Search Flight Routes
      </h2>

      <RouteFilters
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        filters={filters}
        setFilters={setFilters}
        durationRange={durationRange}
        setDurationRange={setDurationRange}
        biDirectionalMessage={getBiDirectionalMessage()}
        excludeBaseAirportMessage={getExcludeBaseAirportMessage()}
      />

      {/* Error message */}
      {/* Removed error message div */}

      {/* Loading indicator */}
      {loading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading routes...
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
                      Airline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Arrival
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
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
                            {route.airline_name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {route.departure_iata}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {route.departure_city}, {route.departure_country}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-200">
                                {route.arrival_iata}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {route.arrival_city}, {route.arrival_country}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDuration(route.duration_min)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No routes found.
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
                          {route.airline_name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDuration(route.duration_min)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {route.departure_iata}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {route.departure_city}, {route.departure_country}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {route.arrival_iata}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {route.arrival_city}, {route.arrival_country}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No routes found.
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {routes.length > 0 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {pagination.offset + 1} -{" "}
                {Math.min(pagination.offset + routes.length, pagination.total)}{" "}
                of {pagination.total} routes
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      offset: Math.max(0, prev.offset - prev.limit),
                    }))
                  }
                  disabled={pagination.offset === 0}
                  className={`px-3 py-1 border rounded ${
                    pagination.offset === 0
                      ? "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      offset: prev.offset + prev.limit,
                    }))
                  }
                  disabled={
                    pagination.offset + pagination.limit >= pagination.total
                  }
                  className={`px-3 py-1 border rounded ${
                    pagination.offset + pagination.limit >= pagination.total
                      ? "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 dark:border-gray-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Route Details Popup */}
      {selectedRoute && (
        <RouteDetailsPopup
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </div>
  );
}
