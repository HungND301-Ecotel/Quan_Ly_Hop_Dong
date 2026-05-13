using Application.Dto.Catalog;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces.Services.Catalog;

public interface IFileStorageService
{
    public Task<FileStreamResponse> GetFileStreamAsync(string presignedUrl);
    public Task<byte[]> GetFileBytesFromPresignedUrlAsync(string presignedUrl);

    Task<string> SaveFileAsync(IFormFile file, string folder);
    Task<bool> DeleteFileAsync(string filePath);
    Task<List<string>> SaveMultipleFilesAsync(List<IFormFile> files, string folder);
}
