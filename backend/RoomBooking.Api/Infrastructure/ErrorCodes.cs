namespace RoomBooking.Api.Infrastructure;

public static class ErrorCodes
{
    public const string RoomNotFound = "ROOM_NOT_FOUND";
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string ReservationNotFound = "RESERVATION_NOT_FOUND";
    public const string InvalidRoom = "INVALID_ROOM";
    public const string InvalidUser = "INVALID_USER";
    public const string TitleRequired = "TITLE_REQUIRED";
    public const string NotBooked = "NOT_BOOKED";
    public const string NotStarted = "NOT_STARTED";
    public const string RoomNumberExists = "ROOM_NUMBER_EXISTS";

    // Booking rules
    public const string MaxDurationExceeded = "MAX_DURATION_EXCEEDED";
    public const string RoomOverlap = "ROOM_OVERLAP";
    public const string OrganizerOverlap = "ORGANIZER_OVERLAP";
    public const string InvalidTimeRange = "INVALID_TIME_RANGE";
    public const string StartInPast = "START_IN_PAST";
    public const string CapacityExceeded = "CAPACITY_EXCEEDED";
    public const string BeyondBookingHorizon = "BEYOND_BOOKING_HORIZON";
    public const string RoomInactive = "ROOM_INACTIVE";
}
