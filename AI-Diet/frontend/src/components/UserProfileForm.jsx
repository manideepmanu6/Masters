import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../css/profileform.css"; // ✅ Add CSS

function UserProfileForm() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    bmi: '',
    healthConditions: [],
    dietaryRestrictions: '',
    foodAllergies: ''
  });

  const healthOptions = [
    'Diabetes', 'Hypertension', 'Kidney Disease',
    'Celiac Disease', 'Lactose Intolerance', 'Weight Management'
  ];

  const conditionToRestriction = {
    "Diabetes": "Low sugar, Low glycemic index",
    "Hypertension": "Low sodium, Heart-friendly",
    "Kidney Disease": "Low potassium, Low phosphorus",
    "Celiac Disease": "Gluten-free",
    "Lactose Intolerance": "Dairy-free",
    "Weight Management": "Calorie-controlled"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'weight' || name === 'height') {
      calculateBMI(name === 'weight' ? value : formData.weight, name === 'height' ? value : formData.height);
    }
  };

  const handleHealthConditionChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      let updatedConditions = checked
        ? [...prev.healthConditions, value]
        : prev.healthConditions.filter((c) => c !== value);

      const restrictionSet = new Set();
      updatedConditions.forEach((cond) => {
        if (conditionToRestriction[cond]) {
          restrictionSet.add(conditionToRestriction[cond]);
        }
      });

      return {
        ...prev,
        healthConditions: updatedConditions,
        dietaryRestrictions: Array.from(restrictionSet).join(', ')
      };
    });
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const userProfile = {
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      height: formData.height,
      bmi: formData.bmi,
      healthConditions: formData.healthConditions.join(', '),
      dietaryRestrictions: formData.dietaryRestrictions,
      foodAllergies: formData.foodAllergies
    };

    try {
      const response = await axios.post('http://localhost:5001/api/save-profile', userProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data.message);

      localStorage.setItem('profileId', response.data.profileId);
      alert("✅ Profile saved successfully!");
      navigate('/dashboard');
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      alert("❌ Failed to save profile.");
    }
  };

  return (
    <div className="profile-form-container">
      <div className="profile-form-card">
        <h1 className="profile-form-title">🩺 Enter Your Health Profile</h1>

        <form onSubmit={handleSubmit} className="profile-form">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="input-field" required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="input-field" required />

          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} required />
              Male
            </label>
            <label className="radio-label">
              <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} />
              Female
            </label>
            <label className="radio-label">
              <input type="radio" name="gender" value="Other" checked={formData.gender === 'Other'} onChange={handleChange} />
              Other
            </label>
          </div>

          <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} className="input-field" required />
          <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} className="input-field" required />
          <input type="text" name="bmi" placeholder="BMI (auto-calculated)" value={formData.bmi} disabled className="input-field bg-gray-100" />

          <div className="checkbox-group">
            <p className="font-semibold">Health Conditions:</p>
            {healthOptions.map((condition) => (
              <label key={condition} className="radio-label">
                <input type="checkbox" value={condition} onChange={handleHealthConditionChange} checked={formData.healthConditions.includes(condition)} />
                {condition}
              </label>
            ))}
          </div>

          <input type="text" name="dietaryRestrictions" placeholder="Dietary Restrictions" value={formData.dietaryRestrictions} readOnly className="input-field bg-white" />
          <input type="text" name="foodAllergies" placeholder="Food Allergies (e.g., Peanuts)" value={formData.foodAllergies} onChange={handleChange} className="input-field" />

          <button type="submit" className="submit-button">Save Profile</button>
        </form>
      </div>
    </div>
  );
}

export default UserProfileForm;
