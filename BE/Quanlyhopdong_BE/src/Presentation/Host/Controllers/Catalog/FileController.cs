using Application.Catalog.File.Queries;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace Host.Controllers.Catalog;

public class FileController : BaseAuthController
{

    [HttpPost]
    public async Task<IActionResult> GetFileByUrl([FromBody] GetFileRequest request)
    {
        var result = await Mediator.Send(new GetFileByPresignedUrlQuery(request));
        return File(result.Data, result.ContentType);
    }
}
