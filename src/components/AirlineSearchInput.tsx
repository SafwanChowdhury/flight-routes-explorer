import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import debounce from "lodash/debounce";

interface AirlineSearchResult {
  id: number;
  name: string;
  iata: string;
  type: "airline";
}

interface AirlineSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSelect?: (result: AirlineSearchResult) => void;
}

export default function AirlineSearchInput({
  value,
  onChange,
  placeholder,
  onSelect,
}: AirlineSearchInputProps) {
  const [results, setResults] = useState<AirlineSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const search = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search/airlines?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Airline search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    search(value);
  }, [value, search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowResults(true);
  };

  const handleSelect = (result: AirlineSearchResult) => {
    onChange(result.name);
    onSelect?.(result);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full p-2 pl-10 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          {isLoading ? (
            <div className="p-2 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto">
              {results.map((result) => (
                <li
                  key={result.id}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelect(result)}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {result.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {result.iata || "No IATA code"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
