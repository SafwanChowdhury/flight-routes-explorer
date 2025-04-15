"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAirlines } from "@/lib/api";

export default function AirlinesList() {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAirlines();
      setAirlines(data.airlines);
    } catch (err) {
      setError("Failed to load airlines");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewAirlineRoutes = (airlineName: string) => {
    // Navigate to routes page with airline filter
    router.push(
      `/?airline_name=${encodeURIComponent(airlineName)}&auto_apply=true`
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Explore Airlines
      </h2>

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
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
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
                {airlines.length > 0 ? (
                  airlines.map((airline: any) => (
                    <tr
                      key={airline.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {airline.id}
                      </td>
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
                      colSpan={4}
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
            {airlines.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {airlines.map((airline: any) => (
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
                          ID: {airline.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
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
