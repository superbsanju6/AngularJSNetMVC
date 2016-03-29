using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Thinkgate.Portal.ParentStudent.API.Models
{
    public class AssessmentStandardViewModel
    {
        public int? StandardID { get; set; }
        public int? StandardParentId { get; set; }
        public string Level { get; set; }
        public string StandardName { get; set; }
        public string Desc { get; set; }
        public string ClientId { get; set; }

        public int? CourseId { get; set; }
    }
}