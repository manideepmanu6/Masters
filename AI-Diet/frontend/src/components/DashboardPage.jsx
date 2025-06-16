import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/dashboard.css'; // ✅ Import your CSS

function DashboardPage() {
  const navigate = useNavigate();
  const [latestProfileId, setLatestProfileId] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/get-profiles', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        });

        const profiles = response.data.profiles;

        if (profiles.length > 0) {
          setLatestProfileId(profiles[0].id); // ✅ Get the most recently created profile
        } else {
          console.log("No profiles found for user.");
        }
      } catch (error) {
        console.error("❌ Error fetching profiles:", error);
      }
    };

    fetchProfiles();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMealPlanClick = () => {
    if (latestProfileId) {
      console.log("Navigating to meal plan with profileId:", latestProfileId);
      navigate(`/meal-plan/${latestProfileId}`);
    } else {
      alert("Please create a profile first!");
      navigate('/profile'); // redirect user to create profile if none exists
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">🎯 Your Personal Dashboard</h1>

        <div className="dashboard-grid">
          <button
            onClick={() => navigate('/profile')}
            className="dashboard-button"
          >
            📄 View / Update Profile
          </button>

          <button
            onClick={() => navigate('/recommendations')}
            className="dashboard-button"
          >
            📋 Diet Recommendations
          </button>

          <button
            onClick={handleMealPlanClick} // ✅ use the correct handler
            className="dashboard-button"
          >
            🥗 Meal Plan Generator
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="dashboard-button"
          >
            💬 Chat with AI
          </button>

          <button
            onClick={handleLogout}
            className="dashboard-button logout-button"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
