using System.Text.Json;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public class JsonModelBinder<T> : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext context)
    {
        var rawValue = context.ValueProvider
            .GetValue(context.ModelName)
            .FirstValue;

        if (string.IsNullOrWhiteSpace(rawValue))
        {
            context.Result = ModelBindingResult.Success(default(T));
            return Task.CompletedTask;
        }

        try
        {
            var result = JsonSerializer.Deserialize<T>(
                rawValue,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = false // 🔥 đảm bảo strict
                });

            context.Result = ModelBindingResult.Success(result);
        }
        catch (JsonException ex)
        {
            context.ModelState.AddModelError(
                context.ModelName,
                $"Invalid JSON format: {ex.Message}"
            );
        }

        return Task.CompletedTask;
    }
}
