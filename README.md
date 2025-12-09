# Health-Data-Information-and-Management-System
Health-Data-Information-and-Management-System

One-line: A full-stack web application to collect, store, visualize and analyze patient health records — built with React (frontend), Spring Boot + Hibernate (backend), MySQL (database), and an optional Python AI/ML service for analytics and predictive models.

Table of contents

Project overview

Key features

Tech stack

Architecture

Quick start — local development

Configuration / environment variables

Database schema (sample)

API endpoints (examples)

Frontend usage & routes

AI/ML integration

Testing

Security & privacy considerations

Deployment (suggested)

Contributing

License & contact

Project overview

This system stores and manages patient records, appointments, diagnostic reports and aggregates health statistics. It provides role-based access (Admin / Doctor / Nurse / Patient), audit logging, RESTful APIs for CRUD operations and a dashboard for analytics. An optional AI/ML microservice can perform tasks such as risk scoring, anomaly detection, or predictions from historical health data.

Key features

User authentication & role-based authorization (JWT-based recommended)

Patient CRUD (personal info, demographics, medical history)

Appointments scheduling & management

Clinical notes and diagnostics (file upload support for reports)

Search & filters for patient records

Audit logs & activity history

Dashboard: charts and KPIs (admissions, conditions distribution)

REST API documented with Swagger

Optional AI/ML service: risk scoring, basic predictions, data visualization

Export/Import (CSV) for bulk data operations

Tech stack

Frontend

React.js, Redux (optional), Bootstrap / Tailwind CSS, React Router
Backend

Java, Spring Boot, Spring Security (JWT), Hibernate / JPA, RESTful controllers
AI/ML

Python (Flask/FastAPI) microservice, scikit-learn / pandas / numpy, model saved as .pkl or ONNX
Database & Tools

MySQL (or MariaDB), Swagger (OpenAPI), Postman, Maven, Git, VS Code, Tomcat (if using WAR)
DevOps (suggested)

Docker, docker-compose, GitHub Actions / Jenkins for CI

Architecture

Simple microservices approach:

frontend/ — React SPA

backend/ — Spring Boot monolith (Auth, Patient API, Appointments)

ml-service/ — Python microservice for model inference (optional)

db/ — MySQL database

Communication: Frontend ↔ Backend (HTTPS REST), Backend ↔ ML service (HTTP REST/gRPC).

Quick start — local development
Prerequisites

JDK 17+

Node.js 18+ & npm/yarn

MySQL 8+ (or docker)

Python 3.8+ (only if using ML service)

Maven

1) Start MySQL (local or docker)

Using Docker:

docker run --name hdms-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=hdms -p 3306:3306 -d mysql:8

2) Backend — configure & run

From backend/:

# set env vars (or edit application.properties)
mvn clean package
# run
java -jar target/hdms-backend-0.0.1-SNAPSHOT.jar


Or with Spring Boot dev:

mvn spring-boot:run

3) Frontend — install & run

From frontend/:

npm install
npm start
# open http://localhost:3000

4) ML service (optional)

From ml-service/:

python -m venv venv
source venv/bin/activate      # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py                 # default: http://localhost:5000

5) Swagger / API docs

Open http://localhost:8080/swagger-ui.html (or configured path).

Configuration / environment variables

Place these in application.properties or environment variables.

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/hdms
spring.datasource.username=root
spring.datasource.password=root

# JPA
spring.jpa.hibernate.ddl-auto=update

# JWT
app.jwtSecret=YourStrongSecretKey
app.jwtExpirationMs=86400000

# Server
server.port=8080

# ML service (optional)
ml.service.url=http://localhost:5000/predict


Frontend .env (React):

REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ML_SERVICE_URL=http://localhost:5000

Database schema (sample)

Minimal tables — extend for your needs.

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  dob DATE,
  gender VARCHAR(20),
  contact VARCHAR(50),
  address TEXT,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE appointments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT,
  scheduled_at DATETIME,
  status VARCHAR(40),
  notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE clinical_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT,
  record_type VARCHAR(100),
  payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

API endpoints (examples)

All endpoints under /api.

Auth

POST /api/auth/login — body: { "username": "...", "password": "..." } → returns JWT

POST /api/auth/register — create user (admin only)

Patients

GET /api/patients — list (with pagination & filters)

POST /api/patients — create patient

GET /api/patients/{id} — patient details

PUT /api/patients/{id} — update

DELETE /api/patients/{id} — delete (admin)

Appointments

GET /api/appointments

POST /api/appointments

PUT /api/appointments/{id}

Clinical records

POST /api/patients/{id}/records — add record or upload report

GET /api/patients/{id}/records

ML

POST /api/ml/predict-risk — forwards data to ML microservice

Example curl

# Login
curl -X POST http://localhost:8080/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"username":"admin","password":"pass"}'

# Create patient (with JWT)
curl -X POST http://localhost:8080/api/patients \
 -H "Authorization: Bearer <JWT>" \
 -H "Content-Type: application/json" \
 -d '{"first_name":"John","last_name":"Doe","dob":"1980-05-01"}'

Frontend usage & routes

Suggested routes:

/login — login page

/dashboard — charts and KPIs

/patients — patient list

/patients/:id — patient detail & records

/appointments — manage appointments

/admin/users — user management (admin)

Key components:

components/PatientForm, components/PatientList, components/AppointmentCalendar, components/RecordUploader, components/DashboardCharts.

Use axios or fetch with a centralized apiClient that injects the JWT header.

AI/ML integration

This project supports an optional ML microservice used for analytics or predictions.

Suggested pattern

Train offline in Python (Jupyter): use pandas, scikit-learn. Save model as model.pkl (or export ONNX).

Build a lightweight Flask/FastAPI server that exposes POST /predict:

Accept JSON with features

Load model (on startup) and return prediction + confidence

The backend calls ML service (sync) at endpoints such as /api/ml/predict-risk to enrich patient data or return scores to frontend.

Sample Flask app (basic)
# app.py
from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)
model = joblib.load("model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    df = pd.DataFrame([data])   # ensure ordering matches model features
    pred = model.predict_proba(df)[:,1].tolist()
    return jsonify({"risk_score": pred[0]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

Data & privacy

Keep training data de-identified.

Log model inputs sparingly, and avoid storing PHI in analytic logs.

Testing

Backend: JUnit + Spring Boot Test for controllers/services/repositories. Use H2 in-memory DB for unit/integration tests.

Frontend: Jest + React Testing Library for components.

ML: unit tests for preprocessing functions and model inference.

Example backend test command:

mvn test


Frontend:

npm test

Security & privacy considerations

Use HTTPS in production.

Hash passwords with bcrypt.

Implement role-based access control (RBAC).

Validate & sanitize all inputs to avoid SQL injection / XSS.

Secure file uploads (limit size, type, store outside webroot).

Audit logging (who accessed/changed patient data).

Comply with relevant regulations (e.g., HIPAA/GDPR) where applicable.

Deployment (suggested)

Dockerize each component. Example docker-compose.yml for backend, frontend, db, ml-service.

Use environment variables for secrets (do not store in repo).

CI pipeline: run linting, unit tests, build artifacts, and push images to registry (GitHub Container Registry, Docker Hub).

Orchestrate with Kubernetes for production scale.

Contributing

Fork the repo

Create a feature branch: git checkout -b feat/your-feature

Commit & push: git commit -m "feat: ..."

Open a PR with description & testing notes

Follow code style: Prettier for JS, Checkstyle or SpotBugs for Java. Add tests for new features.

License & contact

License: MIT (or choose your preferred license)
