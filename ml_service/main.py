from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd
from schemas import TrainRequest, TrainResponse, PredictRequest, PredictResponse
from train import get_data_by_ranges, train_model_from_data
from predict import predict_batch
from utils import DatasetNotFound,load_dataset, SchemaError,add_synthetic_timestamps,DATA_PATH, RESPONSE_COL, TS_COL

app = FastAPI()

# Allow all CORS for demo/hackathon purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/validate_ranges")
def validate_ranges(payload: dict):
    """
    Expects:
    {
        "trainStart": "...", "trainEnd": "...",
        "testStart": "...", "testEnd": "...",
        "simStart": "...", "simEnd": "..."
    }
    """

    '''
{
  "trainStart": "2015-01-01T00:00:00",
  "trainEnd":   "2015-01-01T04:00:00",
  "testStart":  "2015-01-01T04:00:01",
  "testEnd":    "2015-01-01T08:00:00",
  "simStart":   "2015-01-01T08:00:01",
  "simEnd":     "2015-01-01T11:06:39"
}
    '''
    try:
        df = load_dataset()
        # Convert to pandas timestamps
        train_start = pd.to_datetime(payload["trainStart"])
        train_end = pd.to_datetime(payload["trainEnd"])
        test_start = pd.to_datetime(payload["testStart"])
        test_end = pd.to_datetime(payload["testEnd"])
        sim_start = pd.to_datetime(payload["simStart"])
        sim_end = pd.to_datetime(payload["simEnd"])

        # Validation rules
        errors = []
        valid = True
        if not (train_start <= train_end):
            valid = False
            errors.append("Training start must be before or equal to end.")
        if not (test_start <= test_end):
            valid = False
            errors.append("Testing start must be before or equal to end.")
        if not (sim_start <= sim_end):
            valid = False
            errors.append("Simulation start must be before or equal to end.")
        if not (train_end < test_start):
            valid = False
            errors.append("Testing must begin after training ends.")
        if not (test_end < sim_start):
            valid = False
            errors.append("Simulation must begin after testing ends.")

        # Check for overlap and dataset bounds
        min_ts, max_ts = df[TS_COL].min(), df[TS_COL].max()
        for s, e, label in [
            (train_start, train_end, "Training"),
            (test_start, test_end, "Testing"),
            (sim_start, sim_end, "Simulation"),
        ]:
            if not (min_ts <= s <= e <= max_ts):
                valid = False
                errors.append(f"{label} period out of dataset range.")

        # Count records
        def count(start, end):
            mask = (df[TS_COL] >= start) & (df[TS_COL] <= end)
            return int(mask.sum())

        summary = {
            "train": {
                "start": str(train_start),
                "end": str(train_end),
                "days": (train_end - train_start).days + 1,
                "count": count(train_start, train_end)
            },
            "test": {
                "start": str(test_start),
                "end": str(test_end),
                "days": (test_end - test_start).days + 1,
                "count": count(test_start, test_end)
            },
            "simulation": {
                "start": str(sim_start),
                "end": str(sim_end),
                "days": (sim_end - sim_start).days + 1,
                "count": count(sim_start, sim_end)
            },
            "total_records": int(df.shape[0])
        }

        return {
            "status": "Valid" if valid else "Invalid",
            "errors": errors,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e}")
    


@app.post("/train", response_model=TrainResponse)
def train_endpoint(req: TrainRequest):
    try:
        train_df, test_df = get_data_by_ranges(
            req.trainStart, req.trainEnd,
            req.testStart, req.testEnd
        )
        result = train_model_from_data(
            train_df, test_df,
            req.max_train_rows, req.max_test_rows
        )
        return result
    except (DatasetNotFound, SchemaError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

@app.post("/predict", response_model=PredictResponse)
def predict_endpoint(req: PredictRequest):
    try:
        results = predict_batch(req.rows)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
