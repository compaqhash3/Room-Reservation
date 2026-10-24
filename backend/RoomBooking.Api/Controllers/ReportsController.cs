using Microsoft.AspNetCore.Mvc;
using RoomBooking.Api.Models;
using RoomBooking.Api.Services;

namespace RoomBooking.Api.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController(IReportService service) : ControllerBase
{
    [HttpGet("room-usage")]
    public Task<List<RoomUsageRow>> RoomUsage([FromQuery] RoomUsageFilter filter) => service.GetRoomUsageAsync(filter);
}
