using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Infrastructure;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Services;

public class UserService(AppDb db, IImageStorage images, IReservationService reservations, TimeProvider clock) : IUserService
{
    public async Task<List<UserResponse>> GetAllAsync()
    {
        await reservations.CompleteFinishedAsync();
        var now = clock.GetUtcNow().UtcDateTime;

        var users = await db.Users.ToListAsync();
        var counts = await db.Reservations
        .Where(r => r.Status == ReservationStatus.Booked && r.End > now)
        .GroupBy(r => r.OrganizerId)
        .Select(g => new
        {
            OrganizerId = g.Key,
            Count = g.Count()
        })
        .ToDictionaryAsync(x => x.OrganizerId, x => x.Count);

        return users.Select(u => u.ToResponse(counts.GetValueOrDefault(u.Id))).ToList();
    }

    public async Task<UserResponse> GetAsync(int id) => await RespondAsync(await FindAsync(id));

    public async Task<UserResponse> CreateAsync(UserRequest request)
    {
        Validate(request);
        var user = new AppUser { FirstName = request.FirstName, LastName = request.LastName };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return await RespondAsync(user);
    }

    public async Task<UserResponse> UpdateAsync(int id, UserRequest request)
    {
        var user = await FindAsync(id);
        Validate(request);
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        await db.SaveChangesAsync();
        return await RespondAsync(user);
    }

    public async Task<UserResponse> SetImageAsync(int id, IFormFile file)
    {
        var user = await FindAsync(id);
        user.ImageUrl = await images.SaveAsync(file);

        await db.SaveChangesAsync();
        return await RespondAsync(user);
    }

    private async Task<AppUser> FindAsync(int id) =>
        await db.Users.FindAsync(id) ?? throw new NotFoundException(ErrorCodes.UserNotFound, "User not found.");

    private async Task<UserResponse> RespondAsync(AppUser user)
    {
        await reservations.CompleteFinishedAsync();
        var now = clock.GetUtcNow().UtcDateTime;
        var active = await db.Reservations.CountAsync(r => r.OrganizerId == user.Id && r.Status == ReservationStatus.Booked && r.End > now);
        return user.ToResponse(active);
    }

    private static void Validate(UserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            throw new ApiException(ErrorCodes.InvalidUser, "First name and last name are required.");
    }
}
