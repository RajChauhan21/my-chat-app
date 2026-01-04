// src/components/SignupLoginPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    dateOfBirth: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      userName: formData.username,
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`,
      dateOfBirth: formData.dateOfBirth,
      password: formData.password,
    };

    console.log(userData)
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/create",
        userData
      );
      console.log(response.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      console.log(error.response.data);
      Swal.fire({
        icon:'error',
        title:'Sign Up Failed',
        text: error.response.data || 'An error occurred during sign up. Please try again.',
      })
    }
     onLogin(null);
    navigate("/");
    setIsLoading(false);
  };

  const Login = async()=>{
    setIsLoading(true);
    const userData = {
      email: formData.email,
      password: formData.password
    }

    try {
      const response = await axios.post('http://localhost:8080/api/users/login', userData)
      
      console.log(response.data);
      onLogin(response.data);

      if(response.status ===202){
        navigate("/chat");
      }
    } catch (error) {
      console.log(error);
      navigate("/");
    }
    setIsLoading(false);
  }

  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "auto",
        padding: "20px 0",
      }}
    >
      {/* Animated Background */}
      <div className="position-absolute w-100 h-100">
        <div
          className="position-absolute rounded-circle bg-white opacity-10"
          style={{
            width: "200px",
            height: "200px",
            top: "10%",
            left: "10%",
            animation: "float 8s ease-in-out infinite",
          }}
        ></div>
        <div
          className="position-absolute rounded-circle bg-white opacity-10"
          style={{
            width: "150px",
            height: "150px",
            top: "60%",
            left: "80%",
            animation: "float 6s ease-in-out infinite 2s",
          }}
        ></div>
        <div
          className="position-absolute rounded-circle bg-white opacity-10"
          style={{
            width: "100px",
            height: "100px",
            top: "80%",
            left: "20%",
            animation: "float 10s ease-in-out infinite 1s",
          }}
        ></div>
      </div>

      <div className="col-12 col-md-8 col-lg-5 col-xl-4">
        <div
          className="card shadow-lg border-0"
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="card-body p-4">
            {/* Header - More Compact */}
            <div className="text-center mb-3">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="fs-2 me-2">💬</div>
                <h2
                  className="h4 fw-bold mb-0"
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ChatWave
                </h2>
              </div>
              <p className="text-muted mb-0 small">
                {isLogin ? "Welcome back!" : "Join our community!"}
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className="row mb-3">
              <div className="col-6">
                <button
                  className={`btn w-100 ${
                    isLogin ? "btn-primary" : "btn-outline-primary"
                  } btn-sm`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
              </div>
              <div className="col-6">
                <button
                  className={`btn w-100 ${
                    !isLogin ? "btn-primary" : "btn-outline-primary"
                  } btn-sm`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form */}
            <form>
              <div className="row g-2">
                {/* Name Fields - Only show in Sign Up */}
                {!isLogin && (
                  <>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required={!isLogin}
                        />
                        <label htmlFor="firstName" className="small">
                          First Name
                        </label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required={!isLogin}
                        />
                        <label htmlFor="lastName" className="small">
                          Last Name
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Username */}
                {!isLogin && (
                <div className="col-12">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="username"
                      name="username"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="username" className="small">
                      Username
                    </label>
                  </div>
                </div>
                )}

                {/* Email - Only show in Sign Up */}
                
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        id="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                      <label htmlFor="email" className="small">
                        Email Address
                      </label>
                    </div>
                  </div>
                

                {/* Date of Birth - Only show in Sign Up */}
                {!isLogin && (
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                      <label htmlFor="dateOfBirth" className="small">
                        Date of Birth
                      </label>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="col-12">
                  <div className="form-floating">
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="password" className="small">
                      Password
                    </label>
                  </div>
                </div>

                {/* Confirm Password - Only show in Sign Up */}
                {!isLogin && (
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                      <label htmlFor="confirmPassword" className="small">
                        Confirm Password
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Remember Me & Forgot Password - Only show in Login */}
              {isLogin && (
                <div className="row align-items-center mt-2">
                  <div className="col-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />
                      <label
                        className="form-check-label small text-muted"
                        htmlFor="rememberMe"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <a
                      href="#forgot"
                      className="small text-primary text-decoration-none"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="d-grid mt-3">
                <button
                  type="submit"
                  className="btn btn-primary py-2 fw-bold"
                  disabled={isLoading} onClick={isLogin ? Login : handleSubmit}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              {/* Terms Agreement - Only show in Sign Up */}
              {!isLogin && (
                <div className="text-center mt-2">
                  <small className="text-muted">
                    By creating an account, you agree to our{" "}
                    <a
                      href="#terms"
                      className="text-primary text-decoration-none"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#privacy"
                      className="text-primary text-decoration-none"
                    >
                      Privacy Policy
                    </a>
                  </small>
                </div>
              )}
            </form>

            {/* Social Login - More Compact */}
            <div className="text-center mt-3">
              <div className="position-relative">
                <hr className="my-3" />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">
                  Or continue with
                </span>
              </div>
              <div className="row g-2 mt-3">
                <div className="col-4">
                  <button className="btn btn-outline-dark w-100 btn-sm">
                    <i className="bi bi-google"></i>
                  </button>
                </div>
                <div className="col-4">
                  <button className="btn btn-outline-primary w-100 btn-sm">
                    <i className="bi bi-facebook"></i>
                  </button>
                </div>
                <div className="col-4">
                  <button className="btn btn-outline-dark w-100 btn-sm">
                    <i className="bi bi-github"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-3">
              <Link to="/" className="text-primary text-decoration-none small">
                <i className="bi bi-arrow-left me-1"></i>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add floating animation styles */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          .form-floating>.form-control:focus~label,
          .form-floating>.form-control:not(:placeholder-shown)~label {
            color: #667eea;
            font-size: 0.8rem;
          }
          .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          .form-control-sm {
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
          .form-floating>.form-control-sm~label {
            padding: 0.5rem 0.75rem;
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
          }
          .btn-primary:hover {
            background: linear-gradient(135deg, #5a6fd8, #6a4190);
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
          }
          .card-body {
            padding: 1.5rem;
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
