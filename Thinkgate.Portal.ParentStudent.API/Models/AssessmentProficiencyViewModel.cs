using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Thinkgate.Portal.ParentStudent.API.Models
{
    public class AssessmentProficiencyViewModel
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string Description { get; set; }
        public decimal ScorePercent { get; set; }
        public DateTime ScoredDate { get; set; }
        public string SchoolYear { get; set; }
        public string Subject { get; set; }
        public string Course { get; set; }
        public int? CourseId { get; set; }
    }
}