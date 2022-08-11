
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
    [Route("api/selectors")]
    [ApiController]
    public class SelectorsController : ControllerBase
    {
        private const string EntityName = "selector";
        private readonly ILogger<SelectorsController> _log;
        private readonly IMapper _mapper;
        private readonly ISelectorService _selectorService;

        public SelectorsController(ILogger<SelectorsController> log,
        IMapper mapper,
        ISelectorService selectorService)
        {
            _log = log;
            _mapper = mapper;
            _selectorService = selectorService;
        }

        [HttpPost]
        [ValidateModel]
        public async Task<ActionResult<SelectorDto>> CreateSelector([FromBody] SelectorDto selectorDto)
        {
            _log.LogDebug($"REST request to save Selector : {selectorDto}");
            if (selectorDto.Id != 0)
                throw new BadRequestAlertException("A new selector cannot already have an ID", EntityName, "idexists");

            Selector selector = _mapper.Map<Selector>(selectorDto);
            await _selectorService.Save(selector);
            return CreatedAtAction(nameof(GetSelector), new { id = selector.Id }, selector)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, selector.Id.ToString()));
        }

        [HttpPut("{id}")]
        [ValidateModel]
        public async Task<IActionResult> UpdateSelector(long id, [FromBody] SelectorDto selectorDto)
        {
            _log.LogDebug($"REST request to update Selector : {selectorDto}");
            if (selectorDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != selectorDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Selector selector = _mapper.Map<Selector>(selectorDto);
            await _selectorService.Save(selector);
            return Ok(selector)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, selector.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SelectorDto>>> GetAllSelectors(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Selectors");
            var result = await _selectorService.FindAll(pageable);
            var page = new Page<SelectorDto>(result.Content.Select(entity => _mapper.Map<SelectorDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<SelectorDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSelector([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Selector : {id}");
            var result = await _selectorService.FindOne(id);
            SelectorDto selectorDto = _mapper.Map<SelectorDto>(result);
            return ActionResultUtil.WrapOrNotFound(selectorDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSelector([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Selector : {id}");
            await _selectorService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}
