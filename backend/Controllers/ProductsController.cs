using BopisRetail.Api.Data;
using BopisRetail.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BopisRetail.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] int? storeId,
        [FromQuery] string? category,
        [FromQuery] string? search)
    {
        var query = _context.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(p => p.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(searchLower) || 
                                     p.Brand.ToLower().Contains(searchLower) ||
                                     p.Sku.ToLower().Contains(searchLower));
        }

        var products = await query.ToListAsync();

        // If storeId is provided, join with that store's inventory
        Dictionary<int, Models.StoreInventory> inventoryMap = new();
        if (storeId.HasValue)
        {
            inventoryMap = await _context.StoreInventories
                .AsNoTracking()
                .Where(si => si.StoreId == storeId.Value)
                .ToDictionaryAsync(si => si.ProductId);
        }

        var result = products.Select(p =>
        {
            if (storeId.HasValue && inventoryMap.TryGetValue(p.Id, out var inv))
            {
                var avail = Math.Max(0, inv.QuantityOnHand - inv.ReservedQuantity);
                return new ProductDto(
                    p.Id,
                    p.Sku,
                    p.Title,
                    p.Category,
                    p.Price,
                    p.ImageUrl,
                    p.Description,
                    p.Brand,
                    p.Rating,
                    p.ReviewCount,
                    inv.QuantityOnHand,
                    inv.ReservedQuantity,
                    avail,
                    inv.AisleLocation,
                    inv.Department,
                    inv.ShelfCoordinate,
                    avail > 0
                );
            }

            return new ProductDto(
                p.Id,
                p.Sku,
                p.Title,
                p.Category,
                p.Price,
                p.ImageUrl,
                p.Description,
                p.Brand,
                p.Rating,
                p.ReviewCount
            );
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetProductById(int id, [FromQuery] int? storeId)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound(new { message = $"Product with ID {id} not found." });

        // Retrieve inventory across all stores for multi-store stock visibility
        var allStoreInventories = await _context.StoreInventories
            .Include(si => si.Store)
            .Where(si => si.ProductId == id)
            .ToListAsync();

        var storeStockList = allStoreInventories.Select(si => new StoreStockLookupDto(
            si.StoreId,
            si.Store?.Name ?? "Unknown Store",
            si.Store?.City ?? "",
            Math.Max(0, si.QuantityOnHand - si.ReservedQuantity),
            si.AisleLocation,
            (si.QuantityOnHand - si.ReservedQuantity) > 0
        )).ToList();

        var selectedInventory = storeId.HasValue 
            ? allStoreInventories.FirstOrDefault(si => si.StoreId == storeId.Value) 
            : null;

        var availableInSelectedStore = selectedInventory != null 
            ? Math.Max(0, selectedInventory.QuantityOnHand - selectedInventory.ReservedQuantity) 
            : 0;

        return Ok(new
        {
            Product = new ProductDto(
                product.Id,
                product.Sku,
                product.Title,
                product.Category,
                product.Price,
                product.ImageUrl,
                product.Description,
                product.Brand,
                product.Rating,
                product.ReviewCount,
                selectedInventory?.QuantityOnHand,
                selectedInventory?.ReservedQuantity,
                selectedInventory != null ? availableInSelectedStore : null,
                selectedInventory?.AisleLocation,
                selectedInventory?.Department,
                selectedInventory?.ShelfCoordinate,
                availableInSelectedStore > 0
            ),
            AllStoresStock = storeStockList
        });
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _context.Products
            .Select(p => p.Category)
            .Distinct()
            .ToListAsync();

        return Ok(categories);
    }
}
