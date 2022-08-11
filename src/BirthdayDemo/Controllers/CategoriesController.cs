
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
using System;
using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace BirthdayDemo.Controllers
{
    [Authorize]
    [Route("api/categories")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private static readonly string APPLICATION_NAME = "birthdayDemoApp";
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
            // if (id != categoryDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Category category = _mapper.Map<Category>(categoryDto);
            await _categoryService.Save(category);
            return Ok(category)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, category.Id.ToString()));
        }

        [HttpPost("categoryQuery")]
        public async Task<ActionResult<IEnumerable<BirthdayDto>>> GetAllCategories([FromBody] Dictionary<string, object> queryDictionary)
        {
            _log.LogDebug("REST request to get a page of Categories");
            var pageable = Pageable.Of(0, 10);
            String query = "";
            if (queryDictionary.Keys.Contains("query")){
                query = (string)queryDictionary["query"];
            }
            if (query.StartsWith("{")){
                var categoryRequest = JsonConvert.DeserializeObject<Dictionary<string,object>>(query);
                string categoryQuery = (string)categoryRequest["query"];
                if (categoryQuery != ""){
                    categoryQuery = TextTemplate.Runner.Interpolate("LuceneQueryBuilder", categoryQuery);
                }
                categoryRequest["query"] = categoryQuery;
                query = JsonConvert.SerializeObject(categoryRequest);
            }
            CategoryDto categorydto = _mapper.Map<CategoryDto>(new Category());
            var result = await _categoryService.FindAll(pageable, query);
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

        [HttpPost("analyze")]
        [ValidateModel]
        public async Task<IActionResult> AnalyzeDocuments([FromBody] DocumentAnalysisDto documentAnalysisDto)
        {
            _log.LogDebug($"REST request to analyze {documentAnalysisDto.ids.Count} documents");
            AnalysisResultDto result = await _categoryService.Analyze(documentAnalysisDto.ids);
            IHeaderDictionary headers = new HeaderDictionary();
            headers.Add($"X-{APPLICATION_NAME}-alert", $"{APPLICATION_NAME}.{EntityName}.analyzed");
            headers.Add($"X-{APPLICATION_NAME}-params", result.result);
            return Ok(result).WithHeaders(headers);
        }  
    }
}
