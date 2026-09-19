# SugarGuard CareBridge

## Screening-to-Confirmation Assistant for Diabetes Risk Navigation

SugarGuard CareBridge is a web-based health navigation platform designed to help users move from diabetes risk screening toward the next appropriate care step.

Instead of stopping at a screening score, the platform focuses on making results understandable, reviewable, shareable, and trackable through a Care Passport.

> **Important:** SugarGuard CareBridge is a screening and navigation prototype, not a diagnostic system. The ML model is not clinically validated and does not replace professional medical advice.

---

## Key Features

- Diabetes risk screening using a transparent ML model
- Reliability Gate for input validation and safety checks
- Explainable results with top contributing model signals
- Confirmation guidance after elevated screening results
- Lab Report Checker for HbA1c, FPG, RBG, and 2-hour OGTT
- OCR-based lab report scanning using Tesseract.js
- Care Passport for screening and lab information
- Screening journey tracking
- Hindi and English interface
- Interactive 3D health education experience
- Printable doctor-visit summary

---

## Core Workflow

```text
Health Information
       |
       v
Reliability Gate
       |
       v
ML Screening
       |
       v
Explainable Result
       |
       v
Confirmation Guidance
       |
       v
Lab Report Checker
       |
       v
Care Passport
       |
       v
Follow-up Journey
Lab Report OCR Workflow
Lab Report Image
       |
       v
Tesseract.js OCR
       |
       v
Test & Value Extraction
       |
       v
User Review / Edit
       |
       v
Reference-Range Interpretation
       |
       v
Care Passport

OCR is used only for extracting information from the uploaded report. The extracted values are shown to the user for review before interpretation.

Machine Learning

The screening model is based on the CDC Diabetes Health Indicators / BRFSS 2015 dataset.

The current user-facing model uses 8 inputs:

Age
Sex
BMI
High Blood Pressure
High Cholesterol
Smoking History
Physical Activity
General Health

A Logistic Regression model is used to keep the screening logic transparent and allow contributing signals to be surfaced with the result.

The model provides a screening risk signal and is not intended to provide a medical diagnosis.

Lab Report Checker

The Lab Report Checker supports:

Test	Unit
HbA1c	%
Fasting Blood Glucose (FPG)	mg/dL
Random Blood Glucose (RBG)	mg/dL
2-hour OGTT	mg/dL

Users can either enter laboratory values manually or upload a clear image of a lab report.

The application compares entered values against the reference ranges implemented in the application and provides an explanation of where the value falls relative to those ranges.

Care Passport

The Care Passport brings important screening and laboratory information together in one place.

It can contain:

Screening date
BMI
Screening result
Top model signals
Lab results
Lab interpretation
Clinical discussion note
Follow-up status

The passport can also be printed as a doctor-visit summary.

Tech Stack
Frontend
React
Vite
Three.js
React Three Fiber
Tesseract.js
JavaScript
CSS
Backend and Machine Learning
Python
AWS Lambda
API Gateway
Docker
scikit-learn
pandas
joblib
Deployment Architecture
GitHub
   |
   v
AWS Amplify
   |
   v
React Frontend
   |
   v
API Gateway
   |
   v
AWS Lambda
   |
   v
ML Screening Model
Project Structure
SugarGuard-CareBridge/
|
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   ├── i18n/
│   │   ├── utils/
│   │   └── assets/
│   ├── package.json
│   └── vite.config.js
|
├── backend/
│   ├── lambda_function.py
│   ├── reliability_gate.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── test_backend.py
|
└── model/
    ├── train_model.py
    ├── train_model_8field.py
    └── EDA.ipynb
Local Setup
Frontend
cd frontend
npm install
npm run dev
Backend
cd backend
docker build -t sugarguard-backend .
docker run --rm -p 9000:8080 sugarguard-backend

The local Vite configuration proxies screening requests to the Dockerized Lambda runtime.

Safety and Scope

SugarGuard CareBridge does not:

Diagnose diabetes
Prescribe medication or treatment
Replace professional medical evaluation
Claim clinical validation of the screening model
Automatically treat OCR output as medically verified
Recommend medication changes

The application is designed for screening support, result explanation, and care navigation.

Current Status
Screening workflow
ML model integration
Reliability and safety checks
Explainable screening signals
Confirmation guidance
Care Passport
Lab Report Checker
OCR lab report extraction
Hindi and English support
Interactive 3D educational content
Dockerized backend
AWS deployment in progress
Future Scope

Potential future improvements include:

AWS production deployment
Persistent Care Passport storage
Secure user accounts
Health-worker workflow
Additional laboratory report formats
Improved OCR support for diverse report layouts
Cloud-based monitoring and analytics
Disclaimer

SugarGuard CareBridge is an educational and hackathon prototype for screening support and care navigation. It is not a medical diagnostic device and should not be used as a substitute for evaluation by a qualified healthcare professional.
