---
applyTo: '**/*.cs'
---

# Clean Architecture

When implementing backend services, follow these Clean Architecture principles to ensure maintainability, scalability, and separation of concerns. This rule is tailored for .NET solutions with a multi-project structure.

## 1. Solution Structure

- The solution **must** be organized into four main projects (one per layer):
  - `[project].Domain` (core business logic, entities, value objects, domain events)
  - `[project].Application` (use cases, commands, queries, interfaces for external services)
  - `[project].Infrastructure` (implementations for external services, database access, third-party integrations)
  - `[project].Presentation` (MVC API endpoints, minimal API, request/response models)

## 2. Dependencies Between Layers

- **Domain**: has no dependencies.
- **Application**: depends only on **Domain**.
- **Infrastructure**: depends on **Application** and **Domain**.
- **Presentation**: depends only on **Infrastructure**.
- Forbidden dependencies (e.g., EntityFrameworkCore in Api/Domain) must be checked by tests.

## 3. Folder and File Structure

- Use CQRS pattern instead of use case
- Example minimal structure:

```
src/
  [project].Domain/
    Enttities/ 
      Order.cs
      Customer.cs
  [project].Application/Catalog
    Order/
        Commands/
            CreateOrderCommand.cs
        Queries/
            GetAllOrderQuery.cs
      ...
    Customer/
      ...
  [project].Infrastructures/Infrastructure/
    Order/
      ...
    Customer/
      ...
  [project].Presentation/Host
    Program.cs
    ...
tests/
  [project].UnitTests/
    ...
  [project].IntegrationTests/
    ArchitectureTests.cs
    ...
```

## 4. Coding Style and Conventions

- Use file-scoped namespaces.
- One type per file.
- Follow Microsoft .NET C# coding conventions.
- Organize files by feature/domain.

## 5. Implementation Guidelines

- **Domain Layer**: All business logic, entities, value objects, and domain events. No dependencies on other layers.
- **Application Layer**: Use cases, commands, queries, interfaces for repositories/services. No business logic.
- **Infrastructure Layer**: Implementations for interfaces, database access, external integrations. No business logic.
- **Presentation Layer**: MVC API endpoints, request/response mapping. No business logic.
- Use dependency injection for all cross-layer dependencies.
- Avoid circular dependencies.
- Do not use a mediator library; call service methods directly from the Api layer.

## 6. Testing and Architecture Validation

- **Unit Tests**: In `tests/[project].UnitTests/`, for Domain and Application layers only. Use xUnit v3 and FakeItEasy for mocks.
- **Integration Tests**: In `tests/[project].IntegrationTests/`, for Infrastructure and Api layers. Use Testcontainers/Microcks for advanced scenarios.
- **Architecture Tests**: Must be present in `ArchitectureTests.cs` and:
  - Enforce allowed/forbidden dependencies between layers
  - Check for forbidden dependencies (e.g., EF Core in Api/Domain)
  - Optionally, check for immutability in Domain
- Always write tests before implementation (TDD).

## Additional Guidelines

1. Use dependency injection to manage dependencies across layers.
2. Avoid circular dependencies between layers.
3. Write unit tests for **Domain** and **Application** layers.
4. Use integration tests for **Infrastructure** and **Api** layers.
5. Follow SOLID principles within each layer.
6. Avoid using a mediator library; instead, directly call service methods from the **Api** layer.

# References
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/TheCleanArchitecture.html)
