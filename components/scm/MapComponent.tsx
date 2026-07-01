'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shipment } from '../../types/scm';

interface MapComponentProps {
  shipments: Shipment[];
}

export default function MapComponent({ shipments }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map centered around Cavite coordinates
    const map = L.map(mapContainerRef.current, {
      center: [14.26, 120.90],
      zoom: 11,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    // Fix default marker icon issues in Leaflet package builds
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Add static nodes for warehouses
    const nodes = [
      { name: 'Indang Hub (CvSU)', coords: [14.1947, 120.8814] as [number, number] },
      { name: 'Dasma Warehouse', coords: [14.3294, 120.9367] as [number, number] },
      { name: 'Silang Node', coords: [14.2238, 120.9742] as [number, number] },
    ];

    nodes.forEach(node => {
      L.circleMarker(node.coords, {
        radius: 8,
        color: '#ef4444',
        fillColor: '#f87171',
        fillOpacity: 0.8,
        weight: 2
      })
        .addTo(map)
        .bindPopup(`<b>${node.name}</b>`);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update active vehicle markers in real-time when shipments state updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const greenIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    shipments.forEach(sh => {
      if (sh.status === 'In Transit' || sh.status === 'Processing') {
        const markerKey = sh.id;
        const currentMarker = markersRef.current[markerKey];

        if (currentMarker) {
          // Smoothly transition marker position coordinates
          currentMarker.setLatLng([sh.coords.lat, sh.coords.lng]);
        } else {
          // Instantiate a new marker
          const newMarker = L.marker([sh.coords.lat, sh.coords.lng], { icon: greenIcon })
            .addTo(map)
            .bindPopup(`<b>${sh.id}</b><br/>Carrier: ${sh.carrier}<br/>Qty: ${sh.qty} units`);
          markersRef.current[markerKey] = newMarker;
        }
      }
    });

    // Remove any markers for completed or deleted shipments
    Object.keys(markersRef.current).forEach(key => {
      const sh = shipments.find(s => s.id === key);
      if (!sh || (sh.status !== 'In Transit' && sh.status !== 'Processing')) {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });
  }, [shipments]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-slate-200">
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full bg-slate-100" />
    </div>
  );
}
