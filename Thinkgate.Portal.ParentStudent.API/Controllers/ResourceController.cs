using System;
using System.Configuration;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Thinkgate.Portal.ParentStudent.API.Classes;
using Thinkgate.Portal.ParentStudent.API.Models;
using Thinkgate.Services.Contracts.ParentStudent;
using Thinkgate.Services.Contracts.ServiceModel;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net;

namespace Thinkgate.Portal.ParentStudent.API.Controllers
{
    [AuthorizeRedirectPostAttribute]
    [System.Web.Http.RoutePrefix("api/Resource")]
    public class ResourceController : ApiController
    {
        public UserManager<IdentityUser> UserManager { get; private set; }

        public ResourceController()
            : this(Startup.UserManagerFactory())
        {
        }

        public ResourceController(UserManager<IdentityUser> userManager)
        {
            UserManager = userManager;
        }
        /// <summary>
        /// POST: /Resource/GetResourceLinks
        /// </summary>
        /// <returns>ResourceViewModel</returns>

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("GetResourceLinks")]
        [ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetResourceLinks(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                var identity = (ClaimsIdentity)User.Identity;
                           

                var portalCommonProxy = new PortalCommonProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());

                var portalCommonResponse = portalCommonProxy.GetLinks(model.CacheDB.Decrypt<string>(), model.Id);
                var linksViewModel = portalCommonResponse.LinksList.Where(c => !string.IsNullOrWhiteSpace(c.Url)).Select(linksListList => new LinksViewModel
                {
                    ID = linksListList.ID,
                    LinkName = linksListList.LinkName,
                    AttachmentGuid = linksListList.AttachmentGuid,
                    Url = (linksListList.AttachmentGuid.HasValue ? linksListList.Url : (linksListList.Url.IndexOf("http") > -1 ? linksListList.Url : "http://" + linksListList.Url)).Replace("\\", "/"),
                    Phone = model.ClientId,
                    StudentId = linksListList.StudentId,
                    DocumentId = linksListList.DocumentId,
                    IsAttachment = linksListList.AttachmentGuid.HasValue,
                    Desc = linksListList.Description,
                    AssignDate = linksListList.AssignDate,
                    AssignBeginDate = linksListList.AssignBeginDate,
                    AssignEndDate = linksListList.AssignEndDate
                }).ToList();

                return Ok(linksViewModel);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }
    }
}