using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using BirthdayDemo.Domain;

namespace BirthdayDemo.Domain.Services.Interfaces
{
    public interface IBirthdayService
    {
        Task<Birthday> Save(Birthday birthday);

        Task<IPage<Birthday>> FindAll(IPageable pageable);

        Task<Birthday> FindOne(long id);

        Task Delete(long id);
    }
}
