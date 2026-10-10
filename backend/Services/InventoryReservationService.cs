using BopisRetail.Api.Data;
using BopisRetail.Api.DTOs;
using BopisRetail.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BopisRetail.Api.Services;

public class InventoryReservationService : IInventoryReservationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<InventoryReservationService> _logger;

    public InventoryReservationService(AppDbContext context, ILogger<InventoryReservationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<OrderItem>> ReserveInventoryAsync(int storeId, List<OrderItemRequest> items)
    {
        if (items == null || items.Count == 0)
        {
            throw new ArgumentException("No items provided for reservation.");
        }

        var productIds = items.Select(i => i.ProductId).Distinct().ToList();

        // Retry loop for optimistic concurrency conflicts
        const int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                var inventories = await _context.StoreInventories
                    .Include(si => si.Product)
                    .Where(si => si.StoreId == storeId && productIds.Contains(si.ProductId))
                    .ToListAsync();

                var orderItems = new List<OrderItem>();

                foreach (var reqItem in items)
                {
                    var inventory = inventories.FirstOrDefault(i => i.ProductId == reqItem.ProductId);
                    if (inventory == null || inventory.Product == null)
                    {
                        throw new InvalidOperationException($"Product ID {reqItem.ProductId} is not available at this store location.");
                    }

                    int available = inventory.QuantityOnHand - inventory.ReservedQuantity;
                    if (available < reqItem.Quantity)
                    {
                        throw new InvalidOperationException(
                            $"Insufficient stock for '{inventory.Product.Title}'. Requested: {reqItem.Quantity}, Available: {Math.Max(0, available)}.");
                    }

                    // Reserve inventory
                    inventory.ReservedQuantity += reqItem.Quantity;
                    inventory.ConcurrencyToken = Guid.NewGuid().ToString();

                    orderItems.Add(new OrderItem
                    {
                        ProductId = inventory.ProductId,
                        ProductTitle = inventory.Product.Title,
                        ProductSku = inventory.Product.Sku,
                        AisleLocation = inventory.AisleLocation,
                        UnitPrice = inventory.Product.Price,
                        Quantity = reqItem.Quantity
                    });
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully reserved {Count} items for store {StoreId}", items.Count, storeId);
                return orderItems;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning("Concurrency conflict detected while reserving inventory (Attempt {Attempt}/{MaxRetries}): {Message}", attempt, maxRetries, ex.Message);
                if (attempt == maxRetries)
                {
                    throw new InvalidOperationException("High demand detected: another customer reserved these items right as you were checking out. Please review availability and try again.", ex);
                }

                // Detach tracked entries and retry with fresh state
                _context.ChangeTracker.Clear();
                await Task.Delay(50 * attempt);
            }
        }

        throw new InvalidOperationException("Failed to reserve inventory due to high contention.");
    }

    public async Task ReleaseReservationAsync(int storeId, List<OrderItem> items)
    {
        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        var inventories = await _context.StoreInventories
            .Where(si => si.StoreId == storeId && productIds.Contains(si.ProductId))
            .ToListAsync();

        foreach (var item in items)
        {
            var inventory = inventories.FirstOrDefault(i => i.ProductId == item.ProductId);
            if (inventory != null)
            {
                inventory.ReservedQuantity = Math.Max(0, inventory.ReservedQuantity - item.Quantity);
                inventory.ConcurrencyToken = Guid.NewGuid().ToString();
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Released inventory reservation for store {StoreId}", storeId);
    }

    public async Task FulfillInventoryAsync(int storeId, List<OrderItem> items)
    {
        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        var inventories = await _context.StoreInventories
            .Where(si => si.StoreId == storeId && productIds.Contains(si.ProductId))
            .ToListAsync();

        foreach (var item in items)
        {
            var inventory = inventories.FirstOrDefault(i => i.ProductId == item.ProductId);
            if (inventory != null)
            {
                // Decrement both physical shelf stock and reservation count
                inventory.QuantityOnHand = Math.Max(0, inventory.QuantityOnHand - item.Quantity);
                inventory.ReservedQuantity = Math.Max(0, inventory.ReservedQuantity - item.Quantity);
                inventory.ConcurrencyToken = Guid.NewGuid().ToString();
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Fulfilled and deducted physical inventory for store {StoreId}", storeId);
    }
}
