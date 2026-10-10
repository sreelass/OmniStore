using BopisRetail.Api.DTOs;
using BopisRetail.Api.Models;

namespace BopisRetail.Api.Services;

public interface IInventoryReservationService
{
    Task<List<OrderItem>> ReserveInventoryAsync(int storeId, List<OrderItemRequest> items);
    Task ReleaseReservationAsync(int storeId, List<OrderItem> items);
    Task FulfillInventoryAsync(int storeId, List<OrderItem> items);
}
