"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import AisleWayfinderMap from "@/components/AisleWayfinderMap";
import { useStore } from "@/context/StoreContext";
import { fetchProduct } from "@/services/api";
import { Product, StoreStockLookup } from "@/types";
import {
  ArrowLeft,
  Star,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  ShoppingBag,
  Store as StoreIcon,
  ChevronRight
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);

  const { currentStore, setCurrentStore, stores, addToCart } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [allStoresStock, setAllStoresStock] = useState<StoreStockLookup[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setIsLoading(true);
      try {
        const data = await fetchProduct(productId, currentStore?.id);
        setProduct(data.product);
        setAllStoresStock(data.allStoresStock);
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [productId, currentStore]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header onOpenCart={() => setIsCartOpen(true)} />
        <div className="flex-1 max-w-7xl w-full mx-auto p-8 animate-pulse space-y-8">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-slate-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-6 bg-slate-200 rounded w-1/4" />
              <div className="h-24 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header onOpenCart={() => setIsCartOpen(true)} />
        <div className="flex-1 max-w-2xl mx-auto p-12 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-retail-600 font-bold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = (product.availableQuantity ?? 0) > 0;
  const isLowStock = isAvailable && (product.availableQuantity ?? 0) <= 3;

  const handleSwitchStore = (storeId: number) => {
    const target = stores.find((s) => s.id === storeId);
    if (target) {
      setCurrentStore(target);
    }
  };

  const handleReserveNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Breadcrumb Nav */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Catalog
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>{product.category}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-[200px]">
            {product.title}
          </span>
        </div>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Product Image */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/95 rounded-full shadow-sm text-slate-800">
                {product.brand}
              </span>
            </div>
            <div className="text-center text-xs text-slate-400">
              SKU: <span className="font-mono text-slate-600">{product.sku}</span>
            </div>
          </div>

          {/* Center/Right: Product Details & BOPIS Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  {product.category}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.title}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">
                  Free 1-Hour Store Pickup
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Store In-Stock Card */}
            <div className="p-5 rounded-2xl border-2 border-slate-200 bg-white space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Selected Pickup Location
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <StoreIcon className="w-4 h-4 text-retail-600" />
                    {currentStore?.name}
                  </h3>
                  <p className="text-xs text-slate-500">{currentStore?.address}, {currentStore?.city}</p>
                </div>

                <div>
                  {isAvailable ? (
                    isLowStock ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5" /> Only {product.availableQuantity} Left!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {product.availableQuantity} in Stock
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      <XCircle className="w-3.5 h-3.5" /> Out of Stock at this store
                    </span>
                  )}
                </div>
              </div>

              {/* In-store location pill */}
              {isAvailable && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-retail-600 shrink-0" />
                    <span>
                      Located in: <strong>{product.department}</strong>, {product.aisleLocation} ({product.shelfCoordinate})
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-700">Ready in 60 Mins</span>
                </div>
              )}

              {/* Quantity & Reserve CTA */}
              <div className="pt-2 flex items-center gap-4">
                {isAvailable && (
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden text-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.availableQuantity || 1, quantity + 1))}
                      className="px-3 py-2 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  disabled={!isAvailable}
                  onClick={handleReserveNow}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    isAvailable
                      ? "bg-retail-600 hover:bg-retail-700 text-white shadow-retail-600/20 active:scale-[0.99]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isAvailable ? "Reserve for 1-Hour In-Store Pickup" : "Currently Unavailable at this Location"}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-retail-600" />
                <span>Reserved shelf items are staged immediately upon order submission</span>
              </div>
            </div>

            {/* In-Store Aisle Map Blueprint */}
            {isAvailable && (
              <AisleWayfinderMap
                aisleLocation={product.aisleLocation}
                department={product.department}
                shelfCoordinate={product.shelfCoordinate}
                storeName={currentStore?.name}
              />
            )}

            {/* Multi-Store Stock Availability Checker */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <StoreIcon className="w-4 h-4 text-slate-600" />
                Live Stock Across Nearby Branches
              </h3>

              <div className="space-y-2">
                {allStoresStock.map((s) => {
                  const isCurrent = currentStore?.id === s.storeId;
                  return (
                    <div
                      key={s.storeId}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isCurrent
                          ? "bg-retail-50/50 border-retail-200"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{s.storeName}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-retail-600 text-white px-2 py-0.5 rounded-full font-bold">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          {s.city} • {s.aisleLocation}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold ${
                            s.availableQuantity > 0 ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {s.availableQuantity > 0
                            ? `${s.availableQuantity} available`
                            : "Out of Stock"}
                        </span>

                        {!isCurrent && s.availableQuantity > 0 && (
                          <button
                            onClick={() => handleSwitchStore(s.storeId)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition-colors"
                          >
                            Switch Store
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
