using Application.Catalog.ContractPayment.Commands;
using Application.Catalog.ContractPayment.Queries;
using Application.Catalog.Contracts.Queries;
using Application.Dto.Catalog;
using Application.Dto.Catalog.ContractPayment;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractPaymentController : BaseAuthController
{
    /// <summary>
    /// Get contract payments by contract ID
    /// </summary>
    /// <param name="contractId">The contract ID</param>
    /// <returns>Contract payment details with total amount and liquidation file</returns>
    [HttpGet("contract/{contractId}")]
    [ProducesResponseType(typeof(ContractPaymentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByContractIdAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractPaymentsByContractIdQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Update contract payments in batch with smart operations
    /// If Id provided ? Update
    /// If Id null/empty ? Create
    /// If exists in DB but not in request ? Delete
    /// </summary>
    /// <param name="request">Batch request containing payment items</param>
    /// <returns>Batch operation result</returns>
    [HttpPut("batch")]
    [ProducesResponseType(typeof(UpdateContractPaymentBatchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBatchAsync([FromBody] UpdateContractPaymentBatchRequest request)
    {
        var result = await Mediator.Send(new UpdateContractPaymentBatchCommand(request));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Update liquidation file for contract
    /// </summary>
    /// <param name="contractId">Contract ID</param>
    /// <param name="request">Liquidation file request</param>
    /// <returns>Success response</returns>
    [HttpPut("liquidation/{contractId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLiquidationFileAsync(
        Guid contractId,
        [FromBody] UpdateLiquidationFileRequest request)
    {
        if (contractId != request.ContractId)
        {
            return BadRequest("ID mismatch");
        }

        await Mediator.Send(new UpdateLiquidationFileCommand(request));
        return Ok(MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Get comprehensive contract management report (XDCB report format)
    /// </summary>
    /// <param name="contractId">The contract ID</param>
    /// <returns>Complete contract report with all details</returns>
    [HttpGet("report/{contractId}")]
    [ProducesResponseType(typeof(ContractReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetContractReportAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractReportQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Get all contract reports (XDCB report format)
    /// </summary>
    /// <param name="query">Filter conditions for report search</param>
    /// <returns>List of all contract reports</returns>
    [HttpGet("reports")]
    [ProducesResponseType(typeof(List<ContractReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllContractReportsAsync([FromQuery] GetAllContractReportsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Get material unit price report grouped by contract
    /// </summary>
    /// <param name="query">Filter conditions for report search</param>
    /// <returns>List of contract material unit price reports</returns>
    [HttpPost("material-unit-price-reports")]
    [ProducesResponseType(typeof(List<ContractMaterialUnitPriceReportByYearDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetContractMaterialUnitPriceReportsAsync(
        [FromBody] GetContractMaterialUnitPriceReportsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Upload payment file (AcceptanceReport, Invoice, Tax, or Liquidation)
    /// </summary>
    /// <param name="file">File to upload</param>
    /// <param name="contractId">Contract ID</param>
    /// <param name="fileType">File type (0=AcceptanceReport, 1=Invoice, 2=Tax, 3=Liquidation)</param>
    /// <returns>Upload result with file path</returns>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(UploadPaymentFileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadFileAsync(
        [FromForm] IFormFile file,
        [FromForm] Guid contractId,
        [FromForm] PaymentFileType fileType)
    {
        var request = new UploadPaymentFileRequest
        {
            ContractId = contractId,
            FileType = fileType
        };

        var result = await Mediator.Send(new UploadPaymentFileCommand(file, request));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPost("invoice/sync")]
    [ProducesResponseType(typeof(Application.Dto.Catalog.SyncInvoiceResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SyncInvoiceFromExternalDbAsync([FromBody] Application.Dto.Catalog.SyncInvoiceByContractRequest request)
    {
        var result = await Mediator.Send(new SyncInvoiceCommand(request));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpPost("tax/sync")]
    [ProducesResponseType(typeof(Application.Dto.Catalog.SyncTaxResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SyncTaxFromExternalDbAsync([FromBody] Application.Dto.Catalog.SyncTaxByContractRequest request)
    {
        var result = await Mediator.Send(new SyncTaxCommand(request));
        return Ok(result, MessageCommon.UpdateSuccess);
    }
}

