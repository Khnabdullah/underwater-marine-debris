import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaBanner({ onOpenWorkbench }) {
  return (
    <section className="ns-cta-root">
      <div className="ns-cta-container">
        {/* Floating AI Particles */}
        <div className="ns-cta-particles">
          <div className="ns-particle p1"></div>
          <div className="ns-particle p2"></div>
          <div className="ns-particle p3"></div>
          <div className="ns-particle p4"></div>
          <div className="ns-particle p5"></div>
        </div>

        <div className="ns-cta-badge">
          <Sparkles size={12} />
          <span>START YOUR ANALYSIS</span>
        </div>

        <h2 className="ns-cta-title">
          Ready to Detect & Quantify Marine Debris?
        </h2>

        <p className="ns-cta-desc">
          Upload underwater survey photography or ROV captures to segment plastics, derelict nets, and metal waste in seconds.
        </p>

        <div className="ns-cta-action">
          <button
            onClick={onOpenWorkbench}
            className="ns-cta-btn"
          >
            <span>Launch Image Analysis</span>
            <ArrowRight size={16} strokeWidth={2.2} className="ns-cta-arrow" />
          </button>
        </div>
      </div>
    </section>
  );
}
