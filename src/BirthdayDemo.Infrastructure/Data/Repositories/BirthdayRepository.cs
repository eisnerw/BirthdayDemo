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
    public class BirthdayRepository : GenericRepository<Birthday, long>, IBirthdayRepository
    {
        public BirthdayRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Birthday> CreateOrUpdateAsync(Birthday birthday)
        {

            await RemoveManyToManyRelationship("BirthdaysCategories", "BirthdaysId", "CategoriesId", birthday.Id, birthday.Categories.Select(x => x.Id).ToList());
            return await base.CreateOrUpdateAsync(birthday);
        }
    }
}
