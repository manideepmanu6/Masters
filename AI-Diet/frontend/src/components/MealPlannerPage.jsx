import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/mealplanner.css';

function MealPlannerPage() {
  const { profileId } = useParams();
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ for error handling

  const generateMealPlan = async () => {
    try {
      setLoading(true);
      setError(null); // reset error before fetching

      const response = await axios.get(`http://localhost:5001/api/meal-plan/${profileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      const mealPlanData = response.data.mealPlan;

      if (Array.isArray(mealPlanData)) {
        setMealPlan(mealPlanData);
      } else {
        throw new Error('Invalid meal plan format from server');
      }
    } catch (error) {
      console.error('❌ Error fetching meal plan:', error);
      setError('Failed to generate meal plan. Please try again!');
      setMealPlan([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      generateMealPlan();
    }
  }, [profileId]);

  return (
    <div className="mealplanner-container">
      <h1 className="mealplanner-header">🍽️ Personalized Meal Plan</h1>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p className="loading-text">⏳ Generating your meal plan...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      ) : (
        <div className="meal-grid">
          {mealPlan.length > 0 ? (
            mealPlan.map((dayPlan, index) => (
              <div key={index} className="meal-card">
                <h2 className="meal-day">{dayPlan.day}</h2>
                <p className="meal-item">🥣 <strong>Breakfast:</strong> {dayPlan.breakfast}</p>
                <p className="meal-item">🍛 <strong>Lunch:</strong> {dayPlan.lunch}</p>
                <p className="meal-item">🍽️ <strong>Dinner:</strong> {dayPlan.dinner}</p>
              </div>
            ))
          ) : (
            <p className="loading-text">No meal plan found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MealPlannerPage;
