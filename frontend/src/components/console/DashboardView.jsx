import React from 'react';
import {
  Activity,
  Layers,
  CheckCircle,
  Database,
  Compass,
  ArrowUpRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

export default function DashboardView({ onNavigateToAnalysis }) {
  const stats = [
    {
      title: 'Survey Transects Analyzed',
      value: '1,428',
      change: '+18.4% this month',
      icon: <Activity size={20} color="#0B3B32" />,
    },
    {
      title: 'Debris Targets Segmented',
      value: '8,940',
      change: '84% Plastic / Polymer',
      icon: <Layers size={20} color="#0B3B32" />,
    },
    {
      title: 'Mean Precision (mAP@50)',
      value: '91.8%',
      change: 'Validated on TrashCan 1.0',
      icon: <CheckCircle size={20} color="#0B3B32" />,
    },
    {
      title: 'Seafloor Area Surveyed',
      value: '42.6 km²',
      change: 'Arabian Sea & Bay of Bengal',
      icon: <Database size={20} color="#0B3B32" />,
    },
  ];

  const recentSurveys = [
    {
      id: 'SRV-802',
      site: 'Goa Coastal Shelf (Depth 18m)',
      detected: '7 debris targets',
      density: 'High (0.82 items/m²)',
      time: '12 mins ago',
      status: 'Flagged for Cleanup',
    },
    {
      id: 'SRV-801',
      site: 'Lakshadweep Coral Barrier (Depth 12m)',
      detected: '2 plastic fragments',
      density: 'Low (0.12 items/m²)',
      time: '1 hour ago',
      status: 'Monitored',
    },
    {
      id: 'SRV-800',
      site: 'Gulf of Mannar Biosphere (Depth 25m)',
      detected: '11 targets (nets & containers)',
      density: 'Severe (1.34 items/m²)',
      time: '3 hours ago',
      status: 'Priority Cleanup Alert',
    },
  ];

  return (
    <div className="ns-dashboard-root">
      <div className="ns-workbench-header">
        <div>
          <h1 className="ns-workbench-title">Oceanic Intelligence Dashboard</h1>
          <p className="ns-workbench-subtitle">
            Fleet-wide benthic debris monitoring, taxonomic trends, and autonomous detection metrics.
          </p>
        </div>

        <button onClick={onNavigateToAnalysis} className="ns-btn-primary">
          <ArrowUpRight size={16} />
          New Image Analysis
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="ns-dash-stats-grid">
        {stats.map((item, idx) => (
          <div key={idx} className="ns-dash-stat-card">
            <div className="ns-dash-stat-top">
              <span className="ns-dash-stat-title">{item.title}</span>
              <div className="ns-dash-icon-box">{item.icon}</div>
            </div>
            <div className="ns-dash-stat-val">{item.value}</div>
            <div className="ns-dash-stat-change">{item.change}</div>
          </div>
        ))}
      </div>

      {/* Two Column Section */}
      <div className="ns-dash-split-grid">
        {/* Left: Recent Activity */}
        <div className="ns-dash-card">
          <div className="ns-dash-card-header">
            <h3 className="ns-dash-card-title">Recent Coastal & Deep-Sea Surveys</h3>
            <span className="ns-dash-badge">Live Feeds</span>
          </div>

          <div className="ns-surveys-list">
            {recentSurveys.map((survey) => (
              <div key={survey.id} className="ns-survey-row">
                <div className="ns-survey-left">
                  <div className="ns-survey-pin">
                    <MapPin size={16} color="#0B3B32" />
                  </div>
                  <div>
                    <div className="ns-survey-name">{survey.site}</div>
                    <div className="ns-survey-meta">
                      {survey.detected} • {survey.time}
                    </div>
                  </div>
                </div>

                <div className="ns-survey-right">
                  <span
                    className={`ns-density-pill ${
                      survey.density.includes('High') || survey.density.includes('Severe')
                        ? 'pill-danger'
                        : 'pill-good'
                    }`}
                  >
                    {survey.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Launch Card */}
        <div className="ns-dash-card ns-quick-launch-card">
          <div className="ns-quick-launch-content">
            <div className="ns-dash-icon-box" style={{ width: 52, height: 52 }}>
              <Compass size={28} color="#0B3B32" />
            </div>
            <h3 className="ns-quick-title">Ready to analyze underwater imagery?</h3>
            <p className="ns-quick-desc">
              Upload footage from ROVs, AUVs, or research diver inspections to detect plastic waste, ghost nets, and metallic debris.
            </p>
            <button
              onClick={onNavigateToAnalysis}
              className="ns-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Launch Image Analysis Workbench
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
