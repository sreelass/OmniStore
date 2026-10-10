using BopisRetail.Api.Data;
using BopisRetail.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BopisRetail.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public StoresController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StoreDto>>> GetStores([FromQuery] double? userLat, [FromQuery] double? userLng)
    {
        var stores = await _context.Stores.AsNoTracking().ToListAsync();

        var storeDtos = stores.Select(s =>
        {
            double? distance = null;
            if (userLat.HasValue && userLng.HasValue)
            {
                distance = CalculateDistanceMiles(userLat.Value, userLng.Value, s.Latitude, s.Longitude);
            }

            return new StoreDto(
                s.Id,
                s.Name,
                s.Address,
                s.City,
                s.PostalCode,
                s.Latitude,
                s.Longitude,
                s.OpeningHours,
                s.Phone,
                s.PickupInstructions,
                s.CurbsideBays,
                s.SmartLockersAvailable,
                distance.HasValue ? Math.Round(distance.Value, 1) : null
            );
        });

        if (userLat.HasValue && userLng.HasValue)
        {
            storeDtos = storeDtos.OrderBy(s => s.DistanceMiles);
        }

        return Ok(storeDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StoreDto>> GetStoreById(int id)
    {
        var s = await _context.Stores.FindAsync(id);
        if (s == null) return NotFound(new { message = $"Store with ID {id} not found." });

        return Ok(new StoreDto(
            s.Id,
            s.Name,
            s.Address,
            s.City,
            s.PostalCode,
            s.Latitude,
            s.Longitude,
            s.OpeningHours,
            s.Phone,
            s.PickupInstructions,
            s.CurbsideBays,
            s.SmartLockersAvailable
        ));
    }

    private static double CalculateDistanceMiles(double lat1, double lon1, double lat2, double lon2)
    {
        // Haversine formula
        var r = 3958.8; // Earth radius in miles
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return r * c;
    }

    private static double ToRadians(double degrees) => degrees * (Math.PI / 180);
}
