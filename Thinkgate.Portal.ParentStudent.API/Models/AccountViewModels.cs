using System.ComponentModel.DataAnnotations;
using Thinkgate.Portal.ParentStudent.API.Classes;

namespace Thinkgate.Portal.ParentStudent.API.Models
{
   
    public class TemporaryPasswordViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }
        [Display(Name = "GUID")]
        public string guid { get; set; }
        [Display(Name = "Student ID")]
        public string studentId { get; set; }
 
        public string client { get; set; }
        public string clientCache { get; set; }
        public bool isNewRegistration { get; set; }
    }

    public class LoginViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

    }

    public class ParentStudentLoginViewModel
    {
        [Required]               
        public string Username { get; set; }

        [Required]
        public string grant_type { get; set; }

        [Required]
        [DataType(DataType.Password)]        
        public string Password { get; set; }

    }
   
    public class ResetPasswordViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [Display(Name = "Code")]
        public string TmpCode { get; set; }        

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "New Password")]
        [PasswordValidator]
        public string NewPassword { get; set; }
        
        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("NewPassword", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }
}
