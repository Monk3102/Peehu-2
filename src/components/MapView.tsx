import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AnyRecord, University, TabType, Opening, Supervisor } from '../types';
import { Config } from '../config';
import { getUniversity } from '../utils/helpers';

interface MapViewProps {
  records: AnyRecord[];
  activeTab: TabType;
  uniById: Map<string, University>;
  selectedRecord: AnyRecord | null;
  onSelectRecord: (record: AnyRecord) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  records,
  activeTab,
  uniById,
  selectedRecord,
  onSelectRecord,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const overlayTileRef = useRef<L.TileLayer | null>(null);
  const markerByIdRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const selectedMarkerRef = useRef<L.CircleMarker | null>(null);

  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');

  // Helper to switch map layers
  const setLayer = (style: 'street' | 'satellite') => {
    const map = mapRef.current;
    if (!map) return;

    if (baseTileRef.current) {
      map.removeLayer(baseTileRef.current);
      baseTileRef.current = null;
    }
    if (overlayTileRef.current) {
      map.removeLayer(overlayTileRef.current);
      overlayTileRef.current = null;
    }

    const cfg = Config.mapLayers[style];
    if (cfg) {
      baseTileRef.current = L.tileLayer(cfg.base, {
        maxZoom: 19,
        attribution: cfg.attr,
      }).addTo(map);

      if ('overlay' in cfg && cfg.overlay) {
        overlayTileRef.current = L.tileLayer(cfg.overlay, {
          maxZoom: 19,
        }).addTo(map);
      }
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [50.8, 11.5],
      zoom: 4,
      minZoom: 3,
      maxZoom: 18,
      preferCanvas: true,
    });
    mapRef.current = map;

    markerLayerRef.current = L.layerGroup().addTo(map);
    setLayer(mapStyle);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map style
  useEffect(() => {
    setLayer(mapStyle);
  }, [mapStyle]);

  // Handle markers
  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    markerLayer.clearLayers();
    markerByIdRef.current.clear();
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current = null;
    }

    const fillColor =
      Config.markerColors[activeTab as keyof typeof Config.markerColors] || '#2563eb';

    interface Group {
      lat: number;
      lng: number;
      uni: University;
      items: AnyRecord[];
    }
    const groups: Record<string, Group> = {};

    records.forEach((r) => {
      const uni = getUniversity(r, uniById);
      if (!uni || uni.lat == null || uni.lng == null) return;
      const key = `${uni.lat.toFixed(4)},${uni.lng.toFixed(4)}`;
      if (!groups[key]) {
        groups[key] = { lat: uni.lat, lng: uni.lng, uni, items: [] };
      }
      groups[key].items.push(r);
    });

    Object.values(groups).forEach((g) => {
      const marker = L.circleMarker([g.lat, g.lng], {
        radius: Math.min(16, 7 + Math.log2(g.items.length + 1) * 3),
        fillColor,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      const items = g.items;

      marker.bindPopup(
        () => {
          const nameOf = (r: AnyRecord) =>
            (r as Opening).title || (r as Supervisor).name || '';
          const sorted = items
            .slice()
            .sort((a, b) => nameOf(a).localeCompare(nameOf(b)));

          const el = document.createElement('div');
          el.style.cssText = 'font-size:12px;line-height:1.4';

          const titleDiv = document.createElement('strong');
          titleDiv.style.cssText = 'font-size:13px;color:#0f172a;display:block;';
          titleDiv.textContent = g.uni.name;
          el.appendChild(titleDiv);

          const locDiv = document.createElement('div');
          locDiv.style.cssText = 'color:#64748b;font-size:11px;margin-top:2px;';
          locDiv.textContent = `${g.uni.city ? g.uni.city + ', ' : ''}${g.uni.country}`;
          el.appendChild(locDiv);

          const countDiv = document.createElement('div');
          countDiv.style.cssText = 'margin-top:6px;font-weight:600;color:#1d4ed8';
          countDiv.textContent = `${items.length} ${activeTab.slice(0, -1)}${
            items.length === 1 ? '' : 's'
          } here${items.length > 1 ? ' · pick one:' : ''}`;
          el.appendChild(countDiv);

          if (!(activeTab === 'universities' && items.length === 1)) {
            const list = document.createElement('div');
            list.className = 'pin-list';
            sorted.forEach((item) => {
              const b = document.createElement('button');
              b.type = 'button';
              b.className = 'pin-item';
              b.textContent = nameOf(item);
              b.addEventListener('click', () => {
                onSelectRecord(item);
              });
              list.appendChild(b);
            });
            el.appendChild(list);
          }

          return el;
        },
        { minWidth: 210, maxWidth: 300 }
      );

      marker.on('click', () => {
        if (items.length === 1) {
          onSelectRecord(items[0]);
        }
      });

      items.forEach((item) => {
        markerByIdRef.current.set(item.id, marker);
      });

      marker.addTo(markerLayer);
    });
  }, [records, activeTab, uniById]);

  // Focus marker when selectedRecord changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedRecord) return;

    const uni = getUniversity(selectedRecord, uniById);
    if (!uni || uni.lat == null || uni.lng == null) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setStyle({ color: '#ffffff', weight: 2 });
      selectedMarkerRef.current = null;
    }

    const marker = markerByIdRef.current.get(selectedRecord.id);
    if (marker) {
      marker.setStyle({ color: '#facc15', weight: 4 });
      marker.bringToFront();
      selectedMarkerRef.current = marker;
    }

    map.flyTo([uni.lat, uni.lng], Math.max(map.getZoom(), 6), { duration: 0.6 });
  }, [selectedRecord, uniById]);

  return (
    <div id="map" ref={mapContainerRef}>
      <div className="map-controls-overlay">
        <div className="map-style-switch">
          <button
            type="button"
            className={`map-style-btn ${mapStyle === 'street' ? 'active' : ''}`}
            onClick={() => setMapStyle('street')}
          >
            Street Map
          </button>
          <button
            type="button"
            className={`map-style-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapStyle('satellite')}
          >
            Satellite
          </button>
        </div>
      </div>
    </div>
  );
};
