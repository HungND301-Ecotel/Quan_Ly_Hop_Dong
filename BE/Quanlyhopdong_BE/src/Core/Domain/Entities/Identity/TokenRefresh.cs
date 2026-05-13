using System.ComponentModel.DataAnnotations;
using Domain.Common.Contracts;

namespace Domain.Entities.Identity;

public class RefreshToken : BaseEntity<Guid>, IAggregateRoot
{
    public Guid UserId { get; protected set; }
    public int Type { get; protected set; }

    [MaxLength(256)]
    public string Token { get; set; } = string.Empty;

    public DateTimeOffset ExpiredDate { get; set; }

    public static RefreshToken Create(Guid userId, string refreshToken, DateTimeOffset expiredDate)
    {
        return new RefreshToken
        {
            UserId = userId,
            Token = refreshToken,
            ExpiredDate = expiredDate
        };
    }
}