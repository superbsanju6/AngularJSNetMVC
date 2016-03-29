using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Thinkgate.Portal.ParentStudent.API.Models;
using Thinkgate.Portal.ParentStudent.API.Classes;
using System.Web.Security;
using System.Web;
using System.Net;
using Microsoft.Owin.Security;
using System.Security.Principal;
using System.Web.Http;
using System.Net.Http;

namespace Thinkgate.Portal.ParentStudent.API.Classes
{
    public class UserLoginAuth
    {

        private readonly Func<UserManager<IdentityUser>> _userManagerFactory;

        public UserLoginAuth()
        {
            _userManagerFactory = () => new UserManager<IdentityUser>(new UserStore<IdentityUser>(new ThinkgateParentStudent()));
        }

        public async Task<LoginTokenResponse> Login(string userName, string password)
        {
            using (UserManager<IdentityUser> userManager = _userManagerFactory())
            {

                IdentityUser user = await userManager.FindAsync(userName, password);

                if (user == null)
                    return new LoginTokenResponse("invalid_grant", "The user name or password is incorrect.");

                var userRoles = await userManager.GetRolesAsync(user.Id);


                var uniqueSessionKey = Guid.NewGuid().Encrypt();

                var userLoginModel = new UserLoginModel(user.Id,
                                                        "Bearer",
                                                        30,
                                                        user.UserName,
                                                        DateTime.UtcNow,
                                                        string.Join(",", userRoles.ToArray()),
                                                        uniqueSessionKey);

                if (userLoginModel.loginTokenResponse != null)
                {
                    CookieWrapper.UniqueSessionKey = uniqueSessionKey.Encrypt();
                    CookieWrapper.SlidingTime = userLoginModel.loginTokenResponse.expires.Encrypt();
                }
                return userLoginModel.loginTokenResponse;

            }
        }

        public bool ValidateToken(string token)
        {
            try
            {
                var loginTokenResponse = token.Decrypt<LoginTokenResponse>();

                using (UserManager<IdentityUser> userManager = _userManagerFactory())
                {
                    if (CookieWrapper.SlidingTime == null)
                        CookieWrapper.SlidingTime = DateTime.UtcNow.AddMinutes(loginTokenResponse.expire_in).Encrypt();
                    if (CookieWrapper.UniqueSessionKey == null)
                        CookieWrapper.UniqueSessionKey = loginTokenResponse.Key.Encrypt();


                    if (loginTokenResponse.Key.Decrypt<string>().Equals(CookieWrapper.UniqueSessionKey.Decrypt<string>().Decrypt<string>()))
                        if (CookieWrapper.SlidingTime.Decrypt<DateTime>() >= DateTime.UtcNow)
                        {
                            var user = userManager.FindByName(loginTokenResponse.userName);
                            ClaimsIdentity oAuthIdentity = userManager.CreateIdentity(user, "Bearer");
                            oAuthIdentity.AddClaim(new Claim("uniqueIdentifier", oAuthIdentity.GetUserId()));

                            string[] userRolesArray = loginTokenResponse.userRole.Split(',');
                            GenericPrincipal userPrincipal = new GenericPrincipal(oAuthIdentity, userRolesArray);
                            HttpContext.Current.User = userPrincipal;
                            CookieWrapper.SlidingTime = DateTime.UtcNow.AddMinutes(loginTokenResponse.expire_in).Encrypt();

                            return true;
                        }
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }

        internal void SignOut()
        {
            CookieWrapper.SlidingTime = DateTime.UtcNow.AddDays(-3).Encrypt();
            CookieWrapper.UniqueSessionKey = string.Empty;            
            HttpContext.Current.User = null;
        }
    }

    public class ErrorResponse
    {
        public string error_description { get; set; }
        public int Status { get; set; }
        public string Error { get; set; }

        public ErrorResponse(string error, string errorDescription)
        {
            this.Error = error;
            this.error_description = errorDescription;
        }
    }
}