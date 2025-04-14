"use client";

import { useState, useEffect } from "react";
import { MapPin, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAirports } from "@/lib/api";

export default function AirportsList() {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    country: "",
    continent: "",
  });
  const router = useRouter();

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    setLoading(true);
    setError(null);

    try {
      // Filter out empty values
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const data = await getAirports(params);
      setAirports(data.airports);
    } catch (err) {
      setError("Failed to load airports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    loadAirports();
  };

  const viewAirportRoutes = (iata: string) => {
    // Navigate to homepage showing routes where this airport is departure OR arrival
    const params = new URLSearchParams();

    // We're using a special parameter format to indicate either departure OR arrival
    // The API doesn't directly support this, so we'll use our Routes component to handle it
    params.set("airport_iata", iata);

    router.push(`/?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Explore Airports
      </h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={filters.country}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. United States"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Continent Code
            </label>
            <input
              type="text"
              name="continent"
              value={filters.continent}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. EU"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Search Airports
          </button>
        </div>
      </div>

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
          <p className="mt-2 text-gray-600">Loading airports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {airports.length > 0 ? (
            airports.map((airport: any) => (
              <div
                key={airport.iata}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {airport.iata}
                      </h3>
                      <p className="text-sm text-gray-500">{airport.name}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {airport.continent}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">
                    {airport.city_name}, {airport.country}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => viewAirportRoutes(airport.iata)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      <Plane className="w-4 h-4 mr-1" />
                      View Routes
                    </button>
                    <div className="text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {airport.latitude?.toFixed(2)},{" "}
                      {airport.longitude?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-8 bg-white rounded-lg shadow-md text-center text-gray-500">
              No airports found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
