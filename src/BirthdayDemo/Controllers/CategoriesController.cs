
using System.Threading;
using System.Collections.Generic;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using BirthdayDemo.Domain;
using BirthdayDemo.Crosscutting.Exceptions;
using BirthdayDemo.Dto;
using BirthdayDemo.Web.Extensions;
using BirthdayDemo.Web.Filters;
using BirthdayDemo.Web.Rest.Utilities;
using AutoMapper;
using System.Linq;
using BirthdayDemo.Domain.Repositories.Interfaces;
using BirthdayDemo.Domain.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace BirthdayDemo.Controllers
{
    [Authorize]
    [Route("api/categories")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private const string EntityName = "category";
        private readonly ILogger<CategoriesController> _log;
        private readonly IMapper _mapper;
        private readonly ICategoryService _categoryService;

        public CategoriesController(ILogger<CategoriesController> log,
        IMapper mapper,
        ICategoryService categoryService)
        {
            _log = log;
            _mapper = mapper;
            _categoryService = categoryService;
        }

        [HttpPost]
        [ValidateModel]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryDto categoryDto)
        {
            _log.LogDebug($"REST request to save Category : {categoryDto}");
            if (categoryDto.Id != 0)
                throw new BadRequestAlertException("A new category cannot already have an ID", EntityName, "idexists");

            Category category = _mapper.Map<Category>(categoryDto);
            await _categoryService.Save(category);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, category.Id.ToString()));
        }

        [HttpPut("{id}")]
        [ValidateModel]
        public async Task<IActionResult> UpdateCategory(long id, [FromBody] CategoryDto categoryDto)
        {
            _log.LogDebug($"REST request to update Category : {categoryDto}");
            if (categoryDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != categoryDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Category category = _mapper.Map<Category>(categoryDto);
            await _categoryService.Save(category);
            return Ok(category)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, category.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAllCategories(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Categories");
            var result = await _categoryService.FindAll(pageable);
            var page = new Page<CategoryDto>(result.Content.Select(entity => _mapper.Map<CategoryDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<CategoryDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Category : {id}");
            var result = await _categoryService.FindOne(id);
            CategoryDto categoryDto = _mapper.Map<CategoryDto>(result);
            return ActionResultUtil.WrapOrNotFound(categoryDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Category : {id}");
            await _categoryService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}
