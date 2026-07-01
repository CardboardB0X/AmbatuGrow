# AMBATUGROW ERP Ecosystem Terminal

An enterprise-grade, Vercel-ready ERP system designed to coordinate core operational modules: **Inventory & Warehouse Tracking**, **Procurement (Purchasing)**, **Supply Chain Management (SCM)**, **Sales Order Management**, and **Customer Service/Helpdesk**.

---

## 🗄️ Database Architecture & ERD

The system is designed with PostgreSQL-compliant relational rules that dynamically sync actions across contexts (e.g. Sales checkouts deduct stock, Procurement GRNs increment stock).

### Entity Relationship Diagram (ERD)

Below is the active schema model. Vercel/GitHub renders this diagram natively using Mermaid:

```mermaid
erDiagram
    %% ----------------------------------------------------
    %% INVENTORY MODULE
    %% ----------------------------------------------------
    WAREHOUSE-ZONES ||--o{ INVENTORY-ITEMS : "allocates"
    INVENTORY-ITEMS ||--o{ INVENTORY-TRANSACTIONS : "logs"

    WAREHOUSE-ZONES {
        string name PK
        string category
        int max_capacity
        int current_occupancy
    }

    INVENTORY-ITEMS {
        string sku PK
        string name
        string category
        int stock_qty
        int min_qty
        int max_qty
        string uom
        string status
        string zone_name FK
        timestamp last_updated
    }

    INVENTORY-TRANSACTIONS {
        int id PK
        string sku FK
        string type
        int qty
        timestamp timestamp
        string operator
        string notes
    }

    %% ----------------------------------------------------
    %% PROCUREMENT MODULE
    %% ----------------------------------------------------
    SUPPLIERS ||--o{ PURCHASE-ORDERS : "fulfills"
    PURCHASE-REQUISITIONS ||--o| PURCHASE-ORDERS : "converts"
    PURCHASE-REQUISITIONS ||--o{ PR-LINE-ITEMS : "contains"
    PURCHASE-ORDERS ||--o{ PO-LINE-ITEMS : "contains"
    PURCHASE-ORDERS ||--o{ GOODS-RECEIPT-NOTES : "originates"
    GOODS-RECEIPT-NOTES ||--o{ GRN-LINE-ITEMS : "receives"
    GOODS-RECEIPT-NOTES ||--o| SUPPLIER-INVOICES : "bills"
    SUPPLIER-INVOICES ||--o{ INVOICE-LINE-ITEMS : "contains"

    SUPPLIERS {
        string id PK
        string name
        string contact_person
        string email
        string phone
        string address
        string category
        string status
        int lead_time_days
        string payment_terms
        string tax_id
        int rating
        numeric total_orders_value
    }

    PURCHASE-REQUISITIONS {
        string id PK
        timestamp date_raised
        string department
        string priority
        numeric estimated_cost
        string status
        date date_needed
        string raised_by
        string linked_po_id
    }

    PR-LINE-ITEMS {
        int id PK
        string pr_id FK
        string sku
        int qty
        numeric estimated_unit_cost
        numeric total_estimated_cost
    }

    PURCHASE-ORDERS {
        string id PK
        string linked_pr_id FK
        string supplier_id FK
        timestamp date_issued
        date expected_delivery
        numeric subtotal
        numeric tax
        numeric total
        string status
        string notes
    }

    PO-LINE-ITEMS {
        int id PK
        string po_id FK
        string sku FK
        int qty
        numeric unit_price
        int received_qty
    }

    GOODS-RECEIPT-NOTES {
        string id PK
        string po_id FK
        string supplier_id FK
        timestamp date_received
        string delivery_ref
        string status
        string remarks
        string received_by
        string invoice_match_status
    }

    GRN-LINE-ITEMS {
        int id PK
        string grn_id FK
        string sku
        int accepted_qty
        int rejected_qty
        string rejection_reason
    }

    SUPPLIER-INVOICES {
        string id PK
        string supplier_invoice_no
        string linked_po_id FK
        string linked_grn_id FK
        timestamp date_received
        numeric subtotal
        numeric tax
        numeric total
        string status
    }

    INVOICE-LINE-ITEMS {
        int id PK
        string invoice_id FK
        string sku
        int invoiced_qty
        numeric invoiced_unit_price
    }

    %% ----------------------------------------------------
    %% SCM MODULE
    %% ----------------------------------------------------
    SHIPMENTS {
        string id PK
        string carrier
        string origin
        string destination
        int qty
        string status
        timestamp departure_time
        timestamp eta
        numeric latitude
        numeric longitude
    }

    %% ----------------------------------------------------
    %% SALES & CRM MODULE
    %% ----------------------------------------------------
    CUSTOMERS ||--o{ SALES-ORDERS : "places"
    SALES-ORDERS ||--o{ SALES-ORDER-ITEMS : "contains"
    SALES-ORDERS ||--o{ WARRANTY-CLAIMS : "covers"

    CUSTOMERS {
        string id PK
        string name
        string email
        string phone
        string segment
        numeric total_spend
        string notes
    }

    SALES-ORDERS {
        string id PK
        string customer_id FK
        string customer_name
        string email
        numeric discount
        numeric subtotal
        numeric tax
        numeric total
        string status
        timestamp date_raised
    }

    SALES-ORDER-ITEMS {
        int id PK
        string sales_order_id FK
        string sku FK
        string name
        int qty
        numeric price
    }

    WARRANTY-CLAIMS {
        string id PK
        string order_id FK
        string customer_name
        string sku
        timestamp claim_date
        string status
        string notes
    }

    %% ----------------------------------------------------
    %% HELPDESK MODULE
    %% ----------------------------------------------------
    SUPPORT-TICKETS ||--o{ TICKET-NOTES : "appends"

    SUPPORT-TICKETS {
        string id PK
        string customer_name
        string email
        string issue
        string priority
        string status
        string assigned_agent
        timestamp date_raised
    }

    TICKET-NOTES {
        int id PK
        string ticket_id FK
        string author
        string content
        timestamp created_at
    }

    KB-ARTICLES {
        string id PK
        string title
        string category
        string content
        int helpful_votes
    }
```

* **SQL Script Source**: [`schema.sql`](./schema.sql)
* **Detailed Schema Descriptions**: [`DATABASE.md`](./DATABASE.md)

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+ or Vercel CLI
* Git

### Local Setup

1. Clone and enter the repository directory:
   ```bash
   git clone https://github.com/CardboardB0X/AmbatuGrow.git
   cd AmbatuGrow
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your web browser.
