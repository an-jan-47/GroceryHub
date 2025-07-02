
import React from "react";
import { Home, Search, ShoppingCart, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/cart", icon: ShoppingCart, label: "Cart" },
  { to: "/profile", icon: User, label: "Profile" },
]

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center space-y-1 text-xs",
                isActive ? "text-primary" : "text-gray-500"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// Also export as named export for compatibility
export { BottomNavigation };
