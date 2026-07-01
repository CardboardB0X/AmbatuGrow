export interface SalesOrderLine {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface SalesOrder {
  id: string;               // e.g. "SO-10920"
  customerName: string;
  email: string;
  items: SalesOrderLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Pending L1' | 'Processed' | 'Shipped' | 'Delivered' | 'Fulfilled';
  dateRaised: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: 'VIP' | 'Regular' | 'Lead';
  totalSpend: number;
  purchaseHistory: string[]; // Order IDs
  notes: string;
}

export interface WarrantyClaim {
  id: string;
  orderId: string;
  customerName: string;
  sku: string;
  claimDate: string;
  status: 'Received' | 'Approved' | 'Rejected';
  notes: string;
}
