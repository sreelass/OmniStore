"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import StoreSelectorModal from "./StoreSelectorModal";
import { MapPin, ShoppingBag, Store, ChevronDown, Clock, Search } from "lucide-react";

interface Props {
  onOpenCart: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function Header({ onOpenCart, searchQuery = "", onSearchChange }: Props) {
  const { currentStore, cartItemCount } = useStore();
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        {/* Top Mini Bar with Store Status */}
        <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-retail-400 font-semibold">
                <Clock className="w-3.5 h-3.5" /> 1-Hour In-Store Pickup Guaranteed
              </span>
              <span className="hidden sm:inline text-slate-500">|</span>
              <span className="hidden sm:inline text-slate-300">
                Contactless Curbside & 24/7 Smart Lockers Available
              </span>
            </div>

            {currentStore && (
              <button
                onClick={() => setIsStoreModalOpen(true)}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              >
                <span>Store Hours: {currentStore.openingHours}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-retail-600 text-white flex items-center justify-center font-extrabold shadow-md group-hover:bg-retail-700 transition-colors">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900">OmniStore</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-retail-100 text-retail-800">
                  BOPIS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none">Click & Collect Retail Hub</p>
            </div>
          </Link>

          {/* Active Store Picker Button */}
          <button
            onClick={() => setIsStoreModalOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-retail-100 text-retail-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                Your Pickup Store <ChevronDown className="w-3 h-3" />
              </div>
              <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                {currentStore ? currentStore.name : "Select a Store"}
              </div>
            </div>
          </button>

          {/* Search bar */}
          {onSearchChange && (
            <div className="hidden lg:flex items-center flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tools, smart home, appliances, SKUs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 border border-transparent focus:border-retail-500 focus:bg-white rounded-xl outline-none transition-all"
              />
            </div>
          )}

          {/* Right Action: Cart Drawer Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStoreModalOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <MapPin className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-retail-400" />
              <span className="hidden sm:inline">Pickup Bag</span>
              {cartItemCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-extrabold bg-retail-500 text-slate-950 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Store Selector Modal */}
      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />
    </>
  );
}
