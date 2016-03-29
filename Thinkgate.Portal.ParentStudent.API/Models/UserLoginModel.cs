using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using Thinkgate.Portal.ParentStudent.API.Classes;

namespace Thinkgate.Portal.ParentStudent.API.Models
{
    public class UserLoginModel
    {
        public LoginTokenResponse loginTokenResponse { get; set; }

        public UserLoginModel(string userId, string tokenType, int expireIn, string user_name, DateTime issuedDate, string userRoles, string sessionKey)
        {
            var _loginTokenResponse = new LoginTokenResponse(userId, tokenType, expireIn, user_name, issuedDate, userRoles, sessionKey);
            _loginTokenResponse.access_token = _loginTokenResponse.Encrypt();
            loginTokenResponse = _loginTokenResponse;
        }

    }

    public class LoginTokenResponse
    {
        private string UserId { get; set; }
        public string access_token { get; set; }
        public string token_type { get; set; }
        public int expire_in { get; set; }
        public string userName { get; set; }
        public DateTime issued { get; set; }
        public DateTime expires { get; set; }
        public string userRole { get; set; }
        public string Key { get; set; } // is used to store session key


        public ErrorResponse data { get; set; }

        public LoginTokenResponse(string error, string errorDescription)
        {
            this.data = new ErrorResponse(error, errorDescription);
        }

        public LoginTokenResponse()
            : this(string.Empty, string.Empty, 0, string.Empty, new DateTime(), string.Empty, string.Empty)
        { }

        public LoginTokenResponse(string userId, string tokenType, int expireIn, string user_name, DateTime issuedDate, string userRoles, string sessionKey)
        {
            this.UserId = userId;
            this.token_type = tokenType;
            this.expire_in = expireIn;
            this.userName = user_name;
            this.issued = issuedDate;
            this.userRole = userRoles;
            this.expires = issuedDate.AddMinutes(expire_in);
            this.Key = sessionKey;
        }
    }
}