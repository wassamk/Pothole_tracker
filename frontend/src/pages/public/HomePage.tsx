// src/pages/public/HomePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { potholeApi } from '@/utils/api';

const HomePage = () => {
  const { t } = useTranslation();
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    potholeApi.getAll({ limit: 1 })
      .then((res) => setTotal(res.data.pagination.total))
      .catch(() => {/* non-critical */});
  }, []);

  const steps = [
    { icon: '📍', num: '01', title: 'Spot a Pothole',  body: 'Find a dangerous road condition anywhere in Karachi.' },
    { icon: '📷', num: '02', title: 'Report & Photo',  body: 'Submit your location and a photo. Our system auto-detects nearby clusters.' },
    { icon: '🔥', num: '03', title: 'Priority Score',  body: 'Smart algorithm ranks severity — high-traffic danger zones get prioritised.' },
    { icon: '🛠️', num: '04', title: 'Track & Resolve', body: 'Administrators manage repairs and update status from Reported → Resolved.' },
  ];

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🏙️ Karachi, Pakistan</div>
          <h1 className="hero-title">{t('home.hero_title')}</h1>
          <p className="hero-subtitle">{t('home.hero_subtitle')}</p>
          <div className="hero-ctas">
            <Link to="/report" className="btn-primary">🚧 {t('home.cta_report')}</Link>
            <Link to="/map"    className="btn-secondary">🗺️ {t('home.cta_map')}</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="road-lines">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="road-line" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <div className="road-sign">⚠️</div>
        </div>
      </section>

      {/* Stats bar */}
      {total !== null && (
        <section className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{total.toLocaleString()}</span>
            <span className="stat-label">{t('home.stats_total')}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">🔧</span>
            <span className="stat-label">{t('home.stats_inprogress')}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">✅</span>
            <span className="stat-label">{t('home.stats_resolved')}</span>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.num} className="step-card">
              <div className="step-icon">{s.icon}</div>
              <div className="step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h2>Every Report Makes Karachi Safer</h2>
        <p>Join citizens helping fix our roads.</p>
        <Link to="/report" className="btn-primary btn-large">
          🚧 {t('home.cta_report')}
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
