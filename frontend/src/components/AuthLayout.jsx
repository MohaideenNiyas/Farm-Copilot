// src/components/AuthLayout.jsx - Layout for Authentication Pages

import React from 'react';

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {children}
    </div>
  );
}

export default AuthLayout;