'use client';

import React, { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, HeatmapLayer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};

interface GoogleMapProps {
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

export default function GoogleMapWrapper({
  center,
  zoom,
  providers,
  ngos,
  hotspots,
  showProviders,
  showNgos,
  showHeatmap,
  onMarkerClick,
}: GoogleMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['visualization']
  });

  const heatmapData = useMemo(() => {
    if (typeof google === 'undefined') return [];
    return hotspots.map(h => ({
      location: new google.maps.LatLng(h.latitude, h.longitude),
      weight: h.intensity * 10
    }));
  }, [hotspots, isLoaded]);

  if (!isLoaded) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1c]/50">
      <span className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></span>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Google Maps...</p>
    </div>
  );

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={mapOptions}
    >
      {showHeatmap && heatmapData.length > 0 && (
        <HeatmapLayer data={heatmapData} />
      )}

      {showProviders && providers.map(p => (
        <Marker
          key={`p-${p.id}`}
          position={{ lat: p.latitude, lng: p.longitude }}
          onClick={() => onMarkerClick({ ...p, markerType: 'provider' })}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }}
        />
      ))}

      {showNgos && ngos.map(n => (
        <Marker
          key={`n-${n.id}`}
          position={{ lat: n.latitude, lng: n.longitude }}
          onClick={() => onMarkerClick({ ...n, markerType: 'ngo' })}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }}
        />
      ))}
    </GoogleMap>
  );
}
