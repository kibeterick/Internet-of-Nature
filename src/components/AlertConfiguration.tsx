import React, { useState } from 'react';
import { AlertTriangle, Plus, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Alert {
  id: string;
  metric: string;
  condition: 'above' | 'below';
  threshold: number;
  enabled: boolean;
}

export const AlertConfiguration = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', metric: 'Soil Moisture', condition: 'below', threshold: 30, enabled: true },
    { id: '2', metric: 'Temperature', condition: 'above', threshold: 30, enabled: true },
    { id: '3', metric: 'Air Quality', condition: 'above', threshold: 50, enabled: false },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState<Omit<Alert, 'id'>>({
    metric: 'Soil Moisture',
    condition: 'below',
    threshold: 0,
    enabled: true,
  });

  const metrics = ['Soil Moisture', 'Temperature', 'Air Quality', 'Biodiversity Index'];

  const addAlert = () => {
    if (newAlert.threshold > 0) {
      setAlerts([...alerts, { ...newAlert, id: Date.now().toString() }]);
      setNewAlert({ metric: 'Soil Moisture', condition: 'below', threshold: 0, enabled: true });
      setShowAddForm(false);
    }
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle size={24} className="text-amber-600" />
            Alert Configuration
          </h3>
          <p className="text-nature-500 text-sm">Set custom thresholds for notifications</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-nature-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-nature-800 transition-colors"
        >
          <Plus size={16} />
          Add Alert
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-nature-50 p-6 rounded-2xl border border-nature-200 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-nature-600 mb-2 block">Metric</label>
                <select
                  value={newAlert.metric}
                  onChange={(e) => setNewAlert({ ...newAlert, metric: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-nature-200 focus:outline-none focus:ring-2 focus:ring-nature-500/20"
                >
                  {metrics.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-nature-600 mb-2 block">Condition</label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
                  className="w-full px-3 py-2 rounded-xl border border-nature-200 focus:outline-none focus:ring-2 focus:ring-nature-500/20"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-nature-600 mb-2 block">Threshold</label>
                <input
                  type="number"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-nature-200 focus:outline-none focus:ring-2 focus:ring-nature-500/20"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addAlert}
                className="flex-1 bg-nature-900 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-nature-800 transition-colors"
              >
                <Save size={16} />
                Save Alert
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white border border-nature-200 rounded-xl font-bold text-sm hover:bg-nature-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-nature-400">
            <AlertTriangle size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No alerts configured</p>
          </div>
        ) : (
          alerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all",
                alert.enabled 
                  ? "bg-white border-nature-200" 
                  : "bg-nature-50 border-nature-100 opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={cn(
                    "w-10 h-6 rounded-full transition-all relative",
                    alert.enabled ? "bg-emerald-500" : "bg-nature-200"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                    alert.enabled ? "right-0.5" : "left-0.5"
                  )} />
                </button>
                <div>
                  <p className="font-bold text-sm">
                    {alert.metric} {alert.condition} {alert.threshold}
                  </p>
                  <p className="text-xs text-nature-500">
                    Alert when {alert.metric.toLowerCase()} goes {alert.condition} threshold
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
