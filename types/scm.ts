export interface Shipment {
  id: string;               // e.g. "SH-9920"
  carrier: string;          // "LBC Express", "J&T Cargo", "Cavite Transport"
  origin: string;
  destination: string;
  qty: number;
  status: 'In Transit' | 'Delivered' | 'Processing';
  departureTime: string;
  eta: string;
  coords: { lat: number; lng: number }; // Latitude and Longitude for Leaflet API map
  sku?: string; // Associated product SKU being transported
  destCoords?: { lat: number; lng: number }; // Dynamic target drop-off GPS destination coordinate
}

export interface ForecastItem {
  sku: string;
  name: string;
  currentStock: number;
  predictedDemand: 'High' | 'Stable' | 'Low';
  growthPercentage: number;
  recommendedStock: number;
}
