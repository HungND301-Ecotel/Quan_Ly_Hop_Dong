namespace Application.Dto.Common;

public class CommonParameter
{
    public long BrandId { get; set; }

    public long CampusId { get; set; }

    public long UserLoginId { get; set; }

    public CommonParameter(long brandId, long campusId)
    {
        BrandId = brandId;
        CampusId = campusId;
    }

    public CommonParameter(long brandId, long campusId, long userId)
        : this(brandId, campusId)
    {
        UserLoginId = userId;
    }

    public CommonParameter()
    {
    }
}

public class GetCampusRequest
{
    public List<long> CountryIds { get; set; } = new();
    public List<long> SchoolIds { get; set; } = new();
}