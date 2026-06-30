export interface InventoryItem {
  sku: string;
  name: string;
  description: string;
  category: string;
  stockQty: number;
  uom: string;
  status: 'Active' | 'Obsolete';
  minQty: number;
  maxQty: number;
  zone: string; // e.g. "Warehouse A - Zone 1"
}

export interface Transaction {
  id: string;
  timestamp: string; // ISO string
  sku: string;
  type: 'Stock-In' | 'Stock-Out';
  qty: number;
  operator: string;
  expirationDate?: string; // ISO string or YYYY-MM-DD
}

export interface WarehouseZone {
  name: string;
  maxCapacity: number;
  currentOccupancy: number;
}

export interface SystemLog {
  id: string;
  message: string;
  timestamp: string; // ISO string
  sku?: string;
  operator: string;
}

export type SubNavigationTab = 'Tracking' | 'Transactions' | 'Locations' | 'Reports & Alerts';
