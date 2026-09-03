import React from 'react';
import BrandLogo from '../common/BrandLogo';

export default function LandingFooter() {
  return (
    <footer className="ns-footer-root">
      <div className="ns-footer-container">
        <div className="ns-footer-left">
          <BrandLogo theme="light" size="md" />
          <p className="ns-footer-tagline">
            Underwater marine debris detection and density mapping.
          </p>
        </div>

        <div className="ns-footer-right">
          <p className="ns-footer-copyright">
            © NirmalSagar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
