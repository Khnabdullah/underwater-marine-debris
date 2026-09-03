import React from 'react';
import { Crosshair, Layers, FileSpreadsheet } from 'lucide-react';

export default function InsightCardsSection() {
  const cards = [
    {
      id: 'detection',
      icon: <Crosshair size={22} strokeWidth={1.8} />,
      title: 'Detection & Segmentation',
      description:
        'Locates and highlights submerged plastic bottles, bags, derelict nets, and metal debris with precise bounding boxes.',
    },
    {
      id: 'analysis',
      icon: <Layers size={22} strokeWidth={1.8} />,
      title: 'Turbid Water Processing',
      description:
        'Processes low-visibility, murky, and backscattered underwater footage captured by ROVs, AUVs, or divers.',
    },
    {
      id: 'telemetry',
      icon: <FileSpreadsheet size={22} strokeWidth={1.8} />,
      title: 'Telemetry & Data Export',
      description:
        'Exports bounding coordinates, pixel surface areas, debris classifications, and confidence metrics to structured JSON.',
    },
  ];

  return (
    <section id="about" className="ns-insights-root">
      <div className="ns-insights-container">
        <div className="ns-section-header">
          <h2 className="ns-section-title">Detection Capabilities</h2>
          <p className="ns-section-subtitle">
            Trained to detect submerged marine litter across diverse underwater conditions.
          </p>
        </div>

        <div className="ns-cards-grid">
          {cards.map((card) => (
            <div key={card.id} className="ns-insight-card">
              <div className="ns-card-icon-box">
                {card.icon}
              </div>
              <h3 className="ns-card-title">{card.title}</h3>
              <p className="ns-card-desc">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
