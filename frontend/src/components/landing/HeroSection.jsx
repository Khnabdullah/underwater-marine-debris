import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Target, Layers, Eye } from 'lucide-react';

const sliderImages = [
  '/plastic-crisis.png',
  '/plastic-bag.png',
  '/hero-underwater-rov.jpg',
  '/new_image_debris.png'
];

export default function HeroSection({ onOpenWorkbench }) {
  const scrollToResearch = (e) => {
    e.preventDefault();
    const elem = document.getElementById('research');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="ns-hero-root">
      {/* Background pattern */}
      <div className="ns-hero-bg-pattern" />

      <div className="ns-hero-container">
        
        {/* Top Eyebrow Badge */}
        <div className="ns-hero-badge">
          <span className="ns-hero-badge-pulse" />
          <Sparkles size={14} className="ns-hero-badge-icon" />
          <span>AI-Powered Oceanographic Vision</span>
        </div>

        {/* Main Title and Description (Top aligned) */}
        <div className="ns-hero-header">
          <h1 className="ns-hero-title">
            The Deep Ocean,<br />
            <span className="ns-hero-title-gradient">Seen With Clarity.</span>
          </h1>
          <p className="ns-hero-desc">
            Autonomous computer vision system to detect, segment, and quantify submerged plastic waste, derelict fishing nets, and metallic debris in ROV survey imagery.
          </p>
          <div className="ns-hero-actions">
            <button
              onClick={onOpenWorkbench}
              className="ns-hero-btn-primary"
              aria-label="Launch Image Analysis Workbench"
            >
              <span>Analyze Image</span>
              <ArrowRight size={18} strokeWidth={2.2} className="ns-btn-arrow" />
            </button>
            <button
              onClick={scrollToResearch}
              className="ns-hero-btn-secondary"
              aria-label="Explore research documentation"
            >
              <Eye size={18} />
              <span>Explore Research</span>
            </button>
          </div>
        </div>

        {/* The prominent visual card (BloomFi style) */}
        <div className="ns-hero-visual-card">
          <div className="ns-hero-slider">
            {sliderImages.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt={`Underwater research footage ${idx + 1}`}
                className={`ns-hero-img ns-slider-img ${idx === currentIdx ? 'active' : ''}`}
              />
            ))}
          </div>
          {/* Glass panels floating over the image */}
          <div className="ns-hero-glass-panel">
            <div className="ns-hero-panel-header">
              <div className="ns-hero-panel-title">
                <Activity size={16} />
                <span>Telemetry Status</span>
              </div>
              <span className="ns-hero-panel-status">MODEL v2.4 ONLINE</span>
            </div>
            <div className="ns-hero-metrics-grid">
              <div className="ns-hero-metric-item">
                <div className="ns-metric-icon-box">
                  <Target size={18} />
                </div>
                <div className="ns-metric-data">
                  <span className="ns-metric-value">98.4%</span>
                  <span className="ns-metric-label">Segmentation Accuracy</span>
                </div>
              </div>
              <div className="ns-hero-metric-item">
                <div className="ns-metric-icon-box">
                  <Layers size={18} />
                </div>
                <div className="ns-metric-data">
                  <span className="ns-metric-value">4 Target Classes</span>
                  <span className="ns-metric-label">Plastic, Net, Metal, Trash</span>
                </div>
              </div>
              <div className="ns-hero-metric-item">
                <div className="ns-metric-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <div className="ns-metric-data">
                  <span className="ns-metric-value">Turbid Water</span>
                  <span className="ns-metric-label">Depth Color Correction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
