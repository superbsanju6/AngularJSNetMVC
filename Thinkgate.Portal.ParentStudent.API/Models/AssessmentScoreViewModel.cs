using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Thinkgate.Portal.ParentStudent.API.Models
{
    public class AssessmentScoreViewModel
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string Description { get; set; }
        public Decimal ScorePercent { get; set; }
        public Decimal ClassAverage { get; set; }
        public DateTime ScoredDate { get; set; }
        public string SchoolYear { get; set; }
        public string Subject { get; set; }
        public string Course { get; set; }
    }
}