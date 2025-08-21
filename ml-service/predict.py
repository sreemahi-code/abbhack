import joblib
import pandas as pd
import numpy as np
from typing import List, Dict

from utils import MODEL_PATH


def predict_batch(rows: List[Dict]) -> List[Dict]:
    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"]
    imputer = bundle["imputer"]
    feature_cols = bundle["features"]

    df = pd.DataFrame(rows)

    # Ensure all expected features exist; add missing as NaN
    for col in feature_cols:
        if col not in df.columns:
            df[col] = np.nan
    # Only keep features in the saved order
    X = df[feature_cols].to_numpy()
    X = imputer.transform(X)

    # Predict
    preds = model.predict(X).astype(int)
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[:, 1]
    else:
        # Fallback: use decision_function-style margin if available
        scores = model.predict(X, output_margin=True)
        proba = 1 / (1 + np.exp(-scores))

    return [
        {"prediction": int(p), "confidence": float(c)}
        for p, c in zip(preds, proba)
    ]