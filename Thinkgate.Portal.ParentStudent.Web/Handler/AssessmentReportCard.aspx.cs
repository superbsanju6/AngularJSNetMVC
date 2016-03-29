using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.Reporting.WebForms;
using System.Net;
using System.Configuration;


namespace Thinkgate.Portal.ParentStudent.Web.ViewsStatic
{

    public partial class AssessmentReportCard : Page
    {
        private string UserName { get; set; }
        private string Password { get; set; }
        
        
        private Uri ReportServerUrl { get; set; }
        private string ReportPath { get; set; }

        private string Client { get; set; }
        private string Domain { get; set; }
        private string Year { get; set; }                
        private string Course { get; set; }
        private string StudentTGID { get; set; }
        public string DomainId { get; set; }

        protected override void OnInit(EventArgs e)
        {
            this.UserName = ConfigurationManager.AppSettings["UserName"];
            this.Password = ConfigurationManager.AppSettings["Password"];
           
            this.ReportServerUrl = new Uri(ConfigurationManager.AppSettings["ReportServerUrl"]);
            this.ReportPath = ConfigurationManager.AppSettings["ReportPath"];
            this.Domain = ConfigurationManager.AppSettings["Domain"];
           

            this.Client = Request.QueryString["ClientID"];
            this.Year = Request.QueryString["SchoolYear"];
            this.DomainId = Request.QueryString["DomainID"];
            this.Course = Request.QueryString["CurrCourseID"];
            this.StudentTGID = Request.QueryString["StudentID"];
            base.OnInit(e);
        }


        protected void Page_Load(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                var reportParameterCollection = ReportParameters();
                rptViewer.ServerReport.ReportServerCredentials = new CustomReportCredentials(this.UserName, this.Password, this.Domain);
                rptViewer.ServerReport.ReportServerUrl = this.ReportServerUrl;
                rptViewer.ServerReport.ReportPath = this.ReportPath;
                rptViewer.ServerReport.SetParameters(reportParameterCollection);
                rptViewer.ServerReport.Refresh();
            }
        }

        private ReportParameterCollection ReportParameters()
        {
            var parms = new ReportParameterCollection();
            parms.Add(new ReportParameter("ClientID", this.Client));
            parms.Add(new ReportParameter("SchoolYear", this.Year));
            parms.Add(new ReportParameter("DomainID", this.DomainId));            
            parms.Add(new ReportParameter("CurrCourseID", this.Course));
            parms.Add(new ReportParameter("StudentID", this.StudentTGID));
            return parms;
        }

    }

    [Serializable]
    public class CustomReportCredentials : IReportServerCredentials
    {
        private string _UserName;
        private string _PassWord;
        private string _DomainName;

        public CustomReportCredentials(string UserName, string PassWord, string DomainName)
        {
            _UserName = UserName;
            _PassWord = PassWord;
            _DomainName = DomainName;
        }

        public System.Security.Principal.WindowsIdentity ImpersonationUser
        {
            get { return null; }
        }

        public ICredentials NetworkCredentials
        {
            get { return new NetworkCredential(_UserName, _PassWord, _DomainName); }
        }

        public bool GetFormsCredentials(out Cookie authCookie, out string user,
         out string password, out string authority)
        {
            authCookie = null;
            user = password = authority = null;
            return false;
        }
    }
}