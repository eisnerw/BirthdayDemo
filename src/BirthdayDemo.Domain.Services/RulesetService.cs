using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using BirthdayDemo.Domain.Services.Interfaces;
using BirthdayDemo.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BirthdayDemo.Domain.Services
{
    public class RulesetService : IRulesetService
    {
        protected readonly IRulesetRepository _rulesetRepository;

        public RulesetService(IRulesetRepository rulesetRepository)
        {
            _rulesetRepository = rulesetRepository;
        }

        public virtual async Task<Ruleset> Save(Ruleset ruleset)
        {
            await _rulesetRepository.CreateOrUpdateAsync(ruleset);
            await _rulesetRepository.SaveChangesAsync();
            return ruleset;
        }

        public virtual async Task<IPage<Ruleset>> FindAll(IPageable pageable)
        {
            var page = await _rulesetRepository.QueryHelper()
                .GetPageAsync(pageable);
            return page;
        }

        public virtual async Task<Ruleset> FindOne(long id)
        {
            var result = await _rulesetRepository.QueryHelper()
                .GetOneAsync(ruleset => ruleset.Id == id);
            return result;
        }

        public virtual async Task Delete(long id)
        {
            await _rulesetRepository.DeleteByIdAsync(id);
            await _rulesetRepository.SaveChangesAsync();
        }
    }
}
