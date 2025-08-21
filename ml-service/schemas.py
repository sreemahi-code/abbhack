from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class Range(BaseModel):
    start: str
    end: str


class TrainRequest(BaseModel):
    trainStart: str = Field(..., description="ISO datetime for training start")
    trainEnd: str = Field(..., description="ISO datetime for training end")
    testStart: str = Field(..., description="ISO datetime for testing start")
    testEnd: str = Field(..., description="ISO datetime for testing end")
    # Optional speed knobs for hackathon
    max_train_rows: Optional[int] = Field(None, description="Cap training rows for speed")
    max_test_rows: Optional[int] = Field(None, description="Cap test rows for speed")


class MetricBundle(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float


class Confusion(BaseModel):
    tp: int
    tn: int
    fp: int
    fn: int


class TrainHistory(BaseModel):
    epochs: List[int]
    loss: List[float]
    accuracy: List[float]


class TrainResponse(BaseModel):
    status: str
    metrics: MetricBundle
    confusionMatrix: Confusion
    trainingHistory: TrainHistory


class PredictRequest(BaseModel):
    rows: List[Dict[str, Any]]


class PredictItem(BaseModel):
    prediction: int
    confidence: float


class PredictResponse(BaseModel):
    results: List[PredictItem]