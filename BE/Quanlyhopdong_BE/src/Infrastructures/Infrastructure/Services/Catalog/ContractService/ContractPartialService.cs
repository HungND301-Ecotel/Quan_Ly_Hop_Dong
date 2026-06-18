using System.Net.Http.Json;
using Application.Common.Exceptions;
using Application.Dto.Catalog;
using Application.Dto.Cloud.AWS;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using iText.Bouncycastle.Crypto;
using iText.Bouncycastle.X509;
using iText.Commons.Bouncycastle.Cert;
using iText.Commons.Bouncycastle.Crypto;
using iText.IO.Font.Constants;
using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Signatures;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Catalog;

public partial class ContractService
{

    public async Task<List<SignatureInfoDto>> GetSignatureInfoAsync(string filePath)
    {
        var result = new List<SignatureInfoDto>();

        if (!File.Exists(filePath))
        {
            return result;
        }

        using var reader = new PdfReader(filePath);
        using var pdfDoc = new PdfDocument(reader);

        var signUtil = new SignatureUtil(pdfDoc);
        var signatures = signUtil.GetSignatureNames();

        foreach (var sigName in signatures)
        {
            var pkcs7 = signUtil.ReadSignatureData(sigName);
            var cert = pkcs7.GetSigningCertificate();

            result.Add(new SignatureInfoDto
            {
                SignatureName = sigName,
                SignerName = cert.GetSubjectDN().ToString(),
                SignDate = pkcs7.GetSignDate(),
                Reason = pkcs7.GetReason(),
                Location = pkcs7.GetLocation()
            });
        }

        return result;
    }

    public async Task<SignatureResultDto> SignContractAsync(ContractSigningFlow flow, Guid? userSignatureId, string? certificateUuid, string? pin, Guid userId)
    {

        if (flow.Status == SigningFlowStatus.Signed)
        {
            throw new ConflictException("Bạn đã ký hợp đồng này rồi");
        }
        var contract = flow.Contract;

        string filePath = contract.FilePath;
        if (!string.IsNullOrEmpty(contract.SignedFilePath))
        {
            filePath = contract.SignedFilePath;
        }

        if (string.IsNullOrEmpty(filePath))
        {
            throw new NotFoundException("Không tìm thấy file hợp đồng");
        }

        var filePaths = filePath.Split(';', StringSplitOptions.RemoveEmptyEntries);
        if (filePaths.Length == 0)
        {
            throw new NotFoundException("Không tìm thấy file hợp đồng");
        }

        var x = (float)(flow.PositionX ?? 100);
        var y = (float)(flow.PositionY ?? 100);
        var width = (float)(flow.Width ?? DEFAULT_WIDTH);
        var height = (float)(flow.Height ?? DEFAULT_HEIGHT);
        var pageNumber = flow.PageNumber ?? 1;
        var signatureType = flow.SignatureType;

        var signedFilePaths = new List<string>();
        string mainSignedFilePath = "";
        string lastSignatureHash = "";

        // 1. Sign main contract files
        for (int i = 0; i < filePaths.Length; i++)
        {
            string currentPath = filePaths[i];
            if (currentPath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            {
                // Download from S3
                var awsFileDownloadPath = await awsS3Service.GetPresignedDownloadUrl(currentPath, Application.Dto.Cloud.AWS.BucketType.SourceDefault);
                var pdfBytes = await fileStorageService.GetFileBytesFromPresignedUrlAsync(awsFileDownloadPath);

                // Adjust page count
                int adjustedPageNumber = pageNumber;
                try
                {
                    using var tempMs = new MemoryStream(pdfBytes);
                    using var tempReader = new PdfReader(tempMs);
                    using var tempPdfDoc = new PdfDocument(tempReader);
                    int totalPages = tempPdfDoc.GetNumberOfPages();
                    if (adjustedPageNumber > totalPages)
                    {
                        adjustedPageNumber = totalPages;
                    }
                    if (adjustedPageNumber < 1)
                    {
                        adjustedPageNumber = 1;
                    }
                }
                catch
                {
                    // Fallback
                }

                // Sign the PDF
                byte[] signedPdfBytes;
                string signatureHash;
                if (signatureType == SignatureType.Digital)
                {
                    (signedPdfBytes, signatureHash) = await SignWithDigitalCAAsync(
                        pdfBytes, certificateUuid, pin, userId, x, y, width, height, adjustedPageNumber);
                }
                else
                {
                    if (!userSignatureId.HasValue)
                    {
                        throw new ConflictException("Vui lòng chọn chữ ký trong profile của bạn");
                    }
                    (signedPdfBytes, signatureHash) = await SignWithImageAsync(
                        pdfBytes, (Guid)userSignatureId, userId, x, y, width, height, adjustedPageNumber);
                }

                // Save signed file
                string originalFileName = System.IO.Path.GetFileName(currentPath);
                var signedFilePath = await SaveSignedPdfAsync(signedPdfBytes, contract.ContractNumber, originalFileName, userId);
                signedFilePaths.Add(signedFilePath);

                if (i == 0)
                {
                    mainSignedFilePath = signedFilePath;
                }
                lastSignatureHash = signatureHash;
            }
            else
            {
                // Keep non-PDF as they are
                signedFilePaths.Add(currentPath);
            }
        }

        var newSignedFilePath = string.Join(";", signedFilePaths);

        // 2. Sign attachments
        var attachments = await _contractAttachmentRepo.GetAllAsync(predicate: a => a.ContractId == contract.Id, disableTracking: false);
        foreach (var attachment in attachments)
        {
            if (attachment.FilePath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) || 
                (attachment.FileType != null && attachment.FileType.Equals(".pdf", StringComparison.OrdinalIgnoreCase)))
            {
                // Download from S3
                var awsFileDownloadPath = await awsS3Service.GetPresignedDownloadUrl(attachment.FilePath, Application.Dto.Cloud.AWS.BucketType.SourceDefault);
                var pdfBytes = await fileStorageService.GetFileBytesFromPresignedUrlAsync(awsFileDownloadPath);

                // Adjust page count
                int adjustedPageNumber = pageNumber;
                try
                {
                    using var tempMs = new MemoryStream(pdfBytes);
                    using var tempReader = new PdfReader(tempMs);
                    using var tempPdfDoc = new PdfDocument(tempReader);
                    int totalPages = tempPdfDoc.GetNumberOfPages();
                    if (adjustedPageNumber > totalPages)
                    {
                        adjustedPageNumber = totalPages;
                    }
                    if (adjustedPageNumber < 1)
                    {
                        adjustedPageNumber = 1;
                    }
                }
                catch
                {
                    // Fallback
                }

                // Sign the PDF
                byte[] signedPdfBytes;
                string signatureHash;
                if (signatureType == SignatureType.Digital)
                {
                    (signedPdfBytes, signatureHash) = await SignWithDigitalCAAsync(
                        pdfBytes, certificateUuid, pin, userId, x, y, width, height, adjustedPageNumber);
                }
                else
                {
                    if (!userSignatureId.HasValue)
                    {
                        throw new ConflictException("Vui lòng chọn chữ ký trong profile của bạn");
                    }
                    (signedPdfBytes, signatureHash) = await SignWithImageAsync(
                        pdfBytes, (Guid)userSignatureId, userId, x, y, width, height, adjustedPageNumber);
                }

                // Save signed file
                var signedFilePath = await SaveSignedPdfAsync(signedPdfBytes, contract.ContractNumber, attachment.FileName, userId);

                // Update attachment entity path & name
                string newFileName = attachment.FileName;
                if (!newFileName.EndsWith("_signed.pdf", StringComparison.OrdinalIgnoreCase))
                {
                    string baseName = System.IO.Path.GetFileNameWithoutExtension(newFileName);
                    newFileName = $"{baseName}_signed.pdf";
                }
                attachment.UpdateSignedAttachment(signedFilePath, newFileName);
                _contractAttachmentRepo.Update(attachment);
            }
        }

        // 6. Update contract
        contract.SetSignedFilePath(newSignedFilePath);
        _contractRepo.Update(contract);

        // 7. Update flow
        flow.Sign(mainSignedFilePath, lastSignatureHash);
        _contractSigningFlowRepo.Update(flow);

        // 8. Create signing history
        var history = SigningHistory.Create(flow.Id, userSignatureId, "Signed", GetDeviceInfo(), "Vietnam", !string.IsNullOrEmpty(pin));

        await _signingHistoryRepo.InsertAsync(history);

        await unitOfWork.SaveChangesAsync();

        return new SignatureResultDto
        {
            Success = true,
            Message = "Ký hợp đồng thành công",
            SignedFilePath = mainSignedFilePath,
            SignatureHash = lastSignatureHash,
            SignedAt = DateTime.UtcNow
        };
    }

    public async Task<bool> VerifySignatureAsync(string filePath)
    {
        try
        {
            if (!File.Exists(filePath))
            {
                return false;
            }

            using var reader = new PdfReader(filePath);
            using var pdfDoc = new PdfDocument(reader);

            var signUtil = new SignatureUtil(pdfDoc);
            var signatures = signUtil.GetSignatureNames();

            return signatures.Count > 0;
        }
        catch
        {
            return false;
        }
    }

    #region helper

    private async Task<(byte[] signedPdf, string hash)> SignWithDigitalCAAsync(
           byte[] pdfBytes, string certificateUuid, string pin,
           Guid userId, float x, float y, float width, float height, int pageNumber)
    {
        if (string.IsNullOrEmpty(certificateUuid))
        {
            throw new BadRequestException("Vui lòng nhập Agreement UUID");
        }

        if (string.IsNullOrEmpty(pin))
        {
            throw new BadRequestException("Vui lòng nhập PIN");
        }

        // 1. Verify PIN with CA server
        var caConfig = configuration.GetSection("DigitalCA");
        var caServerUrl = caConfig["ServerUrl"];
        var apiKey = caConfig["ApiKey"];

        var verified = await VerifyPinWithCAAsync(certificateUuid, pin, caServerUrl, apiKey);
        if (!verified)
        {
            throw new ConflictException("PIN không đúng hoặc certificate không hợp lệ");
        }

        // 2. Get certificate from CA
        var (cert, privateKey) = await GetCertificateFromCAAsync(
            certificateUuid, pin, caServerUrl, apiKey);

        // 3. Add visual marker
        var visualBytes = await AddCAVisualMarkerAsync(
            pdfBytes, x, y, width, height, pageNumber);

        // 4. Apply CA digital signature
        var signedBytes = await ApplyCASignatureAsync(visualBytes, cert, privateKey);

        // 5. Calculate hash
        var hash = CalculateHash(signedBytes);

        return (signedBytes, hash);
    }

    private async Task<byte[]> ApplyCASignatureAsync(
        byte[] pdfBytes, IX509Certificate cert, IPrivateKey privateKey)
    {
        using var ms = new MemoryStream();
        using var reader = new PdfReader(new MemoryStream(pdfBytes));
        var signer = new PdfSigner(reader, ms, new StampingProperties());

        // Configure signature
        signer.SetCertificationLevel(PdfSigner.NOT_CERTIFIED);
        signer.SetReason("Signed with Digital CA")
            .SetLocation("Vietnam");

        // Create signature
        IExternalSignature pks = new PrivateKeySignature(privateKey, DigestAlgorithms.SHA256);
        IX509Certificate[] chain = new IX509Certificate[] { cert };

        // Sign PDF
        signer.SignDetached(pks, chain, null, null, null, 0, PdfSigner.CryptoStandard.CMS);

        return ms.ToArray();
    }

    private async Task<byte[]> AddCAVisualMarkerAsync(
        byte[] pdfBytes, float x, float y, float width, float height, int pageNumber)
    {
        width = width > 0 ? Math.Max(width, (float)MIN_WIDTH) : (float)DEFAULT_WIDTH;
        height = height > 0 ? Math.Max(height, (float)MIN_HEIGHT) : (float)DEFAULT_HEIGHT;

        using var ms = new MemoryStream();
        using var reader = new PdfReader(new MemoryStream(pdfBytes));
        using var writer = new PdfWriter(ms);
        using var pdfDoc = new PdfDocument(reader, writer);

        var page = pdfDoc.GetPage(pageNumber);
        var canvas = new PdfCanvas(page);

        // Draw CA signature marker
        canvas.SaveState();

        // Draw border
        canvas.SetStrokeColor(ColorConstants.BLUE);
        canvas.SetLineWidth(2);
        canvas.Rectangle(x, y, width, height);
        canvas.Stroke();

        // Draw text
        canvas.BeginText();
        canvas.SetFontAndSize(PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD), 12);
        canvas.SetColor(ColorConstants.BLUE, true);
        canvas.MoveText(x + 10, y + height / 2 + 10);
        canvas.ShowText("KY SO CA");
        canvas.EndText();

        // Draw timestamp
        canvas.BeginText();
        canvas.SetFontAndSize(PdfFontFactory.CreateFont(StandardFonts.HELVETICA), 8);
        canvas.SetColor(ColorConstants.DARK_GRAY, true);
        var timestamp = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");
        canvas.MoveText(x + 10, y + height / 2 - 10);
        canvas.ShowText(timestamp);
        canvas.EndText();

        canvas.RestoreState();

        pdfDoc.Close();
        return ms.ToArray();
    }

    private async Task<(IX509Certificate cert, IPrivateKey privateKey)> GetCertificateFromCAAsync(
        string certificateUuid, string pin, string caServerUrl, string apiKey)
    {
        try
        {
            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-API-Key", apiKey);

            var request = new
            {
                uuid = certificateUuid,
                pin = pin
            };

            var response = await client.PostAsJsonAsync(
                $"{caServerUrl}/api/get-certificate", request);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<CACertificateResponse>();

            // Parse certificate
            var certBytes = Convert.FromBase64String(result.Certificate);
            var privateKeyBytes = Convert.FromBase64String(result.PrivateKey);

            // Load using BouncyCastle
            var parser = new Org.BouncyCastle.X509.X509CertificateParser();
            var bouncyCert = parser.ReadCertificate(certBytes);

            var keyFactory = Org.BouncyCastle.Security.PrivateKeyFactory.CreateKey(privateKeyBytes);

            // Convert to iText format
            var cert = new X509CertificateBC(bouncyCert);
            var privateKey = new PrivateKeyBC(keyFactory);

            return (cert, privateKey);
        }
        catch (Exception ex)
        {
            throw new BadRequestException($"Lỗi lấy certificate từ CA: {ex.Message}");
        }
    }

    private async Task<bool> VerifyPinWithCAAsync(
    string certificateUuid, string pin, string caServerUrl, string apiKey)
    {
        try
        {
            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-API-Key", apiKey);

            var request = new
            {
                uuid = certificateUuid,
                pin = pin
            };

            var response = await client.PostAsJsonAsync(
                $"{caServerUrl}/api/verify-pin", request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<CAVerifyResponse>();
                return result?.Success == true;
            }

            return false;
        }
        catch (Exception ex)
        {
            throw new BadRequestException($"Lỗi kết nối CA server: {ex.Message}");
        }
    }

    private async Task<(byte[] signedPdf, string hash)> SignWithImageAsync(
        byte[] pdfBytes, Guid userSignatureId, Guid userId,
        float x, float y, float width, float height, int pageNumber)
    {
        var signature = await _userSignatureRepo.FindAsync(userSignatureId);
        if (signature == null || signature.UserId != userId)
        {
            throw new NotFoundException("Không tìm thấy chữ ký");
        }

        if (string.IsNullOrEmpty(signature.SignatureFile))
        {
            throw new NotFoundException("File chữ ký không tồn tại. Vui lòng upload lại trong profile");
        }

        string awsFileDownloadPath = await awsS3Service.GetPresignedDownloadUrl(signature.SignatureFile, Application.Dto.Cloud.AWS.BucketType.SourceDefault);
        byte[] imageBytes;
        using (var httpClient = new HttpClient())
        {
            imageBytes = await httpClient.GetByteArrayAsync(new Uri(awsFileDownloadPath));
        }
        var signatureBase64 = Convert.ToBase64String(imageBytes);

        // 3. Add visual signature to PDF
        var signedBytes = await AddImageToPdfAsync(
            pdfBytes, signatureBase64, x, y, width, height, pageNumber);

        // 4. Apply internal certificate for integrity protection
        signedBytes = await ApplyInternalCertificateAsync(signedBytes, userId, signature.SignatureType.ToString());

        // 5. Calculate hash
        var hash = CalculateHash(signedBytes);

        return (signedBytes, hash);
    }

    private async Task<byte[]> ApplyInternalCertificateAsync(byte[] pdfBytes, Guid userId, string signatureType)
    {
        using var ms = new MemoryStream();

        // Create internal certificate
        var (cert, privateKey) = CreateInternalCertificate(userId, signatureType);

        using var reader = new PdfReader(new MemoryStream(pdfBytes));
        var signer = new PdfSigner(reader, ms, new StampingProperties());

        // Configure signature
        signer.SetCertificationLevel(PdfSigner.NOT_CERTIFIED);
        signer.SetReason($"Signed by User {userId} - {signatureType}")
            .SetLocation("Vietnam");

        // Create signature
        IExternalSignature pks = new PrivateKeySignature(privateKey, DigestAlgorithms.SHA256);
        IX509Certificate[] chain = new IX509Certificate[] { cert };

        // Sign PDF
        signer.SignDetached(pks, chain, null, null, null, 0, PdfSigner.CryptoStandard.CMS);

        return ms.ToArray();
    }

    private (IX509Certificate cert, IPrivateKey privateKey) CreateInternalCertificate(Guid userId, string signatureType)
    {
        // Generate key pair
        var keyPairGenerator = new Org.BouncyCastle.Crypto.Generators.RsaKeyPairGenerator();
        keyPairGenerator.Init(new Org.BouncyCastle.Crypto.KeyGenerationParameters(
            new Org.BouncyCastle.Security.SecureRandom(), 2048));
        var keyPair = keyPairGenerator.GenerateKeyPair();

        // Create certificate
        var certGenerator = new Org.BouncyCastle.X509.X509V3CertificateGenerator();
        var serialNumber = Org.BouncyCastle.Math.BigInteger.ProbablePrime(120, new Random());

        certGenerator.SetSerialNumber(serialNumber);
        certGenerator.SetIssuerDN(new Org.BouncyCastle.Asn1.X509.X509Name($"CN=ContractSystem User {userId}"));
        certGenerator.SetSubjectDN(new Org.BouncyCastle.Asn1.X509.X509Name($"CN=User {userId} - {signatureType}"));
        certGenerator.SetNotBefore(DateTime.UtcNow.AddDays(-1));
        certGenerator.SetNotAfter(DateTime.UtcNow.AddYears(10));
        certGenerator.SetPublicKey(keyPair.Public);

        var signatureFactory = new Org.BouncyCastle.Crypto.Operators.Asn1SignatureFactory(
            "SHA256WithRSA", keyPair.Private);
        var bouncyCert = certGenerator.Generate(signatureFactory);

        // Convert to iText format
        var cert = new X509CertificateBC(bouncyCert);
        var privateKey = new PrivateKeyBC(keyPair.Private);

        return (cert, privateKey);
    }


    private async Task<byte[]> AddImageToPdfAsync(
        byte[] pdfBytes, string imageBase64,
        float x, float y, float width, float height, int pageNumber)
    {
        // Validate dimensions
        width = width > 0 ? Math.Max(width, (float)MIN_WIDTH) : (float)DEFAULT_WIDTH;
        height = height > 0 ? Math.Max(height, (float)MIN_HEIGHT) : (float)DEFAULT_HEIGHT;

        using var ms = new MemoryStream();
        using var reader = new PdfReader(new MemoryStream(pdfBytes));
        using var writer = new PdfWriter(ms);
        using var pdfDoc = new PdfDocument(reader, writer);

        var page = pdfDoc.GetPage(pageNumber);

        // 🔑 LẤY SIZE TRANG ĐÚNG (có rotation)
        var pageSize = page.GetPageSizeWithRotation();
        var pageHeight = pageSize.GetHeight();

        var canvas = new PdfCanvas(page);

        try
        {
            var imageBytes = Convert.FromBase64String(imageBase64);
            var imageData = ImageDataFactory.Create(imageBytes);

            // 🔥 INVERT Y
            var pdfY = pageHeight - y - height;

            var rect = new Rectangle(x, pdfY, width, height);

            // Add image
            canvas.AddImageFittedIntoRectangle(imageData, rect, false);

            // Add timestamp dưới chữ ký
            DrawTimestamp(canvas, x, pdfY, width);
        }
        catch (Exception ex)
        {
            throw new ConflictException($"Lỗi thêm chữ ký vào PDF: {ex.Message}");
        }

        pdfDoc.Close();
        return ms.ToArray();
    }

    private void DrawTimestamp(PdfCanvas canvas, float x, float y, float width)
    {
        canvas.SaveState();
        canvas.BeginText();
        canvas.SetFontAndSize(PdfFontFactory.CreateFont(StandardFonts.HELVETICA), 8);
        canvas.SetColor(ColorConstants.RED, true);
        var timestamp = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");
        canvas.MoveText(x + width / 2 - 35, y - 12);
        canvas.ShowText(timestamp);
        canvas.EndText();
        canvas.RestoreState();
    }

    private string CalculateHash(byte[] data)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hashBytes = sha256.ComputeHash(data);
        return Convert.ToBase64String(hashBytes);
    }

    private string GetDeviceInfo()
    {
        return "Web Browser";
    }

    bool IsPdf(byte[] bytes)
    {
        return bytes.Length > 4 &&
               bytes[0] == 0x25 && // %
               bytes[1] == 0x50 && // P
               bytes[2] == 0x44 && // D
               bytes[3] == 0x46;   // F
    }

    private async Task<string> SaveSignedPdfAsync(byte[] pdfBytes, string contractNumber, string originalFileName, Guid userId)
    {
        string fileNameWithoutExtension = System.IO.Path.GetFileNameWithoutExtension(originalFileName);
        // Clean originalFileName if it contains folder structures
        if (fileNameWithoutExtension.Contains("/"))
        {
            fileNameWithoutExtension = fileNameWithoutExtension.Substring(fileNameWithoutExtension.LastIndexOf("/") + 1);
        }
        if (fileNameWithoutExtension.Contains("\\"))
        {
            fileNameWithoutExtension = fileNameWithoutExtension.Substring(fileNameWithoutExtension.LastIndexOf("\\") + 1);
        }

        var fileName = $"{fileNameWithoutExtension}_signed.pdf";

        var inputModel = new AwsInputModel
        {
            FileId = Guid.NewGuid(),
            FileName = fileName,
            BucketType = Application.Dto.Cloud.AWS.BucketType.SourceDefault,
            Module = $"contracts/{contractNumber}/signed",
            ContentType = IsPdf(pdfBytes) ? "application/pdf" : "application/octet-stream",
            IsExpires = true
        };

        var resultModel = await awsS3Service.UploadFileAsync(pdfBytes, inputModel);

        return resultModel.Path.Replace("\\", "/");
    }

    public async Task<List<ContractItemDto>> GetContractItemsByContractIdAsync(Guid contractId)
    {
        // Verify contract exists
        var contract = await _contractRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == contractId,
            disableTracking: true);

        if (contract == null)
        {
            throw new NotFoundException($"Contract with ID {contractId} not found");
        }

        // Get all contract items with material information
        var contractItems = await _contractItemRepo.GetAllAsync(
            predicate: ci => ci.ContractId == contractId,
            include: ci => ci.Include(x => x.Material),
            orderBy: q => q.OrderBy(ci => ci.Material.MaterialCode),
            disableTracking: true);

        // Map to DTOs
        var result = contractItems.Select(ci => new ContractItemDto
        {
            Id = ci.Id,
            ContractId = ci.ContractId,
            MaterialId = ci.MaterialId,
            MaterialCode = ci.Material.MaterialCode,
            MaterialName = ci.Material.Name,
            Quantity = ci.Quantity,
            Price = ci.Price,
            Amount = ci.Amount
        }).ToList();

        return result;
    }

    #endregion
}

