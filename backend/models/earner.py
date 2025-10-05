from pydantic import BaseModel
from typing import Optional
from enum import Enum

class EarnerType(str, Enum):
    DRIVER = "driver"
    COURIER = "courier"

class VehicleType(str, Enum):
    CAR = "car"
    BIKE = "bike"
    SCOOTER = "scooter"
    WALK = "walk"

class FuelType(str, Enum):
    GAS = "gas"
    HYBRID = "hybrid"
    EV = "EV"

class EarnerStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ENGAGED = "engaged"

class EarnerBase(BaseModel):
    earner_id: str
    earner_type: EarnerType
    vehicle_type: VehicleType
    fuel_type: FuelType
    is_ev: bool
    experience_months: int
    rating: float
    status: EarnerStatus
    home_city_id: int

class Earner(EarnerBase):
    """Complete earner model with all fields"""
    pass

class EarnerCreate(EarnerBase):
    """Model for creating a new earner"""
    pass

class EarnerUpdate(BaseModel):
    """Model for updating earner information"""
    status: Optional[EarnerStatus] = None
    rating: Optional[float] = None

class AnalyticsResponse(BaseModel):
    """Response model for analytics data"""
    metric: str
    value: float
    details: Optional[dict] = None

class EarningsPrediction(BaseModel):
    """Model for earnings predictions"""
    predicted_earnings_per_hour: float
    confidence_score: float
    factors: list[str]
    recommendation: str

