"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, MapPin, Search, Globe, Calendar } from "lucide-react";

export default function Nav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: <Plane className="h-5 w-5" />, label: "Routes" },
    {
      href: "/airports",
      icon: <MapPin className="h-5 w-5" />,
      label: "Airports",
    },
    {
      href: "/airlines",
      icon: <Search className="h-5 w-5" />,
      label: "Airlines",
    },
    {
      href: "/countries",
      icon: <Globe className="h-5 w-5" />,
      label: "Countries",
    },
    {
      href: "/schedule",
      icon: <Calendar className="h-5 w-5" />,
      label: "Schedule",
    },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex overflow-x-auto whitespace-nowrap">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 space-x-2 transition flex-shrink-0 ${
                isActive
                  ? "text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
