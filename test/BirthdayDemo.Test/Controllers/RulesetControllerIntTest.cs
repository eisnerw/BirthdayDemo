
using AutoMapper;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using BirthdayDemo.Infrastructure.Data;
using BirthdayDemo.Domain;
using BirthdayDemo.Domain.Repositories.Interfaces;
using BirthdayDemo.Dto;
using BirthdayDemo.Configuration.AutoMapper;
using BirthdayDemo.Test.Setup;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Xunit;

namespace BirthdayDemo.Test.Controllers
{
    public class RulesetsControllerIntTest
    {
        public RulesetsControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _rulesetRepository = _factory.GetRequiredService<IRulesetRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultName = "AAAAAAAAAA";
        private const string UpdatedName = "BBBBBBBBBB";

        private const string DefaultJsonString = "AAAAAAAAAA";
        private const string UpdatedJsonString = "BBBBBBBBBB";

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly IRulesetRepository _rulesetRepository;

        private Ruleset _ruleset;

        private readonly IMapper _mapper;

        private Ruleset CreateEntity()
        {
            return new Ruleset
            {
                Name = DefaultName,
                JsonString = DefaultJsonString,
            };
        }

        private void InitTest()
        {
            _ruleset = CreateEntity();
        }

        [Fact]
        public async Task CreateRuleset()
        {
            var databaseSizeBeforeCreate = await _rulesetRepository.CountAsync();

            // Create the Ruleset
            RulesetDto _rulesetDto = _mapper.Map<RulesetDto>(_ruleset);
            var response = await _client.PostAsync("/api/rulesets", TestUtil.ToJsonContent(_rulesetDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the Ruleset in the database
            var rulesetList = await _rulesetRepository.GetAllAsync();
            rulesetList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testRuleset = rulesetList.Last();
            testRuleset.Name.Should().Be(DefaultName);
            testRuleset.JsonString.Should().Be(DefaultJsonString);
        }

        [Fact]
        public async Task CreateRulesetWithExistingId()
        {
            var databaseSizeBeforeCreate = await _rulesetRepository.CountAsync();
            // Create the Ruleset with an existing ID
            _ruleset.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            RulesetDto _rulesetDto = _mapper.Map<RulesetDto>(_ruleset);
            var response = await _client.PostAsync("/api/rulesets", TestUtil.ToJsonContent(_rulesetDto));

            // Validate the Ruleset in the database
            var rulesetList = await _rulesetRepository.GetAllAsync();
            rulesetList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllRulesets()
        {
            // Initialize the database
            await _rulesetRepository.CreateOrUpdateAsync(_ruleset);
            await _rulesetRepository.SaveChangesAsync();

            // Get all the rulesetList
            var response = await _client.GetAsync("/api/rulesets?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_ruleset.Id);
            json.SelectTokens("$.[*].name").Should().Contain(DefaultName);
            json.SelectTokens("$.[*].jsonString").Should().Contain(DefaultJsonString);
        }

        [Fact]
        public async Task GetRuleset()
        {
            // Initialize the database
            await _rulesetRepository.CreateOrUpdateAsync(_ruleset);
            await _rulesetRepository.SaveChangesAsync();

            // Get the ruleset
            var response = await _client.GetAsync($"/api/rulesets/{_ruleset.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_ruleset.Id);
            json.SelectTokens("$.name").Should().Contain(DefaultName);
            json.SelectTokens("$.jsonString").Should().Contain(DefaultJsonString);
        }

        [Fact]
        public async Task GetNonExistingRuleset()
        {
            var maxValue = long.MaxValue;
            var response = await _client.GetAsync("/api/rulesets/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateRuleset()
        {
            // Initialize the database
            await _rulesetRepository.CreateOrUpdateAsync(_ruleset);
            await _rulesetRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _rulesetRepository.CountAsync();

            // Update the ruleset
            var updatedRuleset = await _rulesetRepository.QueryHelper().GetOneAsync(it => it.Id == _ruleset.Id);
            // Disconnect from session so that the updates on updatedRuleset are not directly saved in db
            //TODO detach
            updatedRuleset.Name = UpdatedName;
            updatedRuleset.JsonString = UpdatedJsonString;

            RulesetDto updatedRulesetDto = _mapper.Map<RulesetDto>(updatedRuleset);
            var response = await _client.PutAsync($"/api/rulesets/{_ruleset.Id}", TestUtil.ToJsonContent(updatedRulesetDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the Ruleset in the database
            var rulesetList = await _rulesetRepository.GetAllAsync();
            rulesetList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testRuleset = rulesetList.Last();
            testRuleset.Name.Should().Be(UpdatedName);
            testRuleset.JsonString.Should().Be(UpdatedJsonString);
        }

        [Fact]
        public async Task UpdateNonExistingRuleset()
        {
            var databaseSizeBeforeUpdate = await _rulesetRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            RulesetDto _rulesetDto = _mapper.Map<RulesetDto>(_ruleset);
            var response = await _client.PutAsync("/api/rulesets/1", TestUtil.ToJsonContent(_rulesetDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the Ruleset in the database
            var rulesetList = await _rulesetRepository.GetAllAsync();
            rulesetList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteRuleset()
        {
            // Initialize the database
            await _rulesetRepository.CreateOrUpdateAsync(_ruleset);
            await _rulesetRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _rulesetRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/rulesets/{_ruleset.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the database is empty
            var rulesetList = await _rulesetRepository.GetAllAsync();
            rulesetList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(Ruleset));
            var ruleset1 = new Ruleset
            {
                Id = 1L
            };
            var ruleset2 = new Ruleset
            {
                Id = ruleset1.Id
            };
            ruleset1.Should().Be(ruleset2);
            ruleset2.Id = 2L;
            ruleset1.Should().NotBe(ruleset2);
            ruleset1.Id = 0;
            ruleset1.Should().NotBe(ruleset2);
        }
    }
}
