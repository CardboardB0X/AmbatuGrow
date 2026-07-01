export interface HelpdeskTicket {
  id: string;               // e.g. "TKT-88492"
  customerName: string;
  email: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedAgent: string;
  dateCreated: string;      // ISO
  slaDeadline: string;      // ISO deadline timer
  internalNotes: string[];
}

export interface FAQArticle {
  id: string;
  category: 'Orders' | 'Inventory' | 'Payments' | 'System';
  title: string;
  content: string;
  helpfulness: number; // thumbs up count
}
