"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { getStats } from "@/lib/api";

export default function Header() {
  const [stats, setStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    loadStats();
  }, []);

  // Only render stats after component has mounted on client
  // This prevents hydration mismatch
  const renderedStats = mounted ? (
    stats && (
      <div className="text-sm">
        <span className="px-2 py-1 bg-blue-800 rounded-md mr-2">
          {stats.counts?.airlines || 0} Airlines
        </span>
        <span className="px-2 py-1 bg-blue-800 rounded-md mr-2">
          {stats.counts?.airports || 0} Airports
        </span>
        <span className="px-2 py-1 bg-blue-800 rounded-md">
          {stats.counts?.routes || 0} Routes
        </span>
      </div>
    )
  ) : (
    <div className="text-sm opacity-0">Loading stats...</div>
  );

  return (
    <header className="bg-blue-700 text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Flight Routes Explorer</h1>
        </div>
        {renderedStats}
      </div>
    </header>
  );
}
