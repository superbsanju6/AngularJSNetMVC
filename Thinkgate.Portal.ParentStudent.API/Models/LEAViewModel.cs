using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;

namespace Thinkgate.Portal.ParentStudent.API.Models
{
    public class LEAViewModel
    {
        public string ClientDB { get; set; }
        public string CacheDB { get; set; }
        public string ClientId { get; set; }
        public ClaimsIdentity Identity { get; set; }

        public LEAViewModel()
            : this(string.Empty, string.Empty, string.Empty, null)
        { }

        public LEAViewModel(string clientDB, string cacheDB, string clientId, ClaimsIdentity identity)
        {
            this.ClientId = clientId;
            this.CacheDB = cacheDB;
            this.ClientDB = clientDB;
            this.Identity = identity;
        }
    }
}