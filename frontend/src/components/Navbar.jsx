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
    <nav className="navbar">
      <div className="navbar-content">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-btn ${isActive ? "nav-btn--active" : ""}`
            }
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;