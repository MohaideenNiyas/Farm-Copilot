// src/App.jsx - Updated with Authentication and New Routing

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ZoneAnalysis from "./components/ZoneAnalysis";
import DatabaseExplorer from "./components/DatabaseExplorer";
import FarmAnalyzer from "./components/FarmAnalyzer";
import ProcessingScreen from "./components/ProcessingScreen";
import Recommendations from "./components/Recommendations";
import AnalysisHub from "./components/AnalysisHub";
import CarbonCalculator from "./components/CarbonCalculator";
import MRVCompliance from "./components/MRVCompliance";
import AuthLayout from "./components/AuthLayout";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./components/LandingPage";

// Wrapper component to handle modal state based on route
function LandingPageWithModal() {
  const location = useLocation();
  const [activeModal, setActiveModal] = useState(() => {
    // Set initial modal state based on current path
    if (location.pathname === '/login') return 'login';
    if (location.pathname === '/register') return 'register';
    return null;
  });

  const closeModal = () => {
    setActiveModal(null);
    // Navigate back to home when closing modal
    window.history.replaceState(null, '', '/');
  };

  const switchToRegister = () => {
    setActiveModal('register');
    window.history.replaceState(null, '', '/register');
  };

  const switchToLogin = () => {
    setActiveModal('login');
    window.history.replaceState(null, '', '/login');
  };

  return (
    <LandingPage
      initialModal={activeModal}
      onModalClose={closeModal}
      onSwitchToRegister={switchToRegister}
      onSwitchToLogin={switchToLogin}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPageWithModal />} />
            <Route path="/login" element={<LandingPageWithModal />} />
            <Route path="/register" element={<LandingPageWithModal />} />

            {/* Protected Routes - Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/zone-analysis" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ZoneAnalysis />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/database-explorer" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DatabaseExplorer />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/farm-analyzer" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <FarmAnalyzer />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/processing" element={
              <ProtectedRoute>
                <ProcessingScreen />
              </ProtectedRoute>
            } />
            
            <Route path="/recommendations" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Recommendations />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/analysis-hub" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AnalysisHub />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/carbon-calculator" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CarbonCalculator />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/mrv-compliance" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MRVCompliance />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
