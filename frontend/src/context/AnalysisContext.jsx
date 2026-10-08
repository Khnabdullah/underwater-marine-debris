import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AnalysisContext = createContext(null);

const STORAGE_KEY = 'nirmalsagar_history_v1';
const SETTINGS_KEY = 'nirmalsagar_settings_v1';

const DEFAULT_SETTINGS = {
  backendUrl: 'http://localhost:8000/predict',
  enableSound: false,
  autoSaveHistory: true,
  defaultConfidenceThreshold: 20,
};

export function AnalysisProvider({ children }) {
  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Analysis History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current active analysis state (shared across views)
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  // Current enhanced image (from Enhancement view -> Image Detection)
  const [enhancedImageTransfer, setEnhancedImageTransfer] = useState(null);

  // Active navigation tab in console
  const [activeTab, setActiveTab] = useState('dashboard');

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState({
    isOnline: false,
    checking: false,
    checkedAt: null,
    latencyMs: null,
    error: null,
    model: 'YOLOv11s',
  });

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  }, [settings]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history:', e);
    }
  }, [history]);

  // Check Backend Health
  const checkBackendHealth = useCallback(async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true, error: null }));
    const startTime = performance.now();

    try {
      // Derive base URL from predict endpoint
      const baseUrl = settings.backendUrl.replace(/\/predict\/?$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(baseUrl || 'http://localhost:8000', {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (res.ok) {
        setBackendStatus({
          isOnline: true,
          checking: false,
          checkedAt: new Date(),
          latencyMs,
          error: null,
          model: 'YOLOv11s',
        });
      } else {
        setBackendStatus({
          isOnline: false,
          checking: false,
          checkedAt: new Date(),
          latencyMs,
          error: `HTTP ${res.status}: ${res.statusText}`,
          model: 'YOLOv11s',
        });
      }
    } catch (err) {
      setBackendStatus({
        isOnline: false,
        checking: false,
        checkedAt: new Date(),
        latencyMs: null,
        error: err.name === 'AbortError' ? 'Connection timeout' : 'Backend offline or unreachable',
        model: 'YOLOv11s',
      });
    }
  }, [settings.backendUrl]);

  // Initial check on mount & periodically
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // every 30s
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Add item to history
  const addHistoryItem = useCallback((item) => {
    const newItem = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      displayDate: new Date().toLocaleString(),
      type: item.type || 'image',
      filename: item.filename || 'Survey_Image.jpg',
      numDetections: item.numDetections || 0,
      detections: item.detections || [],
      thumbnail: item.thumbnail || item.annotatedImage || item.previewUrl,
      annotatedImage: item.annotatedImage || null,
      originalImage: item.originalImage || item.previewUrl || null,
      durationMs: item.durationMs || null,
      classBreakdown: item.classBreakdown || {},
      status: 'Completed',
    };

    setHistory((prev) => [newItem, ...prev.slice(0, 49)]); // keep last 50
    return newItem;
  }, []);

  // Delete history item
  const deleteHistoryItem = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Update settings helper
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const value = {
    settings,
    updateSettings,
    history,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
    currentAnalysis,
    setCurrentAnalysis,
    enhancedImageTransfer,
    setEnhancedImageTransfer,
    activeTab,
    setActiveTab,
    backendStatus,
    checkBackendHealth,
  };

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
