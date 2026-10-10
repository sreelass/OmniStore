import { CreateBopisOrderPayload, Order, PickupType, Product, Store, StoreStockLookup } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

export async function fetchStores(userLat?: number, userLng?: number): Promise<Store[]> {
  const params = new URLSearchParams();
  if (userLat !== undefined && userLng !== undefined) {
    params.append("userLat", userLat.toString());
    params.append("userLng", userLng.toString());
  }

  const res = await fetch(`${API_BASE}/stores?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch store locations");
  return res.json();
}

export async function fetchStore(id: number): Promise<Store> {
  const res = await fetch(`${API_BASE}/stores/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch store ${id}`);
  return res.json();
}

export async function fetchProducts(storeId?: number, category?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (storeId) params.append("storeId", storeId.toString());
  if (category && category !== "All") params.append("category", category);
  if (search) params.append("search", search);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch catalog");
  return res.json();
}

export async function fetchProduct(id: number, storeId?: number): Promise<{ product: Product; allStoresStock: StoreStockLookup[] }> {
  const params = new URLSearchParams();
  if (storeId) params.append("storeId", storeId.toString());

  const res = await fetch(`${API_BASE}/products/${id}?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
  return res.json();
}

const pickupTypeEnumMap: Record<PickupType, number> = {
  StoreCounter: 0,
  Curbside: 1,
  SmartLocker: 2,
};

export async function createBopisOrder(payload: CreateBopisOrderPayload): Promise<Order> {
  let res: Response;
  const requestBody = {
    ...payload,
    pickupType: typeof payload.pickupType === "string"
      ? (pickupTypeEnumMap[payload.pickupType] ?? 0)
      : payload.pickupType,
  };

  try {
    res = await fetch(`${API_BASE}/orders/bopis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
  } catch (networkErr: unknown) {
    throw new Error("Cannot connect to backend API at " + API_BASE + ". Please ensure the .NET backend is running.");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    let errorMsg = errorData?.message || errorData?.title;
    if (errorData?.errors) {
      const details = Object.values(errorData.errors).flat().join("; ");
      if (details) errorMsg = details;
    }
    throw new Error(errorMsg || `Server error (${res.status}): Failed to place BOPIS reservation`);
  }

  return res.json();
}

export async function fetchOrder(orderNumber: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderNumber}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Order ${orderNumber} not found`);
  return res.json();
}

export async function checkInCurbside(orderNumber: string, vehicleDetails: string, curbsideBayNumber: number): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderNumber}/check-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicleDetails, curbsideBayNumber }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Check-in failed" }));
    throw new Error(err.message || "Check-in failed");
  }

  return res.json();
}

export async function fulfillOrder(orderNumber: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderNumber}/fulfill`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Fulfillment failed" }));
    throw new Error(err.message || "Fulfillment failed");
  }

  return res.json();
}

export async function cancelOrder(orderNumber: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderNumber}/cancel`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Cancellation failed" }));
    throw new Error(err.message || "Cancellation failed");
  }

  return res.json();
}
