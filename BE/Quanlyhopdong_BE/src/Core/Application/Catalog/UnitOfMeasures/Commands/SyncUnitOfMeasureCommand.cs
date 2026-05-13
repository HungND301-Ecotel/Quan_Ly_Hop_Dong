using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Category;
using MediatR;

namespace Application.Catalog.UnitOfMeasures.Commands;

public record SyncUnitOfMeasureCommand(Guid SourceConnectionId) : IRequest<SyncUnitOfMeasureResultDto>;

public class SyncUnitOfMeasureCommandHandler(
    IUnitOfWork unitOfWork,
    IUnitOfMeasureSyncSourceService sourceService) : IRequestHandler<SyncUnitOfMeasureCommand, SyncUnitOfMeasureResultDto>
{
    private readonly IWriteRepository<UnitOfMeasure> _repo = unitOfWork.GetRepository<UnitOfMeasure>();

    public async Task<SyncUnitOfMeasureResultDto> Handle(SyncUnitOfMeasureCommand request, CancellationToken cancellationToken)
    {
        IList<ExternalUnitOfMeasureSyncItemDto> sourceRows = await sourceService.GetUnitOfMeasuresAsync(request.SourceConnectionId, cancellationToken);

        Dictionary<string, (string Name, bool IsActive)> sourceByCode = new(StringComparer.OrdinalIgnoreCase);
        int skippedCount = 0;

        foreach (ExternalUnitOfMeasureSyncItemDto row in sourceRows)
        {
            string code = row.Code?.Trim() ?? string.Empty;
            string name = row.Name?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(code))
            {
                skippedCount++;
                continue;
            }

            string normalizedCode = code.ToUpperInvariant();
            sourceByCode[normalizedCode] = (string.IsNullOrWhiteSpace(name) ? normalizedCode : name, row.IsActive);
        }

        if (sourceByCode.Count == 0)
        {
            return new SyncUnitOfMeasureResultDto
            {
                SourceCount = sourceRows.Count,
                CreatedCount = 0,
                UpdatedCount = 0,
                SkippedCount = skippedCount
            };
        }

        IList<UnitOfMeasure> existingItems = await _repo.GetAllAsync(disableTracking: false);
        Dictionary<string, UnitOfMeasure> existingByCode = existingItems
            .ToDictionary(x => x.Code, StringComparer.OrdinalIgnoreCase);

        int createdCount = 0;
        int updatedCount = 0;
        List<UnitOfMeasure> toCreate = [];

        foreach (KeyValuePair<string, (string Name, bool IsActive)> source in sourceByCode)
        {
            string code = source.Key;
            string name = source.Value.Name;
            bool isActive = source.Value.IsActive;
            if (existingByCode.TryGetValue(code, out UnitOfMeasure? existing))
            {
                bool isChanged = !string.Equals(existing.Name, name, StringComparison.Ordinal) || existing.IsActive != isActive;
                if (isChanged)
                {
                    existing.Update(code, name, isActive);
                    _repo.Update(existing);
                    updatedCount++;
                }

                continue;
            }

            UnitOfMeasure entity = UnitOfMeasure.Create(code, name, isActive);
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

        return new SyncUnitOfMeasureResultDto
        {
            SourceCount = sourceRows.Count,
            CreatedCount = createdCount,
            UpdatedCount = updatedCount,
            SkippedCount = skippedCount
        };
    }
}