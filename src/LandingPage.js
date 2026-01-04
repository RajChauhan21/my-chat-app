// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ backgroundColor: 'rgba(102, 126, 234, 0.95)' }}>
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <span className="fs-3 me-2">💬</span>
            ChatWave
          </Link>
          {/* <div className="navbar-nav ms-auto">
            <Link className="nav-link btn btn-outline-light btn-sm me-2" to="/login">
              Sign In
            </Link>
            <Link className="nav-link btn btn-light btn-sm text-primary" to="/chat">
              Get Started
            </Link>
          </div> */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        {/* <div className="position-absolute w-100 h-100">
          <div className="position-absolute rounded-circle bg-white opacity-10" 
               style={{ width: '300px', height: '300px', top: '10%', left: '10%', animation: 'float 8s ease-in-out infinite' }}></div>
          <div className="position-absolute rounded-circle bg-white opacity-10" 
               style={{ width: '200px', height: '200px', top: '60%', left: '80%', animation: 'float 6s ease-in-out infinite 2s' }}></div>
          <div className="position-absolute rounded-circle bg-white opacity-10" 
               style={{ width: '150px', height: '150px', top: '80%', left: '20%', animation: 'float 10s ease-in-out infinite 1s' }}></div>
        </div> */}

        <div className="container position-relative z-2">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-content text-white">
                <h1 className="display-3 fw-bold mb-4">
                  Connect with <span className="text-warning">Everyone</span>
                </h1>
                <p className="lead mb-4 fs-5">
                  Experience seamless real-time messaging with ChatWave. 
                  Fast, secure, and beautifully designed for modern conversations.
                </p>
                <div className="hero-buttons d-flex flex-wrap gap-3 mb-5">
                  <Link to="/chat" className="btn btn-warning btn-lg px-4 py-3 fw-bold">
                    Start Chatting Now 🚀
                  </Link>
                  <a href="#features" className="btn btn-outline-light btn-lg px-4 py-3">
                    Learn More
                  </a>
                </div>
                <div className="hero-stats d-flex flex-wrap gap-5">
                  <div className="stat-item">
                    <h3 className="fw-bold text-warning">10K+</h3>
                    <small>Active Users</small>
                  </div>
                  <div className="stat-item">
                    <h3 className="fw-bold text-warning">99.9%</h3>
                    <small>Uptime</small>
                  </div>
                  <div className="stat-item">
                    <h3 className="fw-bold text-warning">⚡</h3>
                    <small>Real-time</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image text-center">
                <div className="mockup-chat bg-white rounded-4 shadow-lg p-4 mx-auto" style={{ maxWidth: '400px' }}>
                  <div className="chat-header bg-primary text-white rounded-3 p-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="avatar bg-warning rounded-circle me-3" style={{ width: '40px', height: '40px' }}></div>
                      <div>
                        <h6 className="mb-0">Group Chat</h6>
                        <small>3 online</small>
                      </div>
                    </div>
                  </div>
                  <div className="chat-messages">
                    <div className="message received mb-2">
                      <div className="bg-light rounded-3 p-2 mb-1">
                        <small>Hey everyone! 👋</small>
                      </div>
                      <small className="text-muted">Alice, 2 min ago</small>
                    </div>
                    <div className="message sent mb-2 text-end">
                      <div className="bg-primary text-white rounded-3 p-2 mb-1">
                        <small>Hello Alice! How's it going? 😊</small>
                      </div>
                      <small className="text-muted">You, 1 min ago</small>
                    </div>
                    <div className="message received">
                      <div className="bg-light rounded-3 p-2 mb-1">
                        <small>Working on the new project! 💻</small>
                      </div>
                      <small className="text-muted">Bob, just now</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">Why Choose ChatWave?</h2>
            <p className="lead text-muted">Everything you need for modern communication</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card text-center p-4 h-100 bg-white rounded-4 shadow-sm">
                <div className="feature-icon bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <span className="fs-2 text-white">⚡</span>
                </div>
                <h4 className="fw-bold mb-3">Lightning Fast</h4>
                <p className="text-muted">
                  Real-time messaging with WebSocket technology. No delays, just instant communication.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card text-center p-4 h-100 bg-white rounded-4 shadow-sm">
                <div className="feature-icon bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <span className="fs-2 text-white">🔒</span>
                </div>
                <h4 className="fw-bold mb-3">Secure & Private</h4>
                <p className="text-muted">
                  End-to-end encryption and secure protocols to keep your conversations private.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card text-center p-4 h-100 bg-white rounded-4 shadow-sm">
                <div className="feature-icon bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <span className="fs-2 text-white">🎨</span>
                </div>
                <h4 className="fw-bold mb-3">Beautiful Design</h4>
                <p className="text-muted">
                  Clean, modern interface that works perfectly on all your devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">How It Works</h2>
            <p className="lead text-muted">Get started in just 3 simple steps</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 fw-bold fs-2"
                   style={{ width: '60px', height: '60px' }}>1</div>
              <h4 className="fw-bold mb-3">Sign Up</h4>
              <p className="text-muted">Create your account in seconds with our quick login</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="step-number bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 fw-bold fs-2"
                   style={{ width: '60px', height: '60px' }}>2</div>
              <h4 className="fw-bold mb-3">Connect</h4>
              <p className="text-muted">Find friends or join existing group conversations</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="step-number bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 fw-bold fs-2"
                   style={{ width: '60px', height: '60px' }}>3</div>
              <h4 className="fw-bold mb-3">Chat</h4>
              <p className="text-muted">Start messaging in real-time with anyone, anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container py-5">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold text-white mb-4">Ready to Start Chatting?</h2>
              <p className="lead text-light mb-4">
                Join thousands of users who are already enjoying seamless communication with ChatWave.
              </p>
              <Link to="/login" className="btn btn-warning btn-lg px-5 py-3 fw-bold fs-4">
                Get Started Free 🚀
              </Link>
              <p className="text-light mt-3 mb-0">No credit card required • Free forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <span className="fs-4 me-2">💬</span>
                <h5 className="mb-0 fw-bold">ChatWave</h5>
              </div>
              <p className="mb-0 mt-2 text-muted small">
                Connecting people through seamless real-time communication.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0 text-muted small">
                &copy; 2024 ChatWave. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          .feature-card, .mockup-chat {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
          }
          .hero-stats .stat-item {
            text-align: center;
          }
          .message.sent .bg-primary {
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
          }
          .navbar-brand {
            font-size: 1.5rem;
          }
        `}
      </style>
    </div>
  );
};

export default LandingPage;