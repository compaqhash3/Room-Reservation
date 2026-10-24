using Microsoft.AspNetCore.Mvc;
using RoomBooking.Api.Models;
using RoomBooking.Api.Services;

namespace RoomBooking.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(IUserService service) : ControllerBase
{
    [HttpGet]
    public Task<List<UserResponse>> GetAll() => service.GetAllAsync();

    [HttpGet("{id:int}")]
    public Task<UserResponse> GetById(int id) => service.GetAsync(id);

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(UserRequest request)
    {
        var created = await service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public Task<UserResponse> Update(int id, UserRequest request) => service.UpdateAsync(id, request);

    [HttpPost("{id:int}/image")]
    public Task<UserResponse> UploadImage(int id, IFormFile file) => service.SetImageAsync(id, file);
}
