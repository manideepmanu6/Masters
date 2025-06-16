// backend/index.js

import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import db from './db.js'; 
import connectMongoDB from './mongo.js';
import ChatMessage from './models/ChatMessage.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import verifyToken from './middlewares/verifyToken.js';
import { chat_with_gpt } from './openai.js'; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB for chat history
await connectMongoDB();

// ====== TEST ROUTE ======
app.get("/", (req, res) => {
  res.send("✅ Backend Server is Running!");
});

// ====== AUTHENTICATION (Signup + Login) ======

// Signup API
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, age, gender) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, age, gender]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ New user created: ID=${userId}, Email=${email}`);
    res.json({ message: '✅ User created successfully!', token });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ Login success: ID=${user.id}, Email=${user.email}`);
    res.json({ token });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ====== USER PROFILE ======

// Save Profile API
app.post('/api/save-profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, age, gender, weight, height, bmi, healthConditions, dietaryRestrictions, foodAllergies } = req.body;

    const [result] = await db.query(`
      INSERT INTO user_profiles (
        user_id, name, age, gender, weight, height, bmi, health_conditions, dietary_restrictions, allergies
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, age, gender, weight, height, bmi, healthConditions, dietaryRestrictions, foodAllergies]);

    console.log(`✅ Profile saved: ProfileID=${result.insertId} for UserID=${userId}`);
    res.json({ message: '✅ Profile saved successfully!', profileId: result.insertId });
  } catch (error) {
    console.error('❌ Error saving user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Profiles for Logged-in User
app.get('/api/get-profiles', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [profiles] = await db.query(
      'SELECT id, name, age, gender, weight, height, bmi, health_conditions, dietary_restrictions, allergies, created_at FROM user_profiles WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({ profiles });
  } catch (error) {
    console.error('❌ Error fetching user profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ====== AI INTEGRATION ======

// POST - Get Food Recommendations from AI Microservice
app.post('/api/recommend', verifyToken, async (req, res) => {
  try {
    const { caloricValue, fat, carbohydrates } = req.body;

    const response = await axios.post('http://localhost:5002/api/recommend', {
      caloricValue,
      fat,
      carbohydrates
    });

    res.json({ recommendations: response.data.recommendations });
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error.message);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// POST - Predict Nutrient Deficiency using AI Microservice
app.post('/api/predict-deficiency', verifyToken, async (req, res) => {
  try {
    const { protein, fat, carbs, calories } = req.body;

    const response = await axios.post('http://localhost:5002/api/predict-deficiency', {
      protein,
      fat,
      carbs,
      calories
    });

    res.json({ prediction: response.data.prediction });
  } catch (error) {
    console.error('❌ Error predicting deficiency:', error.message);
    res.status(500).json({ error: "Failed to predict deficiencies" });
  }
});

// ====== MEAL PLAN GENERATION ======

// New Dynamic Meal Plan using AI GPT
app.get('/api/meal-plan/:profileId', verifyToken, async (req, res) => {
  const { profileId } = req.params;

  try {
    // 1. Fetch user's profile from MySQL
    const [profiles] = await db.query('SELECT * FROM user_profiles WHERE id = ?', [profileId]);

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profiles[0];

    // 2. Prepare input message for GPT
    const promptMessage = `
      Generate a 7-day meal plan for the following profile:
      - Name: ${profile.name}
      - Age: ${profile.age}
      - Gender: ${profile.gender}
      - Weight: ${profile.weight} kg
      - Height: ${profile.height} cm
      - BMI: ${profile.bmi}
      - Health Conditions: ${profile.health_conditions}
      - Dietary Restrictions: ${profile.dietary_restrictions}
      - Allergies: ${profile.allergies}
      
      The meal plan should be healthy, varied, and personalized for these conditions.
      Return the output in JSON array format like:
      [
        { "day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "..." },
        ...
      ]
      Only output the JSON array, no extra text.
    `;

    // 3. Call the AI Microservice (FastAPI backend)
    const response = await axios.post('http://localhost:5002/api/meal-plan', {
      prompt: promptMessage
    });

    const rawMealPlan = response.data.meal_plan;

    // 4. Parse meal plan properly
    let mealPlanArray = [];

    try {
      if (typeof rawMealPlan === 'string') {
        mealPlanArray = JSON.parse(rawMealPlan);
      } else if (Array.isArray(rawMealPlan)) {
        mealPlanArray = rawMealPlan;
      } else {
        throw new Error('Meal plan is not in a valid format');
      }
    } catch (err) {
      console.error('❌ Failed to parse meal plan:', err.message);
      return res.status(500).json({ error: 'Failed to parse meal plan from AI response' });
    }

    // 5. Send clean array to frontend
    res.json({ profileId, mealPlan: mealPlanArray });
  } catch (error) {
    console.error('❌ Error generating dynamic meal plan:', error.message);
    res.status(500).json({ error: 'Failed to generate meal plan' });
  }
});

  
// ====== CHATBOT (OPENAI GPT) ======
app.post('/api/chat', verifyToken, async (req, res) => {
  const { message } = req.body;

  try {
    const aiReply = await chat_with_gpt(message); // ✅ GPT-4 smart reply

    // ✅ Save the chat into MongoDB properly
    await ChatMessage.create({
      userMessage: message,
      aiResponse: aiReply  // ✅ Not response.data.aiResponse, use correct value
    });

    res.json({ aiResponse: aiReply });

  } catch (error) {
    console.error('❌ Error chatting with bot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ====== SERVER START ======
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
