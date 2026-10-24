namespace RoomBooking.Api.Models;

public enum Equipment { Projector, TvScreen, VideoConferencing, Whiteboard }

public enum ReservationStatus { Booked, Completed, Cancelled }

public class Room
{
    public int Id { get; set; }
    public required string Number { get; set; }
    public required string Name { get; set; }
    public int Capacity { get; set; }
    public int Floor { get; set; }
    public string? Description { get; set; }
    public List<Equipment> Equipment { get; set; } = [];
    public bool IsActive { get; set; } = true;
    public string? ImageUrl { get; set; }
}

public class AppUser
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? ImageUrl { get; set; }
}

public class Reservation
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public Room? Room { get; set; }
    public int OrganizerId { get; set; }
    public AppUser? Organizer { get; set; }
    public required string Title { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public DateTime ScheduledEnd { get; set; } // original end, kept when a meeting ends early
    public int Attendees { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Booked;
}
