using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Thinkgate.Portal.ParentStudent.API.Mappers;

namespace Thinkgate.Portal.ParentStudent.API
{
    public class Bootstrapper
    {
        public static void Configure()
        {
            AutoMapperConfiguration.Configure();
        }
    }
}