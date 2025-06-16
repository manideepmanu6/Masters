# ai-models/app.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
from openai_chat import chat_with_gpt

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
knn_model = joblib.load('model/knn_model.pkl')
reference_data = pd.read_csv('model/reference_data.csv')
deficiency_model = joblib.load('model/health_predictor.pkl')

# Basic Check
@app.get("/")
async def root():
    return {"message": "✅ AI Models Server Running Successfully!"}

# 1️⃣ Recommend Diet Foods - using KNN
@app.post("/api/recommend")
async def recommend_food(request: Request):
    try:
        data = await request.json()
        target = data.get("target")

        if not target:
            return {"error": "Missing target nutrients!"}

        # Define strict order
        feature_order = ['Fat', 'Carbohydrates', 'Caloric Value']

        # Build input array in that order
        input_values = [
            target.get('Fat', 0),
            target.get('Carbohydrates', 0),
            target.get('Caloric Value', 0)
        ]

        # Create dataframe exactly matching training
        target_df = pd.DataFrame([input_values], columns=feature_order)

        print("🎯 Final target sent to KNN:", target_df)

        # Run KNN
        distances, indices = knn_model.kneighbors(target_df)

        recommended_foods = reference_data.iloc[indices[0]].to_dict(orient="records")

        return {"recommendations": recommended_foods}

    except Exception as e:
        print("❌ Error in /api/recommend:", e)
        return {"error": str(e)}


# 2️⃣ Predict Nutrient Deficiency - using ML model
@app.post("/api/predict-deficiency")
async def predict_deficiency(request: Request):
    try:
        data = await request.json()

        age = data.get('age')
        gender = data.get('gender')
        bmi = data.get('bmi')
        calories = data.get('calories')

        if None in [age, gender, bmi, calories]:
            return {"error": "Missing fields!"}

        gender_code = 0 if gender.lower() == 'male' else 1

        features = pd.DataFrame([{
            'Age': age,
            'Gender': gender_code,
            'BMI': bmi,
            'Caloric Intake (kcal/day)': calories
        }])

        prediction = deficiency_model.predict(features)[0]
        result = "⚠️ High Risk of Deficiency" if prediction == 1 else "✅ Low Risk of Deficiency"

        return {"prediction": result}

    except Exception as e:
        print("❌ Error in /api/predict-deficiency:", e)
        return {"error": "Internal Server Error"}

# 3️⃣ Chat with AI (General GPT chat)
@app.post("/api/chat")
async def chat_with_openai(request: Request):
    try:
        data = await request.json()
        message = data.get("message")

        if not message:
            return {"error": "Message is required"}

        reply = chat_with_gpt(message)
        return {"response": reply}

    except Exception as e:
        print("❌ Error in /api/chat:", e)
        return {"error": "Internal Server Error"}

# 4️⃣ Generate Meal Plan (OpenAI - dynamic plan)
@app.post("/api/meal-plan")
async def generate_meal_plan(request: Request):
    try:
        data = await request.json()
        prompt = data.get("prompt")

        if not prompt:
            return {"error": "Prompt is missing"}

        response = chat_with_gpt(prompt)

        return {"meal_plan": response}

    except Exception as e:
        print("❌ Error in /api/meal-plan:", e)
        return {"error": "Internal Server Error"}
