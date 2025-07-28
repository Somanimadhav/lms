import React, { useState } from "react";
import axios from "../axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import "../style/login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("/auth/register", formData);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Register</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="login-input"
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="login-input"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="login-input"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
            className="login-input"
          />
          <button type="submit" className="login-button">
            Register
          </button>
        </form>
        <div className="login-register-link">
          Already registered?{" "}
          <Link to="/login" className="register-link">
            Login here!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
