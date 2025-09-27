// src/components/ProcessingScreen.jsx - Enhanced with Better Styling and Authentication

import React, { useEffect, useState, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProcessingScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAuthHeaders } = useContext(AuthContext);
  const { task_id, initialProcessingStatus } = location.state || {};
  
  const [overallProgress, setOverallProgress] = useState(0);
  const [overallStatus, setOverallStatus] = useState('Initializing...');
  const [steps, setSteps] = useState(initialProcessingStatus?.steps?.map((step, index) => ({
    id: `step-${index + 1}`,
    icon: getStepIcon(index),
    title: step.name,
    description: getStepDescription(index),
    time: '',
    status: step.completed ? 'Completed' : 'Pending',
    active: false,
    completed: step.completed,
  })) || []);
  
  const intervalRef = useRef(null);

  function getStepIcon(index) {
    const icons = [
      'fas fa-search',        // Checking existing reports
      'fas fa-save',          // Saving farm data
      'fas fa-cloud-sun',     // Fetching weather data
      'fas fa-seedling',      // Fetching soil data
      'fas fa-satellite',     // Fetching satellite data
      'fas fa-brain',         // Generating recommendations
      'fas fa-file-alt'       // Generating detailed report
    ];
    return icons[index] || 'fas fa-cogs';
  }

  function getStepDescription(index) {
    const descriptions = [
      'Searching for similar farm analyses in our database...',
      'Storing your farm information securely...',
      'Retrieving real-time weather patterns and forecasts...',
      'Analyzing soil composition and nutrient levels...',
      'Processing satellite imagery and vegetation indices...',
      'AI-powered crop and carbon analysis in progress...',
      'Compiling comprehensive agricultural report...'
    ];
    return descriptions[index] || 'Processing...';
  }

  useEffect(() => {
    if (!task_id) {
      setOverallStatus('Error: No task ID received.');
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/status/${task_id}`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const currentStatus = await response.json();
        console.log('ProcessingScreen: Current status:', currentStatus);

        const totalSteps = currentStatus.steps.length;
        const completedSteps = currentStatus.steps.filter(step => step.completed).length;
        const newProgress = (completedSteps / totalSteps) * 100;

        setOverallProgress(newProgress);
        setOverallStatus(currentStatus.status);

        // Update steps with current status and timing
        setSteps(prevSteps => prevSteps.map((prevStep, index) => {
          const backendStep = currentStatus.steps[index];
          if (backendStep) {
            const isCurrentlyActive = !backendStep.completed && index === completedSteps;
            return {
              ...prevStep,
              status: backendStep.completed ? 'Completed' : isCurrentlyActive ? 'In Progress' : 'Pending',
              completed: backendStep.completed,
              active: isCurrentlyActive,
              time: backendStep.completed ? getCompletionTime() : isCurrentlyActive ? 'Processing...' : ''
            };
          }
          return prevStep;
        }));

        // Handle completion
        if (currentStatus.status === "Completed") {
          clearInterval(intervalRef.current);
          setOverallProgress(100);
          setOverallStatus('Analysis Complete!');
          
          setSteps(prevSteps => prevSteps.map(step => ({
            ...step,
            active: false,
            completed: true,
            status: 'Completed',
            time: 'Done'
          })));

          // Fetch and navigate to results
          if (currentStatus.final_report_path) {
            try {
              const reportFilename = currentStatus.final_report_path;
              const reportFetchUrl = `http://localhost:5000/api/reports/${reportFilename}`;
              
              console.log("ProcessingScreen: Fetching final report from:", reportFetchUrl);
              
              const reportResponse = await fetch(reportFetchUrl, {
                headers: getAuthHeaders()
              });
              
              if (!reportResponse.ok) {
                console.error(`ProcessingScreen: HTTP error ${reportResponse.status} when fetching report`);
                throw new Error(`HTTP error fetching report! status: ${reportResponse.status}`);
              }

              const finalReportContent = await reportResponse.json();
              console.log("ProcessingScreen: Successfully received report content");

              // Navigate to recommendations with the report content
              setTimeout(() => {
                navigate("/recommendations", {
                  state: { rawReportContent: finalReportContent }
                });
              }, 2000);
              
            } catch (reportError) {
              console.error("ProcessingScreen: Error fetching report:", reportError);
              setOverallStatus('Report generation completed, but failed to load report.');
              
              setTimeout(() => {
                navigate("/recommendations", {
                  state: {
                    rawReportContent: {
                      error: true,
                      message: "Processing completed but report could not be loaded. Error: " + reportError.message,
                      report: {
                        final_summary: `Processing was completed but the detailed report could not be retrieved. Error: ${reportError.message}. Please try again or contact support.`
                      }
                    }
                  }
                });
              }, 3000);
            }
          }
        } else if (currentStatus.status === "Failed") {
          clearInterval(intervalRef.current);
          setOverallProgress(0);
          setOverallStatus(`Processing Failed: ${currentStatus.error || 'Unknown error'}`);
          
          setTimeout(() => {
            navigate("/recommendations", {
              state: {
                rawReportContent: {
                  error: true,
                  message: currentStatus.error || "Processing failed",
                  report: {
                    final_summary: `Processing failed: ${currentStatus.error || 'An unknown error occurred during processing. Please try again.'}`
                  }
                }
              }
            });
          }, 3000);
        }
      } catch (error) {
        console.error("ProcessingScreen: Error fetching status:", error);
        clearInterval(intervalRef.current);
        setOverallStatus('Error during processing: ' + error.message);
        
        setTimeout(() => {
          navigate("/recommendations", {
            state: {
              rawReportContent: {
                error: true,
                message: "Network error occurred: " + error.message,
                report: {
                  final_summary: "A network error occurred while processing your request. Please check your connection and try again. Error: " + error.message
                }
              }
            }
          });
        }, 3000);
      }
    };

    function getCompletionTime() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Initial fetch
    fetchStatus();

    // Set up polling interval
    intervalRef.current = setInterval(fetchStatus, 2000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [task_id, navigate, getAuthHeaders]);

  return (
    <div className="processing-container">
      <div className="processing-card">
        {/* Header */}
        <div className="processing-header">
          <div className="processing-icon">
            <i className="fas fa-brain fa-2x"></i>
          </div>
          <h1 className="processing-title">AI Analysis in Progress</h1>
          <p className="processing-subtitle">
            We're analyzing your farm data using advanced AI to provide the best recommendations
          </p>
        </div>

        {/* Progress Overview */}
        <div className="progress-overview">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${overallProgress}, 100`}
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {Math.round(overallProgress)}%
              </text>
            </svg>
          </div>
          
          <div className="progress-info">
            <h2 className="progress-status">{overallStatus}</h2>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {Math.round(overallProgress)}% Complete
            </p>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="processing-steps">
          <h3 className="steps-title">Processing Steps</h3>
          <div className="steps-list">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`step-item ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
              >
                <div className="step-indicator">
                  <div className="step-icon">
                    {step.completed ? (
                      <i className="fas fa-check"></i>
                    ) : step.active ? (
                      <i className={`${step.icon} fa-pulse`}></i>
                    ) : (
                      <i className={step.icon}></i>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`step-connector ${step.completed ? 'completed' : ''}`}></div>
                  )}
                </div>
                
                <div className="step-content">
                  <div className="step-header">
                    <h4 className="step-title">{step.title}</h4>
                    <span className={`step-status ${step.status.toLowerCase().replace(' ', '-')}`}>
                      {step.status}
                    </span>
                  </div>
                  <p className="step-description">{step.description}</p>
                  {step.time && (
                    <p className="step-time">
                      <i className="fas fa-clock"></i>
                      {step.time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Tips */}
        <div className="processing-tips">
          <h4 className="tips-title">
            <i className="fas fa-lightbulb"></i>
            Did you know?
          </h4>
          <div className="tips-content">
            <p>Our AI analyzes over 147 crop varieties and considers 15 different agro-climatic zones to find the perfect match for your farm conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;