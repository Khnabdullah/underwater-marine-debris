import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  BarChart2,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  Loader2,
  Scan,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';

export default function ImageAnalysisWorkbench() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [viewMode, setViewMode] = useState('annotated'); // 'annotated' or 'original'
  const [confidenceThreshold, setConfidenceThreshold] = useState(20);
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hoveredDetId, setHoveredDetId] = useState(null);

  const fileInputRef = useRef(null);

  // Synthesize an acoustic sonar chime for tactile scan feedback
  const playSonarPing = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.32);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch {
      // Audio autoplay policy handled gracefully
    }
  };

  // Handle file selection from user
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image format (JPG, PNG, WebP).');
      return;
    }

    setError(null);
    setSelectedImage({
      file,
      name: file.name,
      isCustom: true,
    });
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  // Run AI Analysis
  const handleAnalyze = async () => {
    if (!previewUrl) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // 1. If user uploaded a custom file, attempt to send to local FastAPI backend if alive
      if (selectedImage?.file) {
        try {
          const formData = new FormData();
          formData.append('file', selectedImage.file);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          const res = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setAnalysisResult({
                isLiveBackend: true,
                numDetections: data.num_detections,
                detections: data.detections,
                annotatedImage: `data:image/jpeg;base64,${data.annotated_image}`,
                debrisDensity: data.num_detections > 4 ? 'High Density Zone' : data.num_detections > 1 ? 'Moderate Density' : 'Low Presence',
                densityScore: (data.num_detections * 0.18).toFixed(2),
                timestamp: new Date().toLocaleTimeString(),
              });
              setIsAnalyzing(false);
              playSonarPing();
              return;
            }
          }
        } catch (apiErr) {
          console.error('FastAPI backend failed:', apiErr);
          setError(`Cannot reach backend at localhost:8000. Is it running? (${apiErr.message})`);
          setIsAnalyzing(false);
          return;
        }
      } else {
        // If no file, just show error
        setError('Please upload an image first.');
        setIsAnalyzing(false);
        return;
      }
    } catch (err) {
      setError('Analysis failed. Please verify the image format and re-attempt.');
      setIsAnalyzing(false);
    }
  };

  // Filter detections by current confidence threshold
  const activeDetections = (analysisResult?.detections || []).filter(
    (d) => d.confidence >= confidenceThreshold
  );

  const meanConfidence = activeDetections.length
    ? (
        activeDetections.reduce((acc, d) => acc + d.confidence, 0) /
        activeDetections.length
      ).toFixed(1)
    : 0;

  // Class breakdown
  const classBreakdown = activeDetections.reduce((acc, d) => {
    const cls = d.class || 'plastic';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  // Download telemetry JSON
  const handleExportTelemetry = () => {
    if (!analysisResult) return;
    const telemetry = {
      imageName: selectedImage?.name || 'Survey_Image',
      timestamp: new Date().toISOString(),
      numDetections: activeDetections.length,
      meanConfidence: `${meanConfidence}%`,
      debrisDensity: analysisResult.debrisDensity,
      debrisDensityScore_kg_m2: analysisResult.densityScore,
      detections: activeDetections,
    };

    const dataBlob = new Blob([JSON.stringify(telemetry, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nirmalsagar-telemetry-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ns-workbench-stage">
      {/* Workbench Header */}
      <div className="ns-workbench-header">
        <div>
          <h1 className="ns-workbench-title">Image Analysis</h1>
          <p className="ns-workbench-subtitle">
            Upload underwater imagery to detect marine debris.
          </p>
        </div>
      </div>

      {error && (
        <div className="ns-workbench-alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Two Column Layout: Main Stage + Telemetry Panel */}
      <div className="ns-workbench-grid">
        {/* Left Column: Upload & Viewer Stage */}
        <div className="ns-stage-card">
          {!previewUrl ? (
            /* Empty Upload Box (Screenshot 4) */
            <div
              className="ns-upload-box"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const syntheticEvent = { target: { files: [file] } };
                  handleFileChange(syntheticEvent);
                }
              }}
            >
              <div className="ns-upload-icon-circle">
                <UploadCloud size={28} strokeWidth={1.75} />
              </div>

              <h3 className="ns-upload-title">Upload Underwater Image</h3>
              <p className="ns-upload-subtitle">Drag and drop or click to upload</p>

              <div className="ns-upload-btn-group" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ns-btn-choose"
                >
                  Choose Image
                </button>

                <button
                  type="button"
                  disabled={!previewUrl}
                  className="ns-btn-analyze-disabled"
                >
                  <Scan size={15} />
                  Analyze Image
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            /* Active Image Stage with Viewer */
            <div className="ns-active-viewer">
              {/* Viewer Control Bar */}
              <div className="ns-viewer-toolbar">
                <div className="ns-viewer-file-info">
                  <FolderOpen size={16} strokeWidth={1.8} />
                  <span className="ns-file-name">{selectedImage?.name}</span>
                </div>

                <div className="ns-viewer-actions">
                  {analysisResult && (
                    <div className="ns-viewmode-toggle">
                      <button
                        onClick={() => setViewMode('annotated')}
                        className={`ns-mode-btn ${viewMode === 'annotated' ? 'active' : ''}`}
                      >
                        <Eye size={14} />
                        Annotated
                      </button>
                      <button
                        onClick={() => setViewMode('original')}
                        className={`ns-mode-btn ${viewMode === 'original' ? 'active' : ''}`}
                      >
                        <EyeOff size={14} />
                        Original
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`ns-sound-toggle-btn ${soundEnabled ? 'active' : ''}`}
                    title={soundEnabled ? 'Sonar Sonification: Active' : 'Sonar Sonification: Muted'}
                    aria-label={soundEnabled ? 'Mute sonar feedback' : 'Enable sonar feedback'}
                    aria-pressed={soundEnabled}
                  >
                    <div className="ns-icon-swap-container">
                      <span className={`ns-icon-swap ${soundEnabled ? 'ns-icon-visible' : 'ns-icon-hidden'}`}>
                        <Volume2 size={15} strokeWidth={2} />
                      </span>
                      <span className={`ns-icon-swap ${!soundEnabled ? 'ns-icon-visible' : 'ns-icon-hidden'}`}>
                        <VolumeX size={15} strokeWidth={2} />
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedImage(null);
                      setAnalysisResult(null);
                      setHoveredDetId(null);
                    }}
                    className="ns-reset-btn"
                    title="Upload different image"
                  >
                    <RefreshCw size={13} />
                    New Image
                  </button>

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="ns-btn-analyze-active"
                  >
                    {isAnalyzing ? (
                      <Loader2 size={15} className="ns-spin" />
                    ) : (
                      <Scan size={15} />
                    )}
                    <span>{isAnalyzing ? 'Processing...' : analysisResult ? 'Re-Analyze' : 'Analyze Image'}</span>
                  </button>
                </div>
              </div>

              {/* Image Canvas / View Area */}
              <div className="ns-image-viewport">
                {/* Viewport Info Banner */}
                <div className="ns-viewport-hud-banner">
                  <div className="ns-hud-item">
                    <span className="ns-hud-label">FILE</span>
                    <span className="ns-hud-val">{selectedImage?.name || 'Survey Image'}</span>
                  </div>
                  <div className="ns-hud-item">
                    <span className="ns-hud-label">DETECTOR</span>
                    <span className="ns-hud-val">YOLOv11s</span>
                  </div>
                </div>

                {isAnalyzing && (
                  <div className="ns-scanning-overlay">
                    <div className="ns-scanner-line" />
                    <div className="ns-scanner-badge">
                      <Loader2 size={16} className="ns-spin" />
                      Processing segmentation model...
                    </div>
                  </div>
                )}

                <img
                  src={
                    analysisResult && viewMode === 'annotated' && analysisResult.annotatedImage
                      ? analysisResult.annotatedImage
                      : previewUrl
                  }
                  alt="Underwater benthic survey plate"
                  className="ns-display-image"
                />

                {/* Overlaid bounding boxes with interactive hover & spotlight */}
                {analysisResult &&
                  viewMode === 'annotated' &&
                  !analysisResult.annotatedImage?.startsWith('data:') && (
                    <div className="ns-detections-overlay">
                      {activeDetections.map((det, idx) => (
                        <div
                          key={idx}
                          className={`ns-detection-box class-${det.class || 'plastic'} ${
                            hoveredDetId === det.id ? 'active-spotlight' : ''
                          }`}
                          style={{
                            left: `${15 + (idx * 24) % 65}%`,
                            top: `${20 + (idx * 18) % 55}%`,
                            width: `${120 + (idx * 20)}px`,
                            height: `${80 + (idx * 15)}px`,
                          }}
                          onMouseEnter={() => setHoveredDetId(det.id)}
                          onMouseLeave={() => setHoveredDetId(null)}
                        >
                          <span className="ns-box-tag">
                            {det.label || det.class} • {det.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Telemetry & Results Panel (Screenshot 4) */}
        <div className="ns-panel-card">
          {!analysisResult ? (
            /* Screenshot 4: "Waiting for analysis..." empty state */
            <div className="ns-panel-empty">
              <div className="ns-empty-icon-box">
                <BarChart2 size={26} strokeWidth={1.8} />
              </div>
              <h4 className="ns-empty-title">Waiting for analysis...</h4>
              <p className="ns-empty-desc">
                Select an underwater image to begin.
              </p>
            </div>
          ) : (
            /* Real-time Telemetry & Assessment */
            <div className="ns-telemetry-panel">
              <div className="ns-telemetry-header">
                <div className="ns-status-badge">
                  <span className="ns-status-indicator" />
                  ANALYSIS COMPLETE
                </div>
                <span className="ns-timestamp">{analysisResult.timestamp}</span>
              </div>

              {/* Top Metrics Cards */}
              <div className="ns-metrics-grid">
                <div className="ns-metric-box">
                  <span className="ns-metric-label">Objects Detected</span>
                  <span className="ns-metric-value">{activeDetections.length}</span>
                </div>
                <div className="ns-metric-box">
                  <span className="ns-metric-label">Mean Confidence</span>
                  <span className="ns-metric-value">{meanConfidence}%</span>
                </div>
              </div>

              {/* Debris Density Assessment */}
              <div className="ns-density-card">
                <div className="ns-density-top">
                  <span className="ns-density-label">Debris Density Assessment</span>
                  <span className="ns-density-score">{analysisResult.densityScore} items/m²</span>
                </div>
                <div className="ns-density-title">{analysisResult.debrisDensity}</div>
              </div>

              {/* Class Breakdown Bars */}
              <div className="ns-breakdown-section">
                <h5 className="ns-breakdown-title">Debris by Category</h5>

                <div className="ns-breakdown-item">
                  <div className="ns-breakdown-info">
                    <span>Plastic Waste</span>
                    <span className="ns-breakdown-count">{classBreakdown.plastic || 0}</span>
                  </div>
                  <div className="ns-progress-track">
                    <div
                      className="ns-progress-bar bar-plastic"
                      style={{
                        width: `${
                          activeDetections.length
                            ? ((classBreakdown.plastic || 0) / activeDetections.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="ns-breakdown-item">
                  <div className="ns-breakdown-info">
                    <span>Fishing Gear & Nets</span>
                    <span className="ns-breakdown-count">{classBreakdown.gear || 0}</span>
                  </div>
                  <div className="ns-progress-track">
                    <div
                      className="ns-progress-bar bar-gear"
                      style={{
                        width: `${
                          activeDetections.length
                            ? ((classBreakdown.gear || 0) / activeDetections.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="ns-breakdown-item">
                  <div className="ns-breakdown-info">
                    <span>Metal Debris</span>
                    <span className="ns-breakdown-count">{classBreakdown.metal || 0}</span>
                  </div>
                  <div className="ns-progress-track">
                    <div
                      className="ns-progress-bar bar-metal"
                      style={{
                        width: `${
                          activeDetections.length
                            ? ((classBreakdown.metal || 0) / activeDetections.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Detected Objects List (Interactive Spotlight) */}
              {activeDetections.length > 0 && (
                <div className="ns-target-registry-section">
                  <h5 className="ns-breakdown-title">Detected Objects</h5>
                  <div className="ns-target-chips-container">
                    {activeDetections.map((det) => (
                      <div
                        key={det.id}
                        className={`ns-target-chip-row class-${det.class || 'plastic'} ${
                          hoveredDetId === det.id ? 'hovered' : ''
                        }`}
                        onMouseEnter={() => setHoveredDetId(det.id)}
                        onMouseLeave={() => setHoveredDetId(null)}
                      >
                        <div className="ns-target-chip-left">
                          <span className={`ns-target-dot class-${det.class || 'plastic'}`} />
                          <span className="ns-target-chip-label">{det.label || det.class}</span>
                        </div>
                        <span className="ns-target-chip-conf">{det.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sensitivity Slider */}
              <div className="ns-slider-control">
                <div className="ns-slider-header">
                  <span className="ns-slider-label">Confidence Threshold</span>
                  <span className="ns-slider-val">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="ns-range-slider"
                />
              </div>

              {/* Export Telemetry CTA */}
              <button
                onClick={handleExportTelemetry}
                className="ns-export-btn"
                title="Download JSON telemetry log"
              >
                <Download size={15} />
                Export Telemetry JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
