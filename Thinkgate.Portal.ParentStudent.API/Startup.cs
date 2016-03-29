﻿using System.Web.Http;
using Owin;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Thinkgate.Portal.ParentStudent.API;

[assembly: OwinStartup(typeof(Startup))]

namespace Thinkgate.Portal.ParentStudent.API
{
    /// <summary>
    /// Startup class used by OWIN implementations to run the Web application
    /// </summary>
    public partial class Startup
    {
        /// <summary>
        /// Used to create an instance of the Web application 
        /// </summary>
        /// <param name="app">Parameter supplied by OWIN implementation which our configuration is connected to</param>
        public void Configuration(IAppBuilder app)
        {
            HttpConfiguration config = new HttpConfiguration();
            // Handles registration of the Web API's routes
            WebApiConfig.Register(config);
            // Enables us to call the Web API from domains other than the ones the API responds to
            app.UseCors(CorsOptions.AllowAll);

            ConfigureAuth(app);

            // Add the Web API framework to the app's pipeline
            app.UseWebApi(config);
        }
    }
}
