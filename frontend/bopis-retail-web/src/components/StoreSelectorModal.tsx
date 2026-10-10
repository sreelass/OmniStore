"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { Store } from "@/types";
import { MapPin, Clock, Phone, Car, Box, X, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoreSelectorModal({ isOpen, onClose }: Props) {
  const { stores, currentStore, setCurrentStore } = useStore();

  if (!isOpen) return null;

  const handleSelectStore = (store: Store) => {
    setCurrentStore(store);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Select Your Pickup Store</h2>
            <p className="text-xs text-slate-300">Live inventory and 1-hour pickup depend on your selected location</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {stores.map((store) => {
            const isSelected = currentStore?.id === store.id;
            return (
              <div
                key={store.id}
                onClick={() => handleSelectStore(store)}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-retail-600 bg-retail-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{store.name}</h3>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-retail-600 text-white">
                          <Check className="w-3 h-3" /> Selected Store
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      {store.address}, {store.city}, {store.postalCode}
                    </p>
                  </div>
                  {store.distanceMiles && (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {store.distanceMiles} mi
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-retail-600 shrink-0" />
                    <span>{store.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{store.curbsideBays} Curbside Bays</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{store.smartLockersAvailable ? "24/7 Smart Lockers" : "Counter Only"}</span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500 italic bg-slate-100/70 p-2 rounded-lg">
                  {store.pickupInstructions}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
