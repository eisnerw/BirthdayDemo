
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
    [Route("api/rulesets")]
    [ApiController]
    public class RulesetsController : ControllerBase
    {
        private const string EntityName = "ruleset";
        private readonly ILogger<RulesetsController> _log;
        private readonly IMapper _mapper;
        private readonly IRulesetService _rulesetService;

        public RulesetsController(ILogger<RulesetsController> log,
        IMapper mapper,
        IRulesetService rulesetService)
        {
            _log = log;
            _mapper = mapper;
            _rulesetService = rulesetService;
        }

        [HttpPost]
        [ValidateModel]
        public async Task<ActionResult<RulesetDto>> CreateRuleset([FromBody] RulesetDto rulesetDto)
        {
            _log.LogDebug($"REST request to save Ruleset : {rulesetDto}");
            if (rulesetDto.Id != 0)
                throw new BadRequestAlertException("A new ruleset cannot already have an ID", EntityName, "idexists");

            Ruleset ruleset = _mapper.Map<Ruleset>(rulesetDto);
            await _rulesetService.Save(ruleset);
            return CreatedAtAction(nameof(GetRuleset), new { id = ruleset.Id }, ruleset)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, ruleset.Id.ToString()));
        }

        [HttpPut("{id}")]
        [ValidateModel]
        public async Task<IActionResult> UpdateRuleset(long id, [FromBody] RulesetDto rulesetDto)
        {
            _log.LogDebug($"REST request to update Ruleset : {rulesetDto}");
            if (rulesetDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != rulesetDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Ruleset ruleset = _mapper.Map<Ruleset>(rulesetDto);
            await _rulesetService.Save(ruleset);
            return Ok(ruleset)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, ruleset.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RulesetDto>>> GetAllRulesets(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Rulesets");
            var result = await _rulesetService.FindAll(pageable);
            var page = new Page<RulesetDto>(result.Content.Select(entity => _mapper.Map<RulesetDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<RulesetDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRuleset([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Ruleset : {id}");
            var result = await _rulesetService.FindOne(id);
            RulesetDto rulesetDto = _mapper.Map<RulesetDto>(result);
            return ActionResultUtil.WrapOrNotFound(rulesetDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRuleset([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Ruleset : {id}");
            await _rulesetService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}
