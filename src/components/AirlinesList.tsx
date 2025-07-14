"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAirlines } from "@/lib/api";
import AirlineSearchInput from "./AirlineSearchInput";
import { useToast } from "@/components/ToastProvider";

export default function AirlinesList() {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = async () => {
    setLoading(true);

    try {
      const data = await getAirlines();
      setAirlines(data.airlines);
    } catch (err) {
      showToast("Failed to load airlines");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewAirlineRoutes = (airlineName: string) => {
    router.push(
      `/?airline_name=${encodeURIComponent(airlineName)}&auto_apply=true`
    );
  };

  const handleAirlineSelect = (result: any) => {
    viewAirlineRoutes(result.name);
  };

  const filteredAirlines = airlines.filter(
    (airline: any) =>
      airline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (airline.iata &&
        airline.iata.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Explore Airlines
      </h2>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search Airlines
        </label>
        <AirlineSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search airline name or IATA code..."
          onSelect={handleAirlineSelect}
        />
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading airlines...
          </p>
        </div>
      ) : (
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
                    IATA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAirlines.length > 0 ? (
                  filteredAirlines.map((airline: any) => (
                    <tr
                      key={airline.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-gray-200">
                          {airline.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {airline.iata || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewAirlineRoutes(airline.name)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          View Routes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No airlines found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {filteredAirlines.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAirlines.map((airline: any) => (
                  <div
                    key={airline.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">
                          {airline.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          IATA: {airline.iata || "N/A"}
                        </div>
                      </div>
                      <button
                        onClick={() => viewAirlineRoutes(airline.name)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        View Routes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No airlines found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
