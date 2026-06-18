using Application.Catalog.Contracts.Commands;
using Application.Catalog.Contracts.Queries;
using Application.Dto.Catalog;
using Domain.Common.Enums;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractsController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllContractAsync([FromQuery] string? search, [FromQuery] Guid? contractTypeId, [FromQuery] Guid? departmentId, [FromQuery] Guid? partnerId,
        [FromQuery] ContractStatus? status, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] IList<ContractFormat>? formats, [FromQuery] bool? IsArchiveContract, [FromQuery] bool? IsDebtTrackingEnabled)
    {
        var result = await Mediator.Send(new GetAllContractQuery(search, contractTypeId, departmentId, partnerId, status, startDate, endDate, formats, IsArchiveContract, IsDebtTrackingEnabled));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("my-visible")]
    public async Task<IActionResult> GetMyVisibleContractsAsync([FromQuery] string? search, [FromQuery] Guid? contractTypeId, [FromQuery] Guid? departmentId, [FromQuery] Guid? partnerId,
        [FromQuery] ContractStatus? status, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] IList<ContractFormat>? formats, [FromQuery] bool? IsArchiveContract, [FromQuery] bool? IsDebtTrackingEnabled)
    {
        var result = await Mediator.Send(new GetMyVisibleContractsQuery(search, contractTypeId, departmentId, partnerId, status, startDate, endDate, formats, IsArchiveContract, IsDebtTrackingEnabled));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("soon-expired")]
    public async Task<IActionResult> GetSoonExpiredContracts([FromQuery] ContractFormat? contractFormat)
    {
        var result = await Mediator.Send(new GetAllSoonExpiredContractQuery(contractFormat));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("payment-due-soon")]
    public async Task<IActionResult> GetPaymentDueSoonContracts([FromQuery] ContractFormat? contractFormat)
    {
        var result = await Mediator.Send(new GetAllContractsWithPaymentDueSoonQuery(contractFormat));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateContractAsync([FromBody] CreateContractDto CreateModel)
    {
        var result = await Mediator.Send(new CreateContractCommand(CreateModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPost("upload-contract")]
    public async Task<IActionResult> UploadContractAsync([FromForm] List<IFormFile> ContractFile, [FromForm] string ContractNumber)
    {
        var result = await Mediator.Send(new UploadContractCommand(ContractFile, ContractNumber));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPost("upload-attachments")]
    public async Task<IActionResult> UploadAttachmentAsync([FromForm] List<IFormFile> AttachmentFiles, [FromForm] string ContractNumber)
    {
        var result = await Mediator.Send(new UploadAttachmentCommand(AttachmentFiles, ContractNumber));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetContractByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{contractId}/items")]
    public async Task<IActionResult> GetContractItemsAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractItemsQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{contractId}/payment-schedules")]
    public async Task<IActionResult> GetContractPaymentSchedulesAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractPaymentSchedulesQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("histories")]
    public async Task<IActionResult> GetCurrentUserContractApprovalHistoryAsync()
    {
        var result = await Mediator.Send(new GetCurrentUserContractApprovalHistory());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateContractByIdAsync(Guid id, [FromBody] UpdateContractDto updateModel)
    {
        var result = await Mediator.Send(new UpdateContractCommand(id, updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteContractListAsync([FromBody] List<Guid> DeleteIds)
    {
        var result = await Mediator.Send(new DeleteContractListCommand(DeleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }

    [HttpGet("{contractId}/history")]
    public async Task<IActionResult> GetContractAprrovalHistoryByIdAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractApporvalHistoryQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost("{contractId}/approve")]
    public async Task<IActionResult> AproveContractAsync(Guid contractId, [FromBody] ApproveContractDto ApproveModel)
    {
        var result = await Mediator.Send(new ApproveContractCommand(contractId, ApproveModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPost("{contractId}/submit-for-approval")]
    public async Task<IActionResult> SubmitForApprovalAsync(Guid contractId)
    {
        var result = await Mediator.Send(new SubmitForApprovalCommand(contractId));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpPost("activate")]
    public async Task<IActionResult> ActivateContractAsync([FromBody] ActivateContractDto ActivateModel)
    {
        var result = await Mediator.Send(new ActivateContractCommand(ActivateModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPost("{contractId}/pause")]
    public async Task<IActionResult> PauseContractAsync(Guid contractId, [FromBody] PauseContractRequest? request)
    {
        var result = await Mediator.Send(new PauseContractCommand(contractId, request?.Reason));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpPost("{contractId}/resume")]
    public async Task<IActionResult> ResumeContractAsync(Guid contractId, [FromBody] ResumeContractRequest? request)
    {
        var result = await Mediator.Send(new ResumeContractCommand(contractId, request?.Reason));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpPost("{contractId}/cancel")]
    public async Task<IActionResult> CancelContractAsync(Guid contractId, [FromBody] CancelContractRequest? request)
    {
        var result = await Mediator.Send(new CancelContractCommand(contractId, request?.Reason));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpPost("{contractId}/archive")]
    public async Task<IActionResult> ArchiveContractAsync(Guid contractId)
    {
        var result = await Mediator.Send(new ArchiveContractCommand(contractId));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Chuẩn bị dữ liệu để gia hạn hợp đồng
    /// Trả về thông tin hợp đồng cũ để pre-fill form tạo hợp đồng mới
    /// </summary>
    [HttpGet("{contractId}/prepare-extension")]
    public async Task<IActionResult> PrepareContractExtensionAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractForExtensionQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("pending-approval")]
    public async Task<IActionResult> GetPendingApprovalContractAsync([FromQuery] ContractStatus? status = null, [FromQuery] ContractSubStatus? subStatus = null)
    {
        var result = await Mediator.Send(new GetPenndingApprovalContractQuery(status, subStatus));
        return Ok(result, MessageCommon.GetDataSuccess);
    }
}

public record PauseContractRequest(string? Reason);
public record ResumeContractRequest(string? Reason);
public record CancelContractRequest(string? Reason);
