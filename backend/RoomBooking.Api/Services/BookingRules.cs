using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using RoomBooking.Api.Infrastructure;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Services;

// Values come from appsettings.json ("Booking" section).
public class BookingOptions
{
    [Range(1, 365)] public int MaxDurationDays { get; init; }
    [Range(1, 3650)] public int MaxAdvanceDays { get; init; }
}

public record RuleError(string Code, string Message);

public record BookingContext(Reservation Reservation, Room Room, DateTime Now, bool RoomIsTaken, bool OrganizerIsBusy);

// Strategy pattern: one class per rule.
public interface IBookingRule
{
    RuleError? Check(BookingContext context);
}

public class MaxDurationRule(IOptions<BookingOptions> options) : IBookingRule // R1
{
    public RuleError? Check(BookingContext c)
    {
        var maxDays = options.Value.MaxDurationDays;
        var duration = c.Reservation.End - c.Reservation.Start;
        return duration > TimeSpan.FromDays(maxDays)
            ? new(ErrorCodes.MaxDurationExceeded, $"A reservation cannot last longer than {maxDays} days.")
            : null;
    }
}

public class RoomOverlapRule : IBookingRule // R2
{
    public RuleError? Check(BookingContext c) =>
        c.RoomIsTaken ? new(ErrorCodes.RoomOverlap, "The room is already booked for this time.") : null;
}

public class OrganizerOverlapRule : IBookingRule // R3
{
    public RuleError? Check(BookingContext c) =>
        c.OrganizerIsBusy ? new(ErrorCodes.OrganizerOverlap, "The organizer already has another meeting at this time.") : null;
}

public class ValidTimeRule : IBookingRule // R4
{
    public RuleError? Check(BookingContext c)
    {
        if (c.Reservation.End <= c.Reservation.Start)
            return new(ErrorCodes.InvalidTimeRange, "End must be after start.");

        if (c.Reservation.Start <= c.Now)
            return new(ErrorCodes.StartInPast, "Start must be in the future.");

        return null;
    }
}

public class CapacityRule : IBookingRule // R5
{
    public RuleError? Check(BookingContext c)
    {
        var attendees = c.Reservation.Attendees;
        return attendees < 1 || attendees > c.Room.Capacity
            ? new(ErrorCodes.CapacityExceeded, $"Attendees must be between 1 and the room capacity ({c.Room.Capacity}).")
            : null;
    }
}

public class BookingHorizonRule(IOptions<BookingOptions> options) : IBookingRule // R6
{
    public RuleError? Check(BookingContext c)
    {
        var maxDays = options.Value.MaxAdvanceDays;
        return c.Reservation.Start > c.Now.AddDays(maxDays)
            ? new(ErrorCodes.BeyondBookingHorizon, $"A reservation cannot start more than {maxDays} days in the future.")
            : null;
    }
}

public class ActiveRoomRule : IBookingRule // R7
{
    public RuleError? Check(BookingContext c) =>
        c.Room.IsActive ? null : new(ErrorCodes.RoomInactive, "Inactive rooms cannot be booked.");
}
