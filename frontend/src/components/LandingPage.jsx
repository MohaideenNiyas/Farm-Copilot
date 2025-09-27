import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const heroRef = useRef(null);
  const farmSceneRef = useRef(null);
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    // Initialize 3D effects and animations
    const initializeAnimations = () => {
      // Mouse movement parallax effect for 3D-like interaction
      const handleMouseMove = (e) => {
        if (!heroRef.current || !farmSceneRef.current) return;
        
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        // Calculate mouse position relative to center (normalized -0.5 to 0.5)
        const xPos = (clientX / innerWidth - 0.5) * 20;
        const yPos = (clientY / innerHeight - 0.5) * 20;
        
        // Apply 3D transformations to the farm scene
        farmSceneRef.current.style.transform = `
          translate(${xPos}px, ${yPos}px) 
          rotateY(${xPos * 0.2}deg) 
          rotateX(${-yPos * 0.2}deg)
          translateZ(10px)
        `;
      };

      // Scroll-based 3D effects
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Hero section parallax
        if (heroRef.current) {
          const heroTransform = Math.min(scrollY * 0.3, windowHeight * 0.2);
          heroRef.current.style.transform = `translateY(${heroTransform}px)`;
        }

        // Animate elements on scroll
        const animatedElements = document.querySelectorAll('.scroll-animate');
        animatedElements.forEach((element) => {
          const elementTop = element.getBoundingClientRect().top;
          const elementVisible = elementTop < windowHeight - 100;
          
          if (elementVisible) {
            element.classList.add('animate-in');
          }
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
      };
    };

    // Initialize floating particles
    const createFloatingParticles = () => {
      const particleContainer = document.querySelector('.floating-particles');
      if (!particleContainer) return;

      const particleCount = 30;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position and animation properties
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.opacity = Math.random() * 0.4 + 0.1;
        
        // Random particle type (crop symbols)
        const cropSymbols = ['🌱', '🌾', '🌿', '🍃'];
        particle.textContent = cropSymbols[Math.floor(Math.random() * cropSymbols.length)];
        particle.style.fontSize = (Math.random() * 6 + 8) + 'px';
        
        particleContainer.appendChild(particle);
      }
      
      setParticlesReady(true);
    };

    const cleanup = initializeAnimations();
    setTimeout(createFloatingParticles, 500);

    return cleanup;
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <div className="corrected-landing-page">
      {/* Navigation Header */}
      <header className="navigation-header">
        <nav className="nav-container">
          <div className="nav-brand">
            <div className="brand-icon">🌾</div>
            <span className="brand-name">AgroIntel</span>
          </div>
          <div className="nav-menu">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
              Features
            </a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>
              How It Works
            </a>
            <a href="#technology" onClick={(e) => { e.preventDefault(); scrollToSection('technology'); }}>
              Technology
            </a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>
              Success Stories
            </a>
            <Link to="/farm-analyzer" className="nav-cta-btn">
              Start Analysis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section with Corrected 3D Farm Scene */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-overlay"></div>
        
        {/* Floating Particles Background */}
        <div className="floating-particles"></div>
        
        {/* Corrected 3D Farm Scene */}
        <div className="farm-3d-scene" ref={farmSceneRef}>
          {/* Animated Crop Field */}
          <div className="crop-field">
            {[...Array(8)].map((_, rowIndex) => (
              <div key={rowIndex} className="crop-row" style={{ animationDelay: `${rowIndex * 0.1}s` }}>
                {[...Array(10)].map((_, plantIndex) => (
                  <div 
                    key={plantIndex} 
                    className="crop-plant"
                    style={{ animationDelay: `${(rowIndex + plantIndex) * 0.05}s` }}
                  >
                    🌾
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Farm Equipment */}
          <div className="farm-equipment">
            <div className="tractor">
              <div className="tractor-body">🚜</div>
              <div className="dust-trail"></div>
            </div>

            <div className="irrigation">
              <div className="sprinkler">💦</div>
              <div className="water-drops">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="water-drop" style={{ animationDelay: `${i * 0.3}s` }}>💧</div>
                ))}
              </div>
            </div>
          </div>

          {/* Drone Animation */}
          <div className="drone-system">
            <div className="drone">
              <div className="drone-body">🛸</div>
              <div className="scanning-beam"></div>
            </div>
          </div>

          {/* Weather System */}
          <div className="weather-system">
            <div className="clouds">
              <div className="cloud cloud-1">☁️</div>
              <div className="cloud cloud-2">⛅</div>
            </div>
            <div className="sun">☀️</div>
          </div>

          {/* Data Visualization */}
          <div className="data-points">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="data-point" 
                style={{ 
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.4}s`
                }}
              >
                📊
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transform Your Farm with{' '}
              <span className="hero-highlight">AI-Powered Agricultural Intelligence</span>
            </h1>
            <p className="hero-subtitle">
              Maximize crop yields, reduce input costs, and implement climate-resilient farming strategies 
              with our comprehensive agricultural analytics platform featuring advanced 3D visualization and 
              real-time satellite monitoring.
            </p>
            <div className="hero-actions">
              <Link to="/farm-analyzer" className="btn btn-primary">
                <span className="btn-icon">🚀</span>
                Start Free Analysis
              </Link>
              <button 
                className="btn btn-secondary"
                onClick={() => scrollToSection('demo')}
              >
                <span className="btn-icon">📺</span>
                View Live Demo
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <div className="trust-icon">🏆</div>
                <div className="trust-content">
                  <div className="trust-number">10,000+</div>
                  <div className="trust-label">Farms Analyzed</div>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🌍</div>
                <div className="trust-content">
                  <div className="trust-number">25+</div>
                  <div className="trust-label">States Covered</div>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-icon">📈</div>
                <div className="trust-content">
                  <div className="trust-number">23%</div>
                  <div className="trust-label">Avg Yield Increase</div>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🔬</div>
                <div className="trust-content">
                  <div className="trust-number">15+</div>
                  <div className="trust-label">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Discover More</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section scroll-animate">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              AI-Powered <span className="highlight-text">Agricultural Intelligence</span>
            </h2>
            <p className="section-subtitle">
              Our platform combines satellite imagery, weather data, and machine learning to deliver 
              actionable insights for modern farming.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="rotating-icon">🌾</div>
              </div>
              <div className="feature-content">
                <h3>Crop Recommendations</h3>
                <p>Get personalized variety suggestions based on your soil, climate, and market conditions with AI-powered analysis.</p>
                <div className="feature-stats">
                  <div className="stat">
                    <div className="stat-number">95%</div>
                    <div className="stat-label">Accuracy</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">200+</div>
                    <div className="stat-label">Varieties</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="rotating-icon">🛰️</div>
              </div>
              <div className="feature-content">
                <h3>Satellite Analytics</h3>
                <p>Real-time field monitoring with high-resolution satellite imagery for early stress detection and crop health assessment.</p>
                <div className="feature-stats">
                  <div className="stat">
                    <div className="stat-number">3m</div>
                    <div className="stat-label">Resolution</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">Daily</div>
                    <div className="stat-label">Updates</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="rotating-icon">🌡️</div>
              </div>
              <div className="feature-content">
                <h3>Weather Integration</h3>
                <p>Climate-smart farming decisions with hyper-local weather forecasts and historical data analysis.</p>
                <div className="feature-stats">
                  <div className="stat">
                    <div className="stat-number">5km</div>
                    <div className="stat-label">Precision</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">15 days</div>
                    <div className="stat-label">Forecast</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="rotating-icon">📊</div>
              </div>
              <div className="feature-content">
                <h3>Yield Optimization</h3>
                <p>Maximize productivity and profits with data-driven yield prediction and optimization recommendations.</p>
                <div className="feature-stats">
                  <div className="stat">
                    <div className="stat-number">25%</div>
                    <div className="stat-label">Yield Boost</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">30%</div>
                    <div className="stat-label">Cost Reduction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section scroll-animate">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Transform Your Farming in <span className="highlight-text">Four Simple Steps</span>
            </h2>
            <p className="section-subtitle">
              Our streamlined process makes advanced agricultural analytics accessible to every farmer,
              from data input to actionable recommendations.
            </p>
          </div>

          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-icon">📍</div>
              <div className="step-content">
                <h3>Submit Farm Data</h3>
                <p>Enter your location, crops, farm size, and soil information through our intuitive form interface.</p>
                <div className="step-features">
                  <span>GPS Integration</span>
                  <span>Smart Forms</span>
                  <span>Data Validation</span>
                </div>
                <div className="step-demo">
                  <div className="form-preview">
                    <div className="form-field">
                      <span className="field-label">Location</span>
                      <span className="field-value">📍 Punjab, India</span>
                    </div>
                    <div className="form-field">
                      <span className="field-label">Crop</span>
                      <span className="field-value">🌾 Wheat</span>
                    </div>
                    <div className="form-field">
                      <span className="field-label">Area</span>
                      <span className="field-value">📏 5.2 hectares</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-icon">🧠</div>
              <div className="step-content">
                <h3>AI Analysis</h3>
                <p>Our algorithms process weather, soil, and satellite data to analyze your specific farming conditions.</p>
                <div className="step-features">
                  <span>Machine Learning</span>
                  <span>Big Data Analytics</span>
                  <span>Pattern Recognition</span>
                </div>
                <div className="step-demo">
                  <div className="analysis-preview">
                    <div className="data-source">
                      <span className="source-icon">🛰️</span>
                      <span className="source-status analyzing">Analyzing...</span>
                    </div>
                    <div className="data-source">
                      <span className="source-icon">🌡️</span>
                      <span className="source-status processing">Processing...</span>
                    </div>
                    <div className="data-source">
                      <span className="source-icon">🌱</span>
                      <span className="source-status computing">Computing...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-icon">📋</div>
              <div className="step-content">
                <h3>Get Recommendations</h3>
                <p>Receive comprehensive reports with crop suggestions, risk assessments, and detailed action plans.</p>
                <div className="step-features">
                  <span>Detailed Reports</span>
                  <span>Risk Analysis</span>
                  <span>Action Plans</span>
                </div>
                <div className="step-demo">
                  <div className="report-preview">
                    <div className="report-section">
                      <span className="section-icon">🌾</span>
                      <div className="section-content">
                        <div className="section-title">Crop Recommendations</div>
                        <div className="section-value">5 varieties identified</div>
                      </div>
                    </div>
                    <div className="report-section">
                      <span className="section-icon">⚠️</span>
                      <div className="section-content">
                        <div className="section-title">Risk Assessment</div>
                        <div className="section-value">Medium risk level</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-icon">🚜</div>
              <div className="step-content">
                <h3>Implement Solutions</h3>
                <p>Apply recommendations and track progress with continuous monitoring and real-time optimization.</p>
                <div className="step-features">
                  <span>Progress Tracking</span>
                  <span>Real-time Updates</span>
                  <span>Continuous Support</span>
                </div>
                <div className="step-demo">
                  <div className="monitoring-preview">
                    <div className="progress-item">
                      <div className="progress-label">Planting Progress</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '75%' }}></div>
                      </div>
                      <div className="progress-value">75%</div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-label">Growth Stage</div>
                      <div className="growth-indicator">🌿 Vegetative</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section scroll-animate">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Proven <span className="highlight-text">Results & Impact</span>
            </h2>
            <p className="section-subtitle">
              Farmers using our platform achieve measurable improvements in productivity, 
              profitability, and sustainability.
            </p>
          </div>

          <div className="results-grid">
            <div className="result-card">
              <div className="result-icon">📈</div>
              <div className="result-content">
                <h3>Higher Productivity</h3>
                <div className="result-metric">
                  <span className="metric-value">25%</span>
                  <span className="metric-unit">Average Increase</span>
                </div>
                <p>Optimized crop selection and management practices deliver significantly higher productivity.</p>
              </div>
            </div>

            <div className="result-card">
              <div className="result-icon">💰</div>
              <div className="result-content">
                <h3>Reduced Costs</h3>
                <div className="result-metric">
                  <span className="metric-value">30%</span>
                  <span className="metric-unit">Cost Savings</span>
                </div>
                <p>Efficient resource utilization and precise application techniques reduce expenses.</p>
              </div>
            </div>

            <div className="result-card">
              <div className="result-icon">🌿</div>
              <div className="result-content">
                <h3>Climate Resilience</h3>
                <div className="result-metric">
                  <span className="metric-value">40%</span>
                  <span className="metric-unit">Better Adaptation</span>
                </div>
                <p>Adapt to changing weather patterns with data-driven risk management.</p>
              </div>
            </div>

            <div className="result-card">
              <div className="result-icon">🎯</div>
              <div className="result-content">
                <h3>Risk Reduction</h3>
                <div className="result-metric">
                  <span className="metric-value">50%</span>
                  <span className="metric-unit">Risk Mitigation</span>
                </div>
                <p>Identify and mitigate potential threats with predictive analytics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;