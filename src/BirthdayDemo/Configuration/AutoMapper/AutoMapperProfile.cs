
using AutoMapper;
using System.Linq;
using BirthdayDemo.Domain;
using BirthdayDemo.Dto;


namespace BirthdayDemo.Configuration.AutoMapper
{

    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(userDto => userDto.Roles, opt => opt.MapFrom(user => user.UserRoles.Select(iur => iur.Role.Name).ToHashSet()))
            .ReverseMap()
                .ForPath(user => user.UserRoles, opt => opt.MapFrom(userDto => userDto.Roles.Select(role => new UserRole { Role = new Role { Name = role }, UserId = userDto.Id }).ToHashSet()));

            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<Birthday, BirthdayDto>().ReverseMap();
            CreateMap<Ruleset, RulesetDto>().ReverseMap();
            CreateMap<Selector, SelectorDto>().ReverseMap();
        }
    }
}
