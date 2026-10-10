"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { fetchOrder, checkInCurbside, fulfillOrder, cancelOrder } from "@/services/api";
import { Order } from "@/types";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  Box,
  Store,
  QrCode,
  ShieldCheck,
  AlertCircle,
  ScanLine,
  Check,
  RotateCcw,
  Sparkles
} from "lucide-react";

export default function OrderPassPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Curbside check-in state
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [carDetails, setCarDetails] = useState("");
  const [bayNumber, setBayNumber] = useState(3);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Store associate fulfillment simulator state
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [isAssociateMode, setIsAssociateMode] = useState(false);

  const loadOrder = async () => {
    if (!orderNumber) return;
    try {
      const data = await fetchOrder(orderNumber);
      setOrder(data);
      if (data.vehicleDetails) setCarDetails(data.vehicleDetails);
      if (data.curbsideBayNumber) setBayNumber(data.curbsideBayNumber);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  const handleCurbsideCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsCheckingIn(true);
    try {
      const updated = await checkInCurbside(order.orderNumber, carDetails || "Blue Sedan", bayNumber);
      setOrder(updated);
      setIsCheckInModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleFulfillOrder = async () => {
    if (!order) return;
    setIsFulfilling(true);
    try {
      const updated = await fulfillOrder(order.orderNumber);
      setOrder(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Fulfillment failed");
    } finally {
      setIsFulfilling(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this BOPIS order? Reserved items will be returned to the store shelf.")) return;
    try {
      const updated = await cancelOrder(order.orderNumber);
      setOrder(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header onOpenCart={() => {}} />
        <div className="flex-1 max-w-2xl mx-auto p-12 text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto" />
          <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header onOpenCart={() => {}} />
        <div className="flex-1 max-w-md mx-auto p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
          <p className="text-xs text-slate-500">{error || "Could not locate this pickup pass."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-retail-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === "Completed";
  const isCancelled = order.status === "Cancelled" || order.status === "Expired";
  const isArrived = order.status === "CustomerArrived";

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      <Header onOpenCart={() => {}} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Top Navigation & Simulator Banner */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shopping
          </Link>

          {/* Associate Scanner Mode Toggle */}
          <button
            onClick={() => setIsAssociateMode(!isAssociateMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isAssociateMode
                ? "bg-purple-600 text-white border-purple-700 shadow-md"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>{isAssociateMode ? "Hide Associate Scanner Simulator" : "Simulate Associate Scanner"}</span>
          </button>
        </div>

        {/* Store Associate Simulator Panel */}
        {isAssociateMode && (
          <div className="p-5 rounded-2xl bg-purple-950 text-white border border-purple-800 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Store Associate / Kiosk Scanner Simulator</h4>
                  <p className="text-xs text-purple-300">
                    Test the complete retail lifecycle: scan barcode, verify inventory hold, and complete order handover.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono bg-purple-900 px-2.5 py-1 rounded-md text-purple-200">
                Token: {order.pickupToken}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-purple-900">
              <div className="text-xs text-purple-300">
                Current State: <strong className="text-white uppercase">{order.status}</strong>
              </div>

              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                  <Check className="w-3.5 h-3.5" /> Handover Complete & Shelf Stock Deducted
                </span>
              ) : (
                <button
                  disabled={isFulfilling || isCancelled}
                  onClick={handleFulfillOrder}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  <ScanLine className="w-4 h-4" />
                  {isFulfilling ? "Verifying Token..." : "Scan & Mark Order Picked Up"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Digital Wallet Card / The BOPIS Pickup Pass */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden qr-card-shadow">
          {/* Card Header */}
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-retail-400">
                  Official Digital Pickup Pass
                </span>
                <span>•</span>
                <span className="font-mono text-xs text-slate-400">{order.orderNumber}</span>
              </div>
              <h1 className="text-2xl font-black text-white">
                {isCompleted
                  ? "Order Collected & Complete"
                  : isArrived
                  ? "Curbside Arrival Confirmed"
                  : "Ready for In-Store Pickup"}
              </h1>
              <p className="text-xs text-slate-300">
                Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
              </p>
            </div>

            {/* Status Badge */}
            <div>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4" /> COMPLETED
                </span>
              ) : isArrived ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse">
                  <Car className="w-4 h-4" /> AT BAY #{order.curbsideBayNumber}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-retail-500/20 text-retail-300 border border-retail-500/40">
                  <Clock className="w-4 h-4" /> STAGED AT STORE
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Scannable QR Code Pass */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-3">
              <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.qrCodeBase64}
                  alt={`QR Pass for ${order.orderNumber}`}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Scan at Counter or Locker
                </p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  ID: {order.pickupToken}
                </p>
              </div>

              {order.lockerPinCode && (
                <div className="w-full p-3 rounded-xl bg-purple-50 border border-purple-200 text-center space-y-0.5">
                  <div className="text-[10px] font-bold uppercase text-purple-700">
                    24/7 Smart Locker PIN
                  </div>
                  <div className="text-2xl font-black font-mono tracking-widest text-purple-950">
                    {order.lockerPinCode}
                  </div>
                  <div className="text-[11px] text-purple-700">
                    Location: <strong>{order.lockerBoxNumber}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Pickup Instructions & Curbside Actions */}
            <div className="md:col-span-7 space-y-6">
              {/* Pickup Location Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pickup Branch & Instructions
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Store className="w-4 h-4 text-retail-600 shrink-0" />
                    <span>{order.storeName}</span>
                  </div>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {order.storeAddress}
                  </p>
                  <p className="text-slate-500 pt-1 border-t border-slate-200">
                    Show this QR code at the service desk near the front entrance, or enter your locker PIN.
                  </p>
                </div>
              </div>

              {/* Curbside Check-in Feature */}
              {order.pickupType === "Curbside" && !isCompleted && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                      <Car className="w-4 h-4 text-blue-600" />
                      <span>Contactless Curbside Pickup</span>
                    </div>
                    {isArrived && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Checked In
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-blue-800">
                    {isArrived
                      ? `Associate notified! Delivering to: ${order.vehicleDetails} at Parking Bay #${order.curbsideBayNumber}.`
                      : "Park in one of the designated Curbside bays and tap the button below to notify our store associate."}
                  </p>

                  {!isArrived && (
                    <button
                      onClick={() => setIsCheckInModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      <Car className="w-4 h-4" />
                      <span>I Have Arrived at the Curbside Bay</span>
                    </button>
                  )}
                </div>
              )}

              {/* Reserved Order Items Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Reserved Items on Shelf ({order.items.length})
                </h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900">{item.productTitle}</h4>
                        <span className="text-slate-500 text-[11px]">
                          Location: <strong className="text-retail-700">{item.aisleLocation}</strong> • Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Timestamps */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  <span>Hold Expires: </span>
                  <strong className="text-slate-800">
                    {new Date(order.reservationExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">TOTAL AMOUNT</span>
                  <span className="text-lg font-black text-slate-900">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {!isCompleted && !isCancelled && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleCancelOrder}
                    className="text-xs text-slate-400 hover:text-rose-600 font-semibold transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Cancel Order & Release Stock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Curbside Check-In Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Car className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">Curbside Check-In</h3>
            </div>
            <p className="text-xs text-slate-600">
              Tell our associate which parking bay you are in and your vehicle description for trunk delivery.
            </p>

            <form onSubmit={handleCurbsideCheckIn} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Parking Bay Number
                </label>
                <select
                  value={bayNumber}
                  onChange={(e) => setBayNumber(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Curbside Bay #{i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Vehicle Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silver Honda CR-V"
                  value={carDetails}
                  onChange={(e) => setCarDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCheckingIn}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                >
                  {isCheckingIn ? "Notifying..." : "Notify Associate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
