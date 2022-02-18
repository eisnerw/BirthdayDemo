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
    public class ReadOnlyCategoryRepository : ReadOnlyGenericRepository<Category, long>, IReadOnlyCategoryRepository
    {
        public ReadOnlyCategoryRepository(IUnitOfWork context) : base(context)
        {
        }
    }
}
