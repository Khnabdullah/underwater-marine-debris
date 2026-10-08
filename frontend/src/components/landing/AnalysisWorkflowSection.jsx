import React from 'react';
import { UploadCloud, Cpu, Sliders, Download } from 'lucide-react';

export default function AnalysisWorkflowSection() {
  const steps = [
    {
      number: '01',
      icon: <UploadCloud size={22} strokeWidth={1.8} />,
      title: 'Survey Ingestion',
      desc: 'Upload benthic survey frames, ROV video captures, or diver photographic plates.',
      tag: 'JPG • PNG • WebP',
    },
    {
      number: '02',
      icon: <Cpu size={22} strokeWidth={1.8} />,
      title: 'Debris Detection',
      desc: 'Locate and segment plastic fragments, abandoned fishing nets, and metallic waste.',
      tag: 'Multi-Class Inference',
    },
    {
      number: '03',
      icon: <Sliders size={22} strokeWidth={1.8} />,
      title: 'Visual Inspection',
      desc: 'Inspect bounding boxes, adjust confidence thresholds, and isolate target debris classes.',
      tag: 'Interactive Thresholds',
    },
    {
      number: '04',
      icon: <Download size={22} strokeWidth={1.8} />,
      title: 'Telemetry Export',
      desc: 'Download structured survey reports with coordinates, pixel surface areas, and item counts.',
      tag: 'Structured JSON / CSV',
    },
  ];

  return (
    <section id="how-it-works" className="ns-workflow-root">
      <div className="ns-workflow-container">
        <div className="ns-section-header">
          <div className="ns-sub-tag">WORKFLOW PIPELINE</div>
          <h2 className="ns-section-title">How It Works</h2>
          <p className="ns-section-subtitle">
            From underwater survey imagery to structured marine debris records in four automated steps.
          </p>
        </div>

        <div className="ns-workflow-grid-wrapper">
          {/* Decorative connecting pipeline track */}
          <div className="ns-workflow-pipeline-track">
            <div className="ns-pipeline-glow" />
          </div>

          <div className="ns-workflow-grid">
            {steps.map((step) => (
              <div key={step.number} className="ns-workflow-item">
                <div className="ns-step-indicator">
                  <span className="ns-step-num">{step.number}</span>
                </div>

                <div className="ns-workflow-card">
                  <div className="ns-workflow-card-content">
                    <div className="ns-workflow-card-top">
                      <div className="ns-workflow-icon-box">
                        {step.icon}
                      </div>
                    </div>

                    <h3 className="ns-workflow-card-title">{step.title}</h3>
                    <p className="ns-workflow-card-desc">{step.desc}</p>

                    <div className="ns-workflow-card-footer">
                      <span className="ns-workflow-tag">{step.tag}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
