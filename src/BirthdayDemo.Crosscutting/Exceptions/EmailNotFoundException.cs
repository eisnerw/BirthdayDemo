using BirthdayDemo.Crosscutting.Constants;

namespace BirthdayDemo.Crosscutting.Exceptions
{
    public class EmailNotFoundException : BaseException
    {
        public EmailNotFoundException() : base(ErrorConstants.EmailNotFoundType, "Email address not registered")
        {
        }
    }
}
