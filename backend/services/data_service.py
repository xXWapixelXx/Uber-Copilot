import pandas as pd
import os
from typing import List, Optional
from models.earner import Earner, EarnerType, VehicleType, FuelType, EarnerStatus

class DataService:
    """Service for loading and managing earner data from Excel files"""
    
    def __init__(self, data_file_path: str = "data/uber_hackathon_v2_mock_data.xlsx"):
        self.data_file_path = data_file_path
        self._data: Optional[pd.DataFrame] = None
    
    def load_data(self) -> pd.DataFrame:
        """Load data from Excel file and return as DataFrame"""
        try:
            if not os.path.exists(self.data_file_path):
                raise FileNotFoundError(f"Data file not found: {self.data_file_path}")
            
            # Read Excel file
            self._data = pd.read_excel(self.data_file_path)
            
            # Clean and standardize column names
            self._data.columns = self._data.columns.str.lower().str.replace(' ', '_')
            
            # Convert data types
            self._data = self._convert_data_types()
            
            print(f"Successfully loaded {len(self._data)} records from {self.data_file_path}")
            return self._data
            
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            raise
    
    def _convert_data_types(self) -> pd.DataFrame:
        """Convert DataFrame columns to appropriate data types"""
        df = self._data.copy()
        
        # Convert boolean columns
        if 'is_ev' in df.columns:
            df['is_ev'] = df['is_ev'].astype(bool)
        
        # Convert numeric columns
        numeric_columns = ['experience_months', 'rating', 'home_city_id']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Convert string columns to lowercase for consistency, except fuel_type
        string_columns = ['earner_type', 'vehicle_type', 'status']
        for col in string_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.lower()
        
        # Handle fuel_type separately to preserve 'EV' case
        if 'fuel_type' in df.columns:
            df['fuel_type'] = df['fuel_type'].astype(str)
            # Convert to lowercase except for 'EV' which should remain uppercase
            df['fuel_type'] = df['fuel_type'].apply(lambda x: x.lower() if x != 'EV' else 'EV')
        
        return df
    
    def get_all_earners(self) -> List[Earner]:
        """Get all earners as Earner objects"""
        if self._data is None:
            self.load_data()
        
        earners = []
        for _, row in self._data.iterrows():
            try:
                earner = Earner(
                    earner_id=str(row.get('earner_id', '')),
                    earner_type=EarnerType(row.get('earner_type', 'driver')),
                    vehicle_type=VehicleType(row.get('vehicle_type', 'car')),
                    fuel_type=FuelType(row.get('fuel_type', 'gas')),
                    is_ev=bool(row.get('is_ev', False)),
                    experience_months=int(row.get('experience_months', 0)),
                    rating=float(row.get('rating', 0.0)),
                    status=EarnerStatus(row.get('status', 'offline')),
                    home_city_id=int(row.get('home_city_id', 1))
                )
                earners.append(earner)
            except Exception as e:
                print(f"Error creating earner from row: {e}")
                continue
        
        return earners
    
    def get_dataframe(self) -> pd.DataFrame:
        """Get the raw DataFrame"""
        if self._data is None:
            self.load_data()
        return self._data
    
    def get_earners_by_city(self, city_id: int) -> List[Earner]:
        """Get earners filtered by city"""
        all_earners = self.get_all_earners()
        return [earner for earner in all_earners if earner.home_city_id == city_id]
    
    def get_earners_by_status(self, status: EarnerStatus) -> List[Earner]:
        """Get earners filtered by status"""
        all_earners = self.get_all_earners()
        return [earner for earner in all_earners if earner.status == status]

# Global instance
data_service = DataService()
