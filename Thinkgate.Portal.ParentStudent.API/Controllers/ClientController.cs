using System;
using System.Collections.Generic;
using System.Configuration;
using System.Reflection.Emit;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.Http;
using Thinkgate.Portal.ParentStudent.API.Models;

namespace Thinkgate.Portal.ParentStudent.API.Controllers
{
    //[Authorize]
    [RoutePrefix("api/Client")]
    public class ClientController : ApiController
    {

        public ClientController()
        {
        }


        /// <summary>
        /// POST: /Client/GetClient
        /// </summary>
        /// <returns>client</returns>

        [HttpPost]
        [Route("GetClient")]

        //[System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetClient(string client)
        {
            try
            {
                if (string.IsNullOrEmpty(client)) return GetDefaultConfigValues();

                var clientViewModel = new ClientViewModel
                    {
                        ClientName = client,
                        ThinkgateLogoLocation = !string.IsNullOrEmpty(ConfigurationManager.AppSettings[client + "_thinkgateLogoLocation"]) ? ConfigurationManager.AppSettings[client + "_thinkgateLogoLocation"].ToString() : ConfigurationManager.AppSettings["default_thinkgateLogoLocation"].ToString(),
                        ThinkgateLogoLinkToURL = !string.IsNullOrEmpty(ConfigurationManager.AppSettings[client + "_thinkgateLogoLinkToURL"]) ? ConfigurationManager.AppSettings[client + "_thinkgateLogoLinkToURL"].ToString() : ConfigurationManager.AppSettings["default_thinkgateLogoLinkToURL"].ToString(),
                        ClientLogoImageLocation = !string.IsNullOrEmpty(ConfigurationManager.AppSettings[client + "_clientLogoImageLocation"]) ? ConfigurationManager.AppSettings[client + "_clientLogoImageLocation"].ToString() : ConfigurationManager.AppSettings["default_clientLogoImageLocation"].ToString(),
                        ClientLogoLinkToURL = !string.IsNullOrEmpty(ConfigurationManager.AppSettings[client + "_clientLogoLinkToURL"]) ? ConfigurationManager.AppSettings[client + "_clientLogoLinkToURL"].ToString() : ConfigurationManager.AppSettings["default_clientLogoLinkToURL"].ToString(),
                        ClientBackgroundImageLocation = !string.IsNullOrEmpty(ConfigurationManager.AppSettings[client + "_clientBackground"]) ? ConfigurationManager.AppSettings[client + "_clientBackground"].ToString() : ConfigurationManager.AppSettings["default_clientBackground"].ToString()
                    };
                return Ok(clientViewModel);
            }
            catch (Exception)
            {
                return GetDefaultConfigValues();
            }
        }

        private IHttpActionResult GetDefaultConfigValues()
        {
            var defaultClientViewModel = new ClientViewModel
            {
                ClientName = null,
                ThinkgateLogoLocation = ConfigurationManager.AppSettings["default_thinkgateLogoLocation"].ToString(),
                ThinkgateLogoLinkToURL = ConfigurationManager.AppSettings["default_thinkgateLogoLinkToURL"].ToString(),
                ClientLogoImageLocation = ConfigurationManager.AppSettings["default_clientLogoImageLocation"].ToString(),
                ClientLogoLinkToURL = ConfigurationManager.AppSettings["default_clientLogoLinkToURL"].ToString(),
                ClientBackgroundImageLocation = ConfigurationManager.AppSettings["default_clientBackground"].ToString()
            };
            return Ok(defaultClientViewModel);
        }

        /// <summary>
        /// POST: /Client/GetPasswordRequirements
        /// </summary>
        /// <returns>client</returns>

        [HttpPost]
        [Route("GetPasswordRequirements")]

        //[System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetPasswordRequirements()
        {
            var dictionary = new Dictionary<string, object>();

            dictionary.Add("PasswordLength", ConfigurationManager.AppSettings["PasswordLength"]);
            dictionary.Add("PasswordRequireNonLetterOrDigit",
                ConfigurationManager.AppSettings["PasswordRequireNonLetterOrDigit"]);
            dictionary.Add("PasswordRequireDigit", ConfigurationManager.AppSettings["PasswordRequireDigit"]);
            dictionary.Add("PasswordRequireLowercase", ConfigurationManager.AppSettings["PasswordRequireLowercase"]);
            dictionary.Add("PasswordRequireUppercase", ConfigurationManager.AppSettings["PasswordRequireUppercase"]);
            
            return Ok(dictionary);
        }
    }
}