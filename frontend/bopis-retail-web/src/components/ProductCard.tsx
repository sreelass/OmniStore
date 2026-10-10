"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { useStore } from "@/context/StoreContext";
import { CheckCircle2, AlertTriangle, XCircle, MapPin, Star, ShoppingBag } from "lucide-react";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { currentStore, addToCart } = useStore();

  const isAvailable = (product.availableQuantity ?? 0) > 0;
  const isLowStock = isAvailable && (product.availableQuantity ?? 0) <= 3;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all flex flex-col">
      {/* Product Image & Stock Badge */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3">
          {isAvailable ? (
            isLowStock ? (
              <span className="inline-flex items-center gap-1 bg-amber-500/95 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
                <AlertTriangle className="w-3.5 h-3.5" /> Only {product.availableQuantity} Left!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-600/95 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pick Up in 1 Hr
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 bg-rose-600/95 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              <XCircle className="w-3.5 h-3.5" /> Out of Stock Here
            </span>
          )}
        </div>

        <span className="absolute bottom-3 right-3 text-[11px] font-semibold bg-white/90 text-slate-800 px-2 py-0.5 rounded shadow-sm">
          {product.category}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700 uppercase tracking-wider">{product.brand}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
              <span className="text-slate-400">({product.reviewCount})</span>
            </div>
          </div>

          <Link href={`/product/${product.id}`} className="hover:text-retail-700 transition-colors">
            <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Store Inventory & Aisle Location info */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-xs">
            {isAvailable ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-retail-600 shrink-0" />
                  {product.aisleLocation}
                </span>
                <span className="font-bold text-emerald-700">
                  {product.availableQuantity} in stock
                </span>
              </div>
            ) : (
              <div className="text-slate-500 italic text-[11px]">
                Not in stock at {currentStore?.name}. Check nearby branches.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">BOPIS Price</span>
              <span className="text-lg font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/product/${product.id}`}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Aisle Map
              </Link>
              
              <button
                disabled={!isAvailable}
                onClick={() => addToCart(product, 1)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  isAvailable
                    ? "bg-retail-600 hover:bg-retail-700 text-white shadow-sm hover:shadow"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Reserve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
