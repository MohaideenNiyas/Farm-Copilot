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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="text-center p-8 bg-gradient-to-r from-teal-500 to-green-500 text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
            <i className="fas fa-brain text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Analysis in Progress</h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            We're analyzing your farm data using advanced AI to provide the best recommendations
          </p>
        </div>

          {/* Progress Overview */}
          <div className="p-8">
            <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-500 transition-all duration-500 ease-out"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${overallProgress}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-64">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{overallStatus}</h2>
                <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
                <p className="text-slate-600">
                  {Math.round(overallProgress)}% Complete
                </p>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Processing Steps</h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                      step.completed ? 'bg-green-50 border-green-200' :
                      step.active ? 'bg-blue-50 border-blue-200' :
                      'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        step.completed ? 'bg-green-500 text-white' :
                        step.active ? 'bg-blue-500 text-white animate-pulse' :
                        'bg-slate-300 text-slate-600'
                      }`}>
                        {step.completed ? (
                          <i className="fas fa-check text-sm"></i>
                        ) : step.active ? (
                          <i className={`${step.icon} text-sm`}></i>
                        ) : (
                          <i className={`${step.icon} text-sm`}></i>
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-0.5 h-8 mt-2 transition-all duration-300 ${
                          step.completed ? 'bg-green-500' : 'bg-slate-300'
                        }`}></div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900">{step.title}</h4>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          step.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          step.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-2">{step.description}</p>
                      {step.time && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
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
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <i className="fas fa-lightbulb text-amber-500"></i>
                Did you know?
              </h4>
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <p className="text-amber-700">Our AI analyzes over 147 crop varieties and considers 15 different agro-climatic zones to find the perfect match for your farm conditions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProcessingScreen;