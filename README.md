# Flight Routes Explorer - Running Instructions

## Prerequisites

- Make sure Node.js and npm are installed on your machine
- Ensure your Flight Routes API server is running on <http://localhost:3000>

## Steps to Run

1. Create the project:

```bash
npx create-next-app@latest flight-routes-explorer --typescript --eslint --tailwind --app
cd flight-routes-explorer
```

2. Install dependencies:

```bash
npm install lucide-react recharts axios
```

3. Create the project files as shown in the artifacts provided

4. Start the development server:

```bash
npm run dev
```

The application will start, typically on <http://localhost:3001> (since port 3000 is already in use by your API server).

## Fixes Applied

1. **Hydration Mismatch Fix**:
   - Added a mounted state check in the Header component to avoid hydration mismatches
   - Improved the layout structure to ensure client-side and server-side rendering match

2. **Working "View Routes" Buttons**:
   - All "View Routes" buttons now navigate to the main routes page with appropriate filters
   - Airport routes button navigates to `/?departure_iata=IATA_CODE`
   - Airline routes button navigates to `/?airline_name=AIRLINE_NAME`
   - Country routes button navigates to `/?departure_country=COUNTRY_NAME`

3. **URL Parameter Support**:
   - Added URL parameter support to maintain filter state for sharing and bookmarking
   - Routes page now reads filters from URL parameters when loaded

## Features

- **Responsive layout** that works on mobile and desktop
- **Real-time data fetching** from your API server
- **Client-side filtering** with URL parameter support
- **Pagination** for routes data
- **Loading states** during data fetching
- **Error handling** for API failures

## API Integration

The application connects to your Flight Routes API server running on localhost:3000, using the following endpoints:

- `/stats` - To get database statistics
- `/routes` - To search and filter routes
- `/airports` - To browse and filter airports
- `/airlines` - To list all airlines
- `/countries` - To list all countries

## Troubleshooting

If you experience CORS issues, you may need to add CORS headers to your Node.js API server. Add this to your server code:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
```

Or install and use the cors package:

```javascript
const cors = require('cors');
app.use(cors());
```
