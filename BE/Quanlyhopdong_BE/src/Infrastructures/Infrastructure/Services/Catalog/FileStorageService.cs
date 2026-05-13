using Application.Common.Exceptions;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services.Catalog;

public class FileStorageService(IHttpClientFactory httpClientFactory) : IFileStorageService
{
    private readonly string _baseStoragePath = "/uploads";

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            var fullPath = Path.Combine(_baseStoragePath, filePath);
            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public async Task<byte[]> GetFileBytesFromPresignedUrlAsync(string presignedUrl)
    {
        using var httpClient = httpClientFactory.CreateClient();
        return await httpClient.GetByteArrayAsync(presignedUrl);
    }

    public async Task<FileStreamResponse> GetFileStreamAsync(string presignedUrl)
    {
        using var httpClient = httpClientFactory.CreateClient();

        var response = await httpClient.GetAsync(presignedUrl, HttpCompletionOption.ResponseHeadersRead);

        response.EnsureSuccessStatusCode();

        var contentDisposition = response.Content.Headers.ContentDisposition;

        var fileName =
            contentDisposition?.FileNameStar ??
            contentDisposition?.FileName ??
            "downloaded-file";

        fileName = fileName?.Trim('"');

        return new FileStreamResponse
        {
            Data = await response.Content.ReadAsStreamAsync(),
            ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream",
            FileName = fileName
        };
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder)
    {
        try
        {
            var folderPath = Path.Combine(_baseStoragePath, folder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative path for database storage
            return Path.Combine(folder, fileName).Replace("\\", "/");
        }
        catch (Exception ex)
        {
            throw new BadRequestException($"Failed to save file: {ex.Message}");
        }
    }

    public async Task<List<string>> SaveMultipleFilesAsync(List<IFormFile> files, string folder)
    {
        var savedPaths = new List<string>();

        foreach (var file in files)
        {
            try
            {
                var path = await SaveFileAsync(file, folder);
                savedPaths.Add(path);
            }
            catch (Exception ex)
            {
                // If any file fails, delete previously saved files
                foreach (var savedPath in savedPaths)
                {
                    await DeleteFileAsync(savedPath);
                }
                throw new Exception($"Failed to save files: {ex.Message}");
            }
        }

        return savedPaths;
    }
}
