<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AssessmentReportCard.aspx.cs" Inherits="Thinkgate.Portal.ParentStudent.Web.ViewsStatic.AssessmentReportCard" %>

<%@ Register Assembly="Microsoft.ReportViewer.WebForms, Version=10.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a" Namespace="Microsoft.Reporting.WebForms" TagPrefix="rsweb" %>

<html style="overflow:auto">
<body>
    <form runat="server">
        <asp:ScriptManager runat="server"></asp:ScriptManager>
        <rsweb:ReportViewer ID="rptViewer" runat="server" ShowParameterPrompts="false" ProcessingMode="Remote" Width="100%" Height="100%">
        </rsweb:ReportViewer>
    </form>
</body>
</html>
