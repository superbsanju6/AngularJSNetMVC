using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Thinkgate.Portal.ParentStudent.Models
{
    public class StudentProfileModel
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string GradeLevel { get; set; }
        public string SchoolName { get; set; }
    }
}