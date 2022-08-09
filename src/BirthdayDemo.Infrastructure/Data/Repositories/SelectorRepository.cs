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
    public class SelectorRepository : GenericRepository<Selector, long>, ISelectorRepository
    {
        public SelectorRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Selector> CreateOrUpdateAsync(Selector selector)
        {
            bool exists = await Exists(x => x.Id == selector.Id);

            if (selector.Id != 0 && exists)
            {
                Update(selector);
            }
            else
            {
                _context.AddOrUpdateGraph(selector);
            }
            return selector;
        }
    }
}
