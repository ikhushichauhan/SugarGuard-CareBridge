# 🩺 SugarGuard CareBridge

> An explainable diabetes screening-to-care navigation platform that helps users understand a screening result, prepare for confirmatory testing, organize lab results, and track their care journey through follow-up.

[![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Backend-Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Scikit--learn](https://img.shields.io/badge/ML-Scikit--learn-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?logo=awslambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![Amazon ECR](https://img.shields.io/badge/AWS-ECR-FF9900?logo=amazonecr&logoColor=white)](https://aws.amazon.com/ecr/)
[![API Gateway](https://img.shields.io/badge/AWS-API%20Gateway-FF9900?logo=amazonapigateway&logoColor=white)](https://aws.amazon.com/api-gateway/)
[![AWS Amplify](https://img.shields.io/badge/AWS-Amplify-FF9900?logo=awsamplify&logoColor=white)](https://aws.amazon.com/amplify/)

---

## 📖 About the Project

Many people receive a diabetes screening result but are unsure about what the result means or what they should do next.

A screening result is not the same as a diagnosis, but existing screening experiences can stop at a risk score without helping users navigate the next appropriate step.

**SugarGuard CareBridge** is designed to bridge this gap.

It provides an explainable screening experience, highlights important factors contributing to the screening indication, provides guidance toward appropriate confirmatory testing, allows users to review laboratory results, creates a structured Care Passport for healthcare discussions, and tracks progress from screening through follow-up.

The core idea is:

> **Screen → Understand → Confirm → Track → Follow Up**

SugarGuard CareBridge is a **screening and care-navigation tool, not a diagnostic or treatment system.**

---

## 🚨 Problem Statement

Diabetes screening can identify people who may need further evaluation, but receiving a screening indication does not automatically provide a clear path toward confirmation and follow-up.

Users may face challenges such as:

- Not understanding what influenced their screening result
- Not knowing what confirmatory testing to discuss
- Losing track of screening and laboratory information
- Having test results in disconnected places
- Difficulty preparing information for a healthcare visit
- No simple way to track progress from screening to follow-up

SugarGuard CareBridge focuses on this gap between:

```
Screening Result
       ↓
Understanding
       ↓
Confirmatory Testing
       ↓
Lab Result
       ↓
Follow-up
```

---

## 💡 Our Solution

SugarGuard CareBridge combines screening, explanation, confirmation guidance, laboratory result interpretation, and care tracking into one workflow.

```
┌─────────────────────────────────────────────┐
│             SUGARGUARD CAREBRIDGE            │
├─────────────────────────────────────────────┤
│                                               │
│  📝 Health Screening                         │
│  🧠 Explainable Risk Result                  │
│  🛡️ Reliability Gate                         │
│  🧪 Confirmation Guidance                    │
│  📄 Lab Report Checker                       │
│  🔍 OCR-based Report Extraction              │
│  📋 Care Passport                            │
│  🔄 Care Journey Tracking                    │
│  ✅ Follow-up Tracking                       │
│                                               │
└─────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 📝 1. Diabetes Screening

Users provide a small set of health-related inputs:

- Age
- Sex
- Height
- Weight
- Blood pressure history
- Cholesterol history
- Smoking history
- Physical activity
- General health

Height and weight are used to calculate BMI.

The system converts the entered age into the corresponding CDC-style age category used by the underlying model.

### 🧠 2. Explainable Screening Model

The screening model uses Logistic Regression trained on the CDC BRFSS 2015 Diabetes Health Indicators dataset.

The model uses eight user-facing features:

- Age
- Sex
- BMI
- High Blood Pressure
- High Cholesterol
- Smoking
- Physical Activity
- General Health

The model provides a screening indication:

```
Elevated screening risk
        OR
Lower screening risk
```

The result is intentionally presented as a screening indication rather than a diagnosis.

### 🔍 3. Explainable Top Factors

Instead of returning only a prediction, the system identifies the major model signals contributing to the result.

For example:

```
Key factors
• General Health
• BMI
• Age
```

The factors are calculated using the trained Logistic Regression coefficients and the user's scaled feature values.

This makes the screening result more understandable than a simple binary prediction.

### 🛡️ 4. Reliability Gate

Before running the model, the backend validates the submitted information.

The Reliability Gate checks:

- Required fields
- Age range
- Height range
- Weight range
- General health value
- Input types
- Existing diabetes diagnosis
- Extreme BMI values

The gate can return:

- `PASS`
- `WARN`
- `BLOCK`
- `EXIT`

This prevents unsuitable or incomplete inputs from being blindly passed to the model.

If a user indicates that they are already diagnosed with diabetes, the screening workflow exits rather than treating the screening model as a diagnostic tool.

### 🧪 5. Confirmation Guidance

After receiving a screening indication, users are guided toward the next appropriate step.

The application explains that screening is not diagnosis and encourages discussion of appropriate confirmatory testing with a qualified healthcare professional.

Example guidance:

> A screening result is not a diagnosis.
>
> Discuss appropriate confirmatory testing, such as fasting blood glucose or HbA1c, with a qualified healthcare professional.

The application does not recommend medication or treatment changes.

### 📄 6. Care Passport

The Care Passport organizes important information from the screening journey into one structured summary.

It can include:

- Screening date
- Screening indication
- BMI
- Key model signals
- Confirmation guidance
- Laboratory results
- Follow-up status
- Clinical discussion notes
- Safety disclaimers

The Care Passport can also be printed/downloaded for discussion during a healthcare visit.

### 🧪 7. Lab Report Checker

Users can manually enter laboratory values or extract them from a report.

Supported tests include:

- HbA1c
- Fasting Plasma Glucose (FPG)
- Random Blood Glucose (RBG)
- 2-Hour Oral Glucose Tolerance Test (OGTT)

The application validates the entered value and displays an appropriate reference interpretation.

Example:

```
HbA1c: 6.8%

Diabetes-Range Result
Clinical Confirmation Required
```

The system does not tell the user that they have diabetes.

Laboratory results are presented as reference-range interpretations and should be discussed with a healthcare professional.

### 🔍 8. OCR-based Report Extraction

SugarGuard CareBridge also supports image-based laboratory report extraction using Tesseract.js.

Workflow:

```
Upload Lab Report Image
          ↓
      OCR Extraction
          ↓
     Extracted Text
          ↓
   Test/Value Mapping
          ↓
Reference Range Check
          ↓
   Add to Care Passport
```

OCR is performed client-side.

The OCR layer is used for extraction only. It does not diagnose the user or modify the machine-learning model.

### 📊 9. Laboratory Reference Ranges

The application maintains laboratory interpretation rules in a dedicated utility:

`labRanges.js`

Current supported reference categories include:

**HbA1c**
- `< 5.7%` → Normal
- `5.7–6.4%` → Prediabetes Range
- `≥ 6.5%` → Diabetes Range

**Fasting Plasma Glucose**
- `< 100 mg/dL` → Normal
- `100–125 mg/dL` → Prediabetes Range
- `≥ 126 mg/dL` → Diabetes Range

**2-Hour OGTT**
- `< 140 mg/dL` → Normal
- `140–199 mg/dL` → Prediabetes Range
- `≥ 200 mg/dL` → Diabetes Range

**Random Blood Glucose**

Random glucose is handled differently because the value alone does not establish or rule out diabetes.

A value of 200 mg/dL or higher is flagged for prompt clinical evaluation, with diagnostic interpretation requiring appropriate clinical context.

### 🔄 10. Care Journey Tracking

The platform tracks the user's progress through four stages:

```
┌───────────────┐
│    Screened   │
└───────┬───────┘
        ↓
┌──────────────────────┐
│ Confirmation Advised │
└──────────┬───────────┘
           ↓
┌─────────────────┐
│   Test Pending  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Follow-up Done  │
└─────────────────┘
```

The current MVP stores journey status locally in the browser using `localStorage`.

The follow-up status is self-reported tracking and does not represent medical clearance or confirmation of treatment.

---

## 🏗️ System Architecture

```
                    ┌───────────────────┐
                    │   React + Vite    │
                    │     Frontend      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Amazon Amplify   │
                    │  Frontend Hosting │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   API Gateway     │
                    │    HTTP API       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   AWS Lambda      │
                    │  Python Backend   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   ML Inference    │
                    │ Scikit-learn      │
                    │ LogisticRegression│
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    Amazon ECR     │
                    │ Docker Container  │
                    └───────────────────┘
```

---

## ☁️ AWS Architecture

The application is designed for deployment using AWS serverless infrastructure.

**Amazon ECR**
Stores the Docker container containing the Python ML backend and its required model artifacts.

**AWS Lambda**
Runs the backend inference and reliability-gate logic without requiring a continuously running server.

**Amazon API Gateway**
Exposes the Lambda backend as an HTTP API that can be accessed by the React frontend.

**AWS Amplify**
Hosts and serves the React/Vite frontend as the public web application.

---

## 🛠️ Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- CSS
- Tesseract.js
- LocalStorage

**Machine Learning**
- Python
- Scikit-learn
- Pandas
- Logistic Regression
- StandardScaler

**Backend**
- Python
- AWS Lambda-compatible handler
- Docker

**Cloud**
- Amazon ECR
- AWS Lambda
- Amazon API Gateway
- AWS Amplify

---

## 📊 Dataset

The screening model is trained using the:

**Diabetes Health Indicators Dataset**

Source:
- CDC BRFSS 2015
- UCI Machine Learning Repository
- Kaggle

The dataset contains health and lifestyle indicators associated with diabetes-related screening.

The project uses a reduced eight-field feature set to make the model practical for a user-facing screening workflow.

---

## 🤖 Model Performance

The eight-field Logistic Regression model was evaluated using a stratified train/test split.

| Metric    | Value  |
|-----------|--------|
| Accuracy  | 70.85% |
| ROC-AUC   | 80.48% |
| Precision | 31.29% |
| Recall    | 75.74% |
| F1 Score  | 44.28% |

The model is intended for screening support, not clinical diagnosis.

The performance metrics represent evaluation on the project's dataset split and should not be interpreted as clinical validation.

---

## 🔬 Model Features

The final model uses:

- Age
- Sex
- BMI
- HighBP
- HighChol
- Smoker
- PhysActivity
- GenHlth

The most influential learned coefficients in the eight-field model include:

- General Health
- Age
- BMI
- High Blood Pressure
- High Cholesterol
- Sex
- Smoking
- Physical Activity

The application exposes the top contributing model signals to improve interpretability.

---

## 📂 Project Structure

```
SugarGuard-CareBridge/
│
├── model/
│   ├── data/
│   ├── train_model.py
│   ├── train_model_8field.py
│   ├── EDA.ipynb
│   ├── model.pkl
│   ├── scaler.pkl
│   ├── coefficients.json
│   ├── metrics.json
│   ├── model_8field.pkl
│   ├── scaler_8field.pkl
│   ├── coefficients_8field.json
│   └── metrics_8field.json
│
├── backend/
│   ├── reliability_gate.py
│   ├── lambda_function.py
│   ├── test_backend.py
│   ├── model_8field.pkl
│   ├── scaler_8field.pkl
│   ├── coefficients_8field.json
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── i18n/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Python 3.x
- Docker Desktop

### 1. Clone the Repository

```bash
git clone https://github.com/ikhushichauhan/SugarGuard-CareBridge.git
cd SugarGuard-CareBridge
```

### 🐳 Run the Backend Locally

Navigate to the backend directory:

```bash
cd backend
```

Build the Docker image:

```bash
docker build -t sugarguard-backend .
```

Run the Lambda-compatible container:

```bash
docker run --rm -p 9000:8080 sugarguard-backend
```

The local Lambda Runtime Interface Emulator endpoint can then be used for testing.

### ⚛️ Run the Frontend Locally

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The application will be available at the local Vite development URL.

### 🔗 Local Development Flow

During local development:

```
React Frontend
      ↓
Vite Development Proxy
      ↓
Docker Lambda Container
      ↓
Reliability Gate
      ↓
Scikit-learn Model
      ↓
Screening Result
```

This allows the frontend and containerized backend to be tested together before deployment.

---

## 🧪 Testing

The project includes backend and OCR-related tests.

Backend testing can be performed using:

```bash
python test_backend.py
```

Frontend build:

```bash
npm run build
```

OCR extraction and laboratory boundary tests are included in the frontend testing workflow.

---

## 🔐 Safety & Scope

SugarGuard CareBridge is intentionally designed with clear boundaries.

**The application DOES:**
- Provide screening support
- Explain model signals
- Validate screening inputs
- Provide confirmation guidance
- Interpret entered laboratory values against reference ranges
- Extract laboratory information from images
- Organize information into a Care Passport
- Track self-reported care journey progress

**The application DOES NOT:**
- Diagnose diabetes
- Replace laboratory testing
- Replace a healthcare professional
- Recommend medication
- Recommend treatment changes
- Provide medical clearance
- Claim clinical validation of the screening model

> **Important:** A screening result is not a diagnosis. Laboratory results and screening indications should be discussed with a qualified healthcare professional.

---

## 🎯 Design Principles

**1. Explainability**
Users should understand why a screening result was produced rather than receiving only a number.

**2. Safety**
The application clearly separates screening support from diagnosis and treatment.

**3. Continuity**
Information should remain useful after the initial screening through the Care Passport and Care Journey.

**4. Simplicity**
The user-facing workflow is designed to move from:

```
Answer → Understand → Confirm → Track
```

without requiring unnecessary complexity.

---

## 🔮 Future Scope

Potential future improvements include:

- Secure user accounts
- Cross-device Care Passport synchronization
- Healthcare-provider workflows
- Health-worker dashboards
- Additional validated screening models
- More laboratory report formats
- Improved OCR robustness
- Multilingual expansion
- Advanced analytics
- Secure cloud data storage
- Integration with approved healthcare systems

These features are outside the current MVP scope.

---

## 🌱 Impact

SugarGuard CareBridge focuses on a specific gap in the diabetes screening journey:

**What happens after the screening result?**

Instead of stopping at a risk indication, the platform helps users:

```
Understand the result
        ↓
Know the next appropriate step
        ↓
Review confirmatory testing
        ↓
Organize results
        ↓
Prepare for a healthcare discussion
        ↓
Track follow-up
```

The goal is to make the journey from screening to confirmation and follow-up clearer, more explainable, and easier to navigate.

---

## 👩‍💻 Team

**Khushi Chauhan**
Project Lead & Developer

Contributions include:
- Product architecture
- Dataset research
- ML feature pipeline
- Logistic Regression screening model
- Reliability Gate
- Python backend
- React integration
- Lab Report Checker
- OCR workflow
- Care Passport
- Care Journey
- Testing
- Repository management
- AWS deployment architecture

---

## 📄 License

This project is developed as a hackathon project for educational and demonstration purposes.

---

## ⭐ Acknowledgements

The project builds upon publicly available diabetes health indicator data and open-source technologies including:

- Scikit-learn
- Pandas
- React
- Vite
- Tesseract.js
- Docker
- AWS services

---

**🩺 SugarGuard CareBridge**
*From Screening to the Next Step.*
