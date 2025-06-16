import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register chart elements
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function DashboardInsights({ profileId }) {
  const [mealPlan, setMealPlan] = useState([]);
  const [foodCounts, setFoodCounts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/meal-plan/${profileId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const data = response.data.mealPlan;
        setMealPlan(data);

        if (Array.isArray(data)) {
          let foodItems = [];

          data.forEach(day => {
            if (day.breakfast) foodItems.push(day.breakfast.toLowerCase());
            if (day.lunch) foodItems.push(day.lunch.toLowerCase());
            if (day.dinner) foodItems.push(day.dinner.toLowerCase());
          });

          const foodCounter = {};

          foodItems.forEach(item => {
            if (item.includes("chicken")) foodCounter["Chicken"] = (foodCounter["Chicken"] || 0) + 1;
            if (item.includes("salmon")) foodCounter["Salmon"] = (foodCounter["Salmon"] || 0) + 1;
            if (item.includes("rice")) foodCounter["Rice"] = (foodCounter["Rice"] || 0) + 1;
            if (item.includes("broccoli")) foodCounter["Broccoli"] = (foodCounter["Broccoli"] || 0) + 1;
            if (item.includes("banana")) foodCounter["Banana"] = (foodCounter["Banana"] || 0) + 1;
            if (item.includes("yogurt")) foodCounter["Yogurt"] = (foodCounter["Yogurt"] || 0) + 1;
          });

          setFoodCounts(foodCounter);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meal plan for insights:', error);
        setLoading(false);
      }
    };

    if (profileId) fetchMealPlan();
  }, [profileId]);

  // Prepare chart data
  const pieData = {
    labels: Object.keys(foodCounts),
    datasets: [
      {
        label: 'Food Frequency',
        data: Object.values(foodCounts),
        backgroundColor: [
          '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: Object.keys(foodCounts),
    datasets: [
      {
        label: 'Number of Occurrences',
        data: Object.values(foodCounts),
        backgroundColor: '#36a2eb',
      },
    ],
  };

  return (
    <div className="insights-container">
      <h2 className="insights-header">📊 Meal Plan Insights</h2>

      {loading ? (
        <p>Loading insights...</p>
      ) : (
        <>
          {Object.keys(foodCounts).length > 0 ? (
            <>
              <div className="chart-container">
                <h3>🥗 Food Distribution (Pie Chart)</h3>
                <Pie data={pieData} />
              </div>

              <div className="chart-container">
                <h3>🍽️ Food Occurrence (Bar Graph)</h3>
                <Bar data={barData} />
              </div>
            </>
          ) : (
            <p>No insights available. Generate a meal plan first!</p>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardInsights;
