using System;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Text.RegularExpressions;

namespace Thinkgate.Portal.ParentStudent.API.Classes
{
    public class PasswordValidator : ValidationAttribute
    {

        public override bool IsValid(object value)
        {
            if(value == null) return true;

            string passwordString = value.ToString();

            if (passwordString.Length < Convert.ToInt32(ConfigurationManager.AppSettings["PasswordLength"]))
                {
                    ErrorMessage = String.Format("Password is too short.  It needs to be at least {0} characters long.",
                        ConfigurationManager.AppSettings["PasswordLength"]);
                    return false;
                }

            if (Convert.ToBoolean(ConfigurationManager.AppSettings["PasswordRequireDigit"]))
                //if (!Regex.Match(passwordString, @"/\d+/", RegexOptions.ECMAScript).Success)
                if (!Regex.IsMatch(passwordString, @"(?=.*\d)"))
                {
                    ErrorMessage = "Password must contain at least one numeric.";
                    return false;
                }

            if (Convert.ToBoolean(ConfigurationManager.AppSettings["PasswordRequireLowercase"]))
                //if (!Regex.Match(passwordString, @"/[a-z]/", RegexOptions.ECMAScript).Success)
                if (!Regex.IsMatch(passwordString, @"(?=.*[a-z])"))
                {
                    ErrorMessage = "Password must contain at least one lowercase letter.";
                    return false;
                }

            if (Convert.ToBoolean(ConfigurationManager.AppSettings["PasswordRequireUppercase"]))
                //if(!Regex.Match(passwordString, @"/[A-Z]/", RegexOptions.ECMAScript).Success)
                if (!Regex.IsMatch(passwordString, @"(?=.*[A-Z])"))
                {
                    ErrorMessage = "Password must contain at least one capital letter.";
                    return false;
                }

            if (Convert.ToBoolean(ConfigurationManager.AppSettings["PasswordRequireNonLetterOrDigit"]))

                if (!Regex.Match(passwordString, @"[-!@#$%^&*()_+|~=`{}\[\]:;'<>?.\/]", RegexOptions.ECMAScript).Success)
                {
                   ErrorMessage = "Password must contain at least one special character.";
                    return false;
                }
            
            return true;
        }
    }
}