import React from "react";

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo + Title */}
          <div className="header-logo">
            <h1 className="header-title">🌱 NABARD Carbon Credit System V4</h1>
            <p className="header-subtitle">
              Complete 147-Variety Database with True Intelligence Engine & Zone
              Analysis
            </p>
            <div className="version-badge">
              <span className="badge badge--primary">Version 4.0</span>
              <span className="badge badge--success">147 Varieties</span>
              <span className="badge badge--info">15 Zone Analysis</span>
              <span className="badge badge--warning">True AI Engine</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value" id="header-farms">0</div>
              <div className="stat-label">Farms Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" id="header-varieties">147</div>
              <div className="stat-label">Total Varieties</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" id="header-zones">15</div>
              <div className="stat-label">Zones Covered</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" id="header-value">$0</div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
