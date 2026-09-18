"""
SugarGuard CareBridge — Baseline Model Training Script
Dataset: CDC Diabetes Health Indicators (BRFSS2015), UCI ID 891
Model: Logistic Regression (class_weight="balanced")

Flow:
1. Load CSV
2. Drop duplicate rows (BEFORE split, to avoid data leakage)
3. Stratified 80/20 train/test split
4. Scale features (StandardScaler) — needed since Logistic Regression is
   sensitive to feature scale (BMI ranges 12-98, MentHlth 0-30, etc.)
5. Train Logistic Regression with class_weight="balanced"
6. Evaluate: accuracy, ROC-AUC, precision, recall, confusion matrix
7. Save model.pkl, scaler.pkl, and coefficients.json (for explainability)

Note: coefficients describe each feature's direction/weight of contribution
to the model's prediction — NOT a medical risk statement. Do not phrase
output as "BMI increases your diabetes risk by X%".
"""

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)

# ----------------------------
# Config
# ----------------------------
DATA_PATH = "data/diabetes_binary_health_indicators_BRFSS2015.csv"
TARGET_COL = "Diabetes_binary"
RANDOM_STATE = 42
TEST_SIZE = 0.20

MODEL_OUT = "model.pkl"
SCALER_OUT = "scaler.pkl"
COEF_OUT = "coefficients.json"
METRICS_OUT = "metrics.json"


def main():
    # 1. Load
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded shape: {df.shape}")

    # 2. Drop duplicates BEFORE split (avoids leakage across train/test)
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    print(f"Dropped {before - after} duplicate rows -> {after} rows remain")

    # Note: BMI=98 and other extreme-looking values are left untouched —
    # they are genuine survey values, not touching them per plan.

    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]
    feature_names = list(X.columns)

    # 3. Stratified 80/20 split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE
    )
    print(f"Train: {X_train.shape}, Test: {X_test.shape}")
    print(f"Train positive rate: {y_train.mean():.4f}, Test positive rate: {y_test.mean():.4f}")

    # 4. Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 5. Train Logistic Regression
    model = LogisticRegression(
        class_weight="balanced",
        max_iter=2000,
        random_state=RANDOM_STATE,
    )
    model.fit(X_train_scaled, y_train)

    # 6. Evaluate
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "roc_auc": roc_auc_score(y_test, y_proba),
        "precision": precision_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred),
        "f1_score": f1_score(y_test, y_pred),
    }
    cm = confusion_matrix(y_test, y_pred).tolist()

    print("\n===== METRICS (test set) =====")
    for k, v in metrics.items():
        print(f"{k}: {v:.4f}")
    print("\nConfusion matrix [[TN, FP], [FN, TP]]:")
    print(cm)
    print("\nClassification report:")
    print(classification_report(y_test, y_pred, target_names=["No Diabetes", "Diabetes/Prediabetes"]))

    # 7. Save artifacts
    joblib.dump(model, MODEL_OUT)
    joblib.dump(scaler, SCALER_OUT)

    # Coefficients — for the "top contributing factors" explanation feature.
    # Sign = direction of contribution (model-space, standardized units).
    # Magnitude = relative weight in the model, NOT a medical risk multiplier.
    coef_list = [
        {"feature": name, "coefficient": float(coef)}
        for name, coef in zip(feature_names, model.coef_[0])
    ]
    coef_list_sorted = sorted(coef_list, key=lambda d: abs(d["coefficient"]), reverse=True)

    with open(COEF_OUT, "w") as f:
        json.dump(
            {
                "intercept": float(model.intercept_[0]),
                "coefficients": coef_list_sorted,
                "note": (
                    "Coefficients describe each feature's direction and relative "
                    "weight in the model's prediction (standardized feature space). "
                    "They are not a medical risk statement and should not be "
                    "presented as 'this factor increases your risk by X%'."
                ),
            },
            f,
            indent=2,
        )

    with open(METRICS_OUT, "w") as f:
        json.dump(
            {
                **metrics,
                "confusion_matrix": cm,
                "confusion_matrix_labels": ["No Diabetes", "Diabetes/Prediabetes"],
                "train_rows": int(X_train.shape[0]),
                "test_rows": int(X_test.shape[0]),
                "dropped_duplicates": int(before - after),
                "test_positive_rate": float(y_test.mean()),
            },
            f,
            indent=2,
        )

    print(f"\nSaved: {MODEL_OUT}, {SCALER_OUT}, {COEF_OUT}, {METRICS_OUT}")


if __name__ == "__main__":
    main()
