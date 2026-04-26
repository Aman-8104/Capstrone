'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet - ensure it only runs on client
if (typeof window !== 'undefined') {
  const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  L.Marker.prototype.options.icon = DefaultIcon;
}

// Custom icons using SVG
const createCustomIcon = (color: string, emoji: string) => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    html: `<div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 15px rgba(0,0,0,0.3); font-size: 18px;">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Heatmap component for Leaflet
function HeatmapLayer({ data }: { data: any[] }) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let isMounted = true;

    const loadHeat = async () => {
      try {
        // @ts-ignore
        await import('leaflet.heat');
        
        if (!isMounted) return;

        if (data.length > 0 && (L as any).heatLayer) {
          // Remove old layer if exists
          if (layerRef.current) {
            map.removeLayer(layerRef.current);
          }

          const heatPoints = data.map(d => [d.lat, d.lng, d.weight]);
          layerRef.current = (L as any).heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
              0.4: 'blue',
              0.6: 'cyan',
              0.7: 'lime',
              0.8: 'yellow',
              1.0: 'red'
            }
          }).addTo(map);
        }
      } catch (err) {
        console.error('Failed to load heatmap layer:', err);
      }
    };

    loadHeat();

    return () => {
      isMounted = false;
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, data]);

  return null;
}

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  providers: any[];
  ngos: any[];
  hotspots: any[];
  showProviders: boolean;
  showNgos: boolean;
  showHeatmap: boolean;
  onMarkerClick: (marker: any) => void;
}

export default function Map({
  center,
  zoom,
  providers,
  ngos,
  hotspots,
  showProviders,
  showNgos,
  showHeatmap,
  onMarkerClick,
}: MapProps) {
  // Use useMemo or check if window is defined for icons
  const providerIcon = createCustomIcon('#3b82f6', '🍽️');
  const ngoIcon = createCustomIcon('#10b981', '🏢');

  const heatmapData = hotspots.map(h => ({
    lat: h.latitude,
    lng: h.longitude,
    weight: h.intensity * 10
  }));

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ width: '100%', height: '100%', background: '#f8fafc' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {showProviders && providers.map(p => (
        <Marker
          key={`p-${p.id}`}
          position={[p.latitude, p.longitude]}
          icon={providerIcon || undefined}
          eventHandlers={{
            click: () => onMarkerClick({ ...p, markerType: 'provider' }),
          }}
        >
          <Popup>
            <div className="text-slate-900 p-1">
              <strong className="block text-sm">{p.name}</strong>
              <span className="text-xs text-slate-500">{p.details?.address || 'Mumbai Region'}</span>
            </div>
          </Popup>
        </Marker>
      ))}

      {showNgos && ngos.map(n => (
        <Marker
          key={`n-${n.id}`}
          position={[n.latitude, n.longitude]}
          icon={ngoIcon || undefined}
          eventHandlers={{
            click: () => onMarkerClick({ ...n, markerType: 'ngo' }),
          }}
        >
          <Popup>
            <div className="text-slate-900 p-1">
              <strong className="block text-sm">{n.name}</strong>
              <span className="text-xs text-slate-500">{n.details?.address || 'Mumbai Region'}</span>
            </div>
          </Popup>
        </Marker>
      ))}

      {showHeatmap && heatmapData.length > 0 && (
        <HeatmapLayer data={heatmapData} />
      )}
    </MapContainer>
  );
}
