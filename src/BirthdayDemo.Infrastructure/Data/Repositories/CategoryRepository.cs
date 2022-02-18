using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using BirthdayDemo.Domain;
using BirthdayDemo.Domain.Repositories.Interfaces;
using BirthdayDemo.Infrastructure.Data.Extensions;

namespace BirthdayDemo.Infrastructure.Data.Repositories
{
    public class CategoryRepository : GenericRepository<Category, long>, ICategoryRepository
    {
        public CategoryRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Category> CreateOrUpdateAsync(Category category)
        {
            return await base.CreateOrUpdateAsync(category);
        }
    }
}
