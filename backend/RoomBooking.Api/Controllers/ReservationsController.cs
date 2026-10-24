using Microsoft.AspNetCore.Mvc;
using RoomBooking.Api.Models;
using RoomBooking.Api.Services;

namespace RoomBooking.Api.Controllers;

[ApiController]
[Route("api/reservations")]
public class ReservationsController(IReservationService service) : ControllerBase
{
    [HttpGet]
    public Task<List<ReservationResponse>> Search([FromQuery] ReservationFilter filter) => service.SearchAsync(filter);

    [HttpGet("{id:int}")]
    public Task<ReservationResponse> GetById(int id) => service.GetAsync(id);

    [HttpPost]
    public async Task<ActionResult<ReservationResponse>> Create(ReservationRequest request)
    {
        var created = await service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public Task<ReservationResponse> Update(int id, ReservationRequest request) => service.UpdateAsync(id, request);

    [HttpPost("{id:int}/cancel")]
    public Task<ReservationResponse> Cancel(int id) => service.CancelAsync(id);

    [HttpPost("{id:int}/complete")]
    public Task<ReservationResponse> Complete(int id) => service.CompleteAsync(id);
}
