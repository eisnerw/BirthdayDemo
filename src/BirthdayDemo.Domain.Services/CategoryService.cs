using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using BirthdayDemo.Domain.Services.Interfaces;
using BirthdayDemo.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BirthdayDemo.Domain.Services
{
    public class CategoryService : ICategoryService
    {
        protected readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public virtual async Task<Category> Save(Category category)
        {
            await _categoryRepository.CreateOrUpdateAsync(category);
            await _categoryRepository.SaveChangesAsync();
            return category;
        }

        public virtual async Task<IPage<Category>> FindAll(IPageable pageable)
        {
            var page = await _categoryRepository.QueryHelper()
                .GetPageAsync(pageable);
            return page;
        }

        public virtual async Task<Category> FindOne(long id)
        {
            var result = await _categoryRepository.QueryHelper()
                .GetOneAsync(category => category.Id == id);
            return result;
        }

        public virtual async Task Delete(long id)
        {
            await _categoryRepository.DeleteByIdAsync(id);
            await _categoryRepository.SaveChangesAsync();
        }
    }
}
