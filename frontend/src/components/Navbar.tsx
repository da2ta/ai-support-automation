import React from 'react';
import { Bot, Plus, RefreshCw, Database, Sun, Moon } from 'lucide-react';
import type { HealthCheckResponse } from '../types';

interface NavbarProps {
  health: HealthCheckResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenSubmit: () => void;
  onSeedData: () => void;
  seeding: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  loading,
  onRefresh,
  onOpenSubmit,
  onSeedData,
  seeding,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Bot size={22} />
        </div>
        <div className="brand-text">
          <h1>AI Support Automation</h1>
          <p>Autonomous Ticket Intelligence & Triage</p>
        </div>
      </div>

      <div className="nav-actions">
        {health && (
          <div className="status-pill" title={`Model: ${health.gemini_model}`}>
            <span className={`status-dot ${health.gemini_api_configured ? '' : 'warning'}`} />
            <span>
              {health.gemini_api_configured ? 'Gemini 2.5 Live' : 'AI Fallback Mode'}
            </span>
          </div>
        )}

        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh dashboard data"
        >
          <RefreshCw size={15} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onSeedData}
          disabled={seeding || loading}
          title="Seed realistic sample support tickets"
        >
          <Database size={15} />
          <span>{seeding ? 'Seeding...' : 'Load Sample Data'}</span>
        </button>

        <button className="btn btn-primary" onClick={onOpenSubmit}>
          <Plus size={15} />
          <span>New Ticket</span>
        </button>
      </div>
    </header>
  );
};
