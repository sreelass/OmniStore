using BopisRetail.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BopisRetail.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Store> Stores => Set<Store>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<StoreInventory> StoreInventories => Set<StoreInventory>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // StoreInventory configuration
        modelBuilder.Entity<StoreInventory>()
            .HasIndex(si => new { si.StoreId, si.ProductId })
            .IsUnique();

        modelBuilder.Entity<StoreInventory>()
            .Property(si => si.ConcurrencyToken)
            .IsConcurrencyToken();

        // Seed Stores
        modelBuilder.Entity<Store>().HasData(
            new Store
            {
                Id = 1,
                Name = "Downtown Flagship Center",
                Address = "500 N Michigan Ave",
                City = "Chicago",
                PostalCode = "60611",
                Latitude = 41.8919,
                Longitude = -87.6243,
                OpeningHours = "7:00 AM - 10:00 PM",
                Phone = "(312) 555-0140",
                PickupInstructions = "Express counter is located at Front Entrance East. Curbside bays 1-8 are in the North parking lot.",
                CurbsideBays = 8,
                SmartLockersAvailable = true
            },
            new Store
            {
                Id = 2,
                Name = "Metro Galleria Superstore",
                Address = "100 Oakbrook Center",
                City = "Oak Brook",
                PostalCode = "60523",
                Latitude = 41.8536,
                Longitude = -87.9547,
                OpeningHours = "8:00 AM - 9:00 PM",
                Phone = "(630) 555-0199",
                PickupInstructions = "Pick up at Customer Care desk Level 1. 24/7 Smart Lockers are accessible from the West exterior entrance.",
                CurbsideBays = 12,
                SmartLockersAvailable = true
            },
            new Store
            {
                Id = 3,
                Name = "Northside Logistics Hub",
                Address = "2200 Central St",
                City = "Evanston",
                PostalCode = "60201",
                Latitude = 42.0638,
                Longitude = -87.7088,
                OpeningHours = "6:00 AM - 9:00 PM",
                Phone = "(847) 555-0182",
                PickupInstructions = "Commercial & Retail pickup counter at Gate B. Curbside stalls 1-6 near main lobby.",
                CurbsideBays = 6,
                SmartLockersAvailable = false
            }
        );

        // Seed Products
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = 1,
                Sku = "DW-20V-DRILL",
                Title = "DeWalt 20V MAX Cordless Compact Drill Kit",
                Category = "Power Tools",
                Price = 129.99m,
                Brand = "DeWalt",
                Rating = 4.9,
                ReviewCount = 428,
                ImageUrl = "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
                Description = "High-performance motor delivers 300 unit watts out of power ability completing a wide range of applications. Includes 2 batteries, charger, and contractor bag."
            },
            new Product
            {
                Id = 2,
                Sku = "MW-M18-IMPACT",
                Title = "Milwaukee M18 FUEL 1/4\" Hex Impact Driver",
                Category = "Power Tools",
                Price = 149.00m,
                Brand = "Milwaukee",
                Rating = 4.9,
                ReviewCount = 312,
                ImageUrl = "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=600&q=80",
                Description = "Fastest driving speed without sacrificing power or control. Ultimate trigger control with smooth acceleration for small fasteners."
            },
            new Product
            {
                Id = 3,
                Sku = "NEST-LRN-THERM",
                Title = "Google Nest Learning Thermostat (4th Gen)",
                Category = "Smart Home",
                Price = 249.99m,
                Brand = "Google",
                Rating = 4.7,
                ReviewCount = 890,
                ImageUrl = "https://images.unsplash.com/photo-1567928815116-f7614d935e4d?auto=format&fit=crop&w=600&q=80",
                Description = "Programs itself and pays for itself. Learns your favorite temperatures and adjusts automatically when you leave the house."
            },
            new Product
            {
                Id = 4,
                Sku = "DYS-V12-SLIM",
                Title = "Dyson V12 Detect Slim Cordless Vacuum",
                Category = "Home & Cleaning",
                Price = 549.99m,
                Brand = "Dyson",
                Rating = 4.8,
                ReviewCount = 650,
                ImageUrl = "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
                Description = "Engineered for homes with pets. Fluffy Optic cleaner head reveals invisible dust on hard floors, with piezoelectric sensor measuring particle count."
            },
            new Product
            {
                Id = 5,
                Sku = "RNG-VDB-PRO",
                Title = "Ring Video Doorbell Pro 2 (Hardwired/Battery)",
                Category = "Smart Home",
                Price = 199.99m,
                Brand = "Ring",
                Rating = 4.6,
                ReviewCount = 540,
                ImageUrl = "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
                Description = "Head-to-toe HD+ video, 3D motion detection, and bird's eye view. Built-in Alexa greetings and two-way talk with noise cancellation."
            },
            new Product
            {
                Id = 6,
                Sku = "YETI-TND-45",
                Title = "Yeti Tundra 45 Hard Cooler - Desert Tan",
                Category = "Outdoor & Gear",
                Price = 325.00m,
                Brand = "Yeti",
                Rating = 4.9,
                ReviewCount = 780,
                ImageUrl = "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80",
                Description = "Indestructible rotomolded construction with up to 3 inches of PermaFrost insulation for unmatched ice retention."
            },
            new Product
            {
                Id = 7,
                Sku = "MAK-18V-CSAW",
                Title = "Makita 18V LXT Brushless 6-1/2\" Circular Saw",
                Category = "Power Tools",
                Price = 179.00m,
                Brand = "Makita",
                Rating = 4.8,
                ReviewCount = 210,
                ImageUrl = "https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=600&q=80",
                Description = "Automatic speed change technology adjusts cutting speed and torque during cut for optimum performance."
            },
            new Product
            {
                Id = 8,
                Sku = "BSH-GLM-165",
                Title = "Bosch BLAZE 165-ft Laser Distance Measure",
                Category = "Hardware",
                Price = 59.97m,
                Brand = "Bosch",
                Rating = 4.7,
                ReviewCount = 395,
                ImageUrl = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
                Description = "Pocket-sized laser measure with backlit color display, real-time measuring mode, and extreme precision within 1/16th of an inch."
            }
        );

        // Seed Store Inventories with realistic retail stock and aisle coordinates
        modelBuilder.Entity<StoreInventory>().HasData(
            // Store 1: Downtown Flagship
            new StoreInventory { Id = 1, StoreId = 1, ProductId = 1, QuantityOnHand = 14, ReservedQuantity = 0, AisleLocation = "Aisle 4, Bay B", Department = "Hardware", ShelfCoordinate = "Shelf 2, Mid-Level", ConcurrencyToken = "token-1-1" },
            new StoreInventory { Id = 2, StoreId = 1, ProductId = 2, QuantityOnHand = 8, ReservedQuantity = 0, AisleLocation = "Aisle 4, Bay C", Department = "Hardware", ShelfCoordinate = "Shelf 1, Eye-Level", ConcurrencyToken = "token-1-2" },
            new StoreInventory { Id = 3, StoreId = 1, ProductId = 3, QuantityOnHand = 5, ReservedQuantity = 0, AisleLocation = "Aisle 8, Bay A", Department = "Smart Home", ShelfCoordinate = "Endcap Display", ConcurrencyToken = "token-1-3" },
            new StoreInventory { Id = 4, StoreId = 1, ProductId = 4, QuantityOnHand = 3, ReservedQuantity = 1, AisleLocation = "Aisle 12, Bay D", Department = "Appliances", ShelfCoordinate = "Shelf 3, Top", ConcurrencyToken = "token-1-4" },
            new StoreInventory { Id = 5, StoreId = 1, ProductId = 5, QuantityOnHand = 9, ReservedQuantity = 0, AisleLocation = "Aisle 8, Bay C", Department = "Smart Home", ShelfCoordinate = "Shelf 2, Mid-Level", ConcurrencyToken = "token-1-5" },
            new StoreInventory { Id = 6, StoreId = 1, ProductId = 6, QuantityOnHand = 2, ReservedQuantity = 0, AisleLocation = "Aisle 16, Bay A", Department = "Outdoor", ShelfCoordinate = "Floor Pallet", ConcurrencyToken = "token-1-6" }, // Low stock!
            new StoreInventory { Id = 7, StoreId = 1, ProductId = 7, QuantityOnHand = 6, ReservedQuantity = 0, AisleLocation = "Aisle 4, Bay E", Department = "Hardware", ShelfCoordinate = "Shelf 2, Mid-Level", ConcurrencyToken = "token-1-7" },
            new StoreInventory { Id = 8, StoreId = 1, ProductId = 8, QuantityOnHand = 18, ReservedQuantity = 0, AisleLocation = "Aisle 3, Bay A", Department = "Hand Tools", ShelfCoordinate = "Hook #14", ConcurrencyToken = "token-1-8" },

            // Store 2: Metro Galleria
            new StoreInventory { Id = 9, StoreId = 2, ProductId = 1, QuantityOnHand = 22, ReservedQuantity = 2, AisleLocation = "Aisle 6, Bay A", Department = "Hardware", ShelfCoordinate = "Shelf 2, Mid-Level", ConcurrencyToken = "token-2-1" },
            new StoreInventory { Id = 10, StoreId = 2, ProductId = 2, QuantityOnHand = 11, ReservedQuantity = 0, AisleLocation = "Aisle 6, Bay B", Department = "Hardware", ShelfCoordinate = "Shelf 1, Eye-Level", ConcurrencyToken = "token-2-2" },
            new StoreInventory { Id = 11, StoreId = 2, ProductId = 3, QuantityOnHand = 7, ReservedQuantity = 0, AisleLocation = "Aisle 10, Bay D", Department = "Smart Home", ShelfCoordinate = "Endcap Display", ConcurrencyToken = "token-2-3" },
            new StoreInventory { Id = 12, StoreId = 2, ProductId = 4, QuantityOnHand = 0, ReservedQuantity = 0, AisleLocation = "Aisle 15, Bay B", Department = "Appliances", ShelfCoordinate = "Display Only", ConcurrencyToken = "token-2-4" }, // Out of stock!
            new StoreInventory { Id = 13, StoreId = 2, ProductId = 5, QuantityOnHand = 12, ReservedQuantity = 0, AisleLocation = "Aisle 10, Bay A", Department = "Smart Home", ShelfCoordinate = "Shelf 2, Mid-Level", ConcurrencyToken = "token-2-5" },
            new StoreInventory { Id = 14, StoreId = 2, ProductId = 6, QuantityOnHand = 10, ReservedQuantity = 0, AisleLocation = "Aisle 20, Bay C", Department = "Outdoor", ShelfCoordinate = "Floor Pallet", ConcurrencyToken = "token-2-6" },
            new StoreInventory { Id = 15, StoreId = 2, ProductId = 7, QuantityOnHand = 4, ReservedQuantity = 0, AisleLocation = "Aisle 6, Bay D", Department = "Hardware", ShelfCoordinate = "Shelf 2, Mid-Level", ConcurrencyToken = "token-2-7" },
            new StoreInventory { Id = 16, StoreId = 2, ProductId = 8, QuantityOnHand = 15, ReservedQuantity = 0, AisleLocation = "Aisle 2, Bay B", Department = "Hand Tools", ShelfCoordinate = "Hook #08", ConcurrencyToken = "token-2-8" },

            // Store 3: Northside Logistics Hub
            new StoreInventory { Id = 17, StoreId = 3, ProductId = 1, QuantityOnHand = 35, ReservedQuantity = 0, AisleLocation = "Aisle 2, Bay 1", Department = "Pro Contractor", ShelfCoordinate = "Rack Level 1", ConcurrencyToken = "token-3-1" },
            new StoreInventory { Id = 18, StoreId = 3, ProductId = 2, QuantityOnHand = 20, ReservedQuantity = 0, AisleLocation = "Aisle 2, Bay 2", Department = "Pro Contractor", ShelfCoordinate = "Rack Level 1", ConcurrencyToken = "token-3-2" },
            new StoreInventory { Id = 19, StoreId = 3, ProductId = 3, QuantityOnHand = 1, ReservedQuantity = 0, AisleLocation = "Aisle 5, Bay 3", Department = "Electrical", ShelfCoordinate = "Bin #4", ConcurrencyToken = "token-3-3" }, // Last 1 remaining!
            new StoreInventory { Id = 20, StoreId = 3, ProductId = 4, QuantityOnHand = 4, ReservedQuantity = 0, AisleLocation = "Aisle 8, Bay 1", Department = "General", ShelfCoordinate = "Rack Level 2", ConcurrencyToken = "token-3-4" },
            new StoreInventory { Id = 21, StoreId = 3, ProductId = 5, QuantityOnHand = 6, ReservedQuantity = 0, AisleLocation = "Aisle 5, Bay 1", Department = "Electrical", ShelfCoordinate = "Bin #9", ConcurrencyToken = "token-3-5" },
            new StoreInventory { Id = 22, StoreId = 3, ProductId = 6, QuantityOnHand = 8, ReservedQuantity = 0, AisleLocation = "Aisle 12, Bay 4", Department = "Outdoor", ShelfCoordinate = "Floor Stack", ConcurrencyToken = "token-3-6" },
            new StoreInventory { Id = 23, StoreId = 3, ProductId = 7, QuantityOnHand = 14, ReservedQuantity = 0, AisleLocation = "Aisle 2, Bay 3", Department = "Pro Contractor", ShelfCoordinate = "Rack Level 1", ConcurrencyToken = "token-3-7" },
            new StoreInventory { Id = 24, StoreId = 3, ProductId = 8, QuantityOnHand = 25, ReservedQuantity = 0, AisleLocation = "Aisle 1, Bay 2", Department = "Hardware", ShelfCoordinate = "Bin #12", ConcurrencyToken = "token-3-8" }
        );
    }
}
