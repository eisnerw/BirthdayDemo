
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
    [Route("api/birthdays")]
    [ApiController]
    public class BirthdaysController : ControllerBase
    {
        private const string EntityName = "birthday";
        private readonly ILogger<BirthdaysController> _log;
        private readonly IMapper _mapper;
        private readonly IBirthdayService _birthdayService;

        public BirthdaysController(ILogger<BirthdaysController> log,
        IMapper mapper,
        IBirthdayService birthdayService)
        {
            _log = log;
            _mapper = mapper;
            _birthdayService = birthdayService;
        }

        [HttpPost]
        [ValidateModel]
        public async Task<ActionResult<BirthdayDto>> CreateBirthday([FromBody] BirthdayDto birthdayDto)
        {
            _log.LogDebug($"REST request to save Birthday : {birthdayDto}");
            if (birthdayDto.Id != 0)
                throw new BadRequestAlertException("A new birthday cannot already have an ID", EntityName, "idexists");

            Birthday birthday = _mapper.Map<Birthday>(birthdayDto);
            await _birthdayService.Save(birthday);
            return CreatedAtAction(nameof(GetBirthday), new { id = birthday.Id }, birthday)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, birthday.Id.ToString()));
        }

        [HttpPut("{id}")]
        [ValidateModel]
        public async Task<IActionResult> UpdateBirthday(long id, [FromBody] BirthdayDto birthdayDto)
        {
            _log.LogDebug($"REST request to update Birthday : {birthdayDto}");
            if (birthdayDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != birthdayDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Birthday birthday = _mapper.Map<Birthday>(birthdayDto);
            await _birthdayService.Save(birthday);
            return Ok(birthday)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, birthday.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BirthdayDto>>> GetAllBirthdays(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Birthdays");
            var result = await _birthdayService.FindAll(pageable);
            var page = new Page<BirthdayDto>(result.Content.Select(entity => _mapper.Map<BirthdayDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<BirthdayDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBirthday([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Birthday : {id}");
            var result = await _birthdayService.FindOne(id);
            BirthdayDto birthdayDto = _mapper.Map<BirthdayDto>(result);
            return ActionResultUtil.WrapOrNotFound(birthdayDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBirthday([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Birthday : {id}");
            await _birthdayService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}
