import os
import pandas as pd
import numpy as np
from typing import Tuple, List
import time

DATA_PATH = "data/train_numeric.csv"
#DATA_PATH = "/app/data/dataset.parquet"
MODEL_PATH = "/app/data/model.pkl"

RESPONSE_COL = "Response"
TS_COL = "synthetic_timestamp"
ID_CANDIDATES = ["Id", "id", "ID"]

class DatasetNotFound(Exception):
    pass

class SchemaError(Exception):
    pass



def add_synthetic_timestamps(df: pd.DataFrame, start_time="2015-01-01 00:00:00") -> pd.DataFrame:
    """
    Adds a 'synthetic_timestamp' column to the DataFrame, spaced one second apart.
    """
    base = pd.to_datetime(start_time)
    df = df.copy()
    df["synthetic_timestamp"] = [base + pd.Timedelta(seconds=i) for i in range(len(df))]
    return df

def load_dataset() -> pd.DataFrame:
    if not os.path.exists(DATA_PATH):
        raise DatasetNotFound(f"Dataset not found at {DATA_PATH}. Make sure Screen 1 saved it.")
    
    st= time.time()
    # read data and add synthetic timestamps
    df = pd.read_csv(DATA_PATH,nrows=40000)

    et= time.time()
    print("Rows:", len(df))
    print("Columns:", df.columns.tolist())
    print(f"load_dataset took {et-st:.2f} seconds")
  

    df = add_synthetic_timestamps(df)

    print(df['synthetic_timestamp'].min())
    print(df['synthetic_timestamp'].max())
    
    df.to_parquet("dataset.parquet") 

    # Basic checks
    if RESPONSE_COL not in df.columns:
        raise SchemaError(f"'{RESPONSE_COL}' column missing in dataset.")
    if TS_COL not in df.columns:
        raise SchemaError(f"'{TS_COL}' column missing. Backend must augment timestamps in Screen 1.")
    # Normalize timestamp dtype
    df[TS_COL] = pd.to_datetime(df[TS_COL])
    return df


def slice_by_ranges(df: pd.DataFrame, start: str, end: str) -> pd.DataFrame:
    start_ts = pd.to_datetime(start)
    end_ts = pd.to_datetime(end)
    mask = (df[TS_COL] >= start_ts) & (df[TS_COL] <= end_ts)
    return df.loc[mask].copy()


def pick_id_column(columns: List[str]) -> str:
    for c in ID_CANDIDATES:
        if c in columns:
            return c
    return None


def get_feature_columns(df: pd.DataFrame) -> List[str]:
    # Exclude known non-feature columns
    ignore = {RESPONSE_COL, TS_COL}
    id_col = pick_id_column(df.columns.tolist())
    if id_col:
        ignore.add(id_col)
    # Keep numeric columns only
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    feats = [c for c in numeric_cols if c not in ignore]
    return feats


def compute_scale_pos_weight(y: np.ndarray) -> float:
    # For imbalanced binary classification: sum(negative) / sum(positive)
    n_pos = (y == 1).sum()
    n_neg = (y == 0).sum()
    if n_pos == 0:
        return 1.0
    return float(n_neg) / float(n_pos)


def metrics_from_predictions(y_true: np.ndarray, y_pred: np.ndarray):
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return (acc, prec, rec, f1), (int(tp), int(tn), int(fp), int(fn))