import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Search,
  Bell,
  ArrowLeft
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import ImageAnalysisWorkbench from './ImageAnalysisWorkbench';
import '../../styles/workbench.css';

export default function ConsoleLayout({ onReturnToLanding }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  return (
    <div className="ns-console-root">
      {/* 1. Left Sidebar */}
      <aside className="ns-sidebar">
        <div className="ns-sidebar-top">
          <div className="ns-sidebar-brand" onClick={onReturnToLanding} title="Return to Landing Page">
            <BrandLogo theme="dark" size="md" />
          </div>

          {/* Nav items: Image Analysis workbench only */}
          <nav className="ns-sidebar-nav">
            <button className="ns-nav-item active">
              <ImageIcon size={18} />
              <span>Image Analysis</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* 2. Main Console Stage */}
      <div className="ns-console-main">
        {/* Top Header Bar */}
        <header className="ns-console-topbar">
          <div className="ns-topbar-left">
            {/* Console Badge */}
            <div className="ns-console-badge">
              <span className="ns-badge-dot" />
              <span>NIRMAL SAGAR CONSOLE</span>
            </div>
          </div>

          <div className="ns-topbar-right">
            {/* Search */}
            <div className="ns-search-wrapper">
              {showSearchInput ? (
                <input
                  type="text"
                  placeholder="Search surveys, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setShowSearchInput(false)}
                  autoFocus
                  className="ns-search-input"
                />
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="ns-topbar-icon-btn"
                  title="Search console"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* Notification Bell */}
            <button
              className="ns-topbar-icon-btn"
              title="Alerts: 0 unread"
              onClick={() => alert('Detection engine ready.')}
            >
              <Bell size={18} />
            </button>

            {/* Back to Home / Landing */}
            <button
              onClick={onReturnToLanding}
              className="ns-back-landing-btn"
              title="Return to Home"
            >
              <ArrowLeft size={14} />
              <span>Exit Console</span>
            </button>
          </div>
        </header>

        {/* Image Analysis Workbench View */}
        <main className="ns-console-content">
          <ImageAnalysisWorkbench />
        </main>
      </div>
    </div>
  );
}
