import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Battery, Signal, MapPin, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Sensor {
  id: string;
  name: string;
  type: 'soil' | 'air' | 'water' | 'weather' | 'acoustic';
  status: 'online' | 'offline' | 'warning';
  battery: number;
  signal: number;
  location: { lat: number; lng: number };
  lastUpdate: Date;
  data: Record<string, number>;
}

export const SensorNetwork = () => {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: 'SNS001',
      name: 'Soil Monitor Alpha',
      type: 'soil',
      status: 'online',
      battery: 85,
      signal: 92,
      location: { lat: 40.7128, lng: -74.0060 },
      lastUpdate: new Date(Date.now() - 300000), // 5 minutes ago
      data: { moisture: 42, temperature: 18, ph: 6.8 }
    },
    {
      id: 'SNS002',
      name: 'Air Quality Beta',
      type: 'air',
      status: 'online',
      battery: 67,
      signal: 78,
      location: { lat: 40.7130, lng: -74.0058 },
      lastUpdate: new Date(Date.now() - 180000), // 3 minutes ago
      data: { pm25: 12, co2: 410, humidity: 65 }
    },
    {
      id: 'SNS003',
      name: 'Weather Station Gamma',
      type: 'weather',
      status: 'warning',
      battery: 23,
      signal: 45,
      location: { lat: 40.7125, lng: -74.0062 },
      lastUpdate: new Date(Date.now() - 900000), // 15 minutes ago
      data: { temperature: 24, pressure: 1013, windSpeed: 12 }
    },
    {
      id: 'SNS004',
      name: 'Acoustic Monitor Delta',
      type: 'acoustic',
      status: 'offline',
      battery: 0,
      signal: 0,
      location: { lat: 40.7132, lng: -74.0055 },
      lastUpdate: new Date(Date.now() - 3600000), // 1 hour ago
      data: { decibels: 0, frequency: 0 }
    },
    {
      id: 'SNS005',
      name: 'Water Quality Epsilon',
      type: 'water',
      status: 'online',
      battery: 91,
      signal: 88,
      location: { lat: 40.7127, lng: -74.0065 },
      lastUpdate: new Date(Date.now() - 120000), // 2 minutes ago
      data: { ph: 7.2, dissolved_oxygen: 8.5, turbidity: 2.1 }
    }
  ]);

  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const sensorTypes = ['all', 'soil', 'air', 'water', 'weather', 'acoustic'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'offline': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-50 border-emerald-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'offline': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'soil': return '🌱';
      case 'air': return '💨';
      case 'water': return '💧';
      case 'weather': return '🌤️';
      case 'acoustic': return '🔊';
      default: return '📡';
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filteredSensors = filterType === 'all' 
    ? sensors 
    : sensors.filter(sensor => sensor.type === filterType);

  const onlineSensors = sensors.filter(s => s.status === 'online').length;
  const warningSensors = sensors.filter(s => s.status === 'warning').length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => {
        if (sensor.status === 'online' && Math.random() > 0.95) {
          // Randomly update sensor data
          const newData = { ...sensor.data };
          Object.keys(newData).forEach(key => {
            newData[key] = Math.round((newData[key] + (Math.random() - 0.5) * 2) * 100) / 100;
          });
          return {
            ...sensor,
            data: newData,
            lastUpdate: new Date()
          };
        }
        return sensor;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Wifi size={24} className="text-blue-500" />
            Sensor Network
          </h3>
          <p className="text-nature-500 text-sm">Real-time monitoring infrastructure status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>{onlineSensors} Online</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span>{warningSensors} Warning</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>{offlineSensors} Offline</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sensorTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap capitalize",
              filterType === type
                ? "bg-nature-900 text-white"
                : "bg-nature-100 text-nature-600 hover:bg-nature-200"
            )}
          >
            {type === 'all' ? 'All Sensors' : `${getSensorIcon(type)} ${type}`}
          </button>
        ))}
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map((sensor, i) => (
          <motion.div
            key={sensor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedSensor(sensor)}
            className={cn(
              "p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md",
              getStatusBg(sensor.status)
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSensorIcon(sensor.type)}</span>
                <div>
                  <p className="font-bold text-sm">{sensor.name}</p>
                  <p className="text-xs text-nature-500 uppercase tracking-wider">{sensor.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {sensor.status === 'online' ? (
                  <Wifi size={16} className={getStatusColor(sensor.status)} />
                ) : (
                  <WifiOff size={16} className={getStatusColor(sensor.status)} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Battery size={14} className="text-nature-400" />
                <span className="text-xs font-medium">{sensor.battery}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal size={14} className="text-nature-400" />
                <span className="text-xs font-medium">{sensor.signal}%</span>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {Object.entries(sensor.data).slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-nature-600 capitalize">{key.replace('_', ' ')}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-nature-400">{getTimeAgo(sensor.lastUpdate)}</span>
              <span className={cn("font-bold uppercase", getStatusColor(sensor.status))}>
                {sensor.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sensor Detail Modal */}
      <AnimatePresence>
        {selectedSensor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedSensor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">{getSensorIcon(selectedSensor.type)}</span>
                    {selectedSensor.name}
                  </h4>
                  <p className="text-nature-500 text-sm">{selectedSensor.id}</p>
                </div>
                <button
                  onClick={() => setSelectedSensor(null)}
                  className="p-2 hover:bg-nature-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-nature-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Battery size={16} className="text-nature-600" />
                      <span className="text-xs font-bold text-nature-600">Battery</span>
                    </div>
                    <p className="text-lg font-bold">{selectedSensor.battery}%</p>
                  </div>
                  <div className="bg-nature-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Signal size={16} className="text-nature-600" />
                      <span className="text-xs font-bold text-nature-600">Signal</span>
                    </div>
                    <p className="text-lg font-bold">{selectedSensor.signal}%</p>
                  </div>
                </div>

                <div className="bg-nature-50 p-4 rounded-xl">
                  <h5 className="font-bold text-sm mb-3 text-nature-600">Current Readings</h5>
                  <div className="space-y-2">
                    {Object.entries(selectedSensor.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-nature-600 capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-nature-50 p-4 rounded-xl">
                  <h5 className="font-bold text-sm mb-2 text-nature-600">Location</h5>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-nature-400" />
                    <span>{selectedSensor.location.lat.toFixed(4)}, {selectedSensor.location.lng.toFixed(4)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-nature-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-nature-800 transition-colors">
                    View History
                  </button>
                  <button className="px-4 py-3 bg-nature-100 text-nature-900 rounded-xl hover:bg-nature-200 transition-colors">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};