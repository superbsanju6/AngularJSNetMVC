using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Mvc;
using AutoMapper;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Thinkgate.Portal.ParentStudent.API.Classes;
using Thinkgate.Portal.ParentStudent.API.Models;
using Thinkgate.Portal.ParentStudent.Models;
using Thinkgate.Services.Contracts.ParentStudent;
using Thinkgate.Services.Contracts.ServiceModel;

namespace Thinkgate.Portal.ParentStudent.API.Controllers
{
    [AuthorizeRedirectPostAttribute]
    [System.Web.Http.RoutePrefix("api/Alert")]
    public class AlertController : ApiController
    {
       public UserManager<IdentityUser> UserManager { get; private set; }
    
        public AlertController() : this(Startup.UserManagerFactory())
        {
        }

        public AlertController(UserManager<IdentityUser> userManager)
        {
            UserManager = userManager;
        }
        /// <summary>
        /// POST: /Alert/GetAcademicAlerts
        /// </summary>
        /// <returns>alertViewModel</returns>
 
        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("GetAcademicAlerts")]
        [ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetAcademicAlerts(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                var identity = (ClaimsIdentity)User.Identity;
                
                var studentId = student.Id;

                var portalAlertProxy = new PortalAlertProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());

                var portalAlertResponse = portalAlertProxy.GetAcademicAlerts(model.ClientDB.Decrypt<string>(), studentId, currIdentity);
                var alertViewModel = portalAlertResponse.AcademicAlertLists.Select(alertListList => new AlertViewModel
                {
                    Id = alertListList.Id,
                    StudentId = alertListList.StudentId,
                    AlertType = alertListList.AlertType,
                    CreateDate = alertListList.CreateDate,
                    AcknowledgedDate = alertListList.AcknowledgedDate,
                    AcknowledgedUser = alertListList.AcknowledgedUser,
                    AlertMessage = alertListList.AlertMessage,
                    ClientDB = model.ClientDB,
                    ClientId = model.ClientId,
                    CacheDB = model.CacheDB
                }).ToList();

                return Ok(alertViewModel);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }

        /// <summary>
        /// POST: /Alert/GetAcademicAlerts
        /// </summary>
        /// <returns>alertViewModel</returns>

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("SaveAcademicAlert")]
        [ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> SaveAcademicAlert(AcademicAlertList model)
        {
            if (ModelState.IsValid)
            {
                var portalAlertListResponse = new PortalAlertListResponse();
                portalAlertListResponse.AcademicAlertLists = new Collection<AcademicAlertList>();
                portalAlertListResponse.AcademicAlertLists.Add(model);
                var identity = (ClaimsIdentity)User.Identity;
                



                var portalAlertProxy = new PortalAlertProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());


                var portalAlertResponse = portalAlertProxy.SaveAcademicAlert(model.ClientDB.Decrypt<string>(), portalAlertListResponse, currIdentity);
                return Ok(portalAlertResponse);
            }

            return BadRequest(ModelState);
        }
    }
}