using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using BirthdayDemo.Domain.Services.Interfaces;
using BirthdayDemo.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BirthdayDemo.Domain.Services
{
    public class BirthdayService : IBirthdayService
    {
        protected readonly IBirthdayRepository _birthdayRepository;

        public BirthdayService(IBirthdayRepository birthdayRepository)
        {
            _birthdayRepository = birthdayRepository;
        }

        public virtual async Task<Birthday> Save(Birthday birthday)
        {
            await _birthdayRepository.CreateOrUpdateAsync(birthday);
            await _birthdayRepository.SaveChangesAsync();
            return birthday;
        }

        public virtual async Task<IPage<Birthday>> FindAll(IPageable pageable)
        {
            var page = await _birthdayRepository.QueryHelper()
                .Include(birthday => birthday.Categories)
                .GetPageAsync(pageable);
            return page;
        }

        public virtual async Task<Birthday> FindOne(long id)
        {
            var result = await _birthdayRepository.QueryHelper()
                .Include(birthday => birthday.Categories)
                .GetOneAsync(birthday => birthday.Id == id);
            return result;
        }

        public virtual async Task Delete(long id)
        {
            await _birthdayRepository.DeleteByIdAsync(id);
            await _birthdayRepository.SaveChangesAsync();
        }
    }
}
