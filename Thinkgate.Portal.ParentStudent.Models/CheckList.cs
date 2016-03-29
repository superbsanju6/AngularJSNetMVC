using System;

namespace Thinkgate.Portal.ParentStudent.Models
{
    public class CheckList
    {
        public int ID { get; set; }
        public int E3StudentId { get; set; }
        public int userId { get; set; }
        public int checklistId { get; set; }
        public bool? checkboxStatus { get; set; }
        public DateTime? lastUpdate { get; set; }
        public string Month { get; set; }
        public string GradeLevel { get; set; }
        public int? SequenceGrade { get; set; }
        public int? SequenceMonth { get; set; }
        public int? SequenceNumber { get; set; }
        public string HTMLText { get; set; }
    }
}