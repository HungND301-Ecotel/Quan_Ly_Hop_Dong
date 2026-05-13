using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.MaterialGroup.Commands;

public record class SyncMaterialGroupCommand(Guid SourceConnectionId) : IRequest<SyncMaterialGroupResultDto>;

public class SyncMaterialGroupCommandHandler(
    IUnitOfWork unitOfWork,
    IMaterialGroupSyncSourceService sourceService) : IRequestHandler<SyncMaterialGroupCommand, SyncMaterialGroupResultDto>
{
    private readonly IWriteRepository<Domain.Entities.Category.MaterialGroup> _repo = unitOfWork.GetRepository<Domain.Entities.Category.MaterialGroup>();

    public async Task<SyncMaterialGroupResultDto> Handle(SyncMaterialGroupCommand request, CancellationToken cancellationToken)
    {
        var sourceRows = await sourceService.GetMaterialGroupsAsync(request.SourceConnectionId, cancellationToken);

        Dictionary<string, string> sourceByCode = new(StringComparer.OrdinalIgnoreCase);
        int skippedCount = 0;

        foreach (ExternalMaterialGroupSyncItemDto row in sourceRows)
        {
            string groupCode = row.GroupCode?.Trim() ?? string.Empty;
            string name = row.Name?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(groupCode) || string.IsNullOrWhiteSpace(name))
            {
                skippedCount++;
                continue;
            }

            sourceByCode[groupCode] = name;
        }

        if (sourceByCode.Count == 0)
        {
            return new SyncMaterialGroupResultDto
            {
                SourceCount = sourceRows.Count,
                CreatedCount = 0,
                UpdatedCount = 0,
                SkippedCount = skippedCount
            };
        }

        var sourceCodes = sourceByCode.Keys.ToList();
        var existingItems = await _repo.GetAllAsync(
            predicate: x => sourceCodes.Contains(x.GroupCode),
            disableTracking: false);

        var existingByCode = existingItems
            .ToDictionary(x => x.GroupCode, StringComparer.OrdinalIgnoreCase);

        int createdCount = 0;
        int updatedCount = 0;
        List<Domain.Entities.Category.MaterialGroup> toCreate = [];

        foreach (var sourceItem in sourceByCode)
        {
            string groupCode = sourceItem.Key;
            string name = sourceItem.Value;

            if (existingByCode.TryGetValue(groupCode, out var existing))
            {
                if (!string.Equals(existing.Name, name, StringComparison.Ordinal))
                {
                    existing.Update(groupCode, name);
                    _repo.Update(existing);
                    updatedCount++;
                }

                continue;
            }

            Domain.Entities.Category.MaterialGroup entity = new();
            entity.Update(groupCode, name);
            toCreate.Add(entity);
            createdCount++;
        }

        if (toCreate.Count > 0)
        {
            await _repo.InsertAsync(toCreate, cancellationToken);
        }

        if (createdCount > 0 || updatedCount > 0)
        {
            await unitOfWork.SaveChangesAsync();
        }

        return new SyncMaterialGroupResultDto
        {
            SourceCount = sourceRows.Count,
            CreatedCount = createdCount,
            UpdatedCount = updatedCount,
            SkippedCount = skippedCount
        };
    }
}