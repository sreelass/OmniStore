"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { createBopisOrder } from "@/services/api";
import { PickupType } from "@/types";
import {
  X,
  ShoppingBag,
  Trash2,
  Store,
  Car,
  Box,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, currentStore } = useStore();

  const [pickupType, setPickupType] = useState<PickupType>("StoreCounter");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState("");
  const [curbsideBay, setCurbsideBay] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const order = await createBopisOrder({
        storeId: currentStore.id,
        customerName: customerName || "Valued Shopper",
        customerEmail: customerEmail || "shopper@example.com",
        customerPhone: customerPhone || "(555) 019-2834",
        pickupType,
        vehicleDetails: pickupType === "Curbside" ? vehicleDetails || "Silver SUV" : undefined,
        curbsideBayNumber: pickupType === "Curbside" ? curbsideBay : undefined,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      onClose();
      router.push(`/orders/${order.orderNumber}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place BOPIS reservation";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-retail-400" />
              <h2 className="text-base font-bold">1-Hour Pickup Bag</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Store Banner */}
          {currentStore && (
            <div className="bg-retail-50 border-b border-retail-100 px-6 py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-retail-800 font-semibold">
                <Store className="w-4 h-4 text-retail-600 shrink-0" />
                <span className="truncate max-w-[240px]">{currentStore.name}</span>
              </div>
              <span className="text-retail-600 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Ready in 1h
              </span>
            </div>
          )}

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold">Reservation Error</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Your Pickup Bag is empty</h3>
                <p className="text-xs text-slate-500">
                  Select items from the catalog to reserve them for in-store pickup.
                </p>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Reserved Shelf Items ({cart.length})
                  </h3>
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate">
                          {item.product.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="text-retail-700 font-semibold">
                            📍 {item.product.aisleLocation}
                          </span>
                          <span>•</span>
                          <span>${item.product.price.toFixed(2)} each</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-1 font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pickup Method Selection */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select Pickup Experience
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPickupType("StoreCounter")}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        pickupType === "StoreCounter"
                          ? "border-retail-600 bg-retail-50 text-retail-900 font-bold shadow-sm"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600 text-xs"
                      }`}
                    >
                      <Store className="w-5 h-5 text-retail-600" />
                      <span className="text-xs">Counter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPickupType("Curbside")}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        pickupType === "Curbside"
                          ? "border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600 text-xs"
                      }`}
                    >
                      <Car className="w-5 h-5 text-blue-600" />
                      <span className="text-xs">Curbside</span>
                    </button>

                    <button
                      type="button"
                      disabled={!currentStore?.smartLockersAvailable}
                      onClick={() => setPickupType("SmartLocker")}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        !currentStore?.smartLockersAvailable
                          ? "opacity-40 cursor-not-allowed border-slate-100 text-slate-400"
                          : pickupType === "SmartLocker"
                          ? "border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-sm"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600 text-xs"
                      }`}
                    >
                      <Box className="w-5 h-5 text-purple-600" />
                      <span className="text-xs">24/7 Locker</span>
                    </button>
                  </div>

                  {pickupType === "Curbside" && (
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2 text-xs">
                      <p className="font-semibold text-blue-900">Curbside Details</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Car (e.g. Red Toyota RAV4)"
                          value={vehicleDetails}
                          onChange={(e) => setVehicleDetails(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-200 rounded-lg outline-none"
                        />
                        <select
                          value={curbsideBay}
                          onChange={(e) => setCurbsideBay(parseInt(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-200 rounded-lg outline-none"
                        >
                          {Array.from({ length: currentStore?.curbsideBays || 8 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Parking Bay #{i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {pickupType === "SmartLocker" && (
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-800 flex items-center gap-2">
                      <Box className="w-4 h-4 shrink-0 text-purple-600" />
                      <span>
                        A 6-digit secure PIN and scannable barcode will be issued on your pass.
                      </span>
                    </div>
                  )}
                </div>

                {/* Customer Contact Details */}
                <form id="bopis-form" onSubmit={handleCheckout} className="space-y-2.5 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Pickup Contact Info
                  </h3>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (for order verification)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-retail-600"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email (for digital QR pass)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-retail-600"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Phone (for pickup SMS ready alert)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-retail-600"
                  />
                </form>
              </>
            )}
          </div>

          {/* Drawer Footer / Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Store Shelf Items Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>1-Hour BOPIS Pickup Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-extrabold text-base">
                  <span>Estimated Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="bopis-form"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-retail-600 hover:bg-retail-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-retail-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Reserving Shelf Stock...</span>
                ) : (
                  <>
                    <span>Confirm 1-Hour BOPIS Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-retail-600" />
                <span>Stock is locked immediately via EF Core concurrency tokens</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
