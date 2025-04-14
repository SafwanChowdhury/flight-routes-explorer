import { X } from "lucide-react";
import SimBriefButton from "./SimBriefButton";

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Route Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close popup"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Airline</h4>
              <p className="mt-1 text-lg text-gray-900">{route.airline_name}</p>
              <p className="text-sm text-gray-500">
                IATA: {route.airline_iata}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Route ID</h4>
              <p className="mt-1 text-lg text-gray-900">{route.route_id}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Departure</h4>
              <p className="mt-1 text-lg text-gray-900">
                {route.departure_iata}
              </p>
              <p className="text-sm text-gray-500">
                {route.departure_city}, {route.departure_country}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Arrival</h4>
              <p className="mt-1 text-lg text-gray-900">{route.arrival_iata}</p>
              <p className="text-sm text-gray-500">
                {route.arrival_city}, {route.arrival_country}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Duration</h4>
              <p className="mt-1 text-lg text-gray-900">
                {formatDuration(route.duration_min)}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Distance</h4>
              <p className="mt-1 text-lg text-gray-900">
                {route.distance_km.toLocaleString()} km
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <SimBriefButton
              origin={route.departure_iata}
              destination={route.arrival_iata}
              airline={route.airline_iata}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
