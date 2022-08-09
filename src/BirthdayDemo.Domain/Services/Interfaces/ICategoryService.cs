using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using BirthdayDemo.Domain;
using BirthdayDemo.Dto;
using System.Collections.Generic;

namespace BirthdayDemo.Domain.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<Category> Save(Category category);

        Task<IPage<Category>> FindAll(IPageable pageable, string query);

        Task<Category> FindOne(long id);

        Task Delete(long id);

        Task<AnalysisResultDto> Analyze(IList<string> ids);
    }
}
