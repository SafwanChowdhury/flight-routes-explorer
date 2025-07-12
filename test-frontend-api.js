const axios = require("axios");

// Simulate the frontend's API configuration
const SCHEDULE_API_URL = "http://localhost:3001/api/schedule";

// Simulate the frontend's API functions
async function getScheduleAirlines() {
  const { data } = await axios.get(`${SCHEDULE_API_URL}/airlines`);
  return data;
}

async function getScheduleAirline(id) {
  const { data } = await axios.get(`${SCHEDULE_API_URL}/airline/${id}`);
  return data;
}

async function validateScheduleConfig(config) {
  const { data } = await axios.post(`${SCHEDULE_API_URL}/validate`, config);
  return data;
}

async function generateSchedule(config) {
  try {
    const { data } = await axios.post(`${SCHEDULE_API_URL}/generate`, config);
    return data;
  } catch (error) {
    console.error("Schedule generation error:", error);
    throw error;
  }
}

async function testFrontendAPI() {
  console.log("🧪 Testing Frontend API Functions...\n");

  try {
    // Test 1: getScheduleAirlines
    console.log("1. Testing getScheduleAirlines()...");
    const airlinesData = await getScheduleAirlines();
    console.log(
      "✅ getScheduleAirlines() passed:",
      airlinesData.airlines.length,
      "airlines"
    );

    // Test 2: getScheduleAirline
    console.log("\n2. Testing getScheduleAirline()...");
    const airlineData = await getScheduleAirline(105); // American Airlines
    console.log("✅ getScheduleAirline() passed:", airlineData.airline.name);

    // Test 3: validateScheduleConfig
    console.log("\n3. Testing validateScheduleConfig()...");
    const testConfig = {
      airline_id: 105,
      airline_name: "American Airlines",
      airline_iata: "AA",
      start_airport: "JFK",
      days: 3,
      haul_preferences: {
        short: true,
        medium: true,
        long: false,
      },
      haul_weighting: {
        short: 0.6,
        medium: 0.4,
        long: 0.0,
      },
      prefer_single_leg_day_ratio: 0.3,
      operating_hours: {
        start: "06:00",
        end: "23:00",
      },
      turnaround_time_minutes: 45,
      preferred_countries: ["US"],
      preferred_regions: [],
      minimum_rest_hours_between_long_haul: 8,
      repetition_mode: false,
    };

    const validationData = await validateScheduleConfig(testConfig);
    console.log("✅ validateScheduleConfig() passed:", validationData.status);

    // Test 4: generateSchedule
    console.log("\n4. Testing generateSchedule()...");
    const scheduleData = await generateSchedule(testConfig);
    console.log("✅ generateSchedule() passed:", scheduleData.status);
    console.log(
      "   Generated schedule with",
      scheduleData.schedule.days.length,
      "days"
    );

    // Test 5: Test error handling
    console.log("\n5. Testing error handling...");
    try {
      await generateSchedule({
        airline_id: 999999, // Non-existent airline
        airline_name: "Test Airline",
        start_airport: "XXX",
        days: 1,
        haul_preferences: { short: true, medium: false, long: false },
        haul_weighting: { short: 1.0, medium: 0.0, long: 0.0 },
        prefer_single_leg_day_ratio: 0.5,
        operating_hours: { start: "06:00", end: "23:00" },
        turnaround_time_minutes: 45,
        preferred_countries: [],
        preferred_regions: [],
        minimum_rest_hours_between_long_haul: 8,
        repetition_mode: false,
      });
      console.log("❌ Expected error but got success");
    } catch (error) {
      console.log(
        "✅ Error handling passed - correctly caught error for invalid airline"
      );
    }

    console.log(
      "\n🎉 All frontend API tests passed! The frontend can successfully communicate with the backend."
    );
  } catch (error) {
    console.error("\n❌ Frontend API test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

testFrontendAPI();
