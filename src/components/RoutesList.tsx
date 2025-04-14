"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, Filter, RefreshCw, Clock } from "lucide-react";
import { getRoutes } from "@/lib/api";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

// Import MUI DataGrid components
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

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

  const [routes, setRoutes] = useState<Route[]>([]); // Properly typed state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Define columns for MUI DataGrid
  const columns: GridColDef[] = [
    {
      field: "airline_name",
      headerName: "Airline",
      width: 200,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <div className="font-medium text-gray-900">{params.value || "N/A"}</div>
      ),
    },
    {
      field: "departure",
      headerName: "Departure",
      width: 250,
      flex: 1.5,
      valueGetter: (value, row) =>
        `${row.departure_iata} (${row.departure_city}, ${row.departure_country})`,
      renderCell: (params: GridRenderCellParams) => (
        <div>
          <div className="font-medium text-gray-900">
            {params.row.departure_iata}
          </div>
          <div className="text-sm text-gray-500">
            {params.row.departure_city}, {params.row.departure_country}
          </div>
        </div>
      ),
    },
    {
      field: "arrival",
      headerName: "Arrival",
      width: 250,
      flex: 1.5,
      valueGetter: (value, row) =>
        `${row.arrival_iata} (${row.arrival_city}, ${row.arrival_country})`,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center">
          <ArrowRight className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div className="font-medium text-gray-900">
              {params.row.arrival_iata}
            </div>
            <div className="text-sm text-gray-500">
              {params.row.arrival_city}, {params.row.arrival_country}
            </div>
          </div>
        </div>
      ),
    },
    {
      field: "duration_min",
      headerName: "Duration",
      width: 150,
      flex: 0.8,
      valueFormatter: (value) => formatDuration(value as number),
      renderCell: (params: GridRenderCellParams) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {formatDuration(params.value as number)}
        </span>
      ),
    },
    {
      field: "distance_km",
      headerName: "Distance (km)",
      width: 150,
      flex: 0.8,
      renderCell: (params: GridRenderCellParams) => (
        <span className="text-gray-900">{params.value} km</span>
      ),
    },
  ];

  // Initialize and use any URL parameters
  useEffect(() => {
    // This runs once when component loads, reading from URL
    if (searchParams.toString()) {
      // Set duration range from URL parameters
      setDurationRange([
        parseInt(filters.min_duration) || MIN_DURATION,
        parseInt(filters.max_duration) || MAX_DURATION,
      ]);

      // If auto_apply is true, apply filters immediately
      if (auto_apply === "true") {
        // Remove auto_apply from URL but keep other parameters
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("auto_apply");
        router.replace(`/?${newParams.toString()}`, { scroll: false });

        if (biDirectionalMode.airport || biDirectionalMode.country) {
          loadRoutesWithParams();
        } else {
          loadRoutes();
        }
      } else {
        // Otherwise just show the forms with pre-filled values but don't search yet
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
      // For bi-directional airport filter
      if (biDirectionalMode.airport && airport_iata) {
        // Prepare parameters for both directions with proper pagination
        const limit = Math.floor(pagination.limit / 2); // Split limit between directions
        const halfOffset = Math.floor(pagination.offset / 2);

        // Load departure routes
        const departureParams = {
          departure_iata: airport_iata,
          airline_name: filters.airline_name || undefined,
          min_duration: durationRange[0].toString(),
          max_duration: durationRange[1].toString(),
          limit: pagination.limit, // Request full limit for departure
          offset: pagination.offset, // Use full offset
        };

        const departureData = await getRoutes(departureParams);

        // Load arrival routes - only if needed based on departure results
        let arrivalData = { routes: [], pagination: { total: 0 } };
        if (departureData.routes.length < pagination.limit) {
          // If departure routes don't fill the page, get arrival routes for the remainder
          const arrivalParams = {
            arrival_iata: airport_iata,
            airline_name: filters.airline_name || undefined,
            min_duration: durationRange[0].toString(),
            max_duration: durationRange[1].toString(),
            limit: pagination.limit - departureData.routes.length,
            offset: Math.max(
              0,
              pagination.offset - departureData.pagination.total
            ),
          };

          // Only fetch arrival routes if the offset makes sense
          if (arrivalParams.offset >= 0) {
            arrivalData = await getRoutes(arrivalParams);
          }
        }

        // Combine routes, ensuring no duplicates
        const combinedRoutes = [...departureData.routes];

        // Add arrival routes, checking for duplicates
        arrivalData.routes.forEach((arrivalRoute) => {
          // Check if this route already exists in combinedRoutes
          const isDuplicate = combinedRoutes.some(
            (route: Route) =>
              `${route.route_id}-${route.airline_id || route.airline_name}` ===
              `${arrivalRoute.route_id}-${
                arrivalRoute.airline_id || arrivalRoute.airline_name
              }`
          );

          if (!isDuplicate) {
            combinedRoutes.push(arrivalRoute);
          }
        });

        // Calculate total across both directions
        const totalRoutes =
          departureData.pagination.total + arrivalData.pagination.total;

        setRoutes(combinedRoutes);
        setPagination((prev) => ({
          ...prev,
          total: totalRoutes,
        }));
      }
      // For bi-directional country filter
      else if (biDirectionalMode.country && country) {
        // Similar approach for countries
        const departureParams = {
          departure_country: country,
          airline_name: filters.airline_name || undefined,
          min_duration: durationRange[0].toString(),
          max_duration: durationRange[1].toString(),
          limit: pagination.limit,
          offset: pagination.offset,
        };

        const departureData = await getRoutes(departureParams);

        let arrivalData = { routes: [], pagination: { total: 0 } };
        if (departureData.routes.length < pagination.limit) {
          const arrivalParams = {
            arrival_country: country,
            airline_name: filters.airline_name || undefined,
            min_duration: durationRange[0].toString(),
            max_duration: durationRange[1].toString(),
            limit: pagination.limit - departureData.routes.length,
            offset: Math.max(
              0,
              pagination.offset - departureData.pagination.total
            ),
          };

          if (arrivalParams.offset >= 0) {
            arrivalData = await getRoutes(arrivalParams);
          }
        }

        const combinedRoutes = [...departureData.routes];

        arrivalData.routes.forEach((arrivalRoute) => {
          const isDuplicate = combinedRoutes.some(
            (route: Route) =>
              `${route.route_id}-${route.airline_id || route.airline_name}` ===
              `${arrivalRoute.route_id}-${
                arrivalRoute.airline_id || arrivalRoute.airline_name
              }`
          );

          if (!isDuplicate) {
            combinedRoutes.push(arrivalRoute);
          }
        });

        const totalRoutes =
          departureData.pagination.total + arrivalData.pagination.total;

        setRoutes(combinedRoutes);
        setPagination((prev) => ({
          ...prev,
          total: totalRoutes,
        }));
      }
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
      // Filter out empty values
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    // If changing airport or country filters, exit bi-directional mode
    if (name === "departure_iata" || name === "arrival_iata") {
      setBiDirectionalMode((prev) => ({ ...prev, airport: false }));
    } else if (name === "departure_country" || name === "arrival_country") {
      setBiDirectionalMode((prev) => ({ ...prev, country: false }));
    }
  };

  // Handle duration range slider change
  const handleDurationRangeChange = (range: number[]) => {
    setDurationRange(range as [number, number]);
    setFilters((prev) => ({
      ...prev,
      min_duration: range[0].toString(),
      max_duration: range[1].toString(),
    }));
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

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, offset: 0 }));

    // Exit bi-directional mode when applying regular filters
    setBiDirectionalMode({
      airport: false,
      country: false,
    });

    // Update URL with filter params for better sharing/bookmarking
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    // Add duration range
    params.set("min_duration", durationRange[0].toString());
    params.set("max_duration", durationRange[1].toString());

    // Update URL without refreshing page
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

    // Reset duration range
    setDurationRange([MIN_DURATION, MAX_DURATION]);

    // Exit bi-directional mode when clearing
    setBiDirectionalMode({
      airport: false,
      country: false,
    });

    // Clear URL parameters
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

  // Handle pagination within the DataGrid
  const handlePaginationModelChange = (model: any) => {
    console.log("Pagination model changed:", model);
    setPagination((prev) => ({
      ...prev,
      offset: model.page * model.pageSize,
      limit: model.pageSize,
    }));

    // Force reload of routes when pagination changes
    if (biDirectionalMode.airport || biDirectionalMode.country) {
      loadRoutesWithParams();
    } else {
      loadRoutes();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Search Flight Routes
      </h2>

      {/* Bi-directional filter message */}
      {getBiDirectionalMessage() && (
        <div className="p-4 mb-4 bg-blue-100 text-blue-800 rounded-md flex justify-between items-center">
          <span>{getBiDirectionalMessage()}</span>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airline
            </label>
            <input
              type="text"
              name="airline_name"
              value={filters.airline_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. British Airways"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From (IATA)
            </label>
            <input
              type="text"
              name="departure_iata"
              value={filters.departure_iata}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. LHR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To (IATA)
            </label>
            <input
              type="text"
              name="arrival_iata"
              value={filters.arrival_iata}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. JFK"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Country
            </label>
            <input
              type="text"
              name="departure_country"
              value={filters.departure_country}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. United Kingdom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Country
            </label>
            <input
              type="text"
              name="arrival_country"
              value={filters.arrival_country}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. United States"
            />
          </div>
        </div>

        {/* Duration Range Slider and Inputs */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2 text-gray-700" />
            <label className="text-sm font-medium text-gray-700">
              Flight Duration Range
            </label>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            {/* Text inputs for duration */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="w-full p-2 text-sm border rounded"
                  placeholder="Minutes"
                  min={MIN_DURATION}
                  max={durationRange[1]}
                />
              </div>

              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="w-full p-2 text-sm border rounded"
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
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
              <span>18h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex space-x-3">
          <button
            onClick={applyFilters}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>

          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Results with MUI DataGrid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading routes...</p>
          </div>
        ) : (
          <div style={{ height: 500, width: "100%" }}>
            {/* Enhanced navigation controls */}
            <div className="mb-4 p-3 bg-gray-50 border rounded flex flex-wrap gap-3 items-center">
              <div className="text-sm font-medium">Navigation Controls:</div>

              {/* Results per page selector */}
              <div className="flex items-center">
                <span className="mr-2 text-sm whitespace-nowrap">
                  Results per page:
                </span>
                <select
                  className="p-2 border rounded bg-white"
                  onChange={(e) => {
                    const limit = parseInt(e.target.value);
                    setPagination((prev) => ({ ...prev, limit, offset: 0 }));
                    setTimeout(() => {
                      if (
                        biDirectionalMode.airport ||
                        biDirectionalMode.country
                      ) {
                        loadRoutesWithParams();
                      } else {
                        loadRoutes();
                      }
                    }, 0);
                  }}
                  value={pagination.limit}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="250">250</option>
                </select>
              </div>

              {/* Jump to page control - only show if there are multiple pages */}
              {pagination.total > pagination.limit && (
                <div className="flex items-center">
                  <span className="mr-2 text-sm whitespace-nowrap">
                    Jump to page:
                  </span>
                  <select
                    className="p-2 border rounded bg-white min-w-20"
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      const offset = page * pagination.limit;
                      setPagination((prev) => ({ ...prev, offset }));
                      setTimeout(() => {
                        if (
                          biDirectionalMode.airport ||
                          biDirectionalMode.country
                        ) {
                          loadRoutesWithParams();
                        } else {
                          loadRoutes();
                        }
                      }, 0);
                    }}
                    value={Math.floor(pagination.offset / pagination.limit)}
                  >
                    {Array.from(
                      {
                        length: Math.min(
                          100,
                          Math.ceil(pagination.total / pagination.limit)
                        ),
                      },
                      (_, i) => (
                        <option key={i} value={i}>
                          {i + 1} of{" "}
                          {Math.ceil(pagination.total / pagination.limit)}
                        </option>
                      )
                    )}
                    {Math.ceil(pagination.total / pagination.limit) > 100 && (
                      <option disabled>...</option>
                    )}
                  </select>
                </div>
              )}

              {/* Page status information */}
              {pagination.total > 0 && (
                <div className="text-sm text-gray-600 ml-auto">
                  Showing {pagination.offset + 1}-
                  {Math.min(
                    pagination.offset + routes.length,
                    pagination.total
                  )}{" "}
                  of {pagination.total} routes
                </div>
              )}
            </div>

            <DataGrid
              rows={routes}
              columns={columns}
              getRowId={(row) =>
                `${row.route_id}-${row.airline_id || row.airline_name}`
              }
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: pagination.limit },
                },
              }}
              pageSizeOptions={[10, 20, 50, 100]}
              pagination
              paginationMode="server"
              rowCount={pagination.total}
              paginationModel={{
                page: Math.floor(pagination.offset / pagination.limit),
                pageSize: pagination.limit,
              }}
              onPaginationModelChange={handlePaginationModelChange}
              disableRowSelectionOnClick
              autoHeight={false}
              loading={loading}
              localeText={{
                noRowsLabel: "No routes found matching your criteria.",
              }}
              sx={{
                width: "100%",
                "& .MuiDataGrid-main": { overflow: "auto" },
                "& .MuiDataGrid-virtualScroller": { overflow: "auto" },
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f3f4f6" },
                "& .MuiDataGrid-cell:focus": { outline: "none" },
                "& .MuiDataGrid-row:hover": { backgroundColor: "#f9fafb" },
                // Make the horizontal scrollbar visible and ensure columns stretch
                "& .MuiDataGrid-root": {
                  overflowX: "auto",
                },
                "& .MuiDataGrid-virtualScrollerContent": {
                  minWidth: "100%",
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Custom CSS for the range slider */}
      <style jsx global>{`
        .custom-range-slider .range-slider {
          height: 6px;
          background: #e5e7eb;
          border-radius: 4px;
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

        .custom-range-slider .range-slider__thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
