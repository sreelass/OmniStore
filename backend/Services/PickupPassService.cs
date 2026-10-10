using System.Security.Cryptography;
using QRCoder;

namespace BopisRetail.Api.Services;

public class PickupPassService : IPickupPassService
{
    public string GeneratePickupToken(string orderNumber, int storeId)
    {
        var raw = $"{orderNumber}:{storeId}:{DateTime.UtcNow.Ticks}";
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(hash)[..16]; // 16-char verification hex token
    }

    public string GenerateQrCodeDataUrl(string payload)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeBytes = qrCode.GetGraphic(12);
        return $"data:image/png;base64,{Convert.ToBase64String(qrCodeBytes)}";
    }

    public string GenerateLockerPin()
    {
        return Random.Shared.Next(100000, 999999).ToString();
    }
}
