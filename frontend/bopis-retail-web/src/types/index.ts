export interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  phone: string;
  pickupInstructions: string;
  curbsideBays: number;
  smartLockersAvailable: boolean;
  distanceMiles?: number;
}

export interface Product {
  id: number;
  sku: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  brand: string;
  rating: number;
  reviewCount: number;
  quantityOnHand?: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  aisleLocation?: string;
  department?: string;
  shelfCoordinate?: string;
  isInStock: boolean;
}

export interface StoreStockLookup {
  storeId: number;
  storeName: string;
  city: string;
  availableQuantity: number;
  aisleLocation: string;
  isInStock: boolean;
}

export type PickupType = 'StoreCounter' | 'Curbside' | 'SmartLocker';
export type OrderStatus = 'Reserved' | 'ReadyForPickup' | 'CustomerArrived' | 'Completed' | 'Expired' | 'Cancelled';

export interface OrderItem {
  productId: number;
  productTitle: string;
  productSku: string;
  aisleLocation: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  storeId: number;
  storeName: string;
  storeAddress: string;
  pickupType: PickupType;
  status: OrderStatus;
  vehicleDetails?: string;
  curbsideBayNumber?: number;
  lockerPinCode?: string;
  lockerBoxNumber?: string;
  pickupToken: string;
  qrCodeBase64: string;
  totalAmount: number;
  createdAt: string;
  reservationExpiresAt: string;
  fulfilledAt?: string;
  items: OrderItem[];
}

export interface CreateBopisOrderPayload {
  storeId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupType: PickupType;
  vehicleDetails?: string;
  curbsideBayNumber?: number;
  items: { productId: number; quantity: number }[];
}
