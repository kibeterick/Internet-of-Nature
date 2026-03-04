import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  Droplets, Thermometer, Wind, Leaf, 
  Activity, Map as MapIcon, MessageSquare, 
  TreePine, Bird, Bug, Sun, CloudRain,
  Camera, Upload, Sparkles, Mic2, 
  ChevronRight, Info, AlertTriangle,
  Eye, Zap, Database,
  Globe, LayoutDashboard, Search, Bell,
  BookOpen, ShieldCheck, Key, Cpu, Wifi, Code, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { askNatureAI, askNatureAIStream, identifySpecies, generateEcologicalReport, simulateEcosystemResponse } from './services/geminiService';
import Markdown from 'react-markdown';
import { NotificationCenter } from './components/NotificationCenter';
import { DataExportPanel } from './components/DataExportPanel';
import { OfflineMode } from './components/OfflineMode';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoricalComparison } from './components/HistoricalComparison';
import { AlertConfiguration } from './components/AlertConfiguration';
import { notificationService } from './services/notificationService';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// --- Types ---

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  icon: React.ElementType;
  color: string;
}

interface HistoricalData {
  time: string;
  moisture: number;
  temp: number;
  biodiversity: number;
}

// --- Mock Data ---

const MOCK_SENSORS: SensorData[] = [
  { id: '1', name: 'Soil Moisture', value: 42, unit: '%', status: 'optimal', icon: Droplets, color: 'text-blue-500' },
  { id: '2', name: 'Ambient Temp', value: 24.5, unit: '°C', status: 'optimal', icon: Thermometer, color: 'text-orange-500' },
  { id: '3', name: 'Air Quality', value: 12, unit: 'AQI', status: 'optimal', icon: Wind, color: 'text-emerald-500' },
  { id: '4', name: 'Biodiversity Index', value: 7.8, unit: '/10', status: 'warning', icon: Activity, color: 'text-purple-500' },
];

const MOCK_HISTORY: HistoricalData[] = [
  { time: '00:00', moisture: 45, temp: 18, biodiversity: 7.2 },
  { time: '04:00', moisture: 48, temp: 16, biodiversity: 7.0 },
  { time: '08:00', moisture: 46, temp: 20, biodiversity: 7.5 },
  { time: '12:00', moisture: 42, temp: 25, biodiversity: 7.8 },
  { time: '16:00', moisture: 40, temp: 26, biodiversity: 8.0 },
  { time: '20:00', moisture: 41, temp: 22, biodiversity: 7.9 },
];

const PREDICTIVE_DATA = [
  { day: 'Mon', risk: 20 },
  { day: 'Tue', risk: 25 },
  { day: 'Wed', risk: 45 },
  { day: 'Thu', risk: 60 },
  { day: 'Fri', risk: 30 },
  { day: 'Sat', risk: 15 },
  { day: 'Sun', risk: 10 },
];

// --- Socket Hook ---

const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [activeUsers, setActiveUsers] = useState(1);
  const [contributions, setContributions] = useState<any[]>([]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      console.log('Connected to Ecosystem Mesh');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'PRESENCE_UPDATE') {
        setActiveUsers(data.count);
      } else if (data.type === 'INIT') {
        setContributions(data.contributions);
      } else if (data.type === 'CONTRIBUTION_ADDED') {
        setContributions(prev => [data.payload, ...prev].slice(0, 20));
      }
    };

    return () => ws.close();
  }, []);

  const addContribution = (payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'NEW_CONTRIBUTION', payload }));
    }
  };

  return { activeUsers, contributions, addContribution };
};

// --- Components ---

const ICON_MAP: Record<string, any> = {
  Leaf, Zap, Sparkles, Database, Camera, Activity
};

const SensorCard = ({ sensor }: { sensor: SensorData }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="glass p-6 rounded-3xl flex flex-col gap-4"
  >
    <div className="flex justify-between items-start">
      <div className={cn("p-3 rounded-2xl bg-white/50", sensor.color)}>
        <sensor.icon size={24} />
      </div>
      <div className={cn(
        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        sensor.status === 'optimal' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      )}>
        {sensor.status}
      </div>
    </div>
    <div>
      <p className="text-nature-500 text-sm font-medium">{sensor.name}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-3xl font-serif font-bold">{sensor.value}</h3>
        <span className="text-nature-400 text-sm">{sensor.unit}</span>
      </div>
    </div>
  </motion.div>
);

const CommunityHub = ({ contributions, onContribute }: { contributions: any[], onContribute: (p: any) => void }) => {
  const handleQuickAction = (action: string, icon: string) => {
    onContribute({
      user: "Guest Scientist",
      location: "Local Node",
      action,
      icon
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-[40px] space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Globe size={24} className="text-nature-600" />
                Global Community Feed
              </h3>
              <p className="text-nature-500 text-sm">Real-time insights from citizen scientists worldwide</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleQuickAction("Identified local flora", "Leaf")}
                className="p-2 bg-nature-100 rounded-xl hover:bg-nature-200 transition-all text-nature-600"
                title="Identify Flora"
              >
                <Leaf size={18} />
              </button>
              <button 
                onClick={() => handleQuickAction("Captured ecosystem audio", "Activity")}
                className="p-2 bg-nature-100 rounded-xl hover:bg-nature-200 transition-all text-nature-600"
                title="Record Audio"
              >
                <Activity size={18} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {contributions.map(c => {
              const Icon = ICON_MAP[c.icon] || Leaf;
              return (
                <motion.div 
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-nature-100 hover:border-nature-300 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-nature-100 rounded-xl flex items-center justify-center text-nature-600 group-hover:bg-nature-900 group-hover:text-white transition-all">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-nature-900">{c.user} <span className="text-nature-400 font-normal">in</span> {c.location}</p>
                      <p className="text-xs text-nature-500">{c.action}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-nature-400 uppercase tracking-widest">{c.time}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] bg-nature-900 text-white space-y-6">
          <h3 className="text-xl font-bold">Global Impact</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-nature-400">
                <span>Active Continents</span>
                <span>6 / 7</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[85%]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl">
                <p className="text-2xl font-bold">12.4k</p>
                <p className="text-[10px] text-nature-400 uppercase font-bold tracking-widest">Contributors</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <p className="text-2xl font-bold">840t</p>
                <p className="text-[10px] text-nature-400 uppercase font-bold tracking-widest">CO2 Offset</p>
              </div>
            </div>
            <button className="w-full py-4 bg-white text-nature-900 rounded-2xl font-bold text-sm hover:bg-nature-100 transition-all">
              Join the Network
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpeciesIDTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        handleAnalyze(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (data: string, type: string) => {
    setIsAnalyzing(true);
    setResult(null);
    const analysis = await identifySpecies(data, type);
    setResult(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="glass rounded-[40px] p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Camera size={24} className="text-nature-600" />
            Species Identifier
          </h3>
          <p className="text-nature-500 text-sm">Upload a photo to identify urban flora & fauna</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-nature-900 text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-nature-800 transition-all"
        >
          <Upload size={14} />
          Upload Photo
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={cn(
          "aspect-video rounded-3xl border-2 border-dashed border-nature-200 flex flex-col items-center justify-center relative overflow-hidden bg-nature-100/30",
          image && "border-none"
        )}>
          {image ? (
            <img src={image} alt="Upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="text-center p-8">
              <Camera size={48} className="mx-auto text-nature-300 mb-4" />
              <p className="text-nature-400 text-sm font-medium">Drag and drop or click to upload</p>
            </div>
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="text-nature-600 mb-4"
              >
                <Sparkles size={32} />
              </motion.div>
              <p className="text-nature-900 font-bold animate-pulse">Analyzing Species...</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/50 p-6 rounded-3xl h-full overflow-y-auto max-h-[300px] markdown-body text-sm"
            >
              <Markdown>{result}</Markdown>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40 italic text-nature-500">
              <Info size={32} className="mb-2" />
              <p>Analysis results will appear here after upload</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AcousticMonitor = () => {
  const [isActive, setIsActive] = useState(false);
  const [detections, setDetections] = useState<{ time: string, species: string, confidence: number }[]>([]);

  const toggleMonitor = () => {
    setIsActive(!isActive);
    if (!isActive) {
      // Simulate detections
      const timer = setTimeout(() => {
        setDetections(prev => [{
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          species: "American Robin (Turdus migratorius)",
          confidence: 94
        }, ...prev]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Mic2 size={20} className="text-nature-600" />
          Acoustic Monitoring
        </h3>
        <button 
          onClick={toggleMonitor}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
            isActive ? "bg-red-100 text-red-600" : "bg-nature-900 text-white"
          )}
        >
          {isActive ? "Stop Listening" : "Start Monitor"}
        </button>
      </div>

      <div className="h-24 bg-nature-950 rounded-2xl flex items-center justify-center gap-1 px-4 overflow-hidden relative">
        {isActive ? (
          Array.from({ length: 30 }).map((_, i) => (
            <motion.div 
              key={i}
              animate={{ height: [10, Math.random() * 60 + 10, 10] }}
              transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
              className="w-1 bg-emerald-500 rounded-full opacity-60"
            />
          ))
        ) : (
          <div className="w-full h-[2px] bg-nature-800" />
        )}
        {!isActive && <span className="absolute text-[10px] uppercase font-bold text-nature-700">Sensor Offline</span>}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold text-nature-500">Recent Detections</p>
        {detections.length > 0 ? (
          detections.map((d, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={i} 
              className="flex justify-between items-center p-2 bg-white/50 rounded-xl text-[10px]"
            >
              <div className="flex items-center gap-2">
                <Bird size={12} className="text-nature-600" />
                <span className="font-medium">{d.species}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-nature-400">{d.time}</span>
                <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded-md">{d.confidence}%</span>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-[10px] text-nature-400 italic">No audio detections in current session</p>
        )}
      </div>
    </div>
  );
};

const PredictiveAnalytics = () => {
  const [showDetails, setShowDetails] = useState(false);

  const insights = [
    {
      title: "Optimized Watering Schedule",
      icon: Droplets,
      color: "text-blue-600",
      bg: "bg-blue-50",
      advice: "Based on 48h forecast (28°C avg) and current 42% soil moisture, initiate deep-root irrigation at 04:30 AM for 18 minutes. This minimizes evaporative loss and ensures hydration before peak solar intensity."
    },
    {
      title: "Pest Risk: Aphid Detection",
      icon: Bug,
      color: "text-amber-600",
      bg: "bg-amber-50",
      advice: "Acoustic sensors and visual health markers suggest a 35% increase in Aphid activity in Sector 4. Recommendation: Introduce biological controls (Ladybugs) or apply neem oil solution to affected canopy areas."
    },
    {
      title: "Nutrient Supplementation",
      icon: Leaf,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      advice: "Soil microbiome analysis indicates a slight dip in nitrogen levels. AI suggests a light application of organic compost tea to boost fungal-to-bacterial ratios before the weekend rain."
    }
  ];

  return (
    <div className="glass rounded-3xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Zap size={20} className="text-amber-500" />
          Predictive Insights
        </h3>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 bg-amber-50 rounded-xl text-amber-600 hover:bg-amber-100 transition-colors"
        >
          <Info size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase">Heat Stress Warning</span>
            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-[8px] font-bold">HIGH RISK</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            AI models predict a 45% increase in soil evaporation rates over the next 48 hours. 
            Irrigation systems are being pre-emptively adjusted.
          </p>
        </div>

        <div className="h-[120px] min-h-[120px] w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
            <BarChart data={PREDICTIVE_DATA}>
              <Bar dataKey="risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[10px] text-nature-400 font-medium uppercase tracking-wider">7-Day Ecological Risk Forecast</p>

        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-4 border-t border-nature-200 overflow-hidden"
            >
              <p className="text-[10px] uppercase font-bold text-nature-500 mb-2">AI-Driven Action Plan</p>
              {insights.map((insight, i) => (
                <div key={i} className={cn("p-3 rounded-2xl space-y-2", insight.bg)}>
                  <div className="flex items-center gap-2">
                    <insight.icon size={14} className={insight.color} />
                    <span className={cn("text-xs font-bold", insight.color)}>{insight.title}</span>
                  </div>
                  <p className="text-[11px] text-nature-800 leading-relaxed">
                    {insight.advice}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!showDetails && (
          <button 
            onClick={() => setShowDetails(true)}
            className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-nature-500 hover:text-nature-900 transition-colors"
          >
            View Detailed Action Plan
          </button>
        )}
      </div>
    </div>
  );
};

const NatureChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    "How is the soil health?",
    "Identify local birds",
    "Irrigation advice",
    "Biodiversity status"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    let aiResponse = "";
    setMessages(prev => [...prev, { role: 'ai', content: "" }]);

    try {
      const stream = askNatureAIStream(messageText, "Current site: Central Park Urban Forest. Soil moisture is 42%, Biodiversity index is 7.8/10.");
      for await (const chunk of stream) {
        aiResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'ai', content: aiResponse };
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl flex flex-col h-[550px] overflow-hidden">
      <div className="p-6 border-b border-nature-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-nature-600 flex items-center justify-center text-white">
            <Leaf size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Nature Intelligence</h3>
            <p className="text-xs text-nature-500">Real-time ecological guidance</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])}
          className="text-nature-400 hover:text-nature-900 transition-colors"
          title="Clear Chat"
        >
          <Zap size={16} />
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="p-4 bg-nature-100 rounded-full text-nature-400">
              <MessageSquare size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-nature-600">"How can I help you sustain the urban forest today?"</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map(s => (
                  <button 
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-white border border-nature-200 rounded-full hover:bg-nature-50 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm shadow-sm",
              msg.role === 'user' 
                ? "ml-auto bg-nature-600 text-white rounded-tr-none" 
                : "mr-auto bg-white border border-nature-100 text-nature-900 rounded-tl-none"
            )}
          >
            <div className="markdown-body prose prose-sm prose-nature">
              <Markdown>{msg.content || "..."}</Markdown>
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length-1]?.content === "" && (
          <div className="mr-auto bg-nature-100 p-4 rounded-2xl rounded-tl-none animate-pulse">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-nature-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-nature-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-nature-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-nature-100/50 border-t border-nature-200">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about soil health, species, or irrigation..."
            className="flex-1 bg-white rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nature-500/20 border border-nature-200"
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading}
            className="bg-nature-800 text-white p-2.5 rounded-full hover:bg-nature-900 transition-colors disabled:opacity-50"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveDataStream = () => {
  const [data, setData] = useState<{ time: string, value: number }[]>([]);
  
  useEffect(() => {
    // Initialize with some data
    const initialData = Array.from({ length: 20 }).map((_, i) => ({
      time: new Date(Date.now() - (20 - i) * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      value: 40 + Math.random() * 10
    }));
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: 40 + Math.random() * 10
        }];
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={24} className="text-blue-500 animate-pulse" />
            Live Sensor Stream
          </h3>
          <p className="text-nature-500 text-sm">Real-time soil moisture telemetry (3s polling)</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          CONNECTED
        </div>
      </div>

      <div className="h-[250px] min-h-[250px] w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: '#9ca3af'}} 
              interval={4}
            />
            <YAxis 
              domain={[30, 60]} 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: '#9ca3af'}} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorLive)" 
              strokeWidth={3} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MapPreview = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeLayers, setActiveLayers] = useState(['sensors', 'vegetation']);

  const NODES = [
    { id: '04', name: 'Sensor Node 04', type: 'sensor', status: 'Active', pos: { top: '33%', left: '50%' }, data: { moisture: '42%', temp: '24°C' } },
    { id: '07', name: 'Sensor Node 07', type: 'sensor', status: 'Warning', pos: { bottom: '25%', right: '33%' }, data: { moisture: '28%', temp: '29°C' } },
    { id: '01', name: 'Tree Cluster A', type: 'vegetation', status: 'Healthy', pos: { top: '20%', left: '20%' }, data: { health: '92%', species: 'Oak' } },
  ];

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
  };

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MapIcon size={20} className="text-nature-600" />
          Ecosystem Map
        </h3>
        <div className="flex gap-2">
          {['sensors', 'vegetation', 'heatmap'].map(layer => (
            <button 
              key={layer}
              onClick={() => toggleLayer(layer)}
              className={cn(
                "px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all",
                activeLayers.includes(layer) ? "bg-nature-900 text-white" : "bg-nature-100 text-nature-400"
              )}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-nature-900 rounded-2xl relative overflow-hidden group border border-nature-800">
        {/* Map Layers */}
        <div className={cn(
          "absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center transition-all duration-1000 scale-110 group-hover:scale-100",
          activeLayers.includes('vegetation') ? "opacity-40" : "opacity-10 grayscale"
        )} />
        
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Scanning Line Animation */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-emerald-500/30 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />

        {activeLayers.includes('heatmap') && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-transparent to-emerald-500/30 mix-blend-overlay animate-pulse z-0" />
        )}

        {/* Interactive Markers */}
        {activeLayers.includes('sensors') && NODES.filter(n => n.type === 'sensor').map(node => (
          <motion.div 
            key={node.id}
            style={node.pos}
            animate={selectedNode?.id === node.id ? { scale: 1.5, opacity: 1 } : (
              node.status === 'Active' 
                ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } 
                : { scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }
            )}
            transition={{ 
              repeat: selectedNode?.id === node.id ? 0 : Infinity, 
              duration: node.status === 'Active' ? 3 : 1,
              ease: "easeInOut"
            }}
            onClick={() => setSelectedNode(node)}
            className={cn(
              "absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer z-20",
              node.status === 'Active' ? "bg-emerald-500" : "bg-amber-500"
            )}
          />
        ))}

        {activeLayers.includes('vegetation') && NODES.filter(n => n.type === 'vegetation').map(node => (
          <motion.div 
            key={node.id}
            style={node.pos}
            onClick={() => setSelectedNode(node)}
            className="absolute w-3 h-3 bg-nature-700 rounded-sm rotate-45 border border-white shadow-md cursor-pointer z-20"
          />
        ))}

        {/* Node Detail Popup */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute top-4 left-4 right-4 glass p-4 rounded-2xl z-30 shadow-xl border-nature-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm">{selectedNode.name}</h4>
                  <p className="text-[10px] text-nature-500 uppercase font-bold tracking-widest">{selectedNode.status}</p>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-nature-400 hover:text-nature-900">
                  <Zap size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedNode.data).map(([key, val]: [any, any]) => (
                  <div key={key} className="bg-nature-50 p-2 rounded-xl">
                    <p className="text-[8px] uppercase font-bold text-nature-400">{key}</p>
                    <p className="text-xs font-bold text-nature-900">{val}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass p-2 rounded-xl text-[8px] space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">Active Sensor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-medium">Warning Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-nature-700 rounded-sm rotate-45" />
            <span className="font-medium">Tree Cluster</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 glass p-2 rounded-xl text-[8px] font-bold text-nature-500 z-10">
          Live: 2m ago
        </div>
      </div>
    </div>
  );
};

const AILab = () => {
  const [scenario, setScenario] = useState('');
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const SCENARIOS = [
    "Heatwave: +5°C for 3 days",
    "Extreme Rainfall: 100mm in 6h",
    "Invasive Species: Spotted Lanternfly",
    "Urban Development: New concrete path"
  ];

  const handleSimulate = async (text?: string) => {
    const scenarioText = text || scenario;
    if (!scenarioText.trim()) return;
    setIsSimulating(true);
    setSimulationResult(null);
    const result = await simulateEcosystemResponse(scenarioText, {
      moisture: 42,
      temp: 24.5,
      biodiversity: 7.8
    });
    setSimulationResult(result);
    setIsSimulating(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReport(null);
    const result = await generateEcologicalReport({
      sensors: MOCK_SENSORS,
      history: MOCK_HISTORY,
      predictive: PREDICTIVE_DATA
    });
    setReport(result);
    setIsGeneratingReport(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulator */}
        <div className="glass p-8 rounded-[40px] space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles size={24} className="text-nature-600" />
                Ecosystem Simulator
              </h3>
              <p className="text-nature-500 text-sm">Predict impacts of environmental shifts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map(s => (
                <button 
                  key={s}
                  onClick={() => handleSimulate(s)}
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-nature-100 rounded-full hover:bg-nature-200 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Enter custom scenario..."
                className="flex-1 bg-white rounded-full px-5 py-2.5 text-sm focus:outline-none border border-nature-200"
              />
              <button 
                onClick={() => handleSimulate()}
                disabled={isSimulating}
                className="bg-nature-900 text-white px-6 py-2.5 rounded-full text-sm font-bold disabled:opacity-50"
              >
                Simulate
              </button>
            </div>
          </div>

          <div className="min-h-[200px] bg-nature-50/50 rounded-3xl p-6 relative overflow-hidden">
            {isSimulating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-nature-600 mb-2"
                >
                  <Database size={32} />
                </motion.div>
                <p className="text-xs font-bold text-nature-900 uppercase tracking-widest">Running AI Model...</p>
              </div>
            ) : simulationResult ? (
              <div className="markdown-body text-sm">
                <Markdown>{simulationResult}</Markdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic text-nature-500">
                <Info size={32} className="mb-2" />
                <p>Select a scenario to begin simulation</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Generator */}
        <div className="glass p-8 rounded-[40px] space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Database size={24} className="text-nature-600" />
                Ecological Health Report
              </h3>
              <p className="text-nature-500 text-sm">Generate a deep-dive AI analysis</p>
            </div>
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="bg-nature-900 text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Zap size={16} />
              {isGeneratingReport ? "Generating..." : "Generate Report"}
            </button>
          </div>

          <div className="min-h-[350px] bg-white/50 rounded-3xl p-8 border border-nature-100 overflow-y-auto max-h-[400px]">
            {isGeneratingReport ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-nature-200 rounded w-1/4" />
                <div className="h-2 bg-nature-100 rounded w-full" />
                <div className="h-2 bg-nature-100 rounded w-full" />
                <div className="h-2 bg-nature-100 rounded w-3/4" />
                <div className="h-4 bg-nature-200 rounded w-1/3 mt-6" />
                <div className="h-2 bg-nature-100 rounded w-full" />
                <div className="h-2 bg-nature-100 rounded w-5/6" />
              </div>
            ) : report ? (
              <div className="markdown-body text-sm">
                <Markdown>{report}</Markdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic text-nature-500 py-10">
                <Leaf size={48} className="mb-4" />
                <p className="max-w-xs">Generate a report to see a comprehensive analysis of the site's ecological health markers.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [visibleMetrics, setVisibleMetrics] = useState(['moisture', 'biodiversity']);
  const [lang, setLang] = useState('EN');
  const [showGenieInfo, setShowGenieInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { activeUsers, contributions, addContribution } = useSocket();

  // Request notification permission on mount
  useEffect(() => {
    notificationService.requestPermission();
    
    // Simulate some notifications for demo
    setTimeout(() => {
      notificationService.addNotification({
        type: 'warning',
        title: 'Soil Moisture Alert',
        message: 'Sensor Node 07 reports moisture below optimal threshold (28%)',
      });
    }, 5000);
  }, []);

  const toggleMetric = (metric: string) => {
    setVisibleMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric) 
        : [...prev, metric]
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <OfflineMode />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {/* Top Pink Bar */}
      <div className="h-14 bg-[#FFB6C1] w-full" />

      {/* Navigation */}
      <nav className="px-6 py-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-nature-900 text-white rounded-2xl flex items-center justify-center shadow-lg rotate-3">
            <TreePine size={28} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">Internet of Nature</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nature-500">Global Network Active</p>
            </div>
          </div>
        </div>

        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-sm overflow-x-auto max-w-full">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'species', label: 'Species ID', icon: Search },
            { id: 'analytics', label: 'Analytics', icon: Database },
            { id: 'ailab', label: 'AI Lab', icon: Sparkles },
            { id: 'community', label: 'Community', icon: Globe },
            { id: 'docs', label: 'Docs', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-nature-900 text-white shadow-md" 
                  : "text-nature-500 hover:text-nature-900 hover:bg-white/50"
              )}
            >
              <tab.icon size={18} />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <NotificationCenter />
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {activeUsers} SCIENTISTS ONLINE
          </div>
          <div className="flex bg-nature-100 rounded-full p-1">
            {['EN', 'ES', 'FR', 'SW'].map(l => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "w-8 h-8 rounded-full text-[10px] font-bold transition-all",
                  lang === l ? "bg-white text-nature-900 shadow-sm" : "text-nature-400 hover:text-nature-600"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-nature-100 rounded-full transition-colors"
          >
            <Settings size={20} className="text-nature-600" />
          </button>
          <button className="bg-nature-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-nature-800 transition-all shadow-lg shadow-nature-900/10 hidden sm:block">
            Connect Sensor
          </button>
        </div>
      </nav>

      <main className="px-6 max-w-7xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Project Genie Hero */}
              <div className="relative w-full bg-black rounded-[40px] overflow-hidden flex flex-col items-center justify-center text-center py-32 px-6 min-h-[600px] shadow-2xl group">
                {/* Video Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-[10s]"
                  >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
                </div>

                {/* Portal Backgrounds - Bubbles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                  {/* Left-most Bubble */}
                  <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-[350px] aspect-square rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                    <img src="https://picsum.photos/seed/portal3/800/800" className="w-full h-full object-cover opacity-30 grayscale" referrerPolicy="no-referrer" />
                  </div>
                  {/* Left Bubble */}
                  <div className="absolute top-[60%] left-0 -translate-y-1/2 w-[450px] aspect-square rounded-full overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] backdrop-blur-md">
                    <img src="https://picsum.photos/seed/portal1/800/800" className="w-full h-full object-cover opacity-40 grayscale" referrerPolicy="no-referrer" />
                  </div>
                  {/* Center Bubble */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] aspect-square rounded-full overflow-hidden border border-white/30 shadow-[0_0_100px_rgba(255,255,255,0.2)] backdrop-blur-lg">
                    <img src="https://picsum.photos/seed/nature/800/800" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                  </div>
                  {/* Right Bubble */}
                  <div className="absolute top-[40%] right-0 -translate-y-1/2 w-[450px] aspect-square rounded-full overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] backdrop-blur-md">
                    <img src="https://picsum.photos/seed/portal2/800/800" className="w-full h-full object-cover opacity-40 grayscale" referrerPolicy="no-referrer" />
                  </div>
                  {/* Right-most Bubble */}
                  <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-[350px] aspect-square rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                    <img src="https://picsum.photos/seed/portal4/800/800" className="w-full h-full object-cover opacity-30 grayscale" referrerPolicy="no-referrer" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center gap-10">
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white/60 text-sm font-bold uppercase tracking-[0.5em]"
                  >
                    Featuring
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row items-center gap-8"
                  >
                    <h2 className="text-7xl md:text-[10rem] font-bold text-white tracking-tighter leading-none drop-shadow-2xl">Project Genie</h2>
                    <div className="px-10 py-4 border-2 border-white rounded-full backdrop-blur-md">
                      <span className="text-white text-2xl md:text-4xl font-bold uppercase tracking-widest">Experiment</span>
                    </div>
                  </motion.div>

                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/90 text-2xl md:text-4xl font-medium max-w-4xl leading-relaxed drop-shadow-lg"
                  >
                    Create and explore infinitely diverse worlds.
                  </motion.p>

                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setShowGenieInfo(true)}
                    className="mt-10 bg-white text-black px-16 py-5 rounded-full font-bold text-2xl hover:scale-105 transition-all shadow-2xl active:scale-95"
                  >
                    Learn More
                  </motion.button>
                </div>
              </div>

              {/* Full Information Section (Modal-like) */}
              <AnimatePresence>
                {showGenieInfo && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12"
                  >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowGenieInfo(false)} />
                    <div className="relative w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[80vh]">
                      <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                        <img src="https://picsum.photos/seed/genie-info/1200/1200" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                          <h3 className="text-white text-4xl font-bold">The Future of <br />Ecological Creation</h3>
                        </div>
                      </div>
                      <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <span className="px-3 py-1 bg-nature-100 text-nature-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Project Genie v1.0</span>
                            <h4 className="text-3xl font-bold">Infinite Worlds, Real Impact</h4>
                          </div>
                          <button 
                            onClick={() => setShowGenieInfo(false)}
                            className="p-2 hover:bg-nature-100 rounded-full transition-colors"
                          >
                            <ChevronRight className="rotate-180" size={24} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="w-12 h-12 bg-nature-900 text-white rounded-xl flex items-center justify-center">
                              <Zap size={24} />
                            </div>
                            <h5 className="font-bold text-lg">Real-time Generation</h5>
                            <p className="text-nature-500 text-sm leading-relaxed">
                              Project Genie uses advanced neural networks to generate ecological simulations in real-time, allowing researchers to visualize the long-term impact of urban planning.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                              <Leaf size={24} />
                            </div>
                            <h5 className="font-bold text-lg">Biodiversity Mapping</h5>
                            <p className="text-nature-500 text-sm leading-relaxed">
                              By integrating with our global sensor network, Genie can simulate how new species introductions will affect existing local ecosystems.
                            </p>
                          </div>
                        </div>

                        <div className="bg-nature-50 p-6 rounded-3xl border border-nature-100">
                          <h5 className="font-bold mb-4 flex items-center gap-2">
                            <Info size={18} className="text-nature-600" />
                            Technical Specifications
                          </h5>
                          <ul className="space-y-3 text-sm text-nature-600">
                            <li className="flex justify-between border-bottom border-nature-100 pb-2">
                              <span>Model Architecture</span>
                              <span className="font-mono font-bold">Genie-V3-Alpha</span>
                            </li>
                            <li className="flex justify-between border-bottom border-nature-100 pb-2">
                              <span>Simulation Depth</span>
                              <span className="font-mono font-bold">100+ Years</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Data Sources</span>
                              <span className="font-mono font-bold">Global IoT Mesh</span>
                            </li>
                          </ul>
                        </div>

                        <button 
                          onClick={() => {
                            setActiveTab('ailab');
                            setShowGenieInfo(false);
                          }}
                          className="w-full bg-nature-900 text-white py-4 rounded-2xl font-bold hover:bg-nature-800 transition-all"
                        >
                          Request Early Access
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass p-8 rounded-[40px] relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-nature-100 text-nature-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Site: Central Park</span>
                        <span className="text-nature-400 text-xs">•</span>
                        <span className="text-nature-500 text-xs font-medium">Updated March 3, 2026</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-5xl font-bold leading-tight">Urban Forest <br />Health Status</h2>
                        <button 
                          onClick={() => {
                            setActiveTab('ailab');
                          }}
                          className="self-start md:self-center bg-nature-100 text-nature-900 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-nature-200 transition-all border border-nature-200"
                        >
                          <Sparkles size={18} className="text-nature-600" />
                          Generate AI Health Report
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                        {MOCK_SENSORS.map(s => <SensorCard key={s.id} sensor={s} />)}
                      </div>
                    </div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-nature-200/50 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-nature-300/30 rounded-full blur-3xl" />
                  </div>

                  <div className="glass p-8 rounded-[40px]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                      <h3 className="text-2xl font-bold">Ecological Trends</h3>
                      <p className="text-nature-500 text-sm">Historical sensor data over 24 hours</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => toggleMetric('moisture')}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                          visibleMetrics.includes('moisture') 
                            ? "bg-blue-50 text-blue-600 border-blue-200" 
                            : "bg-white text-nature-400 border-nature-100"
                        )}
                      >
                        Soil Moisture
                      </button>
                      <button 
                        onClick={() => toggleMetric('biodiversity')}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                          visibleMetrics.includes('biodiversity') 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                            : "bg-white text-nature-400 border-nature-100"
                        )}
                      >
                        Biodiversity
                      </button>
                      <div className="w-px h-8 bg-nature-100 mx-2 hidden md:block" />
                      <button className="px-4 py-2 bg-nature-100 rounded-full text-xs font-bold">24H</button>
                      <button className="px-4 py-2 hover:bg-nature-100 rounded-full text-xs font-bold text-nature-400">7D</button>
                    </div>
                  </div>
                  
                  <div className="h-[300px] min-h-[300px] w-full overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
                      <AreaChart data={MOCK_HISTORY}>
                        <defs>
                          <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        {visibleMetrics.includes('moisture') && (
                          <Area type="monotone" dataKey="moisture" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMoisture)" strokeWidth={3} />
                        )}
                        {visibleMetrics.includes('biodiversity') && (
                          <Area type="monotone" dataKey="biodiversity" stroke="#10b981" fillOpacity={1} fill="url(#colorBio)" strokeWidth={3} />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <LiveDataStream />
              </div>

              <div className="space-y-8">
                <NatureChat />
                <MapPreview />
                <HistoricalComparison />
              </div>
            </div>
          </motion.div>
          )}

          {activeTab === 'species' && (
            <motion.div 
              key="species"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <SpeciesIDTool />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[40px] flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Database size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Global Species Database</h3>
                  <p className="text-nature-500 text-sm max-w-xs">Our AI is trained on over 2.5 million species records to provide accurate urban taxonomy.</p>
                  <button className="text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline">View Catalog</button>
                </div>
                <div className="glass p-8 rounded-[40px] flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Eye size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Visual Recognition</h3>
                  <p className="text-nature-500 text-sm max-w-xs">Real-time computer vision identifies health markers, diseases, and growth stages.</p>
                  <button className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Learn More</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div 
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CommunityHub contributions={contributions} onContribute={addContribution} />
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div 
              key="docs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="glass p-12 rounded-[40px] space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <h2 className="text-5xl font-bold tracking-tight">System Documentation</h2>
                    <p className="text-nature-500 text-lg">Comprehensive guide to Project Genie and the Internet of Nature API</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-nature-100 text-nature-900 rounded-xl text-sm font-bold flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      API Status: Operational
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-nature-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Key size={28} />
                    </div>
                    <h3 className="text-2xl font-bold">API Manager</h3>
                    <p className="text-nature-500 text-sm leading-relaxed">
                      Manage your access keys and configure the system's neural engine. Our API Manager handles secure key generation and rotation.
                    </p>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-nature-400 rounded-full" />
                        Secure Key Storage
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-nature-400 rounded-full" />
                        Usage Analytics
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-nature-400 rounded-full" />
                        Rate Limit Monitoring
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <Cpu size={28} />
                    </div>
                    <h3 className="text-2xl font-bold">Project Genie Core</h3>
                    <p className="text-nature-500 text-sm leading-relaxed">
                      The core engine responsible for real-time ecological simulations and predictive modeling of urban forests.
                    </p>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Neural Simulation
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Biodiversity Indexing
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Climate Impact Forecasting
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <Wifi size={28} />
                    </div>
                    <h3 className="text-2xl font-bold">IoT Mesh Network</h3>
                    <p className="text-nature-500 text-sm leading-relaxed">
                      Our global network of sensors provides the raw data that fuels the Genie engine. Real-time telemetry from across the globe.
                    </p>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Low-Latency Streaming
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Edge Computing
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Global Data Sync
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-nature-50 p-8 rounded-[32px] border border-nature-100">
                  <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Code size={20} className="text-nature-600" />
                    Quick Integration Guide
                  </h4>
                  <div className="bg-nature-950 p-6 rounded-2xl font-mono text-sm text-emerald-400 overflow-x-auto">
                    <pre>
{`// Initialize Project Genie SDK
const genie = new ProjectGenie({
  apiKey: process.env.GENIE_API_KEY,
  region: 'global-mesh'
});

// Start real-time simulation
await genie.simulate({
  siteId: 'central-park-01',
  duration: '100y',
  parameters: ['biodiversity', 'carbon-offset']
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="glass p-8 rounded-[40px]">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-bold">Acoustic Biodiversity</h3>
                      <p className="text-nature-500 text-sm">Soundscape analysis for avian and insect activity</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      <Activity size={14} />
                      LIVE STREAMING
                    </div>
                  </div>
                  <div className="h-[300px] bg-nature-950 rounded-3xl p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-nature-400 text-[10px] uppercase font-bold tracking-widest">Current Frequency</p>
                        <p className="text-white text-3xl font-mono">14.2 kHz</p>
                      </div>
                      <div className="text-right">
                        <p className="text-nature-400 text-[10px] uppercase font-bold tracking-widest">Species Count</p>
                        <p className="text-white text-3xl font-mono">12</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [20, Math.random() * 100 + 20, 20] }}
                          transition={{ repeat: Infinity, duration: 0.3 + Math.random() }}
                          className="w-1 bg-emerald-400 rounded-full opacity-40"
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-nature-500 text-[10px] font-mono">00:00:00</p>
                      <p className="text-nature-500 text-[10px] font-mono">REC ENABLED</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-8 rounded-[40px] space-y-4">
                    <h4 className="font-bold text-lg">Soil Microbiome</h4>
                    <p className="text-nature-500 text-xs">Fungal-to-bacterial ratio analysis via underground sensor network.</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-nature-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[65%]" />
                      </div>
                      <span className="text-xs font-bold">65% Optimal</span>
                    </div>
                  </div>
                  <div className="glass p-8 rounded-[40px] space-y-4">
                    <h4 className="font-bold text-lg">Carbon Sequestration</h4>
                    <p className="text-nature-500 text-xs">Estimated CO2 absorption based on leaf area index and growth rates.</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-nature-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[42%]" />
                      </div>
                      <span className="text-xs font-bold">4.2 Tons/yr</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <PredictiveAnalytics />
                <AcousticMonitor />
                <DataExportPanel data={MOCK_HISTORY} title="Historical Sensor Data" />
              </div>
            </motion.div>
          )}

          {activeTab === 'ailab' && (
            <motion.div 
              key="ailab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <AILab />
              <AlertConfiguration />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-nature-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <TreePine size={20} />
            <span className="font-serif font-bold text-lg">Internet of Nature</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-nature-400 uppercase tracking-widest">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">API Docs</a>
            <a href="#">Support</a>
          </div>
          <p className="text-xs text-nature-400">© 2026 Internet of Nature. Bridging bits and biology.</p>
        </div>
      </footer>
    </div>
  );
}
