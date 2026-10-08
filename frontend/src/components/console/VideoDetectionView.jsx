import React, { useState, useRef } from 'react';
import {
  Video,
  UploadCloud,
  FolderOpen,
  Play,
  Film,
  AlertCircle,
  Clock,
  FileText,
  Info,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';

export default function VideoDetectionView() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoMeta, setVideoMeta] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fpsSampling, setFpsSampling] = useState(2); // Extract 2 frames per sec
  const [confThreshold, setConfThreshold] = useState(25);

  const fileInputRef = useRef(null);
  const videoPlayerRef = useRef(null);

  // Validate & Load Video File
  const handleVideoFile = (file) => {
    if (!file) return;

    const validExtensions = /\.(mp4|avi|mov|webm|mkv)$/i;
    const validMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    if (!validMimes.includes(file.type) && !file.name.match(validExtensions)) {
      setError('Please select a supported video format (MP4, WebM, MOV, AVI).');
      return;
    }

    const MAX_SIZE = 150 * 1024 * 1024; // 150MB
    if (file.size > MAX_SIZE) {
      setError('Video file exceeds 150MB maximum upload limit.');
      return;
    }

    setError(null);
    setSelectedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleVideoFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleVideoFile(file);
  };

  // Video metadata extraction once loaded
  const handleLoadedMetadata = () => {
    if (videoPlayerRef.current) {
      const vid = videoPlayerRef.current;
      setVideoMeta({
        duration: vid.duration,
        durationFormatted: formatDuration(vid.duration),
        width: vid.videoWidth,
        height: vid.videoHeight,
        sizeMb: (selectedVideo.size / (1024 * 1024)).toFixed(1),
        estimatedFrames: Math.round(vid.duration * 30),
      });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Trigger analysis attempt
  const handleStartAnalysis = () => {
    if (!videoUrl) return;
    setError(
      'Video processing backend is not connected yet. Current FastAPI server provides image inference at /predict. Video batch processing endpoint (/predict-video) will be connected once the video worker service is deployed.'
    );
  };

  const handleReset = () => {
    setSelectedVideo(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="ns-workbench-stage">
      <PageHeader
        title="Video Detection"
        subtitle="Process underwater benthic transect footage to identify marine debris across temporal sequences."
        badge="Batch Pipeline"
      />

      {error && (
        <div className="ns-workbench-alert" role="alert">
          <Info size={18} className="ns-alert-icon" />
          <div className="ns-alert-text">
            <strong>Backend Integration Status:</strong> {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="ns-alert-dismiss"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <div className="ns-workbench-grid">
        {/* Left Column: Video Ingestion & Player */}
        <div className="ns-stage-card">
          {!videoUrl ? (
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
                <Video size={32} strokeWidth={1.75} />
              </div>

              <h3 className="ns-upload-title">Upload Transect Video</h3>
              <p className="ns-upload-subtitle">
                Drag and drop underwater footage or click to browse
              </p>
              <span className="ns-upload-formats-hint">
                Supports MP4, WebM, MOV, AVI • Max 150MB
              </span>

              <div className="ns-upload-btn-group" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ns-btn-choose"
                >
                  <FolderOpen size={15} />
                  Choose Video File
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="ns-active-video-container">
              {/* Video Toolbar */}
              <div className="ns-stage-subbar">
                <div className="ns-file-meta-pill">
                  <Film size={14} />
                  <span className="ns-file-name-text">{selectedVideo?.name}</span>
                  {videoMeta && (
                    <span className="ns-file-dim-text">
                      {videoMeta.width}×{videoMeta.height} • {videoMeta.durationFormatted} ({videoMeta.sizeMb}MB)
                    </span>
                  )}
                </div>

                <div className="ns-stage-actions">
                  <button
                    onClick={handleReset}
                    className="ns-btn-secondary ns-btn-sm"
                    title="Upload different video"
                  >
                    <RefreshCw size={13} />
                    New Video
                  </button>

                  <button
                    onClick={handleStartAnalysis}
                    className="ns-btn-primary ns-btn-sm"
                  >
                    <Play size={14} />
                    Start Video Analysis
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="ns-video-viewport">
                <video
                  ref={videoPlayerRef}
                  src={videoUrl}
                  controls
                  className="ns-display-video"
                  onLoadedMetadata={handleLoadedMetadata}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Pipeline Status Workflow Indicator */}
              <div className="ns-video-pipeline-steps">
                <div className="ns-pipeline-step step-done">
                  <span className="ns-step-dot" />
                  <span className="ns-step-label">1. Video Ingested</span>
                </div>
                <div className="ns-pipeline-step step-ready">
                  <span className="ns-step-dot" />
                  <span className="ns-step-label">2. Frame Sampler ({fpsSampling} FPS)</span>
                </div>
                <div className="ns-pipeline-step step-pending">
                  <span className="ns-step-dot" />
                  <span className="ns-step-label">3. YOLOv11s Batch</span>
                </div>
                <div className="ns-pipeline-step step-pending">
                  <span className="ns-step-dot" />
                  <span className="ns-step-label">4. Timeline Generation</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Parameters & Future Results Panel */}
        <div className="ns-panel-card">
          <div className="ns-telemetry-panel">
            <div className="ns-panel-heading-row">
              <h4 className="ns-panel-title">Video Analysis Parameters</h4>
              <StatusBadge status="info" text="Pipeline Ready" />
            </div>

            {/* Parameter Controls */}
            <div className="ns-settings-group">
              <div className="ns-slider-header">
                <span className="ns-slider-label">Frame Sampling Rate</span>
                <span className="ns-slider-val">{fpsSampling} FPS</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={fpsSampling}
                onChange={(e) => setFpsSampling(Number(e.target.value))}
                className="ns-range-slider"
                aria-label="Frame sampling rate"
              />
              <span className="ns-settings-hint">
                Extracts {fpsSampling} frames per second of footage to optimize GPU throughput.
              </span>
            </div>

            <div className="ns-settings-group">
              <div className="ns-slider-header">
                <span className="ns-slider-label">Detection Confidence Threshold</span>
                <span className="ns-slider-val">{confThreshold}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={confThreshold}
                onChange={(e) => setConfThreshold(Number(e.target.value))}
                className="ns-range-slider"
                aria-label="Detection confidence threshold"
              />
            </div>

            {/* Video Metadata Summary */}
            {videoMeta ? (
              <div className="ns-meta-summary-box">
                <h5 className="ns-breakdown-title">Video Telemetry</h5>
                <div className="ns-meta-grid-2">
                  <div className="ns-meta-item">
                    <span className="ns-meta-lbl">Duration</span>
                    <span className="ns-meta-val">{videoMeta.durationFormatted}</span>
                  </div>
                  <div className="ns-meta-item">
                    <span className="ns-meta-lbl">Resolution</span>
                    <span className="ns-meta-val">{videoMeta.width}×{videoMeta.height}</span>
                  </div>
                  <div className="ns-meta-item">
                    <span className="ns-meta-lbl">File Size</span>
                    <span className="ns-meta-val">{videoMeta.sizeMb} MB</span>
                  </div>
                  <div className="ns-meta-item">
                    <span className="ns-meta-lbl">Est. Keyframes</span>
                    <span className="ns-meta-val">
                      {Math.round(videoMeta.duration * fpsSampling)} frames
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ns-meta-summary-box ns-meta-placeholder">
                <p className="ns-hint-muted">
                  Upload underwater video footage to inspect stream parameters.
                </p>
              </div>
            )}

            {/* Backend Integration Info Box */}
            <div className="ns-info-card">
              <div className="ns-info-card-header">
                <Info size={16} />
                <span>Backend Integration Notice</span>
              </div>
              <p className="ns-info-card-body">
                Video processing requires frame-by-frame batch inference on a GPU-enabled server.
                The frontend is structured to visualize time-series detections, frame timestamps,
                and annotated video playback once the video worker is operational.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
