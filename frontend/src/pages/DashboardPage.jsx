import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Star, 
  MapPin, 
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Loader2
} from 'lucide-react';
import { dashboardAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback mock data
      setStats({
        total_earners: 360,
        earnings_by_city: {
          "1": 25.45,
          "2": 27.89,
          "3": 26.12,
          "4": 29.34,
          "5": 28.98
        },
        earnings_by_experience: {
          "0-12 months": 25.03,
          "12-24 months": 26.31,
          "24-36 months": 27.41,
          "36-60 months": 29.28,
          "60+ months": 31.62
        },
        vehicle_type_distribution: {
          "car": 280,
          "bike": 60,
          "scooter": 20
        },
        rating_statistics: {
          "average": 4.72,
          "min": 1.0,
          "max": 5.0
        },
        time_patterns: {
          peak_hours: {
            morning: { start: "07:00", end: "09:00", demand_multiplier: 1.8 },
            evening: { start: "17:00", end: "19:00", demand_multiplier: 1.6 },
            night: { start: "22:00", end: "02:00", demand_multiplier: 1.4 }
          },
          low_demand_hours: {
            midday: { start: "14:00", end: "16:00", demand_multiplier: 0.6 },
            late_night: { start: "02:00", end: "06:00", demand_multiplier: 0.4 }
          }
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-uber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard data</p>
        <button onClick={fetchStats} className="mt-4 btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const topCity = Object.entries(stats.earnings_by_city)
    .sort(([,a], [,b]) => b - a)[0];

  const topExperience = Object.entries(stats.earnings_by_experience)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
        <p className="text-gray-600">Your driving insights & analytics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 text-center"
        >
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.total_earners}</div>
          <div className="text-sm text-gray-500">Total Drivers</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 text-center"
        >
          <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.rating_statistics.average}</div>
          <div className="text-sm text-gray-500">Avg Rating</div>
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Best City</div>
                <div className="text-sm text-gray-500">City {topCity[0]}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">{formatCurrency(topCity[1])}/hr</div>
              <div className="text-xs text-gray-500">earnings</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Best Experience</div>
                <div className="text-sm text-gray-500">{topExperience[0]}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-blue-600">{formatCurrency(topExperience[1])}/hr</div>
              <div className="text-xs text-gray-500">earnings</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Earnings by City */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🏙️ Earnings by City</h2>
        <div className="space-y-3">
          {Object.entries(stats.earnings_by_city)
            .sort(([,a], [,b]) => b - a)
            .map(([city, earnings], index) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-uber-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-uber-600">{city}</span>
                  </div>
                  <span className="text-gray-900">City {city}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(earnings)}</div>
                  <div className="text-xs text-gray-500">per hour</div>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Peak Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⏰ Peak Hours</h2>
        <div className="space-y-3">
          {Object.entries(stats.time_patterns.peak_hours).map(([period, data], index) => (
            <motion.div
              key={period}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900 capitalize">{period}</div>
                  <div className="text-sm text-gray-500">{data.start} - {data.end}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">+{Math.round((data.demand_multiplier - 1) * 100)}%</div>
                <div className="text-xs text-gray-500">demand</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Vehicle Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🚗 Vehicle Types</h2>
        <div className="space-y-3">
          {Object.entries(stats.vehicle_type_distribution).map(([type, count], index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Car className="w-5 h-5 text-uber-600" />
                <span className="text-gray-900 capitalize">{type}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">drivers</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Experience Levels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 Experience Impact</h2>
        <div className="space-y-3">
          {Object.entries(stats.earnings_by_experience).map(([experience, earnings], index) => (
            <motion.div
              key={experience}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900">{experience}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-600">{formatCurrency(earnings)}</div>
                <div className="text-xs text-gray-500">per hour</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Low Demand Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">😴 Low Demand Hours</h2>
        <div className="space-y-3">
          {Object.entries(stats.time_patterns.low_demand_hours).map(([period, data], index) => (
            <motion.div
              key={period}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <div className="flex items-center space-x-3">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900 capitalize">{period.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-500">{data.start} - {data.end}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-red-600">{Math.round((1 - data.demand_multiplier) * 100)}%</div>
                <div className="text-xs text-gray-500">lower demand</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-center text-sm text-gray-500"
      >
        Last updated: {new Date(stats.timestamp).toLocaleString()}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
