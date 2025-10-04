import pandas as pd
import os
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json

class EnhancedDataService:
    """
    Enhanced data service that loads and manages all Uber ecosystem data
    Supports multi-platform operations (rides + eats + jobs) with location intelligence
    """
    
    def __init__(self, data_file_path: str = "data/uber_hackathon_v2_mock_data.xlsx"):
        self.data_file_path = data_file_path
        self.data = {}
        self._data_loaded = False
        if not self._data_loaded:
            self.load_all_data()
            self._data_loaded = True
    
    def load_all_data(self):
        """Load all sheets from the Excel file"""
        try:
            if not os.path.exists(self.data_file_path):
                raise FileNotFoundError(f"Data file not found: {self.data_file_path}")
            
            # Load all sheets
            excel_file = pd.ExcelFile(self.data_file_path)
            
            for sheet_name in excel_file.sheet_names:
                if sheet_name == 'README':
                    continue  # Skip README sheet
                    
                print(f"Loading {sheet_name}...")
                df = pd.read_excel(self.data_file_path, sheet_name=sheet_name)
                
                # Clean and optimize data
                df = self._clean_dataframe(df, sheet_name)
                self.data[sheet_name] = df
                
            print(f"✅ Successfully loaded {len(self.data)} datasets")
            self._validate_relationships()
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            raise
    
    def _clean_dataframe(self, df: pd.DataFrame, sheet_name: str) -> pd.DataFrame:
        """Clean and optimize dataframe based on sheet type"""
        
        # Handle datetime columns
        datetime_columns = ['start_time', 'end_time', 'date', 'datestr']
        for col in datetime_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Handle numeric columns
        numeric_columns = [
            'surge_multiplier', 'fare_amount', 'uber_fee', 'net_earnings', 'tips',
            'distance_km', 'duration_mins', 'rating', 'experience_months',
            'basket_value_eur', 'delivery_fee_eur', 'tip_eur',
            'predicted_eph', 'predicted_std', 'cancellation_rate_pct'
        ]
        
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Handle categorical columns
        categorical_columns = [
            'earner_type', 'vehicle_type', 'fuel_type', 'status', 'weather',
            'product', 'marketplace', 'payment_type', 'program'
        ]
        
        for col in categorical_columns:
            if col in df.columns:
                df[col] = df[col].astype('category')
        
        # Handle boolean columns
        boolean_columns = ['is_ev', 'achieved', 'in_final_heatmap']
        for col in boolean_columns:
            if col in df.columns:
                df[col] = df[col].astype(bool)
        
        return df
    
    def _validate_relationships(self):
        """Validate data relationships and integrity"""
        print("🔍 Validating data relationships...")
        
        # Check earner relationships
        earners = self.data['earners']
        rides_trips = self.data['rides_trips']
        eats_orders = self.data['eats_orders']
        
        # Validate driver relationships
        drivers = earners[earners['earner_type'] == 'driver']
        missing_drivers = rides_trips[~rides_trips['driver_id'].isin(drivers['earner_id'])]
        if not missing_drivers.empty:
            print(f"⚠️ Warning: {len(missing_drivers)} rides reference unknown drivers")
        
        # Validate courier relationships
        couriers = earners[earners['earner_type'] == 'courier']
        missing_couriers = eats_orders[~eats_orders['courier_id'].isin(couriers['earner_id'])]
        if not missing_couriers.empty:
            print(f"⚠️ Warning: {len(missing_couriers)} orders reference unknown couriers")
        
        print("✅ Data validation completed")
    
    # Data Access Methods
    
    def get_earners(self, earner_type: Optional[str] = None) -> pd.DataFrame:
        """Get earners data with optional filtering"""
        earners = self.data['earners'].copy()
        if earner_type:
            earners = earners[earners['earner_type'] == earner_type]
        return earners
    
    def get_earner_by_id(self, earner_id: str) -> Optional[pd.Series]:
        """Get specific earner by ID"""
        earners = self.data['earners']
        result = earners[earners['earner_id'] == earner_id]
        return result.iloc[0] if len(result) > 0 else None
    
    def get_rides_for_earner(self, earner_id: str) -> pd.DataFrame:
        """Get all rides for a specific earner"""
        return self.data['rides_trips'][
            self.data['rides_trips']['driver_id'] == earner_id
        ].copy()
    
    def get_eats_orders_for_earner(self, earner_id: str) -> pd.DataFrame:
        """Get all eats orders for a specific courier"""
        return self.data['eats_orders'][
            self.data['eats_orders']['courier_id'] == earner_id
        ].copy()
    
    def get_earnings_daily(self, earner_id: str) -> pd.DataFrame:
        """Get daily earnings for a specific earner"""
        return self.data['earnings_daily'][
            self.data['earnings_daily']['earner_id'] == earner_id
        ].copy()
    
    def get_incentives_for_earner(self, earner_id: str) -> pd.DataFrame:
        """Get incentive programs for a specific earner"""
        return self.data['incentives_weekly'][
            self.data['incentives_weekly']['earner_id'] == earner_id
        ].copy()
    
    # Location Intelligence Methods
    
    def get_heatmap_data(self, city_id: int) -> pd.DataFrame:
        """Get earnings heatmap data for a city"""
        return self.data['heatmap'][
            self.data['heatmap']['msg.city_id'] == city_id
        ].copy()
    
    def get_cancellation_rates(self, city_id: int) -> pd.DataFrame:
        """Get cancellation rates by hexagon for a city"""
        return self.data['cancellation_rates'][
            self.data['cancellation_rates']['city_id'] == city_id
        ].copy()
    
    def get_surge_data(self, city_id: int, hour: Optional[int] = None) -> pd.DataFrame:
        """Get surge pricing data for a city and optionally specific hour"""
        surge_data = self.data['surge_by_hour'][
            self.data['surge_by_hour']['city_id'] == city_id
        ]
        
        if hour is not None:
            surge_data = surge_data[surge_data['hour'] == hour]
        
        return surge_data.copy()
    
    def get_weather_data(self, city_id: int, date: Optional[str] = None) -> pd.DataFrame:
        """Get weather data for a city and optionally specific date"""
        weather_data = self.data['weather_daily'][
            self.data['weather_daily']['city_id'] == city_id
        ]
        
        if date:
            weather_data = weather_data[
                weather_data['date'].dt.strftime('%Y-%m-%d') == date
            ]
        
        return weather_data.copy()
    
    # Advanced Analytics Methods
    
    def get_multi_platform_performance(self, earner_id: str) -> Dict[str, Any]:
        """Get comprehensive performance across rides and eats"""
        earner = self.get_earner_by_id(earner_id)
        if earner is None:
            return {"error": "Earner not found"}
        
        rides = self.get_rides_for_earner(earner_id)
        eats_orders = self.get_eats_orders_for_earner(earner_id)
        daily_earnings = self.get_earnings_daily(earner_id)
        incentives = self.get_incentives_for_earner(earner_id)
        
        return {
            "earner_profile": earner.to_dict(),
            "rides_performance": {
                "total_rides": len(rides),
                "total_earnings": rides['net_earnings'].sum() if not rides.empty else 0,
                "total_tips": rides['tips'].sum() if not rides.empty else 0,
                "avg_rating": earner['rating'],
                "avg_distance": rides['distance_km'].mean() if not rides.empty else 0,
                "avg_duration": rides['duration_mins'].mean() if not rides.empty else 0
            },
            "eats_performance": {
                "total_orders": len(eats_orders),
                "total_earnings": eats_orders['net_earnings'].sum() if not eats_orders.empty else 0,
                "total_tips": eats_orders['tip_eur'].sum() if not eats_orders.empty else 0,
                "avg_basket_value": eats_orders['basket_value_eur'].mean() if not eats_orders.empty else 0,
                "avg_delivery_distance": eats_orders['distance_km'].mean() if not eats_orders.empty else 0
            },
            "daily_earnings_summary": {
                "total_days": len(daily_earnings),
                "avg_daily_earnings": daily_earnings['total_net_earnings'].mean() if not daily_earnings.empty else 0,
                "best_day": daily_earnings['total_net_earnings'].max() if not daily_earnings.empty else 0,
                "total_earnings": daily_earnings['total_net_earnings'].sum() if not daily_earnings.empty else 0
            },
            "incentive_performance": {
                "total_quests": len(incentives),
                "completed_quests": incentives['achieved'].sum() if not incentives.empty else 0,
                "total_bonuses_earned": incentives[incentives['achieved']]['bonus_eur'].sum() if not incentives.empty else 0,
                "completion_rate": incentives['achieved'].mean() if not incentives.empty else 0
            }
        }
    
    def get_location_intelligence(self, city_id: int, hex_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive location intelligence for a city or specific hexagon"""
        heatmap = self.get_heatmap_data(city_id)
        cancellation_rates = self.get_cancellation_rates(city_id)
        surge_data = self.get_surge_data(city_id)
        weather_data = self.get_weather_data(city_id)
        
        if hex_id:
            heatmap = heatmap[heatmap['msg.predictions.hexagon_id_9'] == hex_id]
            cancellation_rates = cancellation_rates[cancellation_rates['hexagon_id9'] == hex_id]
        
        return {
            "heatmap_insights": {
                "avg_earnings_per_hour": heatmap['msg.predictions.predicted_eph'].mean() if not heatmap.empty else 0,
                "earnings_uncertainty": heatmap['msg.predictions.predicted_std'].mean() if not heatmap.empty else 0,
                "high_earning_hexagons": len(heatmap[heatmap['msg.predictions.predicted_eph'] > heatmap['msg.predictions.predicted_eph'].quantile(0.8)]) if not heatmap.empty else 0
            },
            "cancellation_insights": {
                "avg_cancellation_rate": cancellation_rates['cancellation_rate_pct'].mean() if not cancellation_rates.empty else 0,
                "high_cancellation_areas": len(cancellation_rates[cancellation_rates['cancellation_rate_pct'] > 10]) if not cancellation_rates.empty else 0
            },
            "surge_patterns": {
                "peak_hours": surge_data[surge_data['surge_multiplier'] > 1.2]['hour'].tolist() if not surge_data.empty else [],
                "low_demand_hours": surge_data[surge_data['surge_multiplier'] < 0.8]['hour'].tolist() if not surge_data.empty else [],
                "avg_surge": surge_data['surge_multiplier'].mean() if not surge_data.empty else 1.0
            },
            "weather_impact": {
                "clear_days": len(weather_data[weather_data['weather'] == 'clear']) if not weather_data.empty else 0,
                "rain_days": len(weather_data[weather_data['weather'] == 'rain']) if not weather_data.empty else 0,
                "snow_days": len(weather_data[weather_data['weather'] == 'snow']) if not weather_data.empty else 0
            }
        }
    
    def get_city_comparison(self) -> Dict[str, Any]:
        """Compare performance across all cities"""
        cities = {}
        
        for city_id in range(1, 6):  # Assuming cities 1-5
            location_data = self.get_location_intelligence(city_id)
            
            # Get earnings data for this city
            city_earnings = self.data['earnings_daily'][
                self.data['earnings_daily']['city_id'] == city_id
            ]
            
            cities[f"city_{city_id}"] = {
                "location_intelligence": location_data,
                "earnings_stats": {
                    "avg_daily_earnings": city_earnings['total_net_earnings'].mean() if not city_earnings.empty else 0,
                    "total_earners": city_earnings['earner_id'].nunique() if not city_earnings.empty else 0,
                    "total_rides": city_earnings['trips_count'].sum() if not city_earnings.empty else 0,
                    "total_orders": city_earnings['orders_count'].sum() if not city_earnings.empty else 0
                }
            }
        
        return cities
    
    def get_time_patterns(self) -> Dict[str, Any]:
        """Analyze time-based patterns across the platform"""
        rides = self.data['rides_trips'].copy()
        eats_orders = self.data['eats_orders'].copy()
        
        # Extract hour from start_time
        rides['hour'] = pd.to_datetime(rides['start_time']).dt.hour
        eats_orders['hour'] = pd.to_datetime(eats_orders['start_time']).dt.hour
        
        # Analyze patterns
        ride_hourly = rides.groupby('hour').agg({
            'net_earnings': 'mean',
            'surge_multiplier': 'mean',
            'distance_km': 'mean',
            'duration_mins': 'mean'
        }).to_dict('index')
        
        eats_hourly = eats_orders.groupby('hour').agg({
            'net_earnings': 'mean',
            'basket_value_eur': 'mean',
            'distance_km': 'mean',
            'duration_mins': 'mean'
        }).to_dict('index')
        
        return {
            "ride_patterns": ride_hourly,
            "eats_patterns": eats_hourly,
            "peak_hours": {
                "rides": sorted(ride_hourly.keys(), key=lambda x: ride_hourly[x]['net_earnings'], reverse=True)[:3],
                "eats": sorted(eats_hourly.keys(), key=lambda x: eats_hourly[x]['net_earnings'], reverse=True)[:3]
            }
        }

# Global instance
# Create global instance with caching
_enhanced_data_service_instance = None

def get_enhanced_data_service():
    """Get the global enhanced data service instance (singleton pattern)"""
    global _enhanced_data_service_instance
    if _enhanced_data_service_instance is None:
        _enhanced_data_service_instance = EnhancedDataService()
    return _enhanced_data_service_instance

# For backward compatibility
enhanced_data_service = get_enhanced_data_service()
