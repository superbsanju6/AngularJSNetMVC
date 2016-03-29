using AutoMapper;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.DataProtection;
using System;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using Thinkgate.Portal.ParentStudent.API.Classes;
using Thinkgate.Portal.ParentStudent.API.Models;
using Thinkgate.Portal.ParentStudent.Models;
using Thinkgate.Services.Contracts.ParentStudent;
using Thinkgate.Services.Contracts.ServiceModel;

namespace Thinkgate.Portal.ParentStudent.API.Controllers
{
    //[Authorize]
    [System.Web.Http.RoutePrefix("api/Account")]
    public class AccountController : ApiController
    {
        public UserManager<IdentityUser> UserManager { get; private set; }

        public AccountController()
            : this(Startup.UserManagerFactory())
        {
        }

        public AccountController(UserManager<IdentityUser> userManager)
        {
            UserManager = userManager;
        }


        //
        /// <summary>
        /// POST: /Account/ResetPassword
        /// </summary>
        /// <param name="model"></param>
        /// <returns>Ok</returns>

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("ResetPassword")]
        [ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                /* generate a new AspNetUser */
                AspNetUser user = new AspNetUser();

                /* map the new user to the model */
                Mapper.Map(model, user);

                /* create an identity value by using the UserManager object and find them by the user's 
                 * Email value that was mapped from the model passed in.  MUST BE DONE  */
                var identityResult = await UserManager.FindByEmailAsync(user.Email);
                if (identityResult == null)
                {
                    ModelState.AddModelError("", "No user found.");
                    return BadRequest(ModelState);
                }

                #region New UserTokenProvider

                //var resetProvider = new DpapiDataProtectionProvider("ParentStudentPortal");
                //UserManager.UserTokenProvider = new DataProtectorTokenProvider<IdentityUser>(resetProvider.Create("ResetPassWordId"));
                //                                                /* identityResult.Id for user.Id in UserManager routine below */
                //                                                /* first approach: getting error (No IUserTokenProvider is registered) */

                //var provider = new DpapiDataProtectionProvider("Sample");
                //UserManager.UserTokenProvider =
                //    new DataProtectorTokenProvider<IdentityUser>(provider.Create("EmailConfirmation"))
                //    {
                //        TokenLifespan = TimeSpan.FromHours(8)
                //    };                

                //string code = await UserManager.GeneratePasswordResetTokenAsync(identityResult.Id);
                #endregion

                //ApplicationUserManager.Create()

                var provider = new DpapiDataProtectionProvider("Sample");
                var userManager = new UserManager<IdentityUser>(new UserStore<IdentityUser>());
                userManager.UserTokenProvider = new DataProtectorTokenProvider<IdentityUser>(provider.Create("EmailConfirmation"));

                IdentityResult result;
                try
                {
                    var dbTempCode = userManager.GetClaims(identityResult.Id).Where(c => c.Type == "resetPassword");

                    if (dbTempCode.FirstOrDefault() != null && model.TmpCode.Equals(dbTempCode.FirstOrDefault().Value))
                    {
                        await userManager.RemovePasswordAsync(identityResult.Id);
                        result = await userManager.AddPasswordAsync(identityResult.Id, user.NewPassword);

                        foreach (var claim in dbTempCode)
                            userManager.RemoveClaim(identityResult.Id, new Claim(claim.Type, claim.Value));
                    }
                    else
                    {
                        ModelState.AddModelError("", "Token is invalid.");
                        return BadRequest(ModelState);
                    }
                    //result =
                    //    await
                    //        userManager.ResetPasswordAsync(
                    //            identityResult.Id,
                    //            model.TmpCode,
                    //            user.NewPassword);
                }
                catch (Exception ec)
                {
                    throw new Exception(ec.Message, ec);
                }

                if (result.Succeeded)
                {
                    return Ok();
                }

                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error);
                }

            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }
        //
        /// <summary>
        /// POST: /Account/TemporaryPassword
        /// </summary>
        /// <param name="model"></param>
        /// <returns>Ok</returns>

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("TemporaryPassword")]
        [ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> TemporaryPassword(TemporaryPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            StringBuilder emailBody = new StringBuilder();
            var user = await UserManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                ModelState.AddModelError("", "The email either does not exist or is not confirmed.");
                return BadRequest(ModelState);
            }
            //var provider = new DpapiDataProtectionProvider("Sample");
            //UserManager.UserTokenProvider = new DataProtectorTokenProvider<IdentityUser>(provider.Create("EmailConfirmation"))
            //{
            //    TokenLifespan = TimeSpan.FromHours(8)
            //};

            var provider = new DpapiDataProtectionProvider("Sample");
            var userManager = new UserManager<IdentityUser>(new UserStore<IdentityUser>());
            userManager.UserTokenProvider =
                new DataProtectorTokenProvider<IdentityUser>(
                    provider.Create("EmailConfirmation"))
                {
                    TokenLifespan = TimeSpan.FromHours(8)
                };

            string code;
            try
            {
                var tokenClaim = userManager.GetClaims(user.Id).Where(c => c.Type == "resetPassword");
                foreach (var claim in tokenClaim)
                    userManager.RemoveClaim(user.Id, new Claim(claim.Type, claim.Value));

                code = await userManager.GeneratePasswordResetTokenAsync(user.Id);

                await userManager.AddClaimAsync(user.Id, new Claim("resetPassword", code));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            emailBody.Append("Thinkgate Parent/Student Portal Access Temporary Password Request.");
            emailBody.Append("<br><br>");
            emailBody.Append("This is an automated email. Please do not reply to this email as the mailbox is unmonitored and there is no response.");
            emailBody.Append("<br><br>");
            emailBody.Append(String.Format("Please Click <a href='{0}?tmpCode={1}'>here</a> to create a new password.", model.client, code));

            SendEmail(user.Email, "Thinkgate Parent/Student Portal Temporary Password.", emailBody.ToString());

            return Ok();
        }
        //
        /// <summary>
        /// POST: /Account/TemporaryPassword
        /// </summary>
        /// <param name="model"></param>
        /// <returns>Ok</returns>

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("TemporaryPasswordGuid")]
        [ValidateAntiForgeryToken]
        public async Task<IHttpActionResult> TemporaryPasswordGuid(TemporaryPasswordViewModel model)
        {
            try
            {
                WriteEventLog("AccountController.TemporaryPasswordGuid() - API : Entry Point");

                if (!ModelState.IsValid)
                {
                    WriteEventLog(
                        "AccountController.TemporaryPasswordGuid() - API : ModelState is not Valid, returning bad request ModelState");
                    return BadRequest(ModelState);
                }

                var context = new ClientSuppliedIdEntities();
                if (
                    context.ClientSuppliedIdentifications.Count(
                        x => x.clientSuppliedId == model.guid && x.clientSuppliedStudentId == model.studentId) <= 0)
                {
                    WriteEventLog("AccountController.TemporaryPasswordGuid() - API : Parent's ID " + model.guid +
                                  " or Student Id " + model.studentId + " does not exists");
                    ModelState.AddModelError("", "The Parent's ID either does not exist or is not confirmed.");
                    return BadRequest(ModelState);
                }

                ClientSuppliedIdentification clientSuppliedId =
                    context.ClientSuppliedIdentifications.First(
                        x => x.clientSuppliedId == model.guid && x.clientSuppliedStudentId == model.studentId);

                var emailBody = new StringBuilder();
                var user = await UserManager.FindByIdAsync(clientSuppliedId.aspnetId);
                if (user == null)
                {
                    WriteEventLog(
                        "AccountController.TemporaryPasswordGuid() - API : The Parent's ID was not setup correctly, please contact support for assistance.");
                    ModelState.AddModelError("",
                        "The Parent's ID was not setup correctly, please contact support for assistance.");
                    return BadRequest(ModelState);
                }

                //
                // Upate user's email address with the one provided by Parent
                UserManager.UserValidator = new UserValidator<IdentityUser>(UserManager)
                {
                    AllowOnlyAlphanumericUserNames = false
                };

                WriteEventLog("AccountController.TemporaryPasswordGuid() - API : Trying to find Parent by AspNetId " +
                              clientSuppliedId.aspnetId);
                var identityUser = await UserManager.FindByIdAsync(clientSuppliedId.aspnetId);

                if (identityUser != null)
                {
                    WriteEventLog(
                        "AccountController.TemporaryPasswordGuid() - API : Parent AspNet User found, setting Parent's Username and Email to the Email provided from HTML");
                    identityUser.Email = model.Email;
                    identityUser.UserName = model.Email;
                }
                else
                {
                    WriteEventLog("AccountController.TemporaryPasswordGuid() - API : Parent AspNet User not found");
                }

                var result = await UserManager.UpdateAsync(identityUser);

                if (result.Succeeded)
                {
                    WriteEventLog(
                        "AccountController.TemporaryPasswordGuid() - API : Successfully updated Parent's AspNet user info in database");
                }

                WriteEventLog(
                    "AccountController.TemporaryPasswordGuid() - API : Creating Microsoft.Owin.Security.DataProtection.DpapiDataProtectionProvider");

                //var provider = new DpapiDataProtectionProvider("Sample");
                //UserManager.UserTokenProvider =
                //    new DataProtectorTokenProvider<IdentityUser>(provider.Create("EmailConfirmation"))
                //    {
                //        TokenLifespan = TimeSpan.FromHours(8)
                //    };

                var provider = new DpapiDataProtectionProvider("Sample");
                var userManager = new UserManager<IdentityUser>(new UserStore<IdentityUser>());
                userManager.UserTokenProvider =
                    new DataProtectorTokenProvider<IdentityUser>(
                        provider.Create("EmailConfirmation"))
                    {
                        TokenLifespan = TimeSpan.FromHours(8)
                    };

                WriteEventLog(
                    "AccountController.TemporaryPasswordGuid() - API : Got token - trying to get Temp Code to send with Email as a link");

                var tokenClaim = userManager.GetClaims(user.Id).Where(c => c.Type == "resetPassword");
                foreach (var claim in tokenClaim)
                    userManager.RemoveClaim(user.Id, new Claim(claim.Type, claim.Value));

                string code = await userManager.GeneratePasswordResetTokenAsync(user.Id);

                await userManager.AddClaimAsync(user.Id, new Claim("resetPassword", code));

                WriteEventLog("AccountController.TemporaryPasswordGuid() - API : Got Temp Code, compising email to send");

                emailBody.Append("Thinkgate Parent/Student Portal Access Temporary Password Request.");
                emailBody.Append("<br><br>");
                emailBody.Append(
                    "This is an automated email. Please do not reply to this email as the mailbox is unmonitored and there is no response.");
                emailBody.Append("<br><br>");
                emailBody.Append(
                    String.Format("Please Click <a href='{0}?reg={1}&tmpCode={2}'>here</a> to create a new password.",
                        model.client + ConfigurationManager.AppSettings["TempPasswordPage"], model.isNewRegistration, code));
                WriteEventLog("AccountController.TemporaryPasswordGuid() - API : Calling Send Email Routine");
                SendEmail(user.Email, "Thinkgate Parent/Student Portal Temporary Password.", emailBody.ToString());

                //SendResetPasswordMessage(user.Email, string.Empty, "Thinkgate Parent/Student Portal Temporary Password.", emailBody.ToString());

                WriteEventLog("AccountController.TemporaryPasswordGuid() - API : Email Successfully Sent to " +
                              user.Email + ".  Returning 200 from API");
            }
            catch (ApplicationException ex)
            {
                string exception = "AccountController.TemporaryPasswordGuid() - API : Application Exception StackTrace: " + ex.StackTrace + " Inner Exception: " +
                                   ex.InnerException +
                                   " Message: " + ex.Message + " Source: " + ex.Source;
                WriteEventLog(exception);
                throw new ApplicationException(exception, ex);
            }
            catch (Exception ex)
            {
                string exception = "AccountController.TemporaryPasswordGuid() - API : Exception StackTrace: " + ex.StackTrace + " Inner Exception: " +
                                   ex.InnerException +
                                   " Message: " + ex.Message + " Source: " + ex.Source;
                WriteEventLog(exception);
                throw new Exception(exception, ex);
            }
            return Ok();
        }
        //
        /// <summary>
        /// POST: /Account/LogOff
        /// </summary>
        /// <returns>Ok</returns>

        [System.Web.Http.HttpPost]
        [System.Web.Http.Route("LogOff")]
        [ValidateAntiForgeryToken]
        public IHttpActionResult LogOff()
        {
            AuthenticationManager.SignOut();
            (new UserLoginAuth()).SignOut();
            return Ok();
        }

        /// <summary>
        /// POST: /token
        /// </summary>
        /// <param name="username"></param>
        /// <param name="password"></param>
        /// <param name="grant_type"></param>
        /// <returns></returns>
        [System.Web.Http.HttpPost]
        [ValidateAntiForgeryToken]
        [System.Web.Http.Route("~/Token")]
        public async Task<IHttpActionResult> Token(ParentStudentLoginViewModel login)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var tokenResponse = await (new UserLoginAuth()).Login(login.Username, login.Password);
                    if (tokenResponse.data != null)
                    {
                        return ResponseMessage(ControllerContext.Request.CreateResponse(HttpStatusCode.BadRequest, tokenResponse.data));
                    }
                    return Ok(tokenResponse);
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", ex.Message);
                }
            }
            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }


        // this has to be shift in Resource Controller
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("GetAttachment")]
        [ValidateAntiForgeryToken]
        [System.Web.Mvc.AllowAnonymous]
        public async Task<IHttpActionResult> GetAttachment(string guid, string clientId)
        {
            clientId = clientId.Decrypt<string>();
            if (ModelState.IsValid)
            {
                //var identity = (ClaimsIdentity)User.Identity;
                //var clientId = ClaimHelper.FindClaim("cacheId", identity);

                var portalCommonProxy = new PortalCommonProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });

                var portalCommonResponse = portalCommonProxy.GetCMSAttachment("", guid);
                var cmsAttachmentViewModel = portalCommonResponse.CMSAttachmentList.Select(x => new CMSAttachment
                {
                    AttachmentID = x.AttachmentID,
                    AttachmentName = x.AttachmentName,
                    AttachmentExtension = x.AttachmentExtension,
                    AttachmentSize = x.AttachmentSize,
                    AttachmentMimeType = x.AttachmentMimeType,
                    AttachmentBinary = x.AttachmentBinary,
                    AttachmentImageWidth = x.AttachmentImageWidth,
                    AttachmentImageHeight = x.AttachmentImageHeight,
                    AttachmentDocumentID = x.AttachmentDocumentID,
                    AttachmentGUID = x.AttachmentGUID,
                    AttachmentLastHistoryID = x.AttachmentLastHistoryID,
                    AttachmentSiteID = x.AttachmentSiteID,
                    AttachmentLastModified = x.AttachmentLastModified,
                    AttachmentIsUnsorted = x.AttachmentIsUnsorted,
                    AttachmentOrder = x.AttachmentOrder,
                    AttachmentGroupGUID = x.AttachmentGroupGUID,
                    AttachmentFormGUID = x.AttachmentFormGUID,
                    AttachmentHash = x.AttachmentHash,
                    AttachmentTitle = x.AttachmentTitle,
                    AttachmentDescription = x.AttachmentDescription,
                    AttachmentCustomData = x.AttachmentCustomData

                }).ToList().FirstOrDefault();

                if (cmsAttachmentViewModel != null && cmsAttachmentViewModel.AttachmentBinary != null)
                {
                    var response = new HttpResponseMessage();
                    response.Content = new ByteArrayContent(cmsAttachmentViewModel.AttachmentBinary.ToArray());
                    response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                    response.Content.Headers.ContentDisposition.FileName = cmsAttachmentViewModel.AttachmentName;
                    response.Content.Headers.ContentType = new MediaTypeHeaderValue(cmsAttachmentViewModel.AttachmentMimeType);
                    return ResponseMessage(response);
                }
                else
                {
                    //{0} is clientId
                    //{1} left two characters of Attachment GUID
                    //{2} is Attachment GUID
                    return Redirect(string.Format("{0}_{1}{5}{2}/{3}{4}", ConfigurationManager.AppSettings["KenticoURL"], clientId
                                        , cmsAttachmentViewModel.AttachmentGUID.ToString().Substring(0, 2)
                                        , cmsAttachmentViewModel.AttachmentGUID
                                        , cmsAttachmentViewModel.AttachmentExtension, ConfigurationManager.AppSettings["KenticoFilePath"]));
                }
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(ModelState);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && UserManager != null)
            {
                UserManager.Dispose();
                UserManager = null;
            }
            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.Current.GetOwinContext().Authentication;
            }
        }

        private async Task SignInAsync(ClaimsIdentity userIdentity, bool isPersistent)
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie);
            AuthenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = isPersistent }, userIdentity);
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private bool HasPassword()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            if (user != null)
            {
                return user.PasswordHash != null;
            }
            return false;
        }

        public string SendResetPasswordMessage(string toEmailAddress, string newPassword, string emailSubject, string emailBody)
        {
            WriteEventLog("AccountController.SendResetPasswordMessage() - API : Entry Point");

            string _success = "Your message was sent successfully";
            string exception = string.Empty;
            try
            {
                WriteEventLog("AccountController.SendResetPasswordMessage() - API : Composing email and SmtpClient object");
                MailMessage mail = new MailMessage();
                SmtpClient SmtpServer = new SmtpClient("10.176.132.133");
                SmtpServer.ServicePoint.MaxIdleTime = 1;
                mail.From = new MailAddress("noreply@thinkgate.net");
                mail.To.Add(toEmailAddress);
                mail.Subject = emailSubject;
                mail.Body = string.Format(emailBody);
                mail.IsBodyHtml = true;
                SmtpServer.Port = 25;
                SmtpServer.Credentials = new NetworkCredential("smtpNoReply", "$t@and12345");
                SmtpServer.EnableSsl = false;
                SmtpServer.Timeout = 15000;
                WriteEventLog("AccountController.SendResetPasswordMessage() - API : Trying to send email using SmtpClient");
                SmtpServer.Send(mail);
                WriteEventLog("AccountController.SendResetPasswordMessage() - API : Returning Successfully from SmtpClient.Send() ");
                return _success;

            }
            catch (Exception ex)
            {
                exception = "AccountController.SendResetPasswordMessage() - API : Exception StackTrace: " + ex.StackTrace + " Inner Exception: " +
                   ex.InnerException +
                   " Message: " + ex.Message + " Source: " + ex.Source;
                WriteEventLog(exception);
                throw new Exception(exception, ex);
            }

            return (exception);
        }

        private void SendEmail(string email, string subject, string message)
        {
            WriteEventLog("AccountController.SendEmail() - API : Entry Point");
            try
            {
                WriteEventLog("AccountController.SendEmail() - API : Creating Saml Token");
                var portalParentStudentProxy = new PortalCommonProxy(new SamlSecurityTokenSettings()
                {
                    SamlSecurityTokenizerAction = SamlSecurityTokenizerAction.UseThreadPrincipalIdentity,
                    ServiceCertificateStoreName = ConfigurationManager.AppSettings["ServiceCertificateStoreName"],
                    ServiceCertificateThumbprint = ConfigurationManager.AppSettings["ServiceCertificateThumbprint"]
                });
                WriteEventLog("AccountController.SendEmail() - API : Making request to " + ConfigurationManager.AppSettings["SmtpServerDatabase"] + " for SMTP config");
                var portalCommonResponse = portalParentStudentProxy.GetSmtpService(ConfigurationManager.AppSettings["SmtpServerDatabase"]);

                WriteEventLog("AccountController.SendEmail() - API : Creating SMTP client object");
                SmtpClient mySmtpClient = new SmtpClient { UseDefaultCredentials = false };

                WriteEventLog("AccountController.SendEmail() - API : Authenticating SMTP server with credential from db settings");
                // set smtp-client with basicAuthentication
                NetworkCredential basicAuthenticationInfo = new
                    NetworkCredential(portalCommonResponse.PortalSmtpResponse.UserName, portalCommonResponse.PortalSmtpResponse.Password);
                mySmtpClient.Credentials = basicAuthenticationInfo;
                mySmtpClient.Host = portalCommonResponse.PortalSmtpResponse.SmtpHost;
                mySmtpClient.Port = portalCommonResponse.PortalSmtpResponse.Port;

                WriteEventLog("AccountController.SendEmail() - API : Preparing email to send");
                // add from,to mailaddresses
                MailAddress from = new MailAddress(portalCommonResponse.PortalSmtpResponse.FromEmailAddress, "Thinkgate Platform");
                MailAddress to = new MailAddress(email);
                MailMessage myMail = new MailMessage(from, to)
                {
                    Subject = subject,
                    SubjectEncoding = Encoding.UTF8,
                    Body = message,
                    BodyEncoding = Encoding.UTF8,
                    IsBodyHtml = true
                };

                WriteEventLog("AccountController.SendEmail() - API : Attempting to send email");
                mySmtpClient.Send(myMail);
                WriteEventLog("AccountController.SendEmail() - API : Email successfully sent to " + to.Address);
            }

            catch (SmtpException ex)
            {
                var exception = "SMTP Exception StackTrace: " + ex.StackTrace + " Inner Exception: " + ex.InnerException +
                                " Message: " + ex.Message + " Source: " + ex.Source;
                WriteEventLog("AccountController.SendEmail() - API : Error sending email : " + exception);
                throw new Exception(exception, ex);
            }
            catch (Exception ex)
            {
                var exception = "Exception StackTrace: " + ex.StackTrace + " Inner Exception: " + ex.InnerException +
                                " Message: " + ex.Message + " Source: " + ex.Source;
                WriteEventLog("AccountController.SendEmail() - API : Error sending email : " + exception);
                throw new Exception(exception, ex);
            }
        }


        private void WriteEventLog(string sEvent)
        {
            bool isDebugMode = ConfigurationManager.AppSettings["isDebugMode"] != null &&
                               ConfigurationManager.AppSettings["isDebugMode"] == "true";
            if (!isDebugMode) return;
            string sSource = "Application";
            EventLog.WriteEntry(sSource, sEvent);
        }

        public enum ManageMessageId
        {
            ChangePasswordSuccess,
            SetPasswordSuccess,
            RemoveLoginSuccess,
            Error
        }

        #endregion
    }
}