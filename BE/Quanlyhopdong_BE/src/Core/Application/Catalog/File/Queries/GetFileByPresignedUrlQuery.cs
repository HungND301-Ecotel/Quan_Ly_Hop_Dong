using Application.Common.Exceptions;
using Application.Dto.Catalog;
using Application.Interfaces.Infrastructures.Integrates.Cloud.Service.AWS;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.File.Queries;

public record class GetFileByPresignedUrlQuery(GetFileRequest FileRequest) : IRequest<FileStreamResponse>;

public class GetFileByPresignedUrlQueryHandler(IFileStorageService fileStorageService, IAwsS3Service awsS3Service) : IRequestHandler<GetFileByPresignedUrlQuery, FileStreamResponse>
{
    public async Task<FileStreamResponse> Handle(GetFileByPresignedUrlQuery request, CancellationToken cancellationToken)
    {
        string url = request.FileRequest.PresignedUrl;

        // 1. Nếu chưa có PresignedUrl nhưng có S3 Path thì mới đi lấy URL mới
        if (string.IsNullOrEmpty(url))
        {
            if (string.IsNullOrEmpty(request.FileRequest.FileS3Path))
            {
                throw new BadRequestException("Cần cung cấp PresignedUrl hoặc FileS3Path");
            }

            url = await awsS3Service.GetPresignedDownloadUrl(
                request.FileRequest.FileS3Path,
                Application.Dto.Cloud.AWS.BucketType.SourceDefault);
        }

        bool isUri = Uri.TryCreate(url, UriKind.Absolute, out Uri uriResult)
                     && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);

        if (!isUri)
        {
            throw new BadRequestException("URL không hợp lệ");
        }

        if (!awsS3Service.IsAwsUrlExpired(url))
        {
            throw new BadRequestException("AWS Presigned URL đã hết hạn");
        }

        // 4. Lấy luồng dữ liệu tệp
        return await fileStorageService.GetFileStreamAsync(url);
    }
}

public class GetFileRequest
{
    public string PresignedUrl { get; set; } = string.Empty;
    public string FileS3Path { get; set; } = string.Empty;
}