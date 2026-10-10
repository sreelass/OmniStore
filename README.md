# OmniStore Retail — Omnichannel "Click & Collect" (BOPIS) Platform

An enterprise-grade **Buy Online, Pick Up In Store (BOPIS)** application built with **Next.js 14 (React)** and **ASP.NET Core 8 Web API**.

Designed for high-performance retail operations (similar to Target, Home Depot, and Sephora), connecting digital shoppers directly to physical retail shelves with live stock availability, indoor aisle wayfinding, concurrency-safe inventory holds, and digital QR passes.

---

## Architecture Stack

| Tier | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router, React 18, Tailwind CSS)** | Store Selector, Localized Catalog, Interactive Aisle Map Blueprint, Curbside Check-in, Scannable QR Pass, Associate Scanner Simulator |
| **Backend** | **ASP.NET Core 8 Web API** | Store-level stock tracking, Concurrency Locks (`RowVersion`), QRCoder generation, Automated Reservation Expiry Background Worker |
| **Database** | **Entity Framework Core (SQLite)** | Seeded with 3 realistic retail store branches, 8+ products with department & aisle shelf coordinates |

---

## Features & Capabilities

1. **Multi-Store Physical Inventory:**
   * Switch between physical branches: *Downtown Flagship Center*, *Metro Galleria Superstore*, and *Northside Logistics Hub*.
   * Live stock counts update instantly based on the selected store.
2. **Indoor Aisle Wayfinding Guide:**
   * Interactive store floor blueprint showing aisles (1 to 16), curbside pickup bays, and 24/7 smart lockers.
   * Pinpoints exact shelf location (e.g., *Power Tools — Aisle 4, Bay B, Shelf 2*).
3. **Optimistic Concurrency & Inventory Reservation:**
   * Uses EF Core concurrency tokens to prevent overselling contending items.
   * Stock is reserved immediately upon order placement.
4. **Digital Pickup Pass (Mobile Wallet Style):**
   * High-resolution scannable QR code generated server-side.
   * 3 Pickup Options:
     * **In-Store Counter**
     * **Contactless Curbside Pickup** (Vehicle Make/Color & Bay number check-in)
     * **24/7 Smart Locker** (Unique 6-digit PIN and Locker box number)
5. **Interactive Store Associate Scanner Simulator:**
   * Built-in toggle on the pickup pass allowing you to test the complete order lifecycle: scan QR code $\to$ verify token $\to$ mark fulfilled $\to$ permanently deduct shelf stock.
6. **Automated Expiry Worker (`BackgroundService`):**
   * Periodic background task that releases abandoned reservations back to the shelf if uncollected.

---

## Quick Start Guide

### Prerequisites
* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js v18+](https://nodejs.org/)

### 1. Start the Backend API (Port 5050)
```powershell
cd C:\Sree\AntiGravity\BOPIS\bopis-retail-store\backend
dotnet run
```
* **API Endpoints:** `http://localhost:5050/api`
* **Swagger UI:** `http://localhost:5050/swagger`

### 2. Start the Next.js Frontend (Port 3000)
```powershell
cd C:\Sree\AntiGravity\BOPIS\bopis-retail-store\frontend\bopis-retail-web
npm run dev
```
* Open **`http://localhost:3000`** in your browser.

---

## Solution Structure

```
bopis-retail-store/
├── backend/                         # ASP.NET Core 8 Web API
│   ├── Controllers/                 # StoresController, ProductsController, OrdersController
│   ├── Data/                        # AppDbContext (SQLite) with Seed Data
│   ├── DTOs/                        # API Request & Response Contracts
│   ├── Models/                      # Store, Product, StoreInventory, Order, OrderItem
│   ├── Services/                    # InventoryReservationService, PickupPassService, ReservationExpiryWorker
│   └── Program.cs                   # DI, SQLite, CORS & Swagger configuration
│
└── frontend/bopis-retail-web/       # Next.js 14 App Router
    ├── src/
    │   ├── app/                     # Next.js Pages (/, /product/[id], /orders/[orderNumber])
    │   ├── components/              # Header, ProductCard, AisleWayfinderMap, CartDrawer, StoreSelectorModal
    │   ├── context/                 # StoreContext (Active store preference & bag state)
    │   ├── services/                # api.ts (Backend HTTP client)
    │   └── types/                   # TypeScript domain models
    ├── package.json
    └── tailwind.config.ts
```
