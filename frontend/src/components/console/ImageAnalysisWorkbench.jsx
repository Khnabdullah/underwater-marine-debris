import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Download,
  AlertCircle,
  FolderOpen,
  Loader2,
  Scan,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  BarChart2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';
import ImageViewer from '../common/ImageViewer';
import StatusBadge from '../common/StatusBadge';

export default function ImageAnalysisWorkbench({ onNavigate }) {
  const {
    settings,
    currentAnalysis,
    setCurrentAnalysis,
    addHistoryItem,
    enhancedImageTransfer,
    setEnhancedImageTransfer,
    backendStatus,
  } = useAnalysis();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [hoveredDetId, setHoveredDetId] = useState(null);
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState(settings.defaultConfidenceThreshold || 5);
  const [imageMeta, setImageMeta] = useState(null);

  const fileInputRef = useRef(null);

  // If coming from Underwater Enhancement with an enhanced image:
  useEffect(() => {
    if (enhancedImageTransfer) {
      setPreviewUrl(enhancedImageTransfer.dataUrl);
      setSelectedFile({
        name: enhancedImageTransfer.filename || 'enhanced-survey-image.jpg',
        isEnhanced: true,
        blob: enhancedImageTransfer.blob,
      });
      setAnalysisResult(null);
      setError(null);
      // Clear transfer after consuming
      setEnhancedImageTransfer(null);
    }
  }, [enhancedImageTransfer, setEnhancedImageTransfer]);

  // If an analysis was loaded from history/dashboard:
  useEffect(() => {
    if (currentAnalysis && currentAnalysis.originalImage && !analysisResult) {
      setPreviewUrl(currentAnalysis.originalImage);
      setSelectedFile({
        name: currentAnalysis.filename,
        fromHistory: true,
      });
      setAnalysisResult({
        numDetections: currentAnalysis.numDetections,
        detections: currentAnalysis.detections,
        annotatedImage: currentAnalysis.annotatedImage,
        rawJson: currentAnalysis.rawJson || null,
        durationMs: currentAnalysis.durationMs,
        timestamp: currentAnalysis.displayDate || currentAnalysis.timestamp,
        isFromHistory: true,
      });
    }
  }, [currentAnalysis, analysisResult]);

  // Handle file validation and loading
  const processImageFile = (file) => {
    if (!file) return;

    // Format validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setError('Please select a valid underwater image file (JPG, PNG, WebP).');
      return;
    }

    // Size validation (25MB limit)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('Selected image exceeds the 25MB maximum size limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setAnalysisResult(null);
    setCurrentAnalysis(null);

    // Read natural image dimensions
    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeBytes: file.size,
      });
    };
    img.src = objectUrl;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  // Run Inference against backend
  const handleAnalyze = async () => {
    if (!previewUrl || (!selectedFile && !enhancedImageTransfer)) return;

    setIsAnalyzing(true);
    setError(null);
    const startTime = performance.now();

    try {
      const formData = new FormData();

      if (selectedFile?.blob) {
        // Blob from enhanced canvas
        formData.append('file', selectedFile.blob, selectedFile.name);
      } else if (selectedFile instanceof File) {
        formData.append('file', selectedFile);
      } else if (previewUrl.startsWith('data:')) {
        // Data URL conversion
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        formData.append('file', blob, selectedFile?.name || 'survey-image.jpg');
      } else if (previewUrl.startsWith('blob:')) {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        formData.append('file', blob, selectedFile?.name || 'survey-image.jpg');
      } else {
        throw new Error('Unable to package image file for inference.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const endpoint = settings.backendUrl || 'http://localhost:8000/predict';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      if (!response.ok) {
        let errorMsg = `Server returned HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      // Format detections list
      const detections = data.detections || [];
      const annotatedImageUrl = data.annotated_image
        ? `data:image/jpeg;base64,${data.annotated_image}`
        : previewUrl;

      // Class breakdown calculation from actual returned detections
      const breakdown = detections.reduce((acc, d) => {
        const cls = d.class || 'plastic';
        acc[cls] = (acc[cls] || 0) + 1;
        return acc;
      }, {});

      const resultPayload = {
        numDetections: data.num_detections ?? detections.length,
        detections: detections,
        annotatedImage: annotatedImageUrl,
        originalImage: previewUrl,
        filename: selectedFile?.name || 'Survey_Image.jpg',
        durationMs,
        rawJson: data,
        classBreakdown: breakdown,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAnalysisResult(resultPayload);

      // Save to global state & persistent history
      setCurrentAnalysis(resultPayload);
      if (settings.autoSaveHistory) {
        addHistoryItem({
          type: 'image',
          filename: selectedFile?.name || 'Survey_Image.jpg',
          numDetections: resultPayload.numDetections,
          detections: detections,
          thumbnail: annotatedImageUrl,
          annotatedImage: annotatedImageUrl,
          originalImage: previewUrl,
          durationMs,
          classBreakdown: breakdown,
          rawJson: data,
        });
      }
    } catch (err) {
      console.error('Image analysis failed:', err);
      let message = err.message || 'Image analysis failed.';
      if (err.name === 'AbortError') {
        message = 'Analysis request timed out after 45 seconds. Check if backend is busy.';
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        message = `Unable to reach inference backend at ${settings.backendUrl}. Please ensure FastAPI is running (python backend/app.py).`;
      }
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset current workspace
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setHoveredDetId(null);
    setImageMeta(null);
    setCurrentAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Copy raw JSON to clipboard
  const handleCopyJson = () => {
    if (!analysisResult?.rawJson) return;
    navigator.clipboard.writeText(JSON.stringify(analysisResult.rawJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Filter detections by threshold
  const activeDetections = (analysisResult?.detections || []).filter(
    (d) => d.confidence >= confidenceFilter
  );

  const meanConfidence = activeDetections.length
    ? (
        activeDetections.reduce((sum, d) => sum + d.confidence, 0) /
        activeDetections.length
      ).toFixed(1)
    : 0;

  // Real class counts from filtered active detections
  const activeClassBreakdown = activeDetections.reduce((acc, d) => {
    const cls = d.class || 'plastic';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="ns-workbench-stage">
      {/* Header */}
      <div className="ns-workbench-header">
        <div>
          <div className="ns-header-title-row">
            <h1 className="ns-workbench-title">Image Detection</h1>
            <span className="ns-header-badge">YOLOv11s Segmentation</span>
          </div>
          <p className="ns-workbench-subtitle">
            Upload underwater imagery to identify, segment, and localize benthic marine debris.
          </p>
        </div>

        {analysisResult && onNavigate && (
          <div className="ns-header-actions">
            <button
              onClick={() => onNavigate('pollution-analysis')}
              className="ns-btn-secondary"
              title="Open Pollution Analysis with these detections"
            >
              <ShieldAlert size={15} />
              Pollution Assessment
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="ns-workbench-alert" role="alert">
          <AlertCircle size={18} className="ns-alert-icon" />
          <div className="ns-alert-text">
            <strong>Inference Notice:</strong> {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="ns-alert-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Left Viewer/Upload + Right Results Panel */}
      <div className="ns-workbench-grid">
        {/* Left Column: Stage */}
        <div className="ns-stage-card">
          {!previewUrl ? (
            /* Upload Dropzone */
            <div
              className="ns-upload-box"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <div className="ns-upload-icon-circle">
                <UploadCloud size={32} strokeWidth={1.75} />
              </div>

              <h3 className="ns-upload-title">Upload Underwater Image</h3>
              <p className="ns-upload-subtitle">
                Drag and drop your survey photo or click to browse
              </p>
              <span className="ns-upload-formats-hint">
                Supports JPG, JPEG, PNG, WebP • Max 25MB
              </span>

              <div className="ns-upload-btn-group" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ns-btn-choose"
                >
                  <FolderOpen size={15} />
                  Choose File
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            /* Active Image Stage with Viewer */
            <div className="ns-active-viewer-container">
              {/* Top Sub-Bar */}
              <div className="ns-stage-subbar">
                <div className="ns-file-meta-pill">
                  <FolderOpen size={14} />
                  <span className="ns-file-name-text">{selectedFile?.name || 'Survey Image'}</span>
                  {imageMeta && (
                    <span className="ns-file-dim-text">
                      {imageMeta.width}×{imageMeta.height}
                    </span>
                  )}
                </div>

                <div className="ns-stage-actions">
                  <button
                    onClick={handleReset}
                    className="ns-btn-secondary ns-btn-sm"
                    title="Upload a different image"
                  >
                    <RefreshCw size={13} />
                    New Image
                  </button>

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="ns-btn-primary ns-btn-sm"
                  >
                    {isAnalyzing ? (
                      <Loader2 size={14} className="ns-spin" />
                    ) : (
                      <Scan size={14} />
                    )}
                    <span>
                      {isAnalyzing
                        ? 'Analyzing...'
                        : analysisResult
                        ? 'Re-Run Detection'
                        : 'Analyze Image'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Robust Image Viewer Component */}
              <ImageViewer
                originalSrc={previewUrl}
                annotatedSrc={analysisResult?.annotatedImage}
                filename={selectedFile?.name}
                detections={activeDetections}
                hoveredDetId={hoveredDetId}
                onHoverDet={setHoveredDetId}
                isAnalyzing={isAnalyzing}
              />
            </div>
          )}
        </div>

        {/* Right Column: Telemetry & Results Panel */}
        <div className="ns-panel-card">
          {!analysisResult ? (
            <div className="ns-panel-empty">
              <div className="ns-empty-icon-box">
                <BarChart2 size={28} strokeWidth={1.75} />
              </div>
              <h4 className="ns-empty-title">Awaiting Analysis</h4>
              <p className="ns-empty-desc">
                {previewUrl
                  ? 'Click "Analyze Image" above to run YOLOv11s object detection.'
                  : 'Select or drag an underwater image into the upload area to begin.'}
              </p>
              {backendStatus.isOnline ? (
                <div className="ns-backend-ready-pill">
                  <span className="ns-status-dot-green" />
                  <span>Inference server connected</span>
                </div>
              ) : (
                <div className="ns-backend-offline-pill">
                  <span className="ns-status-dot-amber" />
                  <span>Backend status: Offline</span>
                </div>
              )}
            </div>
          ) : (
            <div className="ns-telemetry-panel">
              {/* Telemetry Header */}
              <div className="ns-telemetry-header">
                <div>
                  <div className="ns-status-badge">
                    <span className="ns-status-indicator" />
                    ANALYSIS COMPLETE
                  </div>
                  {analysisResult.durationMs && (
                    <span className="ns-latency-tag-small">
                      {analysisResult.durationMs}ms inference
                    </span>
                  )}
                </div>
                <span className="ns-timestamp">{analysisResult.timestamp}</span>
              </div>

              {/* Summary Metrics */}
              <div className="ns-metrics-grid">
                <div className="ns-metric-box">
                  <span className="ns-metric-label">Objects Detected</span>
                  <span className="ns-metric-value">{activeDetections.length}</span>
                </div>
                <div className="ns-metric-box">
                  <span className="ns-metric-label">Mean Confidence</span>
                  <span className="ns-metric-value">
                    {activeDetections.length > 0 ? `${meanConfidence}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Debris Categories Breakdown (Derived from real response) */}
              <div className="ns-breakdown-section">
                <h5 className="ns-breakdown-title">Detections by Category</h5>

                {Object.keys(activeClassBreakdown).length === 0 ? (
                  <p className="ns-no-detections-text">
                    No objects detected above the {confidenceFilter}% confidence threshold.
                  </p>
                ) : (
                  <div className="ns-breakdown-bars-container">
                    {Object.entries(activeClassBreakdown).map(([clsName, count]) => {
                      const pct = activeDetections.length
                        ? Math.round((count / activeDetections.length) * 100)
                        : 0;
                      return (
                        <div key={clsName} className="ns-breakdown-item">
                          <div className="ns-breakdown-info">
                            <span className="ns-breakdown-class-name">
                              {clsName.charAt(0).toUpperCase() + clsName.slice(1).replace('_', ' ')}
                            </span>
                            <span className="ns-breakdown-count">
                              {count} ({pct}%)
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

              {/* Real Detection Table */}
              {activeDetections.length > 0 && (
                <div className="ns-detection-table-section">
                  <div className="ns-table-header-row">
                    <h5 className="ns-breakdown-title">Detected Targets</h5>
                    <span className="ns-table-count-sub">
                      Showing {activeDetections.length} item{activeDetections.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="ns-detection-table-wrap">
                    <table className="ns-detection-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Class</th>
                          <th>Confidence</th>
                          <th>Bounding Box</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeDetections.map((det) => (
                          <tr
                            key={det.id}
                            className={hoveredDetId === det.id ? 'row-hovered' : ''}
                            onMouseEnter={() => setHoveredDetId(det.id)}
                            onMouseLeave={() => setHoveredDetId(null)}
                          >
                            <td className="ns-col-id">{det.id}</td>
                            <td>
                              <span className={`ns-class-tag tag-${(det.class || '').toLowerCase()}`}>
                                {det.label || det.class}
                              </span>
                            </td>
                            <td className="ns-col-conf">{det.confidence}%</td>
                            <td className="ns-col-bbox">
                              {det.bbox && Array.isArray(det.bbox)
                                ? `[${det.bbox.map((n) => Math.round(n)).join(', ')}]`
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Confidence Sensitivity Filter */}
              <div className="ns-slider-control">
                <div className="ns-slider-header">
                  <span className="ns-slider-label">Confidence Filter Threshold</span>
                  <span className="ns-slider-val">{confidenceFilter}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(Number(e.target.value))}
                  className="ns-range-slider"
                  aria-label="Confidence threshold slider"
                />
              </div>

              {/* Technical Information Expandable Panel */}
              <div className="ns-technical-panel">
                <button
                  onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
                  className="ns-technical-toggle"
                  type="button"
                >
                  <div className="ns-tech-toggle-left">
                    <Info size={14} />
                    <span>Technical Response Payload</span>
                  </div>
                  {showTechnicalInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showTechnicalInfo && (
                  <div className="ns-technical-content">
                    <div className="ns-tech-meta-row">
                      <span>Status: 200 OK</span>
                      <span>Total Targets: {analysisResult.numDetections}</span>
                      {analysisResult.durationMs && <span>Latency: {analysisResult.durationMs}ms</span>}
                    </div>

                    {analysisResult.rawJson && (
                      <div className="ns-json-box">
                        <div className="ns-json-box-header">
                          <span>Raw JSON Response</span>
                          <button
                            onClick={handleCopyJson}
                            className="ns-copy-btn"
                            title="Copy raw JSON"
                          >
                            {copiedJson ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="ns-json-pre">
                          {JSON.stringify(
                            {
                              success: analysisResult.rawJson.success,
                              num_detections: analysisResult.rawJson.num_detections,
                              detections: analysisResult.rawJson.detections,
                              annotated_image: analysisResult.rawJson.annotated_image
                                ? `[base64 string - ${Math.round(analysisResult.rawJson.annotated_image.length / 1024)} KB]`
                                : undefined,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
