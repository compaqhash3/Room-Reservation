using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RoomBooking.Api.Data;
using RoomBooking.Api.Infrastructure;
using RoomBooking.Api.Models;
using RoomBooking.Api.Services;

namespace RoomBooking.Tests;

public class BookingValidatorTests
{
    private static readonly DateTime Now = new(2026, 1, 1, 8, 0, 0, DateTimeKind.Utc);
    private static DateTime At(int hour) => Now.AddDays(1).Date.AddHours(hour);

    private class FixedClock : TimeProvider { public override DateTimeOffset GetUtcNow() => new(Now); }

    private static (BookingValidator Validator, AppDb Db) Create()
    {
        var db = new AppDb(new DbContextOptionsBuilder<AppDb>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Rooms.AddRange(new Room { Number = "1", Name = "A", Capacity = 10 }, new Room { Number = "2", Name = "B", Capacity = 10 });
        db.Users.AddRange(new AppUser { FirstName = "Ann", LastName = "One" }, new AppUser { FirstName = "Bob", LastName = "Two" });
        db.SaveChanges();

        var options = Microsoft.Extensions.Options.Options.Create(new BookingOptions { MaxDurationDays = 7, MaxAdvanceDays = 90 });
        IBookingRule[] rules = [new MaxDurationRule(options), new RoomOverlapRule(), new OrganizerOverlapRule(), new ValidTimeRule(),
            new CapacityRule(), new BookingHorizonRule(options), new ActiveRoomRule()];
        return (new BookingValidator(db, rules, new FixedClock()), db);
    }

    private static Reservation Booking(int room, int user, int startHour, int endHour, ReservationStatus status = ReservationStatus.Booked) =>
        new() { RoomId = room, OrganizerId = user, Title = "Meeting", Start = At(startHour), End = At(endHour), Attendees = 4, Status = status };

    [Fact]
    public async Task Back_to_back_meetings_are_allowed()
    {
        var (validator, db) = Create();
        db.Reservations.Add(Booking(1, 1, 9, 10)); db.SaveChanges();

        await validator.ValidateAsync(Booking(1, 2, 10, 11)); // starts exactly when the other ends
    }

    [Fact]
    public async Task Overlapping_room_booking_is_rejected()
    {
        var (validator, db) = Create();
        db.Reservations.Add(Booking(1, 1, 9, 11)); db.SaveChanges();

        var error = await Assert.ThrowsAsync<ApiException>(() => validator.ValidateAsync(Booking(1, 2, 10, 12)));
        Assert.Equal(ErrorCodes.RoomOverlap, error.Code);
    }

    [Fact]
    public async Task Cancelled_reservation_does_not_block_the_room()
    {
        var (validator, db) = Create();
        db.Reservations.Add(Booking(1, 1, 9, 11, ReservationStatus.Cancelled)); db.SaveChanges();

        await validator.ValidateAsync(Booking(1, 2, 10, 12));
    }

    [Fact]
    public async Task Same_organizer_in_two_rooms_at_the_same_time_is_rejected()
    {
        var (validator, db) = Create();
        db.Reservations.Add(Booking(1, 1, 9, 11)); db.SaveChanges();

        var error = await Assert.ThrowsAsync<ApiException>(() => validator.ValidateAsync(Booking(2, 1, 10, 12)));
        Assert.Equal(ErrorCodes.OrganizerOverlap, error.Code);
    }

    [Fact]
    public async Task Editing_a_reservation_does_not_conflict_with_itself()
    {
        var (validator, db) = Create();
        var existing = Booking(1, 1, 9, 11);
        db.Reservations.Add(existing); db.SaveChanges();

        existing.End = At(12); 
        await validator.ValidateAsync(existing);
    }
}
