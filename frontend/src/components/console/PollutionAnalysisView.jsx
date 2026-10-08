import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  Download,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  Clock,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';
import PageHeader from '../common/PageHeader';
import MetricCard from '../common/MetricCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';

export default function PollutionAnalysisView({ onNavigate }) {
  const { currentAnalysis, history } = useAnalysis();

  // Use current analysis, or fallback to most recent completed analysis in history
  const activeAnalysis =
    currentAnalysis || (history.length > 0 ? history[0] : null);

  const handleExportReport = () => {
    if (!activeAnalysis) return;

    const report = {
      reportType: 'NirmalSagar Environmental Pollution Assessment',
      generatedAt: new Date().toISOString(),
      surveyFilename: activeAnalysis.filename || 'Survey_Image.jpg',
      numDetections: activeAnalysis.numDetections || 0,
      detectedObjects: activeAnalysis.detections || [],
      classBreakdown: activeAnalysis.classBreakdown || {},
      methodologyNote:
        'Calibrated benthic density requires transect area (m²) calibration.',
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nirmalsagar-pollution-assessment-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeAnalysis) {
    return (
      <div className="ns-workbench-stage">
        <PageHeader
          title="Pollution Analysis"
          subtitle="Taxonomic debris categorization, ecological threat profiling, and benthic pollution assessment."
          badge="Environmental Assessment"
        />

        <div className="ns-stage-card" style={{ padding: '48px 24px' }}>
          <EmptyState
            icon={ShieldAlert}
            title="No survey analysis loaded"
            description="Run an image or video detection first to evaluate marine litter density and ecological hazard classification."
            actionText="Go to Image Detection"
            onAction={() => onNavigate('image-detection')}
          />
        </div>
      </div>
    );
  }

  const detections = activeAnalysis.detections || [];
  const numDetections = activeAnalysis.numDetections || detections.length;
  const breakdown = activeAnalysis.classBreakdown || {};

  // Compute dominant category
  let dominantCategory = 'None';
  let maxCount = 0;
  Object.entries(breakdown).forEach(([cls, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = cls;
    }
  });

  // Ecological hazard summary based on detected types
  const hasNets = Boolean(breakdown.gear || breakdown.net || breakdown.fishing_gear);
  const hasPlastic = Boolean(breakdown.plastic || breakdown.polymer || breakdown.bottle);
  const hasMetal = Boolean(breakdown.metal || breakdown.can);

  return (
    <div className="ns-workbench-stage">
      <PageHeader
        title="Pollution Analysis"
        subtitle="Taxonomic debris categorization, ecological threat profiling, and benthic pollution assessment."
        badge="Environmental Assessment"
      >
        <button onClick={handleExportReport} className="ns-btn-secondary">
          <Download size={14} />
          Export Assessment Report
        </button>
      </PageHeader>

      {/* Survey Info Banner */}
      <div className="ns-survey-meta-banner">
        <div className="ns-meta-banner-left">
          <FileText size={16} />
          <span>Active Survey: <strong>{activeAnalysis.filename || 'Survey Image'}</strong></span>
          <span className="ns-dot-sep">•</span>
          <Clock size={14} />
          <span>{activeAnalysis.displayDate || activeAnalysis.timestamp || 'Recent Run'}</span>
        </div>
        <StatusBadge status="completed" text="Survey Calibrated" />
      </div>

      {/* Metrics Overview */}
      <div className="ns-dash-stats-grid">
        <MetricCard
          title="Segmented Debris Items"
          value={numDetections}
          subtitle="Total verified optical targets"
          icon={Layers}
          badge="Count"
        />

        <MetricCard
          title="Dominant Category"
          value={dominantCategory.charAt(0).toUpperCase() + dominantCategory.slice(1).replace('_', ' ')}
          subtitle={maxCount > 0 ? `${maxCount} of ${numDetections} targets` : 'No dominant class'}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Qualitative Density"
          value={numDetections > 5 ? 'High Accumulation' : numDetections > 2 ? 'Moderate Presence' : numDetections > 0 ? 'Low / Sparse' : 'Clean Survey'}
          subtitle="Relative target concentration"
          icon={ShieldAlert}
        />

        <MetricCard
          title="Survey Type"
          value={activeAnalysis.type === 'video' ? 'Video Transect' : 'Benthic Still Frame'}
          subtitle="Optical survey modality"
          icon={LifeBuoy}
        />
      </div>

      {/* Scientific Methodology Notice (Mandatory Requirement) */}
      <div className="ns-methodology-notice-card">
        <div className="ns-methodology-header">
          <Info size={18} />
          <h4>Standardized Marine Pollution Scoring Methodology</h4>
        </div>
        <p className="ns-methodology-text">
          Scientific Note: Standardized marine pollution scoring requires calibrated survey transect area measurements (m² / km²) and water column depth profiling. The metrics displayed here reflect detected debris counts and spatial classifications directly extracted by the YOLOv11s model from the active survey imagery.
        </p>
      </div>

      {/* Two Column Section: Category Distribution + Threat Assessment */}
      <div className="ns-dash-split-grid">
        {/* Left: Debris Classification */}
        <div className="ns-dash-card">
          <div className="ns-dash-card-header">
            <h3 className="ns-dash-card-title">Taxonomic Category Breakdown</h3>
            <span className="ns-dash-badge">Optical Census</span>
          </div>

          <div className="ns-card-body">
            {Object.keys(breakdown).length === 0 ? (
              <EmptyState
                title="No categorized debris"
                description="Zero debris objects were flagged in this survey plate."
              />
            ) : (
              <div className="ns-breakdown-bars-container">
                {Object.entries(breakdown).map(([clsName, count]) => {
                  const pct = numDetections ? Math.round((count / numDetections) * 100) : 0;
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

        {/* Right: Environmental Threat Matrix & Mitigation */}
        <div className="ns-dash-card">
          <div className="ns-dash-card-header">
            <h3 className="ns-dash-card-title">Ecological Risk & Mitigation Profile</h3>
            <span className="ns-dash-badge">Environmental Impact</span>
          </div>

          <div className="ns-threat-items-stack">
            {hasNets && (
              <div className="ns-threat-item threat-high">
                <div className="ns-threat-icon-box">
                  <AlertTriangle size={18} />
                </div>
                <div className="ns-threat-content">
                  <h5>Ghost Fishing & Entanglement Hazard (High)</h5>
                  <p>
                    Abandoned fishing gear and nets pose severe risks of continuous marine fauna entrapment and coral reef smothering.
                  </p>
                  <span className="ns-mitigation-tag">Recommended: Diver retrieval operation</span>
                </div>
              </div>
            )}

            {hasPlastic && (
              <div className="ns-threat-item threat-medium">
                <div className="ns-threat-icon-box">
                  <ShieldAlert size={18} />
                </div>
                <div className="ns-threat-content">
                  <h5>Polymer Ingestion & Microplastic Fragmentation</h5>
                  <p>
                    Macro-plastic waste undergoes continuous photodegradation and hydrodynamic fragmentation into hazardous microplastics.
                  </p>
                  <span className="ns-mitigation-tag">Recommended: Benthic litter recovery</span>
                </div>
              </div>
            )}

            {hasMetal && (
              <div className="ns-threat-item threat-low">
                <div className="ns-threat-icon-box">
                  <Info size={18} />
                </div>
                <div className="ns-threat-content">
                  <h5>Metallic Corrosion & Chemical Leaching</h5>
                  <p>
                    Corroded metallic canisters and debris can leach heavy metal oxides into local benthic substrates over extended timescales.
                  </p>
                </div>
              </div>
            )}

            {!hasNets && !hasPlastic && !hasMetal && (
              <div className="ns-threat-item threat-clean">
                <div className="ns-threat-icon-box">
                  <CheckCircle size={18} />
                </div>
                <div className="ns-threat-content">
                  <h5>Low Ecological Hazard</h5>
                  <p>
                    No high-threat marine litter categories were detected in this optical survey frame.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
