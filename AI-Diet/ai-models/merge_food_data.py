# ai-models/merge_food_data.py

import pandas as pd
import os

# List of your uploaded CSV files
file_paths = [
    'data/FOOD-DATA-GROUP1.csv',
    'data/FOOD-DATA-GROUP2.csv',
    'data/FOOD-DATA-GROUP3.csv',
    'data/FOOD-DATA-GROUP4.csv',
    'data/FOOD-DATA-GROUP5.csv',
]

# Load and combine
dfs = []
for path in file_paths:
    df = pd.read_csv(path)
    dfs.append(df)

# Merge into one DataFrame
merged_df = pd.concat(dfs, ignore_index=True)

# Keep only useful columns
columns_to_keep = ['food', 'Caloric Value', 'Fat', 'Carbohydrates']
merged_df = merged_df[columns_to_keep]

# Drop rows with missing important values
merged_df = merged_df.dropna()

# Save to All_Diets.csv
os.makedirs('model', exist_ok=True)  # Create model/ folder if doesn't exist
merged_df.to_csv('data/All_Diets.csv', index=False)

print("✅ All food groups merged and saved to data/All_Diets.csv successfully!")
