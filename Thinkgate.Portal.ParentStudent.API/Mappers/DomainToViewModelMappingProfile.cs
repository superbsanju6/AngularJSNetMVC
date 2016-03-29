using AutoMapper;
using Thinkgate.Portal.ParentStudent.API.Models;
using Thinkgate.Portal.ParentStudent.Models;
using Thinkgate.Services.Contracts.ParentStudent;
using StudentList = Thinkgate.Portal.ParentStudent.Models.StudentList;

namespace Thinkgate.Portal.ParentStudent.API.Mappers
{
    public class DomainToViewModelMappingProfile : Profile
    {
        public override string ProfileName
        {
            get
            {
                return "DomainToViewModelMappingProfile";
            }
        }


        protected override void Configure()
        {
            Mapper.CreateMap<AspNetUser, LoginViewModel>();
            Mapper.CreateMap<AspNetUser, ResetPasswordViewModel>();
            Mapper.CreateMap<StudentList, StudentViewModels>();
            Mapper.CreateMap<StudentProfileModel, StudentProfileViewModels>();
            Mapper.CreateMap<StudentChecklist, ChecklistViewModel>();
        }
    }
}