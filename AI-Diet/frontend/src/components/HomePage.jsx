import React from 'react';
import { Link } from 'react-router-dom';
import '../css/home.css'; // ✅ Import the CSS

function HomePage() {
  return (
    <div className="home-container">
      <h1 className="home-title">🏡 Welcome to Smart Diet Recommendation App</h1>
      <p className="home-subtitle">Get personalized meal plans and track your health!</p>

      <div className="home-buttons">
        <Link
          to="/signup"
          className="home-button"
        >
          Signup
        </Link>

        <Link
          to="/login"
          className="home-button login-button"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
