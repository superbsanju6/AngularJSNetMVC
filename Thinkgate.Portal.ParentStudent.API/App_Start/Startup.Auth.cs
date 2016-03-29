using System;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Thinkgate.Portal.ParentStudent.API.Models;
using Thinkgate.Portal.ParentStudent.API.Providers;
using Owin;

namespace Thinkgate.Portal.ParentStudent.API
{
    public partial class Startup
    {
       
        public static Func<UserManager<IdentityUser>> UserManagerFactory { get; set; }

        static Startup()
        {
            UserManagerFactory = () => new UserManager<IdentityUser>(new UserStore<IdentityUser>(new ThinkgateParentStudent()));            
            Bootstrapper.Configure();
        }

        public void ConfigureAuth(IAppBuilder app)
        {
       
        }
    }
}
