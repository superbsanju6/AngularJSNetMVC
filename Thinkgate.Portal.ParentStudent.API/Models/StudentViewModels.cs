using System;
using System.ComponentModel.DataAnnotations;

namespace Thinkgate.Portal.ParentStudent.API.Models
{
    public class StudentViewModels
    {
        [Display(Name = "Student Unique Identifier")]
        public int Id { get; set; }
        [Display(Name = "URL Student's Profile Image")]
        public string ProfileImageUrl { get; set; }
        [Display(Name = "Student's Last Name")]
        public string LastName { get; set; }

        [Display(Name = "Student's First Name")]
        public string FirstName { get; set; }

        [Display(Name = "Student has alerts")]
        public Nullable<bool> AlertFlag { get; set; }


        public string ClientId { get; set; }

        public string ClientDB { get; set; }

        public string CacheDB { get; set; }
        
    }
    public class StudentProfileViewModels
    {
        [Display(Name = "Student Unique Identifier")]
        public int Id { get; set; }
        [Display(Name = "Student's ID")]
        public string StudentId { get; set; }
        [Display(Name = "Student's Last Name")]
        public string LastName { get; set; }
        [Display(Name = "Student's First Name")]
        public string FirstName { get; set; }
        [Display(Name = "Student Grade Level")]
        public string GradeLevel { get; set; }
        [Display(Name = "Student School Name")]
        public string SchoolName { get; set; }
        [Display(Name = "Counselor's ID")]
        public string CounselorId { get; set; }
        [Display(Name = "Counselor's Last Name")]
        public string CounselorLastName { get; set; }
        [Display(Name = "Counselor's First Name")]
        public string CounselorFirstName { get; set; }

        public string ClientId { get; set; }
        public string ClientDB { get; set; }
        public string CacheDB { get; set; }
    }

    public class CourseListViewModels
    {
        [Display(Name = "Student Unique Identifier")]
        public int Id { get; set; }
        [Display(Name = "Class Name")]
        public string ClassName { get; set; }
        [Display(Name = "School Name")]
        public string SchoolName { get; set; }
        [Display(Name = "School Year")]
        public string Year { get; set; }
        [Display(Name = "School Semester")]
        public string Semester { get; set; }
        [Display(Name = "Class Period")]
        public string Period { get; set; }
        [Display(Name = "Course ID")]
        public string CourseId { get; set; }
        [Display(Name = "Course Name")]
        public string CourseName { get; set; }
        [Display(Name = "Grade")]
        public string Grade { get; set; }
        [Display(Name = "Subject")]
        public string Subject { get; set; }
        [Display(Name = "Teacher")]
        public string PrimaryTeacher { get; set; }
    }

    public class AttendanceViewModels
    {
        [Display(Name = "Student Unique Identifier")]
        public int Id { get; set; }
    }
}