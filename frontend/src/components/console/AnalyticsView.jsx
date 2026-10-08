import React from 'react';
import {
  BarChart3,
  Layers,
  PieChart,
  TrendingUp,
  Activity,
  Image as ImageIcon,
  Video,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';
import PageHeader from '../common/PageHeader';
import MetricCard from '../common/MetricCard';
import EmptyState from '../common/EmptyState';

export default function AnalyticsView({ onNavigate }) {
  const { history } = useAnalysis();

  if (history.length === 0) {
    return (
      <div className="ns-workbench-stage">
        <PageHeader
          title="Analytics & Telemetry"
          subtitle="Aggregate benthic litter statistics, taxonomic distributions, and historical survey trends."
          badge="Longitudinal Data"
        />

        <div className="ns-stage-card" style={{ padding: '48px 24px' }}>
          <EmptyState
            icon={BarChart3}
            title="No analytics available yet"
            description="Complete one or more image or video detections to generate aggregate taxonomic distributions and historical survey metrics."
            actionText="Run First Image Analysis"
            onAction={() => onNavigate('image-detection')}
          />
        </div>
      </div>
    );
  }

  const totalSurveys = history.length;
  const imageSurveys = history.filter((h) => h.type === 'image').length;
  const videoSurveys = history.filter((h) => h.type === 'video').length;

  const allDetections = history.flatMap((h) => h.detections || []);
  const totalDetections = allDetections.length;

  // Aggregate category counts
  const categoryCounts = allDetections.reduce((acc, d) => {
    const cls = d.class || 'plastic';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  // Mean confidence across all detections
  const meanConf = totalDetections
    ? (
        allDetections.reduce((sum, d) => sum + (d.confidence || 0), 0) /
        totalDetections
      ).toFixed(1)
    : 0;

  // Confidence distribution bins: 0-30%, 31-60%, 61-80%, 81-100%
  const confBins = {
    'High (>80%)': allDetections.filter((d) => d.confidence > 80).length,
    'Moderate (50-80%)': allDetections.filter((d) => d.confidence >= 50 && d.confidence <= 80).length,
    'Low (<50%)': allDetections.filter((d) => d.confidence < 50).length,
  };

  return (
    <div className="ns-workbench-stage">
      <PageHeader
        title="Analytics & Telemetry"
        subtitle="Aggregate benthic litter statistics, taxonomic distributions, and historical survey trends."
        badge="Session Telemetry"
      />

      {/* Top 4 Metrics */}
      <div className="ns-dash-stats-grid">
        <MetricCard
          title="Total Surveys Analyzed"
          value={totalSurveys}
          subtitle={`${imageSurveys} image, ${videoSurveys} video`}
          icon={Activity}
          badge="Live Session"
        />

        <MetricCard
          title="Total Segmented Objects"
          value={totalDetections}
          subtitle="Across all logged transects"
          icon={Layers}
          badge="Targets"
        />

        <MetricCard
          title="Average Confidence"
          value={`${meanConf}%`}
          subtitle="YOLOv11s model detection score"
          icon={CheckCircle2}
        />

        <MetricCard
          title="Avg Targets per Survey"
          value={(totalDetections / totalSurveys).toFixed(1)}
          subtitle="Debris density indicator"
          icon={TrendingUp}
        />
      </div>

      {/* Analytics Charts & Visualizations */}
      <div className="ns-dash-split-grid">
        {/* Left: Taxonomic Distribution Chart */}
        <div className="ns-dash-card">
          <div className="ns-dash-card-header">
            <h3 className="ns-dash-card-title">Taxonomic Category Distribution</h3>
            <span className="ns-dash-badge">Aggregate Debris</span>
          </div>

          <div className="ns-card-body">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="ns-hint-muted">No categorized objects recorded in history.</p>
            ) : (
              <div className="ns-breakdown-bars-container">
                {Object.entries(categoryCounts).map(([clsName, count]) => {
                  const pct = totalDetections
                    ? Math.round((count / totalDetections) * 100)
                    : 0;
                  return (
                    <div key={clsName} className="ns-breakdown-item">
                      <div className="ns-breakdown-info">
                        <span className="ns-breakdown-class-name">
                          {clsName.charAt(0).toUpperCase() + clsName.slice(1).replace('_', ' ')}
                        </span>
                        <span className="ns-breakdown-count">
                          {count} item{count === 1 ? '' : 's'} ({pct}%)
                        </span>
                      </div>
                      <div className="ns-progress-track">
                        <div
                          className={`ns-progress-bar bar-${clsName.toLowerCase()}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Confidence Distribution */}
        <div className="ns-dash-card">
          <div className="ns-dash-card-header">
            <h3 className="ns-dash-card-title">Detection Confidence Reliability</h3>
            <span className="ns-dash-badge">Quality Bins</span>
          </div>

          <div className="ns-card-body">
            <div className="ns-breakdown-bars-container">
              {Object.entries(confBins).map(([binName, count]) => {
                const pct = totalDetections ? Math.round((count / totalDetections) * 100) : 0;
                return (
                  <div key={binName} className="ns-breakdown-item">
                    <div className="ns-breakdown-info">
                      <span className="ns-breakdown-class-name">{binName}</span>
                      <span className="ns-breakdown-count">
                        {count} target{count === 1 ? '' : 's'} ({pct}%)
                      </span>
                    </div>
                    <div className="ns-progress-track">
                      <div
                        className="ns-progress-bar bar-teal"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Survey Activity Timeline Table */}
      <div className="ns-dash-card" style={{ marginTop: 8 }}>
        <div className="ns-dash-card-header">
          <h3 className="ns-dash-card-title">Historical Survey Sequence</h3>
          <span className="ns-dash-badge">Chronological Log</span>
        </div>

        <div className="ns-history-table-container">
          <table className="ns-history-table">
            <thead>
              <tr>
                <th>Survey Filename</th>
                <th>Modality</th>
                <th>Timestamp</th>
                <th>Detections</th>
                <th>Categories</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="ns-table-strong-cell">{item.filename}</td>
                  <td>
                    <span className="ns-modality-pill">
                      {item.type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                      {item.type === 'video' ? 'Video' : 'Image'}
                    </span>
                  </td>
                  <td className="ns-history-date">{item.displayDate || item.timestamp}</td>
                  <td>
                    <span className="ns-history-count-badge">
                      {item.numDetections} item{item.numDetections === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td>
                    <div className="ns-table-tags-group">
                      {Object.keys(item.classBreakdown || {}).map((c) => (
                        <span key={c} className="ns-mini-tag">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
