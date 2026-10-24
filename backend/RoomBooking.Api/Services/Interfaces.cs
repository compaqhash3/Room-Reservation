using RoomBooking.Api.Models;

namespace RoomBooking.Api.Services;

public interface IRoomService
{
    Task<List<RoomResponse>> GetAllAsync(RoomFilter filter);
    Task<RoomResponse> GetAsync(int id);
    Task<RoomResponse> CreateAsync(RoomRequest request);
    Task<RoomResponse> UpdateAsync(int id, RoomRequest request);
    Task<RoomResponse> SetImageAsync(int id, IFormFile file);
}

public interface IUserService
{
    Task<List<UserResponse>> GetAllAsync();
    Task<UserResponse> GetAsync(int id);
    Task<UserResponse> CreateAsync(UserRequest request);
    Task<UserResponse> UpdateAsync(int id, UserRequest request);
    Task<UserResponse> SetImageAsync(int id, IFormFile file);
}

public interface IReservationService
{
    Task<List<ReservationResponse>> SearchAsync(ReservationFilter filter);
    Task<ReservationResponse> GetAsync(int id);
    Task<ReservationResponse> CreateAsync(ReservationRequest request);
    Task<ReservationResponse> UpdateAsync(int id, ReservationRequest request);
    Task<ReservationResponse> CancelAsync(int id);
    Task<ReservationResponse> CompleteAsync(int id);
    Task CompleteFinishedAsync();
}

public interface IReportService
{
    Task<List<RoomUsageRow>> GetRoomUsageAsync(RoomUsageFilter filter);
}

public interface IBookingValidator
{
    Task ValidateAsync(Reservation reservation);
}
