/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { InventoryItem, Transaction, WarehouseZone, SystemLog, SubNavigationTab } from '../types/inventory';

interface InventoryContextType {
  items: InventoryItem[];
  transactions: Transaction[];
  logs: SystemLog[];
  activeTab: SubNavigationTab;
  setActiveTab: (tab: SubNavigationTab) => void;
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedZoneFilter: string | null;
  setSelectedZoneFilter: (zone: string | null) => void;
  
  // Selection
  selectedSkus: string[];
  toggleSelectSku: (sku: string) => void;
  toggleSelectAll: (visibleSkus: string[]) => void;
  clearSelection: () => void;
  
  // Actions
  addItem: (item: Omit<InventoryItem, 'stockQty'> & { stockQty: number }) => void;
  editItem: (item: InventoryItem) => void;
  deleteItem: (sku: string, zone: string) => void;
  bulkDelete: () => void;
  bulkStatusChange: (status: 'Active' | 'Obsolete') => void;
  transferItems: (sku: string, srcZone: string, destZone: string, qty: number) => boolean;
  createStockIn: (sku: string, qty: number, operator: string, zone?: string) => void;
  generateRequisitionOrder: (items: { sku: string; qty: number }[]) => void;
  logActivity: (message: string, sku?: string) => void;
  
  // Drawer & Modals
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  drawerMode: 'add' | 'edit';
  setDrawerMode: (mode: 'add' | 'edit') => void;
  editingItem: InventoryItem | null;
  setEditingItem: (item: InventoryItem | null) => void;
  
  isTransferOpen: boolean;
  setIsTransferOpen: (open: boolean) => void;
  transferSku: string | null;
  setTransferSku: (sku: string | null) => void;
  
  // Sidebar & Overlay States
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isSupportOpen: boolean;
  setIsSupportOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isQuickMenuOpen: boolean;
  setIsQuickMenuOpen: (open: boolean) => void;
  
  // Zones Info
  zones: WarehouseZone[];

  // Authentication & View states
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userRole: 'System Administrator' | 'Inventory Officer' | 'Procurement Officer';
  setUserRole: (role: 'System Administrator' | 'Inventory Officer' | 'Procurement Officer') => void;
  currentView: 'launchpad' | 'inventory' | 'ecommerce' | 'supply_chain' | 'sales' | 'helpdesk' | 'procurement';
  setCurrentView: (view: 'launchpad' | 'inventory' | 'ecommerce' | 'supply_chain' | 'sales' | 'helpdesk' | 'procurement') => void;
  moduleTab: string;
  setModuleTab: (tab: string) => void;
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialItems: InventoryItem[] = [
  {
    sku: 'AGRI-PROD-001',
    name: 'Honey',
    description: '1 Liter Bottle',
    category: 'Agriculture',
    stockQty: 15,
    uom: 'Units',
    status: 'Active',
    minQty: 20,
    maxQty: 100,
    zone: 'Warehouse A - Zone 2',
  },
  {
    sku: 'AGRI-SEED-042',
    name: 'Rambutan Seeds',
    description: '25kg Sacks',
    category: 'Agriculture',
    stockQty: 120,
    uom: 'Sacks',
    status: 'Active',
    minQty: 50,
    maxQty: 200,
    zone: 'Warehouse A - Zone 3',
  },
  {
    sku: 'COMP-MNT-012',
    name: 'Dell 24" Monitor',
    description: 'Full HD IPS Display',
    category: 'Equipment',
    stockQty: 0,
    uom: 'Units',
    status: 'Obsolete',
    minQty: 5,
    maxQty: 20,
    zone: 'Warehouse B - Zone 1',
  },
  {
    sku: 'AGRI-FERT-009',
    name: 'Organic Fertilizer',
    description: 'Nitrogen-rich 50lb',
    category: 'Agriculture',
    stockQty: 45,
    uom: 'Bags',
    status: 'Active',
    minQty: 10,
    maxQty: 150,
    zone: 'Warehouse A - Zone 1',
  },
  {
    sku: 'COMP-PRN-005',
    name: 'HP LaserJet Pro',
    description: 'Monochrome Printer',
    category: 'Equipment',
    stockQty: 8,
    uom: 'Units',
    status: 'Active',
    minQty: 10,
    maxQty: 30,
    zone: 'Warehouse B - Zone 3',
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'TX-1001',
    timestamp: '2026-06-29T14:32:00Z',
    sku: 'AGRI-PROD-001',
    type: 'Stock-In',
    qty: 15,
    operator: 'Inventory Officer',
    expirationDate: '2026-07-12', // Expiring in 12 days from June 30
  },
  {
    id: 'TX-1002',
    timestamp: '2026-06-29T15:10:00Z',
    sku: 'AGRI-SEED-042',
    type: 'Stock-In',
    qty: 120,
    operator: 'Inventory Officer',
    expirationDate: '2026-09-30',
  },
  {
    id: 'TX-1003',
    timestamp: '2026-06-29T16:45:00Z',
    sku: 'COMP-PRN-005',
    type: 'Stock-In',
    qty: 8,
    operator: 'Inventory Officer',
  },
  {
    id: 'TX-1004',
    timestamp: '2026-06-30T06:15:00Z',
    sku: 'AGRI-FERT-009',
    type: 'Stock-In',
    qty: 50,
    operator: 'Inventory Officer',
    expirationDate: '2026-07-10', // Expiring in 10 days from June 30
  },
  {
    id: 'TX-1005',
    timestamp: '2026-06-30T07:20:00Z',
    sku: 'AGRI-FERT-009',
    type: 'Stock-Out',
    qty: 5,
    operator: 'Inventory Officer',
  },
];

const initialLogs: SystemLog[] = [
  {
    id: 'LOG-001',
    message: 'Stock-In +5 COMP-LPT-001 by Admin',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    sku: 'COMP-LPT-001',
    operator: 'Admin',
  },
  {
    id: 'LOG-002',
    message: 'Stock-Out -10 AGRI-SEED-042 by Warehouse Staff',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    sku: 'AGRI-SEED-042',
    operator: 'Warehouse Staff',
  },
  {
    id: 'LOG-003',
    message: 'Updated Details COMP-MNT-012 by IT Dept',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    sku: 'COMP-MNT-012',
    operator: 'IT Dept',
  },
  {
    id: 'LOG-004',
    message: 'Stock-In +15 AGRI-PROD-001 by Inventory Officer',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    sku: 'AGRI-PROD-001',
    operator: 'Inventory Officer',
  },
];

const initialZones: WarehouseZone[] = [
  { name: 'Warehouse A - Zone 1', maxCapacity: 100, currentOccupancy: 45 },
  { name: 'Warehouse A - Zone 2', maxCapacity: 150, currentOccupancy: 15 },
  { name: 'Warehouse A - Zone 3', maxCapacity: 200, currentOccupancy: 120 },
  { name: 'Warehouse B - Zone 1', maxCapacity: 80, currentOccupancy: 0 },
  { name: 'Warehouse B - Zone 3', maxCapacity: 100, currentOccupancy: 8 },
];

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [logs, setLogs] = useState<SystemLog[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<SubNavigationTab>('Tracking');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string | null>(null);
  
  // Selection
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  
  // Drawer & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferSku, setTransferSku] = useState<string | null>(null);

  // Sidebar & Overlay States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  // Authentication & View states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'System Administrator' | 'Inventory Officer' | 'Procurement Officer'>('System Administrator');
  const [currentView, setCurrentView] = useState<'launchpad' | 'inventory' | 'ecommerce' | 'supply_chain' | 'sales' | 'helpdesk' | 'procurement'>('launchpad');
  const [moduleTab, setModuleTab] = useState<string>('default');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const updateAuth = (auth: boolean) => {
    setIsAuthenticated(auth);
    localStorage.setItem('erp_auth', String(auth));
    if (!auth) {
      localStorage.removeItem('erp_auth');
      localStorage.removeItem('erp_view');
    }
  };

  const updateRole = (role: 'System Administrator' | 'Inventory Officer' | 'Procurement Officer') => {
    setUserRole(role);
    localStorage.setItem('erp_role', role);
  };

  const updateView = (view: 'launchpad' | 'inventory' | 'ecommerce' | 'supply_chain' | 'sales' | 'helpdesk' | 'procurement') => {
    setCurrentView(view);
    localStorage.setItem('erp_view', view);
  };

  useEffect(() => {
    const savedItems = localStorage.getItem('erp_items');
    const savedTransactions = localStorage.getItem('erp_transactions');
    const savedLogs = localStorage.getItem('erp_logs');
    
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    const savedAuth = localStorage.getItem('erp_auth');
    const savedRole = localStorage.getItem('erp_role');
    const savedView = localStorage.getItem('erp_view');
    
    if (savedAuth === 'true') setIsAuthenticated(true);
    if (savedRole) setUserRole(savedRole as 'System Administrator' | 'Inventory Officer' | 'Procurement Officer');
    if (savedView) setCurrentView(savedView as 'launchpad' | 'inventory');
  }, []);

  // Save to local storage
  const saveState = (newItems: InventoryItem[], newTx?: Transaction[], newLogs?: SystemLog[]) => {
    setItems(newItems);
    localStorage.setItem('erp_items', JSON.stringify(newItems));
    
    if (newTx) {
      setTransactions(newTx);
      localStorage.setItem('erp_transactions', JSON.stringify(newTx));
    }
    if (newLogs) {
      setLogs(newLogs);
      localStorage.setItem('erp_logs', JSON.stringify(newLogs));
    }
  };

  // Toggle selection
  const toggleSelectSku = (sku: string) => {
    setSelectedSkus(prev => 
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
    );
  };

  const toggleSelectAll = (visibleSkus: string[]) => {
    if (selectedSkus.length === visibleSkus.length) {
      setSelectedSkus([]);
    } else {
      setSelectedSkus(visibleSkus);
    }
  };

  const clearSelection = () => setSelectedSkus([]);

  // Calculate dynamic warehouse occupancies
  const zones: WarehouseZone[] = initialZones.map(zone => {
    const occupancy = items
      .filter(item => item.zone === zone.name)
      .reduce((sum, item) => sum + item.stockQty, 0);
    return {
      ...zone,
      currentOccupancy: occupancy,
    };
  });

  // CRUD Operations
  const addItem = (newItem: Omit<InventoryItem, 'stockQty'> & { stockQty: number }) => {
    const itemToAdd: InventoryItem = {
      ...newItem,
      stockQty: newItem.stockQty || 0,
    };
    
    const updatedItems = [...items, itemToAdd];
    
    // Log transaction
    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sku: newItem.sku,
      type: 'Stock-In',
      qty: newItem.stockQty,
      operator: 'Inventory Officer',
    };
    
    // Log system activity
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}`,
      message: `[NEW] Added ${newItem.name} (${newItem.sku}) to ${newItem.zone} with initial stock +${newItem.stockQty}`,
      timestamp: new Date().toISOString(),
      sku: newItem.sku,
      operator: 'Inventory Officer',
    };

    saveState(updatedItems, [newTx, ...transactions], [newLog, ...logs]);
  };

  const editItem = (updatedItem: InventoryItem) => {
    // Find previous item to log differences
    const prevItem = items.find(i => i.sku === updatedItem.sku && i.zone === updatedItem.zone);
    const updatedItems = items.map(item => 
      (item.sku === updatedItem.sku && item.zone === updatedItem.zone) ? updatedItem : item
    );
    
    const newTransactions = [...transactions];
    const newLogs = [...logs];
    
    if (prevItem && prevItem.stockQty !== updatedItem.stockQty) {
      const diff = updatedItem.stockQty - prevItem.stockQty;
      const txType = diff > 0 ? 'Stock-In' : 'Stock-Out';
      
      const newTx: Transaction = {
        id: `TX-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sku: updatedItem.sku,
        type: txType,
        qty: Math.abs(diff),
        operator: 'Inventory Officer',
      };
      newTransactions.unshift(newTx);
      
      const newLog: SystemLog = {
        id: `LOG-${Date.now()}`,
        message: `${txType} ${diff > 0 ? '+' : '-'}${Math.abs(diff)} ${updatedItem.sku} by Inventory Officer`,
        timestamp: new Date().toISOString(),
        sku: updatedItem.sku,
        operator: 'Inventory Officer',
      };
      newLogs.unshift(newLog);
    } else {
      // General detail update log
      const newLog: SystemLog = {
        id: `LOG-${Date.now()}`,
        message: `Updated details for ${updatedItem.sku} by Inventory Officer`,
        timestamp: new Date().toISOString(),
        sku: updatedItem.sku,
        operator: 'Inventory Officer',
      };
      newLogs.unshift(newLog);
    }
    
    saveState(updatedItems, newTransactions, newLogs);
  };

  const deleteItem = (sku: string, zone: string) => {
    const target = items.find(i => i.sku === sku && i.zone === zone);
    const updatedItems = items.filter(item => !(item.sku === sku && item.zone === zone));
    
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}`,
      message: `[DELETE] Removed ${target?.name || sku} from ${zone} by Inventory Officer`,
      timestamp: new Date().toISOString(),
      sku: sku,
      operator: 'Inventory Officer',
    };
    
    saveState(updatedItems, transactions, [newLog, ...logs]);
    setSelectedSkus(prev => prev.filter(s => s !== sku));
  };

  const bulkDelete = () => {
    if (selectedSkus.length === 0) return;
    
    const updatedItems = items.filter(item => !selectedSkus.includes(item.sku));
    
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}`,
      message: `[BULK DELETE] Removed ${selectedSkus.length} items: [${selectedSkus.join(', ')}] by Inventory Officer`,
      timestamp: new Date().toISOString(),
      operator: 'Inventory Officer',
    };
    
    saveState(updatedItems, transactions, [newLog, ...logs]);
    setSelectedSkus([]);
  };

  const bulkStatusChange = (status: 'Active' | 'Obsolete') => {
    if (selectedSkus.length === 0) return;
    
    const updatedItems = items.map(item => 
      selectedSkus.includes(item.sku) ? { ...item, status } : item
    );
    
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}`,
      message: `[BULK UPDATE] Status of ${selectedSkus.length} items set to ${status} by Inventory Officer`,
      timestamp: new Date().toISOString(),
      operator: 'Inventory Officer',
    };
    
    saveState(updatedItems, transactions, [newLog, ...logs]);
    setSelectedSkus([]);
  };

  // Inter-Warehouse Transfer
  const transferItems = (sku: string, srcZone: string, destZone: string, qty: number): boolean => {
    const srcItemIndex = items.findIndex(item => item.sku === sku && item.zone === srcZone);
    if (srcItemIndex === -1) return false;
    
    const srcItem = items[srcItemIndex];
    if (srcItem.stockQty < qty) return false; // Not enough stock
    
    const updatedItems = [...items];
    
    // Deduct from source
    const updatedSrcItem = {
      ...srcItem,
      stockQty: srcItem.stockQty - qty,
    };
    
    if (updatedSrcItem.stockQty === 0 && updatedSrcItem.status === 'Obsolete') {
      // Remove item if empty and obsolete, or keep it at 0
      updatedItems[srcItemIndex] = updatedSrcItem;
    } else {
      updatedItems[srcItemIndex] = updatedSrcItem;
    }
    
    // Add to destination
    const destItemIndex = items.findIndex(item => item.sku === sku && item.zone === destZone);
    if (destItemIndex !== -1) {
      // Destination item already exists, merge
      updatedItems[destItemIndex] = {
        ...updatedItems[destItemIndex],
        stockQty: updatedItems[destItemIndex].stockQty + qty,
      };
    } else {
      // Create new allocation in dest zone
      const newItemAllocation: InventoryItem = {
        ...srcItem,
        stockQty: qty,
        zone: destZone,
      };
      updatedItems.push(newItemAllocation);
    }
    
    // Clean up source item if stock reached 0 and it was empty (optional, let's keep it with 0 stock so it displays in reports as low-stock)
    
    // Record transactions
    const srcTx: Transaction = {
      id: `TX-OUT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sku: sku,
      type: 'Stock-Out',
      qty: qty,
      operator: 'Inventory Officer',
    };
    
    const destTx: Transaction = {
      id: `TX-IN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sku: sku,
      type: 'Stock-In',
      qty: qty,
      operator: 'Inventory Officer',
    };
    
    // Create activity logs
    const newLog: SystemLog = {
      id: `LOG-XFER-${Date.now()}`,
      message: `Transferred ${qty} ${srcItem.uom} of ${srcItem.name} (${sku}) from ${srcZone} to ${destZone}`,
      timestamp: new Date().toISOString(),
      sku: sku,
      operator: 'Inventory Officer',
    };
    
    saveState(updatedItems, [srcTx, destTx, ...transactions], [newLog, ...logs]);
    return true;
  };

  const createStockIn = (sku: string, qty: number, operator: string, zone?: string) => {
    const targetZone = zone || 'Warehouse A - Zone 1';
    let prevItem = items.find(i => i.sku === sku && i.zone === targetZone);
    if (!prevItem) {
      prevItem = items.find(i => i.sku === sku);
    }
    
    let updatedItems = [...items];
    if (prevItem) {
      updatedItems = items.map(item => 
        (item.sku === sku && item.zone === prevItem.zone) 
          ? { ...item, stockQty: item.stockQty + qty }
          : item
      );
    } else {
      const newItem: InventoryItem = {
        sku,
        name: sku,
        description: 'Auto-created from Goods Receipt Note',
        category: 'Uncategorized',
        stockQty: qty,
        uom: 'Units',
        status: 'Active',
        minQty: 10,
        maxQty: 100,
        zone: targetZone
      };
      updatedItems.push(newItem);
    }
    
    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sku,
      type: 'Stock-In',
      qty,
      operator
    };
    
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}`,
      message: `[GRN STOCK-IN] Received +${qty} of SKU: ${sku} via Goods Receipt Note by ${operator}`,
      timestamp: new Date().toISOString(),
      sku,
      operator
    };
    
    saveState(updatedItems, [newTx, ...transactions], [newLog, ...logs]);
  };

  // Requisition generator
  const generateRequisitionOrder = (reqItems: { sku: string; qty: number }[]) => {
    const listString = reqItems.map(ri => {
      const it = items.find(item => item.sku === ri.sku);
      return `${ri.qty}x ${it?.name || ri.sku}`;
    }).join(', ');
    
    const newLog: SystemLog = {
      id: `LOG-REQ-${Date.now()}`,
      message: `[REQUISITION DRAFT] Auto-generated requisition order for: [ ${listString} ]`,
      timestamp: new Date().toISOString(),
      operator: 'Inventory Officer',
    };
    
    setLogs([newLog, ...logs]);
    localStorage.setItem('erp_logs', JSON.stringify([newLog, ...logs]));
  };

  const logActivity = (message: string, sku?: string) => {
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      sku,
      operator: 'Inventory Officer',
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('erp_logs', JSON.stringify(updatedLogs));
  };

  return (
    <InventoryContext.Provider value={{
      items,
      transactions,
      logs,
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      selectedStatus,
      setSelectedStatus,
      selectedZoneFilter,
      setSelectedZoneFilter,
      selectedSkus,
      toggleSelectSku,
      toggleSelectAll,
      clearSelection,
      addItem,
      editItem,
      deleteItem,
      bulkDelete,
      bulkStatusChange,
      transferItems,
      createStockIn,
      generateRequisitionOrder,
      logActivity,
      isDrawerOpen,
      setIsDrawerOpen,
      drawerMode,
      setDrawerMode,
      editingItem,
      setEditingItem,
      isTransferOpen,
      setIsTransferOpen,
      transferSku,
      setTransferSku,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      isSettingsOpen,
      setIsSettingsOpen,
      isSupportOpen,
      setIsSupportOpen,
      isNotificationsOpen,
      setIsNotificationsOpen,
      isQuickMenuOpen,
      setIsQuickMenuOpen,
      zones,
      isAuthenticated,
      setIsAuthenticated: updateAuth,
      userRole,
      setUserRole: updateRole,
      currentView,
      setCurrentView: updateView,
      moduleTab,
      setModuleTab,
      toast,
      showToast,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
