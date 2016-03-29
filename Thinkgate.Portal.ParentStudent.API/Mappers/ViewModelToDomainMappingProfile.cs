using AutoMapper;
using Thinkgate.Portal.ParentStudent.API.Models;
using Thinkgate.Portal.ParentStudent.Models;
using Thinkgate.Services.Contracts.ParentStudent;
using StudentList = Thinkgate.Portal.ParentStudent.Models.StudentList;

namespace Thinkgate.Portal.ParentStudent.API.Mappers
{
    public class ViewModelToDomainMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ViewModelToDomainMappingProfile"; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<LoginViewModel, AspNetUser>();
            Mapper.CreateMap<ResetPasswordViewModel, AspNetUser>();
            Mapper.CreateMap<StudentViewModels, StudentList>();
            Mapper.CreateMap<StudentProfileViewModels, StudentProfileModel>();
            Mapper.CreateMap<ChecklistViewModel, StudentChecklist>();
        }
    }
}