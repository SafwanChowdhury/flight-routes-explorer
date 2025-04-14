"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getRoutes } from "@/lib/api";
import RouteFilters from "./RouteFilters";
import RouteDetailsPopup from "./RouteDetailsPopup";

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

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

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
      setError("Failed to load routes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    setLoading(true);
    setError(null);

    try {
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
      setError("Failed to load routes");
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
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
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
      />

      {/* Error message */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading routes...</p>
        </div>
      ) : (
        <div>
          {/* Results table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Airline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrival
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routes.length > 0 ? (
                    routes.map((route, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {route.airline_name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {route.departure_iata}
                          </div>
                          <div className="text-sm text-gray-500">
                            {route.departure_city}, {route.departure_country}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ArrowRight className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {route.arrival_iata}
                              </div>
                              <div className="text-sm text-gray-500">
                                {route.arrival_city}, {route.arrival_country}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {formatDuration(route.duration_min)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No routes found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {routes.length > 0 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {pagination.offset + 1} -{" "}
                  {Math.min(
                    pagination.offset + routes.length,
                    pagination.total
                  )}{" "}
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
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-blue-600 hover:bg-blue-50"
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
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
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
