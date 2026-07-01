export interface Shipment {
  id: string;               // e.g. "SH-9920"
  carrier: string;          // "LBC Express", "J&T Cargo", "Cavite Transport"
  origin: string;
  destination: string;
  qty: number;
  status: 'In Transit' | 'Delivered' | 'Processing';
  departureTime: string;
  eta: string;
  coords: { x: number; y: number }; // coordinate markers for SVG routing
}

export interface ForecastItem {
  sku: string;
  name: string;
  currentStock: number;
  predictedDemand: 'High' | 'Stable' | 'Low';
  growthPercentage: number;
  recommendedStock: number;
}
