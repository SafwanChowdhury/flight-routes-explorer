import { NextResponse } from 'next/server';
import { getAirlines } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const airlines = await getAirlines();
    
    // Filter airlines by name or IATA code
    const results = airlines.airlines
      .filter((airline: any) => {
        const searchFields = [
          airline.name?.toLowerCase(),
          airline.iata?.toLowerCase()
        ];
        return searchFields.some(field => field?.includes(query));
      })
      .map((airline: any) => ({
        id: airline.id,
        name: airline.name,
        iata: airline.iata,
        type: 'airline' as const
      }))
      .slice(0, 10); // Limit to 10 results

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Airline search error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
} 