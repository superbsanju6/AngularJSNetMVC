//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ProcessParentStudentImportWebAPI.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class stg_PCSD_import
    {
        public int ID { get; set; }
        public string StudentID { get; set; }
        public string ParentID { get; set; }
        public string StudentLastName { get; set; }
        public string StudentFirstName { get; set; }
        public string StudentMiddleName { get; set; }
        public string ParentLastName { get; set; }
        public string ParentFirstName { get; set; }
        public string CounselorLastName { get; set; }
    }
}