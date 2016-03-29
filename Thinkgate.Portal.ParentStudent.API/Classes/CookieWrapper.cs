using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Thinkgate.Portal.ParentStudent.API.Classes
{
    public class CookieWrapper
    {
        private const string ApplicationName = "Thinkgate.Portal.ParentStudent.Web";

        private enum CookieItem
        {
            SlidingTime,
            UniqueSessionKey
        }
        /**************
        All cookie values are accessible by public static methods.
        No typos/duplicates are possible from calling code!
        **************/

        public static string SlidingTime
        {
            get { return Convert.ToString(string.IsNullOrWhiteSpace(GetCookieVal(CookieItem.SlidingTime)) ? null : GetCookieVal(CookieItem.SlidingTime)); }
            set { UpdateCookieVal(CookieItem.SlidingTime, value.ToString(), 1); }
        }

        public static string UniqueSessionKey
        {
            get { return Convert.ToString(string.IsNullOrWhiteSpace(GetCookieVal(CookieItem.UniqueSessionKey)) ? null : GetCookieVal(CookieItem.UniqueSessionKey)); }
            set { UpdateCookieVal(CookieItem.UniqueSessionKey, value.ToString(), 1); }
        }


        private static string GetCookieVal(CookieItem item)
        {
            HttpCookie cookie = GetAppCookie(false); //get the existing cookie
            return (cookie != null && (cookie.Values[item.ToString()] != null)) //value or empty if doesn't exist
                ? cookie.Values[item.ToString()]
                : string.Empty;
        }

        private static void UpdateCookieVal(CookieItem item, string val, int expireDays)
        {
            //get the existing cookie (or new if not exists)
            HttpCookie cookie = GetAppCookie(true);

            //modify its contents & meta.
            cookie.Expires = DateTime.Now.AddDays(expireDays);
            cookie.Values[item.ToString()] = val;

            //add back to the http response to send back to the browser
            HttpContext.Current.Response.Cookies.Add(cookie);
        }

        private static HttpCookie GetAppCookie(bool createIfDoesntExist)
        {
            if (HttpContext.Current == null)
                return null;
            //get the cookie or a new one if indicated
            return HttpContext.Current.Request.Cookies[ApplicationName] ?? ((createIfDoesntExist) ? new HttpCookie(ApplicationName) : null);
        }
    }
}