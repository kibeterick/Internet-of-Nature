import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Lightbulb, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface MLPrediction {
  id: string;
  title: string;
  confidence: number;
  timeframe: string;
  category: 'growth' | 'risk' | 'optimization' | 'anomaly';
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface PatternData {
  date: string;
  actual: number;
  predicted: number;
  confidence: number;
}

export const MLInsights = () => {
  const [selectedPrediction, setSelectedPrediction] = useState<MLPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const predictions: MLPrediction[] = [
    {
      id: '1',
      title: 'Biodiversity Surge Expected',
      confidence: 87,
      timeframe: '2-3 weeks',
      category: 'growth',
      description: 'ML models predict a 15% increase in species diversity based on current environmental conditions and seasonal patterns.',
      impact: 'high',
      actionable: true
    },
    {
      id: '2',
      title: 'Drought Risk Detection',
      confidence: 73,
      timeframe: '4-6 weeks',
      category: 'risk',
      description: 'Weather pattern analysis suggests potential water stress. Recommend increasing irrigation frequency by 20%.',
      impact: 'medium',
      actionable: true
    },
    {
      id: '3',
      title: 'Optimal Planting Window',
      confidence: 92,
      timeframe: '1-2 weeks',
      category: 'optimization',
      description: 'Soil temperature and moisture conditions will be ideal for new plantings. Success rate predicted at 94%.',
      impact: 'high',
      actionable: true
    },
    {
      id: '4',
      title: 'Unusual Acoustic Pattern',
      confidence: 65,
      timeframe: 'Current',
      category: 'anomaly',
      description: 'Detected irregular bird call patterns that may indicate environmental stress or new species presence.',
      impact: 'low',
      actionable: false
    }
  ];

  const patternData: PatternData[] = [
    { date: '2024-01', actual: 75, predicted: 73, confidence: 85 },
    { date: '2024-02', actual: 78, predicted: 76, confidence: 88 },
    { date: '2024-03', actual: 82, predicted: 81, confidence: 90 },
    { date: '2024-04', actual: 79, predicted: 83, confidence: 87 },
    { date: '2024-05', actual: 85, predicted: 84, confidence: 92 },
    { date: '2024-06', actual: 88, predicted: 87, confidence: 89 },
  ];

  const correlationData = [
    { x: 42, y: 85, name: 'Soil Moisture vs Biodiversity' },
    { x: 24, y: 78, name: 'Temperature vs Growth Rate' },
    { x: 65, y: 92, name: 'Humidity vs Air Quality' },
    { x: 12, y: 88, name: 'Wind Speed vs Pollination' },
    { x: 7.2, y: 76, name: 'pH vs Plant Health' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'growth': return <TrendingUp size={16} className="text-emerald-500" />;
      case 'risk': return <AlertCircle size={16} className="text-red-500" />;
      case 'optimization': return <Target size={16} className="text-blue-500" />;
      case 'anomaly': return <Zap size={16} className="text-purple-500" />;
      default: return <Brain size={16} className="text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'growth': return 'bg-emerald-50 border-emerald-200';
      case 'risk': return 'bg-red-50 border-red-200';
      case 'optimization': return 'bg-blue-50 border-blue-200';
      case 'anomaly': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate ML analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  useEffect(() => {
    // Auto-run analysis on component mount
    setTimeout(() => runAnalysis(), 1000);
  }, []);

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Brain size={24} className="text-purple-600" />
            ML Insights Engine
          </h3>
          <p className="text-nature-500 text-sm">AI-powered predictions and pattern analysis</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <Brain size={16} />
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Analysis Progress */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-50 p-4 rounded-2xl border border-purple-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <Brain size={20} className="text-purple-600" />
              </motion.div>
              <span className="text-sm font-bold text-purple-900">Processing environmental data...</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysisProgress}%` }}
                className="h-2 bg-purple-600 rounded-full"
              />
            </div>
            <p className="text-xs text-purple-700 mt-1">{Math.round(analysisProgress)}% complete</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Predictions */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-nature-500 uppercase tracking-wider">AI Predictions</h4>
          <div className="space-y-3">
            {predictions.map((prediction, i) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedPrediction(prediction)}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md",
                  getCategoryColor(prediction.category)
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(prediction.category)}
                    <span className="font-bold text-sm">{prediction.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-bold", getImpactColor(prediction.impact))}>
                      {prediction.impact}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-nature-600">Confidence: {prediction.confidence}%</span>
                  <span className="text-xs text-nature-600">Timeline: {prediction.timeframe}</span>
                </div>
                
                <div className="w-full bg-white/50 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-purple-500"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                
                {prediction.actionable && (
                  <div className="mt-2 flex items-center gap-1">
                    <Lightbulb size={12} className="text-amber-500" />
                    <span className="text-xs text-amber-700 font-medium">Actionable insight</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Prediction Accuracy */}
          <div className="bg-white/50 p-4 rounded-2xl border border-nature-100">
            <h5 className="font-bold text-sm mb-4">Prediction vs Reality</h5>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patternData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Correlation Analysis */}
          <div className="bg-white/50 p-4 rounded-2xl border border-nature-100">
            <h5 className="font-bold text-sm mb-4">Factor Correlations</h5>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis dataKey="y" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter dataKey="y" fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-200">
        <h5 className="font-bold mb-4 flex items-center gap-2">
          <Target size={18} className="text-purple-600" />
          Model Performance Metrics
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">94.2%</p>
            <p className="text-xs text-purple-700 font-medium">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">87.5%</p>
            <p className="text-xs text-blue-700 font-medium">Precision</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">91.8%</p>
            <p className="text-xs text-emerald-700 font-medium">Recall</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">2.3ms</p>
            <p className="text-xs text-amber-700 font-medium">Inference Time</p>
          </div>
        </div>
      </div>

      {/* Prediction Detail Modal */}
      <AnimatePresence>
        {selectedPrediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedPrediction(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(selectedPrediction.category)}
                  <h4 className="text-xl font-bold">{selectedPrediction.title}</h4>
                </div>
                <button
                  onClick={() => setSelectedPrediction(null)}
                  className="p-2 hover:bg-nature-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-nature-50 p-3 rounded-xl">
                    <p className="text-xs font-bold text-nature-600 mb-1">Confidence</p>
                    <p className="text-lg font-bold">{selectedPrediction.confidence}%</p>
                  </div>
                  <div className="bg-nature-50 p-3 rounded-xl">
                    <p className="text-xs font-bold text-nature-600 mb-1">Timeframe</p>
                    <p className="text-lg font-bold">{selectedPrediction.timeframe}</p>
                  </div>
                </div>

                <div className="bg-nature-50 p-4 rounded-xl">
                  <p className="text-sm text-nature-800 leading-relaxed">{selectedPrediction.description}</p>
                </div>

                {selectedPrediction.actionable && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={16} className="text-amber-600" />
                      <span className="text-sm font-bold text-amber-800">Recommended Actions</span>
                    </div>
                    <p className="text-sm text-amber-800">
                      Based on this prediction, consider implementing the suggested environmental adjustments to optimize outcomes.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPrediction(null)}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};