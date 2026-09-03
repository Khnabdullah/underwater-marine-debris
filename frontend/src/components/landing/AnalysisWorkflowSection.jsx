import React from 'react';
import { UploadCloud, Cpu, Sliders, Download } from 'lucide-react';

export default function AnalysisWorkflowSection() {
  const steps = [
    {
      number: '01',
      icon: <UploadCloud size={20} strokeWidth={1.8} />,
      title: 'Survey Ingestion',
      desc: 'Upload benthic survey frames, ROV captures, or diver photographic plates.',
      tag: 'JPG • PNG • WebP',
    },
    {
      number: '02',
      icon: <Cpu size={20} strokeWidth={1.8} />,
      title: 'Debris Detection',
      desc: 'Locate and segment plastic fragments, abandoned gear, and metallic waste.',
      tag: 'Multi-Class Inference',
    },
    {
      number: '03',
      icon: <Sliders size={20} strokeWidth={1.8} />,
      title: 'Visual Inspection',
      desc: 'Inspect bounding boxes, filter confidence thresholds, and isolate target classes.',
      tag: 'Interactive Thresholds',
    },
    {
      number: '04',
      icon: <Download size={20} strokeWidth={1.8} />,
      title: 'Telemetry Export',
      desc: 'Download structured survey reports with coordinates, pixel areas, and counts.',
      tag: 'Structured JSON',
    },
  ];

  return (
    <section id="how-it-works" className="ns-workflow-root">
      <div className="ns-workflow-container">
        <div className="ns-section-header">
          <h2 className="ns-section-title">How It Works</h2>
          <p className="ns-section-subtitle">
            From underwater survey photography to structured marine debris records.
          </p>
        </div>

        <div className="ns-workflow-grid">
          {steps.map((step) => (
            <div key={step.number} className="ns-workflow-card">
              <div className="ns-workflow-card-top">
                <div className="ns-workflow-icon-box">
                  {step.icon}
                </div>
                <span className="ns-workflow-number">{step.number}</span>
              </div>

              <h3 className="ns-workflow-card-title">{step.title}</h3>
              <p className="ns-workflow-card-desc">{step.desc}</p>

              <div className="ns-workflow-card-footer">
                <span className="ns-workflow-tag">{step.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
