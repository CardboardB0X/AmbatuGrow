'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shipment } from '../../types/scm';

interface MapComponentProps {
  shipments: Shipment[];
  onSelectDestination?: (lat: number, lng: number) => void;
}

export default function MapComponent({ shipments, onSelectDestination }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylinesRef = useRef<{ [key: string]: L.Polyline }>({});
  const customPinRef = useRef<L.Marker | null>(null);

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
        color: '#2D6A24',
        fillColor: '#aee2a4',
        fillOpacity: 0.8,
        weight: 2
      })
        .addTo(map)
        .bindPopup(`<b>${node.name}</b>`);
    });

    // Draggable Custom Pin Setup
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const customPin = L.marker([0, 0], {
      icon: redIcon,
      draggable: true
    });

    customPinRef.current = customPin;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      customPin.setLatLng(e.latlng).addTo(map).bindPopup('<b>Custom Destination</b><br/>Ready for carrier dispatch.').openPopup();
      if (onSelectDestination) {
        onSelectDestination(parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4)));
      }
    });

    customPin.on('dragend', () => {
      const latlng = customPin.getLatLng();
      if (onSelectDestination) {
        onSelectDestination(parseFloat(latlng.lat.toFixed(4)), parseFloat(latlng.lng.toFixed(4)));
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSelectDestination]);

  // Update active vehicle markers and draw polyline paths
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
      const markerKey = sh.id;
      const currentMarker = markersRef.current[markerKey];

      if (sh.status === 'In Transit' || sh.status === 'Processing') {
        // 1. Draw/Update Marker position
        if (currentMarker) {
          currentMarker.setLatLng([sh.coords.lat, sh.coords.lng]);
        } else {
          const newMarker = L.marker([sh.coords.lat, sh.coords.lng], { icon: greenIcon })
            .addTo(map)
            .bindPopup(`<b>${sh.id}</b><br/>Carrier: ${sh.carrier}<br/>SKU: ${sh.sku || 'N/A'}<br/>Qty: ${sh.qty} units`);
          markersRef.current[markerKey] = newMarker;
        }

        // 2. Draw/Update Polyline connection route from Indang Hub [14.1947, 120.8814]
        if (sh.status === 'In Transit') {
          const polylineKey = `poly-${sh.id}`;
          const startCoords: [number, number] = [14.1947, 120.8814];
          const endCoords: [number, number] = [sh.destCoords?.lat ?? 14.3294, sh.destCoords?.lng ?? 120.9367];
          
          const existingPolyline = polylinesRef.current[polylineKey];
          if (existingPolyline) {
            existingPolyline.setLatLngs([startCoords, endCoords]);
          } else {
            const polyline = L.polyline([startCoords, endCoords], {
              color: '#2D6A24',
              weight: 3,
              dashArray: '5, 10',
              opacity: 0.6
            }).addTo(map);
            polylinesRef.current[polylineKey] = polyline;
          }
        }
      }
    });

    // Remove any markers and polylines for completed/deleted shipments
    Object.keys(markersRef.current).forEach(key => {
      const sh = shipments.find(s => s.id === key);
      if (!sh || (sh.status !== 'In Transit' && sh.status !== 'Processing')) {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });

    Object.keys(polylinesRef.current).forEach(key => {
      const shId = key.replace('poly-', '');
      const sh = shipments.find(s => s.id === shId);
      if (!sh || sh.status !== 'In Transit') {
        polylinesRef.current[key].remove();
        delete polylinesRef.current[key];
      }
    });
  }, [shipments]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full bg-slate-100" />
    </div>
  );
}
