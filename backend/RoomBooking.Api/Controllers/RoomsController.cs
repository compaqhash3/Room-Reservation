using Microsoft.AspNetCore.Mvc;
using RoomBooking.Api.Models;
using RoomBooking.Api.Services;

namespace RoomBooking.Api.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomsController(IRoomService service) : ControllerBase
{
    [HttpGet]
    public Task<List<RoomResponse>> GetAll([FromQuery] RoomFilter filter) => service.GetAllAsync(filter);

    [HttpGet("{id:int}")]
    public Task<RoomResponse> GetById(int id) => service.GetAsync(id);

    [HttpPost]
    public async Task<ActionResult<RoomResponse>> Create(RoomRequest request)
    {
        var created = await service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public Task<RoomResponse> Update(int id, RoomRequest request) => service.UpdateAsync(id, request);

    [HttpPost("{id:int}/image")]
    public Task<RoomResponse> UploadImage(int id, IFormFile file) => service.SetImageAsync(id, file);
}
