namespace Application.Dto.Catalog;

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
}

public class CreateDepartmentDto
{
    public string Name { get; set; }
    public string Code { get; set; }
}
