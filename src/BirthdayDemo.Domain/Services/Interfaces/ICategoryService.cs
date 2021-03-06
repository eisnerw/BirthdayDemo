using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using BirthdayDemo.Domain;

namespace BirthdayDemo.Domain.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<Category> Save(Category category);

        Task<IPage<Category>> FindAll(IPageable pageable);

        Task<Category> FindOne(long id);

        Task Delete(long id);
    }
}
