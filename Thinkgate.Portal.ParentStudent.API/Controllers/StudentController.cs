using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
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
    [RoutePrefix("api/Student")]
    public class StudentController : ApiController
    {
        public UserManager<IdentityUser> UserManager { get; private set; }

        public StudentController()
            : this(Startup.UserManagerFactory())
        {
        }

        public StudentController(UserManager<IdentityUser> userManager)
        {
            UserManager = userManager;
        }

        //
        /// <summary>
        /// POST: /Student/GetStudentList
        /// </summary>
        /// <returns>studentViewModels</returns>

        [System.Web.Http.HttpPost]
        [Route("GetStudentList")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetStudentList()
        {
            if (ModelState.IsValid)
            {
                var identity = (ClaimsIdentity)User.Identity;

                var portalParentStudentProxy = new PortalStudentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });


                var aspNetId = identity.GetUserId();


                var portalCommonResponse = new PortalStudentListResponse();
                var studentViewModels = new List<StudentViewModels>();

                foreach (var client in GetLEADatabseList(aspNetId, identity).ToList())
                {
                    portalCommonResponse = portalParentStudentProxy.GetStudentList(client.ClientDB, aspNetId, identity.GetUserName(), client.Identity);
                    studentViewModels.AddRange(portalCommonResponse.ParentStudentList.Select(parentStudentListList => new StudentViewModels
                   {
                       Id = parentStudentListList.Id,
                       FirstName = parentStudentListList.FirstName,
                       LastName = parentStudentListList.LastName,
                       ProfileImageUrl = parentStudentListList.ProfileImageUrl,
                       AlertFlag = parentStudentListList.AlertFlag,
                       ClientId = client.ClientId.Encrypt(),
                       CacheDB = client.CacheDB.Encrypt(),
                       ClientDB = client.ClientDB.Encrypt()
                   }).ToList());
                }
                return Ok(studentViewModels);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }


        /// <summary>
        /// Private : get all LEA for this parent
        /// </summary>
        /// <param name="aspNetId">User Guid</param>
        /// <param name="identity">User Identity</param>
        /// <returns></returns>
        private IEnumerable<LEAViewModel> GetLEADatabseList(string aspNetId, ClaimsIdentity identity)
        {
            var context = new ClientSuppliedIdEntities();
            var configContext = new ThinkgateConfigEntities();


            var portalParentParmsProxy = new PortalStudentProxy(new SamlSecurityTokenSettings()
            {
                SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
            });

            var clientId = (ClaimHelper.FindClaim("cacheId", identity).Value.Replace("VersaITCacheTM", "").Replace("VersaITCache", "")).Replace("~", "");

            var clientSuppliedIndentifications = context.ClientSuppliedIdentifications.Where(c => c.aspnetId == aspNetId);

            if (!clientSuppliedIndentifications.Any())
            {
                var dbname = ClaimHelper.FindClaim("clientId", identity).Value;
                var cachedbname = ClaimHelper.FindClaim("cacheId", identity).Value;
                yield return new LEAViewModel(dbname, cachedbname, clientId, identity);
            }

            foreach (var client in clientSuppliedIndentifications
                                   .Select(x => x.ClientSuppliedIdentification_LEA_Xref.FirstOrDefault())
                                   .Select(x => new { ClientID = x.ClientID ?? clientId }).Distinct())
            {
                var state = ConfigurationManager.AppSettings["ClientConfigState"].ToLower();
                var keyConfig = configContext.Clients.FirstOrDefault(x => x.State.ToLower() == state && x.ClientID == client.ClientID);
                var dbname = keyConfig.PropertyCollections.FirstOrDefault().Properties.Select(x => new Claim(x.Name, x.Value)).FirstOrDefault(c => c.Type == "dbname") ?? ClaimHelper.FindClaim("clientId", identity);
                var cachedbname = portalParentParmsProxy.GetParms(dbname.Value, "xmlcachedbname").ParmsList.Select(x => new Claim("dbname", x.Val)).FirstOrDefault() ?? ClaimHelper.FindClaim("cacheId", identity);

                var currIdentity = ClaimHelper.Update(identity, "cacheId", cachedbname.Value);
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", dbname.Value);
                yield return new LEAViewModel(dbname.Value, cachedbname.Value, client.ClientID, currIdentity);
            }
        }


        //
        /// <summary>
        /// POST: /Student/GetStudentAttendance
        /// </summary>
        /// <param name="model"></param>
        /// <returns>attendanceViewModels</returns>

        [System.Web.Http.HttpPost]
        [Route("GetStudentAttendance")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetStudentAttendance(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                //var identity = (ClaimsIdentity)User.Identity;
                //var clientId = ClaimHelper.FindClaim("clientId", identity);

                //var portalParentStudentProxy = new PortalStudentProxy(new SamlSecurityTokenSettings()
                //{
                //    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                //    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                //    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                //});
                //var portalCommonResponse = portalParentStudentProxy.GetStudentAttendance(clientId.Value, student.Id, identity);
                //var attendanceViewModels = portalCommonResponse.AttendanceList.Select(addendanceListList => new AttendanceViewModels()
                //{
                //    Id = addendanceListList.Id,
                //}).ToList();
                //return Ok(attendanceViewModels);
            }

            return BadRequest(ModelState);
        }

        //
        /// <summary>
        /// POST: /Student/GetStudentProfile
        /// </summary>
        /// <param name="model"></param>
        /// <returns>studentProfileviewModel</returns>

        [System.Web.Http.HttpPost]
        [Route("GetStudentProfile")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetStudentProfile(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                var identity = (ClaimsIdentity)User.Identity;

                var portalParentStudentProxy = new PortalStudentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());
                var portalStudentResponse = portalParentStudentProxy.GetStudentProfile(model.ClientDB.Decrypt<string>(), student.Id, currIdentity);

                var studentProfileviewModel = new StudentProfileViewModels
                {
                    Id = portalStudentResponse.PortalStudentProfile.Id,
                    FirstName = portalStudentResponse.PortalStudentProfile.FirstName,
                    LastName = portalStudentResponse.PortalStudentProfile.LastName,
                    StudentId = portalStudentResponse.PortalStudentProfile.StudentId,
                    GradeLevel = portalStudentResponse.PortalStudentProfile.GradeLevel,
                    SchoolName = portalStudentResponse.PortalStudentProfile.SchoolName,
                    ClientId = model.ClientId,
                    CacheDB = model.CacheDB,
                    ClientDB = model.ClientDB

                };
                return Ok(studentProfileviewModel);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }
        //
        /// <summary>
        /// POST: /Student/GetStudentProfile
        /// </summary>
        /// <param name="model"></param>
        /// <returns>studentProfileviewModel</returns>

        [System.Web.Http.HttpPost]
        [Route("GetStudentProfileCounselor")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetStudentProfileCounselor(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                var identity = (ClaimsIdentity)User.Identity;

                var portalParentStudentProxy = new PortalStudentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());
                var portalStudentResponse = portalParentStudentProxy.GetStudentProfileCounselor(model.ClientDB.Decrypt<string>(), student.Id, currIdentity);

                var studentProfileviewModel = new StudentProfileViewModels
                {
                    Id = portalStudentResponse.PortalStudentProfile.Id,
                    FirstName = portalStudentResponse.PortalStudentProfile.FirstName,
                    LastName = portalStudentResponse.PortalStudentProfile.LastName,
                    StudentId = portalStudentResponse.PortalStudentProfile.StudentId,
                    GradeLevel = portalStudentResponse.PortalStudentProfile.GradeLevel,
                    SchoolName = portalStudentResponse.PortalStudentProfile.SchoolName,
                    CounselorFirstName = portalStudentResponse.PortalStudentProfile.CounselorFirstName,
                    CounselorLastName = portalStudentResponse.PortalStudentProfile.CounselorLastName,
                    CacheDB = model.CacheDB,
                    ClientDB = model.ClientDB,
                    ClientId = model.ClientId
                };
                return Ok(studentProfileviewModel);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }
        //
        /// <summary>
        /// POST: /Student/GetCourseList
        /// </summary>
        /// <param name="model"></param>
        /// <returns>courseViewModels</returns>
        [System.Web.Http.HttpPost]
        [Route("GetCourseList")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetCourseList(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                var identity = (ClaimsIdentity)User.Identity;

                var portalParentStudentProxy = new PortalStudentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());
                var portalStudentResponse = portalParentStudentProxy.GetCourseList(model.ClientDB.Decrypt<string>(), student.Id, currIdentity);

                var courseViewModels = portalStudentResponse.CourseList.Select(courseListList => new CourseListViewModels()
                {
                    Id = courseListList.Id,
                    ClassName = courseListList.ClassName,
                    SchoolName = courseListList.SchoolName,
                    Year = courseListList.Year,
                    Semester = courseListList.Semester,
                    Period = courseListList.Period,
                    CourseId = courseListList.CourseId,
                    CourseName = courseListList.CourseName,
                    Grade = courseListList.Grade,
                    Subject = courseListList.Subject,
                    PrimaryTeacher = courseListList.PrimaryTeacher
                }).ToList();
                return Ok(courseViewModels);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }
        /// <summary>
        /// POST: /Student/GetCourseList
        /// </summary>
        /// <param name="model"></param>
        /// <returns>courseViewModels</returns>
        [System.Web.Http.HttpPost]
        [Route("GetChecklist")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetChecklist(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                var identity = (ClaimsIdentity)User.Identity;


                var portalParentStudentProxy = new PortalStudentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });


                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());
                var portalStudentResponse = portalParentStudentProxy.GetStudentChecklist(model.ClientDB.Decrypt<string>(), student.Id, student.GradeLevel, currIdentity);

                var courseViewModels = portalStudentResponse.StudentChecklists.Select(checklistList => new ChecklistViewModel()
                {
                    ID = checklistList.ID,
                    E3StudentId = checklistList.E3StudentId,
                    userId = checklistList.userId,
                    checklistId = checklistList.checklistId,
                    checkboxStatus = checklistList.checkboxStatus,
                    lastUpdate = checklistList.lastUpdate,
                    Month = checklistList.Month,
                    GradeLevel = checklistList.GradeLevel,
                    SequenceGrade = checklistList.SequenceGrade,
                    SequenceMonth = checklistList.SequenceMonth,
                    SequenceNumber = checklistList.SequenceNumber,
                    HTMLText = checklistList.HTMLText,
                    ClientId = model.ClientId,
                    ClientDB = model.ClientDB,
                    CacheDB = model.CacheDB
                }).ToList();
                return Ok(courseViewModels);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }
        /// <summary>
        /// POST: /Alert/GetAcademicAlerts
        /// </summary>
        /// <returns>alertViewModel</returns>

        [System.Web.Http.HttpPost]
        [Route("SaveChecklistItem")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> SaveChecklistItem(ChecklistViewModel model)
        {
            if (ModelState.IsValid)
            {
                StudentChecklist checklistItem = new StudentChecklist();
                Mapper.Map(model, checklistItem);

                var portalStudentChecklistResponse = new PortalStudentChecklistResponse
                {
                    StudentChecklists = new Collection<StudentChecklist> { checklistItem }
                };

                var identity = (ClaimsIdentity)User.Identity;

                var userId = identity.GetUserId();
                checklistItem.userId = userId;

                var portalParentStudentProxy = new PortalStudentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());

                portalStudentChecklistResponse = portalParentStudentProxy.SaveChecklistItem(model.ClientDB.Decrypt<string>(), portalStudentChecklistResponse, currIdentity);
                Mapper.Map(portalStudentChecklistResponse.StudentChecklists[0], model);
                return Ok(model);
            }

            return BadRequest(ModelState);
        }
    }
}