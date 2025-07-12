const axios = require("axios");

const SCHEDULE_API_URL = "http://localhost:3001/api/schedule";

async function testIntegration() {
  console.log("🧪 Testing Frontend-Backend Integration...\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health endpoint...");
    const healthResponse = await axios.get("http://localhost:3001/health");
    console.log("✅ Health check passed:", healthResponse.data);

    // Test 2: Airlines endpoint
    console.log("\n2. Testing airlines endpoint...");
    const airlinesResponse = await axios.get(`${SCHEDULE_API_URL}/airlines`);
    console.log(
      "✅ Airlines endpoint passed:",
      airlinesResponse.data.airlines.length,
      "airlines found"
    );

    // Test 3: Test a specific airline
    console.log("\n3. Testing specific airline endpoint...");
    const testAirlineId = 105; // American Airlines
    const airlineResponse = await axios.get(
      `${SCHEDULE_API_URL}/airline/${testAirlineId}`
    );
    console.log(
      "✅ Specific airline endpoint passed:",
      airlineResponse.data.airline.name
    );

    // Test 4: Test schedule generation with a simple config
    console.log("\n4. Testing schedule generation...");
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

    const scheduleResponse = await axios.post(
      `${SCHEDULE_API_URL}/generate`,
      testConfig
    );
    console.log("✅ Schedule generation passed:", scheduleResponse.data.status);
    console.log(
      "   Generated schedule with",
      scheduleResponse.data.schedule.days.length,
      "days"
    );

    // Test 5: Test validation endpoint
    console.log("\n5. Testing validation endpoint...");
    const validationResponse = await axios.post(
      `${SCHEDULE_API_URL}/validate`,
      testConfig
    );
    console.log(
      "✅ Validation endpoint passed:",
      validationResponse.data.status
    );

    console.log(
      "\n🎉 All integration tests passed! Frontend and backend are properly connected."
    );
  } catch (error) {
    console.error("\n❌ Integration test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

testIntegration();
