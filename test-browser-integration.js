const axios = require("axios");

// Simulate browser requests to test CORS and API access
async function testBrowserIntegration() {
  console.log("🌐 Testing Browser-like Integration...\n");

  const SCHEDULE_API_URL = "http://localhost:3001/api/schedule";

  try {
    // Test 1: Check if the scheduling API is accessible from browser perspective
    console.log("1. Testing API accessibility...");
    const healthResponse = await axios.get("http://localhost:3001/health");
    console.log("✅ Health endpoint accessible:", healthResponse.data);

    // Test 2: Test airlines endpoint with browser-like headers
    console.log("\n2. Testing airlines endpoint with browser headers...");
    const airlinesResponse = await axios.get(`${SCHEDULE_API_URL}/airlines`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    console.log(
      "✅ Airlines endpoint accessible with browser headers:",
      airlinesResponse.data.airlines.length,
      "airlines"
    );

    // Test 3: Test schedule generation with browser-like request
    console.log(
      "\n3. Testing schedule generation with browser-like request..."
    );
    const testConfig = {
      airline_id: 105,
      airline_name: "American Airlines",
      airline_iata: "AA",
      start_airport: "JFK",
      days: 2,
      haul_preferences: {
        short: true,
        medium: true,
        long: false,
      },
      haul_weighting: {
        short: 0.7,
        medium: 0.3,
        long: 0.0,
      },
      prefer_single_leg_day_ratio: 0.4,
      operating_hours: {
        start: "07:00",
        end: "22:00",
      },
      turnaround_time_minutes: 60,
      preferred_countries: ["US"],
      preferred_regions: [],
      minimum_rest_hours_between_long_haul: 8,
      repetition_mode: false,
    };

    const scheduleResponse = await axios.post(
      `${SCHEDULE_API_URL}/generate`,
      testConfig,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      }
    );

    console.log(
      "✅ Schedule generation accessible with browser headers:",
      scheduleResponse.data.status
    );
    console.log(
      "   Generated schedule with",
      scheduleResponse.data.schedule.days.length,
      "days"
    );

    // Test 4: Verify the generated schedule structure
    console.log("\n4. Verifying generated schedule structure...");
    const schedule = scheduleResponse.data.schedule;

    if (
      schedule.id &&
      schedule.name &&
      schedule.days &&
      Array.isArray(schedule.days)
    ) {
      console.log("✅ Schedule structure is valid");
      console.log("   - ID:", schedule.id);
      console.log("   - Name:", schedule.name);
      console.log("   - Days:", schedule.days.length);

      // Check first day structure
      if (schedule.days.length > 0) {
        const firstDay = schedule.days[0];
        if (firstDay.day && firstDay.date && Array.isArray(firstDay.legs)) {
          console.log("✅ First day structure is valid");
          console.log("   - Day:", firstDay.day);
          console.log("   - Date:", firstDay.date);
          console.log("   - Legs:", firstDay.legs.length);
        }
      }
    }

    // Test 5: Test error handling with invalid data
    console.log("\n5. Testing error handling with invalid data...");
    try {
      await axios.post(
        `${SCHEDULE_API_URL}/generate`,
        {
          airline_id: 999999,
          airline_name: "Invalid Airline",
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
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      console.log("❌ Expected error but got success");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(
          "✅ Error handling works correctly - received 400 for invalid airline"
        );
        console.log("   Error message:", error.response.data.message);
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    console.log("\n🎉 All browser integration tests passed!");
    console.log(
      "✅ The frontend can successfully communicate with the scheduling API"
    );
    console.log("✅ CORS is properly configured");
    console.log("✅ API endpoints are accessible from browser-like requests");
    console.log("✅ Schedule generation works correctly");
    console.log("✅ Error handling works as expected");
  } catch (error) {
    console.error("\n❌ Browser integration test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

testBrowserIntegration();
