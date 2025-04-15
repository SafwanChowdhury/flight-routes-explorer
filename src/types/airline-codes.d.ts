declare module 'airline-codes' {
  interface AirlineData {
    get(key: string): string | undefined;
  }

  interface Airlines {
    findWhere(query: { iata: string }): AirlineData | undefined;
  }

  const airlines: Airlines;
  export default airlines;
} 