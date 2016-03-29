using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;

namespace Thinkgate.Portal.ParentStudent.API.Classes
{
    public class ClaimHelper
    {
        public static Claim FindClaim(string type, ClaimsIdentity identity)
        {
            try
            {
                var claim = (from c in identity.Claims
                             where c.Type == type
                             select c).Single();
                return claim;
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        public static ClaimsIdentity Update(ClaimsIdentity identity, string key, string value)
        {
            var currIdentity = identity.Clone();

            foreach (var item in currIdentity.Claims.ToList())
            {
                currIdentity.RemoveClaim(item);
            }

            foreach (var item in identity.Claims)
            {
                if (item.Type.ToLower() == key.ToLower())
                    currIdentity.AddClaim(new Claim(key, value));
                else
                    currIdentity.AddClaim(item);
            }

            return currIdentity;
        }
    }
}