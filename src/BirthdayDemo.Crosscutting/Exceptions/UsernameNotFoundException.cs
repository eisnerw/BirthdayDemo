using System.Security.Authentication;

namespace BirthdayDemo.Crosscutting.Exceptions
{
    public class UsernameNotFoundException : AuthenticationException
    {
        public UsernameNotFoundException(string message) : base(message)
        {
        }
    }
}
