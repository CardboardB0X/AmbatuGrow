'use client';

import React, { createContext, useContext, useState } from 'react';
import { SalesOrder, CustomerProfile, WarrantyClaim } from '../types/sales';

interface SalesContextType {
  salesOrders: SalesOrder[];
  customers: CustomerProfile[];
  warrantyClaims: WarrantyClaim[];
  addSalesOrder: (order: Omit<SalesOrder, 'id' | 'dateRaised' | 'subtotal' | 'tax' | 'total'>) => void;
  updateOrderStatus: (id: string, status: SalesOrder['status']) => void;
  addCustomer: (cust: Omit<CustomerProfile, 'id' | 'totalSpend' | 'purchaseHistory'>) => void;
  addWarrantyClaim: (claim: Omit<WarrantyClaim, 'id' | 'claimDate' | 'status'>) => void;
  updateClaimStatus: (id: string, status: WarrantyClaim['status']) => void;
  salesTarget: number;
  totalRevenue: number;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const salesTarget = 150000; // PHP target

  const [customers, setCustomers] = useState<CustomerProfile[]>([
    { id: 'CUST-001', name: 'Juan Dela Cruz', email: 'juan@gmail.com', phone: '0917-123-4567', segment: 'VIP', totalSpend: 15400, purchaseHistory: ['SO-10920'], notes: 'Prefers organic crop feeds.' },
    { id: 'CUST-002', name: 'Maria Santos', email: 'maria@outlook.com', phone: '0918-765-4321', segment: 'Regular', totalSpend: 3250, purchaseHistory: ['SO-10921'], notes: 'Consistently orders fertilizers.' },
    { id: 'CUST-003', name: 'Pedro Penduko', email: 'pedro@yahoo.com', phone: '0922-888-9999', segment: 'Lead', totalSpend: 0, purchaseHistory: [], notes: 'Inquired about Bulk honey supplies.' },
  ]);

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([
    { id: 'SO-10920', customerName: 'Juan Dela Cruz', email: 'juan@gmail.com', items: [{ sku: 'AGRI-SEED-042', name: 'Hybrid Rice Seeds', qty: 2, price: 1800 }], subtotal: 3600, discount: 0, tax: 432, total: 4032, status: 'Fulfilled', dateRaised: '2026-07-01T07:45:00Z' },
    { id: 'SO-10921', customerName: 'Maria Santos', email: 'maria@outlook.com', items: [{ sku: 'AGRI-FERT-089', name: 'Organic Fertilizer', qty: 5, price: 650 }], subtotal: 3250, discount: 0, tax: 390, total: 3640, status: 'Fulfilled', dateRaised: '2026-07-01T07:20:00Z' },
    { id: 'SO-10922', customerName: 'Pedro Penduko', email: 'pedro@yahoo.com', items: [{ sku: 'AGRI-HONEY-012', name: 'Raw Honey', qty: 12, price: 250 }], subtotal: 3000, discount: 300, tax: 324, total: 3024, status: 'Pending L1', dateRaised: '2026-07-01T08:10:00Z' },
  ]);

  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>([
    { id: 'WRN-4418', orderId: 'SO-10920', customerName: 'Juan Dela Cruz', sku: 'AGRI-SEED-042', claimDate: '2026-07-01T08:00:00Z', status: 'Received', notes: 'Packaging was torn upon delivery.' },
  ]);

  // Calculate actual revenue from fulfilled/delivered orders
  const totalRevenue = salesOrders
    .filter(o => o.status === 'Delivered' || o.status === 'Fulfilled' || o.status === 'Processed')
    .reduce((sum, o) => sum + o.total, 0);

  const addSalesOrder = (order: Omit<SalesOrder, 'id' | 'dateRaised' | 'subtotal' | 'tax' | 'total'>) => {
    const id = `SO-${Math.floor(10000 + Math.random() * 90000)}`;
    const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const tax = parseFloat((subtotal * 0.12).toFixed(2)); // 12% VAT
    const total = subtotal - order.discount + tax;

    const newOrder: SalesOrder = {
      ...order,
      id,
      subtotal,
      tax,
      total,
      dateRaised: new Date().toISOString(),
    };

    setSalesOrders(prev => [newOrder, ...prev]);

    // Update customer spend metrics
    setCustomers(prev =>
      prev.map(c => {
        if (c.email === order.email) {
          return {
            ...c,
            totalSpend: c.totalSpend + total,
            purchaseHistory: [...c.purchaseHistory, id],
            segment: c.totalSpend + total > 15000 ? 'VIP' : 'Regular',
          };
        }
        return c;
      })
    );
  };

  const updateOrderStatus = (id: string, status: SalesOrder['status']) => {
    setSalesOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
  };

  const addCustomer = (cust: Omit<CustomerProfile, 'id' | 'totalSpend' | 'purchaseHistory'>) => {
    const id = `CUST-${Math.floor(100 + Math.random() * 900)}`;
    const newCust: CustomerProfile = {
      ...cust,
      id,
      totalSpend: 0,
      purchaseHistory: [],
    };
    setCustomers(prev => [...prev, newCust]);
  };

  const addWarrantyClaim = (claim: Omit<WarrantyClaim, 'id' | 'claimDate' | 'status'>) => {
    const id = `WRN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim: WarrantyClaim = {
      ...claim,
      id,
      claimDate: new Date().toISOString(),
      status: 'Received',
    };
    setWarrantyClaims(prev => [newClaim, ...prev]);
  };

  const updateClaimStatus = (id: string, status: WarrantyClaim['status']) => {
    setWarrantyClaims(prev =>
      prev.map(w => (w.id === id ? { ...w, status } : w))
    );
  };

  return (
    <SalesContext.Provider value={{
      salesOrders,
      customers,
      warrantyClaims,
      addSalesOrder,
      updateOrderStatus,
      addCustomer,
      addWarrantyClaim,
      updateClaimStatus,
      salesTarget,
      totalRevenue
    }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}
