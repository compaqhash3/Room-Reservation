using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Infrastructure;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Services;

public class RoomService(AppDb db, IImageStorage images) : IRoomService
{
    public async Task<List<RoomResponse>> GetAllAsync(RoomFilter filter)
    {
        var rooms = await db.Rooms.ToListAsync();
        return rooms.Where(filter.Matches).Select(r => r.ToResponse()).ToList();
    }

    public async Task<RoomResponse> GetAsync(int id) => (await FindAsync(id)).ToResponse();

    public async Task<RoomResponse> CreateAsync(RoomRequest request)
    {
        Validate(request);
        await EnsureNumberIsUniqueAsync(request.Number, null);
        var room = new Room { Number = request.Number, Name = request.Name };
        Apply(room, request);

        db.Rooms.Add(room);
        await db.SaveChangesAsync();
        return room.ToResponse();
    }

    public async Task<RoomResponse> UpdateAsync(int id, RoomRequest request)
    {
        var room = await FindAsync(id);
        Validate(request);
        await EnsureNumberIsUniqueAsync(request.Number, id);
        Apply(room, request);

        await db.SaveChangesAsync();
        return room.ToResponse();
    }

    public async Task<RoomResponse> SetImageAsync(int id, IFormFile file)
    {
        var room = await FindAsync(id);
        room.ImageUrl = await images.SaveAsync(file);

        await db.SaveChangesAsync();
        return room.ToResponse();
    }

    private async Task<Room> FindAsync(int id) =>
        await db.Rooms.FindAsync(id) ?? throw new NotFoundException(ErrorCodes.RoomNotFound, "Room not found.");

    private async Task EnsureNumberIsUniqueAsync(string number, int? excludeId)
    {
        var wanted = number.Trim().ToLower();
        var exists = await db.Rooms.AnyAsync(r => r.Id != excludeId && r.Number.ToLower() == wanted);

        if (exists)
            throw new ApiException(ErrorCodes.RoomNumberExists, $"A room with number {number.Trim()} already exists.", 409);
    }
    private static void Validate(RoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Number) || request.Capacity < 1)
            throw new ApiException(ErrorCodes.InvalidRoom, "Number, name and a capacity of at least 1 are required.");
    }

    private static void Apply(Room room, RoomRequest request)
    {
        room.Number = request.Number.Trim();
        room.Name = request.Name;
        room.Capacity = request.Capacity;
        room.Floor = request.Floor;
        room.Description = request.Description;
        room.Equipment = request.Equipment;
        room.IsActive = request.IsActive;
    }
}
