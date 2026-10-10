namespace BopisRetail.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public double Rating { get; set; } = 4.8;
    public int ReviewCount { get; set; } = 124;

    public List<StoreInventory> Inventories { get; set; } = new();
}
