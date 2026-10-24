using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using RoomBooking.Api.Data;
using RoomBooking.Api.Infrastructure;
using RoomBooking.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Options pattern: limits come from appsettings.json and are validated when the app starts.
builder.Services.AddOptions<BookingOptions>()
    .BindConfiguration("Booking")
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddDbContext<AppDb>(options => options.UseInMemoryDatabase("RoomBooking"));
builder.Services.AddSingleton(TimeProvider.System);

// Strategy pattern: one class per booking rule (R1-R7). The validator runs all of them.
builder.Services.AddScoped<IBookingRule, MaxDurationRule>();
builder.Services.AddScoped<IBookingRule, RoomOverlapRule>();
builder.Services.AddScoped<IBookingRule, OrganizerOverlapRule>();
builder.Services.AddScoped<IBookingRule, ValidTimeRule>();
builder.Services.AddScoped<IBookingRule, CapacityRule>();
builder.Services.AddScoped<IBookingRule, BookingHorizonRule>();
builder.Services.AddScoped<IBookingRule, ActiveRoomRule>();

builder.Services.AddScoped<IBookingValidator, BookingValidator>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IImageStorage, ImageStorage>();

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors();
app.UseStaticFiles();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    Seeder.Run(scope.ServiceProvider.GetRequiredService<AppDb>(), DateTime.UtcNow);
}

app.Run();
