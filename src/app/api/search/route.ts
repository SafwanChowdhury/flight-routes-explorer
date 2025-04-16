import { NextResponse } from 'next/server';
import { getAirports } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const airports = await getAirports();
    
    // Filter airports by name, city, or IATA code
    const results = airports.airports
      .filter((airport: any) => {
        const searchFields = [
          airport.name?.toLowerCase(),
          airport.city_name?.toLowerCase(),
          airport.iata?.toLowerCase(),
          airport.country?.toLowerCase()
        ];
        return searchFields.some(field => field?.includes(query));
      })
      .map((airport: any) => ({
        iata: airport.iata,
        name: airport.name,
        city: airport.city_name,
        country: airport.country,
        type: 'airport' as const
      }))
      .slice(0, 10); // Limit to 10 results

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
} 