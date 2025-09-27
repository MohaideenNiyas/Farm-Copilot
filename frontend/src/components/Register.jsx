// src/components/Register.jsx - User Registration Component

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.user_id.trim()) {
      setError('User ID is required');
      return false;
    }
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { confirmPassword, ...submitData } = formData;
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            <i className="fas fa-seedling"></i>
            Create Account
          </h1>
          <p className="auth-subtitle">
            Join our agricultural platform and start optimizing your farm
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="user_id" className="form-label">
              <i className="fas fa-id-card"></i>
              User ID *
            </label>
            <input
              type="text"
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className="form-input"
              placeholder="Choose a unique user ID"
              required
              disabled={isLoading}
            />
            <small className="form-help">
              This will be used to log into your account
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <i className="fas fa-user"></i>
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-envelope"></i>
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email address"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <i className="fas fa-lock"></i>
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Create a password (min. 6 characters)"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <i className="fas fa-lock"></i>
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;