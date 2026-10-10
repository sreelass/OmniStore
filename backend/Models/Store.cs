namespace BopisRetail.Api.Models;

public class Store
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string OpeningHours { get; set; } = "8:00 AM - 9:00 PM";
    public string Phone { get; set; } = string.Empty;
    public string PickupInstructions { get; set; } = "Head to the Online Pickup Desk near the entrance or use curbside bays 1-8.";
    public int CurbsideBays { get; set; } = 8;
    public bool SmartLockersAvailable { get; set; } = true;

    public List<StoreInventory> Inventories { get; set; } = new();
    public List<Order> Orders { get; set; } = new();
}
