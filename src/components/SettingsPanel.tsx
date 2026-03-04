import React, { useState } from 'react';
import { Settings, Moon, Sun, Bell, Download, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(true);
  const [autoExport, setAutoExport] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [dataSharing, setDataSharing] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Settings size={24} className="text-nature-600" />
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-nature-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Theme */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-nature-500 uppercase tracking-wider">Appearance</h3>
                <div className="glass p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                      <span className="font-medium">Theme</span>
                    </div>
                    <div className="flex bg-nature-100 rounded-full p-1">
                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition-all",
                          theme === 'light' ? "bg-white shadow-sm" : ""
                        )}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition-all",
                          theme === 'dark' ? "bg-white shadow-sm" : ""
                        )}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-nature-500 uppercase tracking-wider">Notifications</h3>
                <div className="glass p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Bell size={20} />
                      <span className="font-medium">Push Notifications</span>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        notifications ? "bg-emerald-500" : "bg-nature-200"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                        notifications ? "right-0.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Data */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-nature-500 uppercase tracking-wider">Data Management</h3>
                <div className="glass p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Download size={20} />
                      <span className="font-medium">Auto Export</span>
                    </div>
                    <button
                      onClick={() => setAutoExport(!autoExport)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        autoExport ? "bg-emerald-500" : "bg-nature-200"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                        autoExport ? "right-0.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Shield size={20} />
                      <span className="font-medium">Data Sharing</span>
                    </div>
                    <button
                      onClick={() => setDataSharing(!dataSharing)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        dataSharing ? "bg-emerald-500" : "bg-nature-200"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                        dataSharing ? "right-0.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-nature-500 uppercase tracking-wider">Language</h3>
                <div className="glass p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Globe size={20} />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex-1 bg-transparent font-medium focus:outline-none"
                    >
                      <option value="EN">English</option>
                      <option value="ES">Español</option>
                      <option value="FR">Français</option>
                      <option value="SW">Kiswahili</option>
                      <option value="ZH">中文</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="glass p-6 rounded-2xl text-center space-y-2">
                <p className="text-sm font-medium text-nature-600">Internet of Nature</p>
                <p className="text-xs text-nature-400">Version 1.0.0</p>
                <p className="text-xs text-nature-400">© 2026 All rights reserved</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
