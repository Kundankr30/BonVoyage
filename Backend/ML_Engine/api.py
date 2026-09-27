from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ml_forecast import predict_next_freight_rate

app = FastAPI(
    title="SIH26006 ML Engine API",
    description="ML Engine for Freight Prediction",
    version="1.0"
)

class FreightPredictionRequest(BaseModel):
    origin_port: str
    destination_port: str
    vessel_class: str

@app.get("/")
def home():
    return {
        "message": "ML Engine API is running (Prediction Only)"
    }

@app.post("/predict_freight")
def predict_freight(request: FreightPredictionRequest):
    try:
        predicted_rate = predict_next_freight_rate(
            request.origin_port,
            request.destination_port,
            request.vessel_class
        )
        return {"predicted_rate": predicted_rate}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )