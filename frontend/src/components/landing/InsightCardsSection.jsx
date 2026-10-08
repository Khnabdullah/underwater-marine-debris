import React from 'react';

const DetectionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8V4m0 0h4M4 4l4 4m12-4V4m0 0h-4m4 0l-4 4M4 16v4m0 0h4m-4 0l4-4m12 4v4m0 0h-4m4 0l-4-4"/>
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ProcessingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18" />
    <path d="M12 8h6" />
    <path d="M12 12h7" />
    <path d="M12 16h5" />
  </svg>
);

const TelemetryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 8l-4 4 4 4" />
    <path d="M17 8l4 4-4 4" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="7" r="1.5" />
    <circle cx="12" cy="17" r="1.5" />
    <path d="M12 8.5v2" />
    <path d="M12 13.5v2" />
  </svg>
);

export default function InsightCardsSection() {
  const cards = [
    {
      id: 'detection',
      icon: <DetectionIcon />,
      title: 'Debris Detection & Segmentation',
      description:
        'Locates and highlights submerged plastic bottles, bags, derelict nets, and metal debris with precise bounding boxes and pixel surface area masks.',
      badge: 'Multi-Class Inference',
    },
    {
      id: 'analysis',
      icon: <ProcessingIcon />,
      title: 'Turbid & Murky Water Processing',
      description:
        'Filters low-visibility, murky, and backscattered underwater survey footage captured by autonomous ROVs, AUVs, or divers.',
      badge: 'Depth Color Correction',
    },
    {
      id: 'telemetry',
      icon: <TelemetryIcon />,
      title: 'Telemetry & Data Export',
      description:
        'Exports bounding coordinates, surface area estimates, debris classifications, and confidence metrics directly to structured JSON or CSV.',
      badge: 'JSON / CSV Export',
    },
  ];

  return (
    <section id="about" className="ns-insights-root">
      <div className="ns-insights-container">
        <div className="ns-section-header">
          <div className="ns-sub-tag">CAPABILITIES</div>
          <h2 className="ns-section-title">Detection Capabilities</h2>
          <p className="ns-section-subtitle">
            Trained on oceanographic datasets to reliably detect and measure submerged marine litter across diverse underwater conditions.
          </p>
        </div>

        <div className="ns-cards-grid">
          {cards.map((card) => (
            <div key={card.id} className="ns-insight-card">
              <div className="ns-card-bg-pattern" />
              <div className="ns-card-content-wrapper">
                <div className="ns-card-top-row">
                  <div className="ns-card-icon-box">
                    {card.icon}
                  </div>
                  <span className="ns-card-badge">{card.badge}</span>
                </div>
                <h3 className="ns-card-title">{card.title}</h3>
                <p className="ns-card-desc">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
