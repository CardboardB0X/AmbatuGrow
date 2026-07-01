'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Shipment, ForecastItem } from '../types/scm';
import { useInventory } from './InventoryContext';

interface SCMContextType {
  shipments: Shipment[];
  forecastItems: ForecastItem[];
  growthMultiplier: number;
  setGrowthMultiplier: (val: number) => void;
  addShipment: (shipment: Omit<Shipment, 'id' | 'coords'>) => void;
  updateShipmentStatus: (id: string, status: Shipment['status']) => void;
  transferStock: (sku: string, fromZone: string, toZone: string, qty: number) => boolean;
  scmLogs: string[];
}

const SCMContext = createContext<SCMContextType | undefined>(undefined);

export function SCMProvider({ children }: { children: React.ReactNode }) {
  const { items, editItem } = useInventory();
  const [growthMultiplier, setGrowthMultiplier] = useState(1.0);
  const [scmLogs, setScmLogs] = useState<string[]>([
    'SCM System initialized.',
    'Inbound shipment SH-9921 arrived at Indang Warehouse.',
    'LBC Express dispatched package SH-9920 from Indang Hub.'
  ]);

  const [shipments, setShipments] = useState<Shipment[]>([
    { id: 'SH-9920', carrier: 'LBC Express', origin: 'Indang Hub', destination: 'Dasma Warehouse', qty: 250, status: 'In Transit', departureTime: '2026-07-01T05:00:00Z', eta: '2026-07-01T09:00:00Z', coords: { lat: 14.24, lng: 120.90 } },
    { id: 'SH-9921', carrier: 'Cavite Transport', origin: 'Manila Port', destination: 'Indang Warehouse', qty: 800, status: 'Delivered', departureTime: '2026-06-30T10:00:00Z', eta: '2026-07-01T01:30:00Z', coords: { lat: 14.1947, lng: 120.8814 } },
    { id: 'SH-9922', carrier: 'J&T Cargo', origin: 'Silang Zone 3', destination: 'Indang Hub', qty: 150, status: 'Processing', departureTime: '2026-07-01T08:00:00Z', eta: '2026-07-02T14:00:00Z', coords: { lat: 14.2238, lng: 120.9742 } },
  ]);

  const [forecastItems] = useState<ForecastItem[]>([
    { sku: 'AGRI-SEED-042', name: 'Hybrid Rice Seeds', currentStock: 215, predictedDemand: 'Stable', growthPercentage: 8, recommendedStock: 250 },
    { sku: 'AGRI-FERT-089', name: 'Organic Fertilizer', currentStock: 45, predictedDemand: 'High', growthPercentage: 28, recommendedStock: 180 },
    { sku: 'AGRI-HONEY-012', name: 'Raw Honey', currentStock: 82, predictedDemand: 'Low', growthPercentage: -5, recommendedStock: 80 },
  ]);

  // Simulate real-time coordinates animation for In Transit shipments moving towards their destCoords
  useEffect(() => {
    const interval = setInterval(() => {
      setShipments(prev =>
        prev.map(sh => {
          if (sh.status === 'In Transit') {
            const targetLat = sh.destCoords?.lat ?? 14.3294;
            const targetLng = sh.destCoords?.lng ?? 120.9367;
            const step = 0.0035; // slightly faster movement for nicer simulation

            let nextLat = sh.coords.lat;
            let nextLng = sh.coords.lng;

            if (Math.abs(targetLat - nextLat) > step) {
              nextLat += (targetLat > nextLat ? 1 : -1) * step;
            } else {
              nextLat = targetLat;
            }

            if (Math.abs(targetLng - nextLng) > step) {
              nextLng += (targetLng > nextLng ? 1 : -1) * step;
            } else {
              nextLng = targetLng;
            }

            // If arrived, mark status as 'Delivered' and update destination stock
            if (nextLat === targetLat && nextLng === targetLng) {
              if (sh.sku) {
                const invItem = items.find(i => i.sku === sh.sku);
                if (invItem) {
                  editItem({
                    ...invItem,
                    stockQty: invItem.stockQty + sh.qty
                  });
                }
              }
              return { 
                ...sh, 
                status: 'Delivered',
                coords: { lat: parseFloat(nextLat.toFixed(4)), lng: parseFloat(nextLng.toFixed(4)) }
              };
            }

            return { ...sh, coords: { lat: parseFloat(nextLat.toFixed(4)), lng: parseFloat(nextLng.toFixed(4)) } };
          }
          return sh;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [items, editItem]);

  const addShipment = (shipment: Omit<Shipment, 'id' | 'coords'>) => {
    const id = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSh: Shipment = {
      ...shipment,
      id,
      coords: { lat: 14.1947, lng: 120.8814 } // Starts at Indang Hub
    };

    // Deduct stock from the origin zone
    if (shipment.sku) {
      const invItem = items.find(i => i.sku === shipment.sku);
      if (invItem) {
        editItem({
          ...invItem,
          stockQty: Math.max(0, invItem.stockQty - shipment.qty)
        });
      }
    }

    setShipments(prev => [newSh, ...prev]);
    setScmLogs(prev => [`Scheduled shipment ${id} via ${shipment.carrier} for SKU ${shipment.sku} (${shipment.qty} units).`, ...prev]);
  };

  const updateShipmentStatus = (id: string, status: Shipment['status']) => {
    setShipments(prev =>
      prev.map(sh => (sh.id === id ? { ...sh, status } : sh))
    );
    setScmLogs(prev => [`Updated shipment ${id} status to ${status}.`, ...prev]);
  };

  const transferStock = (sku: string, fromZone: string, toZone: string, qty: number): boolean => {
    setScmLogs(prev => [`Authorized transfer of ${qty} units of SKU ${sku} from ${fromZone} to ${toZone}.`, ...prev]);
    return true;
  };

  return (
    <SCMContext.Provider value={{
      shipments,
      forecastItems,
      growthMultiplier,
      setGrowthMultiplier,
      addShipment,
      updateShipmentStatus,
      transferStock,
      scmLogs
    }}>
      {children}
    </SCMContext.Provider>
  );
}

export function useSCM() {
  const context = useContext(SCMContext);
  if (!context) {
    throw new Error('useSCM must be used within an SCMProvider');
  }
  return context;
}
