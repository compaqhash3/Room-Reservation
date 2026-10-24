using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Infrastructure;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Services;

public class ReservationService(AppDb db, IBookingValidator validator, TimeProvider clock) : IReservationService
{
    private DateTime Now => clock.GetUtcNow().UtcDateTime;

    private IQueryable<Reservation> Query => db.Reservations.Include(r => r.Room).Include(r => r.Organizer);

    public async Task<List<ReservationResponse>> SearchAsync(ReservationFilter filter)
    {
        await CompleteFinishedAsync();

        var query = Query;
        if (filter.RoomId is not null) query = query.Where(r => r.RoomId == filter.RoomId);
        if (filter.OrganizerId is not null) query = query.Where(r => r.OrganizerId == filter.OrganizerId);
        if (filter.Status is not null) query = query.Where(r => r.Status == filter.Status);
        if (filter.From is { } from) query = query.Where(r => r.End > from.ToUniversalTime());
        if (filter.To is { } to) query = query.Where(r => r.Start < to.ToUniversalTime());

        var reservations = await query.OrderByDescending(r => r.Start).ToListAsync();
        return reservations.Select(r => r.ToResponse()).ToList();
    }

    public async Task<ReservationResponse> GetAsync(int id)
    {
        await CompleteFinishedAsync();
        var reservation = await Query.FirstOrDefaultAsync(r => r.Id == id) ?? throw NotFound();
        return reservation.ToResponse();
    }

    public async Task<ReservationResponse> CreateAsync(ReservationRequest request)
    {
        var reservation = new Reservation { Title = request.Title };
        Apply(reservation, request);
        await validator.ValidateAsync(reservation);

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();
        return await GetAsync(reservation.Id);
    }

    public async Task<ReservationResponse> UpdateAsync(int id, ReservationRequest request)
    {
        var reservation = await FindBookedAsync(id);
        Apply(reservation, request);
        await validator.ValidateAsync(reservation);

        await db.SaveChangesAsync();
        return await GetAsync(id);
    }

    public async Task<ReservationResponse> CancelAsync(int id)
    {
        var reservation = await FindBookedAsync(id);
        reservation.Status = ReservationStatus.Cancelled;

        await db.SaveChangesAsync();
        return await GetAsync(id);
    }

    // "Complete" ends the meeting now, so the used time is shorter than the booked time.
    public async Task<ReservationResponse> CompleteAsync(int id)
    {
        var reservation = await FindBookedAsync(id);
        if (reservation.Start > Now)
            throw new ApiException(ErrorCodes.NotStarted, "A meeting that has not started can only be cancelled.", 409);

        if (reservation.End > Now) reservation.End = Now;
        reservation.Status = ReservationStatus.Completed;

        await db.SaveChangesAsync();
        return await GetAsync(id);
    }

    // Booked meetings whose end time has passed become Completed.
    public async Task CompleteFinishedAsync()
    {
        var now = Now;
        var finished = await db.Reservations.Where(r => r.Status == ReservationStatus.Booked && r.End <= now).ToListAsync();
        foreach (var reservation in finished) reservation.Status = ReservationStatus.Completed;
        await db.SaveChangesAsync();
    }

    private static void Apply(Reservation reservation, ReservationRequest request)
    {
        reservation.RoomId = request.RoomId;
        reservation.OrganizerId = request.OrganizerId;
        reservation.Title = (request.Title ?? "").Trim();
        reservation.Start = request.Start.ToUniversalTime();
        reservation.End = request.End.ToUniversalTime();
        reservation.ScheduledEnd = reservation.End;
        reservation.Attendees = request.Attendees;
    }

    private async Task<Reservation> FindBookedAsync(int id)
    {
        await CompleteFinishedAsync();
        var reservation = await db.Reservations.FindAsync(id) ?? throw NotFound();

        return reservation.Status == ReservationStatus.Booked
            ? reservation
            : throw new ApiException(ErrorCodes.NotBooked, "Only reservations in Booked status can be changed.", 409);
    }

    private static NotFoundException NotFound() => new(ErrorCodes.ReservationNotFound, "Reservation not found.");
}
