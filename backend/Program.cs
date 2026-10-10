using System.Text.Json.Serialization;
using BopisRetail.Api.Data;
using BopisRetail.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (EF Core with SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
                      ?? "Data Source=bopis_retail.db");
});

// 2. Application Services
builder.Services.AddScoped<IInventoryReservationService, InventoryReservationService>();
builder.Services.AddScoped<IPickupPassService, PickupPassService>();
builder.Services.AddHostedService<ReservationExpiryWorker>();

// 3. CORS Policy for Next.js Frontend (Allows any local dev port)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Controllers with String Enum conversion (for PickupType & OrderStatus)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-create SQLite database and seed data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
