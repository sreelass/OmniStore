using System.ComponentModel.DataAnnotations;

namespace BopisRetail.Api.Models;

public class StoreInventory
{
    public int Id { get; set; }
    
    public int StoreId { get; set; }
    public Store? Store { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int QuantityOnHand { get; set; }
    public int ReservedQuantity { get; set; }

    // Retail wayfinding coordinates
    public string AisleLocation { get; set; } = "Aisle 1, Bay A";
    public string Department { get; set; } = "General";
    public string ShelfCoordinate { get; set; } = "Shelf 2, Level B";

    // Optimistic Concurrency check token
    [ConcurrencyCheck]
    public string ConcurrencyToken { get; set; } = Guid.NewGuid().ToString();

    // Helper property
    public int AvailableToPromise => Math.Max(0, QuantityOnHand - ReservedQuantity);
}
