import React from 'react';
import { Check, Database } from 'lucide-react';

export default function ResearchSection() {
  const features = [
    {
      title: 'Object Localization',
      desc: 'Pinpoints debris boundaries even when partially covered by sediment or marine growth.',
    },
    {
      title: 'Underwater Light Handling',
      desc: 'Trained to distinguish debris despite color distortion and light absorption at depth.',
    },
    {
      title: 'Multi-Category Detection',
      desc: 'Differentiates between plastic bottles, bags, derelict nets, and metal scrap.',
    },
    {
      title: 'Density Calculation',
      desc: 'Calculates debris counts per square meter to help survey teams prioritize cleanup sites.',
    },
  ];

  return (
    <section id="research" className="ns-research-root">
      <div className="ns-research-container">
        {/* Left Column: Research Content & Checklist */}
        <div className="ns-research-col-left">
          <div className="ns-sub-tag">METHODOLOGY & DATASETS</div>

          <h2 className="ns-research-title">
            Trained for Real-World Underwater Environments
          </h2>

          <p className="ns-research-intro">
            Underwater imagery suffers from turbidity, backscatter, and light attenuation at depth.
            NirmalSagar uses machine learning models trained on specialized benthic datasets to reliably detect submerged
            marine debris in challenging real-world surveys.
          </p>

          <div className="ns-feature-list">
            {features.map((item, index) => (
              <div key={index} className="ns-feature-item">
                <div className="ns-feature-check">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <div className="ns-feature-content">
                  <h3 className="ns-feature-title">{item.title}</h3>
                  <p className="ns-feature-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Photo with Floating Glass Tag */}
        <div className="ns-research-col-right">
          <div className="ns-research-img-card">
            <div className="ns-research-img-wrapper">
              <img
                src="/research-diver.jpg"
                alt="Research diver inspecting marine debris"
                className="ns-research-img"
              />
              <div className="ns-research-img-overlay" />
            </div>

            <div className="ns-research-glass-tag">
              <Database size={16} className="ns-tag-icon" />
              <div className="ns-tag-text">
                <span className="ns-tag-title">BENTHIC DATASET V2</span>
                <span className="ns-tag-sub">12,000+ Annotated Marine Survey Plates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
