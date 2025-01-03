import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import "../styles/Register.css";

const Register = () => {
  const [user, setUser] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.fullName || !user.username || !user.email || !user.password) {
        alert("All fields are required");
        return;
    }
    try {
      const response = await axios.post("http://localhost:8080/api/users/register", user);
      alert("Registration successful! You can now log in.");
      console.log(response.data);
      navigate("/Login");
    } catch (error) {
      console.error("Error response:", error.response);
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-page-container">
      <h2 className="register-title">"Align your budget, achieve your goals."</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-form-field">
          <label htmlFor="fullName" className="register-label">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={user.fullName}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div className="register-form-field">
          <label htmlFor="username" className="register-label">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div className="register-form-field">
          <label htmlFor="email" className="register-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div className="register-form-field">
          <label htmlFor="password" className="register-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div className="login-link">
          <p>
            You already have an account?{" "}
            <Link to="/login" className="link-login">
              Get in
            </Link>
          </p>
        </div>  
        <button type="submit" className="register-button">Register</button>
      </form>
    </div>
  );
};

export default Register;
