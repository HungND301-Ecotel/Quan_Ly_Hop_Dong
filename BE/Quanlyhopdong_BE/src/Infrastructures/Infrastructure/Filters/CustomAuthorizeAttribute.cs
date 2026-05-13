using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Infrastructure.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class CustomAuthorizeAttribute(/*params RoleType[] parameters*/) : AuthorizeAttribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext actionContext)
    {
        //var currentUserService = actionContext.HttpContext.RequestServices.GetService<ICurrentUser>();
        //var roleCustomRepo = actionContext.HttpContext.RequestServices.GetService<IUserRoleCustomRepository>();

        //if (currentUserService == null || roleCustomRepo == null)
        //{
        //    return;
        //}

        //var roleTypeUser = await roleCustomRepo.GetUserRoleType(currentUserService.UserId);
        //if (roleTypeUser == null)
        //{
        //    return;
        //}

        //if (!parameters.Contains(roleTypeUser.Value))
        //{
        //    actionContext.Result = new ForbidResult();
        //}
    }
}