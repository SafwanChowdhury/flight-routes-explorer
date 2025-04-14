"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, MapPin, Search, Globe } from "lucide-react";

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
  ];

  return (
    <nav className="bg-white border-b">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 space-x-2 transition ${
                isActive
                  ? "text-blue-700 border-b-2 border-blue-700 font-medium"
                  : "text-gray-500 hover:text-blue-700 hover:bg-gray-50"
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
