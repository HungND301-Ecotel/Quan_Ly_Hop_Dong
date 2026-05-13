using Application.Common.Interfaces;
using Application.Common.Models;
using Ardalis.Specification;

namespace Application.Common.Services;

public interface IPaginationService
{
    Task<PaginationResponse<TDestination>> PaginatedListAsync<T, TDestination>(
        IReadRepositoryBase<T> repository,
        ISpecification<T, TDestination> spec,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
        where T : class
        where TDestination : class, IDto;

    /// <summary>
    /// Returns PaginatedListAsync.
    /// </summary>
    /// <param name="repository"></param>
    /// <param name="spec"></param>
    /// <param name="pageNumber"></param>
    /// <param name="pageSize"></param>
    /// <param name="ignorePagination">Only use for pagination response.</param>
    /// <param name="cancellationToken"></param>
    /// <typeparam name="T">Type of entity.</typeparam>
    /// <typeparam name="TDestination">Type of mapping model.</typeparam>
    /// <returns></returns>
    Task<PaginationResponse<TDestination>> PaginatedListAsync<T, TDestination>(
        IReadRepositoryBase<T> repository,
        ISpecification<T, TDestination> spec,
        int pageNumber,
        int pageSize,
        bool ignorePagination,
        CancellationToken cancellationToken = default)
        where T : class
        where TDestination : class, IDto;

    Task<PaginationResponse<T>> PaginatedListAsync<T>(
        IReadRepositoryBase<T> repository,
        ISpecification<T> spec,
        int pageNumber,
        int pageSize,
        bool ignorePagination,
        CancellationToken cancellationToken = default)
        where T : class;
}