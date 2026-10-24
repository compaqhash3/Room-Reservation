using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Models;

namespace RoomBooking.Api.Data;

public class AppDb(DbContextOptions<AppDb> options) : DbContext(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
}
