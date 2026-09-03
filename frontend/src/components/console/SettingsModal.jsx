import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, Server, Bell, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000/predict');
  const [detectPlastic, setDetectPlastic] = useState(true);
  const [detectGear, setDetectGear] = useState(true);
  const [detectMetal, setDetectMetal] = useState(true);
  const [enableSound, setEnableSound] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="ns-modal-backdrop" onClick={onClose}>
      <div className="ns-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ns-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sliders size={20} color="#0B3B32" />
            <h3 className="ns-modal-title">Console Settings</h3>
          </div>
          <button onClick={onClose} className="ns-modal-close" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="ns-modal-body">
          {/* Section 1: Backend API Endpoint */}
          <div className="ns-settings-group">
            <label className="ns-settings-label">
              <Server size={16} />
              Inference API Endpoint
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="ns-settings-input"
              placeholder="http://localhost:8000/predict"
            />
            <span className="ns-settings-hint">
              FastAPI YOLOv11s endpoint. Falls back automatically to simulation when offline.
            </span>
          </div>

          {/* Section 2: Taxonomic Classes */}
          <div className="ns-settings-group">
            <label className="ns-settings-label">
              <ShieldCheck size={16} />
              Active Debris Target Filters
            </label>

            <div className="ns-settings-checkboxes">
              <label className="ns-checkbox-label">
                <input
                  type="checkbox"
                  checked={detectPlastic}
                  onChange={(e) => setDetectPlastic(e.target.checked)}
                />
                <span>Plastic Polymer Waste (bottles, packaging, sheets)</span>
              </label>

              <label className="ns-checkbox-label">
                <input
                  type="checkbox"
                  checked={detectGear}
                  onChange={(e) => setDetectGear(e.target.checked)}
                />
                <span>Fishing Gear & Nylon Nets (ghost gear, ropes)</span>
              </label>

              <label className="ns-checkbox-label">
                <input
                  type="checkbox"
                  checked={detectMetal}
                  onChange={(e) => setDetectMetal(e.target.checked)}
                />
                <span>Corroded Metallic Targets (cans, drums, brackets)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="ns-modal-footer">
          <button onClick={onClose} className="ns-btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="ns-btn-primary">
            {saved ? <Check size={16} /> : null}
            {saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
