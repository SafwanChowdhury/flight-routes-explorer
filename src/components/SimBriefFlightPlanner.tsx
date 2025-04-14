"use client";

import { useState } from "react";

interface SimBriefFlightPlannerProps {
  origin: string;
  destination: string;
  airline: string;
}

export default function SimBriefFlightPlanner({
  origin,
  destination,
  airline,
}: SimBriefFlightPlannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    orig: origin,
    dest: destination,
    airline: airline,
    type: "B738", // Default aircraft
    fltnum: "",
    deph: "12", // Default departure hour
    depm: "00", // Default departure minute
    date: new Date()
      .toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .toUpperCase(),
    altn: "",
    route: "",
    pax: "150", // Default passenger count
    cargo: "0",
    fuel_factor: "P00",
    contpct: "0.05",
    resvrule: "45",
    taxiout: "10",
    taxiin: "4",
    flightrules: "i",
    flighttype: "s",
    navlog: "1",
    etops: "0",
    stepclimbs: "1",
    tlr: "1",
    notams: "1",
    firnot: "1",
    find_sidstar: "1",
    maps: "detail",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setIsLoading(true);

    // Create a form element
    const form = document.createElement("form");
    form.id = "sbapiform";
    form.method = "POST";
    form.action = "https://www.simbrief.com/api/xml.fetcher.php";
    form.target = "_blank";

    // Add all form fields
    Object.entries(formData).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    // Add the form to the document and submit it
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Flight Planning</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Flight Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Aircraft Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="B738">Boeing 737-800</option>
              <option value="A320">Airbus A320</option>
              <option value="B777">Boeing 777</option>
              <option value="A350">Airbus A350</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Flight Number
            </label>
            <input
              type="text"
              name="fltnum"
              value={formData.fltnum}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. 1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Departure Time
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="deph"
                value={formData.deph}
                onChange={handleInputChange}
                min="0"
                max="23"
                className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="HH"
              />
              <input
                type="number"
                name="depm"
                value={formData.depm}
                onChange={handleInputChange}
                min="0"
                max="59"
                className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="MM"
              />
            </div>
          </div>
        </div>

        {/* Route and Planning Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Route & Planning</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alternate Airport
            </label>
            <input
              type="text"
              name="altn"
              value={formData.altn}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. KLAX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Route
            </label>
            <input
              type="text"
              name="route"
              value={formData.route}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. PLL GAROT OAL MOD4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Passengers
            </label>
            <input
              type="number"
              name="pax"
              value={formData.pax}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cargo (tons)
            </label>
            <input
              type="number"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
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
              Generating Flight Plan...
            </>
          ) : (
            "Generate Flight Plan"
          )}
        </button>
      </div>
    </div>
  );
}
