namespace RoomBooking.Api.Infrastructure;

public class ApiException(string code, string message, int statusCode = 400) : Exception(message)
{
    public string Code { get; } = code;
    public int StatusCode { get; } = statusCode;
}

public class NotFoundException(string code, string message) : ApiException(code, message, 404);
