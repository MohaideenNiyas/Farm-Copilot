import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  Sprout,
  Sun,
  Droplets,
  Tractor,
  BarChart3,
  Shield,
  Target,
  TrendingUp,
  Users,
  Globe,
  Award,
  ChevronRight,
  Play,
  Check,
  Menu,
  X,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  PhoneCall
} from 'lucide-react';
import Login from './Login';
import Register from './Register';

const LandingPage = ({
  initialModal = null,
  onModalClose,
  onSwitchToRegister,
  onSwitchToLogin
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const [activeModal, setActiveModal] = useState(initialModal); // 'login' or 'register'
  const heroRef = useRef(null);

  const handleLogin = () => {
    setActiveModal('login');
  };

  const handleRegister = () => {
    setActiveModal('register');
  };

  const closeModal = () => {
    setActiveModal(null);
    if (onModalClose) onModalClose();
  };

  const switchToRegister = () => {
    setActiveModal('register');
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const switchToLogin = () => {
    setActiveModal('login');
    if (onSwitchToLogin) onSwitchToLogin();
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AgroTech Pro</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('solutions')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Solutions
              </button>
              <button 
                onClick={() => scrollToSection('technology')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Technology
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Reviews
              </button>
              
              {/* Auth Buttons */}
              <div className="flex items-center space-x-3 ml-8">
                <button
                  onClick={handleLogin}
                  className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Log In
                </button>
                <button
                  onClick={handleRegister}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-gray-700 hover:text-green-600 font-medium py-2"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('solutions')}
                className="block w-full text-left text-gray-700 hover:text-green-600 font-medium py-2"
              >
                Solutions
              </button>
              <button 
                onClick={() => scrollToSection('technology')}
                className="block w-full text-left text-gray-700 hover:text-green-600 font-medium py-2"
              >
                Technology
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left text-gray-700 hover:text-green-600 font-medium py-2"
              >
                Reviews
              </button>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleLogin}
                  className="block w-full text-left text-gray-700 font-medium py-2"
                >
                  Log In
                </button>
                <button
                  onClick={handleRegister}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Animated Farm Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Crops */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-4 animate-bounce">
              {[...Array(8)].map((_, i) => (
                <Sprout 
                  key={i} 
                  className="w-6 h-6 text-green-500 opacity-60" 
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          {/* Tractor Animation */}
          <div className="absolute bottom-24 left-20 animate-pulse">
            <Tractor className="w-12 h-12 text-orange-500 opacity-70" />
          </div>

          {/* Sun */}
          <div className="absolute top-32 right-32 animate-spin" style={{ animationDuration: '20s' }}>
            <Sun className="w-16 h-16 text-yellow-400 opacity-30" />
          </div>

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-20"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '6s'
              }}
            >
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-6">
                <Leaf className="w-4 h-4 mr-2" />
                #1 Agricultural Intelligence Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Your Farm with{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                AI-Powered
              </span>{' '}
              Agriculture
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Maximize yields, reduce costs, and build sustainable farming practices with our comprehensive agricultural intelligence platform. Join 15,000+ farmers transforming their operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3">
                <Play className="w-6 h-6" />
                <span>Start Free Analysis</span>
              </button>
              <button className="border-2 border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all flex items-center justify-center space-x-3">
                <BarChart3 className="w-6 h-6" />
                <span>View Live Demo</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">15,000+</div>
                <div className="text-gray-600 font-medium">Active Farms</div>
              </div>
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
              </div>
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">35%</div>
                <div className="text-gray-600 font-medium">Yield Increase</div>
              </div>
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
                <div className="text-gray-600 font-medium">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        className={`py-24 bg-white transition-all duration-1000 ${
          isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Smart Farming{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Solutions
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI, satellite imagery, and IoT sensors to make data-driven decisions for your agricultural operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Sprout className="w-8 h-8" />,
                title: "Crop Intelligence",
                description: "AI-powered recommendations for optimal crop selection and planting schedules.",
                stats: ["500+ Varieties", "97% Accuracy"]
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Satellite Monitoring",
                description: "Real-time field analysis with high-resolution satellite imagery.",
                stats: ["3m Resolution", "Daily Updates"]
              },
              {
                icon: <Sun className="w-8 h-8" />,
                title: "Weather Analytics",
                description: "Hyper-local weather forecasting and climate analysis.",
                stats: ["1km Precision", "14 Days Forecast"]
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Yield Optimization",
                description: "Maximize productivity with predictive modeling algorithms.",
                stats: ["35% Increase", "25% Cost Reduction"]
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-gray-50 hover:bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-green-100">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <div className="flex space-x-4">
                  {feature.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-lg font-bold text-green-600">{stat.split(' ')[0]}</div>
                      <div className="text-xs text-gray-500">{stat.split(' ').slice(1).join(' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Process */}
      <section 
        id="solutions" 
        className={`py-24 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-1000 ${
          isVisible.solutions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              From Data to{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our streamlined process transforms complex agricultural data into actionable insights you can implement immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: <MapPin className="w-8 h-8" />,
                title: "Farm Setup",
                description: "Input your farm details through our intuitive dashboard.",
                features: ["GPS Integration", "Smart Import", "Historical Data"]
              },
              {
                step: "2",
                icon: <BarChart3 className="w-8 h-8" />,
                title: "AI Analysis",
                description: "Machine learning analyzes satellite data and weather patterns.",
                features: ["Multi-source Data", "Pattern Recognition", "Predictive Models"]
              },
              {
                step: "3",
                icon: <Target className="w-8 h-8" />,
                title: "Recommendations",
                description: "Receive personalized crop and resource recommendations.",
                features: ["Custom Reports", "Action Plans", "Risk Assessment"]
              },
              {
                step: "4",
                icon: <Shield className="w-8 h-8" />,
                title: "Monitoring",
                description: "Continuous monitoring with real-time alerts and updates.",
                features: ["Live Alerts", "Progress Tracking", "24/7 Support"]
              }
            ].map((step, index) => (
              <div key={index} className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 mt-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                <div className="space-y-2">
                  {step.features.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section 
        id="technology" 
        className={`py-24 bg-white transition-all duration-1000 ${
          isVisible.technology ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Cutting-Edge{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Technology
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Built on advanced machine learning, satellite technology, and agricultural science to deliver unprecedented accuracy.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <Globe className="w-6 h-6" />,
                    title: "Satellite Integration",
                    description: "Multi-spectral imagery from leading providers"
                  },
                  {
                    icon: <BarChart3 className="w-6 h-6" />,
                    title: "AI & Machine Learning",
                    description: "Advanced algorithms trained on millions of data points"
                  },
                  {
                    icon: <Droplets className="w-6 h-6" />,
                    title: "IoT Sensors",
                    description: "Real-time soil and weather monitoring systems"
                  }
                ].map((tech, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                      {tech.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{tech.title}</h4>
                      <p className="text-gray-600">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Farm Analytics Dashboard</h3>
                <div className="px-3 py-1 bg-green-500 rounded-full text-sm font-medium">Live</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-400 mb-1">68%</div>
                  <div className="text-gray-400 text-sm">Soil Moisture</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-400 mb-1">92%</div>
                  <div className="text-gray-400 text-sm">Crop Health</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">Low</div>
                  <div className="text-gray-400 text-sm">Weather Risk</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-400 mb-1">85%</div>
                  <div className="text-gray-400 text-sm">Growth Rate</div>
                </div>
              </div>
              
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 w-3/4 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-400 mt-2">Season Progress: 75%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section 
        id="testimonials" 
        className={`py-24 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-1000 ${
          isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Farmers Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of farmers who have transformed their operations and achieved remarkable results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Organic Farm Owner",
                location: "California, USA",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b566?w=150&h=150&fit=crop&crop=face&q=80",
                rating: 5,
                text: "AgroTech Pro transformed our 500-acre organic farm. We've seen a 40% increase in yield while reducing water usage by 30%. The AI recommendations are incredibly accurate."
              },
              {
                name: "Michael Chen",
                role: "Rice Farmer",
                location: "Punjab, India",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&q=80",
                rating: 5,
                text: "The satellite monitoring helped us detect pest issues 2 weeks earlier than usual. This early warning system saved our entire crop and increased our profit by 25%."
              },
              {
                name: "Emily Rodriguez",
                role: "Sustainable Agriculture",
                location: "Texas, USA",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&q=80",
                rating: 5,
                text: "The weather analytics feature is a game-changer. We now plan our planting and harvesting with confidence, resulting in consistent quality crops year after year."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{testimonial.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 leading-relaxed italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>

          {/* Results Grid */}
          <div className="grid md:grid-cols-4 gap-8 mt-20">
            {[
              { icon: <TrendingUp className="w-8 h-8" />, metric: "35%", label: "Average Yield Increase" },
              { icon: <Target className="w-8 h-8" />, metric: "42%", label: "Resource Efficiency" },
              { icon: <Shield className="w-8 h-8" />, metric: "65%", label: "Risk Reduction" },
              { icon: <Users className="w-8 h-8" />, metric: "15,000+", label: "Satisfied Farmers" }
            ].map((result, index) => (
              <div key={index} className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-4">
                  {result.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{result.metric}</div>
                <div className="text-gray-600">{result.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
            Join thousands of farmers already using AI to maximize their yields and profits. Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button className="bg-white text-green-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-3">
              <span>Start Free Trial</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all flex items-center justify-center space-x-3">
              <PhoneCall className="w-6 h-6" />
              <span>Schedule Demo</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm opacity-80">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>Free 30-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">AgroTech Pro</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                Empowering farmers worldwide with AI-driven agricultural intelligence to build sustainable and profitable farming operations.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Platform</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Integration</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Training</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AgroTech Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Components */}
      <Login
        isOpen={activeModal === 'login'}
        onClose={closeModal}
        onSwitchToRegister={switchToRegister}
      />
      <Register
        isOpen={activeModal === 'register'}
        onClose={closeModal}
        onSwitchToLogin={switchToLogin}
      />

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;