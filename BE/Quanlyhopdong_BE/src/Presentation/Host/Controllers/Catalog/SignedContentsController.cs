using Application.Catalog.SignedContents.Commands;
using Application.Catalog.SignedContents.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class SignedContentsController : BaseAuthController
{
    [HttpGet("level3code/{level3CodeId:guid}")]
    public async Task<IActionResult> GetSignedContentsByLevel3CodeIdAsync(Guid level3CodeId)
    {
        var result = await Mediator.Send(new GetSignedContentsByLevel3CodeIdQuery(level3CodeId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSignedContentAsync([FromQuery] string? search)
    {
        IList<SignedContentDto> result = await Mediator.Send(new GetAllSignedContentQuery(search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSignedContentByIdAsync(Guid id)
    {
        SignedContentDto? result = await Mediator.Send(new GetSignedContentByIdQuery(id));
        if (result == null)
        {
            return NotFound(MessageCommon.DataNotFound);
        }

        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSignedContentAsync([FromBody] CreateSignedContentRequest createModel)
    {
        Guid result = await Mediator.Send(new CreateSignedContentCommand(createModel.Title, createModel.Level3CodeId));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSignedContentAsync([FromBody] UpdateSignedContentRequest updateModel)
    {
        bool result = await Mediator.Send(new UpdateSignedContentCommand(updateModel.Id, updateModel.Title, updateModel.Level3CodeId));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteSignedContentAsync([FromBody] IList<Guid> deleteIds)
    {
        bool result = await Mediator.Send(new DeleteSignedContentCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
