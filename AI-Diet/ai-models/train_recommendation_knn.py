import pandas as pd
from sklearn.neighbors import NearestNeighbors
import joblib
import os

# Paths
DATA_PATH = 'data/All_Diets.csv'
MODEL_DIR = 'model'
MODEL_FILE = 'knn_model.pkl'
REFERENCE_FILE = 'reference_data.csv'

# Create model folder if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

# Load merged food data
df = pd.read_csv(DATA_PATH)

# Quick clean-up
df = df.dropna(subset=['Fat', 'Carbohydrates', 'Caloric Value'])

# ✅ ENFORCE correct feature order: Fat, Carbs, Calories
features = df[['Fat', 'Carbohydrates', 'Caloric Value']]

# Train the KNN model
knn_model = NearestNeighbors(n_neighbors=5, algorithm='auto')
knn_model.fit(features)

# Save the trained KNN model
joblib.dump(knn_model, os.path.join(MODEL_DIR, MODEL_FILE))

# Save the reference data
df[['food', 'Fat', 'Carbohydrates', 'Caloric Value']].to_csv(
    os.path.join(MODEL_DIR, REFERENCE_FILE), index=False
)

print("✅ KNN Recommendation model retrained and saved successfully!")
