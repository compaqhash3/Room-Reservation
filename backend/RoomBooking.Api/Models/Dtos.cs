namespace RoomBooking.Api.Models;

// Requests
public record RoomRequest(string Number, string Name, int Capacity, int Floor, string? Description, List<Equipment> Equipment, bool IsActive);
public record UserRequest(string FirstName, string LastName);
public record ReservationRequest(int RoomId, int OrganizerId, string Title, DateTime Start, DateTime End, int Attendees);

// Responses
public record RoomResponse(int Id, string Number, string Name, int Capacity, int Floor, string? Description,
    List<Equipment> Equipment, bool IsActive, string? ImageUrl);
public record UserResponse(int Id, string FirstName, string LastName, string? ImageUrl, int ActiveReservations);
public record ReservationResponse(int Id, int RoomId, string RoomName, int OrganizerId, string OrganizerName,
    string Title, DateTime Start, DateTime End, int Attendees, ReservationStatus Status);
public record RoomUsageRow(int RoomId, string Number, string Name, int Reservations, int Booked, int Completed, int Cancelled,
    double BookedHours, double UsedHours, double UtilizationPercent);

// Filters
public record RoomFilter(int? MinCapacity, int? Floor, List<Equipment>? Equipment)
{
    public bool Matches(Room room) =>
        (MinCapacity is null || room.Capacity >= MinCapacity)
        && (Floor is null || room.Floor == Floor)
        && (Equipment is null || Equipment.All(room.Equipment.Contains));
}

public record ReservationFilter(int? RoomId, int? OrganizerId, ReservationStatus? Status, DateTime? From, DateTime? To);
public record RoomUsageFilter(List<int>? RoomIds, List<ReservationStatus>? Status, DateTime? From, DateTime? To);
