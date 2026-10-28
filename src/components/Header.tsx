import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  counts: {
    openings: number;
    universities: number;
    supervisors: number;
    tracker: number;
  };
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  counts,
  theme,
  onToggleTheme,
}) => {
  return (
    <header>
      <div className="brand">
        <div className="brand-badge">★</div>
        <div>
          <span>PhD Map</span>{' '}
          <span className="brand-sub">European Astrophysics &amp; Cosmology</span>
        </div>
      </div>
      <nav className="tab-group" role="tablist">
        <button
          className={`tab-btn ${activeTab === 'openings' ? 'active' : ''}`}
          onClick={() => onSelectTab('openings')}
          type="button"
        >
          Openings <span className="tab-count">{counts.openings}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'universities' ? 'active' : ''}`}
          onClick={() => onSelectTab('universities')}
          type="button"
        >
          Universities <span className="tab-count">{counts.universities}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'supervisors' ? 'active' : ''}`}
          onClick={() => onSelectTab('supervisors')}
          type="button"
        >
          Supervisors <span className="tab-count">{counts.supervisors}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => onSelectTab('tracker')}
          type="button"
        >
          Tracker <span className="tab-count">{counts.tracker}</span>
        </button>
      </nav>
      <button
        id="theme-toggle"
        className="btn-icon"
        title="Toggle Light/Dark Theme"
        onClick={onToggleTheme}
        type="button"
      >
        ◐
      </button>
    </header>
  );
};
