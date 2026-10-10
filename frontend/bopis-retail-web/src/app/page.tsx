"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import StoreSelectorModal from "@/components/StoreSelectorModal";
import { useStore } from "@/context/StoreContext";
import { fetchProducts } from "@/services/api";
import { Product } from "@/types";
import {
  Clock,
  Car,
  Box,
  MapPin,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const { currentStore } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      if (!currentStore) return;
      setIsLoading(true);
      try {
        const data = await fetchProducts(currentStore.id, selectedCategory, searchQuery);
        setProducts(data);

        // Derive unique categories
        if (categories.length === 0) {
          const uniqueCats = Array.from(new Set(data.map((p) => p.category)));
          setCategories(["All", ...uniqueCats]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, [currentStore, selectedCategory, searchQuery]);

  const displayedProducts = inStockOnly
    ? products.filter((p) => (p.availableQuantity ?? 0) > 0)
    : products;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl retail-gradient p-8 sm:p-12 text-white overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-retail-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-retail-500/20 border border-retail-500/30 text-retail-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Omnichannel BOPIS Engine (.NET + Next.js)
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Pick Up from the Shelf in <span className="text-retail-400">1 Hour</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Real-time shelf inventory, indoor aisle navigation guides, and contactless curbside pickup. Powered by ASP.NET Core 8 concurrency locks and Next.js.
            </p>

            {currentStore && (
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 backdrop-blur-sm">
                  <MapPin className="w-4 h-4 text-retail-400 shrink-0" />
                  <span>
                    Browsing: <strong className="text-white">{currentStore.name}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setIsStoreModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Change Store</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BOPIS Feature Value Props */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-retail-50 text-retail-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">1-Hour Ready</h4>
              <p className="text-[11px] text-slate-500">Staged & held for 24h</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Contactless Curbside</h4>
              <p className="text-[11px] text-slate-500">Bays 1-8 trunk delivery</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">24/7 Smart Locker</h4>
              <p className="text-[11px] text-slate-500">PIN & barcode pass unlock</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Aisle Wayfinding</h4>
              <p className="text-[11px] text-slate-500">Exact shelf coordinates</p>
            </div>
          </div>
        </div>

        {/* Filter Bar: Categories & In-Stock Only */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle: In-Stock at my store only */}
          <div className="flex items-center gap-2.5 shrink-0">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-retail-600 focus:ring-retail-500 border-slate-300"
              />
              <span>In Stock at {currentStore?.name?.split(" ")[0] || "Store"} Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Available Items ({displayedProducts.length})
            </h2>
            <span className="text-xs text-slate-500">
              Showing live inventory at <strong>{currentStore?.name}</strong>
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4 animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
              <p className="font-bold text-slate-800 text-base">No items match your filter criteria.</p>
              <p className="text-xs text-slate-500">
                Try switching categories or unchecking &quot;In Stock Only&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Store Selector Modal */}
      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />
    </div>
  );
}
