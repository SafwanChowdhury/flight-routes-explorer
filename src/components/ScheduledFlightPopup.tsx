import { X, Calendar, Clock } from "lucide-react";
import SimBriefButton from "./SimBriefButton";
import { FlightLeg } from "@/types/schedule";

interface ScheduledFlightPopupProps {
  flight: FlightLeg;
  onClose: () => void;
}

export default function ScheduledFlightPopup({
  flight,
  onClose,
}: ScheduledFlightPopupProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Scheduled Flight Details
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
                {flight.airline_name || "N/A"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                IATA: {flight.airline_iata || "N/A"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Flight Type
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 capitalize">
                {flight.haul_type}-haul
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Date
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {formatDate(flight.departure_time)}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="w-4 h-4 mr-1" /> Flight Time
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {formatDuration(flight.duration_min)}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Departure
                </h4>
                <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                  {flight.departure_airport}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {flight.departure_city && flight.departure_country
                    ? `${flight.departure_city}, ${flight.departure_country}`
                    : "N/A"}
                </p>
                <p className="text-sm font-semibold mt-1 text-gray-700 dark:text-gray-300">
                  {formatTime(flight.departure_time)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Arrival
                </h4>
                <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                  {flight.arrival_airport}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {flight.arrival_city && flight.arrival_country
                    ? `${flight.arrival_city}, ${flight.arrival_country}`
                    : "N/A"}
                </p>
                <p className="text-sm font-semibold mt-1 text-gray-700 dark:text-gray-300">
                  {formatTime(flight.arrival_time)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Distance
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {flight.distance_km
                  ? `${flight.distance_km.toLocaleString()} km`
                  : "N/A"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Route ID
              </h4>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {flight.route_id}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <SimBriefButton
              origin={flight.departure_airport}
              destination={flight.arrival_airport}
              airline={flight.airline_iata || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
