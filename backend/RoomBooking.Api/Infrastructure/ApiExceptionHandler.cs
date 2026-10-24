using Microsoft.AspNetCore.Diagnostics;

namespace RoomBooking.Api.Infrastructure;

// Turns an ApiException into { code, message } 
public class ApiExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken token)
    {
        if (exception is not ApiException apiException) return false;

        context.Response.StatusCode = apiException.StatusCode;
        await context.Response.WriteAsJsonAsync(new { code = apiException.Code, message = apiException.Message }, token);
        return true;
    }
}
