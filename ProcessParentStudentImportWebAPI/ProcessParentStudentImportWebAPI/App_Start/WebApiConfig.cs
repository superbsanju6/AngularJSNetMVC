using System.Web.Http;

namespace ProcessParentStudentImportWebAPI
{
    public class WebApiConfig
    {
        /// <summary>
        /// Registers the routes the Web API responds to
        /// </summary>
        /// <param name="config">Current configuration of the server element</param>
        public static void Register(HttpConfiguration config)
        {
            // Allows us to map routes using [Route()] and [RoutePrefix()]
            config.MapHttpAttributeRoutes();

            // Default settings to handle routes that aren't explicitly named
            // through attributes
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            //config.Routes.MapHttpRoute(
            //    name: "ActionApi",
            //    routeTemplate: "api/{controller}/{action}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);
        }
    }
}