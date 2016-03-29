using System;
using System.Data;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using ProcessParentStudentImportWebAPI.Classes;
using ProcessParentStudentImportWebAPI.Models;

namespace ProcessParentStudentImportWebAPI.Controllers
{
    [RoutePrefix("api/ProcessImport")]
    public class ProcessImportController : ApiController
    {
        [HttpPost]
        [Route("Process")]
        public async Task<IHttpActionResult> Process(string client, string cache)
        {
            var context = new ThinkgateParentStudent();
            var contextImport = new stg_PCSD_importModelViewEntities();
            var contextIdentities = new ClientSuppliedIdentificationtEntities();
            var contextStudents = new StudentEntities();
            var contextParentStudentHash = new ParentStudentHashModelViewEntities();

            if (contextImport.Database.Connection.State != ConnectionState.Open) contextImport.Database.Connection.Open();
            contextImport.Database.Connection.ChangeDatabase(client);
            if (contextStudents.Database.Connection.State != ConnectionState.Open) contextStudents.Database.Connection.Open();
            contextStudents.Database.Connection.ChangeDatabase(client);
            if (context.Database.Connection.State != ConnectionState.Open) context.Database.Connection.Open();
            if (contextIdentities.Database.Connection.State != ConnectionState.Open) contextIdentities.Database.Connection.Open();
            if (contextParentStudentHash.Database.Connection.State != ConnectionState.Open) contextParentStudentHash.Database.Connection.Open();
            contextParentStudentHash.Database.Connection.ChangeDatabase(cache);

            var students = contextStudents.Students.ToList();
            var clientSuppliedIdentifications = contextIdentities.ClientSuppliedIdentifications.ToList();

            try
            {
                foreach (var importDataItem in contextImport.stg_PCSD_import)
                {
                    LogImportRecord("Start Import", "Record ID " + importDataItem.ID);
                    var studentInfo = students.Find(o => o.Student_ID == importDataItem.StudentID);
                    if (studentInfo == null)
                    {
                        Console.WriteLine("Student: " + importDataItem.StudentID + " not found.");
                        LogImportRecord(
                            "",
                            " Record ID: " + importDataItem.ID + " with student ID "
                            + importDataItem.StudentID + " does not exists in " + client
                            + ".dbo.Students.");
                        continue;
                    }

                    var userManager =
                        new UserManager<IdentityUser>(new UserStore<IdentityUser>(context));
                    var user = new IdentityUser
                               {
                                   UserName = importDataItem.ParentID
                               };
                    var identityUser = userManager.FindByName(user.UserName);

                    //var clientSuppliedview = new ClientSuppliedIdentification();

                    if (identityUser == null)
                    {
                        var passwordGenerator = new PasswordGenerator();
                        var identityResult = userManager.Create(user, passwordGenerator.Generate());
                        if (identityResult.Succeeded)
                        {
                            identityUser = userManager.FindByName(user.UserName);
                        }

                        var roleManager =
                            new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));
                        if (!roleManager.RoleExists("Guardian"))
                        {
                            roleManager.Create(new IdentityRole("Guardian"));
                        }
                        if (identityUser != null)
                        {
                            userManager.AddToRole(identityUser.Id, "Guardian");
                            userManager.AddClaim(identityUser.Id, new Claim("clientId", client));
                            userManager.AddClaim(identityUser.Id, new Claim("cacheId", cache));
                            userManager.Update(identityUser);
                        }
                    }

                    var clientSuppliedview =
                        clientSuppliedIdentifications.Find(
                            o =>
                                o.clientSuppliedId == importDataItem.ParentID &&
                                o.clientSuppliedStudentId == importDataItem.StudentID) ??
                        new ClientSuppliedIdentification();

                    clientSuppliedview.clientSuppliedId = importDataItem.ParentID;
                    clientSuppliedview.clientSuppliedStudentId = importDataItem.StudentID;
                    clientSuppliedview.studentId = studentInfo.ID;

                    if (identityUser != null)
                    {
                        clientSuppliedview.aspnetId = identityUser.Id;
                    }

                    contextIdentities.Entry(clientSuppliedview).State = clientSuppliedview.Id > 0
                        ? EntityState.Modified
                        : EntityState.Added;
                    contextIdentities.SaveChanges();

                    if (contextParentStudentHash.ParentStudentHashes
                                                .Any(
                                                    o =>
                                                        o.userId == identityUser.Id
                                                        && clientSuppliedview.studentId
                                                        == o.studentId))
                    {
                        LogImportRecord(
                            "",
                            "Record ID of " + importDataItem.ID + " with Parent/Student "
                            + importDataItem.ParentID + " / " + importDataItem.StudentID
                            + " already exists in " + cache + ".dbo.ParentStudentHash.");
                        continue;
                    }

                    var parentStudentHash = contextParentStudentHash.ParentStudentHashes.ToList()
                                                                    .Find(
                                                                        o =>
                                                                            o.studentId
                                                                            == Convert.ToInt32(
                                                                                clientSuppliedview
                                                                                    .studentId) &&
                                                                            o.userId
                                                                            == clientSuppliedview
                                                                                .aspnetId) ??
                                            new ParentStudentHash
                                            {
                                                studentId =
                                                    Convert.ToInt32(clientSuppliedview.studentId),
                                                userId = clientSuppliedview.aspnetId
                                            };

                    contextParentStudentHash.Entry(parentStudentHash).State = parentStudentHash.ID > 0
                        ? EntityState.Modified
                        : EntityState.Added;
                    LogImportRecord(
                        "",
                        "Record ID " + importDataItem.ID + " with Parent/Student "
                        + importDataItem.ParentID + " / " + importDataItem.StudentID
                        + " saved successfully.");
                    contextParentStudentHash.SaveChanges();
                    LogImportRecord("End Import", "Record ID " + importDataItem.ID);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            contextImport.Database.Connection.Close();
            contextStudents.Database.Connection.Close();
            context.Database.Connection.Close();
            contextIdentities.Database.Connection.Close();
            contextParentStudentHash.Database.Connection.Close();

            return Ok();
        }

        public void LogImportRecord(string strCategory, string strMessage)
        {
            // Store the script names and test results in a output text file.
            string fileName = @"c:\logs\PCSD_Import.txt";
            if (!Directory.Exists(@"c:\logs")) Directory.CreateDirectory(@"c:\logs");
            using (var writer = new StreamWriter(File.Open(fileName, FileMode.Append)))
            {
                if (strCategory != "")
                {
                    writer.WriteLine("{0} {1} {2}", strCategory, strMessage, DateTime.Now);
                }
                else
                {
                    writer.WriteLine("     {0} {1} {2}", strCategory, strMessage, DateTime.Now);
                }
            }
        }

    }
}