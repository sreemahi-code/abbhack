import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

from xgboost import XGBClassifier
from sklearn.impute import SimpleImputer

from utils import (
    load_dataset,
    slice_by_ranges,
    get_feature_columns,
    compute_scale_pos_weight,
    metrics_from_predictions,
    MODEL_PATH,
    RESPONSE_COL,
)


#for tab 2
def get_data_by_ranges(
    train_start: str, train_end: str,
    test_start: str, test_end: str
):
    """
    Loads the dataset and returns (train_df, test_df) sliced by the given date ranges.
    Raises ValueError if any slice is empty.
    """
    df = load_dataset()
    train_df = slice_by_ranges(df, train_start, train_end)
    test_df = slice_by_ranges(df, test_start, test_end)
    if len(train_df) == 0 or len(test_df) == 0:
        raise ValueError("Training or testing window produced zero rows. Adjust date ranges.")
    return train_df, test_df


def train_model_from_data(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    max_train_rows: int | None = None,
    max_test_rows: int | None = None
) -> Dict[str, Any]:
   
    # 1) Downsample if needed
    if max_train_rows and len(train_df) > max_train_rows:
        train_df = train_df.iloc[:max_train_rows].copy()
    if max_test_rows and len(test_df) > max_test_rows:
        test_df = test_df.iloc[:max_test_rows].copy()


    # 2) Feature selection
    feature_cols = get_feature_columns(train_df)
    if not feature_cols:
        raise ValueError("No numeric feature columns found after excluding Response/timestamp/Id.")

    X_train = train_df[feature_cols].to_numpy()
    y_train = train_df[RESPONSE_COL].to_numpy().astype(int)
    X_test  = test_df[feature_cols].to_numpy()
    y_test  = test_df[RESPONSE_COL].to_numpy().astype(int)

    # 3) Preprocess
    imputer = SimpleImputer(strategy="mean")
    X_train = imputer.fit_transform(X_train)
    X_test  = imputer.transform(X_test)

    # 4) Train model (CPU-optimized)
    spw = compute_scale_pos_weight(y_train)
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        tree_method="hist",
        n_jobs=-1,
        scale_pos_weight=spw,
        random_state=42,
    )

    # Track eval history
    eval_set = [(X_train, y_train), (X_test, y_test)]
    model.fit(X_train, y_train, eval_set=eval_set, verbose=False)
    evals = model.evals_result()
    # XGBoost stores per-iteration metrics
    # We'll derive "loss" from the logloss on test set and a crude "accuracy" via predictions sweep

    # 5) Evaluate final predictions
    y_pred = model.predict(X_test)
    (acc, prec, rec, f1), (tp, tn, fp, fn) = metrics_from_predictions(y_test, y_pred)

    # 6) Save artifacts (model + imputer + feature list)
    bundle = {
        "model": model,
        "imputer": imputer,
        "features": feature_cols,
    }
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(bundle, MODEL_PATH)

    # Prepare training history arrays
    # epochs = number of boosting rounds actually trained
    epochs = list(range(1, len(evals["validation_1"]["logloss"]) + 1))
    loss = [float(v) for v in evals["validation_1"]["logloss"]]

    # For accuracy curve, approximate by thresholded predictions over boosting rounds (optional, lightweight)
    # To keep things simple and fast, we reuse the final predictions to yield a flat curve of final acc.
    # If you want a true curve, you can call predict() with iteration_range, but that’s slower.
    acc_curve = [acc for _ in epochs]

    response = {
        "status": "success",
        "metrics": {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1": f1,
        },
        "confusionMatrix": {
            "tp": tp, "tn": tn, "fp": fp, "fn": fn
        },
        "trainingHistory": {
            "epochs": epochs,
            "loss": loss,
            "accuracy": acc_curve,
        }
    }
    return response