import React from 'react';
import { Clock, Download, ArrowRight, Trash2 } from 'lucide-react';

export default function HistoryView({ onSelectScan }) {
  const historyItems = [
    {
      id: 'scan-01',
      plateId: 'plate-01',
      title: 'Plate 01: Coral Shelf Waste',
      thumb: '/ocean-micro-debris.jpg',
      date: 'Today, 11:24 AM',
      detections: 6,
      density: 'Moderate (0.38 items/m²)',
      confidence: '91.2%',
    },
    {
      id: 'scan-02',
      plateId: 'plate-02',
      title: 'Plate 02: Monsoonal Diver Survey',
      thumb: '/research-diver.jpg',
      date: 'Yesterday, 04:15 PM',
      detections: 4,
      density: 'High (0.84 items/m²)',
      confidence: '88.6%',
    },
    {
      id: 'scan-03',
      plateId: 'plate-03',
      title: 'Plate 03: Multibeam Bathymetry',
      thumb: '/benthic-sonar-grid.jpg',
      date: 'Aug 29, 2026, 09:02 AM',
      detections: 3,
      density: 'Low (0.19 items/m²)',
      confidence: '75.8%',
    },
  ];

  return (
    <div className="ns-history-root">
      <div className="ns-workbench-header">
        <div>
          <h1 className="ns-workbench-title">Analysis History</h1>
          <p className="ns-workbench-subtitle">
            Log of previously processed underwater images, detected marine targets, and density telemetry.
          </p>
        </div>
      </div>

      <div className="ns-history-card">
        <div className="ns-history-table-container">
          <table className="ns-history-table">
            <thead>
              <tr>
                <th>Survey Image</th>
                <th>Scan Timestamp</th>
                <th>Detections</th>
                <th>Debris Density</th>
                <th>Confidence</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="ns-history-item-thumb-box">
                      <img src={item.thumb} alt={item.title} className="ns-history-thumb" />
                      <span className="ns-history-item-title">{item.title}</span>
                    </div>
                  </td>
                  <td className="ns-history-date">{item.date}</td>
                  <td>
                    <span className="ns-history-count-badge">
                      {item.detections} items
                    </span>
                  </td>
                  <td className="ns-history-density">{item.density}</td>
                  <td className="ns-history-conf">{item.confidence}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onSelectScan(item.plateId)}
                      className="ns-history-action-btn"
                      title="Load into Image Analyzer"
                    >
                      Re-examine
                      <ArrowRight size={14} />
                    </button>
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
