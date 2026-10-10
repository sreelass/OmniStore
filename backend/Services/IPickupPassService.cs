namespace BopisRetail.Api.Services;

public interface IPickupPassService
{
    string GeneratePickupToken(string orderNumber, int storeId);
    string GenerateQrCodeDataUrl(string payload);
    string GenerateLockerPin();
}
