using RoomBooking.Api.Models;

namespace RoomBooking.Api.Data;

public static class Seeder
{
    public static void Run(AppDb db, DateTime now)
    {
        db.Rooms.AddRange(
            new Room { Number = "101", Name = "Aurora", Capacity = 6, Floor = 1, Description = "Small focus room", Equipment = [Equipment.TvScreen, Equipment.Whiteboard] },
            new Room { Number = "102", Name = "Baltic", Capacity = 12, Floor = 1, Description = "Mid-size meeting room", Equipment = [Equipment.Projector, Equipment.Whiteboard] },
            new Room { Number = "201", Name = "Neris", Capacity = 20, Floor = 2, Description = "Boardroom", Equipment = [Equipment.Projector, Equipment.TvScreen, Equipment.VideoConferencing] },
            new Room { Number = "202", Name = "Nemunas", Capacity = 8, Floor = 2, Description = "Under renovation", IsActive = false },
            new Room { Number = "301", Name = "Kaunas Hall", Capacity = 40, Floor = 3, Description = "Large event room", Equipment = [Equipment.Projector, Equipment.VideoConferencing, Equipment.Whiteboard] });

        db.Users.AddRange(
            new AppUser { FirstName = "Jonas", LastName = "Ched" },
            new AppUser { FirstName = "Ona", LastName = "Harison" },
            new AppUser { FirstName = "Tomas", LastName = "Ritz" },
            new AppUser { FirstName = "Rasa", LastName = "Holms" });
        db.SaveChanges();

        var today = now.Date;
        db.Reservations.AddRange(
            Make(1, 1, "Sprint retro", today.AddDays(-3).AddHours(9), 2, 5, ReservationStatus.Completed),
            Make(2, 2, "Client demo", today.AddDays(-2).AddHours(13), 3, 10, ReservationStatus.Completed),
            Make(3, 3, "Budget review", today.AddDays(-1).AddHours(10), 2, 15, ReservationStatus.Cancelled),
            Make(1, 1, "Planning", today.AddDays(1).AddHours(9), 2, 6, ReservationStatus.Booked),
            Make(2, 4, "Design workshop", today.AddDays(2).AddHours(10), 4, 8, ReservationStatus.Booked),
            Make(3, 2, "All-hands prep", today.AddDays(3).AddHours(14), 2, 18, ReservationStatus.Booked));
        db.SaveChanges();
    }

    private static Reservation Make(int roomId, int organizerId, string title, DateTime start, int hours, int attendees, ReservationStatus status) => new()
    {
        RoomId = roomId, OrganizerId = organizerId, Title = title, Start = start, End = start.AddHours(hours),
        ScheduledEnd = start.AddHours(hours), Attendees = attendees, Status = status
    };
}
