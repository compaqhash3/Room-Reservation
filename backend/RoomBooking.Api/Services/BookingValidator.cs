using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Infrastructure;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Services;

public class BookingValidator(AppDb db, IEnumerable<IBookingRule> rules, TimeProvider clock) : IBookingValidator
{
    public async Task ValidateAsync(Reservation reservation)
    {
        if (string.IsNullOrWhiteSpace(reservation.Title))
            throw new ApiException(ErrorCodes.TitleRequired, "Meeting title is required.");

        var room = await db.Rooms.FindAsync(reservation.RoomId)
            ?? throw new NotFoundException(ErrorCodes.RoomNotFound, "Room not found.");
        if (!await db.Users.AnyAsync(u => u.Id == reservation.OrganizerId))
            throw new NotFoundException(ErrorCodes.UserNotFound, "Organizer not found.");

        // Overlap means: starts before the other one ends AND ends after the other one starts.
        // Back-to-back meetings are allowed. Cancelled reservations never block.
        var others = db.Reservations.Where(x => x.Id != reservation.Id
            && x.Status != ReservationStatus.Cancelled
            && x.Start < reservation.End && x.End > reservation.Start);

        var context = new BookingContext(
            reservation, room, clock.GetUtcNow().UtcDateTime,
            RoomIsTaken: await others.AnyAsync(x => x.RoomId == reservation.RoomId),
            OrganizerIsBusy: await others.AnyAsync(x => x.OrganizerId == reservation.OrganizerId));

        foreach (var rule in rules)
        {
            if (rule.Check(context) is { } error)
                throw new ApiException(error.Code, error.Message);
        }
    }
}
