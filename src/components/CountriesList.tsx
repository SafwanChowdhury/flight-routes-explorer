"use client";

import { useState, useEffect } from "react";
import { Globe, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCountries } from "@/lib/api";

export default function CountriesList() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCountries();
      setCountries(data.countries);
    } catch (err) {
      setError("Failed to load countries");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewCountryRoutes = (country: string) => {
    // Navigate to routes page with country filter for either departure OR arrival
    const params = new URLSearchParams();

    // We're using a special parameter format to indicate either departure OR arrival
    params.set("country", encodeURIComponent(country));

    router.push(`/?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Explore Countries
      </h2>

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
          <p className="mt-2 text-gray-600">Loading countries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.length > 0 ? (
            countries.map((country: any, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900">
                      {country.country}
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {country.continent}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-1" />
                    <span>{country.country_code}</span>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => viewCountryRoutes(country.country)}
                      className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center"
                    >
                      <Plane className="w-4 h-4 mr-2" />
                      View Routes
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-8 bg-white rounded-lg shadow-md text-center text-gray-500">
              No countries found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
