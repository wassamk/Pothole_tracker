// src/components/map/PotholeMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { potholeApi } from '@/utils/api';
import StatusBadge from '@/components/common/StatusBadge';
import SeverityBadge from '@/components/common/SeverityBadge';
import type { Pothole, PotholeStatus } from '@/types';
import type { LatLngTuple } from 'leaflet';

const KARACHI_CENTER: LatLngTuple = [24.8607, 67.0011];

const markerColor = (score: number) => {
  if (score >= 41) return '#ef4444';
  if (score >= 21) return '#f97316';
  return '#22c55e';
};

// Auto-fit map to all markers
const FitBounds = ({ potholes }: { potholes: Pothole[] }) => {
  const map = useMap();
  useEffect(() => {
    if (potholes.length === 0) return;
    const bounds: LatLngTuple[] = potholes.map((p) => [
      p.location.coordinates[1],
      p.location.coordinates[0],
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [potholes, map]);
  return null;
};

interface Props {
  height?: string;
}

const ALL_STATUSES: Array<PotholeStatus | 'all'> = [
  'all', 'Reported', 'In Progress', 'Resolved',
];

const PotholeMap = ({ height = '500px' }: Props) => {
  const { t } = useTranslation();
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PotholeStatus | 'all'>('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = filter !== 'all' ? { status: filter, limit: 500 } : { limit: 500 };
        const res = await potholeApi.getAll(params);
        setPotholes(res.data.data);
      } catch {
        // map still renders empty
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter]);

  return (
    <div className="map-wrapper">
      <div className="map-filters">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`filter-btn${filter === s ? ' active' : ''}`}
          >
            {s === 'all' ? t('admin.filter_all') : t(`status.${s}`, s)}
          </button>
        ))}
        <span className="map-count">{potholes.length} reports</span>
      </div>

      <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
        <MapContainer
          center={KARACHI_CENTER}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!loading && <FitBounds potholes={potholes} />}

          {potholes.map((p) => {
            const lat = p.location.coordinates[1];
            const lng = p.location.coordinates[0];
            const color = markerColor(p.severityScore);
            return (
              <CircleMarker
                key={p._id}
                center={[lat, lng]}
                radius={Math.max(6, p.severityScore / 6)}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
              >
                <Popup>
                  <div className="map-popup">
                    <div className="popup-header"><strong>Pothole Report</strong></div>
                    <div className="popup-badges">
                      <SeverityBadge score={p.severityScore} />
                      <StatusBadge status={p.status} />
                    </div>
                    {p.address && <p className="popup-address">📍 {p.address}</p>}
                    {p.description && <p className="popup-desc">{p.description}</p>}
                    <p className="popup-coords">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
                    {p.clusterCount > 0 && (
                      <p className="popup-cluster">🔥 Cluster: {p.clusterCount} nearby</p>
                    )}
                    <p className="popup-date">
                      📅 {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                    {p.images[0] && (
                      <img
                        src={p.images[0]} alt="Pothole" className="popup-image"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="map-legend">
        <span className="legend-dot" style={{ background: '#22c55e' }} /> Low (1–20)
        <span className="legend-dot" style={{ background: '#f97316' }} /> Medium (21–40)
        <span className="legend-dot" style={{ background: '#ef4444' }} /> High (41+)
      </div>
    </div>
  );
};

export default PotholeMap;
