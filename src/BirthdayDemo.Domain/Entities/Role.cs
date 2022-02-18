using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace BirthdayDemo.Domain
{
    public class Role : IdentityRole<string>
    {
        public ICollection<UserRole> UserRoles { get; set; }
    }
}
