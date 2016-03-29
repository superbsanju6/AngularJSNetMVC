using System;

namespace Thinkgate.Portal.ParentStudent.API.Models
{

    public class AlertViewModel
    {
        public int Id { get; set; }
        public int AlertType { get; set; }
        public string AlertMessage { get; set; }
        public int StudentId { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime? AcknowledgedDate { get; set; }
        public string AcknowledgedUser { get; set; }


        public string ClientId { get; set; }
        public string ClientDB { get; set; }
        public string CacheDB { get; set; }

    }
}
