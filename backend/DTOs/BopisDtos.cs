using BopisRetail.Api.Models;

namespace BopisRetail.Api.DTOs;

public record StoreDto(
    int Id,
    string Name,
    string Address,
    string City,
    string PostalCode,
    double Latitude,
    double Longitude,
    string OpeningHours,
    string Phone,
    string PickupInstructions,
    int CurbsideBays,
    bool SmartLockersAvailable,
    double? DistanceMiles = null
);

public record ProductDto(
    int Id,
    string Sku,
    string Title,
    string Category,
    decimal Price,
    string ImageUrl,
    string Description,
    string Brand,
    double Rating,
    int ReviewCount,
    // Store-specific inventory fields (when storeId query param is provided)
    int? QuantityOnHand = null,
    int? ReservedQuantity = null,
    int? AvailableQuantity = null,
    string? AisleLocation = null,
    string? Department = null,
    string? ShelfCoordinate = null,
    bool IsInStock = false
);

public record StoreStockLookupDto(
    int StoreId,
    string StoreName,
    string City,
    int AvailableQuantity,
    string AisleLocation,
    bool IsInStock
);

public record OrderItemRequest(
    int ProductId,
    int Quantity
);

public record CreateBopisOrderRequest(
    int StoreId,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    PickupType PickupType,
    string? VehicleDetails = null,
    int? CurbsideBayNumber = null,
    List<OrderItemRequest>? Items = null
);

public record CurbsideCheckInRequest(
    string VehicleDetails,
    int CurbsideBayNumber
);

public record OrderResponseDto(
    int Id,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    int StoreId,
    string StoreName,
    string StoreAddress,
    string PickupType,
    string Status,
    string? VehicleDetails,
    int? CurbsideBayNumber,
    string? LockerPinCode,
    string? LockerBoxNumber,
    string PickupToken,
    string QrCodeBase64,
    decimal TotalAmount,
    DateTime CreatedAt,
    DateTime ReservationExpiresAt,
    DateTime? FulfilledAt,
    List<OrderItemDto> Items
);

public record OrderItemDto(
    int ProductId,
    string ProductTitle,
    string ProductSku,
    string AisleLocation,
    decimal UnitPrice,
    int Quantity,
    decimal Subtotal
);
