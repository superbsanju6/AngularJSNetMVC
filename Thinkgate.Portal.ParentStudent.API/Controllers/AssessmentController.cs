using AutoMapper;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Configuration;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using Thinkgate.Portal.ParentStudent.API.Classes;
using Thinkgate.Portal.ParentStudent.API.Models;
using Thinkgate.Portal.ParentStudent.Models;
using Thinkgate.Services.Contracts.ParentStudent;
using Thinkgate.Services.Contracts.ServiceModel;

namespace Thinkgate.Portal.ParentStudent.API.Controllers
{
    [AuthorizeRedirectPostAttribute]
    [RoutePrefix("api/Assessment")]
    public class AssessmentController : ApiController
    {

        public UserManager<IdentityUser> UserManager { get; private set; }

        public AssessmentController()
            : this(Startup.UserManagerFactory())
        {
        }

        public AssessmentController(UserManager<IdentityUser> userManager)
        {
            UserManager = userManager;
        }

        //
        /// <summary>
        ///  POST: /Assessment/GetAssessmentScoring
        /// </summary>
        /// <returns>assessmentScoreViewModel</returns>

        [System.Web.Http.HttpPost]
        [Route("GetAssessmentScoring")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetAssessmentScoring(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                var identity = (ClaimsIdentity)User.Identity;
                
                var studentId = student.Id;

                var portalAssessmentProxy = new PortalAssessmentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });


                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());

                var portalAssessmentResponse = portalAssessmentProxy.GetStudentAssessments(model.ClientDB.Decrypt<string>(), studentId, currIdentity);
                var assessmentScoreViewModel = portalAssessmentResponse.AssessmentScoreLists.Select(assessmentScoreListList => new AssessmentScoreViewModel
                {
                    Id = assessmentScoreListList.Id,
                    StudentId = assessmentScoreListList.StudentId,
                    Description = assessmentScoreListList.Description,
                    ScorePercent = decimal.Parse(string.Format("{0:0.00}", assessmentScoreListList.ScorePercent)),
                    ClassAverage = decimal.Parse(string.Format("{0:0.00}", assessmentScoreListList.ClassAverage)),
                    ScoredDate = assessmentScoreListList.ScoredDate,
                    SchoolYear = assessmentScoreListList.SchoolYear,
                    Subject = assessmentScoreListList.Subject,
                    Course = assessmentScoreListList.Course
                }).OrderBy(ord => ord.ScoredDate).ToList();

                return Ok(assessmentScoreViewModel);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }
        //
        /// <summary>
        /// POST: /Assessment/GetAssessmentProficiency
        /// </summary>
        /// <returns>assessmentProficiencyViewModel</returns>

        [System.Web.Http.HttpPost]
        [Route("GetAssessmentProficiency")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetAssessmentProficiency(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                var identity = (ClaimsIdentity)User.Identity;                
                var studentId = student.Id;

                var portalAssessmentProxy = new PortalAssessmentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());

                var portalAssessmentResponse = portalAssessmentProxy.GetStudentProficency(model.ClientDB.Decrypt<string>(), studentId, currIdentity);
                var assessmentProficiencyViewModel = portalAssessmentResponse.AssessmentProficienyLists.Select(assessmentProficiencyListList => new AssessmentProficiencyViewModel
                {
                    Id = assessmentProficiencyListList.ID,
                    StudentId = assessmentProficiencyListList.StudentId,
                    Description = assessmentProficiencyListList.Description,
                    ScorePercent = assessmentProficiencyListList.ScorePercent,
                    ScoredDate = assessmentProficiencyListList.ScoredDate,
                    SchoolYear = assessmentProficiencyListList.SchoolYear,
                    Subject = assessmentProficiencyListList.Subject,
                    Course = assessmentProficiencyListList.Course,
                    CourseId = assessmentProficiencyListList.CourseId
                }).OrderBy(ord => ord.ScoredDate).ToList();

                return Ok(assessmentProficiencyViewModel);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }

        /// <summary>
        /// POST: /Assessment/GetAssessmentStandard
        /// </summary>
        /// <param name="model">assessmentProficiencyViewModel</param>
        /// <returns></returns>

        [System.Web.Http.HttpPost]
        [Route("GetAssessmentStandard")]
        [System.Web.Mvc.ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> GetAssessmentStandard(StudentProfileViewModels model)
        {
            if (ModelState.IsValid)
            {
                StudentProfileModel student = new StudentProfileModel();
                Mapper.Map(model, student);

                var identity = (ClaimsIdentity)User.Identity;
               
                var studentId = student.Id;

                var portalAssessmentProxy = new PortalAssessmentProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var currIdentity = ClaimHelper.Update(identity, "cacheId", model.CacheDB.Decrypt<string>());
                currIdentity = ClaimHelper.Update(currIdentity, "clientId", model.ClientDB.Decrypt<string>());

                var portalAssessmentResponse = portalAssessmentProxy.GetStudentAssesmentStandard(model.ClientDB.Decrypt<string>(), studentId, currIdentity);
                var assessmentStandardViewModel = portalAssessmentResponse.AssessmentProficienyStandardLists.Select(assessmentProficiencyListList => new AssessmentStandardViewModel
                {
                    StandardID = assessmentProficiencyListList.StandardID,
                    StandardParentId = assessmentProficiencyListList.StandardParentId,
                    Level = assessmentProficiencyListList.Level,
                    StandardName = assessmentProficiencyListList.StandardName,
                    Desc = assessmentProficiencyListList.Desc,
                    ClientId = model.ClientId.Decrypt<string>(),
                    CourseId = assessmentProficiencyListList.CourseId
                }).ToList();

                return Ok(assessmentStandardViewModel);
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }
    }
}