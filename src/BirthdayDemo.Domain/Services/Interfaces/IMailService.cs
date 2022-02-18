using System.Threading.Tasks;
using BirthdayDemo.Domain;

namespace BirthdayDemo.Domain.Services.Interfaces
{
    public interface IMailService
    {
        Task SendPasswordResetMail(User user);
        Task SendActivationEmail(User user);
        Task SendCreationEmail(User user);
    }
}
