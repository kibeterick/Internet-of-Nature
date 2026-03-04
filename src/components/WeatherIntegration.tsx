import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  forecast: {
    day: string;
    temp: number;
    condition: string;
  }[];
}

export const WeatherIntegration = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    condition: 'sunny',
    forecast: [
      { day: 'Today', temp: 24, condition: 'sunny' },
      { day: 'Tomorrow', temp: 22, condition: 'cloudy' },
      { day: 'Wed', temp: 19, condition: 'rainy' },
      { day: 'Thu', temp: 21, condition: 'cloudy' },
      { day: 'Fri', temp: 25, condition: 'sunny' },
    ]
  });

  const [isLoading, setIsLoading] = useState(false);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun size={24} className="text-yellow-500" />;
      case 'cloudy': return <Cloud size={24} className="text-gray-500" />;
      case 'rainy': return <CloudRain size={24} className="text-blue-500" />;
      case 'windy': return <Wind size={24} className="text-gray-600" />;
      default: return <Sun size={24} className="text-yellow-500" />;
    }
  };

  const refreshWeather = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWeather(prev => ({
        ...prev,
        temperature: Math.round(20 + Math.random() * 10),
        humidity: Math.round(50 + Math.random() * 30),
        windSpeed: Math.round(5 + Math.random() * 15),
      }));
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Auto-refresh every 10 minutes
    const interval = setInterval(refreshWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            {getWeatherIcon(weather.condition)}
            Weather Impact
          </h3>
          <p className="text-nature-500 text-sm">Environmental conditions affecting ecosystem</p>
        </div>
        <button
          onClick={refreshWeather}
          disabled={isLoading}
          className="p-2 bg-nature-100 rounded-xl hover:bg-nature-200 transition-colors disabled:opacity-50"
        >
          <Wind size={18} className={cn("text-nature-600", isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/50 p-4 rounded-2xl border border-nature-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <Thermometer size={20} className="text-orange-500" />
            <span className="text-sm font-medium text-nature-600">Temperature</span>
          </div>
          <p className="text-2xl font-bold">{weather.temperature}°C</p>
          <p className="text-xs text-nature-400">Optimal range: 18-26°C</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/50 p-4 rounded-2xl border border-nature-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <Droplets size={20} className="text-blue-500" />
            <span className="text-sm font-medium text-nature-600">Humidity</span>
          </div>
          <p className="text-2xl font-bold">{weather.humidity}%</p>
          <p className="text-xs text-nature-400">Optimal range: 60-80%</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/50 p-4 rounded-2xl border border-nature-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <Wind size={20} className="text-gray-500" />
            <span className="text-sm font-medium text-nature-600">Wind Speed</span>
          </div>
          <p className="text-2xl font-bold">{weather.windSpeed} km/h</p>
          <p className="text-xs text-nature-400">Light breeze</p>
        </motion.div>
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-sm text-nature-500 uppercase tracking-wider">5-Day Forecast</h4>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {weather.forecast.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 bg-nature-50 p-3 rounded-xl text-center min-w-[80px]"
            >
              <p className="text-xs font-bold text-nature-600 mb-2">{day.day}</p>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.condition)}
              </div>
              <p className="text-sm font-bold">{day.temp}°</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Cloud size={16} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-700 uppercase">Weather Advisory</span>
        </div>
        <p className="text-xs text-amber-900">
          Current conditions are favorable for plant growth. Expected rainfall tomorrow will benefit soil moisture levels.
        </p>
      </div>
    </div>
  );
};