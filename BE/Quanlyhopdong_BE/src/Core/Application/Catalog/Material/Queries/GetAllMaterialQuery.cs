using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Application.Common.Models;
using System.Linq.Expressions;

namespace Application.Catalog.Material.Queries;

public record class GetAllMaterialQuery(
    bool IsOtherMaterial = false,
    int? PageNumber = null,
    int? PageSize = null,
    string? Keyword = null) : IRequest<object>;

public class GetAllMaterialQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllMaterialQuery, object>
{
    private readonly IWriteRepository<Domain.Entities.Category.Material> _materialRepo = unitOfWork.GetRepository<Domain.Entities.Category.Material>();
    public async Task<object> Handle(GetAllMaterialQuery request, CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Category.Material, bool>> predicate = m => m.IsOtherMaterial == request.IsOtherMaterial;

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();
            predicate = m => m.IsOtherMaterial == request.IsOtherMaterial && 
                             (m.Name.ToLower().Contains(keyword) || m.MaterialCode.ToLower().Contains(keyword));
        }

        if (request.PageNumber.HasValue && request.PageSize.HasValue)
        {
            var pageIndex = request.PageNumber.Value;
            var pageSize = request.PageSize.Value;

            var totalCount = await _materialRepo.CountAsync(predicate);
            var items = await _materialRepo.GetPagingSelectorAsync(
                selector: m => new MaterialDto
                {
                    Id = m.Id,
                    IsOtherMaterial = m.IsOtherMaterial,
                    IsSynced = m.IsSynced,
                    MaterialCode = m.MaterialCode,
                    Name = m.Name,
                    MaterialGroupId = m.MaterialGroupId,
                    MaterialGroupName = m.MaterialGroup != null ? m.MaterialGroup.Name : null,
                    UnitOfMeasureId = m.UnitOfMeasureId,
                    UnitOfMeasureName = m.UnitOfMeasure != null ? m.UnitOfMeasure.Name : string.Empty,
                    Price = m.Price
                },
                predicate: predicate,
                orderBy: q => q.OrderBy(m => m.MaterialCode),
                include: q => q.Include(x => x.UnitOfMeasure).Include(x => x.MaterialGroup),
                pageIndex: pageIndex,
                pageSize: pageSize,
                disableTracking: true,
                cancellationToken: cancellationToken);

            return new PaginationResponse<MaterialDto>(items, totalCount, pageIndex, pageSize);
        }
        else
        {
            var result = await _materialRepo.GetAllAsync(
                selector: m => new MaterialDto
                {
                    Id = m.Id,
                    IsOtherMaterial = m.IsOtherMaterial,
                    IsSynced = m.IsSynced,
                    MaterialCode = m.MaterialCode,
                    Name = m.Name,
                    MaterialGroupId = m.MaterialGroupId,
                    MaterialGroupName = m.MaterialGroup != null ? m.MaterialGroup.Name : null,
                    UnitOfMeasureId = m.UnitOfMeasureId,
                    UnitOfMeasureName = m.UnitOfMeasure != null ? m.UnitOfMeasure.Name : string.Empty,
                    Price = m.Price
                },
                predicate: predicate,
                include: q => q.Include(x => x.UnitOfMeasure).Include(x => x.MaterialGroup),
                disableTracking: true);
            return result;
        }
    }
}