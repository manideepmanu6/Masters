import React from 'react';
import { Link } from 'react-router-dom';
import '../css/error.css'; // ✅ Import your CSS

function ErrorPage() {
  return (
    <div className="error-container">
      <h1 className="error-title">404</h1>
      <p className="error-subtitle">⚠️ Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="error-link">
        Go Back Home
      </Link>
    </div>
  );
}

export default ErrorPage;
