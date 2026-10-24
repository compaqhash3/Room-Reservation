namespace RoomBooking.Api.Infrastructure;

public interface IImageStorage
{
    Task<string> SaveAsync(IFormFile file);
}

public class ImageStorage(IWebHostEnvironment environment) : IImageStorage
{
    public async Task<string> SaveAsync(IFormFile file)
    {
        var folder = Path.Combine(environment.WebRootPath, "uploads");
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        await using var stream = File.Create(Path.Combine(folder, fileName));
        await file.CopyToAsync(stream);

        return $"/uploads/{fileName}";
    }
}
