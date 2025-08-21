**IntelliInspect**
A machine learning-based inspection simulation tool built with Angular 18 (frontend), .NET 8 (backend API), and Python 3.13 + FastAPI (ML service). It processes CSV datasets, trains models for prediction, and simulates inspections via streaming.
Setup and Deployment Instructions (Docker-based)

Prerequisites:

Docker and Docker Compose installed.
Download the sample dataset https://www.kaggle.com/c/bosch-production-line-performance/data and place a subset CSV in a convenient location for upload during usage.

Clone the Repository:
textgit clone <repo-url>
cd intelliinspect

Build and Run with Docker Compose:

Ensure the docker-compose.yml file is in the root directory.
Run the following command to build and start all services:
docker-compose up --build

This will:

Build the frontend (Angular app served via NGINX on port 4200).
Build the backend (.NET API on port 8080).
Build the ML service (FastAPI on port 8000).
Mount a shared volume for data persistence (/data)

Access the Application:

Frontend: Open http://localhost:4200 in your browser.
Backend API: http://localhost:8080 (for testing endpoints).
ML Service: http://localhost:8000 (for direct ML endpoint testing, if needed).


Stopping the Services:
docker-compose down
