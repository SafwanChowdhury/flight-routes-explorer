import { X } from "lucide-react";
import SimBriefButton from "./SimBriefButton";
import aircraftData from "@/../public/aircraft.json";
import { useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface RouteDetailsPopupProps {
  route: {
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
  };
  onClose: () => void;
}

export default function RouteDetailsPopup({
  route,
  onClose,
}: RouteDetailsPopupProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const [selectedAircraft, setSelectedAircraft] = useState<string>("");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col"
        style={{ minHeight: 500 }}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Route Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close popup"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Airline
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {route.airline_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                IATA: {route.airline_iata}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Route ID
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {route.route_id}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Departure
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {route.departure_iata}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {route.departure_city}, {route.departure_country}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Arrival
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {route.arrival_iata}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {route.arrival_city}, {route.arrival_country}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Duration
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {formatDuration(route.duration_min)}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Distance
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {route.distance_km.toLocaleString()} km
              </p>
            </div>
          </div>
        </div>

        {/* Aircraft Selector - centered above SimBrief */}
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <FormControl sx={{ minWidth: 220 }} size="small">
            <InputLabel id="aircraft-select-label">Select Aircraft</InputLabel>
            <Select
              labelId="aircraft-select-label"
              id="aircraft-select"
              value={selectedAircraft}
              label="Select Aircraft"
              onChange={(e) => setSelectedAircraft(e.target.value)}
            >
              <MenuItem value="">Select aircraft</MenuItem>
              {aircraftData.aircraft.map(
                (ac: { name: string; code: string }) => (
                  <MenuItem key={ac.code} value={ac.code}>
                    {ac.name} ({ac.code})
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Box>

        {/* SimBrief Button - centered at the bottom */}
        <Box display="flex" justifyContent="center" mt={4} mb={2}>
          <SimBriefButton
            origin={route.departure_iata}
            destination={route.arrival_iata}
            airline={route.airline_iata}
            type={selectedAircraft}
            className="py-4 px-8 text-base min-w-[120px]"
          />
        </Box>
      </div>
    </div>
  );
}
