'use client';

import { useEffect, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { useProcurement } from '../context/ProcurementContext';
import { useHelpdesk } from '../context/HelpdeskContext';

export default function SimulationEngine() {
  const { showToast, addSystemLog, items } = useInventory();
  const salesContext = useSales();
  const procContext = useProcurement();
  const helpContext = useHelpdesk();

  // Store context functions in refs to keep setInterval fresh
  const stateRef = useRef({
    showToast,
    addSystemLog,
    items,
    salesContext,
    procContext,
    helpContext
  });

  useEffect(() => {
    stateRef.current = {
      showToast,
      addSystemLog,
      items,
      salesContext,
      procContext,
      helpContext
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const {
        showToast: toastTrigger,
        addSystemLog: logTrigger,
        items: currentItems,
        salesContext: sales,
        procContext: proc,
        helpContext: help
      } = stateRef.current;

      const simulations = ['sales', 'helpdesk', 'procurement'];
      const chosenSim = simulations[Math.floor(Math.random() * simulations.length)];

      if (chosenSim === 'sales') {
        // 1. Simulate E-Commerce order placement
        const catalog = currentItems.filter(i => i.status === 'Active' && i.stockQty > 5);
        if (catalog.length > 0) {
          const product = catalog[Math.floor(Math.random() * catalog.length)];
          const qty = 1;
          const price = product.sku === 'AGRI-SEED-042' ? 1800 : product.sku === 'AGRI-PROD-001' ? 1250 : 980;

          sales.addSalesOrder({
            customerName: 'Shopify Checkout Client',
            email: 'shopify-buyer@gmail.com',
            items: [{
              sku: product.sku,
              name: product.name,
              qty,
              price
            }],
            discount: 0,
            status: 'Processed'
          });

          toastTrigger(`E-Commerce Sync: Synced order for 1x ${product.name} (₱${price})`, 'success');
          logTrigger(`Shopify checkouts generated 1x sales order for SKU ${product.sku} (₱${price}).`, product.sku);
        }
      } else if (chosenSim === 'helpdesk') {
        // 2. Simulate customer filing support tickets
        const issues = [
          "Delayed carrier delivery schedule from Cavite nodes.",
          "WooCommerce transaction charged double on GCash checkout.",
          "Received low safety limits alert for Rice Seed packages.",
          "Requesting supplier invoice dispute resolution assistance."
        ];
        const customers = [
          { name: "Juan Luna", email: "juan.luna@gmail.com" },
          { name: "Gabriela Silang", email: "gabriela@silang.org" },
          { name: "Melchora Aquino", email: "tandang.sora@gmail.com" }
        ];

        const client = customers[Math.floor(Math.random() * customers.length)];
        const issue = issues[Math.floor(Math.random() * issues.length)];
        const priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];

        help.addTicket({
          customerName: client.name,
          email: client.email,
          issue,
          priority,
          status: 'Open',
          assignedAgent: 'Agent Auto-Assign'
        });

        toastTrigger(`Helpdesk Portal: Incoming ticket raised from ${client.name}`, 'info');
        logTrigger(`Helpdesk support incident ticket logged: "${issue}" (Priority: ${priority})`);
      } else if (chosenSim === 'procurement') {
        // 3. Simulate automatic Requisition reviews
        const pendingPR = proc.prs.find(p => p.status === 'Pending L1 Approval' || p.status === 'Pending L2 Approval');
        if (pendingPR) {
          if (pendingPR.status === 'Pending L1 Approval') {
            proc.approvePRL1(pendingPR.id, 'Officer Ticker Agent');
            toastTrigger(`Procurement: Requisition ${pendingPR.id} approved at Level 1`, 'success');
            logTrigger(`PR ${pendingPR.id} approved by Procurement Officer (Level 1).`);
          } else {
            proc.approvePRL2(pendingPR.id, 'Manager Ticker Agent');
            toastTrigger(`Procurement: Requisition ${pendingPR.id} approved at Level 2`, 'success');
            logTrigger(`PR ${pendingPR.id} approved by Procurement Manager (Level 2).`);
          }
        }
      }
    }, 20000); // Trigger a transaction simulation every 20 seconds

    return () => clearInterval(interval);
  }, []);

  return null;
}
