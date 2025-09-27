// src/components/AuthLayout.jsx - Layout for Authentication Pages

import React from 'react';

function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}

export default AuthLayout;