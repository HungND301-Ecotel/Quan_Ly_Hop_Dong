namespace Application.Common.Repositories;

public interface IWriteRepositoryFactory
{
    /// <summary>
    /// Gets the specified repository for the <typeparamref name="TEntity"/>.
    /// </summary>
    /// <param name="hasCustomRepository"><c>True</c> if providing custom Repository.</param>
    /// <typeparam name="TEntity">The type of the entity.</typeparam>
    /// <returns>An instance of type inherited from <see cref="IWriteRepository{TEntity}"/> interface.</returns>
    IWriteRepository<TEntity> GetRepository<TEntity>(bool hasCustomRepository = false)
        where TEntity : class;
}