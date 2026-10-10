"use client";

import React from "react";
import { Navigation, MapPin, Box, Car, Store as StoreIcon } from "lucide-react";

interface Props {
  aisleLocation?: string;
  department?: string;
  shelfCoordinate?: string;
  storeName?: string;
}

export default function AisleWayfinderMap({
  aisleLocation = "Aisle 4, Bay B",
  department = "Hardware",
  shelfCoordinate = "Shelf 2, Mid-Level",
  storeName = "Store",
}: Props) {
  // Extract aisle number if present (e.g. "Aisle 4" -> 4)
  const aisleMatch = aisleLocation.match(/Aisle\s+(\d+)/i);
  const activeAisleNum = aisleMatch ? parseInt(aisleMatch[1]) : 4;

  const aisles = [
    { num: 1, dept: "Hardware" },
    { num: 2, dept: "Hardware" },
    { num: 3, dept: "Tools" },
    { num: 4, dept: "Power Tools" },
    { num: 5, dept: "Electrical" },
    { num: 6, dept: "Electrical" },
    { num: 7, dept: "Smart Home" },
    { num: 8, dept: "Smart Home" },
    { num: 9, dept: "Plumbing" },
    { num: 10, dept: "Plumbing" },
    { num: 11, dept: "Appliances" },
    { num: 12, dept: "Appliances" },
    { num: 13, dept: "Paint" },
    { num: 14, dept: "Paint" },
    { num: 15, dept: "Outdoor" },
    { num: 16, dept: "Outdoor" },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-retail-500 animate-pulse" />
          <div>
            <h4 className="font-bold text-sm text-slate-100">In-Store Aisle Wayfinder</h4>
            <p className="text-xs text-slate-400">Indoor navigation guide at {storeName}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-retail-600/30 border border-retail-500/50 text-retail-400 font-bold text-xs rounded-full">
            📍 {aisleLocation}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{shelfCoordinate}</p>
        </div>
      </div>

      {/* SVG Store Blueprint */}
      <div className="mt-4 relative bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        {/* Exterior Facility Annotations */}
        <div className="flex justify-between items-center text-[11px] text-slate-400 mb-3 px-2">
          <span className="flex items-center gap-1 text-blue-400">
            <Car className="w-3.5 h-3.5" /> Curbside Pickup Zone (North Bays)
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <Box className="w-3.5 h-3.5" /> 24/7 Smart Lockers (West)
          </span>
        </div>

        {/* Interior Grid Blueprint */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 py-2">
          {aisles.map((a) => {
            const isActive = a.num === activeAisleNum;
            return (
              <div
                key={a.num}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  isActive
                    ? "bg-retail-500/20 border-retail-500 shadow-lg shadow-retail-500/20 ring-2 ring-retail-400 scale-105"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-400"
                }`}
              >
                <span className={`text-xs font-mono font-bold ${isActive ? "text-retail-400" : "text-slate-300"}`}>
                  A-{a.num}
                </span>
                <span className="text-[9px] text-slate-500 truncate w-full mt-0.5">
                  {a.dept}
                </span>
                {isActive && (
                  <span className="mt-1 flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-retail-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-retail-500"></span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Entrance & Pickup Counter Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300 px-2">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <StoreIcon className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Main Entrance & Online Pickup Counter</span>
          </div>
          <span className="text-[11px] text-slate-500">Walk straight $\to$ Turn into Aisle {activeAisleNum}</span>
        </div>
      </div>
    </div>
  );
}
