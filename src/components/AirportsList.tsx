"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MapPin, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAirports } from "@/lib/api";
import debounce from "lodash/debounce";
import { useToast } from "@/components/ToastProvider";

const CACHE_KEY = "airports_data";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedData {
  data: any[];
  timestamp: number;
}

interface Airport {
  iata: string;
  name: string;
  city_name: string;
  country: string;
  continent: string;
  latitude?: number;
  longitude?: number;
}

export default function AirportsList() {
  const [allAirports, setAllAirports] = useState<Airport[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [filters, setFilters] = useState({
    country: "",
    continent: "",
  });
  const router = useRouter();

  // Load all airports on initial mount
  useEffect(() => {
    const loadInitialAirports = async () => {
      setLoading(true);

      try {
        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp }: CachedData = JSON.parse(cachedData);
          // If cache is not expired, use it
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setAllAirports(data);
            setFilteredAirports(data);
            setLoading(false);
            return;
          }
        }

        // If no cache or cache expired, fetch from API
        const data = await getAirports();
        setAllAirports(data.airports);
        setFilteredAirports(data.airports);

        // Update cache
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: data.airports,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        showToast("Failed to load airports");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialAirports();
  }, []);

  // Client-side filtering
  useEffect(() => {
    if (allAirports.length === 0) return;

    const filtered = allAirports.filter((airport: any) => {
      const matchesCountry =
        !filters.country ||
        airport.country.toLowerCase().includes(filters.country.toLowerCase());
      const matchesContinent =
        !filters.continent ||
        airport.continent
          .toLowerCase()
          .includes(filters.continent.toLowerCase());
      return matchesCountry && matchesContinent;
    });

    setFilteredAirports(filtered);
  }, [filters, allAirports]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const viewAirportRoutes = (iata: string) => {
    const params = new URLSearchParams();
    params.set("airport_iata", iata);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Explore Airports
      </h2>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={filters.country}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. United States"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Continent Code
            </label>
            <input
              type="text"
              name="continent"
              value={filters.continent}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. EU"
            />
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading airports...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAirports.length > 0 ? (
            filteredAirports.map((airport: any) => (
              <div
                key={airport.iata}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {airport.iata}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {airport.name}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      {airport.continent}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {airport.city_name}, {airport.country}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => viewAirportRoutes(airport.iata)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                    >
                      <Plane className="w-4 h-4 mr-1" />
                      View Routes
                    </button>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {airport.latitude?.toFixed(2)},{" "}
                      {airport.longitude?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-500 dark:text-gray-400">
              No airports found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
