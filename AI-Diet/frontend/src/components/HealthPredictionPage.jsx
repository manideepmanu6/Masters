import React, { useState, useEffect } from "react";
import axios from "axios";
import '../css/healthPrediction.css'; // ✅ Import CSS

function HealthPredictionPage() {
  const [prediction, setPrediction] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5001/api/get-profiles', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.profiles.length > 0) {
        setProfile(response.data.profiles[0]); // Get latest profile
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    }
  };

  const handlePredictDeficiency = async () => {
    if (!profile) {
      alert("Profile not loaded yet!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5002/api/predict-deficiency", {
        age: profile.age,
        gender: profile.gender,
        bmi: profile.bmi,
        calories: profile.weight * 30
      });

      console.log("✅ AI Deficiency Prediction:", response.data.prediction);
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error("❌ Error predicting deficiency:", error);
    }
  };

  return (
    <div className="health-container">
      <div className="health-card">
        <h1 className="health-title">🧬 Health Deficiency Prediction</h1>

        <button onClick={handlePredictDeficiency} className="predict-button">
          Predict Deficiency
        </button>

        {prediction && (
          <div className="prediction-result">
            {prediction}
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthPredictionPage;
