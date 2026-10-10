namespace BopisRetail.Api.Models;

public enum PickupType
{
    StoreCounter,
    Curbside,
    SmartLocker
}

public enum OrderStatus
{
    Reserved,           // Order placed, store holding stock
    ReadyForPickup,     // Associate staged items at desk/locker
    CustomerArrived,    // Curbside customer checked in at bay
    Completed,          // Handed over / Locker unlocked
    Expired,            // Reservation expired, stock returned to shelf
    Cancelled           // Explicitly cancelled
}

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty; // e.g. "BOPIS-83921"
    
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;

    public int StoreId { get; set; }
    public Store? Store { get; set; }

    public PickupType PickupType { get; set; } = PickupType.StoreCounter;
    public OrderStatus Status { get; set; } = OrderStatus.ReadyForPickup;

    // Curbside info (if applicable)
    public string? VehicleDetails { get; set; } // e.g. "Blue Honda Civic"
    public int? CurbsideBayNumber { get; set; }

    // Smart Locker pin (if applicable)
    public string? LockerPinCode { get; set; } // e.g. "492015"
    public string? LockerBoxNumber { get; set; } // e.g. "Locker #14"

    // Digital pass data
    public string PickupToken { get; set; } = string.Empty;
    public string QrCodeBase64 { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ReservationExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
    public DateTime? FulfilledAt { get; set; }

    public List<OrderItem> Items { get; set; } = new();
}
