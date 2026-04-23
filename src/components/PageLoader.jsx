import React from 'react';
import './PageLoader.css';

const DOT_COUNT = 4;

const PageLoader = ({
  isExiting = false,
  logoSrc = '/images/logo.webp',
}) => {
  return (
    <div
      className={`page-loader${isExiting ? ' page-loader--exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="page-loader__content">
        <img src={logoSrc} alt="Company logo" className="page-loader__logo" />
        <div className="page-loader__dots" aria-hidden="true">
          {Array.from({ length: DOT_COUNT }).map((_, index) => (
            <span
              key={`loader-dot-${index}`}
              className="page-loader__dot"
              style={{ '--dot-delay': `${index * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
