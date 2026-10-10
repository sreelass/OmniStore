using BopisRetail.Api.Data;
using BopisRetail.Api.DTOs;
using BopisRetail.Api.Models;
using BopisRetail.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BopisRetail.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IInventoryReservationService _reservationService;
    private readonly IPickupPassService _pickupPassService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        AppDbContext context,
        IInventoryReservationService reservationService,
        IPickupPassService pickupPassService,
        ILogger<OrdersController> logger)
    {
        _context = context;
        _reservationService = reservationService;
        _pickupPassService = pickupPassService;
        _logger = logger;
    }

    [HttpPost("bopis")]
    public async Task<ActionResult<OrderResponseDto>> CreateBopisOrder([FromBody] CreateBopisOrderRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(new { message = "At least one item is required to place an order." });
        }

        var store = await _context.Stores.FindAsync(request.StoreId);
        if (store == null)
        {
            return NotFound(new { message = $"Store with ID {request.StoreId} does not exist." });
        }

        try
        {
            // Atomically reserve inventory with optimistic concurrency check
            var reservedItems = await _reservationService.ReserveInventoryAsync(request.StoreId, request.Items);

            var orderNumber = $"BOPIS-{Random.Shared.Next(100000, 999999)}";
            var pickupToken = _pickupPassService.GeneratePickupToken(orderNumber, request.StoreId);

            // Construct payload for the scannable QR Code pass
            var qrPayload = $"OMNI_PICKUP:{orderNumber}:{pickupToken}:STORE_{request.StoreId}";
            var qrCodeBase64 = _pickupPassService.GenerateQrCodeDataUrl(qrPayload);

            var totalAmount = reservedItems.Sum(i => i.Subtotal);

            var order = new Order
            {
                OrderNumber = orderNumber,
                CustomerName = request.CustomerName.Trim(),
                CustomerEmail = request.CustomerEmail.Trim(),
                CustomerPhone = request.CustomerPhone.Trim(),
                StoreId = request.StoreId,
                PickupType = request.PickupType,
                Status = OrderStatus.ReadyForPickup,
                VehicleDetails = request.VehicleDetails,
                CurbsideBayNumber = request.CurbsideBayNumber,
                LockerPinCode = request.PickupType == PickupType.SmartLocker ? _pickupPassService.GenerateLockerPin() : null,
                LockerBoxNumber = request.PickupType == PickupType.SmartLocker ? $"Locker #{Random.Shared.Next(1, 32)}" : null,
                PickupToken = pickupToken,
                QrCodeBase64 = qrCodeBase64,
                TotalAmount = totalAmount,
                CreatedAt = DateTime.UtcNow,
                ReservationExpiresAt = DateTime.UtcNow.AddHours(24),
                Items = reservedItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation("BOPIS order created: {OrderNumber} for {CustomerEmail} at Store {StoreId}",
                orderNumber, order.CustomerEmail, store.Id);

            return CreatedAtAction(nameof(GetOrderByNumber), new { orderNumber = order.OrderNumber }, MapToDto(order, store));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("BOPIS reservation rejected: {Message}", ex.Message);
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("{orderNumber}")]
    public async Task<ActionResult<OrderResponseDto>> GetOrderByNumber(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.Store)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order == null || order.Store == null)
        {
            return NotFound(new { message = $"Order '{orderNumber}' not found." });
        }

        return Ok(MapToDto(order, order.Store));
    }

    [HttpPost("{orderNumber}/check-in")]
    public async Task<ActionResult<OrderResponseDto>> CurbsideCheckIn(string orderNumber, [FromBody] CurbsideCheckInRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Store)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order == null || order.Store == null)
        {
            return NotFound(new { message = $"Order '{orderNumber}' not found." });
        }

        if (order.Status == OrderStatus.Completed || order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Expired)
        {
            return BadRequest(new { message = $"Cannot check in. Order is currently {order.Status}." });
        }

        order.VehicleDetails = request.VehicleDetails;
        order.CurbsideBayNumber = request.CurbsideBayNumber;
        order.Status = OrderStatus.CustomerArrived;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Curbside customer arrived for order {OrderNumber} at Bay {Bay}", orderNumber, request.CurbsideBayNumber);

        return Ok(MapToDto(order, order.Store));
    }

    [HttpPost("{orderNumber}/fulfill")]
    public async Task<ActionResult<OrderResponseDto>> FulfillOrder(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.Store)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order == null || order.Store == null)
        {
            return NotFound(new { message = $"Order '{orderNumber}' not found." });
        }

        if (order.Status == OrderStatus.Completed)
        {
            return BadRequest(new { message = "Order has already been fulfilled and picked up." });
        }

        if (order.Status == OrderStatus.Expired || order.Status == OrderStatus.Cancelled)
        {
            return BadRequest(new { message = $"Cannot fulfill order because status is {order.Status}." });
        }

        // Deduct from physical shelf stock
        await _reservationService.FulfillInventoryAsync(order.StoreId, order.Items);

        order.Status = OrderStatus.Completed;
        order.FulfilledAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Order {OrderNumber} successfully fulfilled by associate scanner.", orderNumber);

        return Ok(MapToDto(order, order.Store));
    }

    [HttpPost("{orderNumber}/cancel")]
    public async Task<ActionResult<OrderResponseDto>> CancelOrder(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.Store)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order == null || order.Store == null)
        {
            return NotFound(new { message = $"Order '{orderNumber}' not found." });
        }

        if (order.Status == OrderStatus.Completed)
        {
            return BadRequest(new { message = "Cannot cancel an order that has already been collected." });
        }

        // Release reservation back to store shelf
        await _reservationService.ReleaseReservationAsync(order.StoreId, order.Items);

        order.Status = OrderStatus.Cancelled;
        await _context.SaveChangesAsync();

        return Ok(MapToDto(order, order.Store));
    }

    private static OrderResponseDto MapToDto(Order order, Store store)
    {
        return new OrderResponseDto(
            order.Id,
            order.OrderNumber,
            order.CustomerName,
            order.CustomerEmail,
            order.CustomerPhone,
            order.StoreId,
            store.Name,
            $"{store.Address}, {store.City}",
            order.PickupType.ToString(),
            order.Status.ToString(),
            order.VehicleDetails,
            order.CurbsideBayNumber,
            order.LockerPinCode,
            order.LockerBoxNumber,
            order.PickupToken,
            order.QrCodeBase64,
            order.TotalAmount,
            order.CreatedAt,
            order.ReservationExpiresAt,
            order.FulfilledAt,
            order.Items.Select(i => new OrderItemDto(
                i.ProductId,
                i.ProductTitle,
                i.ProductSku,
                i.AisleLocation,
                i.UnitPrice,
                i.Quantity,
                i.Subtotal
            )).ToList()
        );
    }
}
