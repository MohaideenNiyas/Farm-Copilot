// src/components/Navbar.jsx - Updated Navigation with Authentication

import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user } = useContext(AuthContext);
  
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-home" },
    { path: "/zone-analysis", label: "Zone Analysis", icon: "fas fa-map-marked-alt" },
    { path: "/database-explorer", label: "147 Database", icon: "fas fa-database" },
    { path: "/farm-analyzer", label: "Analyze Farm", icon: "fas fa-calculator" },
    { path: "/recommendations", label: "Recommendations", icon: "fas fa-clipboard-list" },
    { path: "/analysis-hub", label: "Analysis Hub", icon: "fas fa-chart-line" },
    { path: "/carbon-calculator", label: "Calculator", icon: "fas fa-coins" },
    { path: "/mrv-compliance", label: "MRV", icon: "fas fa-check-circle" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4 py-3 flex-wrap">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all hover:bg-slate-100 ${
                  isActive ? "bg-teal-500 text-white shadow-md" : "text-slate-600 hover:text-teal-600"
                }`
              }
            >
              <i className={item.icon}></i>
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;