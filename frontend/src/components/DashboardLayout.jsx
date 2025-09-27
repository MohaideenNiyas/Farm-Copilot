// src/components/DashboardLayout.jsx - Layout for Dashboard Pages with Navigation

import React, { useContext } from 'react';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';

function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-brand">
            <i className="fas fa-seedling"></i>
            <span>AgriSystem</span>
          </div>
          
          <div className="dashboard-user">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-id">ID: {user?.user_id}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-nav">
        <Navbar />
      </div>
      
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;