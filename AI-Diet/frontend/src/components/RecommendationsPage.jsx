import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/recommendations.css"; // ✅ Import the CSS here

function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found!");
        return;
      }

      const response = await axios.get('http://localhost:5001/api/get-profiles', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.profiles.length > 0) {
        setProfile(response.data.profiles[0]);
      } else {
        console.warn("No profiles found.");
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    }
  };

  const handleRecommend = async () => {
    if (!profile) {
      alert("Please complete your health profile first!");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5002/api/recommend", {
        target: {
          Fat: profile.weight / 3,
          Carbohydrates: profile.weight / 2,
          "Caloric Value": profile.bmi * 80
        }
      });

      if (response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        console.log("✅ Recommendations received:", response.data.recommendations);
      } else if (response.data.error) {
        console.error("❌ AI Server Error:", response.data.error);
        alert("❌ AI Model Server Error: " + response.data.error);
      } else {
        console.warn("No recommendations found.");
      }

    } catch (error) {
      console.error("❌ Error fetching recommendations:", error);
      alert("Failed to get recommendations. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-container">
      <h1 className="recommendations-header">🍏 AI-Based Diet Recommendations</h1>

      <button
        onClick={handleRecommend}
        className="recommend-button"
        disabled={loading}
      >
        {loading ? "Fetching..." : "🎯 Get Recommendations"}
      </button>

      {loading && <p className="loading-text">⏳ Loading recommendations...</p>}

      {recommendations.length > 0 && (
        <div className="recommend-grid">
          {recommendations.map((food, idx) => (
            <div key={idx} className="food-card">
              <h2 className="food-name">🍽 {food.food}</h2>
              <p className="food-info"><strong>Calories:</strong> {food["Caloric Value"]} kcal</p>
              <p className="food-info"><strong>Fat:</strong> {food.Fat}g</p>
              <p className="food-info"><strong>Carbs:</strong> {food.Carbohydrates}g</p>
            </div>
          ))}
        </div>
      )}

      {recommendations.length === 0 && !loading && (
        <p className="empty-text">No recommendations yet. Click the button above! 🚀</p>
      )}
    </div>
  );
}

export default RecommendationsPage;
