import React, { useState } from 'react';
import { Heart, TrendingUp, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface HealthMetric {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export const EcosystemHealth = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const healthMetrics: HealthMetric[] = [
    {
      name: 'Biodiversity',
      score: 85,
      status: 'excellent',
      trend: 'up',
      description: 'Species diversity is thriving with 12 different species detected this week'
    },
    {
      name: 'Soil Quality',
      score: 78,
      status: 'good',
      trend: 'stable',
      description: 'Nutrient levels are balanced, pH within optimal range'
    },
    {
      name: 'Air Quality',
      score: 92,
      status: 'excellent',
      trend: 'up',
      description: 'Excellent air purity with low pollutant levels'
    },
    {
      name: 'Water Cycle',
      score: 65,
      status: 'fair',
      trend: 'down',
      description: 'Moisture retention could be improved, consider irrigation adjustments'
    },
    {
      name: 'Carbon Storage',
      score: 88,
      status: 'excellent',
      trend: 'up',
      description: 'Trees are effectively sequestering carbon, above regional average'
    }
  ];

  const overallScore = Math.round(healthMetrics.reduce((sum, metric) => sum + metric.score, 0) / healthMetrics.length);

  const pieData = healthMetrics.map(metric => ({
    name: metric.name,
    value: metric.score,
    color: getStatusColor(metric.status)
  }));

  const trendData = [
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 78 },
    { month: 'Mar', score: 82 },
    { month: 'Apr', score: 79 },
    { month: 'May', score: 85 },
    { month: 'Jun', score: overallScore },
  ];

  function getStatusColor(status: string) {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'excellent': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'good': return <CheckCircle size={16} className="text-blue-500" />;
      case 'fair': return <AlertCircle size={16} className="text-amber-500" />;
      case 'poor': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  }

  function getTrendIcon(trend: string) {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-emerald-500" />;
      case 'down': return <TrendingUp size={14} className="text-red-500 rotate-180" />;
      default: return <div className="w-3 h-0.5 bg-gray-400 rounded" />;
    }
  }

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Heart size={24} className="text-red-500" />
            Ecosystem Health Score
          </h3>
          <p className="text-nature-500 text-sm">Comprehensive environmental wellness assessment</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600">{overallScore}</div>
          <div className="text-xs text-nature-500 uppercase font-bold tracking-wider">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Health Metrics */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-nature-500 uppercase tracking-wider">Health Indicators</h4>
          <div className="space-y-3">
            {healthMetrics.map((metric, i) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedMetric(selectedMetric === metric.name ? null : metric.name)}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer transition-all",
                  selectedMetric === metric.name 
                    ? "bg-nature-50 border-nature-300" 
                    : "bg-white/50 border-nature-100 hover:border-nature-200"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.status)}
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <span className="text-lg font-bold">{metric.score}</span>
                  </div>
                </div>
                
                <div className="w-full bg-nature-100 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(metric.status) }}
                  />
                </div>

                {selectedMetric === metric.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-nature-200"
                  >
                    <p className="text-xs text-nature-600">{metric.description}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="bg-white/50 p-4 rounded-2xl border border-nature-100">
            <h5 className="font-bold text-sm mb-4">Health Distribution</h5>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white/50 p-4 rounded-2xl border border-nature-100">
            <h5 className="font-bold text-sm mb-4">6-Month Trend</h5>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
        <h5 className="font-bold mb-4 flex items-center gap-2">
          <Heart size={18} className="text-blue-600" />
          Health Recommendations
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-blue-900">Immediate Actions:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Increase irrigation frequency for water cycle improvement</li>
              <li>• Monitor soil pH levels weekly</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-blue-900">Long-term Goals:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Plant native species to boost biodiversity</li>
              <li>• Implement composting system for soil enrichment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};