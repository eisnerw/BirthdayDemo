using System.Threading.Tasks;

namespace BirthdayDemo.Domain.Repositories.Interfaces
{
    public interface IBirthdayRepository : IGenericRepository<Birthday, long>
    {
        Task<string> GetOneTextAsync(object id);        
    }
}
