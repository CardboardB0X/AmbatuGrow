# Database Schema & Entity Relationship Diagram (ERD)

This document describes the database design for the **AMBATUGROW ERP System**. The relational model binds the five core operational modules: **Inventory & Warehouse Management**, **Procurement (Purchasing)**, **Supply Chain Management (SCM)**, **Sales Order Management**, and **Customer Service/Helpdesk**.

---

## 1. Entity Relationship Diagram (ERD)

The following Mermaid diagram represents the schema entities, primary keys (`PK`), foreign keys (`FK`), attributes, and relationship constraints.

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

---

## 2. Relational Schema Details

### 2.1 Inventory & Warehousing
* **`warehouse_zones`**: Identifies specific storage segments (e.g. `Warehouse A - Zone 1`). Constrains total capacities to prevent physical overfill.
* **`inventory_items`**: Holds standard catalog SKU items. Integrates with Vercel's real-time occupancy gauges. A foreign key links each product to its storage zone.
* **`inventory_transactions`**: Logs all movements (`IN` arrivals or `OUT` sales dispatches) as a ledger history.

### 2.2 Requisition & Procurement
* **`suppliers`**: Stores catalog listings, ratings, and cumulative order metrics.
* **`purchase_requisitions`**: Standardizes purchase requests. Connects through workflow pipelines for L1 (Officer) and L2 (Manager) authorization levels.
* **`purchase_orders`**: Formal PO records. Stores cumulative values and links to matching goods receipts.
* **`goods_receipt_notes`**: Logs arrivals. acceptance quantity metrics automatically increment matching product stock inside the `inventory_items` table.
* **`supplier_invoices`**: Audits accounts payable against PO contract prices and GRN accepted quantities (3-way match validation).

### 2.3 Logistics & SCM
* **`shipments`**: Tracks active coordinate telemetry (`latitude`, `longitude`). background animation loops update position intervals towards targets in Cavite.

### 2.4 Sales Order Lifecycle
* **`customers`**: VIP and regular segments compiled from transaction histories.
* **`sales_orders`**: Houses invoices. Successful checkout automatically deducts quantities from `inventory_items`.
* **`warranty_claims`**: Files service complaints. Validates against order databases to prevent fraud.

### 2.5 Support Helpdesk
* **`support_tickets`**: Tracks response SLAs. Escalates issues based on severity triggers.
* **`ticket_notes`**: Internal team case discussion threads.
* **`kb_articles`**: Self-service solution manuals.

---

## 3. Dynamic Triggers (ERP Connections)

The system enforces three direct database connection rules:
1. **Sales Checkout Stock Deduction**: Creating a `sales_order` decrements `inventory_items.stock_qty`. If it falls below `min_qty`, a critical low-stock alert is generated.
2. **Goods Receipt Stock Increment**: Creating a `goods_receipt_note` (GRN) automatically increments matching `inventory_items.stock_qty` values.
3. **Inter-Warehouse Transfer Execution**: Registering a stock transfer in SCM calls `transferItems` to reduce counts in the origin zone and increase them in the target zone.
