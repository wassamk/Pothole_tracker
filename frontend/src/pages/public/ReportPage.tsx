// src/pages/public/ReportPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReportForm from '@/components/forms/ReportForm';
import type { Pothole } from '@/types';

const ReportPage = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ pothole: Pothole; isCluster: boolean } | null>(null);

  const handleSuccess = (pothole: Pothole, isCluster: boolean) => {
    setResult({ pothole, isCluster });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tips = [
    '📍 Enable GPS for accurate location',
    '📷 Take clear photos in good lighting',
    '📏 Include something for scale if possible',
    '🗺️ Add a landmark for easy identification',
    '⭐ Rate severity honestly — it helps prioritisation',
  ];

  return (
    <div className="report-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🚧 {t('report.title')}</h1>
          <p className="page-subtitle">{t('report.subtitle')}</p>
        </div>
      </div>

      <div className="report-container">
        {submitted && result ? (
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>{t('report.success_title')}</h2>
            <p>{t('report.success_message')}</p>
            <div className="success-details">
              <div className="detail-row">
                <span>Severity Score:</span>
                <strong>{result.pothole.severityScore}</strong>
              </div>
              {result.isCluster && (
                <div className="detail-row cluster-note">
                  🔥 {t('report.cluster_note')}
                </div>
              )}
            </div>
            <div className="success-actions">
              <button
                className="btn-primary"
                onClick={() => { setSubmitted(false); setResult(null); }}
              >
                Report Another
              </button>
              <Link to="/map" className="btn-secondary">View on Map</Link>
            </div>
          </div>
        ) : (
          <div className="form-card">
            <ReportForm onSuccess={handleSuccess} />
          </div>
        )}

        <aside className="report-tips">
          <h3>📋 Reporting Tips</h3>
          <ul>
            {tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
          <div className="tips-note">
            <strong>🔥 Cluster Bonus:</strong> Multiple reports in the same area automatically
            increase the priority score, making repairs happen faster!
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReportPage;
