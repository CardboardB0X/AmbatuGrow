// ─── Procurement Role Types ───────────────────────────────────────────────────

export type ProcurementRole =
  | 'Requestor'
  | 'Procurement Officer'
  | 'Procurement Manager'
  | 'Inventory Officer';

// ─── Supplier ─────────────────────────────────────────────────────────────────

export type SupplierStatus = 'Active' | 'Inactive' | 'Blacklisted';

export interface Supplier {
  id: string;                 // e.g. "SUP-001"
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;           // "Agricultural" | "IT Equipment" | etc.
  status: SupplierStatus;
  leadTimeDays: number;
  paymentTerms: string;       // "Net 30" | "COD" | etc.
  taxId: string;              // TIN
  rating: 1 | 2 | 3 | 4 | 5;
  totalOrdersValue: number;   // cumulative PO value in PHP
  blacklistReason?: string;
}

// ─── Purchase Requisition ─────────────────────────────────────────────────────

export type PRStatus =
  | 'Draft'
  | 'Pending L1 Approval'
  | 'Pending L2 Approval'
  | 'Approved'
  | 'Rejected'
  | 'Converted to PO';

export type PRPriority = 'Low' | 'Normal' | 'Urgent';

export interface PRLineItem {
  sku: string;
  name: string;
  uom: string;
  requestedQty: number;
  estimatedUnitCost: number;  // PHP
  justification: string;
}

export interface PurchaseRequisition {
  id: string;                 // "PR-2026-001"
  requestedBy: string;
  requestorRole: ProcurementRole;
  department: string;
  dateRaised: string;         // ISO
  dateNeeded: string;         // ISO
  priority: PRPriority;
  status: PRStatus;
  approvalLevel: 1 | 2;       // 1 if total ≤ 50000, else 2
  l1ApprovedBy?: string;
  l1ApprovedAt?: string;
  l2ApprovedBy?: string;
  l2ApprovedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  linkedPoId?: string;
  items: PRLineItem[];
  totalEstimatedCost: number; // PHP
  remarks: string;
}

// ─── Purchase Order ───────────────────────────────────────────────────────────

export type POStatus =
  | 'Draft'
  | 'Approved'
  | 'Sent to Supplier'
  | 'Partially Received'
  | 'Fully Received'
  | 'Cancelled';

export interface POLineItem {
  sku: string;
  name: string;
  uom: string;
  orderedQty: number;
  receivedQty: number;        // updated as GRNs come in
  unitPrice: number;          // PHP
  totalPrice: number;         // PHP
}

export interface PurchaseOrder {
  id: string;                 // "PO-2026-001"
  prId?: string;              // optional link to source PR
  supplierId: string;
  supplierName: string;
  issuedBy: string;
  issuedByRole: ProcurementRole;
  dateIssued: string;         // ISO
  expectedDelivery: string;   // ISO
  status: POStatus;
  paymentTerms: string;
  items: POLineItem[];
  subtotal: number;           // PHP
  tax: number;                // 12% VAT
  totalAmount: number;        // PHP
  notes: string;
  linkedGrnIds: string[];
}

// ─── Goods Receipt Note ───────────────────────────────────────────────────────

export type GRNStatus = 'Complete' | 'Partial' | 'Discrepancy';

export type RejectionReason =
  | 'Damaged'
  | 'Wrong Item'
  | 'Expired'
  | 'Short Delivery'
  | 'Other';

export interface GRNLineItem {
  sku: string;
  name: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectionReason?: RejectionReason;
  unitPrice: number;          // from PO line
}

export interface GoodsReceiptNote {
  id: string;                 // "GRN-2026-001"
  poId: string;
  supplierId: string;
  supplierName: string;
  receivedBy: string;
  dateReceived: string;       // ISO
  supplierDeliveryRef: string;
  items: GRNLineItem[];
  status: GRNStatus;
  remarks: string;
  linkedInvoiceId?: string;
  invoiceMatchStatus: InvoiceMatchStatus;
}

// ─── Supplier Invoice & Matching ──────────────────────────────────────────────

export type InvoiceMatchStatus =
  | 'Pending'
  | 'Matched'
  | 'Partial Match'
  | 'Discrepancy'
  | 'Approved for Payment'
  | 'Disputed';

export interface InvoiceLineItem {
  sku: string;
  name: string;
  invoicedQty: number;
  invoicedUnitPrice: number;  // PHP
  invoicedTotal: number;      // PHP
  matchedQty?: number;
  priceDifference?: number;   // invoiced - PO price
}

export interface SupplierInvoice {
  id: string;                 // "INV-SUP-2026-001"
  supplierId: string;
  supplierName: string;
  supplierInvoiceNo: string;
  dateIssued: string;         // ISO
  dateReceived: string;       // ISO
  linkedPoId: string;
  linkedGrnId?: string;
  items: InvoiceLineItem[];
  subtotal: number;           // PHP
  tax: number;                // PHP
  totalAmount: number;        // PHP
  status: InvoiceMatchStatus;
  approvedBy?: string;
  approvedAt?: string;
  disputeNotes?: string;
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export interface ProcurementLog {
  id: string;
  message: string;
  timestamp: string;          // ISO
  operator: string;
  role: ProcurementRole;
  refId?: string;             // PR / PO / GRN / INV reference
}

// ─── Sub-navigation ───────────────────────────────────────────────────────────

export type ProcurementTab =
  | 'Requisitions'
  | 'Suppliers'
  | 'Purchase Orders'
  | 'Goods Receipt';
