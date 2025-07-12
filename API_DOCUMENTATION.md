# Flight Routes API Documentation

## Overview

The Flight Routes API is a high-performance REST API that provides access to comprehensive flight route data. The API is built with Node.js, Express, and SQLite, offering fast query capabilities for airlines, airports, countries, and flight routes.

**Key Features**:
- **Accurate Airline Filtering**: When filtering by airline, the API returns only routes where the specified airline is the actual operator, not codeshare partners
- **High Performance**: Optimized queries with response times typically under 50ms
- **Comprehensive Data**: 85,000+ routes across 1,000+ airlines and 10,000+ airports
- **Advanced Route Analysis**: Get airline routes excluding specific base airports for network analysis

**Base URL**: `http://localhost:3000`

## Database Statistics

- **Total Routes**: 85,321 routes
- **Total Airlines**: 1,000+ airlines
- **Total Airports**: 10,000+ airports
- **Total Countries**: 200+ countries

## Authentication

This API does not require authentication. All endpoints are publicly accessible.

## Data Accuracy

### Airline Filtering
The API handles codeshare agreements correctly by filtering routes based on the **actual operating airline**, not codeshare partners. This ensures that when you query for a specific airline, you get only the routes where that airline is the primary operator.

**Example**: When querying for British Airways routes from LHR, you'll get only the 163 routes where BA is the actual operator, not routes where BA is just a codeshare partner on another airline's flight.

## Response Format

All API responses are returned in JSON format with the following structure:

```json
{
  "status": "success",
  "data": {...},
  "pagination": {...} // when applicable
}
```

## Endpoints

### 1. Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok"
}
```

---

### 2. Database Statistics

Get comprehensive statistics about the database.

**Endpoint**: `GET /stats`

**Response**:
```json
{
  "counts": {
    "airports": 10567,
    "airlines": 1087,
    "routes": 85321,
    "countries": 200
  },
  "top_airlines": [
    {
      "name": "American Airlines",
      "route_count": 2475
    }
  ],
  "top_departure_airports": [
    {
      "name": "London Heathrow",
      "city_name": "London",
      "country": "United Kingdom",
      "route_count": 234
    }
  ]
}
```

---

### 3. Airlines

Get all airlines in the database.

**Endpoint**: `GET /airlines`

**Response**:
```json
{
  "airlines": [
    {
      "id": 107,
      "iata": "AA",
      "name": "American Airlines"
    }
  ]
}
```

---

### 4. Airports

Get airports with optional filtering.

**Endpoint**: `GET /airports`

**Query Parameters**:
- `country` (optional): Filter airports by country name
- `continent` (optional): Filter airports by continent code (e.g., "EU", "NA", "AS")

**Examples**:

Get all airports:
```
GET /airports
```

Get airports in United Kingdom:
```
GET /airports?country=United Kingdom
```

Get airports in Europe:
```
GET /airports?continent=EU
```

**Response**:
```json
{
  "airports": [
    {
      "iata": "LHR",
      "name": "London Heathrow",
      "city_name": "London",
      "country": "United Kingdom",
      "country_code": "GB",
      "continent": "EU",
      "latitude": 51.4706,
      "longitude": -0.461941
    }
  ]
}
```

---

### 5. Countries

Get all countries in the database.

**Endpoint**: `GET /countries`

**Response**:
```json
{
  "countries": [
    {
      "country": "United Kingdom",
      "country_code": "GB",
      "continent": "EU"
    }
  ]
}
```

---

### 6. Routes

Get flight routes with comprehensive filtering options.

**Endpoint**: `GET /routes`

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `airline_id` | number | Filter by airline ID (returns only routes where this airline is the actual operator, not codeshare partner) | `107` |
| `airline_name` | string | Filter by airline name (partial match, returns only routes where this airline is the actual operator) | `"British Airways"` |
| `departure_iata` | string | Filter by departure airport IATA code | `"LHR"` |
| `arrival_iata` | string | Filter by arrival airport IATA code | `"JFK"` |
| `departure_country` | string | Filter by departure country | `"United Kingdom"` |
| `arrival_country` | string | Filter by arrival country | `"France"` |
| `max_duration` | number | Filter routes with duration ≤ X minutes | `120` |
| `min_duration` | number | Filter routes with duration ≥ X minutes | `600` |
| `limit` | number | Number of results to return (default: 100) | `50` |
| `offset` | number | Number of results to skip (default: 0) | `100` |
| `all` | boolean | Return all results without pagination | `true` |

**Examples**:

Get all routes (paginated):
```
GET /routes
```

Get British Airways routes:
```
GET /routes?airline_name=British Airways
```

Get routes from UK to France:
```
GET /routes?departure_country=United Kingdom&arrival_country=France
```

Get short flights (under 60 minutes):
```
GET /routes?max_duration=60
```

Get all British Airways routes from LHR:
```
GET /routes?airline_name=British Airways&departure_iata=LHR&all=true
```

**Important Note on Airline Filtering**:
When filtering by `airline_id` or `airline_name`, the API returns only routes where the specified airline is the **actual operator** of the flight, not routes where the airline is just a codeshare partner. This ensures accurate results when querying for specific airline operations.

**Response**:
```json
{
  "routes": [
    {
      "route_id": 28762,
      "departure_iata": "LHR",
      "departure_city": "London",
      "departure_country": "United Kingdom",
      "arrival_iata": "MAN",
      "arrival_city": "Manchester",
      "arrival_country": "United Kingdom",
      "distance_km": 244,
      "duration_min": 60,
      "airline_iata": "BA",
      "airline_name": "British Airways"
    }
  ],
  "pagination": {
    "total": 566,
    "showing": 100,
    "limit": 100,
    "offset": 0,
    "all": false
  }
}
```

---

### 7. Airport Routes

Get all routes from or to a specific airport.

**Endpoint**: `GET /airports/{iata}/routes`

**Path Parameters**:
- `iata`: Airport IATA code (e.g., "LHR", "JFK")

**Query Parameters**:
- `direction` (optional): "departure" or "arrival" (default: "departure")
- `airline_id` (optional): Filter by airline ID (returns only routes where this airline is the actual operator)
- `airline_name` (optional): Filter by airline name (returns only routes where this airline is the actual operator)
- `all` (optional): Return all results (default: true for airport routes)
- `limit` (optional): Number of results to return
- `offset` (optional): Number of results to skip

**Examples**:

Get all departure routes from LHR:
```
GET /airports/LHR/routes
```

Get all arrival routes to JFK:
```
GET /airports/JFK/routes?direction=arrival
```

Get British Airways routes from LHR:
```
GET /airports/LHR/routes?airline_name=British Airways
```

**Response**:
```json
{
  "airport": "LHR",
  "direction": "departure",
  "total": 163,
  "returnedCount": 163,
  "all": true,
  "routes": [
    {
      "route_id": 28762,
      "departure_iata": "LHR",
      "departure_city": "London",
      "departure_country": "United Kingdom",
      "arrival_iata": "MAN",
      "arrival_city": "Manchester",
      "arrival_country": "United Kingdom",
      "distance_km": 244,
      "duration_min": 60,
      "airline_iata": "BA",
      "airline_name": "British Airways"
    }
  ]
}
```

---

### 8. Country Routes

Get all routes from or to a specific country.

**Endpoint**: `GET /countries/{country}/routes`

**Path Parameters**:
- `country`: Country name (e.g., "United Kingdom", "France")

**Query Parameters**:
- `direction` (optional): "departure" or "arrival" (default: "departure")
- `destination_country` (optional): Filter by destination country
- `airline_name` (optional): Filter by airline name
- `all` (optional): Return all results (default: false)
- `limit` (optional): Number of results to return (default: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Examples**:

Get all departure routes from Japan:
```
GET /countries/Japan/routes
```

Get all arrival routes to Germany:
```
GET /countries/Germany/routes?direction=arrival
```

Get routes from Germany to Italy:
```
GET /countries/Germany/routes?destination_country=Italy
```

**Response**:
```json
{
  "country": "Japan",
  "direction": "departure",
  "destination_country": null,
  "total": 1247,
  "returnedCount": 100,
  "all": false,
  "routes": [
    {
      "route_id": 12345,
      "departure_iata": "NRT",
      "departure_city": "Tokyo",
      "departure_country": "Japan",
      "arrival_iata": "LAX",
      "arrival_city": "Los Angeles",
      "arrival_country": "USA",
      "distance_km": 8814,
      "duration_min": 600,
      "airline_iata": "JL",
      "airline_name": "Japan Airlines"
    }
  ]
}
```

---

### 9. Airline Routes Excluding Base Airport

Get all routes for a specific airline that don't start or end at a specified base airport.

**Endpoint**: `GET /airlines/{airline}/routes/exclude-base`

**Path Parameters**:
- `airline`: Airline name (e.g., "British Airways", "American Airlines")

**Query Parameters**:
- `base_airport` (required): Base airport IATA code to exclude (e.g., "LHR", "JFK")
- `all` (optional): Return all results (default: false)
- `limit` (optional): Number of results to return (default: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Examples**:

Get all British Airways routes that don't start or end at London Heathrow:
```
GET /airlines/British%20Airways/routes/exclude-base?base_airport=LHR
```

Get all American Airlines routes that don't start or end at JFK:
```
GET /airlines/American%20Airlines/routes/exclude-base?base_airport=JFK&all=true
```

**Response**:
```json
{
  "airline": "British Airways",
  "base_airport": "LHR",
  "total": 245,
  "returnedCount": 100,
  "all": false,
  "routes": [
    {
      "route_id": 28763,
      "departure_iata": "MAN",
      "departure_city": "Manchester",
      "departure_country": "United Kingdom",
      "arrival_iata": "CDG",
      "arrival_city": "Paris",
      "arrival_country": "France",
      "distance_km": 789,
      "duration_min": 90,
      "airline_iata": "BA",
      "airline_name": "British Airways"
    }
  ]
}
```

## Error Responses

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Rate Limiting

Currently, there are no rate limits implemented on the API.

## Performance

The API is optimized for high performance:
- Uses SQLite with prepared statements
- Implements efficient indexing
- Provides fast response times (typically 1-100ms)
- Supports pagination for large datasets

## Examples

### Get British Airways Routes from London Heathrow

```bash
curl "http://localhost:3000/routes?airline_name=British%20Airways&departure_iata=LHR&all=true"
```

### Get Short Flights from UK

```bash
curl "http://localhost:3000/routes?departure_country=United%20Kingdom&max_duration=60&limit=10"
```

### Get All Routes from a Specific Airport

```bash
curl "http://localhost:3000/airports/LHR/routes"
```

### Get Airline Routes Excluding Base Airport

```bash
curl "http://localhost:3000/airlines/British%20Airways/routes/exclude-base?base_airport=LHR"
```

### Get Database Statistics

```bash
curl "http://localhost:3000/stats"
```

## Data Schema

### Route Object
```json
{
  "route_id": "number",
  "departure_iata": "string",
  "departure_city": "string",
  "departure_country": "string",
  "arrival_iata": "string",
  "arrival_city": "string",
  "arrival_country": "string",
  "distance_km": "number",
  "duration_min": "number",
  "airline_iata": "string",
  "airline_name": "string"
}
```

### Airport Object
```json
{
  "iata": "string",
  "name": "string",
  "city_name": "string",
  "country": "string",
  "country_code": "string",
  "continent": "string",
  "latitude": "number",
  "longitude": "number"
}
```

### Airline Object
```json
{
  "id": "number",
  "iata": "string",
  "name": "string"
}
```

## Support

For questions or issues, please refer to the project documentation or create an issue in the repository. 