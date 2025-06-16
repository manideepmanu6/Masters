# ai-models/train_deficiency_predictor.py

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

# Paths
DATA_PATH = 'data/Nutritional_dataset 2.xlsx'
MODEL_DIR = 'model'
MODEL_FILE = 'health_predictor.pkl'

# Load dataset
df = pd.read_excel(DATA_PATH, sheet_name='nutritional_data')

# Create model folder if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

# Calculate BMI
df['BMI'] = df['Weight (kg)'] / (df['Height (cm)']/100)**2

# Create Deficiency Labels based on threshold rules
# (Simple rules, you can later tune based on WHO/NIH standards)

df['Vitamin_A_Deficient'] = df['Vitamin A Intake (mg/day)'].apply(lambda x: 1 if x < 0.7 else 0)
df['Iron_Deficient'] = df['Iron Intake (mg/day)'].apply(lambda x: 1 if x < 8 else 0)
df['Calcium_Deficient'] = df['Calcium Intake (mg/day)'].apply(lambda x: 1 if x < 1000 else 0)

# Combine into a single "Deficiency Risk" Label
df['Any_Deficiency'] = df[['Vitamin_A_Deficient', 'Iron_Deficient', 'Calcium_Deficient']].max(axis=1)

# Features for prediction
features = df[['Age', 'Gender', 'BMI', 'Caloric Intake (kcal/day)']]

# Encode Gender
features['Gender'] = features['Gender'].map({'Male': 0, 'Female': 1})

# Target
target = df['Any_Deficiency']

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

# Train Random Forest
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# Save the model
joblib.dump(model, os.path.join(MODEL_DIR, MODEL_FILE))

print("✅ Health Deficiency Prediction model trained and saved successfully!")
