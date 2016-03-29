using System;
namespace Thinkgate.Portal.ParentStudent.API.Models
{
    public class LinksViewModel
    {
        public int ID { get; set; }
        public string LinkName { get; set; }
        public string Url { get; set; }
        public string Phone { get; set; }
        public int StudentId { get; set; }
        public Guid? AttachmentGuid { get; set; }
        public int DocumentId { get; set; }
        public bool IsAttachment { get; set; }

        public string Desc { get; set; }

        public DateTime? AssignDate { get; set; }

        public DateTime? AssignBeginDate { get; set; }

        public DateTime? AssignEndDate { get; set; }
    }
}