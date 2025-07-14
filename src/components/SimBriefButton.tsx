"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

interface SimBriefButtonProps {
  origin: string;
  destination: string;
  airline: string;
  type?: string;
  onClick?: () => void;
  isClicked?: boolean;
}

interface Aircraft {
  name: string;
  code: string;
}

export default function SimBriefButton({
  origin,
  destination,
  airline,
  type,
  onClick,
  isClicked,
}: SimBriefButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [airlineICAO, setAirlineICAO] = useState(airline);
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState("");
  const { showToast } = useToast();

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
    const aircraftToUse = type !== undefined ? type : selectedAircraft;
    if (!aircraftToUse) {
      showToast("Please select an aircraft");
      return;
    }

    setIsLoading(true);

    // Create the SimBrief dispatch URL with the route parameters
    const params = new URLSearchParams({
      orig: origin,
      dest: destination,
      airline: airlineICAO,
      type: aircraftToUse,
    });

    // Open SimBrief in a new tab
    window.open(
      `https://dispatch.simbrief.com/options/custom?${params.toString()}`,
      "_blank"
    );

    if (onClick) onClick();
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleSimBriefClick}
      disabled={isLoading}
      className={
        `font-bold py-2 px-4 rounded flex items-center text-white` +
        (isClicked
          ? " bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          : " bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600")
      }
      style={{ minWidth: 44 }}
      title="Open in SimBrief"
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
        </>
      ) : (
        <span className="text-xs">SimBrief</span>
      )}
    </button>
  );
}
