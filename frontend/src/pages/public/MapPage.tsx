// src/pages/public/MapPage.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PotholeMap from '@/components/map/PotholeMap';

const MapPage = () => {
  const { t } = useTranslation();
  return (
    <div className="map-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🗺️ {t('nav.map')}</h1>
          <p className="page-subtitle">
            All reported potholes across Karachi. Circle size indicates severity.
          </p>
        </div>
        <Link to="/report" className="btn-primary btn-sm">+ Report a Pothole</Link>
      </div>
      <div className="map-page-content">
        <PotholeMap height="600px" />
      </div>
    </div>
  );
};

export default MapPage;
