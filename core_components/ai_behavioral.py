# File: core_components/ai_behavioral.py

# This script is a conceptual demonstration of AI-driven behavioral analytics
# for continuous authentication within the QR-DID framework.
# It uses a simple scikit-learn model to classify a user's behavior as
# 'legitimate' or 'anomalous' based on a few key metrics.
# This is a highly simplified model for illustrative purposes only.
# A real-world system would use a much more complex model trained on
# vast amounts of real-time data.

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import random

print("--- QR-DID Conceptual AI Behavioral Analytics Demo ---")

# --- Step 1: Generate Simulated User Data ---
# We'll create a dataset with two features:
# 1. Typing speed (characters per second)
# 2. Keystroke latency variation (standard deviation of time between key presses)
# We'll label them as 'legitimate' (0) or 'anomalous' (1)
# Note: In a real system, these would be collected from the user's device.

print("\n[1] Generating simulated user behavior data...")
X = [] # Features
y = [] # Labels (0 for legitimate, 1 for anomalous)

# Generate data for a legitimate user (low variation, fast typing)
for _ in range(100):
    typing_speed = random.uniform(2.5, 4.0) # Normal range
    latency_variation = random.uniform(0.01, 0.05) # Low variation
    X.append([typing_speed, latency_variation])
    y.append(0)

# Generate data for an anomalous user (high variation, erratic typing)
for _ in range(20):
    typing_speed = random.uniform(1.0, 5.0) # Erratic range
    latency_variation = random.uniform(0.06, 0.20) # High variation
    X.append([typing_speed, latency_variation])
    y.append(1)

X = np.array(X)
y = np.array(y)

# --- Step 2: Train the Machine Learning Model ---
# We split the data and train a simple Logistic Regression model.
# This model learns the patterns of 'legitimate' behavior.

print("\n[2] Training a simple behavioral analytics model...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

# Evaluate the model's performance
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"   -> Model training complete. Accuracy: {accuracy:.2f}")

# --- Step 3: Classify a New Access Attempt ---
# Now, we simulate a new login attempt and use the trained model to assess it.
print("\n[3] Classifying a new access attempt...")

# Simulate an access attempt with legitimate behavior
new_user_legitimate_behavior = np.array([[3.2, 0.03]])
prediction_legitimate = model.predict(new_user_legitimate_behavior)
print(f"   -> Attempt with legitimate behavior (speed: 3.2, variation: 0.03) classified as: {'Anomalous' if prediction_legitimate[0] else 'Legitimate'}")
print("      (A real system would allow this access or assign a low-risk score)")

# Simulate an access attempt with anomalous behavior (e.g., from an automated bot or a different user)
new_user_anomalous_behavior = np.array([[1.5, 0.15]])
prediction_anomalous = model.predict(new_user_anomalous_behavior)
print(f"   -> Attempt with anomalous behavior (speed: 1.5, variation: 0.15) classified as: {'Anomalous' if prediction_anomalous[0] else 'Legitimate'}")
print("      (A real system would trigger step-up authentication or block access)")

# Conclusion
print("\n--- AI Demo Complete ---")
print("This demo shows how a simple AI model can be used to add a dynamic layer of security")
print("to the QR-DID platform, moving beyond static passwords to continuous, adaptive trust.")
