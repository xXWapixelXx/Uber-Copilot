import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  MessageCircle, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  MapPin,
  Star,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { chatAPI, earningsAPI, restAPI } from '../services/api';

const HomePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [quickStats, setQuickStats] = useState({
    todayEarnings: 0,
    hoursWorked: 0,
    ridesCompleted: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    {
      title: 'Ask AI',
      description: 'Get instant help',
      icon: MessageCircle,
      color: 'bg-green-500',
      href: '/chat'
    },
    {
      title: 'Earnings',
      description: 'Check predictions',
      icon: DollarSign,
      color: 'bg-yellow-500',
      href: '/earnings'
    },
    {
      title: 'Rest Time',
      description: 'Optimize breaks',
      icon: Clock,
      color: 'bg-orange-500',
      href: '/rest'
    },
    {
      title: 'Analytics',
      description: 'View stats',
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/dashboard'
    }
  ];

  const tips = [
    {
      icon: MapPin,
      title: 'Peak Hours',
      description: '7-9 AM & 5-7 PM are your money makers',
      color: 'text-green-600'
    },
    {
      icon: Star,
      title: 'Rating Boost',
      description: 'Keep your car clean for better ratings',
      color: 'text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Stay Safe',
      description: 'Trust your instincts, cancel if needed',
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} • Ready to drive?
        </p>
      </motion.div>

      {/* Driver Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="font-semibold text-gray-900">
              {isOnline ? 'Online & Ready' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isOnline 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">${quickStats.todayEarnings}</div>
            <div className="text-xs text-gray-500">Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{quickStats.hoursWorked}h</div>
            <div className="text-xs text-gray-500">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{quickStats.ridesCompleted}</div>
            <div className="text-xs text-gray-500">Rides</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.a
                key={action.title}
                href={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="card p-4 hover:shadow-lg transition-all duration-200"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.a>
            );
          })}
        </div>
      </motion.div>

      {/* Smart Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Smart Tips</h2>
        <div className="space-y-3">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="card p-4 flex items-start space-x-3"
              >
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <Icon className={`w-5 h-5 ${tip.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* AI Assistant CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card p-6 bg-gradient-to-r from-uber-500 to-blue-600 text-white"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Copilot Ready</h3>
            <p className="text-white/80 text-sm">Get personalized insights</p>
          </div>
        </div>
        <a
          href="/chat"
          className="inline-flex items-center space-x-2 bg-white text-uber-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Start Chatting</span>
        </a>
      </motion.div>
    </div>
  );
};

export default HomePage;
