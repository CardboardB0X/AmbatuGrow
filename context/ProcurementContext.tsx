/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInventory } from './InventoryContext';
import {
  Supplier, PurchaseRequisition, PurchaseOrder, GoodsReceiptNote,
  SupplierInvoice, ProcurementLog, ProcurementTab, ProcurementRole,
  POLineItem,
} from '../types/procurement';

// ─── Mock Seed Data ───────────────────────────────────────────────────────────

const mockSuppliers: Supplier[] = [
  {
    id: 'SUP-001', name: 'AgriSource PH Inc.', contactPerson: 'Ramon Dela Cruz',
    email: 'ramon@agrisource.ph', phone: '09171234567', address: 'Quezon City, Metro Manila',
    category: 'Agricultural', status: 'Active', leadTimeDays: 7, paymentTerms: 'Net 30',
    taxId: '123-456-789-000', rating: 5, totalOrdersValue: 450000,
  },
  {
    id: 'SUP-002', name: 'TechVend Solutions', contactPerson: 'Maria Santos',
    email: 'maria@techvend.com', phone: '09281234567', address: 'Makati City, Metro Manila',
    category: 'IT Equipment', status: 'Active', leadTimeDays: 14, paymentTerms: 'Net 15',
    taxId: '987-654-321-000', rating: 4, totalOrdersValue: 280000,
  },
  {
    id: 'SUP-003', name: 'Green Harvest Co.', contactPerson: 'Jose Reyes',
    email: 'jose@greenharvest.com', phone: '09391234567', address: 'Pampanga',
    category: 'Agricultural', status: 'Active', leadTimeDays: 5, paymentTerms: 'COD',
    taxId: '456-123-789-000', rating: 3, totalOrdersValue: 120000,
  },
  {
    id: 'SUP-004', name: 'OfficeMax PH', contactPerson: 'Ana Lim',
    email: 'ana@officemax.ph', phone: '09451234567', address: 'Pasig City, Metro Manila',
    category: 'Office Supplies', status: 'Inactive', leadTimeDays: 3, paymentTerms: 'Net 7',
    taxId: '789-456-123-000', rating: 3, totalOrdersValue: 45000,
  },
  {
    id: 'SUP-005', name: 'FastDrop Logistics', contactPerson: 'Carlos Tan',
    email: 'carlos@fastdrop.ph', phone: '09561234567', address: 'Cebu City',
    category: 'Logistics', status: 'Blacklisted', leadTimeDays: 2, paymentTerms: 'COD',
    taxId: '321-654-987-000', rating: 1, totalOrdersValue: 18000,
    blacklistReason: 'Repeated delivery discrepancies and unresolved invoice disputes.',
  },
];

const mockPRs: PurchaseRequisition[] = [
  {
    id: 'PR-2026-001', requestedBy: 'Juan dela Cruz', requestorRole: 'Requestor',
    department: 'Farm Operations', dateRaised: '2026-06-20T08:00:00Z',
    dateNeeded: '2026-07-05T00:00:00Z', priority: 'Urgent', status: 'Approved',
    approvalLevel: 1, l1ApprovedBy: 'Procurement Officer', l1ApprovedAt: '2026-06-21T09:00:00Z',
    linkedPoId: 'PO-2026-001',
    items: [
      { sku: 'AGRI-SEED-042', name: 'Hybrid Rice Seeds', uom: 'Sack', requestedQty: 50, estimatedUnitCost: 1800, justification: 'Upcoming planting season' },
      { sku: 'AGRI-FERT-009', name: 'Organic Fertilizer', uom: 'Bag', requestedQty: 30, estimatedUnitCost: 650, justification: 'Stock replenishment' },
    ],
    totalEstimatedCost: 109500, remarks: 'Needed before rainy season starts.',
  },
  {
    id: 'PR-2026-002', requestedBy: 'Maria Santos', requestorRole: 'Requestor',
    department: 'IT Department', dateRaised: '2026-06-22T10:00:00Z',
    dateNeeded: '2026-07-15T00:00:00Z', priority: 'Normal', status: 'Pending L2 Approval',
    approvalLevel: 2, l1ApprovedBy: 'Procurement Officer', l1ApprovedAt: '2026-06-23T11:00:00Z',
    items: [
      { sku: 'COMP-LPT-001', name: 'Laptop Computer', uom: 'Unit', requestedQty: 3, estimatedUnitCost: 45000, justification: 'Replacement for damaged units' },
    ],
    totalEstimatedCost: 135000, remarks: 'Urgent replacement for field staff.',
  },
  {
    id: 'PR-2026-003', requestedBy: 'Pedro Reyes', requestorRole: 'Requestor',
    department: 'Maintenance', dateRaised: '2026-06-25T09:00:00Z',
    dateNeeded: '2026-07-10T00:00:00Z', priority: 'Low', status: 'Pending L1 Approval',
    approvalLevel: 1,
    items: [
      { sku: 'MAINT-001', name: 'Industrial Gloves', uom: 'Pair', requestedQty: 20, estimatedUnitCost: 150, justification: 'Monthly PPE restock' },
      { sku: 'MAINT-002', name: 'Safety Boots', uom: 'Pair', requestedQty: 10, estimatedUnitCost: 800, justification: 'Worn-out boots replacement' },
    ],
    totalEstimatedCost: 11000, remarks: '',
  },
  {
    id: 'PR-2026-004', requestedBy: 'Rosa Cruz', requestorRole: 'Requestor',
    department: 'Admin', dateRaised: '2026-06-26T14:00:00Z',
    dateNeeded: '2026-07-01T00:00:00Z', priority: 'Normal', status: 'Rejected',
    approvalLevel: 1, rejectedBy: 'Procurement Officer', rejectionReason: 'Budget cap exceeded for Q2. Defer to Q3 procurement cycle.',
    items: [
      { sku: 'OFF-001', name: 'Office Chair', uom: 'Unit', requestedQty: 5, estimatedUnitCost: 4500, justification: 'Ergonomic upgrade' },
    ],
    totalEstimatedCost: 22500, remarks: '',
  },
  {
    id: 'PR-2026-005', requestedBy: 'System Auto', requestorRole: 'Procurement Officer',
    department: 'Warehouse', dateRaised: '2026-06-30T07:00:00Z',
    dateNeeded: '2026-07-07T00:00:00Z', priority: 'Urgent', status: 'Draft',
    approvalLevel: 1,
    items: [
      { sku: 'AGRI-PROD-001', name: 'Raw Honey', uom: 'Liter', requestedQty: 100, estimatedUnitCost: 250, justification: 'Auto-generated: stock below minimum threshold' },
    ],
    totalEstimatedCost: 25000, remarks: 'Auto-drafted from low stock alert.',
  },
];

const mockPOs: PurchaseOrder[] = [
  {
    id: 'PO-2026-001', prId: 'PR-2026-001', supplierId: 'SUP-001',
    supplierName: 'AgriSource PH Inc.', issuedBy: 'Procurement Officer',
    issuedByRole: 'Procurement Officer', dateIssued: '2026-06-22T10:00:00Z',
    expectedDelivery: '2026-06-29T00:00:00Z', status: 'Partially Received',
    paymentTerms: 'Net 30',
    items: [
      { sku: 'AGRI-SEED-042', name: 'Hybrid Rice Seeds', uom: 'Sack', orderedQty: 50, receivedQty: 30, unitPrice: 1800, totalPrice: 90000 },
      { sku: 'AGRI-FERT-009', name: 'Organic Fertilizer', uom: 'Bag', orderedQty: 30, receivedQty: 30, unitPrice: 650, totalPrice: 19500 },
    ],
    subtotal: 109500, tax: 13140, totalAmount: 122640,
    notes: 'Deliver to Warehouse A.', linkedGrnIds: ['GRN-2026-001'],
  },
  {
    id: 'PO-2026-002', supplierId: 'SUP-002',
    supplierName: 'TechVend Solutions', issuedBy: 'Procurement Officer',
    issuedByRole: 'Procurement Officer', dateIssued: '2026-06-24T09:00:00Z',
    expectedDelivery: '2026-07-08T00:00:00Z', status: 'Sent to Supplier',
    paymentTerms: 'Net 15',
    items: [
      { sku: 'COMP-MNT-012', name: 'Computer Monitor', uom: 'Unit', orderedQty: 5, receivedQty: 0, unitPrice: 12000, totalPrice: 60000 },
    ],
    subtotal: 60000, tax: 7200, totalAmount: 67200,
    notes: 'Include invoice and delivery receipt.', linkedGrnIds: [],
  },
  {
    id: 'PO-2026-003', supplierId: 'SUP-003',
    supplierName: 'Green Harvest Co.', issuedBy: 'Procurement Manager',
    issuedByRole: 'Procurement Manager', dateIssued: '2026-06-18T08:00:00Z',
    expectedDelivery: '2026-06-23T00:00:00Z', status: 'Fully Received',
    paymentTerms: 'COD',
    items: [
      { sku: 'AGRI-PROD-001', name: 'Raw Honey', uom: 'Liter', orderedQty: 80, receivedQty: 80, unitPrice: 250, totalPrice: 20000 },
    ],
    subtotal: 20000, tax: 2400, totalAmount: 22400,
    notes: '', linkedGrnIds: ['GRN-2026-002'],
  },
  {
    id: 'PO-2026-004', supplierId: 'SUP-004',
    supplierName: 'OfficeMax PH', issuedBy: 'Procurement Officer',
    issuedByRole: 'Procurement Officer', dateIssued: '2026-06-28T11:00:00Z',
    expectedDelivery: '2026-07-01T00:00:00Z', status: 'Draft',
    paymentTerms: 'Net 7',
    items: [
      { sku: 'OFF-002', name: 'Printer Paper (A4)', uom: 'Ream', orderedQty: 50, receivedQty: 0, unitPrice: 280, totalPrice: 14000 },
    ],
    subtotal: 14000, tax: 1680, totalAmount: 15680,
    notes: 'For admin office use.', linkedGrnIds: [],
  },
];

const mockGRNs: GoodsReceiptNote[] = [
  {
    id: 'GRN-2026-001', poId: 'PO-2026-001', supplierId: 'SUP-001',
    supplierName: 'AgriSource PH Inc.', receivedBy: 'Inventory Officer',
    dateReceived: '2026-06-28T14:00:00Z', supplierDeliveryRef: 'DR-AGR-2026-558',
    status: 'Partial', remarks: 'Remaining 20 sacks of seeds to follow.',
    linkedInvoiceId: 'INV-SUP-2026-001', invoiceMatchStatus: 'Matched',
    items: [
      { sku: 'AGRI-SEED-042', name: 'Hybrid Rice Seeds', orderedQty: 50, receivedQty: 30, acceptedQty: 30, rejectedQty: 0, unitPrice: 1800 },
      { sku: 'AGRI-FERT-009', name: 'Organic Fertilizer', orderedQty: 30, receivedQty: 30, acceptedQty: 28, rejectedQty: 2, rejectionReason: 'Damaged', unitPrice: 650 },
    ],
  },
  {
    id: 'GRN-2026-002', poId: 'PO-2026-003', supplierId: 'SUP-003',
    supplierName: 'Green Harvest Co.', receivedBy: 'Inventory Officer',
    dateReceived: '2026-06-23T10:00:00Z', supplierDeliveryRef: 'DR-GH-2026-112',
    status: 'Complete', remarks: '',
    invoiceMatchStatus: 'Approved for Payment',
    items: [
      { sku: 'AGRI-PROD-001', name: 'Raw Honey', orderedQty: 80, receivedQty: 80, acceptedQty: 80, rejectedQty: 0, unitPrice: 250 },
    ],
  },
  {
    id: 'GRN-2026-003', poId: 'PO-2026-001', supplierId: 'SUP-002',
    supplierName: 'TechVend Solutions', receivedBy: 'Inventory Officer',
    dateReceived: '2026-06-29T16:00:00Z', supplierDeliveryRef: 'DR-TV-2026-890',
    status: 'Discrepancy', remarks: '2 units had cracked screens on arrival.',
    invoiceMatchStatus: 'Discrepancy',
    items: [
      { sku: 'COMP-MNT-012', name: 'Computer Monitor', orderedQty: 5, receivedQty: 5, acceptedQty: 3, rejectedQty: 2, rejectionReason: 'Damaged', unitPrice: 12000 },
    ],
  },
];

const mockInvoices: SupplierInvoice[] = [
  {
    id: 'INV-SUP-2026-001', supplierId: 'SUP-001', supplierName: 'AgriSource PH Inc.',
    supplierInvoiceNo: 'SI-AGR-55821', dateIssued: '2026-06-28T00:00:00Z',
    dateReceived: '2026-06-28T14:00:00Z', linkedPoId: 'PO-2026-001',
    linkedGrnId: 'GRN-2026-001', status: 'Matched',
    items: [
      { sku: 'AGRI-SEED-042', name: 'Hybrid Rice Seeds', invoicedQty: 30, invoicedUnitPrice: 1800, invoicedTotal: 54000, matchedQty: 30, priceDifference: 0 },
      { sku: 'AGRI-FERT-009', name: 'Organic Fertilizer', invoicedQty: 28, invoicedUnitPrice: 650, invoicedTotal: 18200, matchedQty: 28, priceDifference: 0 },
    ],
    subtotal: 72200, tax: 8664, totalAmount: 80864,
  },
  {
    id: 'INV-SUP-2026-002', supplierId: 'SUP-003', supplierName: 'Green Harvest Co.',
    supplierInvoiceNo: 'SI-GH-11204', dateIssued: '2026-06-23T00:00:00Z',
    dateReceived: '2026-06-23T10:00:00Z', linkedPoId: 'PO-2026-003',
    linkedGrnId: 'GRN-2026-002', status: 'Approved for Payment',
    approvedBy: 'Procurement Manager', approvedAt: '2026-06-24T09:00:00Z',
    items: [
      { sku: 'AGRI-PROD-001', name: 'Raw Honey', invoicedQty: 80, invoicedUnitPrice: 250, invoicedTotal: 20000, matchedQty: 80, priceDifference: 0 },
    ],
    subtotal: 20000, tax: 2400, totalAmount: 22400,
  },
  {
    id: 'INV-SUP-2026-003', supplierId: 'SUP-002', supplierName: 'TechVend Solutions',
    supplierInvoiceNo: 'SI-TV-99001', dateIssued: '2026-06-29T00:00:00Z',
    dateReceived: '2026-06-29T16:00:00Z', linkedPoId: 'PO-2026-001',
    linkedGrnId: 'GRN-2026-003', status: 'Discrepancy',
    disputeNotes: 'Invoice charges for 5 units but only 3 accepted. Awaiting credit memo.',
    items: [
      { sku: 'COMP-MNT-012', name: 'Computer Monitor', invoicedQty: 5, invoicedUnitPrice: 12000, invoicedTotal: 60000, matchedQty: 3, priceDifference: 0 },
    ],
    subtotal: 60000, tax: 7200, totalAmount: 67200,
  },
];

const mockLogs: ProcurementLog[] = [
  { id: 'PLOG-001', message: 'PO-2026-003 marked as Fully Received', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), operator: 'Inventory Officer', role: 'Inventory Officer', refId: 'PO-2026-003' },
  { id: 'PLOG-002', message: 'INV-SUP-2026-002 approved for payment', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), operator: 'Procurement Manager', role: 'Procurement Manager', refId: 'INV-SUP-2026-002' },
  { id: 'PLOG-003', message: 'PR-2026-002 escalated to L2 approval (value > ₱50,000)', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), operator: 'Procurement Officer', role: 'Procurement Officer', refId: 'PR-2026-002' },
  { id: 'PLOG-004', message: 'GRN-2026-003 flagged as Discrepancy — 2 units rejected', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), operator: 'Inventory Officer', role: 'Inventory Officer', refId: 'GRN-2026-003' },
];

// ─── Context Interface ────────────────────────────────────────────────────────

interface ProcurementContextValue {
  // Active role simulation
  activeRole: ProcurementRole;
  setActiveRole: (role: ProcurementRole) => void;

  // Sub-navigation
  activeTab: ProcurementTab;
  setActiveTab: (tab: ProcurementTab) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (s: Omit<Supplier, 'id' | 'totalOrdersValue'>) => void;
  editSupplier: (s: Supplier) => void;
  blacklistSupplier: (id: string, reason: string) => void;

  // Purchase Requisitions
  prs: PurchaseRequisition[];
  addPR: (pr: Omit<PurchaseRequisition, 'id' | 'dateRaised' | 'totalEstimatedCost' | 'status' | 'approvalLevel'>) => void;
  approvePRL1: (id: string, approverName: string) => void;
  approvePRL2: (id: string, approverName: string) => void;
  rejectPR: (id: string, rejectedBy: string, reason: string) => void;
  convertPRtoPO: (prId: string) => string | null; // returns new PO id

  // Purchase Orders
  pos: PurchaseOrder[];
  addPO: (po: Omit<PurchaseOrder, 'id' | 'dateIssued' | 'linkedGrnIds' | 'subtotal' | 'tax' | 'totalAmount'>) => void;
  editPO: (po: PurchaseOrder) => void;
  updatePOStatus: (id: string, status: PurchaseOrder['status']) => void;
  exportPOasCSV: (poId: string) => void;

  // GRNs
  grns: GoodsReceiptNote[];
  addGRN: (grn: Omit<GoodsReceiptNote, 'id' | 'dateReceived' | 'invoiceMatchStatus'>) => void;

  // Invoices
  invoices: SupplierInvoice[];
  addInvoice: (inv: Omit<SupplierInvoice, 'id' | 'dateReceived' | 'status'>) => void;
  approveInvoiceForPayment: (id: string, approverName: string) => void;
  disputeInvoice: (id: string, notes: string) => void;

  // Logs
  procLogs: ProcurementLog[];
  addLog: (message: string, operator: string, role: ProcurementRole, refId?: string) => void;

  // Drawer / Modal state
  isPRDrawerOpen: boolean;
  setIsPRDrawerOpen: (v: boolean) => void;
  isPODrawerOpen: boolean;
  setIsPODrawerOpen: (v: boolean) => void;
  isSupplierDrawerOpen: boolean;
  setIsSupplierDrawerOpen: (v: boolean) => void;
  isGRNModalOpen: boolean;
  setIsGRNModalOpen: (v: boolean) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (v: boolean) => void;
  isApprovalModalOpen: boolean;
  setIsApprovalModalOpen: (v: boolean) => void;

  editingSupplier: Supplier | null;
  setEditingSupplier: (s: Supplier | null) => void;
  editingPO: PurchaseOrder | null;
  setEditingPO: (po: PurchaseOrder | null) => void;
  selectedPRId: string | null;
  setSelectedPRId: (id: string | null) => void;
  selectedPOId: string | null;
  setSelectedPOId: (id: string | null) => void;
}

const ProcurementContext = createContext<ProcurementContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { items, editItem } = useInventory();
  const [activeRole, setActiveRole] = useState<ProcurementRole>('Procurement Manager');
  const [activeTab, setActiveTab] = useState<ProcurementTab>('Requisitions');
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [prs, setPrs] = useState<PurchaseRequisition[]>(mockPRs);
  const [pos, setPos] = useState<PurchaseOrder[]>(mockPOs);
  const [grns, setGrns] = useState<GoodsReceiptNote[]>(mockGRNs);
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(mockInvoices);
  const [procLogs, setProcLogs] = useState<ProcurementLog[]>(mockLogs);

  // Drawers / Modals
  const [isPRDrawerOpen, setIsPRDrawerOpen] = useState(false);
  const [isPODrawerOpen, setIsPODrawerOpen] = useState(false);
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [selectedPRId, setSelectedPRId] = useState<string | null>(null);
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('proc_state');
    if (saved) {
      const s = JSON.parse(saved);
      if (s.suppliers) setSuppliers(s.suppliers);
      if (s.prs) setPrs(s.prs);
      if (s.pos) setPos(s.pos);
      if (s.grns) setGrns(s.grns);
      if (s.invoices) setInvoices(s.invoices);
      if (s.procLogs) setProcLogs(s.procLogs);
    }
  }, []);

  const persist = (updates: Partial<{ suppliers: Supplier[]; prs: PurchaseRequisition[]; pos: PurchaseOrder[]; grns: GoodsReceiptNote[]; invoices: SupplierInvoice[]; procLogs: ProcurementLog[] }>) => {
    const current = JSON.parse(localStorage.getItem('proc_state') || '{}');
    localStorage.setItem('proc_state', JSON.stringify({ ...current, ...updates }));
  };

  // ── Log helper ──────────────────────────────────────────────────────────────
  const addLog = (message: string, operator: string, role: ProcurementRole, refId?: string) => {
    const newLog: ProcurementLog = {
      id: `PLOG-${Date.now()}`, message,
      timestamp: new Date().toISOString(), operator, role, refId,
    };
    setProcLogs(prev => {
      const updated = [newLog, ...prev];
      persist({ procLogs: updated });
      return updated;
    });
  };

  // ── ID generators ───────────────────────────────────────────────────────────
  const nextId = (prefix: string, list: { id: string }[]) => {
    const nums = list.map(i => parseInt(i.id.replace(/\D/g, ''), 10)).filter(Boolean);
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `${prefix}${String(next).padStart(3, '0')}`;
  };

  // ── Supplier actions ────────────────────────────────────────────────────────
  const addSupplier = (s: Omit<Supplier, 'id' | 'totalOrdersValue'>) => {
    const newS: Supplier = { ...s, id: nextId('SUP-', suppliers), totalOrdersValue: 0 };
    const updated = [...suppliers, newS];
    setSuppliers(updated); persist({ suppliers: updated });
    addLog(`New supplier added: ${newS.name}`, activeRole, activeRole, newS.id);
  };

  const editSupplier = (s: Supplier) => {
    const updated = suppliers.map(x => x.id === s.id ? s : x);
    setSuppliers(updated); persist({ suppliers: updated });
    addLog(`Supplier updated: ${s.name}`, activeRole, activeRole, s.id);
  };

  const blacklistSupplier = (id: string, reason: string) => {
    const updated = suppliers.map(s => s.id === id ? { ...s, status: 'Blacklisted' as const, blacklistReason: reason } : s);
    setSuppliers(updated); persist({ suppliers: updated });
    addLog(`Supplier blacklisted: ${id} — ${reason}`, activeRole, activeRole, id);
  };

  // ── PR actions ──────────────────────────────────────────────────────────────
  const addPR = (pr: Omit<PurchaseRequisition, 'id' | 'dateRaised' | 'totalEstimatedCost' | 'status' | 'approvalLevel'>) => {
    const totalEstimatedCost = pr.items.reduce((s, i) => s + i.requestedQty * i.estimatedUnitCost, 0);
    const approvalLevel: 1 | 2 = totalEstimatedCost > 50000 ? 2 : 1;
    const newPR: PurchaseRequisition = {
      ...pr, id: nextId('PR-2026-', prs), dateRaised: new Date().toISOString(),
      totalEstimatedCost, approvalLevel, status: 'Pending L1 Approval',
    };
    const updated = [newPR, ...prs];
    setPrs(updated); persist({ prs: updated });
    addLog(`PR ${newPR.id} raised by ${newPR.requestedBy} (${newPR.department}) — ₱${totalEstimatedCost.toLocaleString()}`, newPR.requestedBy, newPR.requestorRole, newPR.id);
  };

  const approvePRL1 = (id: string, approverName: string) => {
    const updated = prs.map(pr => {
      if (pr.id !== id) return pr;
      const nextStatus: PurchaseRequisition['status'] = pr.approvalLevel === 2 ? 'Pending L2 Approval' : 'Approved';
      return { ...pr, status: nextStatus, l1ApprovedBy: approverName, l1ApprovedAt: new Date().toISOString() };
    });
    setPrs(updated); persist({ prs: updated });
    addLog(`PR ${id} approved at L1 by ${approverName}`, approverName, activeRole, id);
  };

  const approvePRL2 = (id: string, approverName: string) => {
    const updated = prs.map(pr =>
      pr.id === id ? { ...pr, status: 'Approved' as const, l2ApprovedBy: approverName, l2ApprovedAt: new Date().toISOString() } : pr
    );
    setPrs(updated); persist({ prs: updated });
    addLog(`PR ${id} approved at L2 by ${approverName} — now Fully Approved`, approverName, activeRole, id);
  };

  const rejectPR = (id: string, rejectedBy: string, reason: string) => {
    const updated = prs.map(pr =>
      pr.id === id ? { ...pr, status: 'Rejected' as const, rejectedBy, rejectionReason: reason } : pr
    );
    setPrs(updated); persist({ prs: updated });
    addLog(`PR ${id} rejected by ${rejectedBy}: "${reason}"`, rejectedBy, activeRole, id);
  };

  const convertPRtoPO = (prId: string): string | null => {
    const pr = prs.find(p => p.id === prId);
    if (!pr || pr.status !== 'Approved') return null;
    const poItems: POLineItem[] = pr.items.map(item => ({
      sku: item.sku, name: item.name, uom: item.uom,
      orderedQty: item.requestedQty, receivedQty: 0,
      unitPrice: item.estimatedUnitCost, totalPrice: item.requestedQty * item.estimatedUnitCost,
    }));
    const subtotal = poItems.reduce((s, i) => s + i.totalPrice, 0);
    const tax = Math.round(subtotal * 0.12);
    const newPO: PurchaseOrder = {
      id: nextId('PO-2026-', pos), prId,
      supplierId: '', supplierName: 'TBD — Assign Supplier',
      issuedBy: activeRole, issuedByRole: activeRole,
      dateIssued: new Date().toISOString(),
      expectedDelivery: pr.dateNeeded,
      status: 'Draft', paymentTerms: 'Net 30',
      items: poItems, subtotal, tax, totalAmount: subtotal + tax,
      notes: `Converted from ${prId}`, linkedGrnIds: [],
    };
    const updatedPOs = [newPO, ...pos];
    const updatedPRs = prs.map(p => p.id === prId ? { ...p, status: 'Converted to PO' as const, linkedPoId: newPO.id } : p);
    setPos(updatedPOs); setPrs(updatedPRs);
    persist({ pos: updatedPOs, prs: updatedPRs });
    addLog(`PR ${prId} converted to PO ${newPO.id}`, activeRole, activeRole, newPO.id);
    return newPO.id;
  };

  // ── PO actions ──────────────────────────────────────────────────────────────
  const addPO = (po: Omit<PurchaseOrder, 'id' | 'dateIssued' | 'linkedGrnIds' | 'subtotal' | 'tax' | 'totalAmount'>) => {
    const subtotal = po.items.reduce((s, i) => s + i.totalPrice, 0);
    const tax = Math.round(subtotal * 0.12);
    const newPO: PurchaseOrder = { ...po, id: nextId('PO-2026-', pos), dateIssued: new Date().toISOString(), linkedGrnIds: [], subtotal, tax, totalAmount: subtotal + tax };
    const updated = [newPO, ...pos];
    setPos(updated); persist({ pos: updated });
    addLog(`PO ${newPO.id} created for ${newPO.supplierName} — ₱${newPO.totalAmount.toLocaleString()}`, activeRole, activeRole, newPO.id);
  };

  const editPO = (po: PurchaseOrder) => {
    const subtotal = po.items.reduce((s, i) => s + i.totalPrice, 0);
    const tax = Math.round(subtotal * 0.12);
    const updated = pos.map(p => p.id === po.id ? { ...po, subtotal, tax, totalAmount: subtotal + tax } : p);
    setPos(updated); persist({ pos: updated });
    addLog(`PO ${po.id} updated`, activeRole, activeRole, po.id);
  };

  const updatePOStatus = (id: string, status: PurchaseOrder['status']) => {
    const updated = pos.map(p => p.id === id ? { ...p, status } : p);
    setPos(updated); persist({ pos: updated });
    addLog(`PO ${id} status changed to "${status}"`, activeRole, activeRole, id);
  };

  const exportPOasCSV = (poId: string) => {
    const po = pos.find(p => p.id === poId);
    if (!po) return;
    const header = ['PO ID', 'PO Date', 'Supplier Name', 'Payment Terms', 'Expected Delivery', 'Status'];
    const meta = [po.id, po.dateIssued.split('T')[0], po.supplierName, po.paymentTerms, po.expectedDelivery.split('T')[0], po.status];
    const lineHeader = ['', 'SKU', 'Item Name', 'UOM', 'Ordered Qty', 'Unit Price (PHP)', 'Total Price (PHP)'];
    const lines = po.items.map(i => ['', i.sku, i.name, i.uom, String(i.orderedQty), i.unitPrice.toFixed(2), i.totalPrice.toFixed(2)]);
    const totals = [['', '', '', '', '', 'Subtotal', po.subtotal.toFixed(2)], ['', '', '', '', '', 'VAT (12%)', po.tax.toFixed(2)], ['', '', '', '', '', 'TOTAL', po.totalAmount.toFixed(2)]];
    const rows = [header, meta, [], lineHeader, ...lines, [], ...totals];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${po.id}.csv`; a.click();
    URL.revokeObjectURL(url);
    addLog(`PO ${po.id} exported as CSV`, activeRole, activeRole, po.id);
  };

  // ── GRN actions ─────────────────────────────────────────────────────────────
  const addGRN = (grn: Omit<GoodsReceiptNote, 'id' | 'dateReceived' | 'invoiceMatchStatus'>) => {
    const newGRN: GoodsReceiptNote = {
      ...grn, id: nextId('GRN-2026-', grns),
      dateReceived: new Date().toISOString(), invoiceMatchStatus: 'Pending',
    };
    // Update PO received qty
    const updatedPOs = pos.map(po => {
      if (po.id !== grn.poId) return po;
      const updatedItems = po.items.map(item => {
        const grnLine = newGRN.items.find(g => g.sku === item.sku);
        return grnLine ? { ...item, receivedQty: item.receivedQty + grnLine.acceptedQty } : item;
      });
      const allReceived = updatedItems.every(i => i.receivedQty >= i.orderedQty);
      const anyReceived = updatedItems.some(i => i.receivedQty > 0);
      const newStatus: PurchaseOrder['status'] = allReceived ? 'Fully Received' : anyReceived ? 'Partially Received' : po.status;
      return { ...po, items: updatedItems, status: newStatus, linkedGrnIds: [...po.linkedGrnIds, newGRN.id] };
    });

    // Increment inventory items when goods are received
    grn.items.forEach(grnItem => {
      const invItem = items.find(i => i.sku === grnItem.sku);
      if (invItem) {
        editItem({
          ...invItem,
          stockQty: invItem.stockQty + grnItem.acceptedQty
        });
      }
    });

    const updatedGRNs = [newGRN, ...grns];
    setGrns(updatedGRNs); setPos(updatedPOs);
    persist({ grns: updatedGRNs, pos: updatedPOs });
    addLog(`GRN ${newGRN.id} recorded for PO ${grn.poId} — status: ${newGRN.status}`, activeRole, activeRole, newGRN.id);
  };

  // ── Invoice actions ─────────────────────────────────────────────────────────
  const addInvoice = (inv: Omit<SupplierInvoice, 'id' | 'dateReceived' | 'status'>) => {
    // 3-way match: compare invoice qty+price vs PO+GRN
    const po = pos.find(p => p.id === inv.linkedPoId);
    const grn = grns.find(g => g.id === inv.linkedGrnId);
    let matchStatus: SupplierInvoice['status'] = 'Matched';
    inv.items.forEach(invItem => {
      const poItem = po?.items.find(i => i.sku === invItem.sku);
      const grnItem = grn?.items.find(i => i.sku === invItem.sku);
      const qtyOk = grnItem ? invItem.invoicedQty <= grnItem.acceptedQty : false;
      const priceOk = poItem ? Math.abs(invItem.invoicedUnitPrice - poItem.unitPrice) / poItem.unitPrice <= 0.02 : false;
      if (!qtyOk || !priceOk) matchStatus = invItem.invoicedQty > (grnItem?.acceptedQty ?? 0) ? 'Discrepancy' : 'Partial Match';
    });
    const newInv: SupplierInvoice = { ...inv, id: nextId('INV-SUP-2026-', invoices), dateReceived: new Date().toISOString(), status: matchStatus };
    // Update linked GRN invoice status
    const updatedGRNs = grns.map(g => g.id === inv.linkedGrnId ? { ...g, linkedInvoiceId: newInv.id, invoiceMatchStatus: matchStatus } : g);
    const updatedInvoices = [newInv, ...invoices];
    setInvoices(updatedInvoices); setGrns(updatedGRNs);
    persist({ invoices: updatedInvoices, grns: updatedGRNs });
    addLog(`Invoice ${newInv.id} logged — 3-way match: ${matchStatus}`, activeRole, activeRole, newInv.id);
  };

  const approveInvoiceForPayment = (id: string, approverName: string) => {
    const updated = invoices.map(inv => inv.id === id ? { ...inv, status: 'Approved for Payment' as const, approvedBy: approverName, approvedAt: new Date().toISOString() } : inv);
    setInvoices(updated); persist({ invoices: updated });
    addLog(`Invoice ${id} approved for payment by ${approverName}`, approverName, activeRole, id);
  };

  const disputeInvoice = (id: string, notes: string) => {
    const updated = invoices.map(inv => inv.id === id ? { ...inv, status: 'Disputed' as const, disputeNotes: notes } : inv);
    setInvoices(updated); persist({ invoices: updated });
    addLog(`Invoice ${id} disputed: "${notes}"`, activeRole, activeRole, id);
  };

  return (
    <ProcurementContext.Provider value={{
      activeRole, setActiveRole, activeTab, setActiveTab,
      suppliers, addSupplier, editSupplier, blacklistSupplier,
      prs, addPR, approvePRL1, approvePRL2, rejectPR, convertPRtoPO,
      pos, addPO, editPO, updatePOStatus, exportPOasCSV,
      grns, addGRN,
      invoices, addInvoice, approveInvoiceForPayment, disputeInvoice,
      procLogs, addLog,
      isPRDrawerOpen, setIsPRDrawerOpen,
      isPODrawerOpen, setIsPODrawerOpen,
      isSupplierDrawerOpen, setIsSupplierDrawerOpen,
      isGRNModalOpen, setIsGRNModalOpen,
      isInvoiceModalOpen, setIsInvoiceModalOpen,
      isApprovalModalOpen, setIsApprovalModalOpen,
      editingSupplier, setEditingSupplier,
      editingPO, setEditingPO,
      selectedPRId, setSelectedPRId,
      selectedPOId, setSelectedPOId,
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const ctx = useContext(ProcurementContext);
  if (!ctx) throw new Error('useProcurement must be used within ProcurementProvider');
  return ctx;
};
