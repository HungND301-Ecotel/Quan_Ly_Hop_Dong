using Application.Catalog.BankAccount.Commands;
using Application.Catalog.BankAccount.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class BankAccountsController : BaseAuthController
{
    /// <summary>
    /// Get all bank accounts with optional filters
    /// </summary>
    /// <param name="isActive">Filter by active status (null = all, true = active only, false = inactive only)</param>
    /// <param name="search">Search by bank name, account number, or account holder</param>
    [HttpGet]
    public async Task<IActionResult> GetAllBankAccountsAsync([FromQuery] bool? isActive = null, [FromQuery] string? search = null)
    {
        var result = await Mediator.Send(new GetAllBankAccountsQuery(isActive, search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Get bank account by ID
    /// </summary>
    /// <param name="id">Bank account ID</param>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBankAccountByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetBankAccountByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Create a new bank account
    /// </summary>
    /// <param name="createModel">Bank account creation data</param>
    [HttpPost]
    public async Task<IActionResult> CreateBankAccountAsync([FromBody] CreateBankAccountDto createModel)
    {
        var result = await Mediator.Send(new CreateBankAccountCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    /// <summary>
    /// Update an existing bank account
    /// </summary>
    /// <param name="updateModel">Bank account update data</param>
    [HttpPut]
    public async Task<IActionResult> UpdateBankAccountAsync([FromBody] UpdateBankAccountDto updateModel)
    {
        var result = await Mediator.Send(new UpdateBankAccountCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Delete one or more bank accounts
    /// </summary>
    /// <param name="deleteIds">List of bank account IDs to delete</param>
    [HttpDelete]
    public async Task<IActionResult> DeleteBankAccountsAsync([FromBody] List<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteBankAccountListCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
