"use client";

import { useState, useEffect } from "react";

interface SimBriefButtonProps {
  origin: string;
  destination: string;
  airline: string;
}

interface Aircraft {
  name: string;
  code: string;
}

export default function SimBriefButton({
  origin,
  destination,
  airline,
}: SimBriefButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [airlineICAO, setAirlineICAO] = useState(airline);
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState("");

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Load airline data
      import("airline-codes").then(({ default: airlines }) => {
        const airlineData = airlines.findWhere({ iata: airline });
        setAirlineICAO(airlineData?.get("icao") || airline);
      });

      // Load aircraft data
      fetch("/aircraft.json")
        .then((response) => response.json())
        .then((data) => {
          setAircraftList(data.aircraft);
        })
        .catch((error) => {
          console.error("Error loading aircraft data:", error);
        });
    }
  }, [airline]);

  const handleSimBriefClick = () => {
    if (!selectedAircraft) {
      alert("Please select an aircraft");
      return;
    }

    setIsLoading(true);

    // Create the SimBrief dispatch URL with the route parameters
    const params = new URLSearchParams({
      orig: origin,
      dest: destination,
      airline: airlineICAO,
      type: selectedAircraft,
    });

    // Open SimBrief in a new tab
    window.open(
      `https://dispatch.simbrief.com/options/custom?${params.toString()}`,
      "_blank"
    );

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="aircraft-select"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Select Aircraft
      </label>
      <select
        id="aircraft-select"
        value={selectedAircraft}
        onChange={(e) => setSelectedAircraft(e.target.value)}
        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        style={{ maxHeight: "200px" }}
      >
        <option value="">None</option>
        {aircraftList.map((aircraft) => (
          <option key={aircraft.code} value={aircraft.code}>
            {aircraft.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleSimBriefClick}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          "Open in SimBrief"
        )}
      </button>
    </div>
  );
}
