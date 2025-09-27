// src/App.jsx - Updated with Authentication and New Routing

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

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
