using BopisRetail.Api.Data;
using BopisRetail.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BopisRetail.Api.Services;

public class ReservationExpiryWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReservationExpiryWorker> _logger;

    public ReservationExpiryWorker(IServiceProvider serviceProvider, ILogger<ReservationExpiryWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BOPIS Reservation Expiry Worker initialized.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var reservationService = scope.ServiceProvider.GetRequiredService<IInventoryReservationService>();

                var now = DateTime.UtcNow;
                var expiredOrders = await context.Orders
                    .Include(o => o.Items)
                    .Where(o => (o.Status == OrderStatus.Reserved || o.Status == OrderStatus.ReadyForPickup) 
                             && o.ReservationExpiresAt <= now)
                    .ToListAsync(stoppingToken);

                if (expiredOrders.Count > 0)
                {
                    _logger.LogInformation("Processing {Count} expired BOPIS reservations...", expiredOrders.Count);

                    foreach (var order in expiredOrders)
                    {
                        order.Status = OrderStatus.Expired;
                        await reservationService.ReleaseReservationAsync(order.StoreId, order.Items);
                        _logger.LogInformation("Order {OrderNumber} expired. Reserved stock returned to shelf for store {StoreId}.", 
                            order.OrderNumber, order.StoreId);
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during reservation expiry sweep.");
            }

            // Check every 10 seconds
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}
