// src/components/map/PotholeMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
// @ts-expect-error
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

// 1. NEW COMPONENT: Controls the camera zooming/flying to a specific location
const FlyToPothole = ({ target }: { target: LatLngTuple | null }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 18, { duration: 1.5 }); // Zoom level 18, 1.5s animation
    }
  }, [target, map]);
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
  
  // 2. NEW STATE: Track the currently focused pothole
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = filter !== 'all' ? { status: filter, limit: 500 } : { limit: 500 };
        const res = await potholeApi.getAll(params);
        setPotholes(res.data.data);
        setActiveIndex(null); // Reset navigation when filters change
      } catch {
        // map still renders empty
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter]);

  // 3. NEW FUNCTIONS: Handle Previous/Next logic
  const handlePrev = () => {
    if (potholes.length === 0) return;
    setActiveIndex((prev) => (prev === null || prev === 0 ? potholes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (potholes.length === 0) return;
    setActiveIndex((prev) => (prev === null || prev === potholes.length - 1 ? 0 : prev + 1));
  };

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

      <div style={{ position: 'relative', height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
        
        {/* 4. NEW UI: The Next/Prev Navigation Overlay */}
        <div style={{
          position: 'absolute', top: '10px', right: '10px', zIndex: 1000, 
          display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.85)', 
          padding: '8px 12px', borderRadius: '8px', alignItems: 'center'
        }}>
          <button onClick={handlePrev} className="filter-btn" style={{ margin: 0, padding: '4px 12px' }}>
            &larr; Prev
          </button>
          <span style={{ color: '#94a3b8', fontSize: '14px', minWidth: '60px', textAlign: 'center' }}>
            {activeIndex !== null ? `${activeIndex + 1} / ${potholes.length}` : 'Explore'}
          </span>
          <button onClick={handleNext} className="filter-btn" style={{ margin: 0, padding: '4px 12px' }}>
            Next &rarr;
          </button>
        </div>

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
          
          {/* 5. NEW: Add the FlyTo component */}
          <FlyToPothole 
            target={
              activeIndex !== null && potholes[activeIndex]
                ? [potholes[activeIndex].location.coordinates[1], potholes[activeIndex].location.coordinates[0]]
                : null
            } 
          />

          {potholes.map((p, index) => {
            const lat = p.location.coordinates[1];
            const lng = p.location.coordinates[0];
            const color = markerColor(p.severityScore);
            
            // Highlight the active marker visually if it is currently selected
            const isActive = index === activeIndex;

            return (
              <CircleMarker
                key={p._id}
                center={[lat, lng]}
                radius={Math.max(6, p.severityScore / 6)}
                pathOptions={{ 
                  color: isActive ? '#fff' : color, 
                  fillColor: color, 
                  fillOpacity: isActive ? 1 : 0.7, 
                  weight: isActive ? 4 : 2 
                }}
                // Allow users to click a dot to jump to that specific index in the cycle
                eventHandlers={{ click: () => setActiveIndex(index) }}
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