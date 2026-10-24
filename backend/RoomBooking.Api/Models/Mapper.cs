namespace RoomBooking.Api.Models;

public static class Mapper
{
    public static RoomResponse ToResponse(this Room r) =>
        new(r.Id, r.Number, r.Name, r.Capacity, r.Floor, r.Description, r.Equipment, r.IsActive, r.ImageUrl);

    public static UserResponse ToResponse(this AppUser u, int activeReservations) =>
        new(u.Id, u.FirstName, u.LastName, u.ImageUrl, activeReservations);
    
    public static ReservationResponse ToResponse(this Reservation r) =>
        new(r.Id, r.RoomId, r.Room!.Name, r.OrganizerId, $"{r.Organizer!.FirstName} {r.Organizer.LastName}",
            r.Title, r.Start, r.End, r.Attendees, r.Status);
}
