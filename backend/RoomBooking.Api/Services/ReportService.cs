using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Services;

public class ReportService(AppDb db, IReservationService reservations) : IReportService
{
    public async Task<List<RoomUsageRow>> GetRoomUsageAsync(RoomUsageFilter filter)
    {
        await reservations.CompleteFinishedAsync();

        var from = filter.From?.ToUniversalTime();
        var to = filter.To?.ToUniversalTime();
        var allReservations = await db.Reservations.ToListAsync();
        var rooms = await db.Rooms.ToListAsync();

        var selectedRooms = filter.RoomIds is { Count: > 0 }
            ? rooms.Where(r => filter.RoomIds.Contains(r.Id))
            : rooms;

        return selectedRooms.Select(room =>
        {
            var items = allReservations
                .Where(r => r.RoomId == room.Id)
                .Where(r => from is null || r.End > from)
                .Where(r => to is null || r.Start < to)
                .Where(r => filter.Status is not { Count: > 0 } || filter.Status.Contains(r.Status))
                .ToList();

            var bookedHours = items.Where(r => r.Status != ReservationStatus.Cancelled).Sum(r => (r.ScheduledEnd - r.Start).TotalHours);
            var usedHours = items.Where(r => r.Status == ReservationStatus.Completed).Sum(r => (r.End - r.Start).TotalHours);
            var utilization = bookedHours > 0 ? usedHours / bookedHours * 100 : 0;

            return new RoomUsageRow(
                room.Id, room.Number, room.Name, items.Count,
                items.Count(r => r.Status == ReservationStatus.Booked),
                items.Count(r => r.Status == ReservationStatus.Completed),
                items.Count(r => r.Status == ReservationStatus.Cancelled),
                Math.Round(bookedHours, 2), Math.Round(usedHours, 2), Math.Round(utilization, 1));
        }).ToList();
    }
}
