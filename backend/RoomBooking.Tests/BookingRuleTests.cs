using Microsoft.Extensions.Options;
using RoomBooking.Api.Infrastructure;
using RoomBooking.Api.Models;
using RoomBooking.Api.Services;

namespace RoomBooking.Tests;

public class BookingRuleTests
{
    private static readonly DateTime Now = new(2026, 1, 1, 8, 0, 0, DateTimeKind.Utc);
    private static readonly IOptions<BookingOptions> Options = Microsoft.Extensions.Options.Options.Create(
        new BookingOptions { MaxDurationDays = 7, MaxAdvanceDays = 90 });

    private static BookingContext Context(DateTime start, DateTime end, int attendees = 4, int capacity = 10,
        bool roomActive = true, bool roomTaken = false, bool organizerBusy = false) =>
        new(new Reservation { Title = "Test", Start = start, End = end, Attendees = attendees },
            new Room { Number = "1", Name = "Room", Capacity = capacity, IsActive = roomActive },
            Now, roomTaken, organizerBusy);

    private static DateTime Tomorrow => Now.AddDays(1);

    // R1
    [Fact] public void Duration_exactly_7_days_is_allowed() =>
        Assert.Null(new MaxDurationRule(Options).Check(Context(Tomorrow, Tomorrow.AddDays(7))));

    [Fact] public void Duration_7_days_plus_1_minute_is_rejected() =>
        Assert.Equal(ErrorCodes.MaxDurationExceeded, new MaxDurationRule(Options).Check(Context(Tomorrow, Tomorrow.AddDays(7).AddMinutes(1)))?.Code);

    // R2 / R3
    [Fact] public void Room_overlap_is_rejected() =>
        Assert.Equal(ErrorCodes.RoomOverlap, new RoomOverlapRule().Check(Context(Tomorrow, Tomorrow.AddHours(1), roomTaken: true))?.Code);

    [Fact] public void Organizer_overlap_is_rejected() =>
        Assert.Equal(ErrorCodes.OrganizerOverlap, new OrganizerOverlapRule().Check(Context(Tomorrow, Tomorrow.AddHours(1), organizerBusy: true))?.Code);

    // R4
    [Fact] public void Start_in_the_past_is_rejected() =>
        Assert.Equal(ErrorCodes.StartInPast, new ValidTimeRule().Check(Context(Now.AddMinutes(-1), Now.AddHours(1)))?.Code);

    [Fact] public void End_before_start_is_rejected() =>
        Assert.Equal(ErrorCodes.InvalidTimeRange, new ValidTimeRule().Check(Context(Tomorrow, Tomorrow.AddHours(-1)))?.Code);

    // R5
    [Fact] public void Attendees_equal_to_capacity_is_allowed() =>
        Assert.Null(new CapacityRule().Check(Context(Tomorrow, Tomorrow.AddHours(1), attendees: 10, capacity: 10)));

    [Fact] public void Attendees_above_capacity_is_rejected() =>
        Assert.Equal(ErrorCodes.CapacityExceeded, new CapacityRule().Check(Context(Tomorrow, Tomorrow.AddHours(1), attendees: 11, capacity: 10))?.Code);

    // R6
    [Fact] public void Start_exactly_90_days_ahead_is_allowed() =>
        Assert.Null(new BookingHorizonRule(Options).Check(Context(Now.AddDays(90), Now.AddDays(90).AddHours(1))));

    [Fact] public void Start_beyond_90_days_is_rejected() =>
        Assert.Equal(ErrorCodes.BeyondBookingHorizon, new BookingHorizonRule(Options).Check(Context(Now.AddDays(90).AddMinutes(1), Now.AddDays(91)))?.Code);

    // R7
    [Fact] public void Inactive_room_is_rejected() =>
        Assert.Equal(ErrorCodes.RoomInactive, new ActiveRoomRule().Check(Context(Tomorrow, Tomorrow.AddHours(1), roomActive: false))?.Code);
}
