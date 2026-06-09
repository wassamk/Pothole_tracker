// src/components/map/HeatmapLayer.tsx
// Custom heatmap layer built with Leaflet CircleMarkers (no external heat plugin needed)

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L, { type LayerGroup, type LatLngTuple } from 'leaflet';
import type { HeatmapPoint } from '@/types';

interface Props {
  points: HeatmapPoint[];
}

const pointColor = (p: HeatmapPoint): string => {
  if (p.status === 'Resolved') return '#10b981';
  if (p.status === 'In Progress') return '#f59e0b';
  if (p.intensity >= 41) return '#ef4444';
  if (p.intensity >= 21) return '#f97316';
  return '#3b82f6';
};

const HeatmapLayer = ({ points }: Props) => {
  const map = useMap();
  const layerRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    // Clear previous
    if (layerRef.current) map.removeLayer(layerRef.current);
    if (!points.length) return;

    const group = L.layerGroup();

    points.forEach((pt) => {
      const color = pointColor(pt);
      const radius = Math.max(15, pt.intensity * 1.5);
      const center: LatLngTuple = [pt.lat, pt.lng];

      // Outer glow ring
      L.circleMarker(center, {
        radius,
        color: 'transparent',
        fillColor: color,
        fillOpacity: 0.15,
      }).addTo(group);

      // Inner dot
      L.circleMarker(center, {
        radius: Math.max(5, radius / 3),
        color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: 1.5,
      }).addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;

    const bounds: LatLngTuple[] = points.map((p) => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [points, map]);

  return null;
};

export default HeatmapLayer;
