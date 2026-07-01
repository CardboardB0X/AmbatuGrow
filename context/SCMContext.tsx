'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Shipment, ForecastItem } from '../types/scm';

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
  const [growthMultiplier, setGrowthMultiplier] = useState(1.0);
  const [scmLogs, setScmLogs] = useState<string[]>([
    'SCM System initialized.',
    'Inbound shipment SH-9921 arrived at Indang Warehouse.',
    'LBC Express dispatched package SH-9920 from Indang Hub.'
  ]);

  const [shipments, setShipments] = useState<Shipment[]>([
    { id: 'SH-9920', carrier: 'LBC Express', origin: 'Indang Hub', destination: 'Dasma Warehouse', qty: 250, status: 'In Transit', departureTime: '2026-07-01T05:00:00Z', eta: '2026-07-01T09:00:00Z', coords: { x: 30, y: 40 } },
    { id: 'SH-9921', carrier: 'Cavite Transport', origin: 'Manila Port', destination: 'Indang Warehouse', qty: 800, status: 'Delivered', departureTime: '2026-06-30T10:00:00Z', eta: '2026-07-01T01:30:00Z', coords: { x: 80, y: 75 } },
    { id: 'SH-9922', carrier: 'J&T Cargo', origin: 'Silang Zone 3', destination: 'Indang Hub', qty: 150, status: 'Processing', departureTime: '2026-07-01T08:00:00Z', eta: '2026-07-02T14:00:00Z', coords: { x: 55, y: 25 } },
  ]);

  const [forecastItems] = useState<ForecastItem[]>([
    { sku: 'AGRI-SEED-042', name: 'Hybrid Rice Seeds', currentStock: 215, predictedDemand: 'Stable', growthPercentage: 8, recommendedStock: 250 },
    { sku: 'AGRI-FERT-089', name: 'Organic Fertilizer', currentStock: 45, predictedDemand: 'High', growthPercentage: 28, recommendedStock: 180 },
    { sku: 'AGRI-HONEY-012', name: 'Raw Honey', currentStock: 82, predictedDemand: 'Low', growthPercentage: -5, recommendedStock: 80 },
  ]);

  // Simulate real-time coordinates animation for In Transit shipments
  useEffect(() => {
    const interval = setInterval(() => {
      setShipments(prev =>
        prev.map(sh => {
          if (sh.status === 'In Transit') {
            // Animate package moving along paths slowly
            let nextX = sh.coords.x + (Math.random() * 2 - 0.8);
            let nextY = sh.coords.y + (Math.random() * 2 - 0.8);
            // Bound inside SVG box coordinates
            if (nextX < 10) nextX = 10;
            if (nextX > 90) nextX = 90;
            if (nextY < 10) nextY = 10;
            if (nextY > 90) nextY = 90;
            return { ...sh, coords: { x: parseFloat(nextX.toFixed(2)), y: parseFloat(nextY.toFixed(2)) } };
          }
          return sh;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addShipment = (shipment: Omit<Shipment, 'id' | 'coords'>) => {
    const id = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSh: Shipment = {
      ...shipment,
      id,
      coords: { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 }
    };
    setShipments(prev => [newSh, ...prev]);
    setScmLogs(prev => [`Scheduled shipment ${id} via ${shipment.carrier}.`, ...prev]);
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
