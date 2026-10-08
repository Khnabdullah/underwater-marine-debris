import React from 'react';
import {
  Activity,
  Image as ImageIcon,
  Video,
  Layers,
  Server,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';
import MetricCard from '../common/MetricCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';

export default function DashboardView({ onNavigate }) {
  const { history, backendStatus, checkBackendHealth, setCurrentAnalysis } = useAnalysis();

  const totalAnalyses = history.length;
  const imageAnalyses = history.filter((h) => h.type === 'image').length;
  const videoAnalyses = history.filter((h) => h.type === 'video').length;
  const totalObjectsDetected = history.reduce((sum, h) => sum + (h.numDetections || 0), 0);

  // Compute average confidence across all detections in history
  const allDetections = history.flatMap((h) => h.detections || []);
  const meanConfidence = allDetections.length
    ? (
        allDetections.reduce((sum, d) => sum + (d.confidence || 0), 0) /
        allDetections.length
      ).toFixed(1)
    : null;

  // Aggregate class counts from history
  const aggregateClasses = allDetections.reduce((acc, d) => {
    const cls = d.class || 'plastic';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  const handleOpenItem = (item) => {
    setCurrentAnalysis(item);
    onNavigate('image-detection');
  };

  return (
    <div className="ns-dashboard-root">
      {/* Top Header */}
      <div className="ns-workbench-header">
        <div>
          <div className="ns-header-title-row">
            <h1 className="ns-workbench-title">Oceanic Intelligence Dashboard</h1>
            <span className="ns-header-badge">Real-Time Overview</span>
          </div>
          <p className="ns-workbench-subtitle">
            Autonomous marine debris detection, benthic survey telemetry, and pollution analysis.
          </p>
        </div>

        <button onClick={() => onNavigate('image-detection')} className="ns-btn-primary">
          <ImageIcon size={15} />
          New Image Analysis
        </button>
      </div>

      {/* Metrics Row */}
      <div className="ns-dash-stats-grid">
        <MetricCard
          title="Total Analyses"
          value={totalAnalyses > 0 ? totalAnalyses : '0'}
          subtitle={totalAnalyses > 0 ? `${imageAnalyses} image${imageAnalyses === 1 ? '' : 's'}, ${videoAnalyses} video${videoAnalyses === 1 ? '' : 's'}` : 'No analyses logged yet'}
          icon={Activity}
          badge={totalAnalyses > 0 ? 'Recorded' : 'Empty'}
        />

        <MetricCard
          title="Total Debris Detected"
          value={totalObjectsDetected > 0 ? totalObjectsDetected : '0'}
          subtitle={totalObjectsDetected > 0 ? 'Verified underwater targets' : 'Awaiting image analysis'}
          icon={Layers}
          badge={totalObjectsDetected > 0 ? 'Active' : 'No data'}
        />

        <MetricCard
          title="Mean Detection Confidence"
          value={meanConfidence ? `${meanConfidence}%` : '—'}
          subtitle={meanConfidence ? `Based on ${allDetections.length} segmented objects` : 'Calculated from actual detections'}
          icon={CheckCircle2}
        />

        <div className="ns-stat-card ns-stat-backend-card">
          <div className="ns-stat-card-header">
            <span className="ns-stat-card-title">Inference Engine</span>
            <button
              onClick={checkBackendHealth}
              disabled={backendStatus.checking}
              className="ns-icon-btn-subtle"
              title="Ping inference backend"
              aria-label="Ping backend"
            >
              <RefreshCw
                size={14}
                className={backendStatus.checking ? 'ns-spin' : ''}
              />
            </button>
          </div>

          <div className="ns-backend-stat-body">
            <div className="ns-backend-status-line">
              <StatusBadge
                status={backendStatus.isOnline ? 'online' : 'offline'}
                text={backendStatus.isOnline ? 'FastAPI Online' : 'Backend Offline'}
              />
              {backendStatus.latencyMs !== null && (
                <span className="ns-latency-tag">{backendStatus.latencyMs}ms</span>
              )}
            </div>

            <div className="ns-backend-meta-text">
              <span>Model: {backendStatus.model}</span>
              <span className="ns-backend-url-sub">
                {backendStatus.isOnline
                  ? 'Ready for inference requests'
                  : 'Start backend at localhost:8000'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Recent Analyses + Quick Launch Tools */}
      <div className="ns-dash-split-grid">
        {/* Left: Recent Activity Feed */}
        <div className="ns-dash-card">
          <div className="ns-dash-card-header">
            <div className="ns-card-header-left">
              <Clock size={16} className="ns-card-header-icon" />
              <h3 className="ns-dash-card-title">Recent Analyses</h3>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => onNavigate('history')}
                className="ns-link-btn"
              >
                View all ({history.length})
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div className="ns-card-body">
            {history.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No analysis data yet"
                description="Data will appear here after your first image or video analysis."
                actionText="Start Image Analysis"
                onAction={() => onNavigate('image-detection')}
              />
            ) : (
              <div className="ns-surveys-list">
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="ns-survey-row"
                    onClick={() => handleOpenItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenItem(item)}
                  >
                    <div className="ns-survey-left">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.filename}
                          className="ns-survey-thumb"
                        />
                      ) : (
                        <div className="ns-survey-thumb-placeholder">
                          {item.type === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
                        </div>
                      )}
                      <div>
                        <div className="ns-survey-name">{item.filename}</div>
                        <div className="ns-survey-meta">
                          <span>{item.displayDate || item.timestamp}</span>
                          <span className="ns-dot-sep">•</span>
                          <span>{item.type === 'video' ? 'Video' : 'Image'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ns-survey-right">
                      <span className="ns-detections-count-pill">
                        {item.numDetections} {item.numDetections === 1 ? 'target' : 'targets'}
                      </span>
                      <ArrowRight size={14} className="ns-row-arrow" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Primary Workspaces Quick Launch */}
        <div className="ns-dash-card ns-quick-launch-grid-card">
          <div className="ns-dash-card-header">
            <h3 className="ns-dash-card-title">Scientific Workspaces</h3>
            <span className="ns-dash-badge">Workflow</span>
          </div>

          <div className="ns-launch-tiles-grid">
            <div
              className="ns-launch-tile"
              onClick={() => onNavigate('image-detection')}
              role="button"
              tabIndex={0}
            >
              <div className="ns-launch-icon-box bg-teal">
                <ImageIcon size={20} />
              </div>
              <div className="ns-launch-text">
                <h4>Image Detection</h4>
                <p>Run YOLOv11s object segmentation on underwater photos</p>
              </div>
              <ArrowRight size={15} className="ns-launch-arrow" />
            </div>

            <div
              className="ns-launch-tile"
              onClick={() => onNavigate('video-detection')}
              role="button"
              tabIndex={0}
            >
              <div className="ns-launch-icon-box bg-blue">
                <Video size={20} />
              </div>
              <div className="ns-launch-text">
                <h4>Video Detection</h4>
                <p>Benthic transect video ingestion and temporal analysis</p>
              </div>
              <ArrowRight size={15} className="ns-launch-arrow" />
            </div>

            <div
              className="ns-launch-tile"
              onClick={() => onNavigate('underwater-enhancement')}
              role="button"
              tabIndex={0}
            >
              <div className="ns-launch-icon-box bg-emerald">
                <Sparkles size={20} />
              </div>
              <div className="ns-launch-text">
                <h4>Underwater Enhancement</h4>
                <p>De-haze and correct color attenuation before detection</p>
              </div>
              <ArrowRight size={15} className="ns-launch-arrow" />
            </div>

            <div
              className="ns-launch-tile"
              onClick={() => onNavigate('pollution-analysis')}
              role="button"
              tabIndex={0}
            >
              <div className="ns-launch-icon-box bg-amber">
                <ShieldAlert size={20} />
              </div>
              <div className="ns-launch-text">
                <h4>Pollution Analysis</h4>
                <p>Evaluate marine debris density and ecological threats</p>
              </div>
              <ArrowRight size={15} className="ns-launch-arrow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
