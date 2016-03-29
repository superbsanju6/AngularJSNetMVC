using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Thinkgate.Portal.ParentStudent.Models
{
    public class StudentList
    {
        public int Id { get; set; }
        public string ProfileImageUrl { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public bool AlertFlag { get; set; }
    }
}