"""
SugarGuard CareBridge — Reduced 8-Feature Model
Trains on ONLY the 8 fields that will exist in the actual user-facing form,
so there is no hidden default-filling for features the user never answers.

Selected 8 fields (clinically meaningful + present in CDC dataset):
Age, Sex, BMI, HighBP, HighChol, Smoker, PhysActivity, GenHlth
"""

import json
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, roc_auc_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report,
)

DATA_PATH = "data/diabetes_binary_health_indicators_BRFSS2015.csv"
TARGET_COL = "Diabetes_binary"
SELECTED_FEATURES = ["Age", "Sex", "BMI", "HighBP", "HighChol", "Smoker", "PhysActivity", "GenHlth"]
RANDOM_STATE = 42

df = pd.read_csv(DATA_PATH)
df = df.drop_duplicates()

X = df[SELECTED_FEATURES]
y = df[TARGET_COL]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, stratify=y, random_state=RANDOM_STATE
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

model = LogisticRegression(class_weight="balanced", max_iter=2000, random_state=RANDOM_STATE)
model.fit(X_train_s, y_train)

y_pred = model.predict(X_test_s)
y_proba = model.predict_proba(X_test_s)[:, 1]

metrics = {
    "accuracy": accuracy_score(y_test, y_pred),
    "roc_auc": roc_auc_score(y_test, y_proba),
    "precision": precision_score(y_test, y_pred),
    "recall": recall_score(y_test, y_pred),
    "f1_score": f1_score(y_test, y_pred),
}
print("===== 8-FEATURE MODEL METRICS =====")
for k, v in metrics.items():
    print(f"{k}: {v:.4f}")
print("\nConfusion matrix [[TN,FP],[FN,TP]]:", confusion_matrix(y_test, y_pred).tolist())
print(classification_report(y_test, y_pred, target_names=["No Diabetes", "Diabetes/Prediabetes"]))

coef_list = sorted(
    [{"feature": f, "coefficient": float(c)} for f, c in zip(SELECTED_FEATURES, model.coef_[0])],
    key=lambda d: abs(d["coefficient"]), reverse=True
)
print("\nCoefficients:")
for c in coef_list:
    print(f"  {c['feature']:15s} {c['coefficient']:+.4f}")

joblib.dump(model, "model_8field.pkl")
joblib.dump(scaler, "scaler_8field.pkl")
with open("coefficients_8field.json", "w") as f:
    json.dump({"intercept": float(model.intercept_[0]), "coefficients": coef_list}, f, indent=2)
with open("metrics_8field.json", "w") as f:
    json.dump({**metrics, "confusion_matrix": confusion_matrix(y_test, y_pred).tolist()}, f, indent=2)
