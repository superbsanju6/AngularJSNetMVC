using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;


namespace Thinkgate.Portal.ParentStudent.API.Classes
{
    public class AuthorizeRedirectPostAttribute : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(HttpActionContext filterContext)
        {
            filterContext.Response = new HttpResponseMessage { StatusCode = HttpStatusCode.Forbidden };
            //if (filterContext.HttpContext.User.Identity.IsAuthenticated)
            //    filterContext.Result = new HttpStatusCodeResult(403);
            //else
            //    filterContext.Result = new HttpUnauthorizedResult();
        }

        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            if (actionContext.Request.Headers.Authorization != null &&
                actionContext.Request.Headers.Authorization.Parameter != null
                 && actionContext.Request.Headers.Authorization.Scheme == "Bearer")
            {
                var token = actionContext.Request.Headers.Authorization.Parameter;

                var userLoginAuth = new UserLoginAuth();
                return  userLoginAuth.ValidateToken(token);

            }
            return false;
        }


    }
}