#IntelliInspect
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

##Usage Guide
Usage Guide

Upload Dataset (Screen 1):

Drag and drop a CSV file (must include 'Response' column; other features numeric).
If 'synthetic_timestamp' is missing, it will be auto-generated (starting 2021-01-01 00:00:00, +1s per row).
View metadata (rows, columns, pass rate, date range) and proceed to Next.
Date Ranges (Screen 2):

Select date ranges for Training, Testing, and Simulation (non-overlapping, sequential).
Validate to see counts, durations, and monthly distribution bars.
Proceed to Next if valid.


Model Training (Screen 3):

Click Train to forward ranges to ML service.
View metrics (accuracy, precision, recall, F1), confusion matrix donut, and training curves (loss/acc lines).
Proceed to Next.
Simulation (Screen 4):

Click Start Simulation to begin SSE stream.
Watch live updates: line chart (quality score), donut (pass/fail confidence), counters, and appending table (1 row/sec).
On completion, see "Simulation completed" message and option to Restart.



###Notes:

Use a small CSV subset (~30-50k rows) for quick training/demo.
Errors are handled with toasts; ensure CORS is enabled for dev.
For full dataset, code supports it but may require more resources.



