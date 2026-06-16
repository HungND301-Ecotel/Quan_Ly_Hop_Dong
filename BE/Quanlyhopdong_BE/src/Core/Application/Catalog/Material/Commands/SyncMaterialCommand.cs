using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Material.Commands;

public record class SyncMaterialCommand(Guid SourceConnectionId) : IRequest<SyncMaterialResultDto>;

public class SyncMaterialCommandHandler(
    IUnitOfWork unitOfWork,
    IMaterialSyncSourceService sourceService) : IRequestHandler<SyncMaterialCommand, SyncMaterialResultDto>
{
    private readonly IWriteRepository<Domain.Entities.Category.Material> _materialRepo = unitOfWork.GetRepository<Domain.Entities.Category.Material>();
    private readonly IWriteRepository<Domain.Entities.Category.UnitOfMeasure> _unitOfMeasureRepo = unitOfWork.GetRepository<Domain.Entities.Category.UnitOfMeasure>();
    private readonly IWriteRepository<Domain.Entities.Category.MaterialGroup> _materialGroupRepo = unitOfWork.GetRepository<Domain.Entities.Category.MaterialGroup>();

    public async Task<SyncMaterialResultDto> Handle(SyncMaterialCommand request, CancellationToken cancellationToken)
    {
        var sourceRows = await sourceService.GetMaterialsAsync(request.SourceConnectionId, cancellationToken);

        var sourceByCode = new Dictionary<string, ExternalMaterialSyncItemDto>(StringComparer.OrdinalIgnoreCase);
        int skippedCount = 0;

        foreach (var row in sourceRows)
        {
            string materialCode = row.MaterialCode?.Trim() ?? string.Empty;
            string name = row.Name?.Trim() ?? string.Empty;
            string unitCode = row.UnitOfMeasureCode?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(materialCode) || string.IsNullOrWhiteSpace(name))
            {
                skippedCount++;
                continue;
            }

            row.MaterialCode = materialCode;
            row.Name = name;
            row.UnitOfMeasureCode = string.IsNullOrWhiteSpace(unitCode) ? null : unitCode;
            row.MaterialGroupCode = string.IsNullOrWhiteSpace(row.MaterialGroupCode) ? null : row.MaterialGroupCode.Trim();

            sourceByCode[materialCode] = row;
        }

        if (sourceByCode.Count == 0)
        {
            return new SyncMaterialResultDto
            {
                SourceCount = sourceRows.Count,
                CreatedCount = 0,
                UpdatedCount = 0,
                SkippedCount = skippedCount
            };
        }

        var sourceCodes = sourceByCode.Keys.ToList();
        var unitCodes = sourceByCode.Values
            .Where(x => !string.IsNullOrWhiteSpace(x.UnitOfMeasureCode))
            .Select(x => x.UnitOfMeasureCode!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        var groupCodes = sourceByCode.Values
            .Where(x => !string.IsNullOrWhiteSpace(x.MaterialGroupCode))
            .Select(x => x.MaterialGroupCode!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var existingMaterials = await _materialRepo.GetAllAsync(
            predicate: x => sourceCodes.Contains(x.MaterialCode),
            disableTracking: false);

        var units = unitCodes.Count == 0
            ? []
            : await _unitOfMeasureRepo.GetAllAsync(
                predicate: x => unitCodes.Contains(x.Code),
                disableTracking: true);

        var groups = groupCodes.Count == 0
            ? []
            : await _materialGroupRepo.GetAllAsync(
                predicate: x => groupCodes.Contains(x.GroupCode),
                disableTracking: true);

        var existingByCode = existingMaterials
            .ToDictionary(x => x.MaterialCode, StringComparer.OrdinalIgnoreCase);
        var unitsByCode = units
            .ToDictionary(x => x.Code, StringComparer.OrdinalIgnoreCase);
        var groupsByCode = groups
            .ToDictionary(x => x.GroupCode, StringComparer.OrdinalIgnoreCase);

        int createdCount = 0;
        int updatedCount = 0;
        var toCreate = new List<Domain.Entities.Category.Material>();

        foreach (var source in sourceByCode.Values)
        {
            Guid? unitId = null;
            if (!string.IsNullOrWhiteSpace(source.UnitOfMeasureCode))
            {
                if (unitsByCode.TryGetValue(source.UnitOfMeasureCode, out var unit))
                {
                    unitId = unit.Id;
                }
                else
                {
                    skippedCount++;
                    continue;
                }
            }

            Guid? materialGroupId = null;
            if (!string.IsNullOrWhiteSpace(source.MaterialGroupCode)
                && groupsByCode.TryGetValue(source.MaterialGroupCode, out var group))
            {
                materialGroupId = group.Id;
            }

            if (existingByCode.TryGetValue(source.MaterialCode, out var existing))
            {
                bool isChanged = existing.Name != source.Name
                    || existing.UnitOfMeasureId != unitId
                    || existing.MaterialGroupId != materialGroupId
                    || existing.Price != source.Price
                    || existing.IsOtherMaterial;

                if (isChanged)
                {
                    existing.Update(
                        source.MaterialCode,
                        source.Name,
                        unitId,
                        source.Price,
                        source.IsOtherMaterial,
                        "",
                        materialGroupId);

                    _materialRepo.Update(existing);
                    updatedCount++;
                }

                continue;
            }

            var newMaterial = Domain.Entities.Category.Material.Create(
                source.MaterialCode,
                source.Name,
                unitId,
                source.Price,
                source.IsOtherMaterial,
                "",
                materialGroupId);

            toCreate.Add(newMaterial);
            createdCount++;
        }

        if (toCreate.Count > 0)
        {
            await _materialRepo.InsertAsync(toCreate, cancellationToken);
        }

        if (createdCount > 0 || updatedCount > 0)
        {
            await unitOfWork.SaveChangesAsync();
        }

        return new SyncMaterialResultDto
        {
            SourceCount = sourceRows.Count,
            CreatedCount = createdCount,
            UpdatedCount = updatedCount,
            SkippedCount = skippedCount
        };
    }
}