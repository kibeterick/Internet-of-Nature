import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonData {
  date: string;
  current: number;
  previous: number;
}

export const HistoricalComparison = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const comparisonData: ComparisonData[] = [
    { date: 'Mon', current: 42, previous: 38 },
    { date: 'Tue', current: 45, previous: 40 },
    { date: 'Wed', current: 43, previous: 42 },
    { date: 'Thu', current: 46, previous: 41 },
    { date: 'Fri', current: 44, previous: 39 },
    { date: 'Sat', current: 47, previous: 43 },
    { date: 'Sun', current: 45, previous: 40 },
  ];

  const metrics = [
    { 
      label: 'Soil Moisture', 
      current: 42, 
      previous: 38, 
      unit: '%',
      trend: 'up',
      change: 10.5
    },
    { 
      label: 'Biodiversity Index', 
      current: 7.8, 
      previous: 7.2, 
      unit: '/10',
      trend: 'up',
      change: 8.3
    },
    { 
      label: 'Air Quality', 
      current: 12, 
      previous: 15, 
      unit: 'AQI',
      trend: 'down',
      change: 20.0
    },
  ];

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Calendar size={24} className="text-nature-600" />
            Historical Comparison
          </h3>
          <p className="text-nature-500 text-sm">Compare current vs previous period</p>
        </div>
        <div className="flex bg-nature-100 rounded-full p-1">
          {(['week', 'month', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all capitalize",
                selectedPeriod === period ? "bg-white shadow-sm" : ""
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/50 p-4 rounded-2xl border border-nature-100"
          >
            <p className="text-xs text-nature-500 font-medium mb-2">{metric.label}</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold">{metric.current}</span>
              <span className="text-sm text-nature-400">{metric.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              {metric.trend === 'up' ? (
                <TrendingUp size={16} className="text-emerald-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
              <span className={cn(
                "text-xs font-bold",
                metric.trend === 'up' ? "text-emerald-600" : "text-red-600"
              )}>
                {metric.change}% vs last {selectedPeriod}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="h-[300px] min-h-[300px] w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 12, fill: '#9ca3af'}} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 12, fill: '#9ca3af'}} 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#10b981" 
              strokeWidth={3} 
              name="Current Period"
              dot={{ fill: '#10b981', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="previous" 
              stroke="#9ca3af" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              name="Previous Period"
              dot={{ fill: '#9ca3af', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
